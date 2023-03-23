import { Routes, Route } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'
import Trivia from './pages/Trivia'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Result from './pages/Result'

function App() {
	return (
		<div className="App">
			<Header />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/trivia" element={<Trivia />} />
				<Route path="/quiz" element={<Quiz />} />
				<Route path="/result" element={<Result />} />
			</Routes>
			<br />
			<Footer />
		</div>
	)
}

export default App
