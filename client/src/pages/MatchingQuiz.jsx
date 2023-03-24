import React, { useState } from 'react'

const MatchingQuiz = () => {
	const [answers, setAnswers] = useState({})
	const questions = [
		{
			id: 1,
			question: 'Match the country with its capital city:',
			options: [
				{ id: 1, text: 'United States', value: 'Washington, D.C.' },
				{ id: 2, text: 'France', value: 'Paris' },
				{ id: 3, text: 'Italy', value: 'Rome' },
				{ id: 4, text: 'Japan', value: 'Tokyo' },
			],
		},
	]

	const handleAnswerChange = (optionId, questionId) => {
		setAnswers({
			...answers,
			[questionId]: optionId,
		})
	}

	const renderQuestion = (question) => {
		return (
			<div key={question.id}>
				<h3>{question.question}</h3>
				<ul>
					{question.options.map((option) => (
						<li key={option.id}>
							<input
								type="radio"
								name={`question-${question.id}`}
								id={`question-${question.id}-option-${option.id}`}
								value={option.id}
								onChange={() => handleAnswerChange(option.id, question.id)}
							/>
							<label htmlFor={`question-${question.id}-option-${option.id}`}>
								{option.text}
							</label>
						</li>
					))}
				</ul>
			</div>
		)
	}

	const renderResults = () => {
		return (
			<div>
				<h3>Results:</h3>
				<ul>
					{questions.map((question) => (
						<li key={question.id}>
							<strong>{question.question}</strong>
							<p>
								Your answer:{' '}
								{answers[question.id] &&
									question.options.find(
										(option) => option.id === answers[question.id]
									).value}
							</p>
						</li>
					))}
				</ul>
			</div>
		)
	}

	return (
		<div>
			<h2>Matching Quiz</h2>
			{questions.map((question) => renderQuestion(question))}
			<button onClick={renderResults}>Submit</button>
			{Object.keys(answers).length === questions.length && renderResults()}
		</div>
	)
}

export default MatchingQuiz
