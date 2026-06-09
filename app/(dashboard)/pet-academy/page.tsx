'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Star, Zap, Trophy, Lock, ChevronRight } from 'lucide-react'

// ─── Konstanta storage key (sama dengan useActivePet di halaman lain) ─────────
const PET_STORAGE_KEY = 'plotwist_active_pet'

// ─── Pet Data ────────────────────────────────────────────────────────────────
const PETS = [
  {
    id: 1, src: '/35.png', name: 'Sparky',
    type: 'Thunder', rarity: 'Rare',
    color: '#FFD700', glow: '#FFA500',
    trait: '+15% Focus Speed',
    aura: 'from-yellow-400 to-orange-500',
    unlockAt: 0,
    desc: 'Pet listrik yang bikin kamu semangat belajar!'
  },
  {
    id: 2, src: '/36.png', name: 'Frostie',
    type: 'Ice', rarity: 'Common',
    color: '#00CFFF', glow: '#0099FF',
    trait: '+10% Memory Boost',
    aura: 'from-cyan-400 to-blue-500',
    unlockAt: 0,
    desc: 'Tenang dan dingin, cocok buat sesi belajar panjang.'
  },
  {
    id: 3, src: '/37.png', name: 'Blaze',
    type: 'Fire', rarity: 'Epic',
    color: '#FF4D00', glow: '#FF0000',
    trait: '+20% XP Gain',
    aura: 'from-red-500 to-orange-600',
    unlockAt: 1,
    desc: 'Semangat membara yang membakar malas-malasanmu!'
  },
  {
    id: 4, src: '/38.png', name: 'Leafy',
    type: 'Nature', rarity: 'Common',
    color: '#00E676', glow: '#00C853',
    trait: '+12% Streak Bonus',
    aura: 'from-green-400 to-emerald-600',
    unlockAt: 0,
    desc: 'Tumbuh bersama ilmu, satu hari satu langkah.'
  },
  {
    id: 5, src: '/39.png', name: 'Mystico',
    type: 'Mystic', rarity: 'Legendary',
    color: '#CC00FF', glow: '#9900CC',
    trait: '+30% Quest Reward',
    aura: 'from-purple-500 to-fuchsia-600',
    unlockAt: 3,
    desc: 'Kekuatan mistis dari dimensi ilmu pengetahuan.'
  },
  {
    id: 6, src: '/40.png', name: 'Aqua',
    type: 'Water', rarity: 'Rare',
    color: '#00B0FF', glow: '#0091EA',
    trait: '+18% Recovery Rate',
    aura: 'from-blue-400 to-indigo-500',
    unlockAt: 2,
    desc: 'Mengalir tenang, selalu ada di sisimu.'
  },
  {
    id: 7, src: '/41.png', name: 'Rocko',
    type: 'Earth', rarity: 'Epic',
    color: '#FF8C00', glow: '#FF6600',
    trait: '+25% Defense Bonus',
    aura: 'from-amber-500 to-yellow-600',
    unlockAt: 4,
    desc: 'Kokoh dan kuat, tameng dari godaan distraksi!'
  },
  {
    id: 8, src: '/42.png', name: 'Lumina',
    type: 'Light', rarity: 'Legendary',
    color: '#FFF176', glow: '#FFEE58',
    trait: '+35% All Stats',
    aura: 'from-yellow-300 to-pink-400',
    unlockAt: 5,
    desc: 'Cahaya tertinggi. Hanya untuk sang juara sejati.'
  },
]

const RARITY_STYLES: Record<string, string> = {
  Common:    'text-gray-400 bg-gray-100',
  Rare:      'text-blue-600 bg-blue-50',
  Epic:      'text-purple-600 bg-purple-50',
  Legendary: 'text-amber-600 bg-amber-50',
}

const RARITY_BORDER: Record<string, string> = {
  Common:    'border-gray-200',
  Rare:      'border-blue-300',
  Epic:      'border-purple-400',
  Legendary: 'border-amber-400',
}

const FEATURES = [
  { icon: '📅', label: 'Harian',     desc: 'Pet muncul di rutinitas harianmu',  href: '/harian'     },
  { icon: '📚', label: 'Edukasi',    desc: 'Pet guide tiap materi baru',        href: '/edukasi'    },
  { icon: '🏆', label: 'Pencapaian', desc: 'Pet pajang di halaman pencapaian',  href: '/pencapaian' },
  { icon: '📊', label: 'Statistik',  desc: 'Pet semangatin progress belajarmu', href: '/statistik'  },
  { icon: '✅', label: 'Tugas',      desc: 'Pet temanimu selesaikan tugas',     href: '/tugas'      },
  { icon: '❤️', label: 'Kesehatan',  desc: 'Pet jaga keseimbangan hidupmu',    href: '/kesehatan'  },
]

