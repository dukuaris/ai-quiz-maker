import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
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
import PropTypes from 'prop-types'

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
		disablePadding: true,
		label: 'Subject',
	},
	{
		id: 'type',
		numeric: false,
		disablePadding: true,
		label: 'Type',
	},
	{
		id: 'difficulty',
		numeric: false,
		disablePadding: true,
		label: 'Difficulty',
	},
]

const DEFAULT_ORDER = 'asc'
const DEFAULT_ORDER_BY = 'calories'
const DEFAULT_ROWS_PER_PAGE = 5

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
	const { numSelected } = props

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
					Current Content
				</Typography>
			)}

			{numSelected > 0 ? (
				<Tooltip title="Delete">
					<IconButton>
						<DeleteIcon />
					</IconButton>
				</Tooltip>
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
}

export default function EnhancedTable() {
	let rows = []
	const [data, setData] = useState([])
	const [order, setOrder] = useState(DEFAULT_ORDER)
	const [orderBy, setOrderBy] = useState(DEFAULT_ORDER_BY)
	const [selected, setSelected] = useState([])
	const [page, setPage] = useState(0)
	const [dense, setDense] = useState(false)
	const [visibleRows, setVisibleRows] = useState(null)
	const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE)
	const [paddingHeight, setPaddingHeight] = useState(0)

	const getQuestions = () => {
		const result = JSON.parse(window.localStorage.getItem('QUESTABLE_QUIZ'))
		const questionList = result.questions.map((question) => ({
			question: question.question,
			subject: result.subject,
			difficulty: question.difficulty,
			type: question.type,
			category: question.category,
			correct_answer: question.correct_answer,
			incorrect_answers: question.incorrect_answers,
			source: question.source,
		}))
		return questionList
	}

	useEffect(() => {
		rows = getQuestions()
		setData(rows)
		let rowsOnMount = stableSort(
			rows,
			getComparator(DEFAULT_ORDER, DEFAULT_ORDER_BY)
		)

		rowsOnMount = rowsOnMount.slice(
			0 * DEFAULT_ROWS_PER_PAGE,
			0 * DEFAULT_ROWS_PER_PAGE + DEFAULT_ROWS_PER_PAGE
		)

		setVisibleRows(rowsOnMount)
	}, [])

	const handleRequestSort = useCallback(
		(event, newOrderBy) => {
			const isAsc = orderBy === newOrderBy && order === 'asc'
			const toggledOrder = isAsc ? 'desc' : 'asc'
			setOrder(toggledOrder)
			setOrderBy(newOrderBy)
			const sortedRows = stableSort(
				data,
				getComparator(toggledOrder, newOrderBy)
			)
			console.log(sortedRows)
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
			const newSelected = data.map((n) => n.question)
			console.log(newSelected)
			setSelected(newSelected)
			return
		}
		setSelected([])
	}

	const handleClick = (event, name) => {
		const selectedIndex = selected.indexOf(name)
		let newSelected = []

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, name)
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
				newPage > 0 ? Math.max(0, (1 + newPage) * rowsPerPage - data.length) : 0

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

	const isSelected = (name) => selected.indexOf(name) !== -1

	return (
		<Box sx={{ width: '100%' }}>
			<Paper sx={{ width: '100%', mb: 2 }}>
				<EnhancedTableToolbar numSelected={selected.length} />
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
							rowCount={data.length}
						/>
						<TableBody>
							{visibleRows
								? visibleRows.map((row, index) => {
										const isItemSelected = isSelected(row.question)
										const labelId = `enhanced-table-checkbox-${index}`

										return (
											<TableRow
												hover
												onClick={(event) => handleClick(event, row.question)}
												role="checkbox"
												aria-checked={isItemSelected}
												tabIndex={-1}
												key={row.question}
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
					count={data.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</Paper>
			<FormControlLabel
				control={<Switch checked={dense} onChange={handleChangeDense} />}
				label="Dense padding"
			/>
		</Box>
	)
}
