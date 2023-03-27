import { read, utils, writeFileXLSX } from 'xlsx'

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
	writeFileXLSX(workbook, `quiz_of_${name}.xlsx`)
}

export default createSheet
