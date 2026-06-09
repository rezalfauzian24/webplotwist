'use client'
import { useBadges } from '@/lib/useBadges'

export default function PencapaianPage() {
  const badges = useBadges()

  return (
    <div className="flex-1 min-h-screen bg-[#F0EEFF] p-8">
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-[#3C3489]">Pencapaian</h1>
        <p className="text-[#7F77DD] mt-2 text-lg">
          {badges.filter(b => b.earned).length}/{badges.length} badge diraih
        </p>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {badges.map((b) => (
          <div key={b.id}
            className={`bg-white rounded-[24px] p-6 flex flex-col items-center text-center border-2 shadow-sm transition-all
              ${b.earned ? 'border-purple-200 hover:shadow-md' : 'border-gray-100 opacity-50 grayscale'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3
              ${b.earned ? 'bg-purple-50' : 'bg-gray-50'}`}>
              {b.icon}
            </div>
            <p className={`font-bold text-sm mb-1 ${b.earned ? 'text-[#3C3489]' : 'text-gray-400'}`}>{b.label}</p>
            <p className="text-xs text-gray-400">{b.desc}</p>
            {b.earned
              ? <span className="mt-3 text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">✓ Diraih</span>
              : <span className="mt-3 text-[10px] bg-gray-100 text-gray-400 font-bold px-2 py-0.5 rounded-full">{b.xpRequired.toLocaleString()} XP</span>
            }
          </div>
        ))}
      </div>
    </div>
  )
}