import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
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
import '../styles/ListPage.css'
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload'
import FilterListIcon from '@mui/icons-material/FilterList'
import { visuallyHidden } from '@mui/utils'
import PropTypes from 'prop-types'
import {
	setQuestions,
	setSubject,
	setSource,
	setUnit,
	setUserId,
	resetScore,
} from '../features/quiz/quizSlice'
import { db } from '../utils/firebaseConfig'
import {
	getDocs,
	collection,
	where,
	query,
	orderBy as orderingBy,
} from 'firebase/firestore'

const headCells = [
	{
		id: 'subject',
		numeric: false,
		disablePadding: true,
		label: 'Subject',
	},
	{
		id: 'type',
		numeric: false,
		disablePadding: false,
		label: 'Type',
	},
	{
		id: 'category',
		numeric: false,
		disablePadding: false,
		label: 'Category',
	},
	{
		id: 'createdAt',
		numeric: false,
		disablePadding: false,
		label: 'CreatedAt',
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
const DEFAULT_ORDER_BY = 'subject'
const DEFAULT_ROWS_PER_PAGE = 10

function EnhancedTableHead(props) {
	const { t } = useTranslation()
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
						checked={rowCount > 0 && numSelected === rowCount}
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
							{t(headCell.label)}
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
	const { t } = useTranslation()
	const { numSelected, uploadSelectedItems } = props

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
				<Typography
					sx={{ flex: '1 1 100%' }}
					variant="h6"
					id="tableTitle"
					component="div"
				>
					{t('My Quiz Group')}
				</Typography>
			)}

			{numSelected > 0 ? (
				<>
					<Tooltip title="Upload">
						<IconButton onClick={uploadSelectedItems}>
							<DriveFolderUploadIcon />
						</IconButton>
					</Tooltip>
				</>
			) : (
				<Tooltip title="Filter list">
					<IconButton>
						<FilterListIcon />
					</IconButton>
				</Tooltip>
			)}
		</Toolbar>
	)
}

EnhancedTableToolbar.propTypes = {
	numSelected: PropTypes.number.isRequired,
	uploadSelectedItems: PropTypes.func.isRequired,
}

export default function EnhancedTable() {
	const { t } = useTranslation()
	const { userId } = useSelector((state) => state.user)
	const { questions, subject, source, unit } = useSelector(
		(state) => state.quiz
	)
	const dispatch = useDispatch()
	const [order, setOrder] = useState(DEFAULT_ORDER)
	const [orderBy, setOrderBy] = useState(DEFAULT_ORDER_BY)
	const [selected, setSelected] = useState([])
	const [page, setPage] = useState(0)
	const [dense, setDense] = useState(false)
	const [visibleRows, setVisibleRows] = useState(null)
	const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE)
	const [paddingHeight, setPaddingHeight] = useState(0)
	const [rows, setRows] = useState([])
	const navigate = useNavigate()
	const multipleChoiceCollectionRef = collection(db, 'multipleChoice')
	const questionGroupCollectionRef = collection(db, 'questionGroup')
	const queryGroup = query(
		questionGroupCollectionRef,
		where('userId', '==', userId),
		orderingBy('createdAt', 'desc')
	)

	useEffect(() => {
		const data = JSON.parse(window.localStorage.getItem('QUESTABLE_QUIZ'))
		dispatch(setQuestions(data.questions))
		dispatch(setUserId(data.userId))
		dispatch(setSubject(data.subject))
		dispatch(setSource(data.source))
		dispatch(setUnit(data.unit))
		async function getQuestionGroup() {
			try {
				const data = await getDocs(queryGroup)
				const retrievedData = data.docs.map((doc) => ({
					...doc.data(),
					id: doc.id,
				}))
				const filteredData = retrievedData.map((doc) => ({
					...doc,
					createdAt: doc.createdAt.toDate(),
				}))
				setRows(filteredData)
				let rowsOnMount = stableSort(
					filteredData,
					getComparator(DEFAULT_ORDER, DEFAULT_ORDER_BY)
				)
				rowsOnMount = rowsOnMount.slice(
					0 * DEFAULT_ROWS_PER_PAGE,
					0 * DEFAULT_ROWS_PER_PAGE + DEFAULT_ROWS_PER_PAGE
				)
				setVisibleRows(rowsOnMount)
			} catch (error) {
				console.log(error)
			}
		}
		getQuestionGroup()
	}, [userId])

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

	const isSelected = (id) => selected.indexOf(id) !== -1

	const uploadSelectedItems = async () => {
		const selectedItems = rows.filter((row) => selected.includes(row.id))
		const promises = selectedItems.map(async (item) => {
			let questionList = []
			const q = query(
				multipleChoiceCollectionRef,
				where('questionGroup', '==', item.id)
			)
			const querySnapshot = await getDocs(q)
			querySnapshot.forEach((doc) =>
				questionList.push({ ...doc.data(), id: doc.id })
			)
			questionList = questionList.map((question) => ({
				...question,
				createdAt: question.createdAt.toDate().toDateString(),
				updatedAt: question.updatedAt.toDate().toDateString(),
			}))

			const addQuiz = await {
				questions: questionList,
				userId: userId,
				subject: item.subject,
				source: item.source,
				unit: questionList.length,
				score: 0,
			}

			console.log(JSON.stringify(addQuiz))
			return addQuiz
		})

		let quizPool = {
			questions: questions,
			userId: userId,
			subject: subject,
			source: source,
			unit: unit,
			score: 0,
		}

		Promise.all(promises).then((promises) => {
			promises.map((promise) => {
				quizPool = {
					questions: [...quizPool.questions, ...promise.questions],
					userId: quizPool.userId,
					subject:
						quizPool.subject?.length > 0
							? quizPool.subject + ' + ' + promise.subject
							: promise.subject,
					source:
						quizPool.source?.length > 0
							? quizPool.source + '\n\n\n' + promise.source
							: promise.source,
					unit: quizPool.unit + promise.unit,
					score: 0,
				}
			})

			dispatch(setQuestions(quizPool.questions))
			dispatch(setUserId(quizPool.userId))
			dispatch(setSubject(quizPool.subject))
			dispatch(setSource(quizPool.source))
			dispatch(setUnit(quizPool.unit))
			dispatch(resetScore())
			window.localStorage.setItem('QUESTABLE_QUIZ', JSON.stringify(quizPool))
			navigate('/currentquiz')
		})
	}

	return (
		<div className="list-page">
			<Box sx={{ width: '100%' }}>
				<Paper sx={{ width: '100%', mb: 2 }}>
					<EnhancedTableToolbar
						numSelected={selected.length}
						uploadSelectedItems={uploadSelectedItems}
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
														{row.subject}
													</TableCell>
													<TableCell align="left">{row.type}</TableCell>
													<TableCell align="left">{row.category}</TableCell>
													<TableCell align="left">
														{row.createdAt.toDateString()}
													</TableCell>
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
				<div className="form-control">
					<FormControlLabel
						sx={{ marginLeft: 0.5 }}
						control={<Switch checked={dense} onChange={handleChangeDense} />}
						label={t('Dense padding')}
					/>
				</div>
			</Box>
		</div>
	)
}
