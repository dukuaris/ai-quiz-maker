import { CircularProgress } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { resetScore } from '../features/quiz/quizSlice'

import Question from '../components/Question'
import '../styles/Quiz.css'

const Quiz = () => {
	const { questions, name, score } = useSelector((state) => state.quiz)
	const [options, setOptions] = useState()
	const [currQues, setCurrQues] = useState(0)
	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(resetScore())
	}, [])

	useEffect(() => {
		setOptions(
			questions &&
				handleShuffle([
					questions[currQues]?.correct_answer,
					...questions[currQues]?.incorrect_answers,
				])
		)
	}, [currQues, questions])

	const handleShuffle = (options) => {
		return options.sort(() => Math.random() - 0.5)
	}

	return (
		<div className="quiz">
			<br />
			<span className="subtitle">Welcome, {name}</span>
			{questions ? (
				<>
					<div className="quizInfo">
						<span>{questions[currQues].category}</span>
						<span>
							{/* {questions[currQues].difficulty} */}
							Score : {score}/{questions.length}
						</span>
					</div>
					<Question
						currQues={currQues}
						setCurrQues={setCurrQues}
						options={options}
						correct={questions[currQues]?.correct_answer}
					/>
				</>
			) : (
				<CircularProgress
					style={{ margin: 100 }}
					color="inherit"
					size={150}
					thickness={1}
				/>
			)}
		</div>
	)
}

export default Quiz
