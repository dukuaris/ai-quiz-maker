import { CircularProgress } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	setQuestions,
	setSubject,
	setSource,
	resetScore,
} from '../features/quiz/quizSlice'
import { useTranslation } from 'react-i18next'

import Question from '../components/Question'
import '../styles/Quiz.css'

const Quiz = () => {
	const { t } = useTranslation()
	const { questions, subject, score } = useSelector((state) => state.quiz)
	const [options, setOptions] = useState()
	const [currQues, setCurrQues] = useState(0)
	const dispatch = useDispatch()

	useEffect(() => {
		const data = JSON.parse(window.localStorage.getItem('QUESTABLE_QUIZ'))
		dispatch(setSubject(data.subject))
		dispatch(setSource(data.source))
		dispatch(setQuestions(data.questions))
		dispatch(resetScore())
	}, [])

	useEffect(() => {
		let incorrect_answers = []
		if (questions[currQues].type === 'matching') {
			questions.map((question, i) => {
				if (currQues !== i) {
					incorrect_answers.push(question.correct_answer)
				}
			})
		} else {
			incorrect_answers = [...questions[currQues]?.incorrect_answers]
		}
		setOptions(
			questions &&
				handleShuffle([
					questions[currQues]?.correct_answer,
					...incorrect_answers,
				])
		)
	}, [currQues, questions])

	const handleShuffle = (options) => {
		return options.sort(() => Math.random() - 0.5)
	}

	return (
		<div className="quiz">
			<br />
			<span className="subtitle">{subject}</span>
			{questions ? (
				<>
					<div className="quizInfo">
						<span>{t(questions[currQues].type)}</span>
						<span>
							{/* {questions[currQues].difficulty} */}
							{t('Score')} : {score}/{questions.length}
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
