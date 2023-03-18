import axios from 'axios'
import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'

import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Result from './pages/Result'

function App() {
	const [questions, setQuestions] = useState()
	const [name, setName] = useState()
	const [score, setScore] = useState(0)

	const fetchQuestions = async (category = '', difficulty = '') => {
		const { data } = await axios.get(
			`https://opentdb.com/api.php?amount=10${
				category && `&category=${category}`
			}${difficulty && `&difficulty=${difficulty}`}&type=multiple`
		)

		setQuestions(data.results)
	}

	return (
		<div className="App">
			<Header />
			<Routes>
				<Route
					path="/"
					element={
						<Home
							name={name}
							setName={setName}
							fetchQuestions={fetchQuestions}
						/>
					}
				/>
				<Route
					path="/quiz"
					element={
						<Quiz
							name={name}
							questions={questions}
							score={score}
							setScore={setScore}
							setQuestions={setQuestions}
						/>
					}
				/>
				<Route path="/result" element={<Result />} />
			</Routes>
			<Footer />
		</div>
	)
}

export default App
