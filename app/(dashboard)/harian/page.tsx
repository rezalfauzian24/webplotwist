"use client";

import React, { useState, useEffect, useCallback } from 'react';

// ─── 3D Emoji renderer ─────────────────────────────────────────────────────
// Renders any emoji glyph as a Fluent "3D" style image (instead of the flat
// system emoji font), with automatic fallback back to the plain text glyph
// if the image fails to load (offline, blocked CDN, unsupported emoji, etc).

const EMOJI_3D_BASE = 'https://cdn.jsdelivr.net/gh/ehne/fluentui-twemoji-3d/export/3D_png'

function toEmojiCodepoint(emoji: string): string {
  return Array.from(emoji)
    .map(ch => (ch.codePointAt(0) ?? 0).toString(16))
    .join('-')
}

function Emoji3D({ e, size = 18, className = '' }: { e: string; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return <span className={className} style={{ fontSize: size * 0.85, lineHeight: 1 }}>{e}</span>
  }
  return (
    <img
      src={`${EMOJI_3D_BASE}/${toEmojiCodepoint(e)}.png`}
      alt={e}
      width={size}
      height={size}
      draggable={false}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`inline-block align-[-15%] select-none ${className}`}
      style={{ width: size, height: size, minWidth: size }}
    />
  )
}

// ─── Pet Academy: baca pet aktif dari localStorage ────────────────────────────

const PET_STORAGE_KEY = 'plotwist_active_pet'

