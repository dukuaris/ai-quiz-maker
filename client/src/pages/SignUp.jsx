import { useNavigate } from 'react-router'
import {
	Avatar,
	Button,
	CssBaseline,
	TextField,
	Link,
	Grid,
	Box,
	Typography,
	Container,
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, facebookProvider } from '../utils/firebaseConfig'

const theme = createTheme()

export default function SignUp() {
	const navigate = useNavigate()

	const handleSubmit = async (event) => {
		event.preventDefault()
		const data = new FormData(event.currentTarget)
		const registerEmail = data.get('email')
		const registerPassword = data.get('password')
		try {
			await createUserWithEmailAndPassword(
				auth,
				registerEmail,
				registerPassword
			)
			navigate('/myquiz')
		} catch (error) {
			console.log(error.message)
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
			await signInWithPopup(auth, facebookProvider)
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
						Sign up
					</Typography>
					<Box
						component="form"
						noValidate
						onSubmit={handleSubmit}
						sx={{ mt: 3 }}
					>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<TextField
									required
									fullWidth
									id="email"
									label="Email Address"
									name="email"
									autoComplete="email"
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									required
									fullWidth
									name="password"
									label="Password"
									type="password"
									id="password"
									autoComplete="new-password"
								/>
							</Grid>
						</Grid>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 1, mb: 2 }}
						>
							Sign Up
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
					<Grid container justifyContent="flex-end">
						<Grid item>
							<Link href="/signin" variant="body2">
								Already have an account? Sign in
							</Link>
						</Grid>
					</Grid>
				</Box>
				<Copyright sx={{ mt: 5 }} />
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
