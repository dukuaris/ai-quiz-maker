// import axios from 'axios'
import { Routes, Route } from 'react-router-dom'
// import { useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'

import Header from './components/Header'
import Footer from './components/Footer'
import Trivia from './pages/Trivia'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Result from './pages/Result'

function App() {
	// const { questions, name, unit, score } = useSelector()
	// const dispatch = useDispatch((store) => store.quiz)
	// const [name, setName] = useState()
	// const [unit, setUnit] = useState(0)
	// const [score, setScore] = useState(0)

	// const fetchQuestions = async (
	// 	category = '',
	// 	difficulty = '',
	// 	source = '',
	// 	questions = {}
	// ) => {
	// 	let problems = {}
	// 	if (source == 'trivia') {
	// 		const { data } = await axios.get(
	// 			`https://opentdb.com/api.php?amount=${unit}${
	// 				category && `&category=${category}`
	// 			}${difficulty && `&difficulty=${difficulty}`}&type=multiple`
	// 		)
	// 		problems = data
	// 	} else {
	// 		problems = questions
	// 	}

	// 	setQuestions(problems.results)
	// }

	return (
		<div className="App">
			<Header />
			<Routes>
				<Route path="/" element={<Home />} />
				{/* <Route
					path="/trivia"
					element={
						<Trivia
							name={name}
							setName={setName}
							unit={unit}
							setUnit={setUnit}
							fetchQuestions={fetchQuestions}
						/>
					}
				/> */}
				<Route path="/quiz" element={<Quiz />} />
				<Route path="/result" element={<Result />} />
			</Routes>
			<Footer />
		</div>
	)
}

export default App
