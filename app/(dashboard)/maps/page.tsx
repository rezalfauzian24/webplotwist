"use client"

import { useState, useRef, useEffect, useCallback } from "react"

type CrowdLevel = "sepi" | "sedang" | "ramai"
type MapMode = "custom" | "gmaps"

interface UserProfile {
  name: string
  username: string
  avatar: string
  avatarColor: string
  faculty: string
  bio: string
}

interface LocationAddedBy {
  userId: string
  name: string
  avatar: string
  avatarColor: string
  addedAt: string
}

interface StudyLocation {
  id: string
  name: string
  emoji: string
  description: string
  address: string
  isSecret?: boolean
  secretBy?: string
  tags: string[]
  walkTime: string
  x: number
  y: number
  crowd: CrowdLevel
  addedByUser?: boolean
  addedBy?: LocationAddedBy
  fullAddress?: string
}

interface StudyBuddy {
  id: string
  name: string
  avatar: string
  color: number
  locationId: string
  since: string
  status: string
}

const MAPS_STORAGE_KEY    = "plotwist_maps_v2"
const PROFILE_STORAGE_KEY = "plotwist_user_profile"

const DEFAULT_PROFILE: UserProfile = {
  name: "Rezal",
  username: "rezal",
  avatar: "RZ",
  avatarColor: "bg-violet-600",
  faculty: "Teknik",
  bio: "Mahasiswa semester 3 yang suka ngopi sambil ngoding.",
}

const INITIAL_LOCATIONS: StudyLocation[] = [
  {
    id: "1", name: "Perpustakaan Pusat lt.3", emoji: "📚",
    description: "Lantai paling tenang, AC dingin, meja lebar, dan koleksi buku lengkap. Cocok fokus nugas.",
    address: "Gedung Perpustakaan, Lantai 3",
    fullAddress: "Perpustakaan Universitas Indonesia, Depok, Jawa Barat",
    tags: ["Gratis", "Wi-Fi 5★", "Colokan"], walkTime: "5 mnt",
    x: 28, y: 24, crowd: "sepi",
  },
  {
    id: "2", name: "Gazebo Teknik", emoji: "🌿",
    description: "Outdoor tapi adem, ada colokan di tiap tiang. Suasana segar, sinyal lumayan.",
    address: "Halaman Gedung Teknik B",
    fullAddress: "Fakultas Teknik Universitas Indonesia, Depok",
    tags: ["Gratis", "Outdoor", "Sinyal OK"], walkTime: "2 mnt",
    x: 50, y: 54, crowd: "sedang",
  },
  {
    id: "3", name: "Kopi Tulus", emoji: "☕",
    description: "Kafe dekat kampus, Wi-Fi kencang, banyak colokan. Menu mulai 15rb. Favorit anak teknik.",
    address: "Jl. Margonda Raya No. 42",
    fullAddress: "Jl. Margonda Raya No. 42, Depok, Jawa Barat",
    tags: ["15rb+", "Wi-Fi 4★", "AC"], walkTime: "12 mnt",
    x: 72, y: 36, crowd: "sedang",
  },
  {
    id: "4", name: "Ruang Baca FIB", emoji: "🏛️",
    description: "Sepi dan dingin. Koleksi referensi lengkap. Meja kayu panjang buat nugas bareng.",
    address: "Gedung FIB, Ruang Baca Lt.1",
    fullAddress: "Fakultas Ilmu Budaya Universitas Indonesia, Depok",
    tags: ["Gratis", "AC", "Tenang"], walkTime: "8 mnt",
    x: 20, y: 64, crowd: "sepi",
  },
  {
    id: "5", name: "Sudut Sunyi ✨", emoji: "🌟",
    description: "Pojok tersembunyi dekat tangga darurat perpus lt.2. Wi-Fi 100Mbps, hampir tidak ada yang tahu!",
    address: "Perpus Pusat – Tangga darurat Lt.2",
    fullAddress: "Perpustakaan Universitas Indonesia, Depok, Jawa Barat",
    isSecret: true, secretBy: "Raka W.",
    tags: ["Gratis", "Wi-Fi 5★", "Secret"], walkTime: "6 mnt",
    x: 36, y: 44, crowd: "sepi",
  },
  {
    id: "6", name: "Nongkrong.co", emoji: "🧃",
    description: "Suasana santai buat kerja kelompok. Meja besar, proyektor bisa dipinjam.",
    address: "Jl. Beji Permai No. 8",
    fullAddress: "Jl. Beji Permai No. 8, Depok, Jawa Barat",
    tags: ["12rb+", "Proyektor", "Luas"], walkTime: "17 mnt",
    x: 78, y: 66, crowd: "sedang",
  },
]

const INITIAL_BUDDIES: StudyBuddy[] = [
  { id: "b1", name: "Sari",  avatar: "S", color: 0, locationId: "3", since: "13.30", status: "Ngerjain laporan fisika 📝" },
  { id: "b2", name: "Bimo",  avatar: "B", color: 1, locationId: "2", since: "14.00", status: "Lagi makan dulu bro 🍜" },
  { id: "b3", name: "Cindy", avatar: "C", color: 2, locationId: "3", since: "14.15", status: "Belajar kalkulus 😭" },
  { id: "b4", name: "Dani",  avatar: "D", color: 3, locationId: "1", since: "12.00", status: "Tenang ya jangan berisik" },
]

const RECOMMENDATIONS = [
  { locId: "1", reason: "Dani lagi di sini, cocok buat fokus bareng 📚", score: 95 },
  { locId: "3", reason: "Sari & Cindy lagi di Kopi Tulus — join yuk! ☕", score: 88 },
  { locId: "5", reason: "Secret spot sepi, Wi-Fi kencang, produktif banget 🌟", score: 82 },
  { locId: "2", reason: "Bimo lagi di Gazebo, paling deket dari posisimu 🌿", score: 75 },
]

const CROWD_META: Record<CrowdLevel, { label: string; color: string; bg: string; dot: string }> = {
  sepi:   { label: "Sepi",   color: "#059669", bg: "#d1fae5", dot: "bg-emerald-500" },
  sedang: { label: "Sedang", color: "#d97706", bg: "#fef3c7", dot: "bg-amber-400"   },
  ramai:  { label: "Ramai",  color: "#dc2626", bg: "#fee2e2", dot: "bg-red-500"     },
}
const CROWD_EMOJI: Record<CrowdLevel, string> = { sepi: "🟢", sedang: "🟡", ramai: "🔴" }
const AVATAR_COLORS = ["bg-violet-500","bg-emerald-500","bg-blue-500","bg-pink-500","bg-amber-500","bg-cyan-500"]
const RANDOM_EMOJIS = ["🏠","🌳","🏢","🎨","🎵","🌸","🏫","🎭","🌺","🏖️"]

