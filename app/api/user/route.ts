import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// GET — ambil data user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 })
  }

  try {
    const userRef = adminDb.collection('users').doc(userId)
    const snap = await userRef.get()

    if (!snap.exists) {
      // User baru — buat data default
      const defaultData = {
        userId,
        level: 0,
        xp: 0,
        tasks: [],
        badges: [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }
      await userRef.set(defaultData)
      return NextResponse.json({ data: defaultData, isNewUser: true })
    }

    return NextResponse.json({ data: snap.data(), isNewUser: false })
  } catch (err) {
    return NextResponse.json({ error: 'Gagal ambil data user' }, { status: 500 })
  }
}

// POST — update data user
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, ...updateData } = body

  if (!userId) {
    return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 })
  }

  try {
    const userRef = adminDb.collection('users').doc(userId)
    await userRef.update({
      ...updateData,
      updatedAt: FieldValue.serverTimestamp(),
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Gagal update data user' }, { status: 500 })
  }
}