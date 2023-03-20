import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, TextField } from '@mui/material'
import { LoadingButton } from '@mui/lab'

import '../styles/Home.css'

const Home = ({ name, setName, fetchQuestions }) => {
	const navigate = useNavigate()
	const [quizData, setQuizData] = useState({})

	const [form, setForm] = useState({
		content: '',
	})

	const [generatingQuiz, setGeneratingQuiz] = useState(false)
	const [loading, setLoading] = useState(false)

	const handleSubmit = async () => {
		if (form.content) {
			setLoading(true)
			try {
				setGeneratingQuiz(true)
				// https://quiz-maker.onrender.com
				const response = await fetch('http://localhost:5001', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						content: form.content,
					}),
				})

				const data = await response.json()
				console.log(data.results)
				setQuizData(data.results)
				fetchQuestions('general', 'medium', 'chatGPT', data)
			} catch (err) {
				alert(err)
			} finally {
				setGeneratingQuiz(false)
				setLoading(false)
				navigate('/quiz')
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
					<TextField
						style={{ marginBottom: 25 }}
						name="name"
						label="Enter Your Name"
						variant="outlined"
						onChange={(e) => setName(e.target.value)}
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
