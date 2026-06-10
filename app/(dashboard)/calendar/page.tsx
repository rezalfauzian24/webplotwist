'use client'

import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaList,
  FaBrain,
  FaRoute,
  FaCheckCircle,
  FaGoogle,
  FaApple,
  FaFire,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaUsers,
  FaFlag,
  FaPencilAlt,
  FaSave,
  FaLock,
  FaUnlock,
  FaCloudRain,
  FaPaw,
} from 'react-icons/fa'

import { useMemo, useState, useEffect } from 'react'
import PetCompanion from '@/components/PetCompanion'

type EventType = 'class' | 'deadline' | 'exam' | 'personal' | 'focus'

interface CalEvent {
  id: number
  title: string
  type: EventType
  year: number
  month: number
  day: number
  time: string
  room: string
}

interface AbsenceClass {
  id: number
  name: string
  hadir: number
  sakit: number
  izin: number
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

type HolidayInfo = {
  name: string
  type: 'national' | 'international' | 'academic' | 'religious' | 'cultural'
  emoji: string
}

const HOLIDAYS: Record<string, HolidayInfo> = {
  '2025-1-1':   { name: 'Tahun Baru Masehi',              type: 'national',      emoji: '🎆' },
  '2025-1-6':   { name: 'Hari Tiga Raja (Epifani)',        type: 'religious',     emoji: '✨' },
  '2025-1-13':  { name: 'Hari Senin Pertama Tahun Baru',   type: 'cultural',      emoji: '🗓️' },
  '2025-1-27':  { name: 'Isra Mikraj Nabi Muhammad SAW',   type: 'national',      emoji: '🌙' },
  '2025-1-28':  { name: 'Cuti Bersama Isra Mikraj',        type: 'national',      emoji: '🌙' },
  '2025-1-29':  { name: 'Tahun Baru Imlek 2576',           type: 'national',      emoji: '🐍' },
  '2025-2-4':   { name: 'Hari Kanker Sedunia',             type: 'international', emoji: '🎗️' },
  '2025-2-14':  { name: "Hari Valentine's Day",            type: 'cultural',      emoji: '❤️' },
  '2025-2-20':  { name: 'Hari Keadilan Sosial Sedunia',    type: 'international', emoji: '⚖️' },
  '2025-2-21':  { name: 'Hari Bahasa Ibu Internasional',   type: 'international', emoji: '🗣️' },
  '2025-3-1':   { name: 'Hari Peringatan Serangan Umum 1 Maret', type: 'national', emoji: '🇮🇩' },
  '2025-3-8':   { name: 'Hari Perempuan Internasional',    type: 'international', emoji: '♀️' },
  '2025-3-20':  { name: 'Hari Kebahagiaan Internasional',  type: 'international', emoji: '😊' },
  '2025-3-21':  { name: 'Hari Hutan Sedunia',              type: 'international', emoji: '🌲' },
  '2025-3-22':  { name: 'Hari Air Sedunia',                type: 'international', emoji: '💧' },
  '2025-3-28':  { name: 'Wafat Isa Al-Masih (Jumat Agung)', type: 'national',     emoji: '✝️' },
  '2025-3-29':  { name: 'Hari Raya Nyepi (Tahun Baru Saka 1947)', type: 'national', emoji: '🕯️' },
  '2025-3-30':  { name: 'Cuti Bersama Nyepi',              type: 'national',      emoji: '🕯️' },
  '2025-4-1':   { name: 'Hari Raya Idul Fitri 1446 H',     type: 'national',      emoji: '🌙' },
  '2025-4-2':   { name: 'Hari Raya Idul Fitri 1446 H (Hari 2)', type: 'national', emoji: '🌙' },
  '2025-4-3':   { name: 'Cuti Bersama Idul Fitri',         type: 'national',      emoji: '🌙' },
  '2025-4-4':   { name: 'Cuti Bersama Idul Fitri',         type: 'national',      emoji: '🌙' },
  '2025-4-7':   { name: 'Cuti Bersama Idul Fitri',         type: 'national',      emoji: '🌙' },
  '2025-4-20':  { name: 'Hari Kartini',                    type: 'national',      emoji: '👩' },
  '2025-4-22':  { name: 'Hari Bumi Sedunia',               type: 'international', emoji: '🌍' },
  '2025-4-28':  { name: 'Hari Kesehatan & Keselamatan Kerja Sedunia', type: 'international', emoji: '⛑️' },
  '2025-5-1':   { name: 'Hari Buruh Internasional',        type: 'national',      emoji: '✊' },
  '2025-5-2':   { name: 'Hari Pendidikan Nasional',        type: 'national',      emoji: '📚' },
  '2025-5-12':  { name: 'Hari Raya Waisak 2569 BE',        type: 'national',      emoji: '☮️' },
  '2025-5-13':  { name: 'Cuti Bersama Waisak',             type: 'national',      emoji: '☮️' },
  '2025-5-20':  { name: 'Hari Kebangkitan Nasional',       type: 'national',      emoji: '🇮🇩' },
  '2025-5-29':  { name: 'Kenaikan Isa Al-Masih',           type: 'national',      emoji: '✝️' },
  '2025-6-1':   { name: 'Hari Lahir Pancasila',            type: 'national',      emoji: '🇮🇩' },
  '2025-6-6':   { name: 'Hari Raya Idul Adha 1446 H',      type: 'national',      emoji: '🐑' },
  '2025-6-16':  { name: 'Hari Ayah Internasional',         type: 'international', emoji: '👨‍👧' },
  '2025-6-27':  { name: 'Tahun Baru Islam 1447 H',         type: 'national',      emoji: '🕌' },
  '2025-7-22':  { name: 'Hari Anak Nasional',              type: 'national',      emoji: '🧒' },
  '2025-8-17':  { name: 'Hari Kemerdekaan RI ke-80',       type: 'national',      emoji: '🇮🇩' },
  '2025-9-5':   { name: 'Maulid Nabi Muhammad SAW 1447 H', type: 'national',      emoji: '🌙' },
  '2025-10-1':  { name: 'Hari Kesaktian Pancasila',        type: 'national',      emoji: '🇮🇩' },
  '2025-10-2':  { name: 'Hari Batik Nasional',             type: 'national',      emoji: '🎨' },
  '2025-10-5':  { name: 'Hari TNI',                        type: 'national',      emoji: '🎖️' },
  '2025-10-10': { name: 'Hari Kesehatan Mental Sedunia',   type: 'international', emoji: '🧠' },
  '2025-10-28': { name: 'Sumpah Pemuda ke-97',             type: 'national',      emoji: '🇮🇩' },
  '2025-11-10': { name: 'Hari Pahlawan',                   type: 'national',      emoji: '🎖️' },
  '2025-11-25': { name: 'Hari Guru Nasional',              type: 'national',      emoji: '🍎' },
  '2025-12-1':  { name: 'Hari AIDS Sedunia',               type: 'international', emoji: '🎗️' },
  '2025-12-22': { name: 'Hari Ibu Nasional',               type: 'national',      emoji: '👩' },
  '2025-12-25': { name: 'Hari Natal',                      type: 'national',      emoji: '🎄' },
  '2025-12-26': { name: 'Cuti Bersama Natal',              type: 'national',      emoji: '🎄' },
  '2026-1-1':   { name: 'Tahun Baru Masehi 2026',          type: 'national',      emoji: '🎆' },
  '2026-1-16':  { name: 'Isra Mikraj Nabi Muhammad SAW',   type: 'national',      emoji: '🌙' },
  '2026-1-17':  { name: 'Tahun Baru Imlek 2577',           type: 'national',      emoji: '🐴' },
  '2026-2-14':  { name: "Hari Valentine's Day",            type: 'cultural',      emoji: '❤️' },
  '2026-3-8':   { name: 'Hari Perempuan Internasional',    type: 'international', emoji: '♀️' },
  '2026-3-20':  { name: 'Hari Raya Idul Fitri 1447 H',     type: 'national',      emoji: '🌙' },
  '2026-3-21':  { name: 'Hari Raya Idul Fitri (Hari 2)',   type: 'national',      emoji: '🌙' },
  '2026-3-22':  { name: 'Cuti Bersama Idul Fitri',         type: 'national',      emoji: '🌙' },
  '2026-3-23':  { name: 'Cuti Bersama Idul Fitri',         type: 'national',      emoji: '🌙' },
  '2026-3-28':  { name: 'Hari Nyepi (Tahun Baru Saka 1948)', type: 'national',    emoji: '🕯️' },
  '2026-4-3':   { name: 'Wafat Isa Al-Masih',              type: 'national',      emoji: '✝️' },
  '2026-4-20':  { name: 'Hari Kartini',                    type: 'national',      emoji: '👩' },
  '2026-4-22':  { name: 'Hari Bumi Sedunia',               type: 'international', emoji: '🌍' },
  '2026-5-1':   { name: 'Hari Buruh Internasional',        type: 'national',      emoji: '✊' },
  '2026-5-2':   { name: 'Hari Pendidikan Nasional',        type: 'national',      emoji: '📚' },
  '2026-5-14':  { name: 'Kenaikan Isa Al-Masih',           type: 'national',      emoji: '✝️' },
  '2026-5-20':  { name: 'Hari Kebangkitan Nasional',       type: 'national',      emoji: '🇮🇩' },
  '2026-5-27':  { name: 'Hari Raya Idul Adha 1447 H',      type: 'national',      emoji: '🐑' },
  '2026-5-31':  { name: 'Hari Raya Waisak',                type: 'national',      emoji: '☮️' },
  '2026-6-1':   { name: 'Hari Lahir Pancasila',            type: 'national',      emoji: '🇮🇩' },
  '2026-6-16':  { name: 'Tahun Baru Islam 1448 H',         type: 'national',      emoji: '🕌' },
  '2026-8-17':  { name: 'Hari Kemerdekaan RI ke-81',       type: 'national',      emoji: '🇮🇩' },
  '2026-9-25':  { name: 'Maulid Nabi Muhammad SAW 1448 H', type: 'national',      emoji: '🌙' },
  '2026-10-2':  { name: 'Hari Batik Nasional',             type: 'national',      emoji: '🎨' },
  '2026-10-28': { name: 'Sumpah Pemuda ke-98',             type: 'national',      emoji: '🇮🇩' },
  '2026-11-10': { name: 'Hari Pahlawan',                   type: 'national',      emoji: '🎖️' },
  '2026-11-25': { name: 'Hari Guru Nasional',              type: 'national',      emoji: '🍎' },
  '2026-12-22': { name: 'Hari Ibu Nasional',               type: 'national',      emoji: '👩' },
  '2026-12-25': { name: 'Hari Natal',                      type: 'national',      emoji: '🎄' },
}

function getHoliday(year: number, month: number, day: number): HolidayInfo | null {
  return HOLIDAYS[`${year}-${month}-${day}`] ?? null
}

const HOLIDAY_COLORS: Record<HolidayInfo['type'], string> = {
  national:      'text-red-600 bg-red-50 border-red-200',
  religious:     'text-purple-600 bg-purple-50 border-purple-200',
  international: 'text-blue-600 bg-blue-50 border-blue-200',
  academic:      'text-green-600 bg-green-50 border-green-200',
  cultural:      'text-orange-600 bg-orange-50 border-orange-200',
}

const HOLIDAY_DOT: Record<HolidayInfo['type'], string> = {
  national:      'bg-red-500',
  religious:     'bg-purple-500',
  international: 'bg-blue-500',
  academic:      'bg-green-500',
  cultural:      'bg-orange-400',
}

const EVENT_STYLES: Record<EventType, { pill: string; bar: string }> = {
  class:    { pill: 'bg-green-100 text-green-800',   bar: 'bg-green-500' },
  deadline: { pill: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500' },
  exam:     { pill: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-500' },
  personal: { pill: 'bg-sky-100 text-sky-800',       bar: 'bg-sky-500' },
  focus:    { pill: 'bg-purple-100 text-purple-700', bar: 'bg-purple-400' },
}

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  class:    'Kuliah',
  deadline: 'Deadline',
  exam:     'Ujian',
  personal: 'Organisasi/Personal',
  focus:    'Belajar Mandiri',
}

const TEAM_SLOTS = [
  'Senin 13:00 WIB', 'Selasa 14:00 WIB', 'Rabu 15:00 WIB',
  'Kamis 16:00 WIB', 'Jumat 10:00 WIB', 'Sabtu 09:00 WIB',
]

const DEFAULT_EVENTS: CalEvent[] = [
  { id: 1, title: 'Algoritma & Pemrograman', type: 'class',    year: 2025, month: 9, day: 12, time: '08:00 - 10:00', room: 'Lab Komputer 3' },
  { id: 2, title: 'Deadline UI/UX Project',  type: 'deadline', year: 2025, month: 9, day: 14, time: '23:59',         room: 'Online Submission' },
  { id: 3, title: 'UTS Basis Data',          type: 'exam',     year: 2025, month: 9, day: 20, time: '09:00',         room: 'Gedung B-204' },
  { id: 4, title: 'Rapat Organisasi',        type: 'personal', year: 2025, month: 9, day: 18, time: '15:00',         room: 'Student Center' },
  { id: 5, title: 'AI Focus Slot',           type: 'focus',    year: 2025, month: 9, day: 15, time: '19:00 - 21:00', room: 'Belajar Mandiri' },
]

const DEFAULT_ABSENCE: AbsenceClass[] = [
  { id: 1, name: 'Algoritma & Pemrograman', hadir: 8, sakit: 1, izin: 0 },
  { id: 2, name: 'Basis Data',              hadir: 7, sakit: 0, izin: 1 },
  { id: 3, name: 'Jaringan Komputer',       hadir: 9, sakit: 0, izin: 0 },
]

function lsRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw !== null) return JSON.parse(raw) as T
  } catch {}
  return fallback
}