const ALL_PETS = [
  { id: 1, src: 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/35.png', name: 'Sparky',  color: '#FFD700', glow: '#FFA500' },
  { id: 2, src: 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/36.png', name: 'Frostie', color: '#00CFFF', glow: '#0099FF' },
  { id: 3, src: 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/37.png', name: 'Blaze',   color: '#FF4D00', glow: '#FF0000' },
  { id: 4, src: 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/38.png', name: 'Leafy',   color: '#00E676', glow: '#00C853' },
  { id: 5, src: 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/39.png', name: 'Mystico', color: '#CC00FF', glow: '#9900CC' },
  { id: 6, src: 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/40.png', name: 'Aqua',    color: '#00B0FF', glow: '#0091EA' },
  { id: 7, src: 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/41.png', name: 'Rocko',   color: '#FF8C00', glow: '#FF6600' },
  { id: 8, src: 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/42.png', name: 'Lumina',  color: '#FFF176', glow: '#FFEE58' },
]

function useActivePet() {
  const [petId, setPetId] = useState<number>(1)
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(PET_STORAGE_KEY)
        if (raw) setPetId(JSON.parse(raw))
      } catch {}
    }
    read()
    const handler = (e: StorageEvent) => { if (e.key === PET_STORAGE_KEY) read() }
    window.addEventListener('storage', handler)
    const interval = setInterval(read, 3000)
    return () => { window.removeEventListener('storage', handler); clearInterval(interval) }
  }, [])
  return ALL_PETS.find(p => p.id === petId) ?? ALL_PETS[0]
}

// ─── Hook: baca productivity level dari localStorage ─────────────────────────

function useProductivityLevel(): number {
  const [level, setLevel] = useState(0)
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem('plotwist_state_v1')
        if (raw) {
          const p = JSON.parse(raw)
          const xp = p.xp ?? 0
          setLevel(Math.floor(xp / 500))
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface HabitItem {
  id: number;
  label: string;
  sublabel: string;
  colorClass: string;
  checked: boolean;
  mentalWeight: number;
  physicalWeight: number;
  hours: number;
}

interface MoodOption {
  emoji: string;
  label: string;
}

interface DailyState {
  habits: HabitItem[];
  selectedMood: string;
  journalText: string;
  waterCount: number;
  dailyWin: string;
  plotwistIndex: number;
  plotwistDate: string;
  dailyXP: number;
  dailyXPDate: string;
  streak: number;
  lastStreakDate: string;
  comboDate: string;
}

const STORAGE_KEY = 'plotwist_harian_v5';

const COLOR_OPTIONS = [
  { label: 'Amber',   colorClass: 'bg-amber-500 text-white',   hex: '#f59e0b' },
  { label: 'Emerald', colorClass: 'bg-emerald-500 text-white', hex: '#10b981' },
  { label: 'Blue',    colorClass: 'bg-blue-500 text-white',    hex: '#3b82f6' },
  { label: 'Orange',  colorClass: 'bg-orange-600 text-white',  hex: '#ea580c' },
  { label: 'Pink',    colorClass: 'bg-pink-600 text-white',    hex: '#db2777' },
  { label: 'Violet',  colorClass: 'bg-violet-600 text-white',  hex: '#7c3aed' },
  { label: 'Rose',    colorClass: 'bg-rose-500 text-white',    hex: '#f43f5e' },
  { label: 'Teal',    colorClass: 'bg-teal-500 text-white',    hex: '#14b8a6' },
  { label: 'Indigo',  colorClass: 'bg-indigo-500 text-white',  hex: '#6366f1' },
  { label: 'Cyan',    colorClass: 'bg-cyan-500 text-white',    hex: '#06b6d4' },
];

const defaultHabits: HabitItem[] = [
  { id: 1, label: 'Amber',      sublabel: 'Baca buku/jurnal 15 menit', colorClass: 'bg-amber-500 text-white',   checked: true,  mentalWeight: 15, physicalWeight: 0,  hours: 0.25 },
  { id: 2, label: 'Emerald',    sublabel: 'Coding 1 jam',               colorClass: 'bg-emerald-500 text-white', checked: true,  mentalWeight: 20, physicalWeight: 5,  hours: 1    },
  { id: 3, label: 'Focus Blue', sublabel: 'Review materi hari ini',     colorClass: 'bg-blue-500 text-white',    checked: true,  mentalWeight: 15, physicalWeight: 0,  hours: 1    },
  { id: 4, label: 'Nugas',      sublabel: 'Nugas 1 jam',                colorClass: 'bg-orange-600 text-white',  checked: false, mentalWeight: 20, physicalWeight: 0,  hours: 1    },
  { id: 5, label: 'Stres',      sublabel: 'Coding 1 jam',               colorClass: 'bg-pink-600 text-white',    checked: false, mentalWeight: 25, physicalWeight: 10, hours: 1    },
  { id: 6, label: 'Tidur',      sublabel: 'Tidur/Begadang',             colorClass: 'bg-violet-600 text-white',  checked: false, mentalWeight: 0,  physicalWeight: 30, hours: 8    },
];

const WATER_GOAL   = 8;
const XP_PER_COMBO = 150;

const panicChallenges = [
  { title: "5-Menit Rule!",           body: "Kerjain satu tugas cuma 5 menit. Set timer sekarang. Setelah mulai, otak kamu yang lanjutkan sisanya.",                           emoji: "⏱️" },
  { title: "Buka dulu, itu dulu!",    body: "Buka file tugas yang paling kamu hindari. Cukup buka. Kamu nggak harus ngerjain—tapi biasanya kamu bakal lanjut.",               emoji: "📂" },
  { title: "Kalau bukan sekarang?",   body: "Masa depan kamu 5 tahun lagi lagi ngeliat balik dan bilang 'gue harap gue mulai lebih awal.' Jangan bikin dia kecewa.",           emoji: "🔮" },
  { title: "Misi 2 Menit!",           body: "Tulis 2 kalimat buat tugasmu. Cuma 2. Setelah itu kamu boleh rebahan. (Spoiler: kamu bakal nulis lebih.)",                        emoji: "✍️" },
  { title: "Phone Down Challenge",    body: "Taruh HP di laci, set 25 menit fokus. Notifikasi bisa nunggu—deadline enggak.",                                                   emoji: "📴" },
  { title: "Chaos Tamer Mode!",       body: "Pilih SATU hal dari to-do list. Bukan semuanya. Satu. Selesaikan itu dulu. Sisanya nunggu giliran.",                              emoji: "🎯" },
  { title: "The 10-Second Bravery",   body: "Mulai dalam 10 detik. 10... 9... 8... Otak prokrastinasi belum sempat komplain kalau kamu sudah bergerak.",                       emoji: "🚀" },
];

const plotwistMissions = [
  { mission: "Belajar di tempat baru hari ini—kafe, taman, atau pojok kamar yang belum pernah kamu coba.", tagEmoji: "🗺️", tagLabel: "Explore"       },
  { mission: "Dengerin playlist instrumental selama sesi belajar berikutnya. Lo kaget betapa fokusnya lo.", tagEmoji: "🎵", tagLabel: "Vibes"         },
  { mission: "Kirim satu pesan apresiasi ke teman yang udah bantu kamu minggu ini.",                        tagEmoji: "💌", tagLabel: "Connect"       },
  { mission: "Istirahat 5 menit: keluar, hirup udara, liat langit. Beneran, bukan scroll IG.",              tagEmoji: "🌿", tagLabel: "Reset"         },
  { mission: "Tulis 3 hal yang bikin kamu penasaran hari ini, berapapun kecilnya.",                         tagEmoji: "🔍", tagLabel: "Curious"       },
  { mission: "Coba teknik Pomodoro: 25 menit fokus, 5 menit bebas. Repeat 4x.",                            tagEmoji: "🍅", tagLabel: "Focus"         },
  { mission: "Baca satu artikel tentang topik yang sama sekali bukan bidangmu.",                            tagEmoji: "🧠", tagLabel: "Random"        },
  { mission: "Matiin notifikasi HP selama 1 jam penuh. Lihat bedanya.",                                     tagEmoji: "📵", tagLabel: "Digital Detox" },
  { mission: "Gambar mind-map dari materi yang paling susah kamu pahami.",                                  tagEmoji: "🗂️", tagLabel: "Visual"        },
  { mission: "Minum segelas air sebelum mulai sesi belajar. Otak 75% air, ingat!",                         tagEmoji: "💧", tagLabel: "Hydrate"       },
];

const defaultState: DailyState = {
  habits: defaultHabits,
  selectedMood: 'Capek',
  journalText: 'Hari ini capek banget karena kuis Kalkulus, tapi untungnya kelompok komdat kompak.',
  waterCount: 0,
  dailyWin: '',
  plotwistIndex: 0,
  plotwistDate: '',
  dailyXP: 0,
  dailyXPDate: '',
  streak: 0,
  lastStreakDate: '',
  comboDate: '',
};

const moods: MoodOption[] = [
  { emoji: '😁', label: 'Senang' },
  { emoji: '😴', label: 'Capek'  },
  { emoji: '😡', label: 'Stres'  },
  { emoji: '🔥', label: 'Ambis'  },
  { emoji: '😐', label: 'Flat'   },
];

function calcBatteryFromHabits(habits: HabitItem[]) {
  const checkedHabits  = habits.filter(h => h.checked);
  const maxMental      = habits.reduce((s, h) => s + h.mentalWeight, 0) || 1;
  const maxPhysical    = habits.reduce((s, h) => s + h.physicalWeight, 0) || 1;
  const usedMental     = checkedHabits.reduce((s, h) => s + h.mentalWeight, 0);
  const usedPhysical   = checkedHabits.reduce((s, h) => s + h.physicalWeight, 0);
  const mentalLeft     = Math.max(0, 100 - Math.round((usedMental / maxMental) * 100));
  const physicalLeft   = Math.max(0, 100 - Math.round((usedPhysical / maxPhysical) * 100));
  const total          = Math.round(mentalLeft * 0.6 + physicalLeft * 0.4);
  return { mentalLeft, physicalLeft, total };
}

interface RoutineBlock { label: string; hours: number; color: string; }

function calcRoutineBlocks(habits: HabitItem[]): RoutineBlock[] {
  const checked = habits.filter(h => h.checked);
  const nugas   = checked.filter(h => [4, 5].includes(h.id)).reduce((s, h) => s + h.hours, 0);
  const tidurH  = checked.find(h => h.id === 6) ? 7 : 6;
  const meTime  = checked.find(h => h.id === 6) ? 2 : 1.5;
  const kuliah  = 6;
  const blocks: RoutineBlock[] = [
    { label: 'Kuliah',  hours: kuliah,                          color: '#3b82f6' },
    { label: 'Nugas',   hours: Math.max(nugas, 1),             color: '#f59e0b' },
    { label: 'Me-Time', hours: Math.round(meTime * 10) / 10,   color: '#10b981' },
    { label: 'Tidur',   hours: tidurH,                         color: '#8b5cf6' },
  ];
  const usedH = blocks.reduce((s, b) => s + b.hours, 0);
  const freeH = Math.max(0, 24 - usedH);
  if (freeH > 0) blocks.push({ label: 'Bebas', hours: Math.round(freeH * 10) / 10, color: '#94a3b8' });
  return blocks;
}

function getTodayString()     { return new Date().toISOString().split('T')[0]; }
function getYesterdayString() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; }
function getDayIndex()        { return new Date().getDate() % plotwistMissions.length; }

// ─── Edit Habit Modal ─────────────────────────────────────────────────────────

interface EditHabitModalProps {
  habit: HabitItem | null;
  onSave: (h: HabitItem) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
  isNew?: boolean;
}
function EditHabitModal({ habit, onSave, onDelete, onClose, isNew }: EditHabitModalProps) {
  const [form, setForm] = useState<HabitItem>(
    habit ?? { id: Date.now(), label: '', sublabel: '', colorClass: COLOR_OPTIONS[0].colorClass, checked: false, mentalWeight: 10, physicalWeight: 5, hours: 1 }
  );
  if (!habit && !isNew) return null;
  const set = (k: keyof HabitItem, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-[28px] p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">{isNew ? '+ Tambah Habit' : 'Edit Habit'}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 text-xs font-bold hover:bg-slate-200 transition-all">✕</button>
        </div>
        <div className={`${form.colorClass} p-3 rounded-2xl flex items-center justify-between`}>
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-wider opacity-60">{form.label || 'Label'}</p>
            <p className="text-[11px] font-bold">{form.sublabel || 'Sublabel habit...'}</p>
          </div>
          <div className="w-4 h-4 rounded-md bg-white flex items-center justify-center">
            <span className="text-[8px] font-black text-slate-900">✓</span>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">Nama Kategori</label>
          <input value={form.label} onChange={e => set('label', e.target.value)} maxLength={20} placeholder="e.g. Olahraga" className="w-full text-[12px] font-bold text-slate-700 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-400 bg-slate-50" />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">Deskripsi Kegiatan</label>
          <input value={form.sublabel} onChange={e => set('sublabel', e.target.value)} maxLength={40} placeholder="e.g. Push-up 3 set" className="w-full text-[12px] font-bold text-slate-700 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-400 bg-slate-50" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">Warna</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(c => (
              <button key={c.label} onClick={() => set('colorClass', c.colorClass)} className={`w-6 h-6 rounded-full transition-all border-2 ${form.colorClass === c.colorClass ? 'border-slate-900 scale-125' : 'border-transparent'}`} style={{ background: c.hex }} title={c.label} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[['Mental (0-50)', 'mentalWeight', 'text-emerald-600', 'focus:border-emerald-400', 50],
            ['Fisik (0-50)',  'physicalWeight','text-amber-600',  'focus:border-amber-400',  50],
            ['Jam',           'hours',         'text-violet-600', 'focus:border-violet-400', 12]].map(([lbl, key, tc, fc, max]) => (
            <div key={key as string} className="space-y-1">
              <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">{lbl as string}</label>
              <input type="number" min={key === 'hours' ? 0.25 : 0} max={max as number} step={key === 'hours' ? 0.25 : 1}
                value={form[key as keyof HabitItem] as number}
                onChange={e => set(key as keyof HabitItem, Math.min(max as number, Math.max(key === 'hours' ? 0.25 : 0, +e.target.value)))}
                className={`w-full text-[12px] font-bold ${tc} px-2 py-2 rounded-xl border border-slate-200 focus:outline-none ${fc} bg-slate-50 text-center`} />
            </div>
          ))}
        </div>
        <p className="text-[9px] text-slate-400 font-semibold -mt-2">Mental & Fisik: bobot konsumsi energi. Makin tinggi = makin nguras baterai.</p>
        <div className="flex gap-2 pt-1">
          {!isNew && (
            <button onClick={() => { onDelete(form.id); onClose(); }} className="px-3 py-2.5 rounded-xl border-2 border-red-100 text-red-400 text-[10px] font-black hover:bg-red-50 transition-all inline-flex items-center gap-1">
              <Emoji3D e="🗑️" size={13} /> Hapus
            </button>
          )}
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-bold hover:bg-slate-50 transition-all">Batal</button>
          <button onClick={() => { onSave(form); onClose(); }} className="flex-1 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl text-[10px] font-black hover:opacity-90 transition-all shadow-md shadow-violet-200">Simpan ✓</button>
        </div>
      </div>
    </div>
  );
}

// ─── Combo Reward Modal ───────────────────────────────────────────────────────

function ComboRewardModal({ xp, streak, onClose }: { xp: number; streak: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-gradient-to-b from-[#1e1441] to-[#0f0a1e] rounded-[32px] p-8 max-w-xs w-full mx-4 shadow-2xl text-white text-center relative overflow-hidden border border-violet-500/30">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-violet-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative z-10 space-y-4">
          <div className="animate-bounce flex justify-center"><Emoji3D e="🎉" size={72} /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-400 mb-1">Daily Combo</p>
            <h2 className="text-2xl font-black tracking-tight">Reward Unlocked!</h2>
          </div>
          <div className="flex justify-center gap-1.5">
            <span className="animate-spin inline-block" style={{ animationDuration: '3s' }}><Emoji3D e="⭐" size={30} /></span>
            <span className="animate-spin inline-block" style={{ animationDuration: '2s', animationDirection: 'reverse' }}><Emoji3D e="⭐" size={30} /></span>
            <span className="animate-spin inline-block" style={{ animationDuration: '4s' }}><Emoji3D e="⭐" size={30} /></span>
          </div>
          <div className="bg-white/10 border border-white/10 rounded-2xl p-4 space-y-2 backdrop-blur-sm">
            <p className="text-[11px] text-slate-300">Semua habit selesai hari ini!</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-black text-amber-400">+{xp}</span>
              <span className="text-sm font-bold text-amber-300">XP hari ini</span>
            </div>
            <div className="flex justify-center gap-3 text-[9px] font-bold text-slate-400 pt-1">
              <span className="inline-flex items-center gap-1"><Emoji3D e="🔥" size={13} /> Streak {streak} hari</span>
              <span className="inline-flex items-center gap-1"><Emoji3D e="👑" size={13} /> Combo Master</span>
            </div>
            <p className="text-[9px] text-slate-500 font-bold pt-1">XP reset tiap hari • Jaga streak-mu!</p>
          </div>
          <button onClick={onClose} className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 rounded-2xl text-[11px] font-black tracking-wider hover:opacity-90 transition-all shadow-lg shadow-orange-500/30 inline-flex items-center justify-center gap-1.5">
            CLAIM REWARD <Emoji3D e="⚡" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Auto Save Indicator ──────────────────────────────────────────────────────

function AutoSaveIndicator({ show }: { show: boolean }) {
  return (
    <div className={`fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 backdrop-blur-sm text-white text-[10px] font-bold shadow-xl transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
      Tersimpan otomatis
    </div>
  );
}

// ─── Pet Locked Banner ────────────────────────────────────────────────────────

function PetLockedBanner({ xpNeeded }: { xpNeeded: number }) {
  return (
    <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3">
      <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
        <Emoji3D e="🐾" size={22} />
      </div>
      <div className="flex-1">
        <p className="text-xs font-black text-purple-400">Pet Companion terkunci</p>
        <p className="text-[10px] text-purple-300 font-semibold">
          Capai <span className="font-black text-purple-500">Level 2</span> untuk unlock
          {xpNeeded > 0 && <> · butuh <span className="font-black text-purple-500">{xpNeeded.toLocaleString('id-ID')} XP</span> lagi</>}
        </p>
      </div>
      <Emoji3D e="🔒" size={18} />
    </div>
  )
}

// ─── Pet Locked Card (kolom 3) ────────────────────────────────────────────────

function PetLockedCard({ xpNeeded }: { xpNeeded: number }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] p-5 shadow-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0">
          <Emoji3D e="🐾" size={30} className="opacity-40" />
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Pet Academy</p>
          <p className="text-white font-black text-sm opacity-40">Terkunci</p>
          <p className="text-[10px] text-slate-500 font-semibold mt-1 inline-flex items-center gap-1">
            <Emoji3D e="🔒" size={13} /> Butuh Level 2
            {xpNeeded > 0 && <> · {xpNeeded.toLocaleString('id-ID')} XP lagi</>}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HarianPage() {
  const [habits, setHabits]                       = useState<HabitItem[]>(defaultState.habits);
  const [selectedMood, setSelectedMood]           = useState<string>(defaultState.selectedMood);
  const [journalText, setJournalText]             = useState<string>(defaultState.journalText);
  const [isEditingJournal, setIsEditingJournal]   = useState<boolean>(false);
  const [draftJournal, setDraftJournal]           = useState<string>('');
  const [savedFeedback, setSavedFeedback]         = useState<boolean>(false);
  const [hydrated, setHydrated]                   = useState<boolean>(false);
  const [waterCount, setWaterCount]               = useState<number>(0);
  const [dailyWin, setDailyWin]                   = useState<string>('');
  const [isEditingWin, setIsEditingWin]           = useState<boolean>(false);
  const [draftWin, setDraftWin]                   = useState<string>('');
  const [winSaved, setWinSaved]                   = useState<boolean>(false);
  const [plotwistIndex, setPlottwistIndex]        = useState<number>(getDayIndex());
  const [showPanicModal, setShowPanicModal]       = useState<boolean>(false);
  const [panicIndex, setPanicIndex]               = useState<number>(0);
  const [panicShake, setPanicShake]               = useState<boolean>(false);
  const [waterPulse, setWaterPulse]               = useState<boolean>(false);
  const [editingHabit, setEditingHabit]           = useState<HabitItem | null>(null);
  const [showAddHabit, setShowAddHabit]           = useState<boolean>(false);
  const [dailyXP, setDailyXP]                     = useState<number>(0);
  const [dailyXPDate, setDailyXPDate]             = useState<string>('');
  const [streak, setStreak]                       = useState<number>(0);
  const [lastStreakDate, setLastStreakDate]        = useState<string>('');
  const [comboDate, setComboDate]                 = useState<string>('');
  const [showComboModal, setShowComboModal]       = useState<boolean>(false);
  const [prevAllDone, setPrevAllDone]             = useState<boolean>(false);
  const [showAutoSave, setShowAutoSave]           = useState<boolean>(false);

  // ── Pro status ───────────────────────────────────────────────────────────────
  const productivityLevel = useProductivityLevel()
  const isProUnlocked     = productivityLevel >= 2

  // XP yang masih dibutuhkan untuk level 2
  const xpNeeded = (() => {
    try {
      const raw = localStorage.getItem('plotwist_state_v1')
      if (raw) return Math.max(0, 1000 - (JSON.parse(raw).xp ?? 0))
    } catch {}
    return 1000
  })()

  // ── Pet aktif (hanya relevan jika Pro) ───────────────────────────────────────
  const activePet = useActivePet()

  const flashSave = useCallback(() => {
    setShowAutoSave(true);
    setTimeout(() => setShowAutoSave(false), 1800);
  }, []);

  const persist = useCallback((
    h: HabitItem[], mood: string, journal: string,
    water: number, win: string, pwIdx: number,
    dXP: number, dXPDate: string,
    str: number, lastStr: string, cDate: string,
  ) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        habits: h, selectedMood: mood, journalText: journal,
        waterCount: water, dailyWin: win,
        plotwistIndex: pwIdx, plotwistDate: getTodayString(),
        dailyXP: dXP, dailyXPDate: dXPDate,
        streak: str, lastStreakDate: lastStr,
        comboDate: cDate,
      }));
    } catch (_) {}
  }, []);

  const persistCurrent = useCallback((overrides: Partial<{
    habits: HabitItem[]; selectedMood: string; journalText: string;
    waterCount: number; dailyWin: string; plotwistIndex: number;
    dailyXP: number; dailyXPDate: string; streak: number;
    lastStreakDate: string; comboDate: string;
  }> = {}, silent = false) => {
    persist(
      overrides.habits         ?? habits,
      overrides.selectedMood   ?? selectedMood,
      overrides.journalText    ?? journalText,
      overrides.waterCount     ?? waterCount,
      overrides.dailyWin       ?? dailyWin,
      overrides.plotwistIndex  ?? plotwistIndex,
      overrides.dailyXP        ?? dailyXP,
      overrides.dailyXPDate    ?? dailyXPDate,
      overrides.streak         ?? streak,
      overrides.lastStreakDate ?? lastStreakDate,
      overrides.comboDate      ?? comboDate,
    );
    if (!silent) flashSave();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persist, flashSave, habits, selectedMood, journalText, waterCount, dailyWin,
      plotwistIndex, dailyXP, dailyXPDate, streak, lastStreakDate, comboDate]);

  useEffect(() => {
    try {
      const raw   = localStorage.getItem(STORAGE_KEY);
      const today = getTodayString();
      if (raw) {
        const parsed: DailyState = JSON.parse(raw);
        setHabits(parsed.habits ?? defaultState.habits);
        setSelectedMood(parsed.selectedMood ?? defaultState.selectedMood);
        setJournalText(parsed.journalText ?? defaultState.journalText);
        if (parsed.plotwistDate !== today) {
          setWaterCount(0);
          setPlottwistIndex(getDayIndex());
        } else {
          setWaterCount(parsed.waterCount ?? 0);
          setPlottwistIndex(parsed.plotwistIndex ?? getDayIndex());
        }
        setDailyWin(parsed.dailyWin ?? '');
        if (parsed.dailyXPDate === today) {
          setDailyXP(parsed.dailyXP ?? 0);
        } else {
          setDailyXP(0);
        }
        setDailyXPDate(parsed.dailyXPDate ?? '');
        const savedStreak   = parsed.streak ?? 0;
        const savedLastDate = parsed.lastStreakDate ?? '';
        const yesterday     = getYesterdayString();
        if (savedLastDate === today || savedLastDate === yesterday || savedLastDate === '') {
          setStreak(savedStreak);
        } else {
          setStreak(0);
        }
        setLastStreakDate(savedLastDate);
        setComboDate(parsed.comboDate ?? '');
      }
    } catch (_) {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const allDone   = habits.length > 0 && habits.every(h => h.checked);
    const today     = getTodayString();
    if (allDone && !prevAllDone && comboDate !== today) {
      const baseXP    = dailyXPDate === today ? dailyXP : 0;
      const newXP     = baseXP + XP_PER_COMBO;
      const yesterday = getYesterdayString();
      let   newStreak = streak;
      if      (lastStreakDate === today)     { /* no change */ }
      else if (lastStreakDate === yesterday || lastStreakDate === '') newStreak = streak + 1;
      else                                   newStreak = 1;
      setDailyXP(newXP); setDailyXPDate(today);
      setStreak(newStreak); setLastStreakDate(today);
      setComboDate(today); setShowComboModal(true);
      persist(habits, selectedMood, journalText, waterCount, dailyWin, plotwistIndex, newXP, today, newStreak, today, today);
      flashSave();
    }
    setPrevAllDone(allDone);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, hydrated]);

  const toggleHabit = (id: number) => {
    const next = habits.map(h => h.id === id ? { ...h, checked: !h.checked } : h);
    setHabits(next);
    persistCurrent({ habits: next });
  };

  const saveHabit = (updated: HabitItem) => {
    const exists = habits.find(h => h.id === updated.id);
    const next   = exists ? habits.map(h => h.id === updated.id ? updated : h) : [...habits, updated];
    setHabits(next);
    persistCurrent({ habits: next });
  };

  const deleteHabit = (id: number) => {
    const next = habits.filter(h => h.id !== id);
    setHabits(next);
    persistCurrent({ habits: next });
  };

  const handleMood = (label: string) => {
    setSelectedMood(label);
    persistCurrent({ selectedMood: label });
  };

  const openEdit    = () => { setDraftJournal(journalText); setIsEditingJournal(true); };
  const saveJournal = () => {
    setJournalText(draftJournal); setIsEditingJournal(false);
    persistCurrent({ journalText: draftJournal });
    setSavedFeedback(true); setTimeout(() => setSavedFeedback(false), 2000);
  };
  const cancelEdit  = () => { setIsEditingJournal(false); setDraftJournal(''); };

  useEffect(() => {
    if (!isEditingJournal) return;
    const t = setTimeout(() => { persistCurrent({ journalText: draftJournal }, true); }, 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftJournal, isEditingJournal]);

  useEffect(() => {
    if (!isEditingWin) return;
    const t = setTimeout(() => { persistCurrent({ dailyWin: draftWin }, true); }, 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftWin, isEditingWin]);

  const addWater = () => {
    if (waterCount >= WATER_GOAL) return;
    const next = waterCount + 1;
    setWaterCount(next); setWaterPulse(true); setTimeout(() => setWaterPulse(false), 400);
    persistCurrent({ waterCount: next });
  };
  const removeWater = () => {
    if (waterCount <= 0) return;
    const next = waterCount - 1;
    setWaterCount(next);
    persistCurrent({ waterCount: next });
  };

  const openWinEdit = () => { setDraftWin(dailyWin); setIsEditingWin(true); };
  const saveWin = () => {
    setDailyWin(draftWin); setIsEditingWin(false);
    persistCurrent({ dailyWin: draftWin });
    setWinSaved(true); setTimeout(() => setWinSaved(false), 2000);
  };
  const cancelWin = () => { setIsEditingWin(false); setDraftWin(''); };

  const triggerPanic = () => {
    const idx = Math.floor(Math.random() * panicChallenges.length);
    setPanicIndex(idx); setShowPanicModal(true);
    setPanicShake(true); setTimeout(() => setPanicShake(false), 600);
  };
  const newPanicChallenge = () => {
    let next = Math.floor(Math.random() * panicChallenges.length);
    while (next === panicIndex && panicChallenges.length > 1) next = Math.floor(Math.random() * panicChallenges.length);
    setPanicIndex(next);
  };

  const shufflePlottwist = () => {
    let next = Math.floor(Math.random() * plotwistMissions.length);
    while (next === plotwistIndex && plotwistMissions.length > 1) next = Math.floor(Math.random() * plotwistMissions.length);
    setPlottwistIndex(next);
    persistCurrent({ plotwistIndex: next });
  };

  const battery           = calcBatteryFromHabits(habits);
  const routineBlocks     = calcRoutineBlocks(habits);
  const doneCount         = habits.filter(h => h.checked).length;
  const allDone           = habits.length > 0 && doneCount === habits.length;
  const today             = getTodayString();
  const comboClaimedToday = comboDate === today;
  const displayXP         = dailyXPDate === today ? dailyXP : 0;

  const R        = 16;
  const CIRC     = 2 * Math.PI * R;
  let   dashOff  = 0;
  const donutSegs = routineBlocks.map(b => {
    const dash = (b.hours / 24) * CIRC;
    const seg  = { ...b, dash, offset: dashOff };
    dashOff   += dash;
    return seg;
  });

  const batteryColor =
    battery.total >= 70 ? 'bg-gradient-to-t from-emerald-400 to-green-300'  :
    battery.total >= 40 ? 'bg-gradient-to-t from-amber-400 to-yellow-300'   :
                          'bg-gradient-to-t from-red-500 to-orange-400';

  const currentPlottwist = plotwistMissions[plotwistIndex];
  const currentPanic     = panicChallenges[panicIndex];
  const waterPercent     = Math.round((waterCount / WATER_GOAL) * 100);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-[#f3f4f9] text-slate-800 antialiased font-sans">

      <style>{`
        @keyframes petFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes petGlow {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.6; }
        }
        .pet-float { animation: petFloat 3s ease-in-out infinite; }
        .pet-glow  { animation: petGlow  2s ease-in-out infinite; }
      `}</style>

      <AutoSaveIndicator show={showAutoSave} />

      {/* ── Modals ── */}
      {showPanicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPanicModal(false)}>
          <div onClick={e => e.stopPropagation()} className={`bg-white rounded-[32px] p-7 max-w-sm w-full mx-4 shadow-2xl border-2 border-red-100 relative overflow-hidden ${panicShake ? 'animate-bounce' : ''}`}>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-50 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-orange-50 rounded-full blur-xl" />
            <div className="relative z-10">
              <div className="mb-3 flex justify-center"><Emoji3D e={currentPanic.emoji} size={60} /></div>
              <h2 className="text-xl font-black text-slate-900 text-center tracking-tight mb-1">{currentPanic.title}</h2>
              <p className="text-[12px] text-slate-500 font-semibold text-center leading-relaxed mb-5">{currentPanic.body}</p>
              <div className="flex gap-2">
                <button onClick={newPanicChallenge} className="flex-1 py-2.5 border-2 border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black hover:bg-slate-50 transition-all uppercase tracking-widest inline-flex items-center justify-center gap-1.5">
                  <Emoji3D e="🎲" size={15} /> Tantangan Lain
                </button>
                <button onClick={() => setShowPanicModal(false)} className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl text-[10px] font-black hover:opacity-90 transition-all shadow-lg shadow-orange-200 uppercase tracking-widest inline-flex items-center justify-center gap-1.5">
                  <Emoji3D e="✅" size={15} /> Siap Gas!
                </button>
              </div>
              <p className="text-center text-[9px] text-slate-300 font-bold mt-3">Klik di luar untuk tutup</p>
            </div>
          </div>
        </div>
      )}

      {showComboModal && (
        <ComboRewardModal xp={XP_PER_COMBO} streak={streak} onClose={() => setShowComboModal(false)} />
      )}

      {editingHabit && (
        <EditHabitModal habit={editingHabit} onSave={saveHabit} onDelete={deleteHabit} onClose={() => setEditingHabit(null)} />
      )}
      {showAddHabit && (
        <EditHabitModal habit={null} isNew onSave={saveHabit} onDelete={() => {}} onClose={() => setShowAddHabit(false)} />
      )}

      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <main className="flex-1 p-4 md:p-6 space-y-5 max-w-6xl">

          {/* ── Pet Companion Banner: tampil hanya jika Pro terbuka ────────── */}
          {isProUnlocked ? (
            <div
              className="relative overflow-hidden p-4 rounded-2xl shadow-md flex items-center gap-4"
              style={{
                background: `linear-gradient(135deg, ${activePet.color}22, ${activePet.glow}33)`,
                border: `1.5px solid ${activePet.glow}55`,
                boxShadow: `0 4px 24px ${activePet.glow}22`,
              }}
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl pet-glow pointer-events-none" style={{ background: activePet.glow }} />
              <div className="relative shrink-0 w-14 h-14">
                <div className="absolute inset-0 rounded-full pet-glow" style={{ background: `radial-gradient(circle, ${activePet.glow}88, transparent 70%)` }} />
                <img src={activePet.src} alt={activePet.name} className="w-14 h-14 object-contain relative z-10 pet-float" style={{ filter: `drop-shadow(0 0 8px ${activePet.glow}cc)` }} />
              </div>
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-black" style={{ color: activePet.glow }}>{activePet.name}</span>
                  <span className="text-[9px] font-bold text-white bg-black/20 px-1.5 py-0.5 rounded-full">Companion</span>
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Begadang boleh, tapi jangan lupa minum air putih, Rezal. Ginjalmu bukan spek gaming. <Emoji3D e="💧" size={14} />
                </p>
              </div>
              <a
                href="/pet-academy"
                className="shrink-0 relative z-10 text-[9px] font-black px-2.5 py-1.5 rounded-xl border transition-all hover:scale-105"
                style={{ borderColor: `${activePet.glow}66`, color: activePet.glow, background: `${activePet.color}22` }}
              >
                Ganti Pet
              </a>
            </div>
          ) : (
            <PetLockedBanner xpNeeded={xpNeeded} />
          )}

          {/* ── Panic Mode Button ────────────────────────────────────────── */}
          <button
            onClick={triggerPanic}
            className="w-full relative overflow-hidden group py-4 px-6 rounded-2xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white font-black text-sm tracking-wide shadow-xl shadow-orange-200/60 flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-orange-300/80 hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 group-hover:opacity-100" />
            <span className="relative z-10"><Emoji3D e="🚨" size={26} /></span>
            <div className="relative z-10 text-left">
              <span className="block text-[13px] font-black">PANIC MODE — Anti-Procrastination!</span>
              <span className="block text-[9px] font-semibold opacity-80 uppercase tracking-widest">Klik kalau kamu lagi males banget • Chaos Tamers mode ON</span>
            </div>
            <span className="relative z-10 ml-auto"><Emoji3D e="⚡" size={26} /></span>
          </button>

          {/* ── 3 Column Grid ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* KOLOM 1 */}
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100/50 flex flex-col">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Habit Tracker</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 mb-3">Klik habit untuk check · ✎ untuk edit</p>
                  </div>
                  {displayXP > 0 && (
                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg inline-flex items-center gap-1"><Emoji3D e="⭐" size={13} /> {displayXP} XP hari ini</span>
                      <span className="text-[8px] font-bold text-slate-400 block mt-0.5">Reset besok</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {habits.map(habit => (
                    <div key={habit.id} className="relative group">
                      <div
                        onClick={() => toggleHabit(habit.id)}
                        className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between shadow-sm cursor-pointer ${
                          habit.checked
                            ? `${habit.colorClass} border-transparent scale-[0.97]`
                            : 'bg-slate-50 border-slate-200/60 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-left pr-2">
                          <p className="text-[9px] font-extrabold uppercase tracking-wider opacity-60">{habit.label}</p>
                          <p className="text-[10px] font-bold leading-tight mt-0.5">{habit.sublabel}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-all shrink-0 ${
                          habit.checked ? 'bg-white text-slate-900' : 'border-2 border-slate-300 bg-white'
                        }`}>
                          {habit.checked && <span className="text-[8px] font-black">✓</span>}
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setEditingHabit(habit); }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-violet-50 hover:text-violet-500 hover:border-violet-200 shadow-sm z-10"
                        title="Edit habit"
                      >✎</button>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowAddHabit(true)}
                    className="p-2.5 rounded-2xl border-2 border-dashed border-violet-200 text-violet-400 hover:bg-violet-50 hover:border-violet-400 transition-all flex items-center justify-center gap-1.5 text-[10px] font-black cursor-pointer min-h-[52px]"
                  >
                    <span className="text-base">+</span>
                    <span>Tambah Habit</span>
                  </button>
                </div>
                <div className={`mt-3 pt-2.5 border-t border-slate-100 rounded-xl transition-all duration-500 ${
                  allDone ? 'bg-gradient-to-r from-violet-50 to-amber-50 border border-amber-100 p-2.5 -mx-0.5' : ''
                }`}>
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                    <span className="inline-flex items-center gap-1">
                      <Emoji3D e={allDone ? '🎊' : '🚀'} size={13} />
                      {allDone ? `${doneCount}/${habits.length} — Combo Unlocked!` : `${doneCount}/${habits.length} — Complete all for Bonus XP`}
                    </span>
                    <button
                      onClick={() => { if (allDone) setShowComboModal(true); }}
                      className={`px-2 py-0.5 rounded-md font-black transition-all inline-flex items-center gap-1 ${
                        allDone && comboClaimedToday
                          ? 'text-emerald-600 bg-emerald-50 border border-emerald-100 cursor-default'
                          : allDone
                          ? 'text-amber-600 bg-amber-100 border border-amber-200 animate-pulse cursor-pointer hover:scale-105'
                          : 'text-violet-500 bg-violet-50 cursor-default'
                      }`}
                    >
                      {allDone && comboClaimedToday ? (
                        <><Emoji3D e="✅" size={13} /> Reward Claimed!</>
                      ) : allDone ? (
                        <><Emoji3D e="🎁" size={13} /> CLAIM +{XP_PER_COMBO} XP</>
                      ) : 'Daily Combo Reward'}
                    </button>
                  </div>
                  <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${allDone ? 'bg-gradient-to-r from-violet-400 to-amber-400' : 'bg-gradient-to-r from-violet-300 to-purple-300'}`}
                      style={{ width: habits.length > 0 ? `${(doneCount / habits.length) * 100}%` : '0%' }} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100/50 space-y-3">
                <h3 className="text-base font-black text-slate-900 tracking-tight">Daily Micro-Journaling</h3>
                <div className="flex justify-between bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  {moods.map(m => (
                    <button
                      key={m.label}
                      onClick={() => handleMood(m.label)}
                      className={`flex flex-col items-center p-1.5 rounded-xl text-[9px] font-bold transition-all w-11 ${
                        selectedMood === m.label
                          ? 'bg-white shadow text-slate-900 scale-105 border border-slate-100'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <span className="mb-0.5"><Emoji3D e={m.emoji} size={22} /></span>
                      <span className="uppercase tracking-wider">{m.label}</span>
                    </button>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-extrabold text-slate-400 tracking-widest block">Mood text (max 140)</label>
                  {!isEditingJournal ? (
                    <div onClick={openEdit} className="w-full min-h-[64px] bg-slate-50 text-[11px] font-bold text-slate-700 p-3 rounded-2xl border border-slate-200 transition-all leading-relaxed relative group cursor-pointer hover:border-violet-300 hover:bg-violet-50/30">
                      {journalText || <span className="text-slate-300">Klik untuk menulis catatan hari ini...</span>}
                      <span className="absolute bottom-2 right-2.5 text-[8px] text-violet-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">✎ Edit</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea maxLength={140} autoFocus value={draftJournal} onChange={e => setDraftJournal(e.target.value)}
                        className="w-full h-20 bg-slate-50 text-[11px] font-bold text-slate-700 p-3 rounded-2xl border border-violet-400 focus:outline-none focus:bg-white resize-none transition-all shadow-inner" />
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-slate-400 font-bold">{draftJournal.length}/140</span>
                        <span className="text-[8px] text-slate-300 font-semibold">Tersimpan otomatis saat mengetik</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={cancelEdit} className="flex-1 py-2 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-bold hover:bg-slate-50 transition-all">Batal</button>
                        <button onClick={saveJournal} className="flex-1 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl text-[10px] font-bold hover:opacity-90 transition-all shadow-md shadow-violet-200">Simpan Catatan</button>
                      </div>
                      {savedFeedback && <p className="text-center text-[9px] text-emerald-500 font-bold animate-pulse">✓ Tersimpan!</p>}
                    </div>
                  )}
                </div>
                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Emoji3D e="🏆" size={22} />
                    <h4 className="text-[11px] font-black text-slate-800 tracking-tight">Daily Win</h4>
                    <span className="text-[8px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100 uppercase tracking-wide ml-auto">Heroic Moment</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold inline-flex items-center gap-1">Satu hal yang paling kamu banggain hari ini <Emoji3D e="✨" size={13} /></p>
                  {!isEditingWin ? (
                    <div onClick={openWinEdit} className="w-full min-h-[44px] bg-gradient-to-br from-amber-50 to-orange-50 text-[11px] font-bold text-slate-700 p-3 rounded-2xl border border-amber-100 transition-all leading-relaxed relative group cursor-pointer hover:border-amber-300">
                      {dailyWin || <span className="text-slate-300 font-semibold">Tulis satu kemenangan kecilmu...</span>}
                      <span className="absolute bottom-2 right-2.5 text-[8px] text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">✎ Edit</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea maxLength={100} autoFocus value={draftWin} onChange={e => setDraftWin(e.target.value)} placeholder="Contoh: Gak telat kuis Kalkulus!"
                        className="w-full h-16 bg-amber-50 text-[11px] font-bold text-slate-700 p-3 rounded-2xl border border-amber-300 focus:outline-none focus:bg-white resize-none transition-all" />
                      <p className="text-[8px] text-slate-300 font-semibold text-right">Tersimpan otomatis saat mengetik</p>
                      <div className="flex gap-2">
                        <button onClick={cancelWin} className="flex-1 py-2 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-bold hover:bg-slate-50 transition-all">Batal</button>
                        <button onClick={saveWin} className="flex-1 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl text-[10px] font-black hover:opacity-90 transition-all shadow-md shadow-amber-200 inline-flex items-center justify-center gap-1">
                          <Emoji3D e="🏆" size={14} /> Simpan!
                        </button>
                      </div>
                      {winSaved && <p className="text-center text-[9px] text-amber-500 font-bold animate-pulse inline-flex items-center gap-1"><Emoji3D e="🎉" size={13} /> Kemenangan dicatat!</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* KOLOM 2 */}
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100/50">
                <h3 className="text-base font-black text-slate-900 tracking-tight">Focus & Energy Battery</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 mb-3">Dihitung otomatis dari habit & aktivitas</p>
                <div className="flex items-center gap-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="w-12 h-20 border-[3px] border-slate-700 rounded-xl relative p-1 flex flex-col justify-end overflow-hidden bg-white shadow-sm shrink-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-slate-700 -mt-1.5 rounded-t-sm" />
                    <div className={`w-full rounded-md transition-all duration-700 ${batteryColor}`} style={{ height: `${battery.total}%` }} />
                  </div>
                  <div className="flex-1 space-y-1.5 text-[10px] font-bold text-slate-600">
                    <div className="flex justify-between"><span>Mental Energy:</span><span className="text-emerald-500">{battery.mentalLeft}%</span></div>
                    <div className="flex justify-between"><span>Physical Energy:</span><span className="text-amber-500">{battery.physicalLeft}%</span></div>
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span>Energi tersisa:</span>
                      <span className={`font-extrabold ${battery.total < 40 ? 'text-red-500' : battery.total < 70 ? 'text-amber-500' : 'text-emerald-500'}`}>{battery.total}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Kontribusi per habit</p>
                  {habits.filter(h => h.checked && (h.mentalWeight > 0 || h.physicalWeight > 0)).slice(0, 4).map(h => (
                    <div key={h.id} className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${h.colorClass.split(' ')[0]}`} />
                      <span className="flex-1 truncate">{h.sublabel}</span>
                      {h.mentalWeight > 0 && <span className="text-emerald-500">-{h.mentalWeight}M</span>}
                      {h.physicalWeight > 0 && <span className="text-amber-500">-{h.physicalWeight}F</span>}
                    </div>
                  ))}
                  {habits.filter(h => h.checked && (h.mentalWeight > 0 || h.physicalWeight > 0)).length === 0 && (
                    <p className="text-[9px] text-slate-300 font-semibold text-center py-1">Belum ada habit aktif hari ini</p>
                  )}
                </div>
                <div className={`mt-3 p-2.5 rounded-xl text-[10px] font-bold flex items-start gap-1.5 ${
                  battery.total < 40 ? 'bg-red-50 border border-red-100 text-red-600'      :
                  battery.total < 70 ? 'bg-amber-50 border border-amber-100 text-amber-600' :
                                       'bg-emerald-50 border border-emerald-100 text-emerald-600'
                }`}>
                  <Emoji3D e={battery.total < 40 ? '⚠️' : battery.total < 70 ? '⚡' : '✅'} size={16} />
                  <p className="leading-tight">
                    {battery.total < 40 ? `Energi kamu sisa ${battery.total}%, waktunya me-time atau tidur!` :
                     battery.total < 70 ? 'Energi cukup untuk lanjut, tapi tetap istirahat ya!' :
                     'Energi penuh! Saatnya gas dan produktif hari ini!'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100/50">
                <h3 className="text-base font-black text-slate-900 tracking-tight">Daily Routine Blocks</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 mb-3">Visualisasi alokasi hari ini</p>
                <div className="flex items-center justify-around gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <svg className="w-16 h-16 shrink-0 transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r={R} fill="transparent" stroke="#e2e8f0" strokeWidth="4" />
                    {donutSegs.map((seg, i) => (
                      <circle key={i} cx="18" cy="18" r={R} fill="transparent" stroke={seg.color} strokeWidth="4"
                        strokeDasharray={`${seg.dash} ${CIRC}`} strokeDashoffset={-seg.offset} />
                    ))}
                  </svg>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-bold text-slate-500">
                    {routineBlocks.map((b, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: b.color }} />
                        {b.hours}J {b.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-[9px] text-center font-bold text-violet-500 bg-violet-50 py-1.5 rounded-xl border border-violet-100/60 mt-2 inline-flex items-center justify-center gap-1 w-full">
                  <Emoji3D e="🔗" size={13} /> Terhubung ke status Mode Begadang
                </div>
              </div>

              <div className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100/50">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Water Intake</h3>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest inline-flex items-center gap-1 ${waterCount >= WATER_GOAL ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    {waterCount >= WATER_GOAL ? (<><Emoji3D e="💧" size={13} /> Terhidrasi!</>) : `${waterCount}/${WATER_GOAL} gelas`}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mb-3 inline-flex items-center gap-1">Minum air putih itu bukan opsi, Rezal <Emoji3D e="💧" size={14} /></p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-3">
                  {Array.from({ length: WATER_GOAL }).map((_, i) => (
                    <button key={i} onClick={i < waterCount ? removeWater : addWater}
                      className={`relative h-10 rounded-2xl flex items-end justify-center pb-1 transition-all duration-300 border-2 ${
                        i < waterCount
                          ? `bg-gradient-to-b from-blue-300 to-blue-500 border-blue-400 shadow-md shadow-blue-100 ${waterPulse && i === waterCount - 1 ? 'scale-110' : 'scale-100'}`
                          : 'bg-slate-50 border-slate-200 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      <Emoji3D e="💧" size={20} className={`transition-all ${i < waterCount ? 'opacity-100' : 'opacity-30'}`} />
                    </button>
                  ))}
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${waterPercent}%` }} />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
                  <span>0 gelas</span>
                  <span className={`inline-flex items-center gap-1 ${waterCount >= WATER_GOAL ? 'text-blue-500' : ''}`}>
                    {waterCount >= WATER_GOAL ? (<><Emoji3D e="🎉" size={13} /> Goal tercapai!</>) : `${WATER_GOAL - waterCount} lagi!`}
                  </span>
                  <span>{WATER_GOAL} gelas</span>
                </div>
              </div>
            </div>

            {/* KOLOM 3 */}
            <div className="space-y-5">

              {/* ── Pet Stats Card: tampil hanya jika Pro terbuka ──────────── */}
              {isProUnlocked ? (
                <div
                  className="relative overflow-hidden rounded-[28px] p-5 shadow-lg"
                  style={{
                    background: `linear-gradient(145deg, #0f172a, #1e1b4b)`,
                    border: `1.5px solid ${activePet.glow}44`,
                    boxShadow: `0 8px 32px ${activePet.glow}22`,
                  }}
                >
                  <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl pet-glow pointer-events-none" style={{ background: `${activePet.glow}33` }} />
                  <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-2xl pet-glow pointer-events-none" style={{ background: `${activePet.color}22` }} />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="relative w-16 h-16 shrink-0">
                      <div className="absolute inset-0 rounded-full pet-glow" style={{ background: `radial-gradient(circle, ${activePet.glow}66, transparent 70%)` }} />
                      <img src={activePet.src} alt={activePet.name} className="w-16 h-16 object-contain relative z-10 pet-float" style={{ filter: `drop-shadow(0 0 10px ${activePet.glow}dd)` }} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: activePet.glow }}>Active Companion</p>
                      <p className="text-white font-black text-base">{activePet.name}</p>
                      <a href="/pet-academy" className="text-[9px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full" style={{ background: `${activePet.color}33`, color: activePet.glow }}>
                        Pet Academy →
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <PetLockedCard xpNeeded={xpNeeded} />
              )}

              <div className="bg-gradient-to-b from-[#0f172a] to-[#1e1b4b] p-5 rounded-[28px] shadow-xl text-white relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-violet-500/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-8 -left-4 w-20 h-20 bg-indigo-500/15 rounded-full blur-xl" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-violet-400">✦ The Daily</span>
                      <h3 className="text-base font-black tracking-tight text-white">Plotwist</h3>
                    </div>
                    <button onClick={shufflePlottwist} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:rotate-180 duration-300">
                      <Emoji3D e="🎲" size={20} />
                    </button>
                  </div>
                  <div className="bg-white/8 border border-white/10 rounded-2xl p-4 space-y-2 backdrop-blur-sm">
                    <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-violet-400 bg-violet-500/20 px-2 py-0.5 rounded-md">
                      <Emoji3D e={currentPlottwist.tagEmoji} size={13} />
                      {currentPlottwist.tagLabel}
                    </span>
                    <p className="text-[11px] font-semibold text-slate-300 leading-relaxed">{currentPlottwist.mission}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                    <span className="w-1 h-1 bg-violet-400 rounded-full inline-block" />
                    Misi baru setiap hari • Klik dadu untuk random
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100/50 space-y-3">
                <h3 className="text-base font-black text-slate-900 tracking-tight">Integration</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                      <span className="text-red-500 font-black text-sm">G</span> Google Calendar
                    </div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wide">Connected</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                      <Emoji3D e="🐙" size={18} /> GitHub
                    </div>
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-wide">Expired</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#1e1441] to-[#120a2b] p-5 rounded-[28px] shadow-xl text-white flex flex-col justify-between relative overflow-hidden" style={{ minHeight: '180px' }}>
                <div className="space-y-1.5 z-10 relative">
                  <Emoji3D e="👑" size={26} />
                  <h3 className="text-xl font-black tracking-tight">Plotwist Pro</h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Unlock AI insights, advanced analytics, realtime sync, and premium themes.</p>
                </div>
                {isProUnlocked ? (
                  <div className="w-full py-3 bg-gradient-to-r from-yellow-300/20 to-orange-400/20 border border-yellow-300/30 text-yellow-200 rounded-2xl text-[10px] font-black tracking-wider text-center z-10 relative mt-4 inline-flex items-center justify-center gap-1.5">
                    <Emoji3D e="✨" size={14} /> Pro Member Aktif
                  </div>
                ) : (
                  <button className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 rounded-2xl text-[10px] font-black tracking-wider transition-all shadow-lg shadow-orange-500/20 z-10 relative mt-4 inline-flex items-center justify-center gap-1.5">
                    <Emoji3D e="🔒" size={14} /> Capai Level 2 untuk Unlock
                  </button>
                )}
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl" />
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}