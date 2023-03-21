const express = require('express')
require('dotenv').config()
const cors = require('cors')
const { Configuration, OpenAIApi } = require('openai')

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)
const url = 'https://api.openai.com/v1/chat/completions'

const app = express()
app.use(cors())
app.use(express.json())

let quizType //type of quiz
const typeList = ['multiple', 'true-false', 'fill-in-the-blank', 'short-answer']
const requestList = [
	`multiple-choice questions with following text, and provide the questions, the 4 choices, and the correct answer in JSON format:`,
	`true/false questions with following text, and provide the questions and the answers in JSON format:`,
	`multiple-choice questions with following text, and provide the questions, the 4 choices, and the correct answer in JSON format:`,
	`multiple-choice questions with following text, and provide the questions, the 4 choices, and the correct answer in JSON format:`,
]

class QuizQuestion {
	constructor(
		category,
		correct_answer,
		difficulty,
		incorrect_answers = [],
		question,
		type
	) {
		this.category = category
		this.correct_answer = correct_answer
		this.difficulty = difficulty
		this.incorrect_answers = incorrect_answers
		this.question = question
		this.type = type
	}
}

function jsonToObject(jsonData) {
	const results = JSON.parse(jsonData).questions
	const incorrect_list = results.map((result) => {
		const incorrect_answers = []
		result.choices.map((choice) => {
			if (!choice.includes(result.answer)) {
				incorrect_answers.push(choice)
			}
		})
		return incorrect_answers
	})

	let data = []

	for (i = 0; i < results.length; i++) {
		const quiz = new QuizQuestion()
		quiz.category = 'custom'
		quiz.correct_answer = results[i].answer
		quiz.difficulty = 'medium'
		quiz.incorrect_answers = incorrect_list[i]
		quiz.question = results[i].question
		quiz.type = typeList[quizType]

		data.push(quiz)
	}

	return data
}

app.get('/', async (req, res) => {
	res.status(200).send({
		message: 'Hello from Codex',
	})
})

app.post('/', async (req, res) => {
	try {
		const prompt = req.body.content
		const unit = req.body.unit
		quizType = req.body.type
		const command = 'Generate ' + unit + ' ' + requestList[quizType]
		const content = `${command}+\n+${prompt}`

		const completion = await openai.createChatCompletion({
			model: 'gpt-3.5-turbo',
			messages: [{ role: 'user', content: content }],
			temperature: 0.2,
		})

		const jsonData = completion.data.choices[0].message.content
		console.log(jsonData)

		// const questions = jsonToObject(jsonData)
		const questions = {}

		res.status(200).send({
			results: questions,
		})
	} catch (error) {
		console.error(error)
		res.status(500).send(error || 'Something went wrong')
	}
})

app.listen(5001, () =>
	console.log('Server is running on port http://localhost:5001')
)
