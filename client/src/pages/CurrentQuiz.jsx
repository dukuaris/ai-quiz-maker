import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import '../styles/ListPage.css'
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
	TextField,
	InputAdornment,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined'
import { visuallyHidden } from '@mui/utils'
import PropTypes from 'prop-types'
import {
	setQuestions,
	setSubject,
	setSource,
	setUnit,
	resetScore,
} from '../features/quiz/quizSlice'
import { db } from '../utils/firebaseConfig'
import {
	getDocs,
	collection,
	addDoc,
	query,
	orderBy as orderingBy,
	limit,
	where,
} from 'firebase/firestore'

const headCells = [
	{
		id: 'question',
		numeric: false,
		disablePadding: true,
		label: 'Question',
	},
	{
		id: 'subject',
		numeric: false,
		disablePadding: false,
		label: 'Subject',
	},
	{
		id: 'type',
		numeric: false,
		disablePadding: false,
		label: 'Type',
	},
	{
		id: 'difficulty',
		numeric: false,
		disablePadding: false,
		label: 'Difficulty',
	},
]

function descendingComparator(a, b, orderBy) {
	if (b[orderBy] < a[orderBy]) {
		return -1
	}
	if (b[orderBy] > a[orderBy]) {
		return 1
	}
	return 0
}

function getComparator(order, orderBy) {
	return order === 'desc'
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy)
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort(array, comparator) {
	const stabilizedThis = array.map((el, index) => [el, index])
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0])
		if (order !== 0) {
			return order
		}
		return a[1] - b[1]
	})
	return stabilizedThis.map((el) => el[0])
}

const DEFAULT_ORDER = 'asc'
const DEFAULT_ORDER_BY = 'question'
const DEFAULT_ROWS_PER_PAGE = 10

function EnhancedTableHead(props) {
	const {
		onSelectAllClick,
		order,
		orderBy,
		numSelected,
		rowCount,
		onRequestSort,
	} = props
	const createSortHandler = (newOrderBy) => (event) => {
		onRequestSort(event, newOrderBy)
	}

	return (
		<TableHead>
			<TableRow>
				<TableCell padding="checkbox">
					<Checkbox
						color="primary"
						indeterminate={numSelected > 0 && numSelected < rowCount}
						checked={
							rowCount > 0 && numSelected === rowCount && numSelected !== 0
						}
						onChange={onSelectAllClick}
						inputProps={{
							'aria-label': 'select all desserts',
						}}
					/>
				</TableCell>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? 'right' : 'left'}
						padding={headCell.disablePadding ? 'none' : 'normal'}
						sortDirection={orderBy === headCell.id ? order : false}
					>
						<TableSortLabel
							active={orderBy === headCell.id}
							direction={orderBy === headCell.id ? order : 'asc'}
							onClick={createSortHandler(headCell.id)}
						>
							{headCell.label}
							{orderBy === headCell.id ? (
								<Box component="span" sx={visuallyHidden}>
									{order === 'desc' ? 'sorted descending' : 'sorted ascending'}
								</Box>
							) : null}
						</TableSortLabel>
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	)
}

EnhancedTableHead.propTypes = {
	numSelected: PropTypes.number.isRequired,
	onRequestSort: PropTypes.func.isRequired,
	onSelectAllClick: PropTypes.func.isRequired,
	order: PropTypes.oneOf(['asc', 'desc']).isRequired,
	orderBy: PropTypes.string.isRequired,
	rowCount: PropTypes.number.isRequired,
}

function EnhancedTableToolbar(props) {
	const {
		numSelected,
		deleteSelectedItems,
		saveSelectedItems,
		subject,
		source,
	} = props
	const { userId } = useSelector((state) => state.user)
	const [title, setTitle] = useState('')
	const dispatch = useDispatch()

	useEffect(() => {
		setTitle(subject)
	}, [subject])

	const resetSubject = () => {
		let questionData = JSON.parse(window.localStorage.getItem('QUESTABLE_QUIZ'))
		const questionsWithNewSubject = questionData.questions.map((question) => ({
			...question,
			subject: title,
		}))
		questionData = {
			questions: questionsWithNewSubject,
			userId: userId,
			subject: title,
			source: source,
			unit: questionsWithNewSubject.length,
			score: 0,
		}
		window.localStorage.setItem('QUESTABLE_QUIZ', JSON.stringify(questionData))
		dispatch(setQuestions(questionsWithNewSubject))
		dispatch(setSubject(title))
	}

	return (
		<Toolbar
			sx={{
				pl: { sm: 2 },
				pr: { xs: 1, sm: 1 },
				...(numSelected > 0 && {
					bgcolor: (theme) =>
						alpha(
							theme.palette.primary.main,
							theme.palette.action.activatedOpacity
						),
				}),
			}}
		>
			{numSelected > 0 ? (
				<Typography
					sx={{ flex: '1 1 100%' }}
					color="inherit"
					variant="subtitle1"
					component="div"
				>
					{numSelected} selected
				</Typography>
			) : (
				<>
					<TextField
						id="tableTitle"
						name="subject"
						variant="standard"
						fullWidth
						sx={{
							'& #tableTitle': {
								fontSize: '1.5rem',
								fontWeight: 'bold',
							},
						}}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<ChangeCircleOutlinedIcon
										sx={{ marginRight: 1, cursor: 'pointer' }}
										onClick={resetSubject}
									/>
								</InputAdornment>
							),
						}}
						onChange={(e) => {
							setTitle(e.target.value)
						}}
						value={title}
					/>
				</>
			)}

			{numSelected > 0 && (
				<>
					<Tooltip title="Save">
						<IconButton onClick={saveSelectedItems}>
							<SaveIcon />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete">
						<IconButton onClick={deleteSelectedItems}>
							<DeleteIcon />
						</IconButton>
					</Tooltip>
				</>
			)}
		</Toolbar>
	)
}