// ─── Floating Particle ────────────────────────────────────────────────────────
function Particle({ color }: { color: string }) {
  const style = {
    left: `${Math.random() * 100}%`,
    animationDuration: `${2 + Math.random() * 3}s`,
    animationDelay: `${Math.random() * 2}s`,
    backgroundColor: color,
    width:  `${4 + Math.random() * 4}px`,
    height: `${4 + Math.random() * 4}px`,
  }
  return <div className="absolute bottom-0 rounded-full opacity-0 particle-float" style={style} />
}

// ─── Pet Card ─────────────────────────────────────────────────────────────────
function PetCard({
  pet, isActive, isLocked, onClick,
}: {
  pet: typeof PETS[0]
  isActive: boolean
  isLocked: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const particles = Array.from({ length: 8 })

  return (
    <div
      onClick={!isLocked ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative rounded-2xl border-2 overflow-hidden select-none
        transition-all duration-300 ease-out
        ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl'}
        ${isActive ? `border-2 shadow-lg ${RARITY_BORDER[pet.rarity]}` : `border ${RARITY_BORDER[pet.rarity]}`}
      `}
      style={{
        boxShadow: isActive
          ? `0 0 20px ${pet.glow}55, 0 0 40px ${pet.glow}22`
          : hovered && !isLocked
          ? `0 0 12px ${pet.glow}33`
          : undefined,
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${pet.aura} opacity-10`} />

      {isActive && (
        <div className="absolute inset-0 opacity-20 animate-pulse-slow"
          style={{ background: `radial-gradient(circle at 50% 50%, ${pet.glow}, transparent 70%)` }} />
      )}

      {isActive && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((_, i) => <Particle key={i} color={pet.color} />)}
        </div>
      )}

      {isLocked && (
        <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center z-10 rounded-2xl">
          <Lock size={20} className="text-white drop-shadow" />
        </div>
      )}

      {isActive && (
        <div className="absolute top-2 right-2 z-10">
          <span className="text-[9px] font-black text-white px-2 py-0.5 rounded-full"
            style={{ background: pet.glow }}>
            ACTIVE
          </span>
        </div>
      )}

      <div className="absolute top-2 left-2 z-10">
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${RARITY_STYLES[pet.rarity]}`}>
          {pet.rarity}
        </span>
      </div>

      <div className="relative flex items-center justify-center pt-8 pb-2 px-4 h-28">
        <img
          src={pet.src}
          alt={pet.name}
          className={`
            w-20 h-20 object-contain drop-shadow-lg transition-all duration-300
            ${isActive ? 'animate-float scale-110' : hovered && !isLocked ? 'scale-105' : 'scale-100'}
          `}
          style={isActive ? { filter: `drop-shadow(0 0 8px ${pet.glow}99)` } : undefined}
        />
      </div>

      <div className="px-3 pb-3 bg-white/70 backdrop-blur-sm">
        <p className="text-xs font-black text-gray-800">{pet.name}</p>
        <p className="text-[10px] text-gray-400 font-medium">{pet.type} Type</p>
        <div className="mt-1.5 flex items-center gap-1">
          <Zap size={9} style={{ color: pet.color }} />
          <span className="text-[9px] font-bold" style={{ color: pet.glow }}>{pet.trait}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Active Pet Display ───────────────────────────────────────────────────────
function ActivePetDisplay({ pet }: { pet: typeof PETS[0] }) {
  return (
    <div className="relative rounded-3xl overflow-hidden border-2 p-5 mb-6"
      style={{
        borderColor: pet.glow,
        boxShadow: `0 0 30px ${pet.glow}44, 0 0 60px ${pet.glow}11`,
        background: `linear-gradient(135deg, ${pet.color}11, ${pet.glow}11)`,
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border animate-ping-slow opacity-20"
          style={{ borderColor: pet.glow }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border animate-ping-slow opacity-10"
          style={{ borderColor: pet.color, animationDelay: '0.5s' }} />
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="relative w-24 h-24 shrink-0">
          <div className="absolute inset-0 rounded-full animate-pulse-slow opacity-30"
            style={{ background: `radial-gradient(circle, ${pet.glow}, transparent)` }} />
          <img src={pet.src} alt={pet.name}
            className="w-24 h-24 object-contain animate-float relative z-10"
            style={{ filter: `drop-shadow(0 0 12px ${pet.glow}cc)` }} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-lg font-black text-gray-800">{pet.name}</p>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${RARITY_STYLES[pet.rarity]}`}>
              {pet.rarity}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-2">{pet.desc}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-white text-[10px] font-bold"
              style={{ background: `linear-gradient(90deg, ${pet.color}, ${pet.glow})` }}>
              <Zap size={10} />
              {pet.trait}
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
              <Star size={10} className="text-amber-400" />
              {pet.type} Type
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t flex items-center gap-2"
        style={{ borderColor: `${pet.glow}33` }}>
        <Sparkles size={12} style={{ color: pet.glow }} />
        <p className="text-[10px] text-gray-500">
          <span className="font-bold" style={{ color: pet.glow }}>{pet.name}</span> akan menemanimu di semua fitur Plotwist!
        </p>
      </div>
    </div>
  )
}

