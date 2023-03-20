import { useState } from 'react'
import { useNavigate } from 'react-router'
import { TextField } from '@mui/material'
import { LoadingButton } from '@mui/lab'

import '../styles/Home.css'

const Request = ({ name, setName, fetchQuestions }) => {
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
				const response = await fetch('https://quiz-maker.onrender.com', {
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
				fetchQuestions('science', 'medium', 'chatGPT', data)
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
				<span style={{ fontSize: 30 }}>Generate Quiz</span>
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
						Generate Quiz
					</LoadingButton>
				</div>
			</div>
		</div>
	)
}

export default Request
