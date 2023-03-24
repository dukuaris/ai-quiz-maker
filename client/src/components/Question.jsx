import { Button } from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'

import { setQuestions, addScore, resetScore } from '../features/quiz/quizSlice'
import ErrorMessage from './ErrorMessages'

const Question = ({ currQues, setCurrQues, options, correct }) => {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { questions } = useSelector((state) => state.quiz)

	const [selected, setSelected] = useState()
	const [error, setError] = useState(false)
	// useEffect(() => {
	// 	setScore(0)
	// }, [])

	const handleSelect = (i) => {
		if (selected === i && selected === correct) return 'select'
		else if (selected === i && selected !== correct) return 'wrong'
		else if (i === correct) return 'select'
	}

	const handleCheck = (i) => {
		setSelected(i)
		if (i === correct) dispatch(addScore())
		setError(false)
	}

	const handleNext = () => {
		if (currQues > questions.length - 2) {
			navigate('/result')
		} else if (selected) {
			setCurrQues(currQues + 1)
			setSelected()
		} else setError('Please select an option first')
	}

	const handleQuit = () => {
		setCurrQues(0)
		dispatch(resetScore())
		dispatch(setQuestions([]))
		navigate('/')
	}

	return (
		<div className="question">
			<h1>Question {currQues + 1} :</h1>

			<div className="singleQuestion">
				<h2>{questions[currQues].question}</h2>
				<div className="options">
					{error && <ErrorMessage>{error}</ErrorMessage>}
					{options &&
						options.map((i) => (
							<button
								className={`singleOption  ${selected && handleSelect(i)}`}
								key={i}
								onClick={() => handleCheck(i)}
								disabled={selected}
							>
								{i}
							</button>
						))}
				</div>
				<div className="controls">
					<Button
						variant="contained"
						color="secondary"
						size="large"
						style={{ width: 185 }}
						href="/"
						onClick={() => handleQuit()}
					>
						Quit
					</Button>
					<Button
						variant="contained"
						color="primary"
						size="large"
						style={{ width: 185 }}
						onClick={handleNext}
					>
						{currQues > questions.length - 2 ? 'Submit' : 'Next Question'}
					</Button>
				</div>
			</div>
		</div>
	)
}

export default Question
