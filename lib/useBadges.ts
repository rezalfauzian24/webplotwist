import { useEffect, useState } from 'react'

export const BADGE_LIST = [
  { id: 'antiSks',     icon: '🔥', label: 'Anti SKS',     desc: 'Aktif belajar dari awal',         xpRequired: 0     },
  { id: 'nightOwl',    icon: '🌙', label: 'Night Owl',     desc: 'Belajar di malam hari',           xpRequired: 2000  },
  { id: 'suhuIpk',     icon: '🧠', label: 'Suhu IPK',      desc: 'Kuasai banyak materi',            xpRequired: 5000  },
  { id: 'focusMaster', icon: '⚡', label: 'Focus Master',  desc: 'Selesaikan 20 sesi fokus',        xpRequired: 9000  },
  { id: 'topStudent',  icon: '🏆', label: 'Top Student',   desc: 'Raih XP tertinggi',               xpRequired: 12000 },
  { id: 'champion',    icon: '🥇', label: 'Champion',      desc: 'Konsisten setiap hari',           xpRequired: 15000 },
  { id: 'legend',      icon: '⭐', label: 'Legend',        desc: 'Capai puncak prestasi',           xpRequired: 20000 },
  { id: 'crown',       icon: '👑', label: 'Royalty',       desc: 'Sang juara sejati Plotwist',      xpRequired: 30000 },
]

export function useBadges() {
  const [xp, setXp] = useState(0)

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem('plotwist_state_v1')
        if (raw) setXp(JSON.parse(raw)?.xp ?? 0)
      } catch {}
    }
    read()
    const handler = (e: StorageEvent) => { if (e.key === 'plotwist_state_v1') read() }
    window.addEventListener('storage', handler)
    const interval = setInterval(read, 3000)
    return () => { window.removeEventListener('storage', handler); clearInterval(interval) }
  }, [])

  return BADGE_LIST.map(b => ({ ...b, earned: xp >= b.xpRequired }))
}