function lsWrite(key: string, value: unknown) {
  try { window.localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

const LS = {
  events:      'plotwist_cal:events',
  nextId:      'plotwist_cal:nextId',
  absence:     'plotwist_cal:absence',
  absNextId:   'plotwist_cal:absNextId',
  cdLabel:     'plotwist_cal:cdLabel',
  cdMiddle:    'plotwist_cal:cdMiddle',
  cdSubtitle:  'plotwist_cal:cdSubtitle',
  cdDate:      'plotwist_cal:cdDate',
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay()
}

// ── Hook baca productivity level dari localStorage ────────────────────────────
function useProductivityLevel(): number {
  const [level, setLevel] = useState(1)
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem('plotwist_state_v1')
        if (raw) {
          const p = JSON.parse(raw)
          const xp = p.xp ?? 0
          setLevel(Math.max(1, Math.floor(xp / 500) + 1))
        }
      } catch {}
    }
    read()
    const onStorage = (e: StorageEvent) => { if (e.key === 'plotwist_state_v1') read() }
    window.addEventListener('storage', onStorage)
    const id = setInterval(read, 3000)
    return () => { window.removeEventListener('storage', onStorage); clearInterval(id) }
  }, [])
  return level
}

interface ModalProps {
  event: CalEvent | null
  defaultDay: number
  defaultYear: number
  defaultMonth: number
  onSave: (ev: Omit<CalEvent, 'id'> & { id?: number }) => void
  onClose: () => void
}

