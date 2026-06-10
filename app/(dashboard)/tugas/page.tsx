'use client'

import {
  FaPlus, FaTimes, FaEdit, FaTrash, FaCheck, FaClock,
  FaUsers, FaFire, FaStar, FaChevronDown, FaChevronUp,
  FaPaperclip, FaLink, FaUpload, FaPlay, FaPause, FaRedo,
  FaTrophy, FaBolt, FaTag, FaEllipsisH, FaGripVertical,
  FaUserCircle, FaMedal, FaBookOpen, FaSave, FaExclamationTriangle,
  FaChartBar, FaThLarge, FaTable, FaChartLine
} from 'react-icons/fa'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import MascotPopup from '@/components/MascotPopup'

// ======================================================
// TYPES
// ======================================================

type Priority = 'urgent' | 'medium' | 'low'
type Status   = 'todo' | 'inprogress' | 'done'
type TaskType = 'individual' | 'group'
type ViewMode = 'kanban' | 'matrix' | 'stats'

interface SubTask {
  id: number
  text: string
  done: boolean
}

interface Attachment {
  id: number
  label: string
  url: string
  type: 'link' | 'file'
}

interface Member {
  id: number
  name: string
  avatar: string
  color: string
}

interface Task {
  id: number
  title: string
  subject: string
  priority: Priority
  status: Status
  type: TaskType
  deadline: string
  description: string
  subtasks: SubTask[]
  attachments: Attachment[]
  members: Member[]
  xpEarned: number
  pomodoroSessions: number
  antiSKS: boolean
  importance: 'high' | 'low'
  completedAt?: string
  proof?: { type: 'photo' | 'link' | 'file'; label: string; url: string }
}

// ======================================================
// CONSTANTS
// ======================================================

const PRIORITY_CONFIG: Record<Priority, { label: string; bg: string; text: string; border: string; dot: string; cardBorder: string }> = {
  urgent: {
    label: 'Deadline <24 jam',
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-300',
    dot: 'bg-red-500',
    cardBorder: 'border-red-400',
  },
  medium: {
    label: 'Deadline 2-3 hari',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-300',
    dot: 'bg-amber-400',
    cardBorder: 'border-amber-400',
  },
  low: {
    label: 'Masih lama',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-300',
    dot: 'bg-teal-500',
    cardBorder: 'border-teal-400',
  },
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  todo:       { label: 'To-Do',       color: 'text-gray-600',   bg: 'bg-gray-100' },
  inprogress: { label: 'In Progress', color: 'text-blue-700',   bg: 'bg-blue-100' },
  done:       { label: 'Selesai',     color: 'text-green-700',  bg: 'bg-green-100' },
}

const DEFAULT_SUBJECTS = [
  'Algoritma & Pemrograman', 'Basis Data', 'Jaringan Komputer',
  'UI/UX Design', 'Kalkulus', 'Fisika', 'Bahasa Inggris', 'PKN', 'Lainnya'
]

const MEMBER_COLORS = [
  'bg-purple-200 text-purple-700', 'bg-sky-200 text-sky-700',
  'bg-pink-200 text-pink-700',     'bg-orange-200 text-orange-700',
  'bg-green-200 text-green-700',   'bg-yellow-200 text-yellow-700',
]

function getRelativeDate(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

function makeSampleTasks(): Task[] {
  return [
    {
      id: 1, title: 'Buat Makalah Jaringan Komputer', subject: 'Jaringan Komputer',
      priority: 'urgent', status: 'inprogress', type: 'individual',
      deadline: getRelativeDate(1),
      description: 'Tulis makalah minimal 15 halaman tentang topologi jaringan.',
      subtasks: [
        { id: 1, text: 'Cari jurnal referensi (min. 5)', done: true },
        { id: 2, text: 'Susun BAB 1 Pendahuluan', done: true },
        { id: 3, text: 'Tulis BAB 2 Tinjauan Pustaka', done: false },
        { id: 4, text: 'Buat PPT presentasi', done: false },
      ],
      attachments: [
        { id: 1, label: 'Google Drive Makalah', url: '#', type: 'link' },
        { id: 2, label: 'PDF Materi Dosen', url: '#', type: 'file' },
      ],
      members: [], xpEarned: 0, pomodoroSessions: 3, antiSKS: false, importance: 'high',
    },
    {
      id: 2, title: 'Project UI/UX Dashboard', subject: 'UI/UX Design',
      priority: 'medium', status: 'inprogress', type: 'group',
      deadline: getRelativeDate(3),
      description: 'Rancang UI dashboard aplikasi manajemen tugas mahasiswa.',
      subtasks: [
        { id: 1, text: 'Wireframe lo-fi di Figma', done: true },
        { id: 2, text: 'Design sistem warna & tipografi', done: false },
        { id: 3, text: 'Prototype hi-fi', done: false },
      ],
      attachments: [
        { id: 1, label: 'Figma Project Link', url: '#', type: 'link' },
      ],
      members: [
        { id: 1, name: 'Andi', avatar: 'AN', color: MEMBER_COLORS[0] },
        { id: 2, name: 'Budi', avatar: 'BU', color: MEMBER_COLORS[1] },
        { id: 3, name: 'Cinta', avatar: 'CI', color: MEMBER_COLORS[2] },
      ],
      xpEarned: 0, pomodoroSessions: 1, antiSKS: false, importance: 'high',
    },
    {
      id: 3, title: 'Latihan Soal UTS Basis Data', subject: 'Basis Data',
      priority: 'low', status: 'todo', type: 'individual',
      deadline: getRelativeDate(8),
      description: 'Kerjakan 50 soal latihan dari modul 3-5.',
      subtasks: [
        { id: 1, text: 'Modul 3: DDL & DML', done: false },
        { id: 2, text: 'Modul 4: JOIN queries', done: false },
        { id: 3, text: 'Modul 5: Normalisasi', done: false },
      ],
      attachments: [], members: [], xpEarned: 0, pomodoroSessions: 0, antiSKS: false, importance: 'high',
    },
    {
      id: 4, title: 'Laporan Praktikum Algoritma', subject: 'Algoritma & Pemrograman',
      priority: 'low', status: 'done', type: 'individual',
      deadline: getRelativeDate(-2),
      description: 'Buat laporan hasil praktikum sorting algorithm.',
      subtasks: [
        { id: 1, text: 'Kode program bubble sort', done: true },
        { id: 2, text: 'Analisis kompleksitas', done: true },
        { id: 3, text: 'Tulis laporan PDF', done: true },
      ],
      attachments: [
        { id: 1, label: 'Repository GitHub', url: '#', type: 'link' },
      ],
      members: [], xpEarned: 150, pomodoroSessions: 5, antiSKS: true, importance: 'high',
      completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 5, title: 'Update Bio Instagram', subject: 'Lainnya',
      priority: 'low', status: 'todo', type: 'individual',
      deadline: getRelativeDate(14),
      description: 'Gak penting-penting banget, bisa nanti.',
      subtasks: [], attachments: [], members: [],
      xpEarned: 0, pomodoroSessions: 0, antiSKS: false, importance: 'low',
    },
  ]
}

// ======================================================
// HELPERS
// ======================================================

function daysUntil(dateStr: string): number {
  const now    = new Date(); now.setHours(0,0,0,0)
  const target = new Date(dateStr); target.setHours(0,0,0,0)
  return Math.round((target.getTime() - now.getTime()) / 86_400_000)
}

function formatDeadline(dateStr: string): string {
  const d = daysUntil(dateStr)
  if (d < 0)  return `${Math.abs(d)} hari lalu`
  if (d === 0) return 'Hari ini!'
  if (d === 1) return 'Besok!'
  return `${d} hari lagi`
}

function autoPriority(dateStr: string): Priority {
  const d = daysUntil(dateStr)
  if (d <= 1)  return 'urgent'
  if (d <= 3)  return 'medium'
  return 'low'
}

// ======================================================
// useLocalStorage HOOK
// ======================================================

function readFromStorage<T>(key: string, initial: T): T {
  // Hanya berjalan di client (browser)
  if (typeof window === 'undefined') return initial
  try {
    const stored = window.localStorage.getItem(key)
    if (stored !== null) return JSON.parse(stored) as T
  } catch {}
  return initial
}

function useLocalStorage<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Lazy initializer: baca localStorage SINKRON saat pertama kali state dibuat
  // Ini mencegah state mulai dari nilai kosong lalu di-overwrite oleh useEffect
  const [value, setValue] = useState<T>(() => readFromStorage(key, initial))

  // Simpan ke localStorage setiap kali value berubah
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value])

  return [value, setValue]
}

