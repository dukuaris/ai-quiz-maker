import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import '../styles/Home.css'
import {
	alpha,
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TableSortLabel,
	Toolbar,
	Typography,
	Paper,
	Checkbox,
	IconButton,
	Tooltip,
	FormControlLabel,
	Switch,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import FilterListIcon from '@mui/icons-material/FilterList'
import { visuallyHidden } from '@mui/utils'

import { db } from '../utils/firebaseConfig'
import {
	getDocs,
	collection,
	addDoc,
	deleteDoc,
	updateDoc,
	doc,
} from 'firebase/firestore'

const MyQuiz = () => {
	const [questionList, setQuestionList] = useState([])
	const [newTitle, setNewTitle] = useState('')
	const [newQuestion, setNewQuestion] = useState('')
	const [newAnswer, setNewAnswer] = useState('')
	const [updatedTitle, setUpdatedTitle] = useState('')
	const { userId } = useSelector((state) => state.user)
	const { questions, subject } = useSelector((state) => state.quiz)

	const multipleChoiceCollectionRef = collection(db, 'multiple_choice')
	const getQuestionList = async () => {
		try {
			const data = await getDocs(multipleChoiceCollectionRef)
			const filteredData = data.docs.map((doc) => ({
				...doc.data(),
				id: doc.id,
			}))
			setQuestionList(filteredData)
		} catch (error) {
			console.log(error)
		}
	}

	// useEffect(() => {
	// 	getQuestionList()
	// }, [])

	const putQuestionList = async () => {
		// console.log(questions)
		// console.log(subject)
		// console.log(userId)
		try {
			questions.map(async (question) => {
				await addDoc(multipleChoiceCollectionRef, {
					subject: subject,
					category: question.category,
					question: question.question,
					correct_answer: question.correct_answer,
					incorrect_answers: question.incorrect_answers,
					type: question.type,
					difficulty: question.difficulty,
					source: question.source,
					userId: userId,
				})
			})
		} catch (error) {
			console.log(error)
		}
	}

	const onSubmitQuestion = async () => {
		try {
			await addDoc(multipleChoiceCollectionRef, {
				title: newTitle,
				question: newQuestion,
				answer: newAnswer,
				userId: userId,
			})

			getQuestionList()
		} catch (error) {
			console.log(error)
		}
	}

	const deleteQuestion = async (id) => {
		const questionDoc = doc(db, 'multiple_choice', id)
		try {
			await deleteDoc(questionDoc)
			getQuestionList()
		} catch (error) {
			console.log(error)
		}
	}

	const updateTitle = async (id) => {
		const questionDoc = doc(db, 'multiple_choice', id)
		try {
			await updateDoc(questionDoc, { title: updatedTitle })
			getQuestionList()
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<div className="content">
			<div className="settings">
				<div className="input-box">
					<input
						className="input-data"
						placeholder="title"
						onChange={(e) => setNewTitle(e.target.value)}
					/>
					<input
						className="input-data"
						placeholder="question"
						onChange={(e) => setNewQuestion(e.target.value)}
					/>
					<input
						className="input-data"
						placeholder="answer"
						onChange={(e) => setNewAnswer(e.target.value)}
					/>
					{/* <input className="input-data" placeholder="category" />
				<input className="input-data" placeholder="type" />
				<input className="input-data" placeholder="difficulty" />
				<input className="input-data" placeholder="source" /> */}
					<button onClick={() => putQuestionList()}>Submit</button>
				</div>
				<div>
					{questionList.map((question, i) => (
						<div key={i}>
							<h1>title:&nbsp;&nbsp; {question.title}</h1>
							<div>category:&nbsp;&nbsp; {question.category}</div>
							<div>type:&nbsp;&nbsp; {question.type}</div>
							<div>question:&nbsp;&nbsp; {question.question}</div>
							<br />
							<input
								placeholder="new title..."
								onChange={(e) => setUpdatedTitle(e.target.value)}
							/>
							<button onClick={() => updateTitle(question.id)}>
								Update Title
							</button>
							<button onClick={() => deleteQuestion(question.id)}>
								Delete Question
							</button>
							<br />
						</div>
					))}
				</div>
				<button onClick={() => putQuestionList(questions, subject)}>
					Save to DB
				</button>
			</div>
		</div>
	)
}

export default MyQuiz
