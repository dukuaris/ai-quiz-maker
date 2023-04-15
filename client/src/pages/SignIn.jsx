import {
	Avatar,
	Button,
	CssBaseline,
	TextField,
	FormControlLabel,
	Checkbox,
	Link,
	Grid,
	Box,
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { useNavigate } from 'react-router'
import { auth, googleProvider, facebookProvider } from '../utils/firebaseConfig'
import { FacebookAuthProvider } from 'firebase/auth'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { setImage } from '../features/user/userSlice'
import { useDispatch } from 'react-redux'

const theme = createTheme()

export default function SignIn() {
	const navigate = useNavigate()
	const dispatch = useDispatch()

	const signInWithEmail = async (event) => {
		event.preventDefault()
		const data = new FormData(event.currentTarget)
		const loginEmail = data.get('email')
		const loginPassword = data.get('password')
		try {
			await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
			navigate('/myquiz')
		} catch (error) {
			alert(error.message)
		}
	}

	const signInWithGoogle = async () => {
		try {
			await signInWithPopup(auth, googleProvider)
			navigate('/myquiz')
		} catch (error) {
			alert(error.message)
		}
	}

	const signInWithFacebook = async () => {
		try {
			// await signInWithPopup(auth, facebookProvider)
			const result = await signInWithPopup(auth, facebookProvider)

			const credential = FacebookAuthProvider.credentialFromResult(result)
			const accessToken = credential.accessToken
			fetch(
				`https://graph.facebook.com/${result.user.providerData[0].uid}/picture?type=large&access_token=${accessToken}`
			)
				.then((response) => response.blob())
				.then((blob) => {
					dispatch(setImage(URL.createObjectURL(blob)))
				})
			navigate('/myquiz')
		} catch (error) {
			alert(error.message)
		}
	}

	return (
		<ThemeProvider theme={theme}>
			<Container component="main" maxWidth="xs">
				<CssBaseline />
				<Box
					sx={{
						marginTop: 8,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
					}}
				>
					<Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
						<LockOutlinedIcon />
					</Avatar>
					<Typography component="h1" variant="h5">
						Sign in
					</Typography>
					<Box
						component="form"
						onSubmit={signInWithEmail}
						noValidate
						sx={{ mt: 1 }}
					>
						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email Address"
							name="email"
							autoComplete="email"
							autoFocus
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type="password"
							id="password"
							autoComplete="current-password"
						/>
						<FormControlLabel
							control={<Checkbox value="remember" color="primary" />}
							label="Remember me"
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 1, mb: 2 }}
						>
							Sign In
						</Button>
					</Box>
					<Button
						type="submit"
						fullWidth
						variant="outlined"
						sx={{ color: 'black', mt: 3, mb: 2 }}
						onClick={signInWithGoogle}
					>
						<img src="Google__G__Logo.svg" width={'20px'} />
						&nbsp;&nbsp;&nbsp;&nbsp; Sign In With Google
					</Button>
					<Button
						type="submit"
						fullWidth
						variant="outlined"
						sx={{ color: 'black', mb: 2 }}
						onClick={signInWithFacebook}
					>
						<img src="Facebook_f_logo.svg" width={'20px'} />
						&nbsp;&nbsp;&nbsp;&nbsp; Sign In With Facebook
					</Button>
					<Grid container>
						<Grid item xs>
							<Link href="#" variant="body2">
								Forgot password?
							</Link>
						</Grid>
						<Grid item>
							<Link href="/signup" variant="body2">
								{"Don't have an account? Sign Up"}
							</Link>
						</Grid>
					</Grid>
				</Box>
				<Copyright sx={{ mt: 8, mb: 4 }} />
			</Container>
		</ThemeProvider>
	)
}

function Copyright(props) {
	return (
		<Typography
			variant="body2"
			color="text.secondary"
			align="center"
			{...props}
		>
			{'Copyright © '}
			<Link color="inherit" href="https://www.questable.ai">
				Questable
			</Link>{' '}
			{new Date().getFullYear()}
			{'.'}
		</Typography>
	)
}
