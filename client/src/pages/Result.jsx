import { Button } from '@mui/material'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import {
	setQuestions,
	setSubject,
	setUnit,
	resetScore,
} from '../features/quiz/quizSlice'
import createSheet from '../utils/createSheet.js'
import '../styles/Result.css'

const Result = () => {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { questions, subject, score } = useSelector((state) => state.quiz)

	const handleSubmit = (e) => {
		e.preventDefault()
		const button_name = e.target.name
		if (button_name == 'retry') {
			dispatch(resetScore())
			navigate('/quiz')
		} else {
			dispatch(resetScore())
			dispatch(setSubject(''))
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
			<p className="title">
				{subject}: Score
				<br />
				{score} / {questions.length}
			</p>
			<br />
			<br />
			<br />
			<br />
			<div className="controlsVertical">
				<Button
					name="retry"
					variant="contained"
					color="primary"
					size="large"
					style={{ width: 185 }}
					onClick={handleSubmit}
				>
					Try Again
				</Button>
				<br />
				<Button
					name="download"
					variant="contained"
					color="secondary"
					size="large"
					style={{ width: 185 }}
					onClick={() => createSheet(questions, subject)}
				>
					Download
				</Button>
				<br />
				<Button
					name="home"
					variant="contained"
					color="success"
					size="large"
					style={{ width: 185 }}
					onClick={handleSubmit}
				>
					Go Home
				</Button>
			</div>
		</div>
	)
}

export default Result
