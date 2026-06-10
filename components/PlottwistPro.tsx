'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PawPrint, ChevronDown, Lock } from 'lucide-react'

const MASCOT = {
  idle:      { src: 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/15.png', mood: 'Siap menemanimu belajar!',       anim: 'animate-bounce-slow' },
  focus:     { src: 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/18.png', mood: 'Lagi fokus, jangan ganggu! 📚',  anim: 'animate-bounce' },
  sad:       { src: 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/17.png', mood: 'Gua laper materi, belajar yuk!', anim: 'animate-wobble' },
  celebrate: { src: 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/16.png', mood: 'Yeayyy! Kamu keren banget! 🎉',  anim: 'animate-pop' },
  levelup:   { src: 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/14.png', mood: 'Evolved! Level baru! 🎓',         anim: 'animate-spin-once' },
}

const PRO_MENU = [
  { href: '/pet-academy', label: 'Pet Academy', icon: PawPrint, badge: 'Baru' },
]

interface Props {
  focusMinutes?: number
  isTimerRunning?: boolean
  lastActiveDate?: Date | null
  productivityLevel?: number
}

export default function PlottwistPro({
  focusMinutes    = 0,
  isTimerRunning  = false,
  lastActiveDate  = null,
  productivityLevel,
}: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)

  // ── Semua data dari localStorage diinisialisasi dengan nilai default ──────
  // Tidak boleh baca localStorage di luar useEffect (menyebabkan hydration error)
  const [resolvedLevel, setResolvedLevel] = useState<number>(productivityLevel ?? 1)
  const [currentXp, setCurrentXp] = useState<number>(0)  // ← default 0, bukan dari localStorage
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const read = () => {
      try {
        const raw = localStorage.getItem('plotwist_state_v1')
        if (raw) {
          const p = JSON.parse(raw)
          const xp = p.xp ?? 0
          setCurrentXp(xp)
          if (productivityLevel === undefined) {
            setResolvedLevel(Math.max(1, Math.floor(xp / 500) + 1))
          }
        }
      } catch {}
    }

    // Jika productivityLevel dikirim via props, tetap update XP dari localStorage
    if (productivityLevel !== undefined) {
      setResolvedLevel(productivityLevel)
    }

    read()

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'plotwist_state_v1') read()
    }
    window.addEventListener('storage', onStorage)
    const id = setInterval(read, 3000)
    return () => {
      window.removeEventListener('storage', onStorage)
      clearInterval(id)
    }
  }, [productivityLevel])

  const isProUnlocked = resolvedLevel >= 2

  const focusHours = focusMinutes / 60
  const daysSinceActive = lastActiveDate
    ? (Date.now() - new Date(lastActiveDate).getTime()) / 86_400_000
    : 0

  let mode: keyof typeof MASCOT = 'idle'
  if (focusHours >= 5)           mode = 'levelup'
  else if (isTimerRunning)       mode = 'focus'
  else if (daysSinceActive >= 2) mode = 'sad'
  else if (isProUnlocked)        mode = 'celebrate'

  const { src, mood, anim } = MASCOT[mode]
  const xp = Math.min((focusHours / 5) * 100, 100)

  const xpForLevel2 = 1000
  // xpNeeded dihitung dari state (yang diisi useEffect), bukan inline localStorage
  const xpNeeded = Math.max(0, xpForLevel2 - currentXp)

  return (
    <div className="border border-purple-300 rounded-2xl overflow-hidden mt-2">

      {/* Header toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 rounded-full">
            PRO
          </span>
          <span className="text-xs font-semibold text-purple-800">Plotwist Pro</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-purple-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          {/* Panel maskot */}
          <div className="bg-white px-3 py-3 border-b border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center overflow-hidden shrink-0">
                <img src={src} alt="Maskot Plowie" className={`w-14 h-14 object-contain ${anim}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800">
                  Plowie{mode === 'levelup' ? ' ✦' : ''}
                </p>
                <p className="text-[10px] text-gray-400 truncate mb-1">{mood}</p>
                <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                    style={{ width: `${xp}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {focusHours >= 5 ? 'Max Level!' : `${focusHours.toFixed(1)} / 5 jam fokus`}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Pro */}
          {PRO_MENU.map(({ href, label, icon: Icon, badge }) => {
            const isActive = pathname === href || pathname.startsWith(href)

            // ── TERKUNCI ──
            if (!isProUnlocked) {
              return (
                <div
                  key={href}
                  className="flex items-center gap-2.5 px-3 py-2.5 border-t border-purple-50
                             text-xs font-semibold text-gray-300 cursor-not-allowed bg-gray-50/80
                             select-none"
                  title="Capai Level 2 untuk membuka fitur ini"
                >
                  <Icon size={16} className="shrink-0 text-gray-300" />
                  <span className="flex-1">{label}</span>
                  <span className="text-[9px] text-purple-300 font-bold">Lv.2</span>
                  <Lock size={13} className="text-gray-300 shrink-0 ml-1" />
                </div>
              )
            }

            // ── TERBUKA ──
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 border-t border-purple-50 text-xs font-semibold transition-colors
                  ${isActive
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-500 hover:bg-purple-50 hover:text-purple-600'
                  }`}
              >
                <Icon size={16} className={`shrink-0 ${isActive ? 'text-purple-600' : 'text-purple-400'}`} />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}

          {/* Hint XP jika masih terkunci — hanya render setelah mounted */}
          {!isProUnlocked && (
            <div className="px-3 py-2 bg-purple-50/60 border-t border-purple-50">
              <p className="text-[10px] text-purple-400 text-center font-medium leading-relaxed">
                🔒 Butuh{' '}
                <span className="font-bold text-purple-500">
                  {/* Tampilkan angka hanya setelah mounted agar server & client sama */}
                  {mounted ? xpNeeded.toLocaleString('id-ID') : '...'} XP
                </span>{' '}
                lagi untuk unlock
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}