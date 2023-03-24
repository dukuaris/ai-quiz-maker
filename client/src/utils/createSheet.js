import { read, utils, writeFileXLSX } from 'xlsx'

const createSheet = (questions, name) => {
	let requestions = []
	questions.map((question, i) => {
		let obj = {}
		question.incorrect_answers.map((incorrect_answer, i) => {
			obj[`incorrect_answer_${i + 1}`] = incorrect_answer
		})
		question = { ...question, ...obj }
		delete question.incorrect_answers
		requestions.push(question)
	})

	const worksheet = utils.json_to_sheet(requestions)
	const workbook = utils.book_new()
	utils.book_append_sheet(workbook, worksheet, 'Questions')
	writeFileXLSX(workbook, `quiz_of_${name}.xlsx`)
}

export default createSheet
