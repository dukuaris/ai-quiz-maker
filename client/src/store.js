import { configureStore } from '@reduxjs/toolkit'
import quizReducer from './features/quiz/quizSlice'
import userReducer from './features/user/userSlice'

export const store = configureStore({
	reducer: {
		quiz: quizReducer,
		user: userReducer,
	},
})
