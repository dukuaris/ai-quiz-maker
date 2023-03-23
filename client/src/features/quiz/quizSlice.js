import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	questions: [],
	name: '',
	unit: 0,
	score: 0,
}

export const quizSlice = createSlice({
	name: 'quiz',
	initialState,
	reducers: {
		setQuestions: (state, action) => {
			state.questions = action.payload
		},
		setName: (state, action) => {
			state.name = action.payload
		},
		setUnit: (state, action) => {
			state.unit = action.payload
		},
		addScore: (state) => {
			state.score += 1
		},
		resetScore: (state) => {
			state.score = 0
		},
	},
})

export const { setQuestions, setName, setUnit, addScore, resetScore } =
	quizSlice.actions

export default quizSlice.reducer