// ── Helper: langsung tulis ke localStorage tanpa menunggu re-render ──
function flushToLocalStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

// ======================================================
// CONFETTI
// ======================================================

function spawnConfetti() {
  const colors = ['#22C55E','#F97316','#FACC15','#38BDF8','#6366F1','#EC4899']
  const container = document.body
  for (let i = 0; i < 48; i++) {
    const el = document.createElement('div')
    el.style.cssText = `
      position:fixed;top:${Math.random()*40+20}%;left:${Math.random()*100}%;
      width:${Math.random()*8+5}px;height:${Math.random()*8+5}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:${Math.random()>0.5?'50%':'2px'};
      pointer-events:none;z-index:9999;
      animation:confettiFall ${Math.random()*1+0.8}s ease-in forwards;
      animation-delay:${Math.random()*0.4}s;
    `
    container.appendChild(el)
    setTimeout(() => el.remove(), 2000)
  }
}

// ======================================================
// STREAK TOAST
// ======================================================

function StreakToast({ streak, onDone }: { streak: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] animate-bounce">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-lg">
        <FaFire className="text-yellow-300 text-2xl" />
        <span>{streak} hari streak! 🔥</span>
      </div>
    </div>
  )
}

// ======================================================
// XP TOAST
// ======================================================

function XPToast({ xp, antiSKS, onDone }: { xp: number; antiSKS: boolean; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999]" style={{ animation: 'slideUp 0.3s ease-out, fadeOut 0.5s ease-in 2s forwards' }}>
      <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-lg ${antiSKS ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'}`}>
        <FaBolt className="text-yellow-200" />
        <span>+{xp} XP {antiSKS ? '🏆 Anti-SKS!' : 'earned!'}</span>
      </div>
    </div>
  )
}

// ======================================================
// AUTO-SAVE INDICATOR
// ======================================================

function AutoSaveIndicator({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold animate-pulse">
      <FaCheck className="text-[10px]" /> Tersimpan otomatis
    </div>
  )
}

// ======================================================
// PROOF UPLOAD MODAL
// ======================================================

interface ProofUploadModalProps {
  taskTitle: string
  onConfirm: (proof: { type: 'photo' | 'link' | 'file'; label: string; url: string }) => void
  onClose: () => void
}

