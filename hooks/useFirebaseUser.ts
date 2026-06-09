import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'

export interface FirebaseUserData {
  userId: string
  level: number
  xp: number
  tasks: string[]
  badges: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

const getDefaultUserData = (userId: string): FirebaseUserData => ({
  userId,
  level: 0,
  xp: 0,
  tasks: [],
  badges: [],
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
})

interface State {
  userData: FirebaseUserData | null
  loading: boolean
  isNewUser: boolean
  error: string | null
}

export function useFirebaseUser(userId: string | null): State {
  const [state, setState] = useState<State>({
    userData: null,
    loading: true,
    isNewUser: false,
    error: null,
  })

  useEffect(() => {
    if (!userId) {
      setState({ userData: null, loading: false, isNewUser: false, error: null })
      return
    }

    const userRef = doc(db, 'users', userId)

    const initUser = async () => {
      try {
        const snap = await getDoc(userRef)
        if (!snap.exists()) {
          await setDoc(userRef, getDefaultUserData(userId))
          setState(prev => ({ ...prev, isNewUser: true }))
        }
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: 'Gagal inisialisasi data user',
          loading: false,
        }))
      }
    }

    initUser()

    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        setState(prev => ({
          ...prev,
          userData: snap.exists() ? (snap.data() as FirebaseUserData) : null,
          loading: false,
        }))
      },
      (err) => setState(prev => ({ ...prev, error: err.message, loading: false }))
    )

    return () => unsubscribe()
  }, [userId])

  return state
}