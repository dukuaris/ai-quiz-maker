const express = require('express')
const puppeteer = require('puppeteer')
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
	'multiple-choice questions with following text, and provide a question, an answer, a list of incorrect answers, and the difficulty from high to medium to low for each question in a JSON format and in the language of following text:',
	'true/false questions with following text, and provide the questions, the answers, and the difficulties from high to medium to low in a JSON format:',
	'fill-in-the-blank quizzes to be filled with no more than 3 words, with following information, and provide a sentence with one blank space, an answer, a list of incorrect answers, and the difficulty from high to medium to low for each quiz, all in a JSON format:',
	[
		'a matching quiz with following information and provide a title of the information and a list with',
		'pairs of a term and a description consisting of less than 10 words, both the title and the pairs in a JSON format:',
	],
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

const generateQuiz = async (content) => {
	const completion = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages: [{ role: 'user', content: content }],
		temperature: 0.2,
	})

	let jsonData = completion.data.choices[0].message.content
	let resultObject = {}
	const objIndex = jsonData.indexOf('{')

	// Exception Handling of Response Data
	try {
		resultObject = JSON.parse(jsonData)
	} catch (error) {
		console.log('The first get request failed: ', error)
		try {
			if (objIndex == -1) {
				content = `Create a JSON format with below text:`
				const revision = await openai.createChatCompletion({
					model: 'gpt-3.5-turbo',
					messages: [{ role: 'user', content: jsonData }],
					temperature: 0.2,
				})
				jsonData = revision.data.choices[0].message.content
			} else if (jsonData[0] === '[' && jsonData[jsonData.length] === ']') {
				const coreData = jsonData.substring(1, jsonData.length - 1).trim()
				jsonData = `{"questions":[ ${jsonData} ]}`
			} else if (objIndex == 0) {
				jsonData = `{"questions":[ ${jsonData} ]}`
			} else {
				jsonData = jsonData.substring(objIndex)
			}
			resultObject = JSON.parse(jsonData)
			console.log('Succeed in the exception handling!')
		} catch (error) {
			throw new Error('Finally failed: ', error)
		}
	}
	return resultObject
}

function jsonToObject(resultObject, unit, quizType) {
	let results = []
	let data = []
	const resultKeys = Object.keys(resultObject)

	if (resultKeys.length === unit) {
		resultKeys.map((key) => {
			results.push(resultObject[key])
		})
	} else if (quizType == 3) {
		results = resultObject.pairs
	} else {
		results = resultObject.questions
	}

	for (i = 0; i < results.length; i++) {
		const quiz = new QuizQuestion()
		quiz.source = 'GPT'
		quiz.category = 'custom'
		quiz.type = typeList[quizType]

		switch (quizType) {
			case 0:
				quiz.question = results[i].question
				quiz.difficulty = results[i].difficulty
				quiz.correct_answer = results[i].answer
				quiz.incorrect_answers = results[i].incorrect_answers
				break
			case 1:
				quiz.question = results[i].question
				quiz.difficulty = results[i].difficulty
				quiz.correct_answer = results[i].answer.toString().toUpperCase()
				quiz.correct_answer === 'TRUE' || quiz.correct_answer === 'T'
					? quiz.incorrect_answers.push('FALSE')
					: quiz.incorrect_answers.push('TRUE')
				break
			case 2:
				quiz.question = results[i].sentence
				quiz.difficulty = results[i].difficulty
				quiz.correct_answer = results[i].answer.toString()
				quiz.incorrect_answers = results[i].incorrect_answers
				break
			case 3:
				quiz.question = results[i].term
				quiz.difficulty = 'medium'
				quiz.correct_answer = results[i].description
				quiz.incorrect_answers = []
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

app.post('/crawl', async (req, res) => {
	try {
		const url = req.body.url
		const browser = await puppeteer.launch()
		const page = await browser.newPage()
		await page.goto(url)

		const title = await page.evaluate(() => document.title)
		const text = await page.evaluate(() => document.body.innerText)

		await browser.close()

		res.status(200).send({
			title: title,
			results: text,
		})
	} catch (error) {
		console.error(error)
		res.status(500).send(error || 'Crawling failed!')
	}
})

app.post('/', async (req, res) => {
	const prompt = req.body.content
	const unit = req.body.unit
	quizType = req.body.type
	const threshold = 3000
	let command = ''
	let resultObject = {}

	try {
		if (prompt.length > threshold) {
			const paragraphs = prompt.split(/\n\s*\n/)

			let index = 0
			let chunkList = []
			let contentList = []

			while (index < paragraphs.length) {
				let chunk = ''
				let count = 0
				let list = []
				while (count <= threshold && index < paragraphs.length) {
					list.push(paragraphs[index])
					count += paragraphs[index].length
					index++
				}
				chunk = list.join('\n')

				if (quizType == 3) {
					command =
						'Generate' +
						' ' +
						requestList[quizType][0] +
						Math.floor(unit / chunkList.length) +
						' ' +
						requestList[quizType][1]
				} else {
					command =
						'Generate ' +
						Math.floor(unit / chunkList.length) +
						' ' +
						requestList[quizType]
				}
				const content = command + '\n' + prompt

				contentList.push(content)
				chunkList.push(chunk)
			}

			// console.log(chunkList)
			// console.log(contentList)

			throw new Error('Too Long Content!')
		} else {
			if (quizType == 3) {
				command =
					'Generate' +
					' ' +
					requestList[quizType][0] +
					unit +
					' ' +
					requestList[quizType][1]
			} else {
				command = 'Generate ' + unit + ' ' + requestList[quizType]
			}
			const content = command + '\n' + prompt

			resultObject = await generateQuiz(content)
		}

		console.log(resultObject)

		const questions = jsonToObject(resultObject, unit, quizType)

		res.status(200).send({
			results: questions,
			title: quizType == 3 ? '' : resultObject.title,
		})
	} catch (error) {
		console.error(error)
		res.status(500).send(error || 'Something went wrong')
	}
})

app.listen(5001, () =>
	console.log('Server is running on port http://localhost:5001')
)
