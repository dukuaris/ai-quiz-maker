import { Button } from '@mui/material'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import {
	setQuestions,
	setName,
	setUnit,
	resetScore,
} from '../features/quiz/quizSlice'

import '../styles/Result.css'

const Result = () => {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { questions, name, score } = useSelector((state) => state.quiz)

	const handleSubmit = (e) => {
		e.preventDefault()
		const button_name = e.target.name
		if (button_name == 'retry') {
			dispatch(resetScore())
			navigate('/quiz')
		} else {
			dispatch(resetScore())
			dispatch(setName(''))
			dispatch(setUnit(0))
			dispatch(setQuestions([]))
			if (questions.source == 'trivia') {
				navigate('/trivia')
			} else {
				navigate('/')
			}
		}
	}

	return (
		<div className="result">
			<span className="title">
				{name}'s Score: {score}
			</span>
			<br />
			<br />
			<br />
			<br />
			<div className="controls">
				<Button
					name="retry"
					variant="contained"
					color="primary"
					size="large"
					style={{ width: 250 }}
					onClick={handleSubmit}
				>
					Try Again
				</Button>
				<Button
					name="home"
					variant="contained"
					color="secondary"
					size="large"
					style={{ width: 250 }}
					onClick={handleSubmit}
				>
					Come Back Home
				</Button>
			</div>
		</div>
	)
}

export default Result
