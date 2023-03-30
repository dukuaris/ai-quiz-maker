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
	'multiple-choice questions with following text, and provide a question, an answer, a list of incorrect answers, and the difficulty from high to medium to low for each question in a JSON format:',
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

const parseJson = (jsonData) => {
	let dataKeys = []
	let questionList = []
	let resultObject = JSON.parse(jsonData)
	dataKeys = Object.keys(resultObject)
	if (dataKeys?.length > 1 && quizType !== 3) {
		dataKeys.map((key) => {
			questionList.push(JSON.stringify(resultObject[key]))
		})
		jsonData = `{"questions":[${questionList}]}`
		resultObject = JSON.parse(jsonData)
	}
	return resultObject
}

const recallGPT = async (jsonData) => {
	let tries = 0
	let maxTries = 3
	let response = null
	const content =
		'Provide a valid and complete JSON format data with below text:' +
		'\n' +
		jsonData

	while (tries < maxTries && response === null) {
		try {
			response = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: [{ role: 'user', content: content }],
				temperature: 0.1,
			})
		} catch (error) {
			console.log(`Error on attempt ${tries + 1}: ${error}`)
		}
		tries++
	}
	const reJsonData = response.data.choices[0].message.content
	return reJsonData
}

const exceptionHandling = async (data) => {
	let jsonData = data
	let isJSON = false
	const objIndex = jsonData.indexOf('{')
	const listIndex = jsonData.indexOf('[')
	if (objIndex === 0) {
		return await recallGPT(jsonData)
	} else if (listIndex === 0) {
		if (jsonData[jsonData.length - 1] === ']') {
			let count = 0
			for (let i = 0; i < jsonData.length; i++) {
				if (jsonData[i] === '[') {
					count++
				} else if (jsonData[i] === ']') {
					count--
				}
			}
			const isMatched = count === 0
			if (isMatched) {
				jsonData = `{"questions":${jsonData}}`
				return jsonData
			}
			return await recallGPT(jsonData)
		}
		return await recallGPT(jsonData)
	} else {
		if (objIndex < listIndex) {
			exceptionHandling(jsonData.substring(objIndex))
		} else if (listIndex < objIndex) {
			exceptionHandling(jsonData.substring(objIndex))
		} else {
			return await recallGPT(jsonData)
		}
	}
}

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
				temperature: 0.2,
			})
		} catch (error) {
			console.log(`Error on attempt ${tries + 1}: ${error}`)
		}
		tries++
	}

	let jsonData = response.data.choices[0].message.content
	let resultObject = {}

	// Data Refining
	let trials = 0
	const pattern = /[^{}\[\]]+/
	while (trials < 5 && Object.keys(resultObject).length === 0) {
		try {
			console.log(jsonData)
			console.log(`--------------- ${trials + 1}th trial ---------------`)
			resultObject = await parseJson(jsonData)
		} catch (error) {
			console.log(`The ${trials + 1} get request failed: `, error)
			const reJsonData = await exceptionHandling(jsonData)

			let objIndex = reJsonData.indexOf('{')
			let objLastIndex = reJsonData.lastIndexOf('}')
			let listIndex = reJsonData.indexOf('[')
			let listLastIndex = reJsonData.lastIndexOf(']')
			if (pattern.test(reJsonData[0])) {
				if (listIndex < objIndex) {
					console.log(listLastIndex)
					jsonData = `{"questions":${reJsonData.substring(
						listIndex,
						listIndex < listLastIndex && listLastIndex
					)}}`
				} else if (listIndex > objIndex) {
					console.log(objLastIndex)
					jsonData = reJsonData.substring(
						objIndex,
						objIndex < objLastIndex && objLastIndex
					)
				} else {
					jsonData = jsonData + reJsonData
					if (jsonData[0] === '[' && jsonData[jsonData.length - 1] === ']') {
						jsonData = '{"questions":' + jsonData + '}'
					}
				}
			} else {
				jsonData = reJsonData
			}
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
					quizTitle.push(partialResult.title)
					pairSum = [...pairSum, ...partialResult.pairs]
				} else {
					questionSum = [...questionSum, ...partialResult.questions]
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
