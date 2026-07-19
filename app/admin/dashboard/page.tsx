'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  productivity_score: number
  tasks_completed: number
  created_at: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !sessionData.session) {
          router.push('/login')
          return
        }

        const user = sessionData.session.user
        
        // Fetch current user's profile to check if they are admin
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
          
        if (profileError || userProfile?.role !== 'admin') {
          router.push('/dashboard') // Not an admin, redirect to normal dashboard
          return
        }

        // Fetch all profiles
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (allProfilesError) {
          setError(allProfilesError.message)
        } else {
          setProfiles(allProfiles || [])
        }
      } catch (err) {
        console.error(err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndFetchData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5FA] flex items-center justify-center">
        <div className="text-xl font-bold text-gray-500 animate-pulse">Loading Admin Dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5FA] p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">Manage all Plotwist users</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-white text-purple-600 rounded-xl shadow-sm hover:shadow-md transition font-semibold"
          >
            Back to My App
          </button>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
            {error} (Note: You might need to adjust Row Level Security in Supabase to allow admins to read all profiles)
          </div>
        )}

        <div className="bg-white rounded-[32px] shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                  <th className="p-5 font-semibold">User</th>
                  <th className="p-5 font-semibold">Role</th>
                  <th className="p-5 font-semibold">Score</th>
                  <th className="p-5 font-semibold">Tasks Done</th>
                  <th className="p-5 font-semibold">Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="p-5">
                      <div className="font-bold text-gray-800">{profile.full_name}</div>
                      <div className="text-sm text-gray-500">{profile.email}</div>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        profile.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {profile.role ? profile.role.toUpperCase() : 'USER'}
                      </span>
                    </td>
                    <td className="p-5 font-medium text-gray-700">{profile.productivity_score || 0}</td>
                    <td className="p-5 text-gray-600">{profile.tasks_completed || 0}</td>
                    <td className="p-5 text-sm text-gray-500">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                
                {profiles.length === 0 && !error && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
