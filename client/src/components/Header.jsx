import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
	Avatar,
	Button,
	ClickAwayListener,
	Grow,
	Popper,
	Paper,
	MenuItem,
	MenuList,
} from '@mui/material'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { signOut } from 'firebase/auth'
import { auth } from '../utils/firebaseConfig'
import { useDispatch } from 'react-redux'
import {
	setQuestions,
	setSubject,
	setSource,
	setUnit,
	setUserId,
	resetScore,
} from '../features/quiz/quizSlice'

const Header = () => {
	const [open, setOpen] = useState(false)
	const { userId, image } = useSelector((state) => state.user)
	const anchorRef = useRef(null)
	const navigate = useNavigate()
	const dispatch = useDispatch()

	const logout = async () => {
		await signOut(auth)
		dispatch(resetScore(0))
		dispatch(setUnit(0))
		dispatch(setQuestions([]))
		dispatch(setSubject(''))
		dispatch(setSource(''))
		dispatch(setUserId(null))
		window.localStorage.setItem('QUESTABLE_QUIZ', JSON.stringify([]))
	}

	const handleToggle = () => {
		setOpen((prevOpen) => !prevOpen)
	}

	const handleClose = (event) => {
		if (anchorRef.current && anchorRef.current.contains(event.target)) {
			return
		}

		setOpen(false)
	}

	function handleListKeyDown(event) {
		if (event.key === 'Tab') {
			event.preventDefault()
			setOpen(false)
		} else if (event.key === 'Escape') {
			setOpen(false)
		}
	}

	// return focus to the button when we transitioned from !open -> open
	const prevOpen = useRef(open)
	useEffect(() => {
		if (prevOpen.current === true && open === false) {
			anchorRef.current?.focus()
		}

		prevOpen.current = open
	}, [open])

	return (
		<>
			<div className="header-buffer"></div>
			<div className="header">
				<div className="logo-box">
					<Link to="/" className="title">
						<img className="logo" src="questable_logo.png" alt="logo" />

						{/* <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Quiz Generator</span> */}
					</Link>
					<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
					{/* <img className="beta" src="beta3.png" alt="beta-logo" /> */}
				</div>
				{userId ? (
					<div className="user-box">
						<Button
							id="composition-button"
							aria-controls={open ? 'composition-menu' : undefined}
							aria-expanded={open ? 'true' : undefined}
							aria-haspopup="true"
							onClick={handleToggle}
						>
							<Avatar
								ref={anchorRef}
								className="avatar"
								alt="Remy Sharp"
								src={image}
							/>
						</Button>
						<Popper
							open={open}
							anchorEl={anchorRef.current || null}
							role={undefined}
							placement="bottom-start"
							transition
							sx={{ zIndex: 11 }}
						>
							{({ TransitionProps, placement }) => (
								<Grow
									{...TransitionProps}
									style={{
										transformOrigin:
											placement === 'bottom-start' ? 'left top' : 'left bottom',
									}}
								>
									<Paper>
										<ClickAwayListener onClickAway={handleClose}>
											<MenuList
												autoFocusItem={open}
												id="composition-menu"
												aria-labelledby="composition-button"
												onKeyDown={handleListKeyDown}
											>
												{/* <MenuItem onClick={handleClose}>Profile</MenuItem> */}
												<MenuItem onClick={() => navigate('/')}>
													Create Quiz
												</MenuItem>
												<MenuItem onClick={() => navigate('/currentquiz')}>
													Current Quiz
												</MenuItem>
												<MenuItem onClick={() => navigate('/quizstore')}>
													Quiz Store
												</MenuItem>
												<MenuItem
													onClick={() => {
														logout()
														navigate('/')
													}}
												>
													Logout
												</MenuItem>
											</MenuList>
										</ClickAwayListener>
									</Paper>
								</Grow>
							)}
						</Popper>
					</div>
				) : (
					<div className="user-box">
						<Button
							className="control-button"
							variant="contained"
							color="grey"
							onClick={() => navigate('/signin')}
							sx={{
								color: 'black',
								border: 'none',
								background: 'none',
							}}
							size="small"
						>
							Sign In
						</Button>
					</div>
				)}
			</div>
		</>
	)
}

export default Header
