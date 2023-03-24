import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, TextField, MenuItem } from '@mui/material'
import { LoadingButton } from '@mui/lab'

import {
	setQuestions,
	setName,
	setUnit,
	resetScore,
} from '../features/quiz/quizSlice'
import { useDispatch, useSelector } from 'react-redux'

import ErrorMessages from '../components/ErrorMessages'
import types from '../data/types.js'
import '../styles/Home.css'
import createSheet from '../utils/createSheet.js'

const Home = () => {
	const { questions, name, unit } = useSelector((state) => state.quiz)
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [type, setType] = useState('')
	const [form, setForm] = useState({
		content: '',
	})
	const [error, setError] = useState(false)

	const [loading, setLoading] = useState(false)

	const handleSubmit = async () => {
		if (questions.length > 0) {
			dispatch(resetScore())
			dispatch(setUnit(0))
			dispatch(setQuestions([]))
			window.location.reload(false)
		} else {
			if (!name || unit < 1) {
				setError(true)
				return
			}
			if (form.content) {
				setLoading(true)
				try {
					// https://quiz-maker.onrender.com
					// http://localhost:5001
					const response = await fetch('http://localhost:5001', {
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
						dispatch(setQuestions(data.results))
					} else {
						throw new Error()
					}
				} catch (err) {
					alert(
						'Failed to generate questions. You may reduce the amount of input or revise your content. Try again.'
					)
				} finally {
					setLoading(false)
				}
			} else {
				alert('Please provide proper content')
			}
		}
	}

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	return (
		<div className="content">
			<div className="settings">
				<p style={{ fontSize: 30 }}>Create Your Quiz</p>
				<div className="settings__select">
					{error && <ErrorMessages>Please Fill all the fields</ErrorMessages>}
					<TextField
						style={{ marginBottom: 25 }}
						name="name"
						label="Enter Your Name"
						variant="outlined"
						onChange={(e) => dispatch(setName(e.target.value))}
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
						onChange={(e) => dispatch(setUnit(Number(e.target.value)))}
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
					<div className="controls">
						<LoadingButton
							variant="contained"
							color={`${questions.length > 0 ? 'error' : 'primary'}`}
							size="medium"
							style={{ width: 120 }}
							loading={loading}
							onClick={handleSubmit}
						>
							{questions.length > 0 ? 'Clear' : 'Submit'}
						</LoadingButton>
						<Button
							variant={`${questions.length > 0 ? 'contained' : 'outlined'}`}
							color="secondary"
							size="medium"
							style={{ width: 120 }}
							onClick={
								questions.length > 0 ? () => navigate('/quiz') : () => {}
							}
						>
							Practice
						</Button>
						<Button
							variant={`${questions.length > 0 ? 'contained' : 'outlined'}`}
							color="success"
							size="medium"
							style={{ width: 120 }}
							onClick={
								questions.length > 0
									? () => createSheet(questions, name)
									: () => {}
							}
						>
							Download
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Home
