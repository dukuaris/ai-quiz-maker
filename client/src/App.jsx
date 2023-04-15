import { Routes, Route } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './utils/firebaseConfig'
import { setUserId, setEmail, setImage } from './features/user/userSlice'
import { useDispatch } from 'react-redux'

import Header from './components/Header'
import Footer from './components/Footer'
import Trivia from './pages/Trivia'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Result from './pages/Result'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import MyQuiz from './pages/MyQuiz'

function App() {
	const dispatch = useDispatch()

	onAuthStateChanged(auth, (currentUser) => {
		if (currentUser !== null) {
			const userInfo = currentUser.reloadUserInfo

			dispatch(setUserId(userInfo.localId))
			dispatch(setEmail(userInfo.email))
			dispatch(setImage(userInfo.photoUrl))
		} else {
			dispatch(setUserId(null))
			dispatch(setEmail(''))
		}
	})

	return (
		<div className="App">
			<Header />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/trivia" element={<Trivia />} />
				<Route path="/quiz" element={<Quiz />} />
				<Route path="/result" element={<Result />} />
				<Route path="/signin" element={<SignIn />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/myquiz" element={<MyQuiz />} />
			</Routes>
			{/* <br />
			<Footer /> */}
		</div>
	)
}

export default App
