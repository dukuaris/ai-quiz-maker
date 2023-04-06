import { utils, writeFileXLSX, read } from 'xlsx'

const createSheet = (questions, name) => {
	let quizzes = []

	const object_list = [
		'category',
		'type',
		'difficulty',
		'question',
		'correct_answer',
		'incorrect_answer_1',
		'incorrect_answer_2',
		'incorrect_answer_3',
		'source',
	]
	questions.map((question, i) => {
		let obj = {}
		let quiz = {}
		question.incorrect_answers.map((incorrect_answer, i) => {
			obj[`incorrect_answer_${i + 1}`] = incorrect_answer
		})
		question = { ...question, ...obj }
		delete question.incorrect_answers
		object_list.map((item) => {
			quiz[item] = question[item]
		})
		quizzes.push(quiz)
	})

	const worksheet = utils.json_to_sheet(quizzes)
	const workbook = utils.book_new()
	utils.book_append_sheet(workbook, worksheet, 'Questions')
	writeFileXLSX(workbook, `${name}_quiz.xlsx`)
}

export const readSheet = (fileBuffer, callbackPageDone, callbackAllDone) => {
	const workbook = read(fileBuffer, { type: 'buffer' })
	const worksheet = workbook.Sheets[workbook.SheetNames[0]]
	const results = utils.sheet_to_json(worksheet)

	let data = []
	results.forEach((unit) => {
		let item = {}
		item['category'] = unit.category
		item['type'] = unit.type
		item['difficulty'] = unit.difficulty
		item['question'] = unit.question
		item['correct_answer'] = unit.correct_answer
		item['incorrect_answers'] = [
			unit.incorrect_answer_1,
			unit.incorrect_answer_2,
			unit.incorrect_answer_3,
		]
		item['source'] = unit.source
		data.push(item)
	})
	callbackAllDone(data)
}

export default createSheet
