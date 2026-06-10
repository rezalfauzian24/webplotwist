'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { db } from '@/firebase/config'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import {
  FaFire, FaMoon, FaBrain, FaBolt, FaCrown, FaGithub, FaGoogle,
  FaLock, FaBell, FaPalette, FaQuestionCircle, FaSave, FaCamera,
  FaEdit, FaCheck, FaStar, FaTrophy, FaMedal, FaSignOutAlt, FaSync,
  FaExclamationTriangle, FaVolumeUp, FaPlay, FaStop, FaLinkedin,
  FaInstagram, FaTiktok, FaFacebook, FaTwitter, FaGlobe, FaTimes,
  FaExternalLinkAlt, FaLink, FaCloudUploadAlt, FaChevronDown,
} from 'react-icons/fa'

const BADGE_LIST = [
  { id: 'antiSks',     icon: <FaFire className="text-4xl mb-4" />,   label: 'Anti SKS',     gradient: 'from-orange-400 to-red-500',    xpRequired: 0     },
  { id: 'nightOwl',    icon: <FaMoon className="text-4xl mb-4" />,   label: 'Night Owl',    gradient: 'from-indigo-500 to-purple-500', xpRequired: 2000  },
  { id: 'suhuIpk',     icon: <FaBrain className="text-4xl mb-4" />,  label: 'Suhu IPK',     gradient: 'from-pink-500 to-fuchsia-500',  xpRequired: 5000  },
  { id: 'focusMaster', icon: <FaBolt className="text-4xl mb-4" />,   label: 'Focus Master', gradient: 'from-cyan-400 to-blue-500',     xpRequired: 9000  },
  { id: 'topStudent',  icon: <FaTrophy className="text-4xl mb-4" />, label: 'Top Student',  gradient: 'from-yellow-400 to-orange-500', xpRequired: 12000 },
  { id: 'champion',    icon: <FaMedal className="text-4xl mb-4" />,  label: 'Champion',     gradient: 'from-green-400 to-teal-500',    xpRequired: 15000 },
  { id: 'legend',      icon: <FaStar className="text-4xl mb-4" />,   label: 'Legend',       gradient: 'from-rose-400 to-pink-600',     xpRequired: 20000 },
  { id: 'crown',       icon: <FaCrown className="text-4xl mb-4" />,  label: 'Royalty',      gradient: 'from-amber-400 to-yellow-600',  xpRequired: 30000 },
]
function useBadges(xp: number) {
  return BADGE_LIST.map(b => ({ ...b, earned: xp >= b.xpRequired }))
}

type EducationLevel = 'kuliah' | 'pelajar' | 'lainnya'

interface SocialLinks {
  linkedin: string; instagram: string; tiktok: string
  facebook: string; twitter: string;  portfolio: string
}

interface ProfileData {
  name: string; major: string; semester: string; studentId: string
  angkatan: string; bio: string; profileImage: string
  educationLevel: EducationLevel; xp: number; socialLinks: SocialLinks
}

interface PlottwistEduData {
  xp: number; coins: number; streak: number; energy: number; maxEnergy: number
  totalQuestsDone: number; focusSessions: number; aiAnalyzeCount: number
  noteCount: number; flashcardViewed: number; achievements: string[]
  mascotEvo: string; mascotLevel: number
  dailyQuests: Array<{ id: number; label: string; done: boolean; xp: number; icon: string }>
  mood: string; moodHistory: Array<{ date: string; mood: string }>
}

function usePlottwistSync() {
  const [eduData, setEduData] = useState<PlottwistEduData | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const read = () => {
    try {
      const raw = localStorage.getItem('plotwist_state_v1')
      if (!raw) return
      const p = JSON.parse(raw)
      setEduData({
        xp: p.xp ?? 0, coins: p.coins ?? 0, streak: p.streak ?? 0,
        energy: p.energy ?? 50, maxEnergy: p.maxEnergy ?? 100,
        totalQuestsDone: p.totalQuestsDone ?? 0, focusSessions: p.focusSessions ?? 0,
        aiAnalyzeCount: p.aiAnalyzeCount ?? 0, noteCount: p.noteCount ?? 0,
        flashcardViewed: p.flashcardViewed ?? 0, achievements: p.achievements ?? [],
        mascotEvo: p.mascotEvo ?? 'baby', mascotLevel: p.mascotLevel ?? 1,
        dailyQuests: p.dailyQuests ?? [], mood: p.mood ?? 'semangat',
        moodHistory: p.moodHistory ?? [],
      })
      setLastSync(new Date())
    } catch {}
  }
  useEffect(() => {
    read()
    const onStorage = (e: StorageEvent) => { if (e.key === 'plotwist_state_v1') read() }
    window.addEventListener('storage', onStorage)
    const id = setInterval(read, 3000)
    return () => { window.removeEventListener('storage', onStorage); clearInterval(id) }
  }, [])
  return { eduData, lastSync }
}