function ProofUploadModal({ taskTitle, onConfirm, onClose }: ProofUploadModalProps) {
  const [tab, setTab] = useState<'photo' | 'link' | 'file'>('photo')
  const [linkUrl, setLinkUrl]     = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [preview, setPreview]     = useState<string | null>(null)
  const [fileName, setFileName]   = useState<string | null>(null)
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null)
  const [error, setError]         = useState('')
  const photoRef = useRef<HTMLInputElement>(null)
  const fileRef  = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setPreview(ev.target?.result as string)
      setFileDataUrl(ev.target?.result as string)
      setFileName(file.name)
    }
    reader.readAsDataURL(file)
    setError('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setFileDataUrl(ev.target?.result as string)
      setFileName(file.name)
    }
    reader.readAsDataURL(file)
    setError('')
  }

  const handleSubmit = () => {
    if (tab === 'photo') {
      if (!fileDataUrl) { setError('Upload foto bukti dulu ya!'); return }
      onConfirm({ type: 'photo', label: fileName ?? 'Foto Bukti', url: fileDataUrl })
    } else if (tab === 'link') {
      if (!linkUrl.trim()) { setError('Masukkan URL buktinya dulu!'); return }
      onConfirm({ type: 'link', label: linkLabel.trim() || linkUrl.trim(), url: linkUrl.trim() })
    } else {
      if (!fileDataUrl) { setError('Upload file bukti dulu ya!'); return }
      onConfirm({ type: 'file', label: fileName ?? 'File Bukti', url: fileDataUrl })
    }
  }

  const tabs: { key: 'photo' | 'link' | 'file'; emoji: string; label: string }[] = [
    { key: 'photo', emoji: '📸', label: 'Foto' },
    { key: 'link',  emoji: '🔗', label: 'Link' },
    { key: 'file',  emoji: '📄', label: 'File' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-6 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <FaTrophy className="text-yellow-300 text-sm" />
                </div>
                <span className="text-sm font-bold opacity-90">Hampir selesai!</span>
              </div>
              <h2 className="text-xl font-bold leading-tight">Upload Bukti Penyelesaian</h2>
              <p className="text-sm opacity-80 mt-1 line-clamp-1">"{taskTitle}"</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition shrink-0">
              <FaTimes className="text-white text-sm" />
            </button>
          </div>
          <div className="mt-4 bg-white/15 rounded-2xl px-4 py-3 flex items-center gap-3">
            <FaBolt className="text-yellow-300 text-lg shrink-0" />
            <p className="text-sm font-medium">Upload bukti → dapat XP & streak! 🔥 Tanpa bukti, tugas belum bisa ditandai selesai.</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex bg-gray-100 rounded-2xl p-1 gap-1 mb-5">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError('') }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition ${
                  tab === t.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>

          {tab === 'photo' && (
            <div>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              {preview ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-green-200 mb-3">
                  <img src={preview} alt="Bukti" className="w-full max-h-52 object-cover" />
                  <button
                    onClick={() => { setPreview(null); setFileDataUrl(null); setFileName(null); if (photoRef.current) photoRef.current.value = '' }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition"
                  >
                    <FaTimes className="text-white text-xs" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                    <p className="text-white text-xs font-medium truncate">{fileName}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => photoRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-green-300 hover:bg-green-50 transition mb-3 group"
                >
                  <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-green-100 flex items-center justify-center transition">
                    <FaUpload className="text-gray-400 group-hover:text-green-500 text-xl transition" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-700 group-hover:text-green-700 transition">Klik untuk upload foto</p>
                    <p className="text-xs text-gray-400 mt-1">Foto screenshot, hasil print, atau foto fisik tugas</p>
                  </div>
                </button>
              )}
            </div>
          )}

          {tab === 'link' && (
            <div className="space-y-3 mb-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">URL Bukti *</label>
                <div className="relative">
                  <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    autoFocus
                    className="w-full border-2 border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-gray-800 focus:border-green-400 focus:outline-none transition"
                    placeholder="https://drive.google.com/... atau link tugas"
                    value={linkUrl}
                    onChange={e => { setLinkUrl(e.target.value); setError('') }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Label (opsional)</label>
                <input
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:border-green-400 focus:outline-none transition"
                  placeholder="Contoh: Google Drive Tugas, GitHub Repo..."
                  value={linkLabel}
                  onChange={e => setLinkLabel(e.target.value)}
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 text-xs text-blue-600">
                💡 Bisa berupa link Google Drive, GitHub, Notion, Figma, atau platform lainnya
              </div>
            </div>
          )}

          {tab === 'file' && (
            <div>
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
              {fileName ? (
                <div className="border-2 border-green-200 bg-green-50 rounded-2xl px-5 py-4 flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                    <FaPaperclip className="text-green-500 text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{fileName}</p>
                    <p className="text-xs text-green-600 mt-0.5">File siap diupload ✓</p>
                  </div>
                  <button
                    onClick={() => { setFileName(null); setFileDataUrl(null); if (fileRef.current) fileRef.current.value = '' }}
                    className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 transition"
                  >
                    <FaTimes className="text-gray-400 hover:text-red-400 text-xs" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-green-300 hover:bg-green-50 transition mb-3 group"
                >
                  <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-green-100 flex items-center justify-center transition">
                    <FaPaperclip className="text-gray-400 group-hover:text-green-500 text-xl transition" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-700 group-hover:text-green-700 transition">Klik untuk upload file</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, Word, ZIP, atau file apapun sebagai bukti</p>
                  </div>
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2 mb-4">
              <FaExclamationTriangle className="text-red-400 text-sm shrink-0" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold hover:bg-gray-200 transition text-sm">
              Nanti Dulu
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-2xl font-bold hover:scale-[1.02] transition shadow-lg text-sm flex items-center justify-center gap-2"
            >
              <FaTrophy className="text-yellow-300" /> Tandai Selesai!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ======================================================
// PANIC ZONE BANNER
// ======================================================

function PanicZone({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (t: Task) => void }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed || tasks.length === 0) return null
  return (
    <div className="mb-6 rounded-[24px] border-2 border-red-400 bg-red-50 p-5 relative overflow-hidden" style={{ animation: 'panicPulse 1.5s ease-in-out infinite' }}>
      <div className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-orange-100/50 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
              <FaExclamationTriangle className="text-white text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-red-700 text-lg">🚨 ZONA DARURAT — Anti-SKS Aktif!</h3>
              <p className="text-sm text-red-500">{tasks.length} tugas hampir kena sistem kebut semalam</p>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition">
            <FaTimes className="text-red-400 text-sm" />
          </button>
        </div>
        <div className="flex gap-3 flex-wrap">
          {tasks.map(t => (
            <button
              key={t.id}
              onClick={() => onTaskClick(t)}
              className="flex items-center gap-2 bg-white border-2 border-red-300 rounded-2xl px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 transition shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              {t.title}
              <span className="text-xs text-red-400 font-normal">· {formatDeadline(t.deadline)}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-red-400 mt-3">💡 Tip: Klik tugas di atas → ubah status ke "In Progress" untuk keluar dari Zona Darurat</p>
      </div>
    </div>
  )
}

// ======================================================
// PRIORITY MATRIX VIEW
// ======================================================

const MATRIX_QUADRANTS = [
  {
    id: 'q1', label: 'Do It Now', subtitle: 'Mendesak & Penting',
    emoji: '🔥', urgency: 'high', importance: 'high',
    bg: 'bg-red-50', border: 'border-red-200', headerBg: 'bg-red-100', textColor: 'text-red-700',
    desc: 'Deadline mepet & bobot nilai tinggi'
  },
  {
    id: 'q2', label: 'Schedule It', subtitle: 'Penting, Gak Mendesak',
    emoji: '📅', urgency: 'low', importance: 'high',
    bg: 'bg-blue-50', border: 'border-blue-200', headerBg: 'bg-blue-100', textColor: 'text-blue-700',
    desc: 'Rencanakan kapan mengerjakannya'
  },
  {
    id: 'q3', label: 'Selesaikan Cepat', subtitle: 'Mendesak, Gak Penting',
    emoji: '⚡', urgency: 'high', importance: 'low',
    bg: 'bg-amber-50', border: 'border-amber-200', headerBg: 'bg-amber-100', textColor: 'text-amber-700',
    desc: 'Selesaikan singkat atau delegasikan'
  },
  {
    id: 'q4', label: 'Eliminate', subtitle: 'Gak Mendesak & Gak Penting',
    emoji: '🗑️', urgency: 'low', importance: 'low',
    bg: 'bg-gray-50', border: 'border-gray-200', headerBg: 'bg-gray-100', textColor: 'text-gray-600',
    desc: 'Pertimbangkan untuk dihapus'
  },
]

function PriorityMatrix({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (t: Task) => void }) {
  const getQuadrantTasks = (urgency: string, importance: string) => {
    return tasks.filter(t => {
      if (t.status === 'done') return false
      const isUrgent = daysUntil(t.deadline) <= 3
      const isImportant = t.importance === 'high'
      if (urgency === 'high' && importance === 'high') return isUrgent && isImportant
      if (urgency === 'low'  && importance === 'high') return !isUrgent && isImportant
      if (urgency === 'high' && importance === 'low')  return isUrgent && !isImportant
      return !isUrgent && !isImportant
    })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-2xl px-4 py-2">
          <span className="font-semibold">Y-axis:</span> Urgensi (Deadline)
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-2xl px-4 py-2">
          <span className="font-semibold">X-axis:</span> Bobot/Kepentingan
        </div>
        <span className="text-xs text-gray-400 ml-2">* Buka detail tugas untuk ubah bobot</span>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {MATRIX_QUADRANTS.map(q => {
          const qtasks = getQuadrantTasks(q.urgency, q.importance)
          return (
            <div key={q.id} className={`rounded-[24px] border-2 ${q.border} ${q.bg} overflow-hidden`}>
              <div className={`${q.headerBg} px-5 py-4 flex items-center justify-between`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{q.emoji}</span>
                    <h3 className={`font-bold text-base ${q.textColor}`}>{q.label}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 ${q.textColor}`}>{qtasks.length}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{q.desc}</p>
                </div>
              </div>
              <div className="p-4 space-y-2 min-h-[80px]">
                {qtasks.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-4">Tidak ada tugas di sini</p>
                )}
                {qtasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => onTaskClick(t)}
                    className="w-full text-left bg-white rounded-[16px] px-4 py-3 border border-gray-100 hover:border-gray-300 hover:shadow-sm transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition">{t.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{t.subject} · ⏰ {formatDeadline(t.deadline)}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_CONFIG[t.status].bg} ${STATUS_CONFIG[t.status].color}`}>
                        {STATUS_CONFIG[t.status].label}
                      </span>
                    </div>
                    {t.subtasks.length > 0 && (
                      <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-400 rounded-full"
                          style={{ width: `${Math.round(t.subtasks.filter(s => s.done).length / t.subtasks.length * 100)}%` }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ======================================================
// STATS / RAPOR VIEW
// ======================================================

function StatsView({ tasks }: { tasks: Task[] }) {
  const doneTasks = tasks.filter(t => t.status === 'done')
  const totalXP = tasks.reduce((s, t) => s + t.xpEarned, 0)
  const antiSKSCount = tasks.filter(t => t.antiSKS).length
  const totalPomodoros = tasks.reduce((s, t) => s + t.pomodoroSessions, 0)

  const completionRate = tasks.length > 0 ? doneTasks.length / tasks.length : 0
  const antiSKSRate = doneTasks.length > 0 ? antiSKSCount / doneTasks.length : 0
  const gradeScore = completionRate * 0.5 + antiSKSRate * 0.5
  const grade = gradeScore >= 0.85 ? 'A' : gradeScore >= 0.7 ? 'B' : gradeScore >= 0.5 ? 'C' : 'D'
  const gradeColor = grade === 'A' ? 'text-green-600' : grade === 'B' ? 'text-blue-600' : grade === 'C' ? 'text-yellow-600' : 'text-red-600'
  const gradeBg = grade === 'A' ? 'bg-green-50 border-green-200' : grade === 'B' ? 'bg-blue-50 border-blue-200' : grade === 'C' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'

  const xpTasks = doneTasks.filter(t => t.xpEarned > 0).slice(-8)

  const statsCards = [
    { label: 'Tugas Selesai',  value: doneTasks.length,  icon: '✅', color: 'border-green-300 bg-green-50',  text: 'text-green-700' },
    { label: 'Total XP',        value: totalXP,            icon: '⚡', color: 'border-amber-300 bg-amber-50',  text: 'text-amber-700' },
    { label: 'Pomodoro Sesi',   value: totalPomodoros,     icon: '🍅', color: 'border-red-300 bg-red-50',      text: 'text-red-600' },
    { label: 'Anti-SKS Badge',  value: antiSKSCount,       icon: '🏆', color: 'border-purple-300 bg-purple-50',text: 'text-purple-700' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {statsCards.map((s, i) => (
          <div key={i} className={`rounded-[24px] p-5 border-2 ${s.color}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-3xl font-bold ${s.text}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className={`rounded-[24px] p-6 border-2 ${gradeBg} flex flex-col items-center justify-center text-center`}>
          <p className="text-sm font-semibold text-gray-500 mb-2">Rapor Anti-Menunda</p>
          <div className={`text-8xl font-bold ${gradeColor}`}>{grade}</div>
          <p className="text-xs text-gray-500 mt-3">
            {grade === 'A' ? '🌟 Luar biasa! Konsisten banget!' :
             grade === 'B' ? '👍 Bagus! Terus dipertahankan.' :
             grade === 'C' ? '😅 Lumayan, masih bisa lebih baik.' :
             '😨 Yuk mulai cicil tugas sekarang!'}
          </p>
          <div className="mt-3 w-full bg-white/60 rounded-full h-2">
            <div className={`h-2 rounded-full ${grade === 'A' ? 'bg-green-400' : grade === 'B' ? 'bg-blue-400' : grade === 'C' ? 'bg-yellow-400' : 'bg-red-400'}`}
              style={{ width: `${Math.round(gradeScore * 100)}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{Math.round(gradeScore * 100)}% skor</p>
        </div>

        <div className="col-span-2 bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4 text-sm">📈 XP per Tugas Selesai</h3>
          {xpTasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Belum ada tugas selesai dengan XP</div>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {xpTasks.map((t) => (
                <div key={t.id} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold text-purple-600">{t.xpEarned}</span>
                  <div
                    className={`w-full rounded-t-lg transition-all ${t.antiSKS ? 'bg-amber-400' : 'bg-purple-400'}`}
                    style={{ height: `${Math.max(8, (t.xpEarned / 150) * 100)}px` }}
                    title={t.title}
                  />
                  <span className="text-[8px] text-gray-400 truncate w-full text-center">{t.title.slice(0,6)}..</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-3 h-3 rounded-sm bg-purple-400" /> Tepat Waktu (+50 XP)
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-3 h-3 rounded-sm bg-amber-400" /> Anti-SKS (+150 XP)
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-gray-100 p-5 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-4 text-sm">🍅 Produktivitas per Kelola Studi</h3>
        <div className="space-y-3">
          {DEFAULT_SUBJECTS.slice(0, 5).map(subject => {
            const subjectTasks = tasks.filter(t => t.subject === subject)
            const sessions = subjectTasks.reduce((s, t) => s + t.pomodoroSessions, 0)
            const maxSessions = Math.max(...DEFAULT_SUBJECTS.map(s => tasks.filter(t => t.subject === s).reduce((a, t) => a + t.pomodoroSessions, 0)), 1)
            if (subjectTasks.length === 0) return null
            return (
              <div key={subject} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-36 truncate">{subject}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all"
                    style={{ width: `${(sessions / maxSessions) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-sky-600 w-16 text-right">{sessions} sesi 🍅</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-[24px] p-5">
        <h3 className="font-bold text-purple-700 mb-3">💡 Tips Berdasarkan Datamu</h3>
        <ul className="space-y-2 text-sm text-purple-600">
          {antiSKSRate < 0.3 && <li>• Coba cicil tugas lebih awal — selesaikan H-3 sebelum deadline untuk dapat 150 XP!</li>}
          {totalPomodoros < 5 && <li>• Gunakan fitur Cicil Mode (Pomodoro) lebih sering untuk membangun kebiasaan fokus.</li>}
          {completionRate < 0.5 && <li>• Kamu punya banyak tugas pending. Mulai dari kuadran "Do It Now" di Priority Matrix!</li>}
          {grade === 'A' && <li>• Luar biasa! 🌟 Pertahankan ritme ini dan bagikan tips ke teman-temanmu.</li>}
        </ul>
      </div>
    </div>
  )
}

// ======================================================
// MANAGE SUBJECTS MODAL — AUTO-SAVE
// ======================================================

interface ManageSubjectsProps {
  subjects: string[]
  onSave: (subjects: string[]) => void
  onClose: () => void
}

function ManageSubjectsModal({ subjects, onSave, onClose }: ManageSubjectsProps) {
  const [list, setList]   = useState<string[]>([...subjects])
  const [newName, setNew] = useState('')
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [editVal, setEditVal] = useState('')
  const [savedIndicator, setSavedIndicator] = useState(false)

  useEffect(() => {
    onSave(list)
    setSavedIndicator(true)
    const t = setTimeout(() => setSavedIndicator(false), 1500)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list])

  const add = () => {
    const v = newName.trim()
    if (!v || list.includes(v)) return
    setList(prev => [...prev, v])
    setNew('')
  }

  const remove = (i: number) => setList(prev => prev.filter((_, idx) => idx !== i))

  const startEdit = (i: number) => { setEditIdx(i); setEditVal(list[i]) }

  const saveEdit = () => {
    if (editIdx === null) return
    const v = editVal.trim()
    if (!v) return
    setList(prev => prev.map((s, i) => i === editIdx ? v : s))
    setEditIdx(null)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Kelola Studi</h2>
          <div className="flex items-center gap-3">
            <AutoSaveIndicator show={savedIndicator} />
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
              <FaTimes className="text-gray-500 text-sm" />
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {list.map((s, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-100">
              {editIdx === i ? (
                <>
                  <input
                    autoFocus
                    className="flex-1 text-sm border border-purple-300 rounded-xl px-2 py-1 focus:outline-none"
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                  />
                  <button onClick={saveEdit} className="text-green-500 hover:text-green-600 text-sm font-bold px-2">
                    <FaCheck />
                  </button>
                  <button onClick={() => setEditIdx(null)} className="text-gray-400 hover:text-gray-500 text-sm">
                    <FaTimes />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-gray-700">{s}</span>
                  <button onClick={() => startEdit(i)} className="text-gray-300 hover:text-purple-400 transition text-xs p-1">
                    <FaEdit />
                  </button>
                  <button onClick={() => remove(i)} className="text-gray-300 hover:text-red-400 transition text-xs p-1">
                    <FaTrash />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 border-2 border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-700 focus:border-purple-400 focus:outline-none transition"
            placeholder="Tambah kelola studi baru..."
            value={newName}
            onChange={e => setNew(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
          <button onClick={add} className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center hover:bg-purple-200 transition shrink-0">
            <FaPlus className="text-sm" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-2xl font-bold hover:scale-[1.02] transition shadow-lg flex items-center justify-center gap-2"
        >
          <FaCheck /> Selesai
        </button>
      </div>
    </div>
  )
}

// ======================================================
// POMODORO TIMER
// ======================================================

interface PomodoroProps {
  taskTitle: string
  onSession: () => void
  onClose: () => void
  onPomodoroComplete: () => void
}

function PomodoroTimer({ taskTitle, onSession, onClose, onPomodoroComplete }: PomodoroProps) {
  const WORK = 25 * 60
  const BREAK = 5 * 60
  const [seconds, setSeconds] = useState(WORK)
  const [running, setRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [justEarnedXP, setJustEarnedXP] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            if (!isBreak) {
              setSessions(n => n + 1)
              onSession()
              onPomodoroComplete()
              setJustEarnedXP(true)
              setTimeout(() => setJustEarnedXP(false), 3000)
              setIsBreak(true)
              setSeconds(BREAK)
            } else {
              setIsBreak(false)
              setSeconds(WORK)
            }
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current!)
  }, [running, isBreak])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const total = isBreak ? BREAK : WORK
  const pct = ((total - seconds) / total) * 100

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl text-center">
        <div className="flex items-center justify-between mb-4">
          <div className={`text-sm font-bold px-3 py-1 rounded-full ${isBreak ? 'bg-green-100 text-green-600' : 'bg-sky-100 text-sky-600'}`}>
            {isBreak ? '☕ Istirahat' : '🎯 Fokus'}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
            <FaTimes className="text-gray-500 text-sm" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-1 truncate font-medium">{taskTitle}</p>

        {justEarnedXP && (
          <div className="mb-2 animate-bounce">
            <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">+10 XP Sesi Bonus! 🎉</span>
          </div>
        )}

        <div className="relative w-40 h-40 mx-auto my-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#F3F4F6" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="44" fill="none"
              stroke={isBreak ? '#22C55E' : '#38BDF8'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-gray-800">{mm}:{ss}</div>
            <div className="text-xs text-gray-400">{sessions} sesi selesai</div>
          </div>
        </div>

        {sessions > 0 && (
          <div className="flex justify-center gap-1 mb-4">
            {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-sky-400" />
            ))}
          </div>
        )}

        <div className="flex gap-3 justify-center mb-4">
          <button
            onClick={() => setRunning(r => !r)}
            className={`px-8 py-3 rounded-2xl font-bold text-white transition hover:scale-105 flex items-center gap-2 ${running ? 'bg-orange-400' : 'bg-sky-400'}`}
          >
            {running ? <FaPause /> : <FaPlay />}
            {running ? 'Pause' : 'Mulai'}
          </button>
          <button
            onClick={() => { setRunning(false); setSeconds(WORK); setIsBreak(false) }}
            className="px-4 py-3 rounded-2xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            <FaRedo />
          </button>
        </div>
        <p className="text-xs text-gray-400">25 menit fokus · 5 menit istirahat</p>
        {sessions >= 4 && (
          <p className="text-xs font-bold text-orange-500 mt-1">🔥 {sessions} sesi! Waktunya istirahat panjang 30 menit!</p>
        )}
      </div>
    </div>
  )
}

// ======================================================
// TASK CARD DETAIL MODAL — AUTO-SAVE + FLUSH ON CLOSE
// ======================================================

interface DetailModalProps {
  task: Task
  subjects: string[]
  onClose: () => void
  onUpdate: (task: Task) => void
  onDelete: (id: number) => void
  onPomodoro: (task: Task) => void
}

function TaskDetailModal({ task, subjects, onClose, onUpdate, onDelete, onPomodoro }: DetailModalProps) {
  const [t, setT] = useState<Task>({
    ...task,
    subtasks: task.subtasks.map(s => ({ ...s })),
    attachments: task.attachments.map(a => ({ ...a }))
  })
  const [newSubtask, setNewSubtask]         = useState('')
  const [newAttachLabel, setNewAttachLabel] = useState('')
  const [newAttachUrl, setNewAttachUrl]     = useState('')
  const [showAttachForm, setShowAttachForm] = useState(false)
  const [showProof, setShowProof]           = useState(false)
  const [savedIndicator, setSavedIndicator] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Ref untuk selalu memegang state terkini — dipakai saat cleanup/close
  const latestT = useRef<Task>(t)
  useEffect(() => { latestT.current = t }, [t])

  // Ref untuk melacak apakah ini render pertama
  const isFirstRender = useRef(true)
  // Ref untuk mencegah auto-save saat menunggu proof
  const pendingDoneRef = useRef(false)

  // ── AUTO-SAVE: simpan ke parent setiap kali state task berubah ──
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (pendingDoneRef.current) return
    // Jangan simpan status 'done' tanpa proof jika task sebelumnya belum done
    if (t.status === 'done' && task.status !== 'done' && !t.proof) return

    onUpdate(t)
    setSavedIndicator(true)
    const timer = setTimeout(() => setSavedIndicator(false), 1500)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t])

  // ── FLUSH ON UNMOUNT: pastikan perubahan terakhir tersimpan saat modal ditutup ──
  useEffect(() => {
    return () => {
      const finalT = latestT.current
      // Jangan flush kalau sedang pending proof atau status done tanpa proof
      if (pendingDoneRef.current) return
      if (finalT.status === 'done' && task.status !== 'done' && !finalT.proof) return
      onUpdate(finalT)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleSub = (id: number) =>
    setT(prev => ({ ...prev, subtasks: prev.subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s) }))

  const addSub = () => {
    if (!newSubtask.trim()) return
    setT(prev => ({ ...prev, subtasks: [...prev.subtasks, { id: Date.now(), text: newSubtask.trim(), done: false }] }))
    setNewSubtask('')
  }

  const deleteSub = (id: number) =>
    setT(prev => ({ ...prev, subtasks: prev.subtasks.filter(s => s.id !== id) }))

  const addAttachment = () => {
    if (!newAttachLabel.trim() || !newAttachUrl.trim()) return
    setT(prev => ({
      ...prev,
      attachments: [...prev.attachments, { id: Date.now(), label: newAttachLabel.trim(), url: newAttachUrl.trim(), type: 'link' }]
    }))
    setNewAttachLabel(''); setNewAttachUrl(''); setShowAttachForm(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const newAttachments: Attachment[] = []
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file)
      newAttachments.push({ id: Date.now() + Math.random(), label: file.name, url, type: 'file' })
    })
    setT(prev => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }))
    e.target.value = ''
  }

  const deleteAttachment = (id: number) =>
    setT(prev => ({ ...prev, attachments: prev.attachments.filter(a => a.id !== id) }))

  const subDone  = t.subtasks.filter(s => s.done).length
  const subTotal = t.subtasks.length
  const subPct   = subTotal > 0 ? Math.round(subDone / subTotal * 100) : 0

  const handleStatusChange = (s: Status) => {
    if (s === 'done' && task.status !== 'done') {
      pendingDoneRef.current = true
      setShowProof(true)
    } else {
      setT(prev => ({ ...prev, status: s }))
    }
  }

  const handleProofConfirmed = (proof: Task['proof']) => {
    pendingDoneRef.current = false
    setShowProof(false)
    setT(prev => ({ ...prev, status: 'done', proof }))
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

        <div className={`rounded-t-[32px] p-6 ${PRIORITY_CONFIG[t.priority].bg} border-b ${PRIORITY_CONFIG[t.priority].border}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PRIORITY_CONFIG[t.priority].bg} ${PRIORITY_CONFIG[t.priority].text} border ${PRIORITY_CONFIG[t.priority].border}`}>
                  <span className={`inline-block w-2 h-2 rounded-full mr-1 ${PRIORITY_CONFIG[t.priority].dot}`} />
                  {PRIORITY_CONFIG[t.priority].label}
                </span>
                {t.type === 'group' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                    👥 Kelompok
                  </span>
                )}
                {t.antiSKS && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    🏆 Anti-SKS
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-800 leading-tight">{t.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <select
                  className="text-sm text-gray-500 bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-purple-400 cursor-pointer"
                  value={t.subject}
                  onChange={e => setT(prev => ({ ...prev, subject: e.target.value }))}
                >
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="text-gray-400">·</span>
                <span className="text-sm text-gray-500">Deadline: {formatDeadline(t.deadline)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <AutoSaveIndicator show={savedIndicator} />
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center hover:bg-white transition">
                <FaTimes className="text-gray-500 text-sm" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">

          <div className="flex items-center gap-3 flex-wrap">
            {(['todo', 'inprogress', 'done'] as Status[]).map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`px-4 py-2 rounded-2xl text-sm font-bold transition border ${
                  t.status === s
                    ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} border-current`
                    : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'
                } ${s === 'done' && task.status !== 'done' ? 'flex items-center gap-1.5' : ''}`}
              >
                {s === 'done' && task.status !== 'done' && <FaTrophy className="text-yellow-500 text-xs" />}
                {STATUS_CONFIG[s].label}
              </button>
            ))}
            <button
              onClick={() => onPomodoro(t)}
              className="ml-auto px-4 py-2 rounded-2xl text-sm font-bold bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-200 transition flex items-center gap-1.5"
            >
              <FaClock /> Cicil Mode
            </button>
          </div>

          {t.proof && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                {t.proof.type === 'photo' ? '📸' : t.proof.type === 'link' ? '🔗' : '📄'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Bukti Penyelesaian</p>
                {t.proof.type === 'photo' ? (
                  <div className="mt-1">
                    <img src={t.proof.url} alt="Bukti" className="h-16 rounded-xl object-cover border border-green-200" />
                  </div>
                ) : (
                  <a
                    href={t.proof.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-green-700 hover:underline truncate block"
                  >
                    {t.proof.label}
                  </a>
                )}
              </div>
              <button
                onClick={() => setT(prev => ({ ...prev, proof: undefined }))}
                className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center hover:bg-red-100 transition"
              >
                <FaTimes className="text-green-400 hover:text-red-400 text-xs" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-gray-600">Bobot Tugas:</label>
            <div className="flex gap-2">
              {(['high', 'low'] as const).map(imp => (
                <button
                  key={imp}
                  onClick={() => setT(prev => ({ ...prev, importance: imp }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    t.importance === imp
                      ? imp === 'high' ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-gray-100 text-gray-600 border-gray-300'
                      : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {imp === 'high' ? '⭐ Penting' : '📝 Biasa'}
                </button>
              ))}
            </div>
          </div>

          {t.pomodoroSessions > 0 && (
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <FaClock className="text-sky-400" /> {t.pomodoroSessions} sesi Pomodoro tercatat
            </div>
          )}

          <div>
            <label className="text-sm font-bold text-gray-600 block mb-2">Deskripsi</label>
            <textarea
              className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-700 focus:border-purple-300 focus:outline-none resize-none transition"
              rows={2}
              value={t.description}
              onChange={e => setT(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-600">Sub-Task Breakout</label>
              <span className="text-xs text-purple-600 font-semibold">{subDone}/{subTotal} · {subPct}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${subPct}%` }}
              />
            </div>
            <div className="space-y-2">
              {t.subtasks.map(s => (
                <div key={s.id} className="flex items-center gap-3 group">
                  <button
                    onClick={() => toggleSub(s.id)}
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition ${
                      s.done ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    {s.done && <FaCheck className="text-white text-[9px]" />}
                  </button>
                  <span className={`flex-1 text-sm ${s.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{s.text}</span>
                  <button onClick={() => deleteSub(s.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition text-xs">
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                className="flex-1 border-2 border-gray-100 rounded-2xl px-3 py-2 text-sm text-gray-700 focus:border-purple-300 focus:outline-none transition"
                placeholder="Tambah sub-task..."
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSub()}
              />
              <button onClick={addSub} className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center hover:bg-purple-200 transition">
                <FaPlus className="text-sm" />
              </button>
            </div>
          </div>

          {t.type === 'group' && (
            <div>
              <label className="text-sm font-bold text-gray-600 block mb-3">👥 Anggota Tim</label>
              <div className="flex items-center gap-2 flex-wrap">
                {t.members.map(m => (
                  <div key={m.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-1.5">
                    <div className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${m.color}`}>{m.avatar}</div>
                    <span className="text-sm font-medium text-gray-700">{m.name}</span>
                  </div>
                ))}
                <button className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-400 transition">
                  <FaPlus className="text-xs" />
                </button>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-600">📎 Resource Hub</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-green-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <FaUpload className="text-[10px]" /> Upload File
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setShowAttachForm(v => !v)}
                  className="text-xs text-purple-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <FaLink className="text-[10px]" /> Tambah Link
                </button>
              </div>
            </div>

            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />

            {showAttachForm && (
              <div className="bg-gray-50 rounded-2xl p-3 mb-3 space-y-2">
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-purple-300"
                  placeholder="Label (contoh: Google Drive Kelompok)"
                  value={newAttachLabel}
                  onChange={e => setNewAttachLabel(e.target.value)}
                />
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-purple-300"
                  placeholder="URL (https://...)"
                  value={newAttachUrl}
                  onChange={e => setNewAttachUrl(e.target.value)}
                />
                <button onClick={addAttachment} className="w-full bg-purple-500 text-white text-sm font-bold py-2 rounded-xl hover:bg-purple-600 transition">
                  Simpan Link
                </button>
              </div>
            )}

            {t.attachments.length === 0 && !showAttachForm && (
              <p className="text-sm text-gray-400 italic">Belum ada lampiran.</p>
            )}

            <div className="space-y-2">
              {t.attachments.map(a => (
                <div key={a.id} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 hover:border-purple-300 hover:bg-purple-50 transition group">
                  {a.type === 'file' ? (
                    <FaPaperclip className="text-green-400 text-sm shrink-0" />
                  ) : (
                    <FaLink className="text-purple-400 text-sm shrink-0" />
                  )}
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm font-medium text-gray-700 truncate hover:text-purple-600"
                  >
                    {a.label}
                  </a>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">
                    {a.type === 'file' ? 'file' : 'link'}
                  </span>
                  <button
                    onClick={() => deleteAttachment(a.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition text-xs ml-1"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {t.status !== 'done' && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <FaBolt className="text-amber-500 text-xl shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-700">Selesaikan lebih awal, dapatkan lebih banyak XP!</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {daysUntil(t.deadline) >= 3 ? `Selesaikan sekarang → +150 XP & lencana Anti-SKS 🏆` : 'Selesaikan tepat waktu → +50 XP'}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { if (confirm('Hapus tugas ini?')) { onDelete(t.id); onClose() } }}
              className="px-4 py-3 rounded-2xl bg-red-50 text-red-400 font-bold hover:bg-red-100 transition flex items-center gap-2 text-sm"
            >
              <FaTrash /> Hapus
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold hover:scale-[1.02] transition shadow-lg text-sm flex items-center justify-center gap-2"
            >
              <FaCheck /> Selesai
            </button>
          </div>

        </div>
      </div>

      {showProof && (
        <ProofUploadModal
          taskTitle={t.title}
          onConfirm={handleProofConfirmed}
          onClose={() => { setShowProof(false); pendingDoneRef.current = false }}
        />
      )}
    </div>
  )
}

// ======================================================
// ADD TASK MODAL
// ======================================================

interface AddTaskModalProps {
  subjects: string[]
  onAdd: (task: Omit<Task, 'id' | 'xpEarned' | 'pomodoroSessions' | 'antiSKS'>) => void
  onClose: () => void
}

function AddTaskModal({ subjects, onAdd, onClose }: AddTaskModalProps) {
  const [title, setTitle]       = useState('')
  const [subject, setSubject]   = useState(subjects[0] ?? '')
  const [deadline, setDeadline] = useState('')
  const [type, setType]         = useState<TaskType>('individual')
  const [description, setDesc]  = useState('')
  const [importance, setImportance] = useState<'high' | 'low'>('high')
  const [errors, setErrors]     = useState<{ title?: string; deadline?: string }>({})

  const validate = () => {
    const errs: { title?: string; deadline?: string } = {}
    if (!title.trim()) errs.title = 'Judul wajib diisi'
    if (!deadline)     errs.deadline = 'Deadline wajib diisi'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleAdd = () => {
    if (!validate()) return
    onAdd({
      title: title.trim(), subject, deadline, type,
      description: description.trim(),
      priority: autoPriority(deadline), status: 'todo',
      subtasks: [], attachments: [], members: [],
      importance,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tambah Tugas Baru</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
            <FaTimes className="text-gray-500 text-sm" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Judul Tugas</label>
            <input
              autoFocus
              className={`w-full border-2 rounded-2xl px-4 py-3 text-gray-800 focus:outline-none transition ${errors.title ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-purple-400'}`}
              placeholder="Contoh: Buat Makalah Jaringan"
              value={title}
              onChange={e => { setTitle(e.target.value); if (errors.title) setErrors(prev => ({ ...prev, title: undefined })) }}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1 ml-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Kelola Studi</label>
              <select
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:border-purple-400 focus:outline-none transition bg-white"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Deadline</label>
              <input
                type="date"
                className={`w-full border-2 rounded-2xl px-4 py-3 text-gray-800 focus:outline-none transition ${errors.deadline ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-purple-400'}`}
                value={deadline}
                onChange={e => { setDeadline(e.target.value); if (errors.deadline) setErrors(prev => ({ ...prev, deadline: undefined })) }}
              />
              {errors.deadline && <p className="text-xs text-red-500 mt-1 ml-1">{errors.deadline}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-2 block">Tipe Tugas</label>
            <div className="flex gap-3">
              {(['individual', 'group'] as TaskType[]).map(tp => (
                <button
                  key={tp}
                  onClick={() => setType(tp)}
                  className={`flex-1 py-3 rounded-2xl font-bold text-sm transition border-2 ${
                    type === tp
                      ? 'border-purple-400 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {tp === 'individual' ? '👤 Individu' : '👥 Kelompok'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-2 block">Bobot Tugas (untuk Priority Matrix)</label>
            <div className="flex gap-3">
              {(['high', 'low'] as const).map(imp => (
                <button
                  key={imp}
                  onClick={() => setImportance(imp)}
                  className={`flex-1 py-2.5 rounded-2xl font-bold text-sm transition border-2 ${
                    importance === imp
                      ? imp === 'high' ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-gray-300 bg-gray-100 text-gray-600'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {imp === 'high' ? '⭐ Penting' : '📝 Biasa'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Deskripsi (opsional)</label>
            <textarea
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-700 text-sm focus:border-purple-400 focus:outline-none resize-none transition"
              rows={2} placeholder="Catatan tugas..."
              value={description}
              onChange={e => setDesc(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold hover:bg-gray-200 transition">
            Batal
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-bold hover:scale-[1.02] transition shadow-lg"
          >
            Tambah Tugas
          </button>
        </div>
      </div>
    </div>
  )
}

// ======================================================
// TASK CARD
// ======================================================

interface TaskCardProps {
  task: Task
  onClick: () => void
  onPomodoro: () => void
  onQuickDone: () => void
}

function TaskCard({ task, onClick, onPomodoro, onQuickDone }: TaskCardProps) {
  const subDone  = task.subtasks.filter(s => s.done).length
  const subTotal = task.subtasks.length
  const subPct   = subTotal > 0 ? Math.round(subDone / subTotal * 100) : 0
  const dl       = daysUntil(task.deadline)
  const isPanic  = dl <= 0 && task.status !== 'done'

  const progressColor = task.status === 'done'
    ? 'bg-green-400'
    : task.status === 'inprogress'
    ? 'bg-blue-400'
    : 'bg-purple-400'

  return (
    <div
      className={`bg-white rounded-[24px] p-5 shadow-sm border-2 transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer group ${
        isPanic ? 'border-red-400' : PRIORITY_CONFIG[task.priority].cardBorder
      } ${isPanic ? 'animate-pulse' : ''}`}
      style={isPanic ? { animationDuration: '2s' } : {}}
      onClick={onClick}
    >
      {isPanic && (
        <div className="mb-2 flex items-center gap-2">
          <div className="flex-1 bg-red-100 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500 text-xs animate-pulse" />
            <span className="text-xs font-bold text-red-600">🚨 DEADLINE TERLEWAT — Selesaikan sekarang!</span>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${PRIORITY_CONFIG[task.priority].dot}`} />
            <span className="text-[11px] font-semibold text-gray-400">{task.subject}</span>
            {task.type === 'group' && <FaUsers className="text-purple-400 text-xs" />}
            {task.antiSKS && (
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 rounded-full font-bold border border-amber-200">
                🏆 Anti-SKS
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-800 text-sm leading-tight">{task.title}</h3>
        </div>
        {task.status === 'done' ? (
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <FaCheck className="text-white text-xs" />
          </div>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onQuickDone() }}
            className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center shrink-0 hover:border-green-400 hover:bg-green-50 transition opacity-0 group-hover:opacity-100"
          >
            <FaCheck className="text-gray-300 hover:text-green-400 text-xs" />
          </button>
        )}
      </div>

      {subTotal > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Sub-task</span><span>{subDone}/{subTotal}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progressColor}`}
              style={{ width: `${subPct}%` }}
            />
          </div>
        </div>
      )}

      {task.type === 'group' && task.members.length > 0 && (
        <div className="flex items-center gap-1 mb-3">
          {task.members.slice(0, 4).map(m => (
            <div key={m.id} className={`w-6 h-6 rounded-full text-[9px] font-bold flex items-center justify-center -ml-1 first:ml-0 border-2 border-white ${m.color}`}>
              {m.avatar}
            </div>
          ))}
          {task.members.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-gray-100 text-[9px] font-bold text-gray-500 flex items-center justify-center -ml-1 border-2 border-white">
              +{task.members.length - 4}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-bold ${
          dl < 0 ? 'text-red-500' : dl <= 1 ? 'text-orange-500' : dl <= 3 ? 'text-amber-600' : 'text-gray-400'
        }`}>
          ⏰ {formatDeadline(task.deadline)}
        </span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
          {task.status !== 'done' && (
            <button
              onClick={e => { e.stopPropagation(); onPomodoro() }}
              className="text-[10px] bg-sky-100 text-sky-600 px-2.5 py-1 rounded-full font-bold hover:bg-sky-200 transition flex items-center gap-1"
            >
              <FaClock className="text-[9px]" /> Cicil
            </button>
          )}
          {task.pomodoroSessions > 0 && (
            <span className="text-[10px] text-gray-400">🍅 {task.pomodoroSessions}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ======================================================
// MAIN PAGE
// ======================================================

export default function TaskPage() {
  const [tasks, setTasks]               = useLocalStorage<Task[]>('taskpage:tasks', [])
  const [nextId, setNextId]             = useLocalStorage<number>('taskpage:nextId', 1)
  const [subjects, setSubjects]         = useLocalStorage<string[]>('taskpage:subjects', DEFAULT_SUBJECTS)
  const [streak, setStreak]             = useLocalStorage<number>('taskpage:streak', 0)
  const [filterSubject, setFilterSubject] = useLocalStorage<string>('taskpage:filter', 'Semua')
  const [viewMode, setViewMode]         = useLocalStorage<ViewMode>('taskpage:viewMode', 'kanban')

  // Ref yang selalu memegang tasks terkini — untuk dipakai di callback tanpa stale closure
  const tasksRef = useRef<Task[]>(tasks)
  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  // Inisialisasi sample tasks hanya sekali, saat pertama kali buka
  useEffect(() => {
    try {
      const alreadyInit = window.localStorage.getItem('taskpage:initialized')
      if (!alreadyInit) {
        const samples = makeSampleTasks()
        setTasks(samples)
        setNextId(samples.length + 1)
        window.localStorage.setItem('taskpage:initialized', 'true')
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [showManageSubjects, setShowManageSubjects] = useState(false)
  const [showStreakToast, setShowStreakToast]       = useState(false)
  const [xpToast, setXpToast] = useState<{ xp: number; antiSKS: boolean } | null>(null)
  const [showAddModal, setShowAddModal]   = useState(false)
  const [detailTask, setDetailTask]       = useState<Task | null>(null)
  const [pomodoroTask, setPomodoroTask]   = useState<Task | null>(null)

  const [showMascotPopup, setShowMascotPopup] = useState(false)
  const [mascotMode, setMascotMode] = useState<'celebrate' | 'levelup'>('celebrate')

  const totalXP      = tasks.reduce((s, t) => s + t.xpEarned, 0)
  const doneCount    = tasks.filter(t => t.status === 'done').length
  const antiSKSCount = tasks.filter(t => t.antiSKS).length

  const panicTasks = useMemo(() =>
    tasks.filter(t => t.status === 'todo' && daysUntil(t.deadline) <= 0),
    [tasks]
  )

  const SUBJECT_FILTER = ['Semua', ...subjects]

  const filtered = useMemo(() =>
    filterSubject === 'Semua' ? tasks : tasks.filter(t => t.subject === filterSubject),
    [tasks, filterSubject]
  )

  const byStatus = useCallback((s: Status) => filtered.filter(t => t.status === s), [filtered])

  const handleTaskCompleted = useCallback((antiSKS: boolean, xpEarned: number) => {
    setStreak(n => n + 1)
    setShowStreakToast(true)
    setXpToast({ xp: xpEarned, antiSKS })
    spawnConfetti()
    const newTotalXP = tasksRef.current.reduce((s, t) => s + t.xpEarned, 0) + xpEarned
    setMascotMode(newTotalXP >= 500 ? 'levelup' : 'celebrate')
    setShowMascotPopup(true)
  }, [])

  const handlePomodoroComplete = useCallback(() => {
    setMascotMode('celebrate')
    setShowMascotPopup(true)
  }, [])

  const addTask = useCallback((data: Omit<Task, 'id' | 'xpEarned' | 'pomodoroSessions' | 'antiSKS'>) => {
    setTasks(prev => {
      const newTask = { ...data, id: nextId, xpEarned: 0, pomodoroSessions: 0, antiSKS: false }
      const updated = [...prev, newTask]
      // Flush langsung ke localStorage agar tersimpan instan
      flushToLocalStorage('taskpage:tasks', updated)
      return updated
    })
    setNextId(n => n + 1)
  }, [nextId])

  // ── updateTask: stabil, tidak bergantung pada closure tasks yang basi ──
  const updateTask = useCallback((updated: Task) => {
    setTasks(prev => {
      const currentTask = prev.find(t => t.id === updated.id)
      const isNewlyDone = updated.status === 'done' && currentTask?.status !== 'done'
      const antiSKS  = isNewlyDone ? daysUntil(updated.deadline) >= 3 : updated.antiSKS
      const xpEarned = isNewlyDone ? (antiSKS ? 150 : 50) : updated.xpEarned

      const newTasks = prev.map(t =>
        t.id === updated.id
          ? { ...updated, antiSKS, xpEarned, completedAt: isNewlyDone ? new Date().toISOString() : updated.completedAt }
          : t
      )

      // ── FLUSH LANGSUNG ke localStorage agar tersimpan saat navigasi ──
      flushToLocalStorage('taskpage:tasks', newTasks)

      if (isNewlyDone) handleTaskCompleted(antiSKS, xpEarned)

      return newTasks
    })
  }, [handleTaskCompleted])

  const deleteTask = useCallback((id: number) => {
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== id)
      flushToLocalStorage('taskpage:tasks', updated)
      return updated
    })
  }, [])

  const quickDone = useCallback((id: number) => {
    setTasks(prev => {
      const currentTask = prev.find(t => t.id === id)
      if (!currentTask || currentTask.status === 'done') return prev
      const antiSKS  = daysUntil(currentTask.deadline) >= 3
      const xpEarned = antiSKS ? 150 : 50
      const newTasks = prev.map(t =>
        t.id === id ? { ...t, status: 'done' as Status, antiSKS, xpEarned, completedAt: new Date().toISOString() } : t
      )
      flushToLocalStorage('taskpage:tasks', newTasks)
      handleTaskCompleted(antiSKS, xpEarned)
      return newTasks
    })
  }, [handleTaskCompleted])

  const incrementPomodoro = useCallback((id: number) => {
    setTasks(prev => {
      const newTasks = prev.map(t => t.id === id ? { ...t, pomodoroSessions: t.pomodoroSessions + 1 } : t)
      flushToLocalStorage('taskpage:tasks', newTasks)
      return newTasks
    })
  }, [])

  const VIEW_BUTTONS: { key: ViewMode; icon: React.ReactNode; label: string }[] = [
    { key: 'kanban', icon: <FaThLarge />, label: 'Kanban' },
    { key: 'matrix', icon: <FaTable />, label: 'Priority Matrix' },
    { key: 'stats',  icon: <FaChartBar />, label: 'Rapor' },
  ]

  return (
    <div className="flex-1 min-h-screen bg-[#F0EEFF]">
      <div className="p-8 overflow-y-auto">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold text-[#3C3489]">Tugas</h1>
              <p className="text-[#7F77DD] mt-2 text-lg">Asisten Anti-Menunda</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-[#7F77DD] to-[#D4537E] text-white px-8 py-4 rounded-3xl font-bold shadow-xl hover:scale-105 transition flex items-center gap-3"
            >
              <FaPlus /> Tambah Tugas
            </button>
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 mb-6">
            <div className="bg-white rounded-[24px] p-5 shadow-sm border-2 border-[#CECBF6]">
              <div className="text-3xl font-bold text-[#3C3489]">{tasks.length}</div>
              <div className="text-sm text-[#7F77DD] font-medium mt-1">Total Tugas</div>
            </div>
            <div className="bg-[#FAEEDA] rounded-[24px] p-5 shadow-sm border-2 border-[#FAC775]">
              <div className="text-3xl font-bold text-[#633806]">{byStatus('inprogress').length}</div>
              <div className="text-sm text-[#854F0B] font-medium mt-1">Sedang Dikerjakan</div>
            </div>
            <div className="bg-[#E1F5EE] rounded-[24px] p-5 shadow-sm border-2 border-[#5DCAA5]">
              <div className="text-3xl font-bold text-[#085041]">{doneCount}</div>
              <div className="text-sm text-[#0F6E56] font-medium mt-1">Selesai</div>
            </div>
            <div className={`rounded-[24px] p-5 shadow-sm transition-all ${streak > 0 ? 'bg-gradient-to-br from-[#E24B4A] to-[#EF9F27]' : 'bg-[#FCEBEB] border-2 border-[#F09595]'}`}>
              <div className="flex items-center gap-2">
                <FaFire className={`text-2xl ${streak > 0 ? 'text-yellow-200' : 'text-[#E24B4A]'}`} />
                <div className={`text-3xl font-bold ${streak > 0 ? 'text-white' : 'text-[#A32D2D]'}`}>{streak}</div>
              </div>
              <div className={`text-sm font-medium mt-1 ${streak > 0 ? 'text-white/90' : 'text-[#993C1D]'}`}>Streak Selesai 🔥</div>
            </div>
            <div className="bg-gradient-to-br from-[#7F77DD] to-[#534AB7] rounded-[24px] p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <FaBolt className="text-2xl text-yellow-300" />
                <div className="text-3xl font-bold text-white">{totalXP}</div>
              </div>
              <div className="text-sm font-medium mt-1 text-white/90">XP · {antiSKSCount} 🏆 Anti-SKS</div>
            </div>
          </div>

          {/* VIEW TOGGLE + FILTERS */}
          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex bg-white border-2 border-[#CECBF6] rounded-2xl p-1 gap-1 mr-2">
              {VIEW_BUTTONS.map(v => (
                <button
                  key={v.key}
                  onClick={() => setViewMode(v.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    viewMode === v.key
                      ? 'bg-[#7F77DD] text-white shadow-sm'
                      : 'text-[#7F77DD] hover:bg-[#EEEDFE]'
                  }`}
                >
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
            {viewMode !== 'stats' && SUBJECT_FILTER.map(s => (
              <button
                key={s}
                onClick={() => setFilterSubject(s)}
                className={`px-4 py-2 rounded-2xl text-sm font-semibold transition border-2 ${
                  filterSubject === s
                    ? 'bg-[#7F77DD] text-white border-transparent shadow-md'
                    : 'bg-white text-[#534AB7] border-[#CECBF6] hover:border-[#7F77DD] hover:text-[#3C3489]'
                }`}
              >
                {s}
              </button>
            ))}
            <button
              onClick={() => setShowManageSubjects(true)}
              className="ml-auto px-4 py-2 rounded-2xl text-sm font-semibold bg-white border-2 border-dashed border-[#AFA9EC] text-[#534AB7] hover:bg-[#EEEDFE] transition flex items-center gap-1.5"
            >
              <FaEdit className="text-xs" /> Kelola Studi
            </button>
          </div>
        </div>

        {/* Panic Zone */}
        {viewMode === 'kanban' && panicTasks.length > 0 && (
          <PanicZone tasks={panicTasks} onTaskClick={t => setDetailTask(t)} />
        )}

        {/* ── KANBAN VIEW ── */}
        {viewMode === 'kanban' && (
          <div className="flex gap-6">
            <div className="flex flex-col gap-6 flex-1">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <h2 className="font-bold text-gray-700 text-lg">To-Do</h2>
                  <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {byStatus('todo').length}
                  </span>
                </div>
                <div className="space-y-4">
                  {byStatus('todo').map(t => (
                    <TaskCard key={t.id} task={t} onClick={() => setDetailTask(t)} onPomodoro={() => setPomodoroTask(t)} onQuickDone={() => quickDone(t.id)} />
                  ))}
                  {byStatus('todo').length === 0 && (
                    <div className="bg-white rounded-[24px] border-2 border-dashed border-[#CECBF6] p-8 text-center text-gray-400 text-sm">
                      Tidak ada tugas di sini.
                    </div>
                  )}
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full bg-white border-2 border-dashed border-[#CECBF6] text-[#7F77DD] py-3 rounded-[24px] text-sm font-semibold hover:border-[#7F77DD] hover:bg-[#EEEDFE] transition flex items-center justify-center gap-2"
                  >
                    <FaPlus /> Tambah Tugas
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#378ADD]" />
                  <h2 className="font-bold text-gray-700 text-lg">In Progress</h2>
                  <span className="bg-[#E6F1FB] text-[#185FA5] text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {byStatus('inprogress').length}
                  </span>
                </div>
                <div className="space-y-4">
                  {byStatus('inprogress').map(t => (
                    <TaskCard key={t.id} task={t} onClick={() => setDetailTask(t)} onPomodoro={() => setPomodoroTask(t)} onQuickDone={() => quickDone(t.id)} />
                  ))}
                  {byStatus('inprogress').length === 0 && (
                    <div className="bg-white rounded-[24px] border-2 border-dashed border-[#B5D4F4] p-8 text-center text-gray-400 text-sm">
                      Belum ada tugas yang dikerjakan.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 flex-1">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#639922]" />
                  <h2 className="font-bold text-gray-700 text-lg">Selesai</h2>
                  <span className="bg-[#EAF3DE] text-[#3B6D11] text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {byStatus('done').length}
                  </span>
                </div>
                <div className="space-y-4">
                  {byStatus('done').map(t => (
                    <TaskCard key={t.id} task={t} onClick={() => setDetailTask(t)} onPomodoro={() => setPomodoroTask(t)} onQuickDone={() => {}} />
                  ))}
                  {byStatus('done').length === 0 && (
                    <div className="bg-white rounded-[24px] border-2 border-dashed border-[#C0DD97] p-8 text-center text-gray-400 text-sm">
                      Belum ada tugas selesai. Ayo semangat!
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center items-end pt-4 mt-auto">
                <img
                  src="https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/tugas.png"
                  alt="Maskot Tugas"
                  className="w-48 object-contain drop-shadow-lg"
                />
              </div>
            </div>
          </div>
        )}

        {viewMode === 'matrix' && (
          <PriorityMatrix tasks={filtered} onTaskClick={t => setDetailTask(t)} />
        )}

        {viewMode === 'stats' && (
          <StatsView tasks={tasks} />
        )}
      </div>

      {/* MODALS */}
      {showAddModal && (
        <AddTaskModal subjects={subjects} onAdd={addTask} onClose={() => setShowAddModal(false)} />
      )}

      {detailTask && (
        <TaskDetailModal
          task={tasks.find(t => t.id === detailTask.id) ?? detailTask}
          subjects={subjects}
          onClose={() => setDetailTask(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onPomodoro={t => { setDetailTask(null); setPomodoroTask(t) }}
        />
      )}

      {pomodoroTask && (
        <PomodoroTimer
          taskTitle={pomodoroTask.title}
          onSession={() => incrementPomodoro(pomodoroTask.id)}
          onClose={() => setPomodoroTask(null)}
          onPomodoroComplete={handlePomodoroComplete}
        />
      )}

      {showManageSubjects && (
        <ManageSubjectsModal
          subjects={subjects}
          onSave={setSubjects}
          onClose={() => setShowManageSubjects(false)}
        />
      )}

      {showStreakToast && (
        <StreakToast streak={streak} onDone={() => setShowStreakToast(false)} />
      )}

      {xpToast && (
        <XPToast xp={xpToast.xp} antiSKS={xpToast.antiSKS} onDone={() => setXpToast(null)} />
      )}

      <MascotPopup
        trigger={showMascotPopup}
        mode={mascotMode}
        onDone={() => setShowMascotPopup(false)}
      />

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(200px) rotate(360deg); opacity: 0; }
        }
        @keyframes panicPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3); }
          50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        }
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(20px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes fadeOut {
          to { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
      `}</style>
    </div>
  )
}