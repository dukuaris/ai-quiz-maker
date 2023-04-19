const express = require('express')
const puppeteer = require('puppeteer')
require('dotenv').config()
const cors = require('cors')
const { Configuration, OpenAIApi } = require('openai')
const { scrapeText } = require('./scrapeText')
const { exceptionHandling } = require('./exceptionHandling')
const { tryException } = require('./tryException')

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)
const url = 'https://api.openai.com/v1/chat/completions'

const app = express()
app.use(cors())
app.use(express.json())

let quizType //type of quiz
const typeList = [
	'multiple-choice',
	'true-false',
	'fill-in-the-blank',
	'matching',
]
const requestList = [
	'multiple-choice questions with following text, and provide a question, an answer, a list of incorrect answers, and the difficulty from high to medium to low for each question in a JSON format:',
	'true/false questions with following text, and provide the questions, the answers, and the difficulties from high to medium to low in a JSON format:',
	'fill-in-the-blank questions to be filled with no more than 3 words, with following information, and provide a sentence with one blank space, an answer, a list of incorrect answers, and the difficulty from high to medium to low for each question, all in a JSON format with keys of "sentence","answer","incorrect_answers" and "difficulty":',
	[
		'matching questions with following information and provide a title of the information and a list with',
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

const parseJson = (jsonData, quizType) => {
	let resultObject = { questions: [] }
	let result = JSON.parse(jsonData)
	const dataKeys = Object.keys(result)
	if (dataKeys?.length > 1 && quizType !== 3) {
		console.log(dataKeys)
		dataKeys.map((key) => {
			resultObject.questions.push(result[key])
		})
		return resultObject
	} else {
		return result
	}
}

const recallGPT = async (jsonData, quizType) => {
	let tries = 0
	let maxTries = 3
	let response = null
	const prompt = [
		'Provide a complete data in JSON format with keys of "question","answer","incorrect_answers" and "difficulty" with below text:',
		'Provide a complete data in JSON format with keys of "question","answer" and "difficulty" with below text:',
		'Provide a complete data in JSON format with keys of "sentence","answer","incorrect_answers" and "difficulty" with below text:',
		'Provide a complete data in JSON format with keys of "term" and "description" with below text:',
	]
	const content = prompt[quizType] + '\n' + jsonData

	while (tries < maxTries && response === null) {
		try {
			response = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: [{ role: 'user', content: content }],
				temperature: 0.2,
			})
		} catch (error) {
			console.log(`Error on attempt ${tries + 1}: ${error}`)
		}
		tries++
	}
	const reJsonData = response.data.choices[0].message.content
	return reJsonData
}

// tryException()

const generateQuiz = async (content, quizType) => {
	/// Call to ChatGPT
	let tries = 0
	let maxTries = 3
	let response = null

	while (tries < maxTries && response === null) {
		try {
			response = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: [{ role: 'user', content: content }],
				temperature: 0.5,
			})
		} catch (error) {
			console.log(`Error on attempt ${tries + 1}: ${error}`)
		}
		tries++
	}

	let jsonData = response.data.choices[0].message.content
	let resultObject = {}

	console.log(jsonData)
	console.log(`--------------- 1st trial ---------------`)

	// Data Refining
	let trials = 0
	const flawedJsonRegex = /,\s*]/g
	while (trials < 5 && Object.keys(resultObject).length === 0) {
		try {
			if (flawedJsonRegex.test(jsonData)) {
				jsonData = jsonData.replace(flawedJsonRegex, ']')
			}
			resultObject = await parseJson(jsonData, quizType)
		} catch (error) {
			console.log(`The ${trials + 1} get request failed: `, error)

			jsonData = await exceptionHandling(jsonData, quizType, recallGPT)
		}
		trials++
	}
	console.log(resultObject)
	console.log('------------------- Final -------------------')
	return resultObject
}

function jsonToObject(resultObject, unit, quizType) {
	let results = []
	let data = []
	// const resultKeys = Object.keys(resultObject)

	// if (resultKeys.length === unit) {
	// 	resultKeys.map((key) => {
	// 		results.push(resultObject[key])
	// 	})
	// } else {
	// 	results = resultObject.questions
	// }
	if (quizType === 3) {
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
				quiz.question = results[i].question || results[i].text
				quiz.difficulty = results[i].difficulty
				quiz.correct_answer = results[i].answer.toString().toUpperCase()
				quiz.correct_answer === 'TRUE' || quiz.correct_answer === 'T'
					? quiz.incorrect_answers.push('FALSE')
					: quiz.incorrect_answers.push('TRUE')
				break
			case 2:
				quiz.question =
					results[i].sentence || results[i].question || results[i].statement
				quiz.difficulty = results[i].difficulty
				quiz.correct_answer = results[i].answer
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
	scrapeText(req, res)
})

app.post('/', async (req, res) => {
	const prompt = req.body.content
	const unit = req.body.unit
	quizType = req.body.type
	const threshold = 2500
	let command = ''
	let resultObject = {}
	let quizTitle = []

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
				chunkList.push(chunk)
			}

			chunkList.map((chunk) => {
				if (quizType == 3) {
					command =
						'Generate' +
						' ' +
						requestList[quizType][0] +
						Math.ceil(unit / chunkList.length) +
						' ' +
						requestList[quizType][1]
				} else {
					command =
						'Generate ' +
						Math.ceil(unit / chunkList.length) +
						' ' +
						requestList[quizType]
				}
				const content = command + '\n' + chunk
				contentList.push(content)
			})

			let questionSum = []
			let pairSum = []
			for (let i = 0; i < contentList.length; i++) {
				const partialResult = await generateQuiz(contentList[i], quizType)
				if (quizType === 3) {
					if (
						partialResult.pairs !== undefined &&
						partialResult.pairs[0] !== null
					) {
						quizTitle.push(partialResult.title)
						pairSum = [...pairSum, ...partialResult.pairs]
					}
				} else {
					if (
						partialResult.questions !== undefined &&
						partialResult.questions[0] !== null
					) {
						questionSum = [...questionSum, ...partialResult.questions]
					}
				}
			}
			if (quizType === 3) {
				resultObject['questions'] = pairSum
			} else {
				resultObject['questions'] = questionSum
			}
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

			resultObject = await generateQuiz(content, quizType)
		}

		const questions = jsonToObject(resultObject, unit, quizType)

		res.status(200).send({
			results: questions,
			title: quizType == 3 ? '' : quizTitle,
		})
	} catch (error) {
		console.error(error)
		res.status(500).send(error || 'Something went wrong')
	}
})

app.listen(5001, () =>
	console.log('Server is running on port http://localhost:5001')
)
