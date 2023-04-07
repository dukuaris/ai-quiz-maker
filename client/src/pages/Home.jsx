import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Button, TextField, MenuItem } from '@mui/material'
import { LoadingButton } from '@mui/lab'

import {
	setQuestions,
	setName,
	setUnit,
	resetScore,
} from '../features/quiz/quizSlice'
import { useDispatch, useSelector } from 'react-redux'

import ErrorMessages from '../components/ErrorMessages'
import types from '../data/types.js'
import '../styles/Home.css'
import createSheet, { readSheet } from '../utils/handleSheet'
// import Pdf2TextClass from '../utils/readPdf'

const Home = () => {
	const { questions, name, unit } = useSelector((state) => state.quiz)
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [subject, setSubject] = useState('')
	const [type, setType] = useState('')
	const [number, setNumber] = useState(0)
	const [userInput, setUserInput] = useState('')
	const [form, setForm] = useState({
		content: '',
		url: '',
	})

	const [error, setError] = useState(false)
	const [loading, setLoading] = useState(false)
	const [crawling, setCrawling] = useState(false)
	const [wordCount, setWordCount] = useState(0)
	const [ready, setReady] = useState(false)
	const [activeColor, setActiveColor] = useState('')

	const typeList = ['multiple', 'true-false', 'fill-in-the-blank', 'matching']
	const serverAddress = 'https://ai-quiz-maker.onrender.com'
	// https://ai-quiz-maker.onrender.com
	// http://localhost:5001

	useEffect(() => {
		if (!ready) {
			setActiveColor('grey')
		} else {
			setActiveColor('')
		}
	}, [ready])

	const handleSubmit = async () => {
		if (ready) {
			dispatch(resetScore())
			dispatch(setUnit(0))
			dispatch(setQuestions([]))
			window.location.reload(false)
		} else {
			if (!name || unit < 1) {
				setError(true)
				return
			}

			if (form.content) {
				setLoading(true)
				try {
					const response = await fetch(serverAddress, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							content: form.content,
							unit: unit,
							type: type,
						}),
					})

					const data = await response.json()
					console.log(data.results)
					if (data.results !== undefined) {
						dispatch(setQuestions(data.results))
						setReady(true)
					} else {
						throw new Error()
					}
				} catch (err) {
					alert(
						'Failed to generate questions. You may reduce the amount of input or revise your content. Try again.'
					)
				} finally {
					setLoading(false)
				}
			} else {
				alert('Please provide proper content')
			}
		}
	}

	const handleCrawl = async () => {
		if (form.url.length > 0) {
			try {
				setCrawling(true)
				const response = await fetch(serverAddress + '/crawl', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						url: form.url,
					}),
				})
				const data = await response.json()
				setUserInput(data.results)
				setForm({ ...form, content: data.results })
				setWordCount(data.results.length)
			} catch (err) {
				alert('Failed to scrape content from the URL.Try again.')
			} finally {
				setCrawling(false)
			}
		} else {
			alert('Please provide URL')
		}
	}

	const handleXlsx = (e) => {
		const file = e.target.files[0]
		let fileReader = new FileReader()
		fileReader.onload = () => {
			setLoading(true)
			readSheet(fileReader.result, null, (data) => {
				setSubject(file.name.split('_')[0])
				setType(typeList.indexOf(data[0].type))
				setNumber(data.length)
				dispatch(setQuestions(data))
				setReady(true)
				setLoading(false)
			})
		}

		try {
			fileReader.readAsArrayBuffer(file)
		} catch (error) {
			alert('Please provide proper pdf document.')
		}
	}

	const handlePdf = (e) => {
		const file = e.target.files[0]
		// let fileReader = new FileReader()
		// let pdf2Text = new Pdf2TextClass()
		// fileReader.onload = () => {
		// 	setCrawling(true)
		// 	pdf2Text.pdfToText(fileReader.result, null, (text) => {
		// 		setUserInput(text)
		// 		setForm({ ...form, content: text })
		// 		setWordCount(text.length)
		// 		setCrawling(false)
		// 	})
		// }
		// try {
		// 	fileReader.readAsDataURL(file)
		// } catch (error) {
		// 	alert('Please provide proper pdf document.')
		// }
	}

	const handleChange = (e) => {
		if (e.target.name === 'content') {
			const text = e.target.value
			setUserInput(text)
			setForm({ ...form, [e.target.name]: text })
			setWordCount(text.length)
		} else {
			setForm({ ...form, [e.target.name]: e.target.value })
		}
	}

	return (
		<div className="content">
			<div className="settings">
				<p style={{ fontSize: 30 }}>Create Your Quiz</p>
				<div className="settings__select">
					{error && <ErrorMessages>Please Fill all the fields</ErrorMessages>}
					<TextField
						className="input-box"
						style={{ marginBottom: 25 }}
						name="name"
						label="Enter Your Subject"
						variant="outlined"
						onChange={(e) => {
							dispatch(setName(e.target.value))
							setSubject(e.target.value)
						}}
						value={subject}
					/>
					<TextField
						className="input-box"
						select
						label="Select Quiz Type"
						value={type}
						onChange={(e) => setType(e.target.value)}
						variant="outlined"
						style={{ marginBottom: 30 }}
					>
						{types.map((t) => (
							<MenuItem key={t.type} value={t.value}>
								{t.type}
							</MenuItem>
						))}
					</TextField>
					<TextField
						className="input-box"
						style={{ marginBottom: 25 }}
						name="unit"
						label="Enter Number of Questions (1-20)"
						variant="outlined"
						onChange={(e) => {
							dispatch(setUnit(Number(e.target.value)))
							setNumber(e.target.value)
						}}
						value={number}
					/>
					<div className="counting">
						<p className="count">
							text count&nbsp;:&nbsp;{'25000 >'}&nbsp;
							<span style={{ color: wordCount > 25000 ? 'red' : 'black' }}>
								{wordCount}
							</span>{' '}
						</p>
					</div>
					<TextField
						className="input-box"
						style={{ marginBottom: 10 }}
						name="content"
						label="Enter Your Content"
						multiline
						rows={10}
						variant="outlined"
						onChange={handleChange}
						value={userInput}
					/>
					<div className="url">
						<TextField
							className="input-box url-box"
							name="url"
							label="Enter Your URL"
							variant="outlined"
							onChange={handleChange}
						/>
						<LoadingButton
							className="url-button"
							style={{
								backgroundColor: '#0097B3',
								fontSize: 15,
								height: 54,
							}}
							sx={{
								border: activeColor,
								background: 'light' + activeColor,
							}}
							variant="contained"
							size="small"
							loading={crawling}
							onClick={handleCrawl}
						>
							URL
						</LoadingButton>
						<LoadingButton
							className="url-button"
							style={{
								backgroundColor: '#0097B3',
								fontSize: 15,
								height: 54,
							}}
							sx={{
								border: activeColor,
								background: 'light' + activeColor,
							}}
							variant="contained"
							component="label"
							size="small"
							loading={crawling}
						>
							PDF
							<input
								hidden
								type="file"
								onChange={handlePdf}
								accept=".pdf"
							></input>
						</LoadingButton>
					</div>
					<div className="home-controls">
						<LoadingButton
							className="control-button"
							variant="contained"
							color={`${ready ? 'secondary' : 'primary'}`}
							size="large"
							loading={loading}
							onClick={handleSubmit}
						>
							{ready ? 'Clear' : 'Submit'}
						</LoadingButton>
						<LoadingButton
							className="control-button"
							variant="contained"
							component="label"
							color="primary"
							size="large"
							loading={loading}
						>
							UPLOAD
							<input
								hidden
								type="file"
								onChange={handleXlsx}
								accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
							></input>
						</LoadingButton>
						<Button
							className="control-button"
							variant="contained"
							color="primary"
							sx={{
								color: activeColor,
								border: activeColor,
								background: 'light' + activeColor,
							}}
							size="large"
							onClick={ready ? () => navigate('/quiz') : () => {}}
						>
							Practice
						</Button>
						<Button
							className="control-button"
							variant="contained"
							color="primary"
							sx={{
								color: activeColor,
								border: activeColor,
								background: 'light' + activeColor,
							}}
							size="large"
							onClick={ready ? () => createSheet(questions, name) : () => {}}
						>
							Download
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Home
