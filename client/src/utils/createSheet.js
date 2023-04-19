import { utils, writeFileXLSX, read } from 'xlsx'

const createSheet = (questions, subject, source) => {
	let quizzes = []

	const object_list = [
		'category',
		'subject',
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

	let src = [{ source: source }]
	console.log(src)

	const questionSheet = utils.json_to_sheet(quizzes)
	const sourceSheet = utils.json_to_sheet(src)
	const workbook = utils.book_new()
	utils.book_append_sheet(workbook, questionSheet, 'Questions')
	utils.book_append_sheet(workbook, sourceSheet, 'Source')
	writeFileXLSX(workbook, `${subject}.xlsx`)
}

export const readSheet = (fileBuffer, callbackPageDone, callbackAllDone) => {
	const workbook = read(fileBuffer, { type: 'buffer' })
	const questionSheet = workbook.Sheets[workbook.SheetNames[0]]
	const sourceSheet = workbook.Sheets[workbook.SheetNames[1]]
	const questions = utils.sheet_to_json(questionSheet)
	const source = utils.sheet_to_json(sourceSheet)[0].source

	let data = []
	questions.forEach((unit) => {
		let item = {}
		item['category'] = unit.category
		item['type'] = unit.type
		item['difficulty'] = unit.difficulty
		item['subject'] = unit.subject
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
	let results = { questions: data, source: source }
	callbackAllDone(results)
}

export default createSheet
