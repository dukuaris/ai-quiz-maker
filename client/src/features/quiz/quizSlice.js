import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	questions: [],
	userId: null,
	subject: '',
	unit: 0,
	score: 0,
}

export const quizSlice = createSlice({
	name: 'quiz',
	initialState,
	reducers: {
		setUserId: (state, action) => {
			state.userId = action.payload
		},
		setQuestions: (state, action) => {
			state.questions = action.payload
		},
		setSubject: (state, action) => {
			state.subject = action.payload
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

export const { setQuestions, setSubject, setUnit, addScore, resetScore } =
	quizSlice.actions

export default quizSlice.reducer
