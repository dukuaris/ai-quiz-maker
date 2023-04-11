const matchingRegex =
	/{\s*\n*"title": "(.*?)",\s*\n*"pairs": \[(\s*\n*{\s*\n*"term": "(.*?)",\s*\n*"description": "(.*?)"\s*\n*},*)*\s*\n*\]\s*\n*}/g
const oxRegex =
	/{\s*\n*"question": "(.*?)",\s*\n*"answer": (true|false|"true"|"false"),\s*\n*"difficulty": "(.*?)"\s*\n*}/g
const objectRegex =
	/({\s*\n*"sentence": "(.*?)",\s*\n*"answer": "(.*?)",\s*\n*"incorrect_answers": \[(.*?)\],\s*\n*"difficulty": "(.*?)"\s*\n*})|({\s*\n*"question": "(.*?)",\s*\n*"answer": "(.*?)",\s*\n*"incorrect_answers": \[(.*?)\],\s*\n*"difficulty": "(.*?)"\s*\n*})/g

const hasObjects = (data) => {
	const objectSignalRegex = /{|}/g
	let count = 0
	//To check whether there are any objects in the string
	const isObject = objectSignalRegex.test(data)
	//To check whether the number of '{' matches with '}'
	for (let i = 0; i < data.length; i++) {
		if (data[i] === '{') {
			count++
		} else if (data[i] === '}') {
			count--
		}
	}
	const areObjects = count === 0 && isObject
	console.log(areObjects)
	return areObjects
}

const reArrangeQuiz = (jsonData, quizType) => {
	let questions = []
	if (quizType === 3) {
		questions = jsonData.match(matchingRegex)
		if (questions.length > 1) {
			let titles = []
			let pairs = []
			questions.map((question) => {
				const unit = JSON.parse(question)
				titles.push(unit['title'])
				pairs.push(...unit['pairs'])
			})
			jsonData = `
			{
				"title" : "${titles}",
				"pairs" : ${JSON.stringify(pairs)}
			}
		`
		} else {
			jsonData = questions[0]
		}
	} else if ((quizType = 1)) {
		questions = jsonData.match(oxRegex)
		jsonData = `{"questions":[${questions}]\n}`
	} else {
		questions = jsonData.match(objectRegex)
		jsonData = `{"questions":[${questions}]\n}`
	}
	return jsonData
}

const tryJSON = () => {
	let questions = []
	let jsonData
	const data = `
		{
			"question": "Bubble tea is a healthy drink with low sugar content.",
			"answer": false,
			"difficulty": "medium"
		}
		{
			"question": "Bubble tea is a healthy drink with low sugar content.",
			"answer": false,
			"difficulty": "medium"
		}
		{
			"question": "Bubble tea is a healthy drink with low sugar content.",
			"answer": false,
			"difficulty": "medium"
		}
		{
			"question": "Bubble tea is a healthy drink with low sugar content.",
			"answer": false,
			"difficulty": "medium"
		}
	`

	console.log(reArrangeQuiz(data, 1))

	// questions = data.match(matchingRegex)
	// if (questions.length > 1) {
	// 	let titles = []
	// 	let pairs = []
	// 	questions.map((question) => {
	// 		const unit = JSON.parse(question)
	// 		titles.push(unit['title'])
	// 		pairs.push(...unit['pairs'])
	// 	})
	// 	jsonData = `
	// 		{
	// 			"title" : "${titles}",
	// 			"pairs" : ${JSON.stringify(pairs)}
	// 		}
	// 	`
	// } else {
	// 	jsonData = questions[0]
	// }

	// // questions = data.match(matchingRegex)
	// // if (questions.length > 1) {
	// // 	let title = ''
	// // 	let pairs = []
	// // 	questions.map((question) => {
	// // 		const unit = JSON.parse(question)
	// // 		title = unit['title']
	// // 		pairs.push(...unit['pairs'])
	// // 	})
	// // 	jsonData = `
	// // 		{
	// // 			"title" : "${title}",
	// // 			"pairs" : ${JSON.stringify(pairs)}
	// // 		}
	// // 	`
	// // } else {
	// // 	jsonData = questions[0]
	// // }

	// const jsonized = JSON.parse(jsonData)
	// console.log(jsonized)
}

module.exports = { tryJSON }
