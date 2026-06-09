'use client'

import { BarChart2 } from 'lucide-react'

export default function StatistikPage() {
  return (
    <div className="flex-1 min-h-screen bg-[#F0EEFF] p-8">
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-[#3C3489]">Statistik Pro</h1>
        <p className="text-[#7F77DD] mt-2 text-lg">Pantau perkembangan belajarmu</p>
      </div>
      <div className="grid grid-cols-3 gap-5 mb-6">
        {[
          { label: 'Total Jam Fokus', value: '0 jam', icon: '⏱️', color: 'border-purple-200 bg-purple-50', text: 'text-[#3C3489]' },
          { label: 'Tugas Selesai', value: '0', icon: '✅', color: 'border-green-200 bg-green-50', text: 'text-green-700' },
          { label: 'Total XP', value: '0 XP', icon: '⚡', color: 'border-amber-200 bg-amber-50', text: 'text-amber-700' },
        ].map((s, i) => (
          <div key={i} className={`rounded-[24px] p-6 border-2 ${s.color} shadow-sm`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className={`text-4xl font-bold ${s.text}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-[32px] p-8 border border-purple-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[200px]">
        <BarChart2 className="text-purple-200 mb-3" size={48} />
        <p className="text-gray-400 font-medium">Statistik akan muncul setelah kamu mulai belajar</p>
        <p className="text-gray-300 text-sm mt-1">Selesaikan tugas dan jalankan Pomodoro untuk mulai mengisi grafik!</p>
      </div>
    </div>
  )
}