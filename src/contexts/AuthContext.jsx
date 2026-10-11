import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../config/firebase'

const AuthContext = createContext(null)

const DEFAULT_USER_DATA = {
  cefrLevels: {
    vocabulary: 'A1',
    speaking: 'A1',
    grammar: 'A1',
    listening: 'A1',
    conversation: 'A1',
    overall: null
  },
  dayProgress: {
    vocabulary: { currentDay: 1, lastPlayedDate: null },
    speaking: { currentDay: 1, lastPlayedDate: null },
    grammar: { currentDay: 1, lastPlayedDate: null },
    listening: { currentDay: 1, lastPlayedDate: null },
    conversation: { currentDay: 1, lastPlayedDate: null }
  },
  testCompleted: false,
  calendar: {},
  settings: {
    language: 'hybrid' // 'english' | 'hybrid'
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dataReady, setDataReady] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        await loadUserData(firebaseUser.uid)
        setDataReady(true)
      } else {
        setUser(null)
        setUserData(null)
        setDataReady(false)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function loadUserData(uid) {
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        // Merge with defaults to fill in missing fields
        setUserData({
          ...DEFAULT_USER_DATA,
          ...data,
          settings: { ...DEFAULT_USER_DATA.settings, ...data.settings },
          profile: { ...data.profile }
        })
      } else {
        // No Firestore doc yet (e.g. Google login first time)
        setUserData(null)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setUserData(null)
    }
  }

  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password)
    await loadUserData(result.user.uid)
    setDataReady(true)
    return result.user
  }

  async function signup(email, password, displayName, gender) {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName })

    const newUserData = {
      ...DEFAULT_USER_DATA,
      profile: {
        name: displayName,
        email,
        gender,
        age: '',
        bio: '',
        createdAt: new Date().toISOString()
      }
    }

    await setDoc(doc(db, 'users', result.user.uid), newUserData)
    setUserData(newUserData)
    setDataReady(true)
    return result.user
  }

  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider)
    const docRef = doc(db, 'users', result.user.uid)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      const newUserData = {
        ...DEFAULT_USER_DATA,
        profile: {
          name: result.user.displayName || 'User',
          email: result.user.email,
          gender: 'male',
          age: '',
          bio: '',
          createdAt: new Date().toISOString()
        }
      }
      await setDoc(docRef, newUserData)
      setUserData(newUserData)
    } else {
      const data = docSnap.data()
      setUserData({
        ...DEFAULT_USER_DATA,
        ...data,
        settings: { ...DEFAULT_USER_DATA.settings, ...data.settings },
        profile: { ...data.profile }
      })
    }

    setDataReady(true)
    return result.user
  }

  async function logout() {
    setDataReady(false)
    await signOut(auth)
  }

  // Utility function to remove undefined values safely
  const removeUndefined = (obj) => {
    return JSON.parse(JSON.stringify(obj))
  }

  async function updateUserData(updates) {
    if (!user) return
    
    // Firestore throws an error if undefined is passed
    const cleanUpdates = removeUndefined(updates)
    
    const docRef = doc(db, 'users', user.uid)
    await setDoc(docRef, cleanUpdates, { merge: true })
    
    setUserData(prev => {
      const merged = { ...prev }
      for (const key of Object.keys(cleanUpdates)) {
        if (typeof cleanUpdates[key] === 'object' && cleanUpdates[key] !== null && !Array.isArray(cleanUpdates[key])) {
          merged[key] = { ...(prev?.[key] || {}), ...cleanUpdates[key] }
        } else {
          merged[key] = cleanUpdates[key]
        }
      }
      return merged
    })
  }

  const value = {
    user,
    userData,
    loading,
    dataReady,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateUserData,
    loadUserData: () => user && loadUserData(user.uid)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
