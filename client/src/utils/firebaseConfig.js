// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import {
	getAuth,
	GoogleAuthProvider,
	FacebookAuthProvider,
} from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

const {
	VITE_FIREBASE_API_KEY,
	VITE_FIREBASE_AUTH_DOMAIN,
	VITE_FIREBASE_PROJECT_ID,
	VITE_FIREBASE_STORAGE_BUCKET,
	VITE_FIREBASE_SENDER_ID,
	VITE_FIREBASE_APP_ID,
	VITE_FIREBASE_MEASUREMENT_ID,
} = import.meta.env
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: VITE_FIREBASE_API_KEY,
	authDomain: VITE_FIREBASE_AUTH_DOMAIN,
	projectId: VITE_FIREBASE_PROJECT_ID,
	storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: VITE_FIREBASE_SENDER_ID,
	appId: VITE_FIREBASE_APP_ID,
	measurementId: VITE_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const facebookProvider = new FacebookAuthProvider()
