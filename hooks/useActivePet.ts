'use client'

import { useState, useEffect } from 'react'

// ─── Tipe data pet (sync dengan PETS di PetAcademyPage) ───────────────────────
export interface Pet {
  id: number
  src: string
  name: string
  type: string
  rarity: string
  color: string
  glow: string
  trait: string
  aura: string
  unlockAt: number
  desc: string
}

// ─── Data pets (pindahkan dari PetAcademyPage ke sini agar shared) ────────────
export const PETS: Pet[] = [
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

export const PET_STORAGE_KEY = 'plotwist_active_pet'

// ─── Hook utama ───────────────────────────────────────────────────────────────
export function useActivePet() {
  const [activePetId, setActivePetId] = useState<number>(() => {
    if (typeof window === 'undefined') return 1
    try {
      const saved = localStorage.getItem(PET_STORAGE_KEY)
      return saved ? JSON.parse(saved) : 1
    } catch {
      return 1
    }
  })

  // Sync real-time antar tab / halaman via storage event
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PET_STORAGE_KEY && e.newValue) {
        try {
          setActivePetId(JSON.parse(e.newValue))
        } catch {}
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const activePet = PETS.find(p => p.id === activePetId) ?? PETS[0]

  return { activePet, activePetId }
}