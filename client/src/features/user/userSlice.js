import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	userId: null,
	email: '',
	image: null,
}

export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setUserId: (state, action) => {
			state.userId = action.payload
		},
		setEmail: (state, action) => {
			state.email = action.payload
		},
		setImage: (state, action) => {
			state.image = action.payload
		},
	},
})

export const { setUserId, setEmail, setImage } = userSlice.actions

export default userSlice.reducer
