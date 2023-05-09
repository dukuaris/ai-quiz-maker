import { Routes, Route } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './utils/firebaseConfig'
import { setUserId, setEmail, setImage } from './features/user/userSlice'
import { useDispatch } from 'react-redux'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import Header from './components/Header'
import Footer from './components/Footer'
import Introduction from './pages/Introduction'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Result from './pages/Result'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import CurrentQuiz from './pages/CurrentQuiz'
import QuizStore from './pages/QuizStore'
import translations from './utils/translations'

i18n
	.use(LanguageDetector)
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		resources: translations,

		///////////////////////////
		// Only for English
		// lng: 'en',
		// fallbackLng: 'en',

		// for Korean
		fallbackLng: 'kr',

		///////////////////////////
		debug: true,

		interpolation: {
			escapeValue: false,
		},
	})

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
				<Route path="/intro" element={<Introduction />} />
				<Route path="/" element={<Home />} />
				<Route path="/quiz" element={<Quiz />} />
				<Route path="/result" element={<Result />} />
				<Route path="/signin" element={<SignIn />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/currentquiz" element={<CurrentQuiz />} />
				<Route path="/quizstore" element={<QuizStore />} />
			</Routes>
			{/* <br />
			<Footer /> */}
		</div>
	)
}

export default App
