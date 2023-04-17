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
	const { questions, subject, source } = useSelector((state) => state.quiz)

	const multipleChoiceCollectionRef = collection(db, 'multipleChoice')
	const questionGroupCollectionRef = collection(db, 'questionGroup')
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
					updatedAt: createdAt,
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
				<button onClick={() => putQuestionList(questions, subject)}>
					Save to DB
				</button>
			</div>
		</div>
	)
}

export default MyQuiz
