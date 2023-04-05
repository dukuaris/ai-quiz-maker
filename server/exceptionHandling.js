const matchingRegex =
	/{\s*\n*"title": "(.*?)",\s*\n*"pairs": \[(\s*\n*{\s*\n*"term": "(.*?)",\s*\n*"description": "(.*?)"\s*\n*},*)*\s*\n*\]\s*\n*}/g
const objectRegex =
	/({\s*\n*"sentence": "(.*?)",\s*\n*"answer": "(.*?)",\s*\n*"incorrect_answers": \[(.*?)\],\s*\n*"difficulty": "(.*?)"\s*\n*})|({\s*\n*"question": "(.*?)",\s*\n*"answer": "(.*?)",\s*\n*"incorrect_answers": \[(.*?)\],\s*\n*"difficulty": "(.*?)"\s*\n*})/g

const hasObjects = (jsonData) => {
	const objectSignalRegex = /{|}/g
	let count = 0
	//To check whether there are any objects in the string
	const isObject = objectSignalRegex.test(jsonData)
	//To check whether the number of '{' matches with '}'
	for (let i = 0; i < jsonData.length; i++) {
		if (jsonData[i] === '{') {
			count++
		} else if (jsonData[i] === '}') {
			count--
		}
	}
	const areObjects = count === 0 && isObject
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
	} else {
		questions = jsonData.match(objectRegex)
		jsonData = `{"questions":[${questions}]\n}`
	}
	return jsonData
}

const exceptionHandling = async (data, quizType, recallGPT) => {
	let jsonData = data
	let areObjects = hasObjects(jsonData)

	if (areObjects) {
		return reArrangeQuiz(jsonData, quizType)
	} else {
		let trials = 0
		while (trials < 4) {
			try {
				const reJsonData = await recallGPT(jsonData, quizType)
				if (hasObjects(jsonData + reJsonData)) {
					jsonData = jsonData + reJsonData
					return jsonData
				} else if (hasObjects(reJsonData)) {
					return reArrangeQuiz(jsonData, quizType)
				}
			} catch (error) {
				console.log(error)
			}
		}
		trials++
	}
}

// const exceptionHandling = async (data, quizType, recallGPT) => {
// 	let jsonData = data
// 	const objEndRegex = /]\n}/.test(jsonData)
// 	const listEndRegex = /}\n]/.test(jsonData)
// 	const objIndex = jsonData.indexOf('{')
// 	const listIndex = jsonData.indexOf('[')
// 	const objLastIndex = jsonData.lastIndexOf('}')
// 	const listLastIndex = jsonData.lastIndexOf(']')
// 	if (objIndex === 0) {
// 		console.log('OBJECT!!!')
// 		return await recallGPT(jsonData, quizType)
// 	} else if (listIndex === 0) {
// 		console.log('ARRAY!!!')
// 		if (jsonData[jsonData.length - 1] === ']') {
// 			let count = 0
// 			for (let i = 0; i < jsonData.length; i++) {
// 				if (jsonData[i] === '[') {
// 					count++
// 				} else if (jsonData[i] === ']') {
// 					count--
// 				}
// 			}
// 			if (count === 0) {
// 				jsonData = `{"questions":[${jsonData}]\n}`
// 				return jsonData
// 			}
// 			return await recallGPT(jsonData, quizType)
// 		}
// 		return await recallGPT(jsonData, quizType)
// 	} else {
// 		if (objIndex < listIndex) {
// 			console.log('OBJINDEX < LISTINDEX')
// 			console.log(objEndRegex)
// 			if (objEndRegex) {
// 				jsonData = jsonData.substring(objIndex, objLastIndex + 1)
// 				return jsonData
// 			} else {
// 				return await recallGPT(jsonData, quizType)
// 			}
// 		} else if (listIndex < objIndex) {
// 			console.log('LISTINDEX < OBJINDEX ')
// 			console.log(listEndRegex)
// 			if (listEndRegex) {
// 				jsonData = `{"questions":${jsonData.substring(
// 					listIndex,
// 					listLastIndex + 1
// 				)}\n}`
// 				return jsonData
// 			} else {
// 				return await recallGPT(jsonData, quizType)
// 			}
// 		} else {
// 			return await recallGPT(jsonData, quizType)
// 		}
// 	}
// }

module.exports = { exceptionHandling }
