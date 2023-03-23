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
const typeList = ['multiple', 'true-false', 'fill-in-the-blank', 'matching']
const requestList = [
	`multiple-choice questions with following text, and provide the questions, the 4 choices, the answers, and the difficulties from high to medium to low in JSON format:`,
	`true/false questions with following text, and provide the questions, the answers, and the difficulties from high to medium to low in JSON format:`,
	`fill-in-the-blank quizzes to be filled with no more than 3 words, with following information, and provide a sentence with one blank space, an answer, lists of incorrect answers, and the difficulty from high to medium to low for each quiz, in JSON format:`,
	`matching quizzes with following information and provide a title of the information and a list with 10 pairs of a term and a description consisting of less than 10 words, both the title and the pairs in JSON format:`,
]

class QuizQuestion {
	constructor(
		category,
		correct_answer,
		difficulty,
		incorrect_answers = [],
		question,
		type,
		source
	) {
		this.category = category
		this.correct_answer = correct_answer
		this.difficulty = difficulty
		this.incorrect_answers = incorrect_answers
		this.question = question
		this.type = type
		this.source = source
	}
}

function jsonToObject(jsonData, unit) {
	let results = []
	let data = []
	const resultObject = JSON.parse(jsonData)
	const resultKeys = Object.keys(resultObject)

	if (resultKeys.length === unit) {
		resultKeys.map((key) => {
			results.push(resultObject[key])
		})
	} else {
		results = resultObject.questions
	}

	for (i = 0; i < results.length; i++) {
		const quiz = new QuizQuestion()
		quiz.source = 'GPT'
		quiz.category = 'custom'
		quiz.difficulty = results[i].difficulty
		quiz.type = typeList[quizType]

		quiz.correct_answer = results[i].answer.toString()

		switch (quizType) {
			case 0:
				quiz.question = results[i].question
				results[i].choices.map((choice) => {
					if (!choice.includes(results[i].answer)) {
						quiz.incorrect_answers.push(choice)
					}
				})
				break
			case 1:
				quiz.question = results[i].question
				quiz.correct_answer === 'TRUE'
					? quiz.incorrect_answers.push('FALSE')
					: quiz.incorrect_answers.push('TRUE')
				break
			case 2:
				quiz.question = results[i].sentence
				quiz.incorrect_answers = results[i].incorrect_answers
				break
			case 3:
				break
			default:
				throw new Error('Select a type of quiz.')
		}

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

		const questions = jsonToObject(jsonData, unit)
		// console.log(questions)

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
