'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaGoogle, FaGithub, FaFacebook } from 'react-icons/fa'
import { signIn, useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // ✅ Handle Google/Github/Facebook login via NextAuth
  // Setelah redirect balik ke app, init data Firebase pakai email sebagai ID
  useEffect(() => {
    if (session?.user?.email) {
      const userId = session.user.email.replace(/[^a-zA-Z0-9]/g, '_')
      fetch(`/api/user?userId=${userId}`)
    }
  }, [session])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        setError('Email belum terdaftar atau password salah. Silakan daftar terlebih dahulu.')
      } else {
        setError(signInError.message)
      }
      setLoading(false)
      return
    }

    // ✅ Init/ambil data Firebase pakai Supabase user.id
    if (data.user) {
      await fetch(`/api/user?userId=${data.user.id}`)
    }

    setLoading(false)
    router.push('/dashboard')
  }

  const handleGoogleLogin = async () => {
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  const handleGithubLogin = async () => {
    await signIn('github', { callbackUrl: '/dashboard' })
  }

  const handleFacebookLogin = async () => {
    await signIn('facebook', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen bg-[#F5F5FA] flex items-center justify-center p-6">
      <div className="w-full max-w-[1100px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* LEFT SIDE */}
        <div className="w-full md:w-1/2 relative bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-400 p-8 md:p-12 flex flex-col justify-between overflow-hidden min-h-[280px] md:min-h-[650px]">
          <div className="absolute -top-24 -left-24 w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 text-white">
            <h1 className="text-6xl font-extrabold mb-6">Plotwist</h1>
            <p className="text-xl leading-relaxed opacity-90">
              Productivity website for students.
              <br />
              Manage your study journey smarter.
            </p>
          </div>
         <div className="relative z-10 flex justify-center items-end mt-auto self-end w-full">
  <Image
    src="https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/maskot3.png"
    alt="Plotwist Mascot"
    width={430}
    height={430}
    priority
    className="object-contain object-bottom drop-shadow-2xl w-[180px] md:w-[430px] h-auto translate-y-8"
  />
</div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white overflow-y-auto">
          <div className="w-[80%] py-8">

            <h2 className="text-5xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-500 mb-8 text-lg">Login to continue your productivity journey.</p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                {error}
                {error.includes('daftar') && (
                  <div className="mt-2">
                    <Link href="/register" className="text-purple-600 font-bold underline">
                      Daftar sekarang →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 rounded-2xl bg-gray-100 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 rounded-2xl bg-gray-100 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input type="checkbox" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-purple-500 hover:text-pink-500 transition font-medium">
                  Forgot Password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xl shadow-lg hover:scale-[1.02] transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-[1px] bg-gray-200"></div>
              <span className="text-gray-400 text-sm">Or continue with</span>
              <div className="flex-1 h-[1px] bg-gray-200"></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-3 p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition">
                <FaGoogle className="text-red-500 text-xl" />
                <span className="font-medium text-gray-700">Google</span>
              </button>
              <button onClick={handleGithubLogin} className="flex items-center justify-center gap-3 p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition">
                <FaGithub className="text-black text-xl" />
                <span className="font-medium text-gray-700">Github</span>
              </button>
              <button onClick={handleFacebookLogin} className="flex items-center justify-center gap-3 p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition">
                <FaFacebook className="text-blue-500 text-xl" />
                <span className="font-medium text-gray-700">Facebook</span>
              </button>
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-500 text-lg">Don&apos;t have an account?</p>
              <Link href="/register" className="inline-block mt-3 px-8 py-3 rounded-2xl bg-purple-100 text-purple-600 font-bold hover:bg-purple-200 transition">
                Create Account
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}