EnhancedTableToolbar.propTypes = {
	numSelected: PropTypes.number.isRequired,
	deleteSelectedItems: PropTypes.func.isRequired,
	saveSelectedItems: PropTypes.func.isRequired,
	subject: PropTypes.string.isRequired,
	source: PropTypes.string.isRequired,
}

export default function EnhancedTable() {
	const { userId } = useSelector((state) => state.user)
	const { questions } = useSelector((state) => state.quiz)
	const dispatch = useDispatch()
	const [order, setOrder] = useState(DEFAULT_ORDER)
	const [orderBy, setOrderBy] = useState(DEFAULT_ORDER_BY)
	const [selected, setSelected] = useState([])
	const [page, setPage] = useState(0)
	const [dense, setDense] = useState(false)
	const [visibleRows, setVisibleRows] = useState(null)
	const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE)
	const [paddingHeight, setPaddingHeight] = useState(0)
	const multipleChoiceCollectionRef = collection(db, 'multipleChoice')
	const questionGroupCollectionRef = collection(db, 'questionGroup')
	const questionData = JSON.parse(window.localStorage.getItem('QUESTABLE_QUIZ'))
	const rows = questionData.questions
	const subject = questionData.subject
	const source = questionData.source

	useEffect(() => {
		let rowsOnMount = stableSort(
			rows,
			getComparator(DEFAULT_ORDER, DEFAULT_ORDER_BY)
		)

		rowsOnMount = rowsOnMount.slice(
			0 * DEFAULT_ROWS_PER_PAGE,
			0 * DEFAULT_ROWS_PER_PAGE + DEFAULT_ROWS_PER_PAGE
		)

		setVisibleRows(rowsOnMount)
	}, [questions, subject])

	const handleRequestSort = useCallback(
		(event, newOrderBy) => {
			const isAsc = orderBy === newOrderBy && order === 'asc'
			const toggledOrder = isAsc ? 'desc' : 'asc'
			setOrder(toggledOrder)
			setOrderBy(newOrderBy)

			const sortedRows = stableSort(
				rows,
				getComparator(toggledOrder, newOrderBy)
			)
			const updatedRows = sortedRows.slice(
				page * rowsPerPage,
				page * rowsPerPage + rowsPerPage
			)

			setVisibleRows(updatedRows)
		},
		[order, orderBy, page, rowsPerPage]
	)

	const handleSelectAllClick = (event) => {
		if (event.target.checked) {
			const newSelected = rows.map((n) => n.id)
			setSelected(newSelected)
			return
		}
		setSelected([])
	}

	const handleClick = (event, id) => {
		const selectedIndex = selected.indexOf(id)
		let newSelected = []

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, id)
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1))
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1))
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(
				selected.slice(0, selectedIndex),
				selected.slice(selectedIndex + 1)
			)
		}

		setSelected(newSelected)
	}

	const handleChangePage = useCallback(
		(event, newPage) => {
			setPage(newPage)

			const sortedRows = stableSort(rows, getComparator(order, orderBy))
			const updatedRows = sortedRows.slice(
				newPage * rowsPerPage,
				newPage * rowsPerPage + rowsPerPage
			)

			setVisibleRows(updatedRows)

			// Avoid a layout jump when reaching the last page with empty rows.
			const numEmptyRows =
				newPage > 0 ? Math.max(0, (1 + newPage) * rowsPerPage - rows.length) : 0

			const newPaddingHeight = (dense ? 33 : 53) * numEmptyRows
			setPaddingHeight(newPaddingHeight)
		},
		[order, orderBy, dense, rowsPerPage]
	)

	const handleChangeRowsPerPage = useCallback(
		(event) => {
			const updatedRowsPerPage = parseInt(event.target.value, 10)
			setRowsPerPage(updatedRowsPerPage)

			setPage(0)

			const sortedRows = stableSort(rows, getComparator(order, orderBy))
			const updatedRows = sortedRows.slice(
				0 * updatedRowsPerPage,
				0 * updatedRowsPerPage + updatedRowsPerPage
			)

			setVisibleRows(updatedRows)

			// There is no layout jump to handle on the first page.
			setPaddingHeight(0)
		},
		[order, orderBy]
	)

	const handleChangeDense = (event) => {
		setDense(event.target.checked)
	}

	const isSelected = (question) => selected.indexOf(question) !== -1

	const saveSelectedItems = async () => {
		let questionList = []
		const selectedItems = rows.filter((row) => selected.includes(row.id))
		try {
			const createdAt = new Date()
			await addDoc(questionGroupCollectionRef, {
				category: selectedItems[0].category,
				createdAt: createdAt,
				source: source,
				subject: subject,
				type: selectedItems[0].type,
				userId: userId,
			})

			const q = query(
				questionGroupCollectionRef,
				where('userId', '==', userId),
				orderingBy('createdAt', 'desc'),
				limit(1)
			)
			const querySnapshot = await getDocs(q)
			const questionGroupId = querySnapshot.docs[0].id

			await selectedItems.map(async (question) => {
				await addDoc(multipleChoiceCollectionRef, {
					category: question.category,
					correct_answer: question.correct_answer,
					createdAt: createdAt,
					incorrect_answers: question.incorrect_answers,
					play: 5,
					question: question.question,
					questionGroup: questionGroupId,
					score: 3,
					subject: subject,
					type: question.type,
					difficulty: question.difficulty,
					updatedAt: createdAt,
					userId: userId,
				})
			})

			setSelected([])
		} catch (error) {
			console.log(error)
		}
	}

	const deleteSelectedItems = () => {
		const unselected = rows.filter((row) => !selected.includes(row.id))
		if (unselected.length < 1) {
			dispatch(setSubject(''))
			dispatch(setSource(''))
			dispatch(setUnit(0))
			dispatch(resetScore())
			setSelected([])
		}
		dispatch(setQuestions(unselected))
		const data = JSON.parse(window.localStorage.getItem('QUESTABLE_QUIZ'))
		let exam = {}
		if (unselected.length < 1) {
			exam = {
				questions: [],
				userId: userId,
				subject: '',
				source: '',
				unit: 0,
				score: 0,
			}
		} else {
			exam = { ...data, questions: unselected, unit: unselected.length }
		}
		window.localStorage.setItem('QUESTABLE_QUIZ', JSON.stringify(exam))
	}

	return (
		<div className="list-page">
			<Box sx={{ width: '100%' }}>
				<Paper sx={{ width: '100%', mb: 2 }}>
					<EnhancedTableToolbar
						numSelected={selected.length}
						deleteSelectedItems={deleteSelectedItems}
						saveSelectedItems={saveSelectedItems}
						subject={subject}
						source={source}
					/>
					<TableContainer>
						<Table
							sx={{ minWidth: 750 }}
							aria-labelledby="tableTitle"
							size={dense ? 'small' : 'medium'}
						>
							<EnhancedTableHead
								numSelected={selected.length}
								order={order}
								orderBy={orderBy}
								onSelectAllClick={handleSelectAllClick}
								onRequestSort={handleRequestSort}
								rowCount={rows.length}
							/>
							<TableBody>
								{visibleRows
									? visibleRows.map((row, index) => {
											const isItemSelected = isSelected(row.id)
											const labelId = `enhanced-table-checkbox-${index}`

											return (
												<TableRow
													hover
													onClick={(event) => handleClick(event, row.id)}
													role="checkbox"
													aria-checked={isItemSelected}
													tabIndex={-1}
													key={row.id}
													selected={isItemSelected}
													sx={{ cursor: 'pointer' }}
												>
													<TableCell padding="checkbox">
														<Checkbox
															color="primary"
															checked={isItemSelected}
															inputProps={{
																'aria-labelledby': labelId,
															}}
														/>
													</TableCell>
													<TableCell
														component="th"
														id={labelId}
														scope="row"
														padding="none"
													>
														{row.question}
													</TableCell>
													<TableCell align="left">{row.subject}</TableCell>
													<TableCell align="left">{row.type}</TableCell>
													<TableCell align="left">{row.difficulty}</TableCell>
												</TableRow>
											)
									  })
									: null}
								{paddingHeight > 0 && (
									<TableRow
										style={{
											height: paddingHeight,
										}}
									>
										<TableCell colSpan={6} />
									</TableRow>
								)}
							</TableBody>
						</Table>
					</TableContainer>
					<TablePagination
						rowsPerPageOptions={[5, 10, 25]}
						component="div"
						count={rows.length}
						rowsPerPage={rowsPerPage}
						page={!rows || rows.length <= 0 ? 0 : page}
						onPageChange={handleChangePage}
						onRowsPerPageChange={handleChangeRowsPerPage}
					/>
				</Paper>
				<FormControlLabel
					sx={{ marginLeft: 0.5 }}
					control={<Switch checked={dense} onChange={handleChangeDense} />}
					label="Dense padding"
				/>
			</Box>
		</div>
	)
}
