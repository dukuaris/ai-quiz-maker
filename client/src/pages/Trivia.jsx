import axios from 'axios'
import { Button, MenuItem, TextField } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { setQuestions, setSubject, setUnit } from '../features/quiz/quizSlice'
import { useDispatch, useSelector } from 'react-redux'

import ErrorMessages from '../components/ErrorMessages'
import categories from '../data/categories.js'

import '../styles/Home.css'

const Trivia = () => {
	const { subject, unit } = useSelector((state) => state.quiz)
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [category, setCategory] = useState('')
	const [difficulty, setDifficulty] = useState('')
	const [error, setError] = useState(false)

	const fetchQuestions = async (category = '', difficulty = '') => {
		let problems = {}
		const { data } = await axios.get(
			`https://opentdb.com/api.php?amount=${unit}${
				category && `&category=${category}`
			}${difficulty && `&difficulty=${difficulty}`}&type=multiple`
		)
		problems = data.results
		problems.source = 'trivia'

		dispatch(setQuestions(problems))
	}

	const handleSubmit = async () => {
		if (!category || !difficulty || !subject || !unit) {
			setError(true)
			return
		} else {
			setError(false)
			await fetchQuestions(category, difficulty)
			navigate('/quiz')
		}
	}

	return (
		<div className="content">
			<div className="settings">
				<span style={{ fontSize: 30 }}>Trivia Quiz</span>
				<div className="settings__select">
					{error && <ErrorMessages>Please Fill all the fields</ErrorMessages>}
					<TextField
						style={{ marginBottom: 25 }}
						label="Enter Your Name"
						variant="outlined"
						onChange={(e) => dispatch(setSubject(e.target.value))}
					/>
					<TextField
						select
						label="Select Category"
						value={category}
						onChange={(e) => setCategory(e.target.value)}
						variant="outlined"
						style={{ marginBottom: 30 }}
					>
						{categories.map((cat) => (
							<MenuItem key={cat.category} value={cat.value}>
								{cat.category}
							</MenuItem>
						))}
					</TextField>
					<TextField
						style={{ marginBottom: 25 }}
						name="unit"
						label="Enter Number of Questions (1-20)"
						variant="outlined"
						onChange={(e) => dispatch(setUnit(Number(e.target.value)))}
					/>
					<TextField
						select
						label="Select Difficulty"
						value={difficulty}
						onChange={(e) => setDifficulty(e.target.value)}
						variant="outlined"
						style={{ marginBottom: 30 }}
					>
						<MenuItem key="Easy" value="easy">
							Easy
						</MenuItem>
						<MenuItem key="Medium" value="medium">
							Medium
						</MenuItem>
						<MenuItem key="Hard" value="hard">
							Hard
						</MenuItem>
					</TextField>
					<Button
						variant="contained"
						color="primary"
						size="large"
						onClick={handleSubmit}
					>
						Start Quiz
					</Button>
					<Button
						color="secondary"
						onClick={() => {
							navigate('/')
						}}
					>
						<br /> Go to Custom Quiz
					</Button>
				</div>
			</div>
			{/* <img src="/quiz.svg" className="banner" alt="quiz app" /> */}
		</div>
	)
}

export default Trivia
