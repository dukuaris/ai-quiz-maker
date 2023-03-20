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

class QuizQuestion {
	constructor(
		category,
		correct_answer,
		difficulty,
		incorrect_answers,
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

function csvToListOfObjects(csvText, delimiter = '|') {
	const lines = csvText.trim().split('\n')
	const rows = lines.slice(lines.length - 5, lines.length)
	const headers = ['question', 'a1', 'a2', 'a3', 'a4', 'correct_answer']

	return rows.map((row) => {
		const values = row.split(delimiter)
		return headers.reduce((obj, header, index) => {
			obj[header] = values[index].trim()
			return obj
		}, {})
	})
}

app.get('/', async (req, res) => {
	res.status(200).send({
		message: 'Hello from Codex',
	})
})

app.post('/', async (req, res) => {
	try {
		const command =
			"Generate 5 multiple-choice questions with following text, and provide the questions, the choices, and the correct answer in a csv format with '|' as a delimiter instead of ',':"
		const prompt = req.body.content
		const content = `${command}+\n+${prompt}`

		const completion = await openai.createChatCompletion({
			model: 'gpt-3.5-turbo',
			messages: [{ role: 'user', content: content }],
			temperature: 0.2,
		})

		const text = completion.data.choices[0].message.content
		console.log(text)

		const questions = csvToListOfObjects(text)
		console.log(questions)

		res.status(200).send({
			bot: questions,
		})
	} catch (error) {
		console.error(error)
		res.status(500).send(error || 'Something went wrong')
	}
})

app.listen(5001, () =>
	console.log('Server is running on port http://localhost:5001')
)
