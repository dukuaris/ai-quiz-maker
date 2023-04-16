const matchingRegex =
	/{\s*\n*"title": "(.*?)",\s*\n*"pairs": \[(\s*\n*{\s*\n*"term": "(.*?)",\s*\n*"description": "(.*?)"\s*\n*},*)*\s*\n*\]\s*\n*}/g
const oxRegex =
	/{\s*\n*"question": "(.*?)",\s*\n*"answer": (true|false|"true"|"false"),\s*\n*"difficulty": "(.*?)"\s*\n*}/g
const objectRegex =
	/({\s*\n*"sentence": "(?!(?=.*?\".*?\")).*?",\s*\n*"answer": "(.*?)",\s*\n*"incorrect_answers": \[(.*?)\],\s*\n*"difficulty": "(.*?)"\s*\n*})|({\s*\n*"question": "(.*?)",\s*\n*"answer": "(.*?)",\s*\n*"incorrect_answers": \[(.*?)\],\s*\n*"difficulty": "(.*?)"\s*\n*})/g

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

const tryException = () => {
	let questions = []
	const quizType = 2
	let jsonData = `
	1. What is the name of the hand position used in Zen meditation?
- Cosmic mudra.
- Zen position, Cosmic Zen, Mudra Zen.
- Difficulty: Low.

2. How should you sit when meditating on a chair?
- Your spine should be straight and your feet flat on the ground.
- Bend your spine, raise your feet, relax your back.
- Difficulty: Low.

3. How long should you meditate for?
- You can meditate for as long, or as short, as you’d like.
- 1 hour, 30 minutes, 10 minutes.
- Difficulty: Low.

4. What should you do if you can’t find a quiet place to meditate?
- Sit with the noise.
- Complain about the noise, leave the place.
- Difficulty: Medium.

5. Can meditation be painful?
- Yes, sometimes.
- No, never.
- Difficulty: Low.

6. Is meditation a replacement for therapy or medication?
- No, it's not.
- Yes, it is.
- Difficulty: Low.

7. How can you react if pain is too much to endure during meditation?
- Adjust your posture or hold your position and meditate on the pain.
- Leave the place or distract yourself.
- Difficulty: Medium.

8. Can meditation benefit mental health?
- Yes, sometimes.
- No, never.
- Difficulty: Low.

{
  "1": {
    "sentence": "What is the name of the hand position used in Zen meditation?",
    "answer": "Cosmic mudra",
    "incorrect_answers": ["Zen position", "Cosmic Zen", "Mudra Zen"],
    "difficulty": "low"
  },
  "2": {
    "sentence": "How should you sit when meditating on a chair?",
    "answer": "Your spine should be straight and your feet flat on the ground.",
    "incorrect_answers": ["Bend your spine, raise your feet, relax your back.", "Sit sideways and cross your legs.", "Lean back and rest your head."],
    "difficulty": "low"
  },
  "3": {
    "sentence": "How long should you meditate for?",
    "answer": "You can meditate for as long, or as short, as you’d like.",
    "incorrect_answers": ["1 hour", "30 minutes", "10 minutes"],
    "difficulty": "low"
  },
  "4": {
    "sentence": "What should you do if you can’t find a quiet place to meditate?",
    "answer": "Sit with the noise.",
    "incorrect_answers": ["Complain about the noise, leave the place.", "Sing to cover the noise, wait for it to end.", "Wear noise-cancelling headphones."],
    "difficulty": "medium"
  },
  "5": {
    "sentence": "Can meditation be painful?",
    "answer": "Yes, sometimes.",
    "incorrect_answers": ["No, never.", "Only if you meditate for too long.", "Pain depends on whether you're new to meditation."],
    "difficulty": "low"
  },
  "6": {
    "sentence": "Is meditation a replacement for therapy or medication?",
    "answer": "No, it's not.",
    "incorrect_answers": ["Yes, it is.", "It depends on your condition.", "It works better than therapy or medication."],
    "difficulty": "low"
  },
  "7": {
    "sentence": "How can you react if pain is too much to endure during meditation?",
    "answer": "Adjust your posture or hold your position and meditate on the pain.",
    "incorrect_answers": ["Leave the place or distract yourself.", "Ignore the pain and keep sitting still.", "Sleep and hope you feel better later."],
    "difficulty": "medium"
  },
  "8": {
    "sentence": "Can meditation benefit mental health?",
    "answer": "Yes, sometimes.",
    "incorrect_answers": ["No, never.", "It depends on the person.", "Meditation is only for physical health."],
    "difficulty": "low"
  }
}
`

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
	} else if (quizType === 1) {
		questions = jsonData.match(oxRegex)
		jsonData = `{"questions":[${questions}]\n}`
	} else {
		questions = jsonData.match(objectRegex)
		jsonData = `{"questions":[${questions}]\n}`
	}

	const jsonized = JSON.parse(jsonData)
	console.log(jsonized)
}

module.exports = { tryException }
