const matchingRegex =
	/{\s*\n*"title": "(.*?)",\s*\n*"pairs": \[(\s*\n*{\s*\n*"term": "(.*?)",\s*\n*"description": "(.*?)"\s*\n*},*)*\s*\n*\]\s*\n*}/g
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
	return areObjects
}

const tryJSON = () => {
	let questions = []
	let jsonData
	const data = `
	{
		"title": "Meditation and its Types",
		"pairs": [
			{
				"term": "Body Scan",
				"description": "Focus on bodily sensations"
			},
			{
				"term": "Tonglen",
				"description": "Take in pain, send out benefit"
			},
			{
				"term": "Metta",
				"description": "Conjure loving-kindness for self and others"
			}
		]
	}
	
	{
		"title": "Different Types of Meditation",
		"pairs": [
			{
				"term": "Following the Breath",
				"description": "Calming the mind"
			},
			{
				"term": "Walking Meditation",
				"description": "Focus on footsteps and breath"
			},
			{
				"term": "Insight Meditation",
				"description": "Seeing deeply into reality"
			}
		]
	}
	
	{
		"title": "How to Practice Walking Meditation",
		"pairs": [
			{
				"term": "Peaceful Place",
				"description": "Begin walking in a calm environment"
			},
			{
				"term": "Focus on Feet",
				"description": "Shift weight from side to side"
			},
			{
				"term": "Step Forward",
				"description": "Repeat process with each foot"
			}
		]
	}
`

	questions = data.match(matchingRegex)
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

	// questions = data.match(matchingRegex)
	// if (questions.length > 1) {
	// 	let title = ''
	// 	let pairs = []
	// 	questions.map((question) => {
	// 		const unit = JSON.parse(question)
	// 		title = unit['title']
	// 		pairs.push(...unit['pairs'])
	// 	})
	// 	jsonData = `
	// 		{
	// 			"title" : "${title}",
	// 			"pairs" : ${JSON.stringify(pairs)}
	// 		}
	// 	`
	// } else {
	// 	jsonData = questions[0]
	// }

	const jsonized = JSON.parse(jsonData)
	console.log(jsonized)
}

module.exports = { tryJSON }
