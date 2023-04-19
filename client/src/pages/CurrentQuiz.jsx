import { useSelector } from 'react-redux'
import { db } from '../utils/firebaseConfig'
import { getDocs, collection, addDoc } from 'firebase/firestore'
import QuizTable from '../components/QuizTable'
import '../styles/Home.css'

const CurrentQuiz = () => {
	const { userId } = useSelector((state) => state.user)
	const { questions, subject, source } = useSelector((state) => state.quiz)

	const multipleChoiceCollectionRef = collection(db, 'multipleChoice')
	const questionGroupCollectionRef = collection(db, 'questionGroup')

	const putQuestionList = async () => {
		try {
			const createdAt = new Date()
			await addDoc(questionGroupCollectionRef, {
				category: questions[0].category,
				createdAt: createdAt,
				source: source,
				subject: subject,
				type: questions[0].type,
				userId: userId,
			})

			const questionGroupData = await getDocs(questionGroupCollectionRef)
			const aboveGroupId =
				questionGroupData.docs[questionGroupData.docs.length - 1].id

			await questions.map(async (question) => {
				await addDoc(multipleChoiceCollectionRef, {
					category: question.category,
					correct_answer: question.correct_answer,
					createdAt: createdAt,
					incorrect_answers: question.incorrect_answers,
					play: 5,
					question: question.question,
					questionGroup: aboveGroupId,
					score: 3,
					subject: subject,
					type: question.type,
					difficulty: question.difficulty,
					updatedAt: createdAt,
					userId: userId,
				})
			})
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<div className="content">
			<QuizTable rows={questions} />
			<button onClick={() => putQuestionList(questions, subject)}>
				Save to DB
			</button>
		</div>
	)
}

export default CurrentQuiz