export default function ProfilePage() {

  const { data: session } = useSession()

  const userIdRef = useRef<string | null>(null)

  const [name,           setName]           = useState('')
  const [major,          setMajor]          = useState('')
  const [semester,       setSemester]       = useState('')
  const [studentId,      setStudentId]      = useState('')
  const [angkatan,       setAngkatan]       = useState('')
  const [bio,            setBio]            = useState('')
  const [profileImage,   setProfileImage]   = useState('https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/profile.png')
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('kuliah')
  const [socialLinks,    setSocialLinks]    = useState<SocialLinks>({
    linkedin: '', instagram: '', tiktok: '', facebook: '', twitter: '', portfolio: ''
  })

  const [isEditMode,    setIsEditMode]    = useState(false)
  const [isSavingMain,  setIsSavingMain]  = useState(false)
  const [saveStatus,    setSaveStatus]    = useState<'idle'|'saving'|'saved'|'error'>('idle')
  const [draft, setDraft] = useState({ name: '', major: '', semester: '', studentId: '', angkatan: '', bio: '' })
  const saveTimer   = useRef<NodeJS.Timeout | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialized = useRef(false)

  const openEditMode   = () => { setDraft({ name, major, semester, studentId, angkatan, bio }); setIsEditMode(true) }
  const cancelEditMode = () => { setDraft({ name, major, semester, studentId, angkatan, bio }); setIsEditMode(false) }

  const [isEditingSocial, setIsEditingSocial] = useState(false)
  const [socialDraft,     setSocialDraft]     = useState<SocialLinks>({ linkedin: '', instagram: '', tiktok: '', facebook: '', twitter: '', portfolio: '' })
  const [isSavingSocial,  setIsSavingSocial]  = useState(false)

  // ── Dropdown jenjang — pakai state biasa, TANPA overlay ────────────────────
  const [showEduDropdown, setShowEduDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowEduDropdown(false)
      }
    }
    if (showEduDropdown) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showEduDropdown])

  const eduConfig: Record<EducationLevel, { idLabel: string; idPlaceholder: string; levelLabel: string; semesterLabel: string; angkatanLabel: string }> = {
    kuliah:  { idLabel: 'NIM',      idPlaceholder: 'Nomor Induk Mahasiswa', levelLabel: 'Universitas / Politeknik', semesterLabel: 'Semester',       angkatanLabel: 'Angkatan' },
    pelajar: { idLabel: 'NIS/NISN', idPlaceholder: 'Nomor Induk Siswa',     levelLabel: 'Nama Sekolah',             semesterLabel: 'Kelas',           angkatanLabel: 'Angkatan' },
    lainnya: { idLabel: 'ID',       idPlaceholder: 'Opsional',              levelLabel: 'Institusi / Lembaga',      semesterLabel: 'Level / Tingkat',  angkatanLabel: 'Tahun'    },
  }
  const cfg = eduConfig[educationLevel]

  const [localXp, setLocalXp] = useState(0)
  const { eduData, lastSync } = usePlottwistSync()
  const activeXp     = eduData?.xp        ?? localXp
  const activeLevel  = Math.max(1, Math.floor(activeXp / 500) + 1)
  const activeMaxXp  = activeLevel * 500
  const activeXpProg = activeXp % activeMaxXp
  const activeXpPct  = Math.min(100, (activeXpProg / activeMaxXp) * 100)
  const isProActive  = activeLevel >= 2
  const badges       = useBadges(activeXp)

  const [activeSetting,     setActiveSetting]     = useState('appearance')
  const [darkMode,          setDarkMode]          = useState(false)
  const [notification,      setNotification]      = useState(true)
  const [twoFactor,         setTwoFactor]         = useState(false)
  const [theme,             setTheme]             = useState('Pastel')
  const [notificationSound, setNotificationSound] = useState(true)
  const [emailNotif,        setEmailNotif]        = useState(true)
  const [showToast,         setShowToast]         = useState(false)
  const [toastMessage,      setToastMessage]      = useState('')
  const [helpModal,         setHelpModal]         = useState(false)
  const [selectedHelp,      setSelectedHelp]      = useState('')
  const [deadlineRingtone,  setDeadlineRingtone]  = useState<null|'musik1'|'musik2'>(null)
  const [emailRingtone,     setEmailRingtone]     = useState<null|'musik1'|'musik2'>(null)
  const [playingAudio,      setPlayingAudio]      = useState<null|string>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [securityLog] = useState(['MacBook Pro - Jakarta', 'iPhone 15 - Indonesia'])

  const triggerToast = (msg: string) => {
    setToastMessage(msg); setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }

  const ringtoneOptions: { value: null|'musik1'|'musik2'; label: string }[] = [
    { value: null, label: 'Tidak ada' }, { value: 'musik1', label: 'Musik 1' }, { value: 'musik2', label: 'Musik 2' },
  ]
  const playPreview = (key: 'musik1'|'musik2') => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
    if (playingAudio === key) { setPlayingAudio(null); audioRef.current = null; return }
    const audio = new Audio(`https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/${key}.mp3`)
    audio.oncanplaythrough = () => audio.play().catch(() => { triggerToast('File tidak ditemukan ⚠️'); setPlayingAudio(null) })
    audio.onended = () => { setPlayingAudio(null); audioRef.current = null }
    audio.onerror = () => { triggerToast(`${key}.mp3 tidak ditemukan ⚠️`); setPlayingAudio(null) }
    audioRef.current = audio; setPlayingAudio(key); audio.load()
  }
  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; audioRef.current = null }
    setPlayingAudio(null)
  }
  useEffect(() => () => stopAudio(), [])

  const themes = useMemo(() => ({
    Pastel:           { background: darkMode ? 'bg-[#0F0B1A]' : 'bg-[#F6F4FF]', card: darkMode ? 'bg-[#1B162B]' : 'bg-white', soft: darkMode ? 'bg-[#251F38]' : 'bg-[#F8F7FF]', text: darkMode ? 'text-white' : 'text-gray-800', subtext: darkMode ? 'text-gray-300' : 'text-gray-500', hero: 'from-purple-500 via-fuchsia-500 to-pink-400', active: 'bg-purple-500 text-white border-purple-500' },
    Cyberpunk:        { background: 'bg-[#09090B]', card: 'bg-[#121218]', soft: 'bg-[#1A1A24]', text: 'text-cyan-300', subtext: 'text-cyan-100', hero: 'from-cyan-400 via-blue-500 to-fuchsia-500', active: 'bg-cyan-400 text-black border-cyan-400' },
    'Midnight Purple':{ background: 'bg-[#120B1E]', card: 'bg-[#1C1230]', soft: 'bg-[#24163D]', text: 'text-purple-100', subtext: 'text-purple-300', hero: 'from-[#4C1D95] via-[#6D28D9] to-[#9333EA]', active: 'bg-violet-500 text-white border-violet-500' },
    'Neon Blue':      { background: 'bg-[#07111F]', card: 'bg-[#0D1728]', soft: 'bg-[#142238]', text: 'text-blue-100', subtext: 'text-blue-300', hero: 'from-sky-400 via-blue-500 to-indigo-500', active: 'bg-sky-400 text-black border-sky-400' },
  }), [darkMode])
  const ct = themes[theme as keyof typeof themes]

  const triggerSaveStatus = useCallback((s: 'saved'|'error', ms = 2000) => {
    setSaveStatus(s)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => setSaveStatus('idle'), ms)
  }, [])

  // ── saveToFirestore: selalu pakai uid parameter, tidak bergantung state ─────
  const saveToFirestore = useCallback(async (payload: ProfileData, uid: string): Promise<boolean> => {
    setSaveStatus('saving')
    localStorage.setItem('plotwist_profile_backup', JSON.stringify({ ...payload, userId: uid }))
    try {
      await setDoc(doc(db, 'pengguna', uid), {
        name:           payload.name,
        major:          payload.major,
        semester:       payload.semester,
        studentId:      payload.studentId,
        angkatan:       payload.angkatan,
        bio:            payload.bio,
        profileImage:   payload.profileImage,
        educationLevel: payload.educationLevel,
        socialLinks:    payload.socialLinks,
        xp:             payload.xp,
        updatedAt:      serverTimestamp(),
      }, { merge: true })
      triggerSaveStatus('saved')
      return true
    }catch (err: any) {
  console.error('[ProfilePage] Firestore save error:', err)
  console.error('ERROR CODE:', err?.code)
  console.error('ERROR MESSAGE:', err?.message)

  triggerSaveStatus('error', 3000)
  return false
}
  }, [triggerSaveStatus])

  // ── getUid: helper ambil uid — dari ref dulu, fallback ke Supabase ──────────
  const getUid = useCallback(async (): Promise<string | null> => {
  if (userIdRef.current) return userIdRef.current

  try {
    // 1. NextAuth dulu
    const nextAuthUid =
      session?.user?.email ||
      session?.user?.name

    console.log('NEXTAUTH SESSION:', session)
    console.log('NEXTAUTH UID:', nextAuthUid)

    if (nextAuthUid) {
      userIdRef.current = nextAuthUid
      return nextAuthUid
    }

    // 2. Fallback Supabase
    const { data: { session: sbSession } } =
      await supabase.auth.getSession()

    const uid = sbSession?.user?.id

    if (uid) {
      userIdRef.current = uid
      return uid
    }

    const { data } = await supabase.auth.getUser()

    const uid2 = data.user?.id

    if (uid2) {
      userIdRef.current = uid2
      return uid2
    }
  } catch (err) {
    console.error('GET UID ERROR:', err)
  }

  return null
}, [session])

  // ── Load dari localStorage + Firestore ─────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      // 1. Restore localStorage dulu (instant)
      try {
        const backup = localStorage.getItem('plotwist_profile_backup')
        if (backup) {
          const d = JSON.parse(backup)
          if (d.name)           setName(d.name)
          if (d.major)          setMajor(d.major)
          if (d.semester)       setSemester(d.semester)
          if (d.studentId)      setStudentId(d.studentId)
          if (d.angkatan)       setAngkatan(d.angkatan)
          if (d.bio)            setBio(d.bio)
          if (d.profileImage)   setProfileImage(d.profileImage)
          if (d.educationLevel) setEducationLevel(d.educationLevel)
          if (d.socialLinks)    setSocialLinks(d.socialLinks)
          if (d.xp)             setLocalXp(d.xp)
        }
      } catch {}

      // 2. Ambil uid
      const uid = await getUid()
      if (!uid) { isInitialized.current = true; return }

      // 3. Load dari Firestore
      try {
        const snap = await getDoc(doc(db, 'pengguna', uid))
        if (snap.exists()) {
          isInitialized.current = false
          const d = snap.data()
          setName(d.name           ?? '')
          setMajor(d.major         ?? '')
          setSemester(d.semester   ?? '')
          setStudentId(d.studentId ?? '')
          setAngkatan(d.angkatan   ?? '')
          setBio(d.bio             ?? '')
          setProfileImage(d.profileImage ?? 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/profile.png')
          if (d.educationLevel) setEducationLevel(d.educationLevel as EducationLevel)
          if (d.xp !== undefined) setLocalXp(d.xp)
          if (d.socialLinks) setSocialLinks({
            linkedin:  d.socialLinks.linkedin  || '',
            instagram: d.socialLinks.instagram || '',
            tiktok:    d.socialLinks.tiktok    || '',
            facebook:  d.socialLinks.facebook  || '',
            twitter:   d.socialLinks.twitter   || '',
            portfolio: d.socialLinks.portfolio || '',
          })
          localStorage.setItem('plotwist_profile_backup', JSON.stringify({
            name: d.name, major: d.major, semester: d.semester,
            studentId: d.studentId, angkatan: d.angkatan, bio: d.bio,
            profileImage: d.profileImage, educationLevel: d.educationLevel,
            socialLinks: d.socialLinks, xp: d.xp, userId: uid,
          }))
          requestAnimationFrame(() => { isInitialized.current = true })
        } else {
          await setDoc(doc(db, 'pengguna', uid), {
            name: '', major: '', semester: '', studentId: '',
            angkatan: '', bio: '', profileImage: 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/profile.png',
            educationLevel: 'kuliah', socialLinks: {}, xp: 0,
            updatedAt: serverTimestamp(),
          })
          isInitialized.current = true
        }
      } catch (err) {
        console.error('[ProfilePage] Load error:', err)
        isInitialized.current = true
      }
    }
    load()
  }, [getUid])

  // ── Ref untuk flush saat tab ditutup ────────────────────────────────────────
  const profileRef = useRef({ name, major, semester, studentId, angkatan, bio, profileImage, educationLevel, activeXp, socialLinks, isEditMode, draft })
  useEffect(() => {
    profileRef.current = { name, major, semester, studentId, angkatan, bio, profileImage, educationLevel, activeXp, socialLinks, isEditMode, draft }
  })

  // Auto-save localStorage
  useEffect(() => {
    if (!isInitialized.current) return
    localStorage.setItem('plotwist_profile_backup', JSON.stringify({
      name, major, semester, studentId, angkatan, bio,
      profileImage, educationLevel, xp: activeXp, socialLinks,
      userId: userIdRef.current,
    }))
  }, [name, major, semester, studentId, angkatan, bio, profileImage, educationLevel, activeXp, socialLinks])

  // Flush ke Firestore saat halaman ditutup / tab disembunyikan
  useEffect(() => {
    const flush = () => {
      if (!isInitialized.current || !userIdRef.current) return
      const p = profileRef.current
      const payload: ProfileData = {
        name:           p.isEditMode ? p.draft.name      : p.name,
        major:          p.isEditMode ? p.draft.major     : p.major,
        semester:       p.isEditMode ? p.draft.semester  : p.semester,
        studentId:      p.isEditMode ? p.draft.studentId : p.studentId,
        angkatan:       p.isEditMode ? p.draft.angkatan  : p.angkatan,
        bio:            p.isEditMode ? p.draft.bio       : p.bio,
        profileImage:   p.profileImage,
        educationLevel: p.educationLevel,
        xp:             p.activeXp,
        socialLinks:    p.socialLinks,
      }
      localStorage.setItem('plotwist_profile_backup', JSON.stringify({ ...payload, userId: userIdRef.current }))
      setDoc(doc(db, 'pengguna', userIdRef.current!), {
        ...payload, updatedAt: serverTimestamp(),
      }, { merge: true }).catch(console.error)
    }
    const onHide   = () => { if (document.visibilityState === 'hidden') flush() }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('beforeunload', flush)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('beforeunload', flush)
      flush()
    }
  }, [])

  // ── handleSaveProfile ────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
  const uid = await getUid()

  console.log('UID:', uid)

  if (!uid) {
    console.log('UID NULL')
    triggerToast('Sesi tidak ditemukan, silakan login ulang ❌')
    return
  }

  setIsSavingMain(true)

  const payload: ProfileData = {
    name: draft.name,
    major: draft.major,
    semester: draft.semester,
    studentId: draft.studentId,
    angkatan: draft.angkatan,
    bio: draft.bio,
    profileImage,
    educationLevel,
    xp: activeXp,
    socialLinks,
  }

  setName(draft.name)
  setMajor(draft.major)
  setSemester(draft.semester)
  setStudentId(draft.studentId)
  setAngkatan(draft.angkatan)
  setBio(draft.bio)

 const ok = await saveToFirestore(payload, uid)
  setIsSavingMain(false)
  setIsEditMode(false)
  triggerToast(
    ok
      ? 'Profil tersimpan ✅'
      : 'Tersimpan lokal, cek koneksi / Firestore Rules ⚠️'
  )
}

  // ── handleEducationChange ────────────────────────────────────────────────────
  const handleEducationChange = async (level: EducationLevel) => {
    setEducationLevel(level)
    setShowEduDropdown(false)
    if (!isInitialized.current) return
    const uid = await getUid()
    if (!uid) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      saveToFirestore({ name, major, semester, studentId, angkatan, bio, profileImage, educationLevel: level, xp: activeXp, socialLinks }, uid)
    }, 800)
  }

  // ── handleImageUpload ────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const uid = await getUid()
    if (!uid) { triggerToast('Sesi tidak ditemukan ❌'); return }
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      setProfileImage(base64)
      const ok = await saveToFirestore({ name, major, semester, studentId, angkatan, bio, profileImage: base64, educationLevel, xp: activeXp, socialLinks }, uid)
      triggerToast(ok ? 'Foto profil tersimpan ✅' : 'Gagal simpan foto ❌')
    }
    reader.readAsDataURL(file)
  }

  // ── saveSocial ───────────────────────────────────────────────────────────────
  const saveSocial = async () => {
    const uid = await getUid()
    if (!uid) { triggerToast('Sesi tidak ditemukan ❌'); return }
    setIsSavingSocial(true)
    const ok = await saveToFirestore({ name, major, semester, studentId, angkatan, bio, profileImage, educationLevel, xp: activeXp, socialLinks: socialDraft }, uid)
    if (ok) { setSocialLinks({ ...socialDraft }); setIsEditingSocial(false); triggerToast('Link sosial tersimpan ✅') }
    else triggerToast('Gagal menyimpan link ❌')
    setIsSavingSocial(false)
  }

  // ── handleLogout ─────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) { triggerToast('Gagal logout ❌'); return }
      localStorage.removeItem('plotwist_profile_backup')
      userIdRef.current = null
      window.location.href = '/login?logout=true'
    } catch { triggerToast('Gagal logout ❌') }
  }

  const questDone   = eduData?.dailyQuests.filter(q => q.done).length ?? 0
  const questTotal  = eduData?.dailyQuests.length ?? 0
  const questPct    = questTotal > 0 ? Math.round((questDone / questTotal) * 100) : 0
  const RANKS       = ['Beginner','Learner','Explorer','Researcher','Mastermind','Legend']
  const RANK_XP     = [0,100,300,600,1000,1800]
  const RANK_ICONS  = ['🌱','📚','🚀','🏆','👑','💎']
  const rankIdx     = RANK_XP.reduce((i, v, j) => activeXp >= v ? j : i, 0)
  const filledLinks = Object.values(socialLinks).filter(v => v.trim() !== '').length
  const earnedCount = badges.filter(b => b.earned).length
  const moodEmoji: Record<string,string> = { semangat:'😊 Semangat', biasa:'😐 Biasa', lelah:'😴 Lelah', burnout:'😵 Burnout' }

  const socialMeta: { key: keyof SocialLinks; label: string; icon: React.ReactNode; placeholder: string; color: string; gradient: string }[] = [
    { key:'linkedin',  label:'LinkedIn',  icon:<FaLinkedin />,  placeholder:'https://linkedin.com/in/username', color:'text-blue-600',   gradient:'from-blue-500 to-blue-700'    },
    { key:'instagram', label:'Instagram', icon:<FaInstagram />, placeholder:'https://instagram.com/username',  color:'text-pink-500',   gradient:'from-pink-500 to-fuchsia-600' },
    { key:'tiktok',    label:'TikTok',    icon:<FaTiktok />,    placeholder:'https://tiktok.com/@username',    color:'text-gray-800',   gradient:'from-gray-800 to-gray-900'    },
    { key:'facebook',  label:'Facebook',  icon:<FaFacebook />,  placeholder:'https://facebook.com/username',   color:'text-blue-700',   gradient:'from-blue-600 to-blue-800'    },
    { key:'twitter',   label:'Twitter/X', icon:<FaTwitter />,   placeholder:'https://twitter.com/username',   color:'text-sky-400',    gradient:'from-sky-400 to-sky-600'      },
    { key:'portfolio', label:'Portfolio', icon:<FaGlobe />,     placeholder:'https://yourportfolio.com',      color:'text-purple-500', gradient:'from-purple-500 to-violet-600' },
  ]

  const eduOptions: { value: EducationLevel; label: string; icon: string; sub: string }[] = [
    { value:'kuliah',  label:'Kuliah',  icon:'🎓', sub:'Mahasiswa universitas / politeknik' },
    { value:'pelajar', label:'Pelajar', icon:'📘', sub:'Siswa SMP / SMA / SMK' },
    { value:'lainnya', label:'Lainnya', icon:'🌐', sub:'Kursus, bootcamp, atau lainnya' },
  ]
  const activeEdu = eduOptions.find(o => o.value === educationLevel)!

  return (
    <>
      <div className={`flex-1 min-h-screen transition-colors duration-300 ${ct.background}`}>
        <div className="p-4 md:p-8 overflow-y-auto">

          {/* ══ HERO ══════════════════════════════════════════════════════════ */}
          <div className={`relative overflow-visible rounded-[40px] bg-gradient-to-r ${ct.hero} p-8 shadow-2xl mb-8`}>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl" />

            {/* Top bar: Jenjang */}
            <div className="relative z-[100] flex items-center gap-3 mb-6">
              <span className="text-white/60 text-sm font-semibold">Jenjang:</span>

              {/* ── Dropdown — ref-based, tanpa overlay ── */}
              <div className="relative z-[200]" ref={dropdownRef}>
                <button
                  onClick={() => setShowEduDropdown(v => !v)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold text-sm px-4 py-2 rounded-2xl transition-all"
                >
                  {activeEdu.icon} {activeEdu.label}
                  <FaChevronDown className={`text-xs transition-transform ${showEduDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showEduDropdown && (
                  <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-2xl overflow-hidden z-[9999] w-64">
                    {eduOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleEducationChange(opt.value)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition hover:bg-purple-50 ${educationLevel === opt.value ? 'bg-purple-50 text-purple-700' : 'text-gray-700'}`}
                      >
                        <span className="text-xl">{opt.icon}</span>
                        <div>
                          <p className="font-bold text-sm">{opt.label}</p>
                          <p className="text-xs text-gray-400">{opt.sub}</p>
                        </div>
                        {educationLevel === opt.value && <FaCheck className="ml-auto text-purple-500 text-xs" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {saveStatus !== 'idle' && (
                <div className={`ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold
                  ${saveStatus==='saving'?'bg-yellow-300 text-black':saveStatus==='saved'?'bg-green-400 text-black':'bg-red-400 text-white'}`}>
                  {saveStatus==='saving'&&<><FaCloudUploadAlt className="animate-bounce"/>Menyimpan...</>}
                  {saveStatus==='saved'&&<><FaCheck/>Tersimpan!</>}
                  {saveStatus==='error'&&<>❌ Gagal</>}
                </div>
              )}
            </div>

            {/* Body: Avatar + Identitas + Buttons */}
            <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative w-[130px] h-[130px] flex-shrink-0">
                <Image src={profileImage} alt="profile" fill className="rounded-full object-cover border-4 border-white/40 shadow-2xl" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="upload-photo" />
                <label htmlFor="upload-photo" className="absolute bottom-0 right-0 bg-white text-purple-500 w-11 h-11 rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition"><FaCamera /></label>
              </div>

              {/* Identitas */}
              <div className="flex-1 space-y-3">
                <input
                  value={isEditMode ? draft.name : name}
                  onChange={e => isEditMode && setDraft(d => ({ ...d, name: e.target.value }))}
                  readOnly={!isEditMode} placeholder="Nama lengkap kamu"
                  className={`bg-transparent text-white text-2xl sm:text-4xl font-extrabold outline-none w-full placeholder-white/40 transition-all truncate ${isEditMode ? 'border-b-2 border-white/40 pb-1' : 'border-b-2 border-transparent pb-1'}`}
                />
                <div className="flex items-center gap-2 flex-wrap">
                  {isEditMode ? (
                    <>
                      <input value={draft.major} onChange={e => setDraft(d => ({ ...d, major: e.target.value }))} placeholder={cfg.levelLabel}
                        className="bg-white/15 border border-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-xl outline-none placeholder-white/40 min-w-[160px]" />
                      <span className="text-white/40">·</span>
                      <input value={draft.semester} onChange={e => setDraft(d => ({ ...d, semester: e.target.value }))} placeholder={cfg.semesterLabel}
                        className="bg-white/15 border border-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-xl outline-none placeholder-white/40 w-[120px]" />
                    </>
                  ) : (
                    <p className="text-white/80 text-base font-medium">{major || <span className="text-white/40 text-sm">{cfg.levelLabel}</span>}{semester ? ` · ${semester}` : ''}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-green-400 text-black text-xs font-extrabold px-3 py-1.5 rounded-xl tracking-wide">ACTIVE</span>
                  {isEditMode
                    ? <input value={draft.studentId} onChange={e => setDraft(d => ({ ...d, studentId: e.target.value }))} placeholder={cfg.idLabel}
                        className="bg-white/15 border border-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-xl outline-none placeholder-white/40 w-[150px]" />
                    : studentId && <span className="bg-white/20 border border-white/25 text-white text-xs font-bold px-4 py-1.5 rounded-xl">{cfg.idLabel}: {studentId}</span>
                  }
                  {isEditMode
                    ? <input value={draft.angkatan} onChange={e => setDraft(d => ({ ...d, angkatan: e.target.value }))} placeholder={cfg.angkatanLabel}
                        className="bg-white/15 border border-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-xl outline-none placeholder-white/40 w-[110px]" />
                    : angkatan && <span className="bg-white/20 border border-white/25 text-white text-xs font-bold px-4 py-1.5 rounded-xl">{cfg.angkatanLabel} {angkatan}</span>
                  }
                  {isProActive
                    ? <span className="bg-gradient-to-r from-yellow-300 to-orange-400 text-black text-xs font-extrabold px-4 py-1.5 rounded-xl">✨ Plotwist Pro</span>
                    : <span className="bg-white/10 border border-white/20 text-white/50 text-xs font-bold px-4 py-1.5 rounded-xl">Free Plan</span>
                  }
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 w-full md:w-auto md:flex-shrink-0 md:min-w-[155px]">
                {!isEditMode
                  ? <button onClick={openEditMode} className="px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 bg-white/20 border border-white/40 text-white hover:bg-white/30 hover:scale-105 active:scale-95 transition-all"><FaEdit /> Edit Profil</button>
                  : <>
                      <button onClick={handleSaveProfile} disabled={isSavingMain}
                        className="px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 bg-white text-purple-600 hover:bg-white/90 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-70">
                        {isSavingMain ? <><FaCloudUploadAlt className="animate-bounce"/>Menyimpan...</> : <><FaSave/>Simpan</>}
                      </button>
                      <button onClick={cancelEditMode} disabled={isSavingMain}
                        className="px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 bg-black/20 border border-white/30 text-white hover:bg-black/30 transition-all">
                        <FaTimes/> Batal
                      </button>
                    </>
                }
                <button onClick={handleLogout} className="px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 bg-red-500/80 text-white hover:bg-red-600 hover:scale-105 active:scale-95 transition-all">
                  <FaSignOutAlt/> Logout
                </button>
                {isEditMode && <p className="text-white/50 text-[11px] text-center leading-relaxed">✏️ Auto-tersimpan saat pindah halaman</p>}
              </div>
            </div>
          </div>

          {/* ══ GRID ═════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 lg:col-span-2 space-y-6">

              {/* ABOUT */}
              <div className={`${ct.card} rounded-[35px] p-8 shadow-xl`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-4xl font-bold ${ct.text}`}>About Me</h2>
                  <span className={`text-sm ${ct.subtext}`}>{isEditMode ? <span className="text-purple-400 flex items-center gap-1"><FaEdit className="text-xs"/>Mode edit aktif</span> : 'Klik Edit Profil untuk mengedit'}</span>
                </div>
                <textarea value={isEditMode ? draft.bio : bio} onChange={e => isEditMode && setDraft(d => ({ ...d, bio: e.target.value }))} readOnly={!isEditMode} placeholder="Ceritakan tentang dirimu..."
                  className={`w-full h-[200px] rounded-3xl p-6 outline-none resize-none text-lg shadow-inner transition-all ${isEditMode ? `ring-2 ring-purple-400 ${ct.soft} ${ct.text}` : `ring-0 cursor-default ${ct.soft} ${ct.text} opacity-90`}`} />
                {isEditMode && (
                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={cancelEditMode} className={`px-5 py-2 rounded-2xl font-semibold ${ct.soft} ${ct.subtext} hover:opacity-80 transition text-sm`}>Batal</button>
                    <button onClick={handleSaveProfile} disabled={isSavingMain} className="flex items-center gap-2 px-6 py-2 rounded-2xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition text-sm disabled:opacity-70">
                      {isSavingMain ? <><FaCloudUploadAlt className="animate-bounce"/>Menyimpan...</> : <><FaSave/>Simpan</>}
                    </button>
                  </div>
                )}
              </div>

              {/* GET CONNECTED */}
              <div className={`${ct.card} rounded-[35px] p-8 shadow-xl`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className={`text-4xl font-bold ${ct.text}`}>Get Connected</h2>
                    <p className={`text-sm mt-1 ${ct.subtext}`}>{filledLinks > 0 ? `${filledLinks} dari 6 link terhubung` : 'Tambahkan link media sosial kamu'}</p>
                  </div>
                  {!isEditingSocial
                    ? <button onClick={() => { setSocialDraft({ ...socialLinks }); setIsEditingSocial(true) }} className="flex items-center gap-2 bg-purple-500/10 text-purple-500 px-5 py-3 rounded-2xl hover:bg-purple-500/20 transition font-semibold"><FaEdit/><span>Edit Link</span></button>
                    : <div className="flex gap-2">
                        <button onClick={saveSocial} className="flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-2xl hover:bg-green-600 transition font-semibold"><FaCheck/>{isSavingSocial?'Menyimpan...':'Simpan'}</button>
                        <button onClick={() => setIsEditingSocial(false)} className={`flex items-center gap-2 ${ct.soft} ${ct.subtext} px-4 py-3 rounded-2xl hover:opacity-80 transition`}><FaTimes/></button>
                      </div>
                  }
                </div>
                {!isEditingSocial ? (
                  <div className="grid grid-cols-2 gap-4">
                    {socialMeta.map(({ key, label, icon, gradient, color }) => {
                      const url = socialLinks[key]
                      return (
                        <div key={key} onClick={() => url && window.open(url,'_blank')}
                          className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${url ? `${ct.soft} hover:scale-[1.02] cursor-pointer` : `${ct.soft} opacity-40`}`}>
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl flex-shrink-0 shadow-md`}>{icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm ${ct.text}`}>{label}</p>
                            {url ? <p className={`text-xs truncate ${ct.subtext}`}>{url}</p> : <p className={`text-xs ${ct.subtext}`}>Belum ditambahkan</p>}
                          </div>
                          {url ? <FaExternalLinkAlt className={`text-sm flex-shrink-0 ${color}`}/> : <FaLink className="text-sm flex-shrink-0 text-gray-300"/>}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {socialMeta.map(({ key, label, icon, gradient, placeholder }) => (
                      <div key={key} className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl flex-shrink-0 shadow-md`}>{icon}</div>
                        <div className="flex-1">
                          <label className={`text-xs font-bold mb-1 block ${ct.subtext}`}>{label}</label>
                          <input type="url" value={socialDraft[key]} onChange={e => setSocialDraft(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                            className={`w-full px-4 py-3 rounded-2xl outline-none text-sm ${ct.soft} ${ct.text} border border-transparent focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30`}/>
                        </div>
                        {socialDraft[key] && <button onClick={() => setSocialDraft(p => ({ ...p, [key]:'' }))} className={`w-9 h-9 rounded-xl flex items-center justify-center ${ct.soft} ${ct.subtext} hover:text-red-400 transition`}><FaTimes/></button>}
                      </div>
                    ))}
                    <div className="flex gap-3 pt-2">
                      <button onClick={saveSocial} className="flex-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white py-4 rounded-2xl font-bold hover:scale-[1.02] transition flex items-center justify-center gap-2">
                        <FaSave/>{isSavingSocial?'Menyimpan...':'Simpan Semua Link'}
                      </button>
                      <button onClick={() => setIsEditingSocial(false)} className={`px-6 py-4 rounded-2xl font-semibold ${ct.soft} ${ct.subtext} hover:opacity-80 transition`}>Batal</button>
                    </div>
                  </div>
                )}
              </div>

              {/* PRODUCTIVITY */}
              <div className={`${ct.card} rounded-[35px] p-8 shadow-xl`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className={`text-4xl font-bold ${ct.text}`}>Productivity Level</h2>
                    <div className="flex items-center gap-2 mt-2">
                      {eduData ? <><FaSync className="text-green-400 text-xs"/><p className="text-green-400 text-sm font-semibold">Synced{lastSync&&<span className="text-green-400/60 ml-1">· {lastSync.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</span>}</p></>
                               : <><FaExclamationTriangle className="text-yellow-400 text-xs"/><p className="text-yellow-400 text-sm font-semibold">Buka Edukasi untuk sync</p></>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-purple-100 text-purple-600 px-6 py-3 rounded-2xl font-bold text-xl mb-1">LVL {activeLevel}</div>
                    <div className="text-xs text-center font-bold text-purple-500">{RANK_ICONS[rankIdx]} {RANKS[rankIdx]}</div>
                  </div>
                </div>
                <div className="mb-6">
                  <div className={`flex justify-between mb-3 ${ct.subtext}`}><span>{activeXp.toLocaleString()} XP Total</span><span>Target LVL {activeLevel+1}</span></div>
                  <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-700" style={{ width:`${activeXpPct}%` }}/>
                  </div>
                  <p className={`text-sm mt-2 ${ct.subtext}`}>{activeXpProg.toLocaleString()} / {activeMaxXp.toLocaleString()} XP</p>
                </div>
                {eduData && (
                  <>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      {[{icon:'🪙',label:'Koin',value:eduData.coins},{icon:'🔥',label:'Streak',value:`${eduData.streak}h`},{icon:'💚',label:'Energi',value:`${eduData.energy}/${eduData.maxEnergy}`},{icon:'⏱',label:'Fokus',value:eduData.focusSessions}].map(({icon,label,value})=>(
                        <div key={label} className={`${ct.soft} rounded-2xl p-4 text-center`}><p className="text-2xl mb-1">{icon}</p><p className={`text-base font-bold ${ct.text}`}>{value}</p><p className={`text-xs ${ct.subtext}`}>{label}</p></div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[{icon:'📝',label:'Catatan',value:eduData.noteCount},{icon:'🧠',label:'AI Analisis',value:eduData.aiAnalyzeCount},{icon:'⚡',label:'Flashcard',value:eduData.flashcardViewed}].map(({icon,label,value})=>(
                        <div key={label} className={`${ct.soft} rounded-2xl p-4 text-center`}><p className="text-xl mb-1">{icon}</p><p className={`text-base font-bold ${ct.text}`}>{value}</p><p className={`text-xs ${ct.subtext}`}>{label}</p></div>
                      ))}
                    </div>
                    <div className={`${ct.soft} rounded-2xl p-5 mb-6 flex items-center gap-4`}>
                      <div className="text-3xl">{eduData.mood==='semangat'?'😊':eduData.mood==='biasa'?'😐':eduData.mood==='lelah'?'😴':'😵'}</div>
                      <div><p className={`font-bold ${ct.text}`}>Mood: {moodEmoji[eduData.mood]??eduData.mood}</p><p className={`text-xs ${ct.subtext}`}>Dari Plotwist Edu · hari ini</p></div>
                    </div>
                    {eduData.dailyQuests.length > 0 && (
                      <div className={`${ct.soft} rounded-2xl p-5 mb-6`}>
                        <div className="flex justify-between items-center mb-3"><p className={`font-bold ${ct.text}`}>🎯 Daily Quest</p><span className={`text-sm font-bold ${ct.subtext}`}>{questDone}/{questTotal} · {questPct}%</span></div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4"><div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" style={{width:`${questPct}%`}}/></div>
                        {eduData.dailyQuests.map(q=>(
                          <div key={q.id} className="flex items-center gap-3 mb-2">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${q.done?'bg-purple-500 text-white':`${ct.card} border border-gray-300`}`}>{q.done?'✓':''}</div>
                            <span className={`text-sm font-semibold flex-1 ${q.done?`${ct.subtext} line-through`:ct.text}`}>{q.icon} {q.label}</span>
                            <span className="text-xs text-purple-400 font-bold">+{q.xp} XP</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold ${ct.text}`}>Badges</h3>
                  <span className="text-sm font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-600">{earnedCount}/{badges.length} Unlocked</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {badges.map(badge=>(
                    <div key={badge.id}
                      className={`relative rounded-3xl p-6 shadow-xl transition-all duration-300 ${badge.earned?`bg-gradient-to-br ${badge.gradient} text-white hover:scale-105 cursor-pointer`:`${ct.soft} opacity-40 grayscale cursor-not-allowed`}`}
                      title={badge.earned?`${badge.label} — Unlocked!`:`Butuh ${badge.xpRequired.toLocaleString()} XP`}>
                      {badge.icon}
                      <h3 className={`font-bold text-base ${badge.earned?'text-white':ct.text}`}>{badge.label}</h3>
                      {!badge.earned&&<><div className="absolute top-2 right-2"><FaLock className="text-gray-400 text-sm"/></div><p className={`text-xs mt-1 ${ct.subtext}`}>{badge.xpRequired.toLocaleString()} XP</p></>}
                      {badge.earned&&<div className="absolute top-2 right-2"><FaCheck className="text-white/80 text-sm"/></div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              {/* INTEGRATION */}
              <div className={`${ct.card} rounded-[35px] p-6 shadow-xl`}>
                <h2 className={`text-3xl font-bold mb-6 ${ct.text}`}>Integration</h2>
                <div className="space-y-4">
                  {[
                    { icon:<FaGoogle className="text-red-500 text-2xl"/>, label:'Google Calendar', status:'Connected', color:'text-green-500' },
                    { icon:<FaGithub className={`text-2xl ${ct.text}`}/>, label:'GitHub', status:'Expired', color:'text-yellow-500', onClick:()=>triggerToast('Menghubungkan GitHub... 🔗') },
                    { icon:<span className="text-2xl">🎓</span>, label:'Plotwist Edu', status:eduData?'Synced':'Waiting', color:eduData?'text-green-500':'text-yellow-500' },
                  ].map(item=>(
                    <div key={item.label} className={`${ct.soft} p-5 rounded-3xl flex justify-between items-center`}>
                      <div className="flex items-center gap-3">{item.icon}<span className={`${ct.text} font-semibold text-lg`}>{item.label}</span></div>
                      <button onClick={item.onClick} className={`font-bold text-lg ${item.color}`}>{item.status}</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SETTINGS */}
              <div className={`${ct.card} rounded-[35px] p-6 shadow-xl`}>
                <h2 className={`text-3xl font-bold mb-6 ${ct.text}`}>Settings Hub</h2>
                <div className="space-y-3">
                  {[{id:'appearance',icon:<FaPalette/>,label:'Appearance'},{id:'notifications',icon:<FaBell/>,label:'Notifications'},{id:'security',icon:<FaLock/>,label:'Security'},{id:'help',icon:<FaQuestionCircle/>,label:'Help Center'}].map(item=>(
                    <button key={item.id} onClick={()=>setActiveSetting(item.id)}
                      className={`w-full p-4 rounded-2xl flex items-center gap-3 border transition-all ${activeSetting===item.id?ct.active:`${ct.soft} ${ct.text}`}`}>
                      {item.icon}<span className="font-semibold text-lg">{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  {activeSetting==='appearance'&&(
                    <div className={`${ct.soft} rounded-3xl p-5 space-y-5`}>
                      <h3 className={`text-2xl font-bold ${ct.text}`}>Appearance</h3>
                      <div className="flex justify-between items-center">
                        <span className={`${ct.text} font-medium`}>Dark Mode</span>
                        <button onClick={()=>{setDarkMode(!darkMode);triggerToast(darkMode?'Light Mode ☀️':'Dark Mode 🌙')}} className={`w-16 h-8 rounded-full transition ${darkMode?'bg-purple-500':'bg-gray-300'}`}>
                          <div className={`w-7 h-7 bg-white rounded-full shadow-md transform transition ${darkMode?'translate-x-8':'translate-x-1'}`}/>
                        </button>
                      </div>
                      <div>
                        <p className={`${ct.text} font-medium mb-3`}>Theme</p>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.keys(themes).map(t=>(
                            <button key={t} onClick={()=>{setTheme(t);triggerToast(`Theme "${t}" aktif 🎨`)}}
                              className={`p-3 rounded-2xl font-semibold transition-all ${theme===t?ct.active:'bg-white text-gray-700'}`}>{t}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {activeSetting==='notifications'&&(
                    <div className={`${ct.soft} rounded-3xl p-5 space-y-5`}>
                      <h3 className={`text-2xl font-bold ${ct.text}`}>Notifications</h3>
                      <div className="flex justify-between items-center">
                        <span className={`${ct.text} font-medium`}>Deadline Reminder</span>
                        <button onClick={()=>{setNotification(!notification);triggerToast(notification?'Off':'On 🔔')}} className={`px-5 py-2 rounded-full font-semibold transition-all ${notification?'bg-pink-500 text-white':'bg-gray-300 text-black'}`}>{notification?'ON':'OFF'}</button>
                      </div>
                      <div className={`${ct.card} rounded-2xl p-4`}>
                        <div className="flex items-center gap-2 mb-3"><FaVolumeUp className="text-pink-400 text-sm"/><span className={`text-sm font-bold ${ct.text}`}>Nada Dering Deadline</span></div>
                        <div className="flex gap-2 flex-wrap">
                          {ringtoneOptions.map(opt=>(
                            <div key={String(opt.value)} className="flex items-center gap-1">
                              <button onClick={()=>{setDeadlineRingtone(opt.value);triggerToast(`Nada: ${opt.label}`)}} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${deadlineRingtone===opt.value?'bg-pink-500 text-white':`${ct.soft} ${ct.text}`}`}>{opt.label}</button>
                              {opt.value!==null&&<button onClick={()=>playingAudio===opt.value?stopAudio():playPreview(opt.value as 'musik1'|'musik2')} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${playingAudio===opt.value?'bg-pink-500 text-white animate-pulse':`${ct.soft} ${ct.subtext}`}`}>{playingAudio===opt.value?<FaStop className="text-xs"/>:<FaPlay className="text-xs"/>}</button>}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`${ct.text} font-medium`}>Email Notifications</span>
                        <button onClick={()=>{setEmailNotif(!emailNotif);triggerToast(emailNotif?'Off':'On 📧')}} className={`px-5 py-2 rounded-full font-semibold transition-all ${emailNotif?'bg-purple-500 text-white':'bg-gray-300 text-black'}`}>{emailNotif?'ON':'OFF'}</button>
                      </div>
                      <div className={`${ct.card} rounded-2xl p-4`}>
                        <div className="flex items-center gap-2 mb-3"><FaVolumeUp className="text-purple-400 text-sm"/><span className={`text-sm font-bold ${ct.text}`}>Nada Dering Email</span></div>
                        <div className="flex gap-2 flex-wrap">
                          {ringtoneOptions.map(opt=>(
                            <div key={String(opt.value)} className="flex items-center gap-1">
                              <button onClick={()=>{setEmailRingtone(opt.value);triggerToast(`Nada email: ${opt.label}`)}} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${emailRingtone===opt.value?'bg-purple-500 text-white':`${ct.soft} ${ct.text}`}`}>{opt.label}</button>
                              {opt.value!==null&&<button onClick={()=>playingAudio===opt.value?stopAudio():playPreview(opt.value as 'musik1'|'musik2')} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${playingAudio===opt.value?'bg-purple-500 text-white animate-pulse':`${ct.soft} ${ct.subtext}`}`}>{playingAudio===opt.value?<FaStop className="text-xs"/>:<FaPlay className="text-xs"/>}</button>}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={ct.text}>Notification Sound</span>
                        <button onClick={()=>{setNotificationSound(!notificationSound);triggerToast(notificationSound?'Suara Off 🔇':'Suara On 🔊')}} className={`px-5 py-2 rounded-full font-semibold transition-all ${notificationSound?'bg-cyan-500 text-white':'bg-gray-300 text-black'}`}>{notificationSound?'ON':'OFF'}</button>
                      </div>
                      <div className={`${ct.card} rounded-2xl p-4 ${ct.text}`}>Quiet Mode: 23.00 - 06.00 🌙</div>
                    </div>
                  )}
                  {activeSetting==='security'&&(
                    <div className={`${ct.soft} rounded-3xl p-5 space-y-5`}>
                      <h3 className={`text-2xl font-bold ${ct.text}`}>Security</h3>
                      <div className="flex justify-between items-center">
                        <span className={ct.text}>Two Factor Auth</span>
                        <button onClick={()=>{setTwoFactor(!twoFactor);triggerToast(twoFactor?'2FA Disabled 🔓':'2FA Enabled 🔐')}} className={`px-5 py-2 rounded-full font-semibold transition-all ${twoFactor?'bg-blue-500 text-white':'bg-gray-300 text-black'}`}>{twoFactor?'Enabled':'Disabled'}</button>
                      </div>
                      <div className={`${ct.card} rounded-2xl p-4`}>
                        <h4 className={`font-bold mb-3 ${ct.text}`}>Active Devices</h4>
                        {securityLog.map((d,i)=>(
                          <div key={i} className={`flex items-center justify-between mb-2 ${ct.text}`}>
                            <span>{d}</span><button onClick={()=>triggerToast(`${d} logged out 🚪`)} className="text-red-400 hover:text-red-500 font-semibold">Logout</button>
                          </div>
                        ))}
                      </div>
                      <div className={`${ct.card} rounded-2xl p-4 ${ct.text}`}>Face ID Authentication Ready 🔐</div>
                    </div>
                  )}
                  {activeSetting==='help'&&(
                    <div className={`${ct.soft} rounded-3xl p-5 space-y-4`}>
                      <h3 className={`text-2xl font-bold ${ct.text}`}>Help Center</h3>
                      {['📘 Tutorial SISKA Integration','🐞 Report Bug','💡 Feature Request','❓ FAQ & Support'].map(item=>(
                        <button key={item} onClick={()=>{setSelectedHelp(item);setHelpModal(true)}} className={`w-full ${ct.card} rounded-2xl p-4 text-left hover:scale-[1.01] transition ${ct.text}`}>{item}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* PLOTWIST PRO */}
              <div className="rounded-[35px] p-8 bg-gradient-to-br from-[#111827] to-[#581C87] text-white shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-purple-500/20 blur-3xl rounded-full"/>
                <div className="relative z-10">
                  <FaCrown className="text-yellow-300 text-5xl mb-5"/>
                  <h2 className="text-4xl font-bold mb-2">Plotwist Pro</h2>
                  {isProActive&&<div className="inline-flex items-center gap-2 bg-yellow-300/20 border border-yellow-300/40 text-yellow-200 text-sm font-bold px-4 py-2 rounded-2xl mb-4"><FaCheck/> Aktif</div>}
                  <div className="space-y-2 mb-6">
                    <div className={`flex items-center gap-3 text-sm px-4 py-3 rounded-2xl ${isProActive?'bg-yellow-300/10 border border-yellow-300/30 text-yellow-200':'bg-white/5 border border-white/10 text-white/50'}`}>
                      <span className="text-lg">🐾</span>
                      <div><p className="font-bold">Pet Academy</p><p className="text-xs opacity-70">Pelihara maskot & unlock evolusi langka</p></div>
                      {isProActive?<FaCheck className="ml-auto text-yellow-300 flex-shrink-0"/>:<FaLock className="ml-auto text-white/30 flex-shrink-0"/>}
                    </div>
                    {[{icon:'🧠',label:'AI Insights',desc:'Analisis belajar berbasis AI'},{icon:'🎨',label:'Premium Themes',desc:'Tema eksklusif Plotwist'},{icon:'📊',label:'Advanced Analytics',desc:'Statistik produktivitas lengkap'}].map(f=>(
                      <div key={f.label} className="flex items-center gap-3 text-sm px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/40">
                        <span className="text-lg">{f.icon}</span>
                        <div><p className="font-bold">{f.label}</p><p className="text-xs opacity-70">{f.desc}</p></div>
                        <span className="ml-auto text-xs bg-white/10 px-2 py-1 rounded-full">Soon</span>
                      </div>
                    ))}
                  </div>
                  {isProActive
                    ? <div className="w-full bg-yellow-300/20 border border-yellow-300/30 text-yellow-200 py-4 rounded-2xl font-bold text-center">✨ Pro Member — Pet Academy Terbuka!</div>
                    : <div className="w-full bg-white/10 border border-white/20 text-white/60 py-4 rounded-2xl font-bold text-center text-sm">
                        🔒 Capai <span className="text-yellow-300">Level 2</span> untuk unlock Pet Academy
                        <p className="text-xs font-normal mt-1 opacity-60">Level {activeLevel} · butuh {Math.max(0,1000-activeXp).toLocaleString()} XP lagi</p>
                      </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showToast&&<div className="fixed bottom-8 right-8 z-50 bg-black text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce">{toastMessage}</div>}

      {helpModal&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className={`${ct.card} w-[500px] rounded-[35px] p-8 shadow-2xl`}>
            <h2 className={`text-3xl font-bold mb-4 ${ct.text}`}>{selectedHelp}</h2>
            <p className={`${ct.subtext} leading-relaxed`}>Fitur ini sedang dalam pengembangan. Plotwist AI Support akan segera hadir 🚀</p>
            <button onClick={()=>setHelpModal(false)} className="mt-6 w-full bg-purple-500 text-white py-3 rounded-2xl font-bold hover:bg-purple-600 transition">Tutup</button>
          </div>
        </div>
      )}
    </>
  )
}