/* ── 3D EMOJI SYSTEM ──────────────────────────────────────────────────
   Pakai set "Fluent Emoji 3D" (Microsoft, open source) lewat CDN jsDelivr.
   Jauh lebih "berisi" / glossy dibanding emoji bawaan HP, dan ukurannya
   bisa diatur bebas tanpa pecah karena format PNG resolusi tinggi.
   Kalau emoji belum ada di mapping, otomatis fallback ke emoji native
   yang diperbesar + diberi efek 3D (drop-shadow + sedikit transform)
   supaya tetap terasa "beda" dari emoji polos.
------------------------------------------------------------------------- */
const EMOJI_3D_MAP: Record<string, string> = {
  "📚": "Books", "🌿": "Herb", "☕": "Hot beverage", "🏛️": "Classical building",
  "🌟": "Glowing star", "🧃": "Beverage box", "🏠": "House", "🌳": "Deciduous tree",
  "🏢": "Office building", "🎨": "Artist palette", "🎵": "Musical note", "🌸": "Cherry blossom",
  "🏫": "School", "🎭": "Performing arts", "🌺": "Hibiscus", "🏖️": "Beach with umbrella",
  "🔍": "Magnifying glass tilted left", "🗺️": "World map", "📍": "Round pushpin",
  "🎲": "Game die", "🧭": "Compass", "👥": "Busts in silhouette", "⭐": "Star",
  "🤫": "Shushing face", "🔴": "Red circle", "🟡": "Yellow circle", "🟢": "Green circle",
  "🚶": "Person walking", "👋": "Waving hand", "💔": "Broken heart", "📣": "Megaphone",
  "🎯": "Direct hit", "🤷": "Person shrugging", "👻": "Ghost", "💡": "Light bulb",
  "✨": "Sparkles", "📝": "Memo", "🍜": "Steaming bowl", "😭": "Loudly crying face",
}

function emoji3dUrl(name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim().replace(/\s+/g, "_")
  return `https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/${name}/3D/${slug}_3d.png`
}

interface Emoji3DProps {
  e: string
  size?: number
  className?: string
}
function Emoji3D({ e, size = 28, className = "" }: Emoji3DProps) {
  const mapped = EMOJI_3D_MAP[e]
  const [failed, setFailed] = useState(false)

  if (mapped && !failed) {
    return (
      <img
        src={emoji3dUrl(mapped)}
        alt={e}
        draggable={false}
        onError={() => setFailed(true)}
        className={`inline-block align-middle select-none ${className}`}
        style={{
          width: size, height: size, objectFit: "contain",
          filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.25))",
        }}
      />
    )
  }
  // Fallback: native emoji tapi diperbesar & dikasih sentuhan "3D"
  return (
    <span
      className={`inline-block align-middle select-none ${className}`}
      style={{
        fontSize: size * 0.92,
        lineHeight: 1,
        filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
        transform: "scale(1.05)",
      }}
    >
      {e}
    </span>
  )
}
/* ───────────────────────────────────────────────────────────────────── */

function toSvgPoint(x: number, y: number, W: number, H: number) {
  return { sx: (x / 100) * W, sy: (y / 100) * H }
}
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
}
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
  } catch { return iso }
}

const USER_X = 52, USER_Y = 74

function buildGMapsSearchURL(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&hl=id&z=16`
}
function buildGMapsDirectionsURL(destination: string): string {
  return `https://maps.google.com/maps?saddr=My+Location&daddr=${encodeURIComponent(destination)}&output=embed&hl=id`
}

