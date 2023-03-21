import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, TextField, MenuItem } from '@mui/material'
import { LoadingButton } from '@mui/lab'

import ErrorMessages from '../components/ErrorMessages'
import types from '../data/types.js'
import '../styles/Home.css'

const Home = ({ name, setName, unit, setUnit, fetchQuestions }) => {
	const navigate = useNavigate()
	const [type, setType] = useState('')
	const [quizData, setQuizData] = useState({})
	const [form, setForm] = useState({
		content: '',
	})
	const [error, setError] = useState(false)

	const [generatingQuiz, setGeneratingQuiz] = useState(false)
	const [loading, setLoading] = useState(false)

	const handleSubmit = async () => {
		if (!name || unit < 1) {
			setError(true)
			return
		}
		if (form.content) {
			setLoading(true)
			try {
				setGeneratingQuiz(true)
				// https://quiz-maker.onrender.com
				// http://localhost:5001
				const response = await fetch('https://quiz-maker.onrender.com', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						content: form.content,
						unit: unit,
						type: type,
					}),
				})

				const data = await response.json()
				if (data.results != undefined) {
					setQuizData(data.results)
					fetchQuestions('custom', 'medium', 'chatGPT', data)
					navigate('/quiz')
				} else {
					throw new Error()
				}
			} catch (err) {
				alert(
					'Failed to generate questions. You may reduce the amount of input or revise your content. Try again.'
				)
			} finally {
				setGeneratingQuiz(false)
				setLoading(false)
			}
		} else {
			alert('Please provide proper content')
		}
	}

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	return (
		<div className="content">
			<div className="settings">
				<p style={{ fontSize: 30 }}>Custom Quiz</p>
				<div className="settings__select">
					{error && <ErrorMessages>Please Fill all the fields</ErrorMessages>}
					<TextField
						style={{ marginBottom: 25 }}
						name="name"
						label="Enter Your Name"
						variant="outlined"
						onChange={(e) => setName(e.target.value)}
					/>
					<TextField
						select
						label="Select Quiz Type"
						value={type}
						onChange={(e) => setType(e.target.value)}
						variant="outlined"
						style={{ marginBottom: 30 }}
					>
						{types.map((t) => (
							<MenuItem key={t.type} value={t.value}>
								{t.type}
							</MenuItem>
						))}
					</TextField>
					<TextField
						style={{ marginBottom: 25 }}
						name="unit"
						label="Enter Number of Questions (1-20)"
						variant="outlined"
						onChange={(e) => setUnit(Number(e.target.value))}
					/>
					<TextField
						style={{ marginBottom: 25 }}
						name="content"
						label="Enter Your Content"
						multiline
						rows={10}
						variant="outlined"
						onChange={handleChange}
					/>
					<LoadingButton
						variant="contained"
						color="primary"
						size="large"
						loading={loading}
						onClick={handleSubmit}
					>
						Generate Quiz & Start
					</LoadingButton>
					<Button
						color="secondary"
						onClick={() => {
							navigate('/trivia')
						}}
					>
						Go to Trivia Quiz
					</Button>
				</div>
			</div>
		</div>
	)
}

export default Home
