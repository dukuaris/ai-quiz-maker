import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Button, TextField, MenuItem } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { v4 as uuidv4 } from 'uuid'
import { useTranslation } from 'react-i18next'

import {
	setQuestions,
	setSubject,
	setSource,
	setUnit,
	resetScore,
} from '../features/quiz/quizSlice'
import { useDispatch, useSelector } from 'react-redux'

import ErrorMessages from '../components/ErrorMessages'
import types from '../data/types.js'
import '../styles/Home.css'
import createSheet, { readSheet } from '../utils/createSheet'
import 'https://npmcdn.com/pdfjs-dist/build/pdf.js'
pdfjsLib.GlobalWorkerOptions.workerSrc =
	'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.5.141/build/pdf.worker.min.js'

const Home = () => {
	const { t } = useTranslation()
	const { questions, subject, source } = useSelector((state) => state.quiz)
	const { userId } = useSelector((state) => state.user)
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [title, setTitle] = useState('')
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
	const [ready, setReady] = useState(null)
	const [activeColor, setActiveColor] = useState('')

	const typeList = [
		'multiple-choice',
		'true-false',
		'fill-in-the-blank',
		'matching',
	]
	const serverAddress = 'https://ai-quiz-maker.onrender.com'
	// https://ai-quiz-maker.onrender.com
	// http://localhost:5001

	useEffect(() => {
		const data = JSON.parse(window.localStorage.getItem('QUESTABLE_QUIZ'))
		if (data?.questions?.length > 0) {
			setReady(true)
			dispatch(setSubject(data.subject))
			dispatch(setSource(data.source))
			dispatch(setQuestions(data.questions))
			setTitle(data.subject)
			setType(typeList.indexOf(data.questions[0].type))
			setNumber(data.unit)
			setUserInput(data.source)
			setForm({ ...form, content: data.source })
			setWordCount(data.source.length)
		} else {
			const initialState = {
				questions: [],
				userId: null,
				subject: '',
				source: '',
				unit: 0,
				score: 0,
			}
			window.localStorage.setItem(
				'QUESTABLE_QUIZ',
				JSON.stringify(initialState)
			)
			setReady(false)
		}
	}, [])

	useEffect(() => {
		if (!ready) {
			setActiveColor('grey')
		} else {
			setActiveColor('')
		}
	}, [ready])

	// console.log(userId, email)
	const getContent = async (file, callbackAllDone) => {
		let complete = 0
		const loadingTask = pdfjsLib.getDocument(file)
		loadingTask.promise.then((pdf) => {
			let total = pdf._pdfInfo.numPages
			let layers = {}
			for (let i = 1; i <= total; i++) {
				pdf.getPage(i).then((page) => {
					let n = page.pageNumber
					page.getTextContent().then((textContent) => {
						if (null != textContent.items) {
							let page_text = ''
							let last_block = null
							for (let k = 0; k < textContent.items.length; k++) {
								let block = textContent.items[k]
								if (
									last_block != null &&
									last_block.str[last_block.str.length - 1] != ' '
								) {
									if (block.x < last_block.x) page_text += '\r\n'
									else if (
										last_block.y != block.y &&
										last_block.str.match(/^(\s?[a-zA-Z])$|^(.+\s[a-zA-Z])$/) ==
											null
									)
										page_text += ' '
								}
								page_text += block.str
								last_block = block
							}

							textContent != null && console.log('page ' + n + ' finished.') //" content: \n" + page_text);
							layers[n] = page_text + '\n\n'
						}
						++complete
						if (complete == total) {
							window.setTimeout(function () {
								var full_text = ''
								var num_pages = Object.keys(layers).length
								for (var j = 1; j <= num_pages; j++) full_text += layers[j]
								callbackAllDone(full_text)
							}, 1000)
						}
					})
				})
			}
		})
	}

	const handleSubmit = async () => {
		if (ready) {
			dispatch(resetScore())
			dispatch(setUnit(0))
			dispatch(setQuestions([]))
			dispatch(setSubject(''))
			dispatch(setSource(''))
			window.localStorage.setItem('QUESTABLE_QUIZ', JSON.stringify([]))
			setReady(false)
			window.location.reload(false)
		} else {
			if (!title || number < 1) {
				setError(true)
				return
			}

			if (form.content) {
				setError(false)
				setLoading(true)
				try {
					const response = await fetch(serverAddress, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							content: form.content,
							unit: number,
							type: type,
						}),
					})

					const data = await response.json()
					if (data.results !== undefined) {
						const dataResults = data.results.map((result) => ({
							...result,
							subject: title,
							id: uuidv4(),
						}))
						dispatch(setQuestions(dataResults))
						dispatch(setSubject(title))
						dispatch(setSource(form.content))
						setNumber(dataResults.length)
						const exam = {
							questions: dataResults,
							userId: userId,
							subject: title,
							source: form.content,
							unit: dataResults.length,
							score: 0,
						}
						window.localStorage.setItem('QUESTABLE_QUIZ', JSON.stringify(exam))
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
		const fileName = file.name.split('.')[0]
		setTitle(fileName)
		let fileReader = new FileReader()
		fileReader.onload = () => {
			setLoading(true)
			setReady(true)
			readSheet(fileReader.result, null, (data) => {
				setType(typeList.indexOf(data.questions[0].type))
				setNumber(data.questions.length)
				setUserInput(data.source)
				dispatch(setQuestions(data.questions))
				dispatch(setSubject(fileName))
				dispatch(setSource(data.source))
				dispatch(setUnit(data.questions.length))
				const exam = {
					questions: data.questions,
					userId: userId,
					subject: fileName,
					source: data.source,
					unit: data.questions.length,
					score: 0,
				}
				window.localStorage.setItem('QUESTABLE_QUIZ', JSON.stringify(exam))
				setError(false)
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
		let fileReader = new FileReader()
		fileReader.onload = () => {
			setCrawling(true)
			getContent(fileReader.result, (text) => {
				setUserInput(text)
				setForm({ ...form, content: text })
				setWordCount(text.length)
				setCrawling(false)
			})
		}
		try {
			fileReader.readAsDataURL(file)
		} catch (error) {
			alert('Please provide proper pdf document.')
		}
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
				<p style={{ fontSize: 24 }}>{t('Create Your Quiz')}</p>
				{/* <div className="warning-message">
					* 2000글자 10문제 기준 평균 50초 소요. 모바일사용시 자동잠금 해제 요망
				</div> */}
				<div className="settings__select">
					{error && (
						<ErrorMessages>{t('Please Fill all the fields')}</ErrorMessages>
					)}
					<TextField
						className="input-box"
						style={{ marginBottom: 25 }}
						name="subject"
						label={t('Enter Your Subject')}
						variant="outlined"
						onChange={(e) => {
							setTitle(e.target.value)
						}}
						value={title}
					/>
					<TextField
						className="input-box"
						select
						label={t('Select Quiz Type')}
						value={type}
						onChange={(e) => setType(e.target.value)}
						variant="outlined"
						style={{ marginBottom: 30 }}
					>
						{types.map((cat) => (
							<MenuItem key={cat.type} value={cat.value}>
								{t(cat.type)}
							</MenuItem>
						))}
					</TextField>
					<TextField
						className="input-box"
						style={{ marginBottom: 25 }}
						name="unit"
						label={t('Enter Number of Questions (< 50)')}
						variant="outlined"
						onChange={(e) => {
							setNumber(e.target.value)
						}}
						value={number}
					/>
					<div className="counting">
						<p className="count">
							{t('text count')}&nbsp;:&nbsp;{'25000 >'}&nbsp;
							<span style={{ color: wordCount > 25000 ? 'red' : 'black' }}>
								{wordCount}
							</span>{' '}
						</p>
					</div>
					<TextField
						className="input-box"
						style={{ marginBottom: 10 }}
						name="content"
						label={t('Enter Your Content')}
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
							label={t('Enter Your URL')}
							variant="outlined"
							onChange={handleChange}
						/>
						<LoadingButton
							className="url-button"
							style={{
								backgroundColor: '#0097B3',
								height: 54,
							}}
							sx={{
								border: activeColor,
								background: 'light' + activeColor,
							}}
							variant="contained"
							loading={crawling}
							onClick={handleCrawl}
						>
							URL
						</LoadingButton>
						<LoadingButton
							className="url-button"
							style={{
								backgroundColor: '#0097B3',
								height: 54,
							}}
							sx={{
								border: activeColor,
								background: 'light' + activeColor,
							}}
							variant="contained"
							component="label"
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
							loading={loading}
							onClick={handleSubmit}
							size="small"
						>
							{ready ? t('Clear') : t('Submit')}
						</LoadingButton>
						<LoadingButton
							className="control-button"
							variant="contained"
							component="label"
							color="primary"
							loading={loading}
							size="small"
						>
							{t('UPLOAD')}
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
							onClick={
								ready
									? () => {
											navigate('/quiz')
									  }
									: () => {}
							}
							size="small"
						>
							{t('PRACTICE')}
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
							onClick={
								ready ? () => createSheet(questions, subject, source) : () => {}
							}
							size="small"
						>
							{t('DOWNLOAD')}
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Home