interface GMapsEmbedProps {
  loc: StudyLocation
  mode: "search" | "directions"
  onModeChange: (mode: "search" | "directions") => void
  onClose: () => void
}
function GMapsEmbed({ loc, mode, onModeChange, onClose }: GMapsEmbedProps) {
  const [loading, setLoading] = useState(true)
  const address = loc.fullAddress || loc.address
  const src = mode === "search" ? buildGMapsSearchURL(address) : buildGMapsDirectionsURL(address)

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0"><Emoji3D e={loc.emoji} size={26} /></div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-900 text-xs truncate">{loc.name}</p>
          <p className="text-[10px] text-slate-400 font-semibold truncate">{loc.address}</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">✕</button>
      </div>
      <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-100 shrink-0">
        {(["search", "directions"] as const).map(m => (
          <button key={m} onClick={() => { onModeChange(m); setLoading(true) }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all ${mode === m ? "bg-white shadow text-violet-600" : "text-slate-400 hover:text-slate-600"}`}>
            {m === "search" ? <><Emoji3D e="🗺️" size={16} /> Lihat Lokasi</> : <><Emoji3D e="🧭" size={16} /> Rute Jalan</>}
          </button>
        ))}
      </div>
      <div className="flex-1 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center z-10 gap-3">
            <div className="w-8 h-8 border-violet-200 border-t-violet-600 rounded-full animate-spin" style={{ borderWidth: 3, borderStyle: "solid" }} />
            <p className="text-xs font-bold text-slate-400">Memuat peta...</p>
          </div>
        )}
        <iframe key={src} src={src} className="w-full h-full border-0" loading="lazy" allowFullScreen
          referrerPolicy="no-referrer-when-downgrade" onLoad={() => setLoading(false)} title={`Google Maps - ${loc.name}`} />
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 bg-violet-50 border-t border-violet-100 shrink-0">
        <div className="flex items-center gap-2">
          <Emoji3D e="🚶" size={30} />
          <div>
            <p className="text-xs font-black text-violet-800">{loc.walkTime} dari posisimu</p>
            <p className="text-[10px] text-violet-500 font-semibold">estimasi jalan kaki</p>
          </div>
        </div>
        {mode === "directions" && (
          <div className="text-[10px] text-violet-600 font-black bg-white px-2 py-1 rounded-lg border border-violet-200 flex items-center gap-1"><Emoji3D e="📍" size={14} /> Aktifkan GPS untuk rute akurat</div>
        )}
      </div>
    </div>
  )
}

interface AddLocationModalProps {
  onClose: () => void
  onSubmit: (loc: Omit<StudyLocation, "id">) => void
  userProfile: UserProfile
}
function AddLocationModal({ onClose, onSubmit, userProfile }: AddLocationModalProps) {
  const [name, setName] = useState("")
  const [addr, setAddr] = useState("")
  const [desc, setDesc] = useState("")
  const [crowd, setCrowd] = useState<CrowdLevel>("sedang")
  const [isSecret, setIsSecret] = useState(false)

  const handleSubmit = () => {
    if (!name.trim()) return
    const emoji = RANDOM_EMOJIS[Math.floor(Math.random() * RANDOM_EMOJIS.length)]
    onSubmit({
      name: name.trim(),
      emoji,
      description: desc.trim() || "Tempat yang ditambahkan oleh pengguna.",
      address: addr.trim() || "Lokasi kampus",
      fullAddress: addr.trim() ? `${addr.trim()}, Depok, Jawa Barat` : "Universitas Indonesia, Depok",
      tags: ["User Added"],
      walkTime: "? mnt",
      x: 25 + Math.random() * 55,
      y: 20 + Math.random() * 55,
      crowd,
      isSecret,
      secretBy: isSecret ? userProfile.name : undefined,
      addedByUser: true,
      addedBy: {
        userId: userProfile.username,
        name: userProfile.name,
        avatar: userProfile.avatar,
        avatarColor: userProfile.avatarColor,
        addedAt: new Date().toISOString(),
      },
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-black text-xl text-slate-900 flex items-center gap-2"><Emoji3D e="📍" size={26} /> Tambah Lokasi Baru</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Bagikan spot favoritmu! +50 XP</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-2xl px-3 py-2.5">
          <div className={`w-8 h-8 rounded-full ${userProfile.avatarColor} flex items-center justify-center text-white text-xs font-black shrink-0`}>
            {userProfile.avatar}
          </div>
          <div>
            <p className="text-xs font-black text-slate-800">{userProfile.name}</p>
            <p className="text-[10px] text-slate-500 font-semibold">@{userProfile.username} · {userProfile.faculty}</p>
          </div>
          <span className="ml-auto text-[9px] font-black text-violet-500 bg-white border border-violet-200 px-2 py-0.5 rounded-full">Kamu</span>
        </div>
        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama tempat (e.g. Balkon Rektorat)"
            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-violet-400" />
          <input value={addr} onChange={e => setAddr(e.target.value)} placeholder="Alamat lengkap (untuk Google Maps)"
            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-violet-400" />
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ceritakan kenapa tempat ini keren..."
            rows={2} className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-violet-400 resize-none" />
          <select value={crowd} onChange={e => setCrowd(e.target.value as CrowdLevel)}
            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-violet-400">
            <option value="sepi">🟢 Biasanya Sepi</option>
            <option value="sedang">🟡 Sedang</option>
            <option value="ramai">🔴 Biasanya Ramai</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer">
            <input type="checkbox" checked={isSecret} onChange={e => setIsSecret(e.target.checked)} className="rounded" />
            <Emoji3D e="🤫" size={20} /> Ini secret spot
          </label>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 rounded-2xl py-2.5 text-sm font-bold hover:bg-slate-50 transition-all">Batal</button>
          <button onClick={handleSubmit} disabled={!name.trim()}
            className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-2xl py-2.5 text-sm font-black transition-all flex items-center justify-center gap-2">
            <Emoji3D e="📍" size={18} /> Tambahkan!
          </button>
        </div>
      </div>
    </div>
  )
}

function ShareSecretModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (name: string, desc: string) => void }) {
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center gap-3">
          <Emoji3D e="🤫" size={44} />
          <div>
            <h3 className="font-black text-xl text-slate-900">Share Secret Spot</h3>
            <p className="text-xs text-slate-400 font-semibold flex items-center gap-1">+50 XP · Badge Explorer unlocked <Emoji3D e="🌟" size={16} /></p>
          </div>
        </div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama secret spot"
          className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-violet-400" />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ceritakan kenapa ini spesial dan cara menemukannya..."
          rows={3} className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-violet-400 resize-none" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 rounded-2xl py-2.5 text-sm font-bold hover:bg-slate-50 transition-all">Batal</button>
          <button onClick={() => { if (name.trim()) onSubmit(name.trim(), desc.trim()) }}
            className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 rounded-2xl py-2.5 text-sm font-black transition-all flex items-center justify-center gap-2">
            <Emoji3D e="🌟" size={18} /> Bagikan!
          </button>
        </div>
      </div>
    </div>
  )
}

function AddedByCard({ addedBy }: { addedBy: LocationAddedBy }) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2.5">
      <div className={`w-8 h-8 rounded-full ${addedBy.avatarColor} flex items-center justify-center text-white text-xs font-black shrink-0`}>
        {addedBy.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black text-slate-800">{addedBy.name}</p>
        <p className="text-[10px] text-slate-400 font-semibold">@{addedBy.userId} · Ditambahkan {formatDate(addedBy.addedAt)}</p>
      </div>
      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full shrink-0">Kontributor</span>
    </div>
  )
}

export default function MapsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [locations, setLocations] = useState<StudyLocation[]>(INITIAL_LOCATIONS)
  const [search, setSearch] = useState("")
  const [suggestions, setSuggestions] = useState<StudyLocation[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [crowdFilter, setCrowdFilter] = useState<CrowdLevel | null>(null)
  const [showFavOnly, setShowFavOnly] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)
  const [showBuddyFilter, setShowBuddyFilter] = useState(false)
  const [selected, setSelected] = useState<StudyLocation | null>(null)
  const [activeTab, setActiveTab] = useState<"info" | "rute" | "buddy" | "rekomendasi">("info")
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["1", "2"]))
  const [buddies, setBuddies] = useState<StudyBuddy[]>(INITIAL_BUDDIES)
  const [myBuddyLocId, setMyBuddyLocId] = useState<string | null>(null)
  const [myStatus, setMyStatus] = useState("")
  const [globalStatus, setGlobalStatus] = useState("")
  const [toast, setToast] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSecretModal, setShowSecretModal] = useState(false)
  const [showRouteFor, setShowRouteFor] = useState<string | null>(null)
  const [surpriseAnim, setSurpriseAnim] = useState(false)
  const [surpriseMsg, setSurpriseMsg] = useState<string | null>(null)
  const [mapSize, setMapSize] = useState({ w: 600, h: 400 })
  const [mapMode, setMapMode] = useState<MapMode>("custom")
  const [gmapsEmbedLoc, setGmapsEmbedLoc] = useState<StudyLocation | null>(null)
  const [gmapsMode, setGmapsMode] = useState<"search" | "directions">("search")
  const [hydrated, setHydrated] = useState(false)
  const [crowdOverrides, setCrowdOverrides] = useState<Record<string, CrowdLevel>>({})

  const mapRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const rawProfile = localStorage.getItem(PROFILE_STORAGE_KEY)
      if (rawProfile) setUserProfile(JSON.parse(rawProfile))
      const raw = localStorage.getItem(MAPS_STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved.userLocations && Array.isArray(saved.userLocations)) {
          setLocations([...INITIAL_LOCATIONS, ...saved.userLocations])
        }
        if (saved.favorites) setFavorites(new Set(saved.favorites))
        if (saved.crowdOverrides) {
          setLocations(prev => prev.map(l => {
            const override = saved.crowdOverrides[l.id]
            return override ? { ...l, crowd: override } : l
          }))
        }
        if (saved.showSecrets !== undefined) setShowSecrets(saved.showSecrets)
        if (saved.selectedId) {
          setTimeout(() => {
            setLocations(prev => {
              const found = prev.find(l => l.id === saved.selectedId)
              if (found) { setSelected(found); setActiveTab("info") }
              return prev
            })
          }, 0)
        }
      }
    } catch (_) {}
    setHydrated(true)
  }, [])

  const persistMaps = useCallback((
    locs: StudyLocation[], favs: Set<string>, secrets: boolean,
    selectedId: string | null, crowdMap: Record<string, CrowdLevel>
  ) => {
    try {
      const userLocations = locs.filter(l => l.addedByUser)
      localStorage.setItem(MAPS_STORAGE_KEY, JSON.stringify({
        userLocations, favorites: Array.from(favs), showSecrets: secrets,
        selectedId, crowdOverrides: crowdMap, savedAt: new Date().toISOString(),
      }))
    } catch (_) {}
  }, [])

  useEffect(() => {
    if (!hydrated) return
    persistMaps(locations, favorites, showSecrets, selected?.id ?? null, crowdOverrides)
  }, [locations, favorites, showSecrets, selected, crowdOverrides, hydrated, persistMaps])

  useEffect(() => {
    const update = () => {
      if (mapRef.current) setMapSize({ w: mapRef.current.offsetWidth, h: mapRef.current.offsetHeight })
    }
    update()
    const ro = new ResizeObserver(update)
    if (mapRef.current) ro.observe(mapRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const filtered = locations.filter(loc => {
    if (!showSecrets && loc.isSecret) return false
    if (search && !loc.name.toLowerCase().includes(search.toLowerCase()) && !loc.address.toLowerCase().includes(search.toLowerCase())) return false
    if (crowdFilter && loc.crowd !== crowdFilter) return false
    if (showFavOnly && !favorites.has(loc.id)) return false
    if (showBuddyFilter && !buddies.some(b => b.locationId === loc.id)) return false
    return true
  })

  const locBuddies = (id: string) => buddies.filter(b => b.locationId === id)
  const topRec = RECOMMENDATIONS.slice(0, 3)
  const recLoc = (id: string) => locations.find(l => l.id === id)!

  const handleSearch = (val: string) => {
    setSearch(val)
    if (!val.trim()) { setSuggestions([]); setShowSuggestions(false); return }
    const q = val.toLowerCase()
    const matches = locations.filter(l =>
      l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q) || l.tags.some(t => t.toLowerCase().includes(q))
    )
    setSuggestions(matches)
    setShowSuggestions(true)
  }

  const selectSuggestion = (loc: StudyLocation) => {
    setSearch(loc.name); setShowSuggestions(false); setSelected(loc); setActiveTab("info"); setShowRouteFor(null)
  }

  const openGMapsInPage = (loc: StudyLocation, mode: "search" | "directions" = "search") => {
    setGmapsEmbedLoc(loc); setGmapsMode(mode); setMapMode("gmaps")
  }
  const closeGMaps = () => { setMapMode("custom"); setGmapsEmbedLoc(null) }

  const searchNearby = () => {
    const nearbyLoc: StudyLocation = {
      id: "nearby", name: "Tempat Belajar Sekitar Saya", emoji: "📍",
      description: "Mencari tempat belajar di sekitar lokasimu",
      address: "tempat belajar Depok", fullAddress: "tempat belajar Depok",
      tags: [], walkTime: "-", x: 50, y: 50, crowd: "sedang",
    }
    openGMapsInPage(nearbyLoc, "search")
  }

  const handleSurprise = () => {
    setSurpriseAnim(true); setSurpriseMsg(null)
    const pool = filtered.filter(l => l.id !== selected?.id)
    const pick = pool[Math.floor(Math.random() * pool.length)] ?? filtered[0]
    if (!pick) return
    setTimeout(() => {
      setSurpriseAnim(false)
      setSelected(pick); setActiveTab("info")
      setSurpriseMsg(`Coba belajar di ${pick.name} hari ini!`)
      flash(`🎲 Plotwist memilihkan: ${pick.name}!`)
    }, 700)
  }

  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const n = new Set(prev)
      if (n.has(id)) { n.delete(id); flash("💔 Dihapus dari favorit") }
      else { n.add(id); flash("⭐ Ditambahkan ke favorit!") }
      return n
    })
  }

  const handleJoinBuddy = (locId: string) => {
    if (myBuddyLocId === locId) {
      setMyBuddyLocId(null); setBuddies(prev => prev.filter(b => b.id !== "me")); flash("👋 Status belajarmu dihapus")
    } else {
      setMyBuddyLocId(locId)
      setBuddies(prev => {
        const f = prev.filter(b => b.id !== "me")
        const t = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        return [...f, { id: "me", name: userProfile.name, avatar: userProfile.avatar, color: 5, locationId: locId, since: t, status: myStatus || "Lagi belajar di sini 👋" }]
      })
      flash("📣 Status dipasang! Teman-teman bisa lihat kamu")
    }
  }

  const updateCrowd = (id: string, crowd: CrowdLevel) => {
    setLocations(prev => prev.map(l => l.id === id ? { ...l, crowd } : l))
    setCrowdOverrides(prev => ({ ...prev, [id]: crowd }))
    flash(`${CROWD_EMOJI[crowd]} Kondisi diperbarui!`)
  }

  const handleAddLocation = (locData: Omit<StudyLocation, "id">) => {
    const newLoc: StudyLocation = { ...locData, id: "u" + Date.now() }
    setLocations(prev => [...prev, newLoc])
    if (newLoc.isSecret) setShowSecrets(true)
    setShowAddModal(false); setSelected(newLoc); setActiveTab("info")
    flash(`🌟 Lokasi "${newLoc.name}" berhasil ditambahkan! +50 XP`)
  }

  const handleShareSecret = (name: string, desc: string) => {
    const newLoc: StudyLocation = {
      id: "s" + Date.now(), name, emoji: "🌟",
      description: desc || "Secret spot baru!",
      address: "Lokasi rahasia", fullAddress: "Universitas Indonesia, Depok",
      tags: ["Secret", "Gratis"], walkTime: "? mnt",
      x: 30 + Math.random() * 40, y: 25 + Math.random() * 45,
      crowd: "sepi", isSecret: true, secretBy: userProfile.name, addedByUser: true,
      addedBy: {
        userId: userProfile.username, name: userProfile.name,
        avatar: userProfile.avatar, avatarColor: userProfile.avatarColor,
        addedAt: new Date().toISOString(),
      },
    }
    setLocations(prev => [...prev, newLoc])
    setShowSecrets(true); setShowSecretModal(false); setSelected(newLoc)
    flash("🌟 Secret spot dibagikan! +50 XP")
  }

  const updateGlobalStatus = () => {
    if (!globalStatus.trim()) return
    setMyStatus(globalStatus)
    if (myBuddyLocId) {
      setBuddies(prev => prev.map(b => b.id === "me" ? { ...b, status: globalStatus } : b))
      flash("📣 Status diupdate!")
    } else {
      flash("💡 Set lokasi dulu di tab Teman untuk share statusmu!")
    }
  }

  const routePath = (() => {
    const targetId = showRouteFor ?? selected?.id
    if (!targetId) return null
    const loc = locations.find(l => l.id === targetId)
    if (!loc) return null
    const { sx: ux, sy: uy } = toSvgPoint(USER_X, USER_Y, mapSize.w, mapSize.h)
    const { sx: lx, sy: ly } = toSvgPoint(loc.x, loc.y, mapSize.w, mapSize.h)
    return { path: cubicBezier(ux, uy, lx, ly), lx, ly, ux, uy, loc }
  })()

  if (!hydrated) return null

  return (
    <div className="flex-1 min-h-screen bg-[#f5f4f0]" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99] bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-2xl flex items-center gap-2">
          {toast}
        </div>
      )}

      <div className="flex flex-col overflow-hidden">
        {/* ── HEADER ── */}
        <div className="px-7 pt-6 pb-4 bg-white border-b border-slate-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3 gap-3">
            <div>
              <h1 className="text-3xl font-black text-slate-900 leading-none flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Study Maps <Emoji3D e="🗺️" size={32} />
              </h1>
              <p className="text-slate-400 text-xs mt-1 font-semibold">Lihat teman, rute, dan rekomendasi tempat belajar</p>
            </div>
            <div className="flex flex-wrap gap-2">
  <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
                <button onClick={() => { setMapMode("custom"); setGmapsEmbedLoc(null) }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${mapMode === "custom" ? "bg-white text-violet-600 shadow" : "text-slate-400 hover:text-slate-600"}`}>
                  <Emoji3D e="🗺️" size={16} /> Custom
                </button>
                <button onClick={() => {
                  setMapMode("gmaps")
                  if (!gmapsEmbedLoc) { setGmapsEmbedLoc(selected ?? INITIAL_LOCATIONS[0]); setGmapsMode("search") }
                }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${mapMode === "gmaps" ? "bg-white text-violet-600 shadow" : "text-slate-400 hover:text-slate-600"}`}>
                  <Emoji3D e="📍" size={16} /> Google Maps
                </button>
              </div>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm text-white shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 hover:scale-105 active:scale-95 transition-all">
                <Emoji3D e="📍" size={18} /> Check-in
              </button>
              <button onClick={handleSurprise}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl font-black text-sm text-white shadow-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:scale-105 active:scale-95 transition-all shrink-0 ${surpriseAnim ? "animate-spin" : ""}`}>
                <Emoji3D e="🎲" size={18} /> Surprise
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="relative mb-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-violet-400 transition-all">
              <Emoji3D e="🔍" size={18} />
              <input value={search} onChange={e => handleSearch(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
                placeholder="Cari tempat belajar... (seperti Google Maps)"
                className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1 font-semibold" />
              {search && (
                <button onClick={() => { setSearch(""); setSuggestions([]); setShowSuggestions(false) }}
                  className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
              )}
              <button onClick={searchNearby}
                className="text-violet-500 text-xs font-black hover:text-violet-700 transition-all whitespace-nowrap ml-1 bg-violet-50 px-2 py-1 rounded-lg flex items-center gap-1">
                <Emoji3D e="📍" size={14} /> Sekitar Saya
              </button>
            </div>
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                {suggestions.length > 0 ? (
                  <>
                    <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50">Tempat di Plotwist</div>
                    {suggestions.map(loc => (
                      <button key={loc.id} onClick={() => selectSuggestion(loc)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-all text-left border-b border-slate-50 last:border-0">
                        <Emoji3D e={loc.emoji} size={26} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate">{loc.name}</p>
                          <p className="text-xs text-slate-400 font-semibold truncate">{loc.address}</p>
                          {loc.addedBy && <p className="text-[10px] text-violet-500 font-bold">ditambahkan oleh {loc.addedBy.name}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-bold" style={{ color: CROWD_META[loc.crowd].color }}><Emoji3D e={CROWD_EMOJI[loc.crowd]} size={12} /></span>
                          <button onClick={e => { e.stopPropagation(); openGMapsInPage(loc, "search") }}
                            className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black hover:bg-blue-100 transition-all flex items-center gap-1">
                            <Emoji3D e="🗺️" size={12} /> Peta
                          </button>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="px-4 py-4 text-center">
                    <p className="text-sm text-slate-400 font-semibold">Tidak ditemukan di Plotwist</p>
                    <button onClick={() => { searchNearby(); setShowSuggestions(false) }}
                      className="mt-2 text-sm text-violet-600 font-black hover:text-violet-800">Cari di Google Maps Embed →</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {(["sepi", "sedang", "ramai"] as CrowdLevel[]).map(c => (
              <button key={c} onClick={() => setCrowdFilter(crowdFilter === c ? null : c)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black border-2 transition-all ${crowdFilter === c ? "text-white border-transparent shadow" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                style={crowdFilter === c ? { backgroundColor: CROWD_META[c].color } : {}}>
                <Emoji3D e={CROWD_EMOJI[c]} size={14} /> {CROWD_META[c].label}
              </button>
            ))}
            <div className="w-px h-5 bg-slate-200" />
            <button onClick={() => setShowFavOnly(!showFavOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black border-2 transition-all ${showFavOnly ? "bg-amber-400 border-amber-400 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-amber-300"}`}>
              <Emoji3D e="⭐" size={14} /> Favorit
            </button>
            <button onClick={() => setShowSecrets(!showSecrets)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black border-2 transition-all ${showSecrets ? "bg-violet-500 border-violet-500 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-violet-300"}`}>
              <Emoji3D e="🤫" size={14} /> Secret
            </button>
            <button onClick={() => setShowBuddyFilter(!showBuddyFilter)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black border-2 transition-all ${showBuddyFilter ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300"}`}>
              <Emoji3D e="👥" size={14} /> Ada Teman
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black border-2 border-slate-200 bg-white text-slate-600 hover:border-violet-300 transition-all">
              👤 Kontribusiku ({locations.filter(l => l.addedByUser && l.addedBy?.userId === userProfile.username).length})
            </button>
            <button onClick={() => setShowSecretModal(true)}
              className="ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black bg-yellow-400 hover:bg-yellow-300 text-yellow-900 transition-all hover:scale-105 shadow">
              <Emoji3D e="🌟" size={14} /> Share Secret Spot
            </button>
          </div>
        </div>

        {surpriseMsg && (
          <div className="mx-7 mt-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-bold px-5 py-3 rounded-2xl flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2"><Emoji3D e="🎲" size={18} /> {surpriseMsg}</span>
            <button onClick={() => setSurpriseMsg(null)} className="text-white/60 hover:text-white">✕</button>
          </div>
        )}

        {/* ── MAP AREA ── */}
        <div className="flex flex-1 gap-4 px-7 pt-4 pb-0 overflow-hidden min-h-0" style={{ minHeight: 420 }}>

          {/* Peta utama */}
          <div ref={mapRef} className="flex-1 relative rounded-3xl overflow-hidden shadow-xl" style={{ minHeight: 400 }}>
            {mapMode === "gmaps" && gmapsEmbedLoc && (
              <GMapsEmbed loc={gmapsEmbedLoc} mode={gmapsMode} onModeChange={m => setGmapsMode(m)} onClose={closeGMaps} />
            )}
            {mapMode === "custom" && (
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 40%,#1a1050 0%,#0f0726 100%)" }}>
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  viewBox={`0 0 ${mapSize.w} ${mapSize.h}`} preserveAspectRatio="none">
                  {buddies.map(b => {
                    const loc = locations.find(l => l.id === b.locationId)
                    if (!loc) return null
                    const { sx: bx, sy: by } = toSvgPoint(loc.x, loc.y, mapSize.w, mapSize.h)
                    const { sx: ux, sy: uy } = toSvgPoint(USER_X, USER_Y, mapSize.w, mapSize.h)
                    return <line key={b.id} x1={ux} y1={uy} x2={bx} y2={by} stroke="#a78bfa" strokeWidth="1" strokeDasharray="5,4" opacity="0.2" />
                  })}
                  {routePath && (
                    <>
                      <path d={routePath.path} fill="none" stroke="#7c3aed" strokeWidth="8" strokeLinecap="round" opacity="0.2" />
                      <path d={routePath.path} fill="none" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round"
                        strokeDasharray="8,5" style={{ animation: "dash 1.5s linear infinite" }} />
                      <circle cx={routePath.lx} cy={routePath.ly} r="7" fill="#7c3aed" opacity="0.9" />
                      <circle cx={routePath.lx} cy={routePath.ly} r="12" fill="none" stroke="#c4b5fd" strokeWidth="1.5" opacity="0.6"
                        style={{ animation: "ping 1.5s ease-out infinite" }} />
                      <circle cx={routePath.ux} cy={routePath.uy} r="5" fill="#60a5fa" />
                    </>
                  )}
                </svg>
                <style>{`@keyframes dash{to{stroke-dashoffset:-26}}@keyframes ping{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.8);opacity:0}}`}</style>
                <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {[20, 40, 60, 80].map(v => (
                    <g key={v}>
                      <line x1={v} y1="0" x2={v} y2="100" stroke="#a78bfa" strokeWidth="0.4" />
                      <line x1="0" y1={v} x2="100" y2={v} stroke="#a78bfa" strokeWidth="0.4" />
                    </g>
                  ))}
                </svg>
                {filtered.map(loc => {
                  const cm = CROWD_META[loc.crowd]
                  const isSelected = selected?.id === loc.id
                  const buddyCount = locBuddies(loc.id).length
                  const isMyLoc = loc.addedBy?.userId === userProfile.username
                  return (
                    <button key={loc.id} onClick={() => { setSelected(loc); setActiveTab("info") }}
                      style={{ left: `${loc.x}%`, top: `${loc.y}%`, position: "absolute" }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group z-20">
                      <div className={`relative transition-all duration-200 ${isSelected ? "scale-125" : "hover:scale-110"}`}>
                        {isSelected && <span className="absolute inset-0 rounded-full bg-violet-400 opacity-40 animate-ping" />}
                        <div className="w-14 h-14 rounded-[18px] shadow-lg border-2 flex items-center justify-center"
                          style={{ backgroundColor: isSelected ? "#5b21b6" : "#1e1557", borderColor: isSelected ? "#c4b5fd" : cm.color }}>
                          <Emoji3D e={loc.emoji} size={34} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0f0726]" style={{ backgroundColor: cm.color }} />
                        {favorites.has(loc.id) && <div className="absolute -top-2 -left-1"><Emoji3D e="⭐" size={16} /></div>}
                        {buddyCount > 0 && (
                          <div className="absolute -top-2 -right-1 bg-emerald-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black border border-white">{buddyCount}</div>
                        )}
                        {loc.isSecret && <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full font-black whitespace-nowrap flex items-center gap-0.5"><Emoji3D e="🤫" size={12} /></div>}
                        {isMyLoc && (
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] bg-violet-500 text-white px-1.5 py-0.5 rounded-full font-black whitespace-nowrap">
                            {loc.isSecret ? "" : "👤 Kamu"}
                          </div>
                        )}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white text-slate-800 text-xs px-2.5 py-1.5 rounded-xl whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold z-30 space-y-0.5">
                          <p>{loc.name}</p>
                          {loc.addedBy && <p className="text-[9px] text-violet-500 font-semibold">oleh {loc.addedBy.name}</p>}
                        </div>
                      </div>
                    </button>
                  )
                })}
                {buddies.map((b, i) => {
                  const loc = locations.find(l => l.id === b.locationId)
                  if (!loc || !filtered.find(f => f.id === loc.id)) return null
                  const angle = (i / (buddies.filter(x => x.locationId === b.locationId).length || 1)) * Math.PI * 2
                  const bx = loc.x + (Math.cos(angle) * 20 / mapSize.w) * 100
                  const by = loc.y + (Math.sin(angle) * 16 / mapSize.h) * 100 + 9
                  return (
                    <div key={b.id} style={{ left: `${bx}%`, top: `${by}%`, position: "absolute" }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-default">
                      <div className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-black text-white shadow-lg ${b.id === "me" ? `${userProfile.avatarColor} ring-2 ring-violet-300` : AVATAR_COLORS[b.color % AVATAR_COLORS.length]}`}>
                        {b.id === "me" ? userProfile.avatar : b.avatar}
                      </div>
                      <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-xl whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 font-semibold">
                        <p className="font-black">{b.id === "me" ? userProfile.name : b.name}</p>
                        <p className="text-white/60">{b.status}</p>
                      </div>
                    </div>
                  )
                })}
                <div style={{ left: `${USER_X}%`, top: `${USER_Y}%`, position: "absolute" }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group">
                  <div className={`w-6 h-6 rounded-full ${userProfile.avatarColor} border-2 border-white shadow-lg flex items-center justify-center text-white text-[9px] font-black animate-pulse`}>
                    {userProfile.avatar}
                  </div>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] text-white/80 whitespace-nowrap font-black flex items-center gap-1"><Emoji3D e="📍" size={12} /> {userProfile.name}</div>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-3 space-y-1.5 z-20">
                  {(Object.entries(CROWD_META) as [CrowdLevel, typeof CROWD_META[CrowdLevel]][]).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 text-[11px] text-white/70 font-semibold">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                      <Emoji3D e={CROWD_EMOJI[k as CrowdLevel]} size={14} /> {v.label}
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-[11px] text-white/70 font-semibold border-t border-white/10 pt-1.5 mt-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${userProfile.avatarColor}`} />
                    <Emoji3D e="📍" size={14} /> {userProfile.name}
                  </div>
                </div>
                <button onClick={() => setShowAddModal(true)}
                  className="absolute top-4 right-4 z-20 bg-violet-600 hover:bg-violet-500 text-white text-xs font-black px-3 py-2 rounded-xl shadow-lg transition-all">
                  + Tambah Lokasi
                </button>
                {routePath && (
                  <button onClick={() => setShowRouteFor(null)}
                    className="absolute top-14 right-4 z-20 bg-white/10 hover:bg-white/20 text-white text-xs font-black px-3 py-1.5 rounded-xl transition-all">
                    ✕ Tutup Rute
                  </button>
                )}
                {filtered.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="bg-black/60 backdrop-blur-sm text-white text-sm font-bold px-6 py-4 rounded-2xl text-center">
                      <div className="mb-2 flex justify-center"><Emoji3D e="🔍" size={36} /></div>Tidak ada tempat yang cocok.
                    </div>
                  </div>
                )}

                {/* Maskot pojok kanan bawah peta */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/11.png"
                  alt="Maskot Plotwist"
                  className="absolute bottom-0 right-0 z-30 pointer-events-none"
                  style={{ width: 180, height: "auto" }}
                />
              </div>
            )}
          </div>

          {/* Panel detail lokasi */}
          <div className={`transition-all duration-300 overflow-y-auto shrink-0 ${selected ? "w-80 opacity-100" : "w-0 opacity-0 pointer-events-none"}`}>
            {selected && (() => {
              const cm = CROWD_META[selected.crowd]
              const buddyList = locBuddies(selected.id)
              const isFav = favorites.has(selected.id)
              const isMyBuddy = myBuddyLocId === selected.id
              const isRouteActive = showRouteFor === selected.id
              const rec = RECOMMENDATIONS.find(r => r.locId === selected.id)
              return (
                <div className="bg-white rounded-3xl shadow-xl w-80 overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0"><Emoji3D e={selected.emoji} size={32} /></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 text-[14px] leading-snug">{selected.name}</h3>
                        {selected.isSecret && (
                          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                            <Emoji3D e="🤫" size={12} /> Secret by {selected.secretBy}
                          </span>
                        )}
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{selected.address}</p>
                      </div>
                      <button onClick={() => setSelected(null)} className="text-slate-300 hover:text-slate-500 text-lg shrink-0">✕</button>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                      <span className="text-sm font-black flex items-center gap-1" style={{ color: cm.color }}><Emoji3D e={CROWD_EMOJI[selected.crowd]} size={14} /> {cm.label}</span>
                      {selected.tags.map(t => (
                        <span key={t} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">{t}</span>
                      ))}
                    </div>
                    {rec && (
                      <div className="mt-2 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2 flex items-start gap-2">
                        <Emoji3D e="🎯" size={18} />
                        <p className="text-[10px] text-violet-700 font-bold leading-snug">{rec.reason}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex border-b border-slate-100 bg-slate-50">
                    {(["info", "rute", "buddy", "rekomendasi"] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wide transition-all flex flex-col items-center gap-0.5 ${activeTab === tab ? "bg-white text-violet-600 border-b-2 border-violet-500" : "text-slate-400 hover:text-slate-600"}`}>
                        {tab === "info" ? <>📋 Info</> : tab === "rute" ? <><Emoji3D e="🧭" size={14} /> Rute</> : tab === "buddy" ? <><Emoji3D e="👥" size={14} /> Teman</> : <><Emoji3D e="⭐" size={14} /> Rekomen</>}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 space-y-3">
                    {activeTab === "info" && (
                      <>
                        <p className="text-[12px] text-slate-600 font-semibold leading-relaxed bg-slate-50 rounded-2xl p-3 border border-slate-100">{selected.description}</p>
                        {selected.addedBy && (
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Ditambahkan oleh</p>
                            <AddedByCard addedBy={selected.addedBy} />
                          </div>
                        )}
                        <div className="rounded-2xl p-3 border" style={{ backgroundColor: cm.bg, borderColor: cm.color + "40" }}>
                          <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: cm.color }}>Update Kondisi</p>
                          <div className="flex gap-2">
                            {(["sepi", "sedang", "ramai"] as CrowdLevel[]).map(c => (
                              <button key={c} onClick={() => updateCrowd(selected.id, c)}
                                className="flex-1 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all hover:scale-105 flex items-center justify-center gap-1"
                                style={selected.crowd === c ? { backgroundColor: CROWD_META[c].color, color: "white", borderColor: "transparent" } : { backgroundColor: "white", borderColor: "#e2e8f0" }}>
                                <Emoji3D e={CROWD_EMOJI[c]} size={12} /> {CROWD_META[c].label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => toggleFav(selected.id)}
                          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-black border-2 transition-all ${isFav ? "bg-amber-400 border-amber-400 text-white" : "border-amber-200 text-amber-600 hover:bg-amber-50"}`}>
                          {isFav ? <><Emoji3D e="⭐" size={16} /> Tersimpan di Favorit</> : "☆ Simpan ke Favorit"}
                        </button>
                      </>
                    )}
                    {activeTab === "rute" && (
                      <div className="space-y-3">
                        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 text-center">
                          <div className="flex justify-center mb-2"><Emoji3D e="🚶" size={48} /></div>
                          <p className="font-black text-violet-800 text-lg">{selected.walkTime}</p>
                          <p className="text-[11px] text-violet-500 font-semibold">dari posisimu sekarang</p>
                        </div>
                        <button onClick={() => openGMapsInPage(selected, "directions")}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:scale-[1.02] shadow-lg shadow-violet-100 transition-all">
                          <Emoji3D e="🧭" size={18} /> Tampilkan Rute di Peta
                        </button>
                        <button onClick={() => openGMapsInPage(selected, "search")}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-black border-2 border-blue-200 text-blue-600 hover:bg-blue-50 transition-all">
                          <Emoji3D e="🗺️" size={16} /> Lihat Lokasi di Peta
                        </button>
                        <button onClick={() => { setShowRouteFor(isRouteActive ? null : selected.id); setMapMode("custom") }}
                          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-black border-2 transition-all ${isRouteActive ? "bg-slate-200 text-slate-600 border-slate-200" : "border-violet-200 text-violet-600 hover:bg-violet-50"}`}>
                          {isRouteActive ? "✕ Sembunyikan Rute Custom" : "✏️ Rute di Custom Map"}
                        </button>
                        <div className="bg-slate-50 rounded-2xl p-3 space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Panduan Arah</p>
                          {[`📍 Mulai dari posisimu sekarang`, `➡️ Menuju ${selected.address}`, `🚶 Jalan kaki ${selected.walkTime}`, `🎯 Sampai di ${selected.name}`].map((step, i) => (
                            <div key={i} className="flex items-start gap-2 text-[11px] text-slate-600 font-semibold">
                              <span className="shrink-0">{step.slice(0, 2)}</span><span>{step.slice(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeTab === "buddy" && (
                      <div className="space-y-3">
                        {buddyList.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sedang belajar di sini</p>
                            {buddyList.map(b => (
                              <div key={b.id} className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0 ${b.id === "me" ? userProfile.avatarColor : AVATAR_COLORS[b.color % AVATAR_COLORS.length]}`}>
                                  {b.id === "me" ? userProfile.avatar : b.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-black text-slate-800 text-xs">{b.id === "me" ? userProfile.name : b.name} {b.id === "me" && <span className="text-violet-500">(Kamu)</span>}</p>
                                  <p className="text-[10px] text-slate-500 font-semibold truncate">{b.status}</p>
                                </div>
                                <span className="text-[10px] text-slate-400 font-semibold shrink-0">{b.since}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="flex justify-center mb-2"><Emoji3D e="👻" size={36} /></div>
                            <p className="text-sm font-bold text-slate-400">Belum ada teman di sini</p>
                            <p className="text-xs text-slate-300 font-semibold">Jadi yang pertama!</p>
                          </div>
                        )}
                        <div className="border-t border-slate-100 pt-3 space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status-mu</p>
                          <input value={myStatus} onChange={e => setMyStatus(e.target.value)}
                            placeholder="e.g. Join yuk sampai jam 5! 📚"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-violet-400" />
                          <button onClick={() => handleJoinBuddy(selected.id)}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-black transition-all ${isMyBuddy ? "bg-emerald-500 text-white" : "bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:scale-[1.02] shadow-lg"}`}>
                            {isMyBuddy ? <>✅ Lagi belajar di sini — Keluar?</> : <><Emoji3D e="👥" size={16} /> Tandai Lagi Belajar di Sini</>}
                          </button>
                        </div>
                      </div>
                    )}
                    {activeTab === "rekomendasi" && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kenapa direkomendasikan?</p>
                        {rec ? (
                          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-3.5 space-y-2">
                            <div className="flex items-center gap-2">
                              <Emoji3D e="🎯" size={22} />
                              <p className="text-xs font-black text-violet-800">{rec.reason}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 font-semibold">Skor:</span>
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full" style={{ width: `${rec.score}%` }} />
                              </div>
                              <span className="text-xs font-black text-violet-600">{rec.score}%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-3">
                            <div className="flex justify-center mb-1"><Emoji3D e="🤷" size={36} /></div>
                            <p className="text-xs text-slate-400 font-semibold">Belum ada rekomendasi khusus</p>
                          </div>
                        )}
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pt-1">Rekomen lainnya</p>
                        {topRec.filter(r => r.locId !== selected.id).slice(0, 2).map(r => {
                          const l = recLoc(r.locId)
                          if (!l) return null
                          return (
                            <button key={r.locId} onClick={() => { setSelected(l); setActiveTab("info") }}
                              className="w-full flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl p-3 transition-all text-left">
                              <Emoji3D e={l.emoji} size={26} />
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-slate-800 text-[12px] truncate">{l.name}</p>
                                <p className="text-[10px] text-slate-500 font-semibold truncate">{r.reason}</p>
                              </div>
                              <span className="text-[10px] font-black text-violet-500 shrink-0">{r.score}%</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* ── STATUS BAR ── */}
        <div className="px-7 py-3 bg-white border-t border-slate-100 flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full ${userProfile.avatarColor} flex items-center justify-center text-white text-[10px] font-black shrink-0`}>
            {userProfile.avatar}
          </div>
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">{userProfile.name}:</span>
          <input value={globalStatus} onChange={e => setGlobalStatus(e.target.value)}
            onKeyDown={e => e.key === "Enter" && updateGlobalStatus()}
            placeholder="Lagi belajar apa sekarang? Bagikan ke teman..."
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-violet-400" />
          <button onClick={updateGlobalStatus}
            className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-black px-4 py-2 rounded-xl transition-all whitespace-nowrap">
            Update
          </button>
        </div>

        {/* 
          ── BOTTOM CARDS ──
          PERUBAHAN 2: Dari horizontal scroll yang panjang → grid 2 baris yang pas di layar
          Rekomendasi di baris atas (3 cards), semua lokasi di baris bawah (grid)
        */}
        <div className="px-7 py-3 space-y-3">
          {/* Baris rekomendasi */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1"><Emoji3D e="🎯" size={14} /> Rekomendasi untukmu</p>
            <div className="grid grid-cols-3 gap-3">
              {topRec.map(r => {
                const l = recLoc(r.locId)
                if (!l) return null
                const cm = CROWD_META[l.crowd]
                const buddyCount = locBuddies(l.id).length
                return (
                  <button key={`rec-${r.locId}`} onClick={() => { setSelected(l); setActiveTab("rekomendasi") }}
                    className={`bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl p-3 shadow border-2 transition-all hover:scale-[1.02] text-left relative ${selected?.id === l.id ? "border-violet-400" : "border-violet-200"}`}>
                    <div className="absolute top-2 right-2 text-[9px] font-black text-violet-500 bg-violet-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Emoji3D e="🎯" size={10} /> {r.score}%</div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Emoji3D e={l.emoji} size={26} />
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cm.color }} />
                      {buddyCount > 0 && <span className="text-[10px] text-emerald-600 font-black">👥{buddyCount}</span>}
                    </div>
                    <p className="font-black text-slate-800 text-[11px] leading-snug line-clamp-1">{l.name}</p>
                    <p className="text-[10px] text-violet-600 font-semibold mt-0.5 line-clamp-2 leading-tight">{r.reason}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Baris semua lokasi — grid yang pas */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1"><Emoji3D e="📍" size={14} /> Semua Lokasi ({filtered.length})</p>
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
              {filtered.map(loc => {
                const cm = CROWD_META[loc.crowd]
                const buddyCount = locBuddies(loc.id).length
                return (
                  <button key={loc.id} onClick={() => { setSelected(loc); setActiveTab("info") }}
                    className={`bg-white rounded-2xl p-3 shadow border-2 transition-all hover:scale-[1.02] text-left ${selected?.id === loc.id ? "border-violet-400" : "border-transparent"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <Emoji3D e={loc.emoji} size={26} />
                      <div className="flex items-center gap-1">
                        {favorites.has(loc.id) && <Emoji3D e="⭐" size={14} />}
                        {loc.addedBy && <span className="text-[9px] text-violet-400 font-black">👤</span>}
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cm.color }} />
                      </div>
                    </div>
                    <p className="font-black text-slate-800 text-[11px] leading-snug line-clamp-2">{loc.name}</p>
                    {loc.addedBy && <p className="text-[9px] text-violet-500 font-semibold mt-0.5 truncate">oleh {loc.addedBy.name}</p>}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: cm.color }}><Emoji3D e={CROWD_EMOJI[loc.crowd]} size={11} /> {cm.label}</span>
                      {buddyCount > 0 && <span className="text-[10px] text-emerald-600 font-bold">👥 {buddyCount}</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {showAddModal && <AddLocationModal onClose={() => setShowAddModal(false)} onSubmit={handleAddLocation} userProfile={userProfile} />}
      {showSecretModal && <ShareSecretModal onClose={() => setShowSecretModal(false)} onSubmit={handleShareSecret} />}
    </div>
  )
}