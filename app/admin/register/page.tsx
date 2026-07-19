'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminRegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.')
      return
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        email: email,
        role: 'admin', // Force admin role for this hidden route
        productivity_score: 0,
        tasks_completed: 0,
        created_at: new Date().toISOString(),
      })
    }

    setLoading(false)
    router.push('/admin/dashboard') // Redirect to admin dashboard
  }

  return (
    <div className="min-h-screen bg-[#F5F5FA] flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] bg-white rounded-[40px] shadow-2xl p-8 md:p-10 border-t-8 border-purple-600">

        {/* TITLE */}
        <h1 className="text-5xl font-bold text-gray-800 mb-3">
          Admin Setup
        </h1>
        <p className="text-gray-500 mb-8 text-lg">
          Create an exclusive admin account for Plotwist.
        </p>

        {/* ERROR */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleRegister} className="space-y-4">

          <input
            type="text"
            placeholder="Admin Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full p-4 rounded-2xl bg-gray-100 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-400"
          />

          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-4 rounded-2xl bg-gray-100 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-4 rounded-2xl bg-gray-100 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-400"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-4 rounded-2xl bg-gray-100 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold text-xl shadow-lg hover:scale-[1.02] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          >
            {loading ? 'Creating Admin...' : 'Register Admin'}
          </button>

        </form>
      </div>
    </div>
  )
}