function EventModal({ event, defaultDay, defaultYear, defaultMonth, onSave, onClose }: ModalProps) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [day, setDay]     = useState(event?.day ?? defaultDay)
  const [type, setType]   = useState<EventType>(event?.type ?? 'class')
  const [time, setTime]   = useState(event?.time ?? '')
  const [room, setRoom]   = useState(event?.room ?? '')

  const handleSave = () => {
    if (!title.trim()) { alert('Judul tidak boleh kosong!'); return }
    onSave({ id: event?.id, title: title.trim(), type, year: defaultYear, month: defaultMonth, day, time, room })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] p-8 w-full max-w-md shadow-2xl">
        <div className="flex flex-col gap-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{event ? 'Edit Jadwal' : 'Tambah Jadwal'}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
            <FaTimes className="text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Judul Jadwal</label>
            <input className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:border-purple-400 focus:outline-none transition"
              placeholder="Contoh: Kuliah Basis Data" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Tanggal</label>
              <input type="number" min={1} max={31}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:border-purple-400 focus:outline-none transition"
                value={day} onChange={e => setDay(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Jenis</label>
              <select className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:border-purple-400 focus:outline-none transition bg-white"
                value={type} onChange={e => setType(e.target.value as EventType)}>
                {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map(k => (
                  <option key={k} value={k}>{EVENT_TYPE_LABELS[k]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Waktu</label>
            <input className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:border-purple-400 focus:outline-none transition"
              placeholder="08:00 - 10:00" value={time} onChange={e => setTime(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Lokasi / Ruang</label>
            <input className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:border-purple-400 focus:outline-none transition"
              placeholder="Lab Komputer 3 / Online" value={room} onChange={e => setRoom(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold hover:bg-gray-200 transition">Batal</button>
          <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-bold hover:scale-[1.02] transition shadow-lg">
            {event ? 'Simpan Perubahan' : 'Tambah Jadwal'}
          </button>
        </div>
      </div>
    </div>
  )
}

type ActivePanel = 'calendar' | 'absence' | 'team' | 'sync'

export default function CalendarPage() {

  const today = new Date()
  const productivityLevel = useProductivityLevel()
  const isProUnlocked = productivityLevel >= 2

  const [currentYear,  setCurrentYear]  = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<number | null>(today.getDate())
  const [viewMode,     setViewMode]     = useState<'monthly' | 'agenda'>('monthly')
  const [activePanel,  setActivePanel]  = useState<ActivePanel>('calendar')
  const [isLocked,     setIsLocked]     = useState(false)
  const [isDirty,      setIsDirty]      = useState(false)
  const [toast,        setToast]        = useState<string | null>(null)

  const triggerToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const [events, setEvents] = useState<CalEvent[]>(
    () => lsRead(LS.events, DEFAULT_EVENTS)
  )
  const [nextId, setNextId] = useState<number>(
    () => lsRead(LS.nextId, 6)
  )
  const [absenceClasses, setAbsenceClasses] = useState<AbsenceClass[]>(
    () => lsRead(LS.absence, DEFAULT_ABSENCE)
  )
  const [absNextId, setAbsNextId] = useState<number>(
    () => lsRead(LS.absNextId, 4)
  )
  const [countdownLabel,      setCountdownLabel]      = useState<string>(() => lsRead(LS.cdLabel,    'UAS'))
  const [countdownMiddle,     setCountdownMiddle]     = useState<string>(() => lsRead(LS.cdMiddle,   'Hari menuju'))
  const [countdownSubtitle,   setCountdownSubtitle]   = useState<string>(() => lsRead(LS.cdSubtitle, 'Tetap konsisten dan jangan SKS 🚀'))
  const [countdownTargetDate, setCountdownTargetDate] = useState<string>(() => lsRead(LS.cdDate,     '2025-12-15'))

  useEffect(() => { lsWrite(LS.events,     events)            }, [events])
  useEffect(() => { lsWrite(LS.nextId,     nextId)            }, [nextId])
  useEffect(() => { lsWrite(LS.absence,    absenceClasses)    }, [absenceClasses])
  useEffect(() => { lsWrite(LS.absNextId,  absNextId)         }, [absNextId])
  useEffect(() => { lsWrite(LS.cdLabel,    countdownLabel)    }, [countdownLabel])
  useEffect(() => { lsWrite(LS.cdMiddle,   countdownMiddle)   }, [countdownMiddle])
  useEffect(() => { lsWrite(LS.cdSubtitle, countdownSubtitle) }, [countdownSubtitle])
  useEffect(() => { lsWrite(LS.cdDate,     countdownTargetDate) }, [countdownTargetDate])

  const [modalOpen,    setModalOpen]    = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null)
  const [newAbsName,   setNewAbsName]   = useState('')
  const [addingAbs,    setAddingAbs]    = useState(false)
  const [teamMembers,  setTeamMembers]  = useState('Andi, Budi, Cinta')
  const [teamResult,   setTeamResult]   = useState<string | null>(null)
  const [teamAnalyzing,setTeamAnalyzing]= useState(false)
  const [editingCountdown,    setEditingCountdown]    = useState(false)
  const [cdLabelDraft,    setCdLabelDraft]    = useState('UAS')
  const [cdMiddleDraft,   setCdMiddleDraft]   = useState('Hari menuju')
  const [cdSubtitleDraft, setCdSubtitleDraft] = useState('Tetap konsisten dan jangan SKS 🚀')
  const [cdDateDraft,     setCdDateDraft]     = useState('2025-12-15')

  const computedCountdownDays = useMemo(() => {
  if (!countdownTargetDate) return 0
  const now    = new Date()
  const target = new Date(countdownTargetDate)
  if (isNaN(target.getTime())) return 0   // ← guard NaN
  return Math.max(0, Math.round((target.getTime() - now.getTime()) / 86_400_000))
}, [countdownTargetDate])

  const markDirty = () => { setIsDirty(true); setIsLocked(false) }

  const openCountdownEdit = () => {
    setCdLabelDraft(countdownLabel)
    setCdMiddleDraft(countdownMiddle)
    setCdSubtitleDraft(countdownSubtitle)
    setCdDateDraft(countdownTargetDate)
    setEditingCountdown(true)
  }

  const saveCountdown = () => {
    if (!cdLabelDraft.trim()) { alert('Label tidak boleh kosong!'); return }
    setCountdownLabel(cdLabelDraft.trim())
    setCountdownMiddle(cdMiddleDraft.trim() || 'Hari menuju')
    setCountdownSubtitle(cdSubtitleDraft.trim())
    setCountdownTargetDate(cdDateDraft)
    setEditingCountdown(false)
    triggerToast('Countdown disimpan ✅')
  }

  const changeMonth = (dir: 1 | -1) => {
    setSelectedDate(null)
    setCurrentMonth(prev => {
      const next = prev + dir
      if (next > 12) { setCurrentYear(y => y + 1); return 1 }
      if (next < 1)  { setCurrentYear(y => y - 1); return 12 }
      return next
    })
  }

  const goToday = () => {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth() + 1)
    setSelectedDate(today.getDate())
  }

  const openAdd = () => {
    if (isLocked) { triggerToast('Klik Unlock untuk mengedit 🔒'); return }
    setEditingEvent(null); setModalOpen(true)
  }

  const openEdit = (ev: CalEvent) => {
    if (isLocked) { triggerToast('Klik Unlock untuk mengedit 🔒'); return }
    setEditingEvent(ev); setModalOpen(true)
  }

  const saveEvent = (data: Omit<CalEvent, 'id'> & { id?: number }) => {
    if (data.id) {
      setEvents(prev => prev.map(e => e.id === data.id ? { ...e, ...data, id: e.id } : e))
    } else {
      setEvents(prev => [...prev, { ...data, id: nextId }])
      setNextId(n => n + 1)
    }
    setSelectedDate(data.day)
    setModalOpen(false)
    markDirty()
  }

  const deleteEvent = (id: number) => {
    if (isLocked) { triggerToast('Klik Unlock untuk mengedit 🔒'); return }
    if (confirm('Hapus jadwal ini?')) { setEvents(prev => prev.filter(e => e.id !== id)); markDirty() }
  }

  const markAbsence = (id: number, status: 'hadir' | 'sakit' | 'izin') => {
    setAbsenceClasses(prev => prev.map(c => c.id === id ? { ...c, [status]: c[status] + 1 } : c))
    markDirty()
  }

  const removeAbsClass = (id: number) => {
    if (confirm('Hapus mata kuliah ini?')) {
      setAbsenceClasses(prev => prev.filter(c => c.id !== id))
      markDirty()
    }
  }

  const addAbsClass = () => {
    if (!newAbsName.trim()) return
    setAbsenceClasses(prev => [...prev, { id: absNextId, name: newAbsName.trim(), hadir: 0, sakit: 0, izin: 0 }])
    setAbsNextId(n => n + 1)
    setNewAbsName('')
    setAddingAbs(false)
    markDirty()
  }

  const absStats = useMemo(() => {
    const totalSesi  = absenceClasses.reduce((s, c) => s + c.hadir + c.sakit + c.izin, 0)
    const totalHadir = absenceClasses.reduce((s, c) => s + c.hadir, 0)
    const totalTidak = absenceClasses.reduce((s, c) => s + c.sakit + c.izin, 0)
    const pct = totalSesi > 0 ? Math.round(totalHadir / totalSesi * 100) : 0
    return { totalHadir, totalTidak, pct }
  }, [absenceClasses])

  const analyzeTeam = () => {
    const members = teamMembers.split(',').map(m => m.trim()).filter(Boolean)
    if (members.length < 2) { alert('Masukkan minimal 2 anggota!'); return }
    setTeamAnalyzing(true); setTeamResult(null)
    setTimeout(() => {
      const best = TEAM_SLOTS[Math.floor(Math.random() * TEAM_SLOTS.length)]
      setTeamResult(`Waktu terbaik untuk ${members.join(', ')} adalah:\n${best}`)
      setTeamAnalyzing(false)
    }, 800)
  }

  const totalDays  = getDaysInMonth(currentYear, currentMonth)
  const firstDay   = getFirstDayOfMonth(currentYear, currentMonth)
  const dayNumbers = useMemo(() => Array.from({ length: totalDays }, (_, i) => i + 1), [totalDays])

  const monthEvents = useMemo(
    () => events.filter(e => e.year === currentYear && e.month === currentMonth),
    [events, currentYear, currentMonth]
  )

  const selectedEvents  = useMemo(() => selectedDate ? monthEvents.filter(e => e.day === selectedDate) : [], [monthEvents, selectedDate])
  const selectedHoliday = selectedDate ? getHoliday(currentYear, currentMonth, selectedDate) : null

  const upcomingHolidays = useMemo(() => {
    return dayNumbers
      .map(d => ({ day: d, info: getHoliday(currentYear, currentMonth, d) }))
      .filter(h => h.info !== null) as { day: number; info: HolidayInfo }[]
  }, [dayNumbers, currentYear, currentMonth])

  // XP yang dibutuhkan untuk level 2
  const xpNeeded = useMemo(() => {
    try {
      const raw = localStorage.getItem('plotwist_state_v1')
      if (raw) {
        const xp = JSON.parse(raw).xp ?? 0
        return Math.max(0, 1000 - xp)
      }
    } catch {}
    return 1000
  }, [productivityLevel])

  return (
    <div className="flex-1 min-h-screen bg-[#F5F7FB]">
      <div className="p-4 md:p-8 overflow-y-auto">

        {/* ── PetCompanion: tampil hanya jika Pro terbuka, sisanya banner terkunci ── */}
        {isProUnlocked ? (
          <PetCompanion variant="inline" message="Yuk atur jadwalmu hari ini! 📅" />
        ) : (
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-2xl px-5 py-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <FaPaw className="text-purple-300 text-sm" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-400">
                Pet Academy terkunci
              </p>
              <p className="text-xs text-purple-300">
                Capai <span className="font-bold text-purple-500">Level 2</span> untuk unlock companion kamu
                {xpNeeded > 0 && ` · butuh ${xpNeeded.toLocaleString('id-ID')} XP lagi`}
              </p>
            </div>
            <FaLock className="text-purple-200 shrink-0" />
          </div>
        )}

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col gap-3 mb-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-800">Kalender</h1>
              <p className="text-gray-500 mt-2 text-lg">Pusat Manajemen Waktu Mahasiswa</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  if (isLocked) { setIsLocked(false); triggerToast('Mode edit aktif 🔓') }
                  else if (isDirty) { setIsDirty(false); setIsLocked(true); triggerToast('Tersimpan & terkunci 🔒') }
                }}
                className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl font-bold transition-all ${
                  isLocked ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' :
                  isDirty ? 'bg-green-500 text-white hover:bg-green-600 animate-pulse' :
                  'bg-gray-100 text-gray-400 cursor-default'
                }`}
              >
                {isLocked ? <FaLock /> : <FaUnlock />}
                <span className="text-sm">{isLocked ? 'Terkunci' : isDirty ? 'Simpan & Kunci' : 'Belum ada perubahan'}</span>
              </button>
              <div className="flex items-center gap-3 bg-white p-3 rounded-3xl shadow-lg">
                <button onClick={() => changeMonth(-1)} className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                  <FaChevronLeft />
                </button>
                <div className="font-bold text-xl px-3 min-w-[120px] text-center text-gray-800 text-sm select-none">
                  {MONTH_NAMES[currentMonth - 1]} {currentYear}
                </div>
                <button onClick={() => changeMonth(1)} className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                  <FaChevronRight />
                </button>
              </div>
          <button onClick={goToday} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm rounded-3xl font-bold shadow-xl hover:scale-105 transition flex-1 md:flex-none text-center">
                Hari Ini
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="relative bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white px-8 py-5 rounded-[28px] shadow-2xl flex items-center gap-4 group flex-1">
              <FaFire className="text-3xl shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-2xl">
                  🔥 {computedCountdownDays} {countdownMiddle} {countdownLabel}
                </h3>
                <p className="opacity-80">{countdownSubtitle}</p>
              </div>
              <button
                onClick={openCountdownEdit}
                className="shrink-0 w-9 h-9 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                title="Edit countdown"
              >
                <FaPencilAlt className="text-sm" />
              </button>
            </div>
            <div className="bg-white rounded-[28px] p-3 shadow-xl flex gap-3">
              {([
                { id: 'monthly', icon: <FaCalendarAlt />, label: 'Bulanan' },
                { id: 'agenda',  icon: <FaList />,        label: 'Agenda' },
              ] as const).map(item => (
                <button key={item.id} onClick={() => setViewMode(item.id)}
                  className={`px-5 h-14 rounded-2xl flex items-center gap-2 text-base font-semibold transition-all ${
                    viewMode === item.id ? 'bg-purple-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">

          {/* LEFT: CALENDAR */}
          <div className="col-span-1 lg:col-span-7 space-y-6">
            {upcomingHolidays.length > 0 && (
              <div className="bg-white rounded-[28px] p-5 shadow-xl overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <FaFlag className="text-red-500 text-xl" />
                  <h3 className="font-bold text-gray-800 text-lg">Hari Besar Bulan Ini</h3>
                  <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{upcomingHolidays.length} peringatan</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {upcomingHolidays.map(({ day, info }) => (
                    <button key={day} onClick={() => setSelectedDate(day)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-semibold transition-all hover:scale-105 ${HOLIDAY_COLORS[info.type]}`}>
                      <span>{info.emoji}</span>
                      <span>{day} {MONTH_NAMES[currentMonth - 1].slice(0, 3)}</span>
                      <span className="font-normal">— {info.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-[40px] p-8 shadow-xl">
              {viewMode === 'monthly' && (
                <>
                  <div className="grid grid-cols-7 mb-4">
                    {DAY_NAMES.map(d => (
                      <div key={d} className="text-center font-bold text-gray-500 text-lg">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-3">
                    {Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} />)}
                    {dayNumbers.map(day => {
                      const dayEvs  = monthEvents.filter(e => e.day === day)
                      const holiday = getHoliday(currentYear, currentMonth, day)
                      const isToday = today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth && today.getDate() === day
                      return (
                        <div key={day} onClick={() => setSelectedDate(day)}
                          className={`min-h-[140px] rounded-[24px] p-3 border-2 transition-all cursor-pointer hover:scale-[1.02] ${
                            selectedDate === day ? 'border-purple-500 bg-purple-50' :
                            isToday ? 'border-purple-300 bg-purple-50/40' :
                            holiday ? `border-opacity-40 ${
                              holiday.type === 'national' ? 'border-red-200 bg-red-50/30' :
                              holiday.type === 'religious' ? 'border-purple-200 bg-purple-50/20' :
                              holiday.type === 'international' ? 'border-blue-200 bg-blue-50/20' :
                              'border-orange-200 bg-orange-50/20'
                            }` : 'border-gray-100 bg-[#FAFAFA] hover:border-gray-200'
                          }`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className={`font-bold text-lg ${
                              isToday ? 'text-purple-600' :
                              holiday?.type === 'national' || holiday?.type === 'religious' ? 'text-red-500' :
                              holiday ? 'text-blue-500' : 'text-gray-800'
                            }`}>{day}</div>
                            {holiday && <div className={`w-2.5 h-2.5 rounded-full ${HOLIDAY_DOT[holiday.type]}`} title={holiday.name} />}
                          </div>
                          {holiday && (
                            <div className={`text-[9px] font-semibold leading-tight mb-1 line-clamp-2 ${
                              holiday.type === 'national' || holiday.type === 'religious' ? 'text-red-500' :
                              holiday.type === 'international' ? 'text-blue-500' : 'text-orange-500'
                            }`}>{holiday.emoji} {holiday.name}</div>
                          )}
                          <div className="space-y-1">
                            {dayEvs.slice(0, 2).map(ev => (
                              <div key={ev.id} className={`rounded-lg px-2 py-1 text-[10px] font-semibold truncate ${EVENT_STYLES[ev.type].pill}`}>
                                {ev.title}
                              </div>
                            ))}
                            {dayEvs.length > 2 && <div className="text-[9px] text-gray-400 pl-1">+{dayEvs.length - 2} lagi</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {viewMode === 'agenda' && (
                <div>
                  <h3 className="font-bold text-xl text-gray-700 mb-6">Agenda {MONTH_NAMES[currentMonth - 1]} {currentYear}</h3>
                  {monthEvents.length === 0 && upcomingHolidays.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                      <FaCalendarAlt className="text-5xl mx-auto mb-4 opacity-30" />
                      <p className="text-lg">Tidak ada jadwal atau hari besar bulan ini.</p>
                    </div>
                  )}
                  {upcomingHolidays.map(({ day, info }) => (
                    <div key={`holiday-${day}`} className={`flex items-center gap-4 rounded-2xl p-4 mb-3 border ${HOLIDAY_COLORS[info.type]}`}>
                      <div className="text-center w-12 shrink-0">
                        <div className="font-bold text-2xl">{day}</div>
                        <div className="text-xs opacity-70">{MONTH_NAMES[currentMonth - 1].slice(0, 3)}</div>
                      </div>
                      <div className="text-2xl">{info.emoji}</div>
                      <div className="flex-1">
                        <div className="font-bold">{info.name}</div>
                        <div className="text-xs opacity-70 capitalize">{info.type}</div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${HOLIDAY_COLORS[info.type]}`}>Hari Besar</span>
                    </div>
                  ))}
                  <div className="space-y-3">
                    {[...monthEvents].sort((a, b) => a.day - b.day).map(ev => {
                      const holiday = getHoliday(currentYear, currentMonth, ev.day)
                      return (
                        <div key={ev.id} onClick={() => setSelectedDate(ev.day)}
                          className="flex items-center gap-4 bg-[#FAFAFA] rounded-2xl p-4 hover:bg-purple-50 cursor-pointer transition border border-gray-100 hover:border-purple-200">
                          <div className="text-center w-12 shrink-0">
                            <div className="font-bold text-2xl text-gray-800">{ev.day}</div>
                            <div className="text-xs text-gray-400">{MONTH_NAMES[currentMonth - 1].slice(0, 3)}</div>
                          </div>
                          <div className={`w-1 h-12 rounded-full ${EVENT_STYLES[ev.type].bar}`} />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-800 truncate">{ev.title}</div>
                            <div className="text-sm text-gray-500">{ev.time} · {ev.room}</div>
                            {holiday && <div className="text-xs text-red-500 font-semibold mt-0.5">{holiday.emoji} {holiday.name}</div>}
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${EVENT_STYLES[ev.type].pill}`}>{EVENT_TYPE_LABELS[ev.type]}</span>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={e => { e.stopPropagation(); openEdit(ev) }}
                              className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-purple-100 hover:text-purple-600 transition text-gray-500 text-sm"><FaEdit /></button>
                            <button onClick={e => { e.stopPropagation(); deleteEvent(ev.id) }}
                              className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition text-gray-500 text-sm"><FaTrash /></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="col-span-1 lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[28px] p-3 shadow-xl grid grid-cols-2 gap-2">
              {([
                { id: 'calendar', label: '📅 Jadwal' },
                { id: 'absence',  label: '✅ Absensi' },
                { id: 'team',     label: '👥 Tim' },
                { id: 'sync',     label: '🔗 Sync' },
              ] as { id: ActivePanel; label: string }[]).map(p => (
                <button key={p.id} onClick={() => setActivePanel(p.id)}
                  className={`py-2.5 rounded-2xl font-semibold text-sm transition-all ${
                    activePanel === p.id ? 'bg-purple-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>

            {activePanel === 'calendar' && (
              <div className="bg-white rounded-[35px] p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedDate ? `${selectedDate} ${MONTH_NAMES[currentMonth - 1]}` : 'Pilih Tanggal'}
                    </h2>
                    {selectedHoliday && (
                      <div className={`flex items-center gap-1 mt-1 text-xs font-semibold px-2 py-1 rounded-xl border ${HOLIDAY_COLORS[selectedHoliday.type]}`}>
                        {selectedHoliday.emoji} {selectedHoliday.name}
                      </div>
                    )}
                  </div>
                  <button onClick={openAdd} className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center hover:bg-purple-200 transition">
                    <FaPlus />
                  </button>
                </div>
                {selectedDate === null && <p className="text-sm text-gray-400 text-center py-4">Klik tanggal di kalender.</p>}
                <div className="space-y-3">
                  {selectedEvents.map(ev => (
                    <div key={ev.id} className="flex items-start gap-3 bg-[#FAFAFA] rounded-2xl p-3 border border-gray-100">
                      <div className={`w-1 rounded-full self-stretch ${EVENT_STYLES[ev.type].bar}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-800 text-sm truncate">{ev.title}</div>
                        <div className="text-xs text-gray-500">{ev.time}</div>
                        <div className="text-xs text-gray-400">{ev.room}</div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => openEdit(ev)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-purple-100 hover:text-purple-600 transition text-gray-400 text-xs"><FaEdit /></button>
                        <button onClick={() => deleteEvent(ev.id)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition text-gray-400 text-xs"><FaTrash /></button>
                      </div>
                    </div>
                  ))}
                  {selectedDate !== null && selectedEvents.length === 0 && !selectedHoliday && (
                    <p className="text-sm text-gray-400 text-center py-2">Tidak ada jadwal hari ini.</p>
                  )}
                </div>
                <button onClick={openAdd}
                  className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-bold hover:scale-[1.02] transition shadow-lg flex items-center justify-center gap-2">
                  <FaPlus /> Tambah Jadwal
                </button>
              </div>
            )}

            {activePanel === 'absence' && (
              <div className="bg-white rounded-[35px] p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Sistem Absensi</h2>
                    <p className="text-gray-500 text-sm">Catat kehadiran per mata kuliah</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center text-2xl"><FaCheckCircle /></div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div className="bg-green-50 rounded-2xl p-3 text-center border border-green-100">
                    <div className="font-bold text-2xl text-green-600">{absStats.totalHadir}</div>
                    <div className="text-xs text-green-500 font-semibold">Hadir</div>
                  </div>
                  <div className={`rounded-2xl p-3 text-center border ${absStats.pct >= 75 ? 'bg-purple-50 border-purple-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`font-bold text-2xl ${absStats.pct >= 75 ? 'text-purple-600' : 'text-red-500'}`}>{absStats.pct}%</div>
                    <div className={`text-xs font-semibold ${absStats.pct >= 75 ? 'text-purple-400' : 'text-red-400'}`}>Kehadiran</div>
                  </div>
                  <div className="bg-orange-50 rounded-2xl p-3 text-center border border-orange-100">
                    <div className="font-bold text-2xl text-orange-500">{absStats.totalTidak}</div>
                    <div className="text-xs text-orange-400 font-semibold">S+I</div>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  {absenceClasses.map(cl => {
                    const tot = cl.hadir + cl.sakit + cl.izin
                    const pct = tot > 0 ? Math.round(cl.hadir / tot * 100) : 0
                    return (
                      <div key={cl.id} className="bg-[#F8FAFC] rounded-2xl p-3 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-gray-800 text-sm">{cl.name}</div>
                            <div className={`text-xs font-semibold ${pct < 75 ? 'text-red-500' : 'text-gray-400'}`}>
                              {cl.hadir}/{tot} hadir ({pct}%) {pct < 75 ? '⚠️' : ''}
                            </div>
                          </div>
                          <button onClick={() => removeAbsClass(cl.id)} className="text-gray-300 hover:text-red-400 transition text-sm"><FaTimes /></button>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button onClick={() => markAbsence(cl.id, 'hadir')} className="bg-green-500 text-white py-1.5 rounded-xl text-xs font-bold hover:bg-green-600 transition">+ Hadir</button>
                          <button onClick={() => markAbsence(cl.id, 'sakit')} className="bg-yellow-400 text-black py-1.5 rounded-xl text-xs font-bold hover:bg-yellow-500 transition">+ Sakit</button>
                          <button onClick={() => markAbsence(cl.id, 'izin')}  className="bg-red-400 text-white py-1.5 rounded-xl text-xs font-bold hover:bg-red-500 transition">+ Izin</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {addingAbs ? (
                  <div className="flex gap-2">
                    <input autoFocus
                      className="flex-1 border-2 border-gray-200 rounded-2xl px-3 py-2 text-sm text-gray-800 focus:border-purple-400 focus:outline-none transition"
                      placeholder="Nama Mata Kuliah" value={newAbsName} onChange={e => setNewAbsName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addAbsClass(); if (e.key === 'Escape') setAddingAbs(false) }} />
                    <button onClick={addAbsClass} className="bg-purple-500 text-white px-4 rounded-2xl text-sm font-bold hover:bg-purple-600 transition">Tambah</button>
                  </div>
                ) : (
                  <button onClick={() => setAddingAbs(true)}
                    className="w-full border-2 border-dashed border-gray-200 text-gray-400 py-3 rounded-2xl text-sm font-semibold hover:border-purple-300 hover:text-purple-500 transition flex items-center justify-center gap-2">
                    <FaPlus /> Tambah Mata Kuliah
                  </button>
                )}
                <button className="w-full mt-4 bg-gradient-to-r from-sky-400 to-indigo-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition shadow-lg">
                  <FaRoute /> Rute Jalan Kampus
                </button>
              </div>
            )}

            {activePanel === 'team' && (
              <div className="bg-white rounded-[35px] p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl"><FaBrain /></div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Free-Time Finder</h2>
                    <p className="text-gray-500 text-sm">Cari waktu kosong kelompok</p>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Anggota Tim (pisah koma)</label>
                  <input className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-700 text-sm focus:border-purple-400 focus:outline-none transition"
                    placeholder="Andi, Budi, Cinta, Dani" value={teamMembers} onChange={e => setTeamMembers(e.target.value)} />
                </div>
                {teamResult && (
                  <div className="bg-[#F7F7FB] rounded-3xl p-4 mb-4 border border-purple-100">
                    <p className="text-gray-500 text-sm mb-1">Waktu kosong terbaik:</p>
                    <div className="text-purple-600 font-bold text-lg">{teamResult.split('\n')[1]}</div>
                    <div className="text-xs text-gray-400 mt-1">{teamResult.split('\n')[0]}</div>
                  </div>
                )}
                <button onClick={analyzeTeam} disabled={teamAnalyzing}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold hover:scale-[1.02] transition shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
                  <FaUsers />
                  {teamAnalyzing ? 'Menganalisis...' : 'Analisis Kalender Tim'}
                </button>
              </div>
            )}

            {activePanel === 'sync' && (
              <>
                <div className="bg-gradient-to-r from-sky-400 to-indigo-500 rounded-[35px] p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Weather Alert</h2>
                      <p className="opacity-80 mt-2">Hujan diprediksi jam 13:00 🌧️</p>
                    </div>
                    <FaCloudRain className="text-5xl" />
                  </div>
                </div>
                <div className="bg-white rounded-[35px] p-6 shadow-xl">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Smart Sync</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-[#F8FAFC] rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <FaGoogle className="text-red-500 text-2xl" />
                        <div><h3 className="font-bold text-gray-800">Google Calendar</h3><p className="text-sm text-gray-500">Connected</p></div>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                    </div>
                    <div className="flex items-center justify-between bg-[#F8FAFC] rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <FaApple className="text-black text-2xl" />
                        <div><h3 className="font-bold text-gray-800">Apple Calendar</h3><p className="text-sm text-gray-500">Connected</p></div>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                    </div>
                    <div className="flex items-center justify-between bg-[#F8FAFC] rounded-2xl p-4">
                      <div>
                        <h3 className="font-bold text-gray-800">SISKA Campus Sync</h3>
                        <p className="text-sm text-gray-500">Real-time schedule updates</p>
                      </div>
                      <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">ACTIVE</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL EDIT COUNTDOWN */}
      {editingCountdown && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-8 w-full max-w-sm shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Countdown</h2>
              <button onClick={() => setEditingCountdown(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl px-4 py-3 mb-5 text-white text-sm font-bold text-center">
              🔥 {computedCountdownDays} {cdMiddleDraft || 'Hari menuju'} {cdLabelDraft || '...'}
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Angka (otomatis dari tanggal target)</label>
                <div className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-gray-400 text-sm">
                  {computedCountdownDays} hari (dihitung otomatis)
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Teks Tengah <span className="text-purple-400">(misal: Hari menuju, Minggu sampai)</span>
                </label>
                <input className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:border-purple-400 focus:outline-none transition"
                  placeholder="Hari menuju" value={cdMiddleDraft} onChange={e => setCdMiddleDraft(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Label Kegiatan <span className="text-purple-400">(misal: UAS, Liburan, Wisuda)</span>
                </label>
                <input className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:border-purple-400 focus:outline-none transition"
                  placeholder="UAS" value={cdLabelDraft} onChange={e => setCdLabelDraft(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Subtitle / Motivasi</label>
                <input className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:border-purple-400 focus:outline-none transition"
                  value={cdSubtitleDraft} onChange={e => setCdSubtitleDraft(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Tanggal Target</label>
                <input type="date" className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:border-purple-400 focus:outline-none transition"
                  value={cdDateDraft} onChange={e => setCdDateDraft(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingCountdown(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold hover:bg-gray-200 transition">Batal</button>
              <button onClick={saveCountdown} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-bold hover:scale-[1.02] transition shadow-lg flex items-center justify-center gap-2">
                <FaSave /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <EventModal event={editingEvent} defaultDay={selectedDate ?? 1} defaultYear={currentYear}
          defaultMonth={currentMonth} onSave={saveEvent} onClose={() => setModalOpen(false)} />
      )}

      {toast && (
        <div className="fixed top-8 right-8 z-50 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce text-sm font-semibold">
          {toast}
        </div>
      )}
    </div>
  )
}