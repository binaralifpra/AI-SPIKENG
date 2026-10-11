// Mirrors ai_spikeng_mobile/lib/providers/auth_provider.dart
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../config/firebase'
import { createProfile, createUserData, userDataFromMap } from '../models/userData'

const AuthContext = createContext(null)

async function fetchUserData(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() && snap.data() ? userDataFromMap(snap.data()) : null
  } catch (e) {
    console.error('Error loading user data:', e)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dataReady, setDataReady] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        setUserData(await fetchUserData(firebaseUser.uid))
        setDataReady(true)
      } else {
        setUser(null)
        setUserData(null)
        setDataReady(false)
      }
      setLoading(false)
    })
  }, [])

  const login = useCallback(async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    setUser(result.user)
    setUserData(await fetchUserData(result.user.uid))
    setDataReady(true)
  }, [])

  const signup = useCallback(async (email, password, name, gender) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName: name })

    const newData = createUserData({
      profile: createProfile({ name, email, gender, createdAt: new Date().toISOString() }),
    })
    await setDoc(doc(db, 'users', result.user.uid), newData)
    setUser(result.user)
    setUserData(userDataFromMap(newData))
    setDataReady(true)
  }, [])

  const loginWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const docRef = doc(db, 'users', result.user.uid)
    const snap = await getDoc(docRef)

    if (!snap.exists()) {
      const newData = createUserData({
        profile: createProfile({
          name: result.user.displayName ?? 'User',
          email: result.user.email ?? '',
          gender: 'male',
          createdAt: new Date().toISOString(),
        }),
      })
      await setDoc(docRef, newData)
      setUserData(userDataFromMap(newData))
    } else {
      setUserData(userDataFromMap(snap.data()))
    }

    setUser(result.user)
    setDataReady(true)
  }, [])

  const logout = useCallback(async () => {
    setDataReady(false)
    await signOut(auth)
  }, [])

  const updateUserData = useCallback(async (updates) => {
    const current = auth.currentUser
    if (!current) return
    // Firestore rejects `undefined` values
    const clean = JSON.parse(JSON.stringify(updates))
    await setDoc(doc(db, 'users', current.uid), clean, { merge: true })
    // Reload from Firestore to stay in sync
    setUserData(await fetchUserData(current.uid))
  }, [])

  const value = useMemo(() => ({
    user, userData, loading, dataReady,
    isLoggedIn: !!user,
    login, signup, loginWithGoogle, logout, updateUserData,
  }), [user, userData, loading, dataReady, login, signup, loginWithGoogle, logout, updateUserData])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