// ─── Toast konfirmasi ─────────────────────────────────────────────────────────
function Toast({ pet, visible }: { pet: typeof PETS[0]; visible: boolean }) {
  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
      style={{
        background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
        border: `1.5px solid ${pet.glow}55`,
        boxShadow: `0 8px 32px ${pet.glow}33`,
      }}
    >
      <img src={pet.src} alt={pet.name}
        className="w-8 h-8 object-contain"
        style={{ filter: `drop-shadow(0 0 6px ${pet.glow}cc)` }} />
      <div>
        <p className="text-white text-xs font-black">{pet.name} dipilih! ✨</p>
        <p className="text-[10px] font-medium" style={{ color: pet.glow }}>
          Companion aktif di semua fitur
        </p>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PetAcademyPage() {

  // Baca dari localStorage saat pertama load
  const [activePetId, setActivePetId] = useState<number>(() => {
    if (typeof window === 'undefined') return 1
    try {
      const saved = localStorage.getItem(PET_STORAGE_KEY)
      return saved ? JSON.parse(saved) : 1
    } catch {
      return 1
    }
  })

  const [unlockedCount] = useState(4)
  const [showToast, setShowToast] = useState(false)
  const [toastPet,  setToastPet]  = useState(PETS[0])

  const activePet = PETS.find(p => p.id === activePetId) ?? PETS[0]

  // Handler pilih pet: update state + simpan localStorage + dispatch event
  const handleSelectPet = (id: number) => {
    const pet = PETS.find(p => p.id === id)
    if (!pet) return

    setActivePetId(id)

    try {
      localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(id))
      // Dispatch supaya tab/halaman lain yang sudah terbuka langsung update
      window.dispatchEvent(new StorageEvent('storage', {
        key: PET_STORAGE_KEY,
        newValue: JSON.stringify(id),
      }))
    } catch {}

    setToastPet(pet)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 pb-10">

      <Toast pet={toastPet} visible={showToast} />

      {/* Header */}
      <div className="relative overflow-hidden px-4 pt-6 pb-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-purple-200/30 rounded-full blur-3xl" />
          <div className="absolute -top-4 -left-8 w-32 h-32 bg-pink-200/30 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-white bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 rounded-full">PRO</span>
            <span className="text-[10px] text-gray-400">exclusive</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Pet Academy 🐾</h1>
          <p className="text-xs text-gray-500 mt-0.5">Pilih companion belajarmu dan raih prestasi bersama!</p>
        </div>
      </div>

      <div className="px-4 space-y-5">

        {/* Active Pet Display */}
        <ActivePetDisplay pet={activePet} />

        {/* Pet Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-black text-gray-800">Koleksi Pet</p>
            <span className="text-[10px] text-gray-400 font-medium">
              {PETS.filter(p => p.unlockAt <= unlockedCount).length}/{PETS.length} unlocked
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PETS.map(pet => (
              <PetCard
                key={pet.id}
                pet={pet}
                isActive={pet.id === activePetId}
                isLocked={pet.unlockAt > unlockedCount}
                onClick={() => handleSelectPet(pet.id)}
              />
            ))}
          </div>
        </div>

        {/* Pet muncul di fitur */}
        <div>
          <p className="text-sm font-black text-gray-800 mb-3">
            <span className="font-black" style={{ color: activePet.glow }}>{activePet.name}</span> menemanimu di:
          </p>
          <div className="space-y-2">
            {FEATURES.map(f => (
              <a
                key={f.label}
                href={f.href}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-200 group"
              >
                <div className="relative w-10 h-10 rounded-full shrink-0 flex items-center justify-center"
                  style={{ background: `${activePet.color}22` }}>
                  <img src={activePet.src} alt={activePet.name}
                    className="w-8 h-8 object-contain"
                    style={{ filter: `drop-shadow(0 0 4px ${activePet.glow}88)` }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <span>{f.icon}</span> {f.label}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{f.desc}</p>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-purple-400 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Unlock hint */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={14} />
            <p className="text-xs font-black">Cara Unlock Pet Baru</p>
          </div>
          <p className="text-[10px] opacity-80 leading-relaxed">
            Selesaikan quest, jaga streak belajar, dan kumpulkan XP untuk unlock pet langka baru! Pet Legendary butuh dedikasi penuh. 💪
          </p>
        </div>

      </div>

      {/* Global styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1.1); }
          50%       { transform: translateY(-8px) scale(1.1); }
        }
        @keyframes particle-float {
          0%   { transform: translateY(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-60px) scale(0); opacity: 0; }
        }
        @keyframes ping-slow {
          0%   { transform: translate(-50%, -50%) scale(0.8); opacity: 0.4; }
          100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50%       { opacity: 0.4; }
        }
        .animate-float      { animation: float          3s ease-in-out infinite; }
        .particle-float     { animation: particle-float 2.5s ease-out  infinite; }
        .animate-ping-slow  { animation: ping-slow      2s ease-out    infinite; }
        .animate-pulse-slow { animation: pulse-slow     2s ease-in-out infinite; }
      `}</style>
    </div>
  )
}