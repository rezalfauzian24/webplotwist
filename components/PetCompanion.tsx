'use client'

import { useActivePet } from '@/hooks/useActivePet'
import { Zap } from 'lucide-react'

// ─── Varian tampilan ──────────────────────────────────────────────────────────
type Variant = 'floating' | 'inline' | 'banner'

interface PetCompanionProps {
  variant?: Variant
  message?: string   // pesan kustom dari halaman masing-masing
}

export default function PetCompanion({
  variant = 'floating',
  message,
}: PetCompanionProps) {
  const { activePet } = useActivePet()

  // ── Floating: pojok kanan bawah (cocok untuk Harian, Tugas, Kesehatan) ──────
  if (variant === 'floating') {
    return (
      <div
        className="fixed bottom-20 right-4 z-40 flex items-end gap-2"
        style={{ filter: `drop-shadow(0 4px 12px ${activePet.glow}55)` }}
      >
        {message && (
          <div
            className="mb-2 max-w-[180px] rounded-2xl rounded-br-none px-3 py-2 text-[11px] font-medium text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${activePet.color}, ${activePet.glow})` }}
          >
            {message}
          </div>
        )}
        <img
          src={activePet.src}
          alt={activePet.name}
          className="h-16 w-16 animate-float object-contain"
          style={{ filter: `drop-shadow(0 0 8px ${activePet.glow}99)` }}
        />
      </div>
    )
  }

  // ── Inline: banner kecil di atas konten (cocok untuk Edukasi, Statistik) ───
  if (variant === 'inline') {
    return (
      <div
        className="mb-4 flex items-center gap-3 rounded-2xl border p-3"
        style={{
          borderColor: `${activePet.glow}44`,
          background: `linear-gradient(135deg, ${activePet.color}11, ${activePet.glow}11)`,
        }}
      >
        <img
          src={activePet.src}
          alt={activePet.name}
          className="h-10 w-10 animate-float object-contain"
          style={{ filter: `drop-shadow(0 0 6px ${activePet.glow}88)` }}
        />
        <div className="flex-1">
          <p className="text-xs font-black text-gray-800">{activePet.name}</p>
          <p className="text-[10px] text-gray-400">{message ?? activePet.desc}</p>
        </div>
        <div
          className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold text-white"
          style={{ background: `linear-gradient(90deg, ${activePet.color}, ${activePet.glow})` }}
        >
          <Zap size={9} />
          {activePet.trait}
        </div>
      </div>
    )
  }

  // ── Banner: header halaman (cocok untuk Pencapaian) ───────────────────────
  return (
    <div
      className="relative mb-6 overflow-hidden rounded-3xl border-2 p-5"
      style={{
        borderColor: activePet.glow,
        boxShadow: `0 0 30px ${activePet.glow}33`,
        background: `linear-gradient(135deg, ${activePet.color}22, ${activePet.glow}11)`,
      }}
    >
      <div className="flex items-center gap-4">
        <img
          src={activePet.src}
          alt={activePet.name}
          className="h-20 w-20 animate-float object-contain"
          style={{ filter: `drop-shadow(0 0 12px ${activePet.glow}cc)` }}
        />
        <div>
          <p className="text-lg font-black text-gray-800">{activePet.name}</p>
          <p className="text-xs text-gray-500">{message ?? activePet.desc}</p>
          <div
            className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold text-white"
            style={{ background: `linear-gradient(90deg, ${activePet.color}, ${activePet.glow})` }}
          >
            <Zap size={9} />
            {activePet.trait}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Contoh penggunaan di tiap halaman ──────────────────────────────────────

// Halaman Harian:
<PetCompanion variant="floating" message="Yuk mulai rutinitas hari ini! 🌟" />

// Halaman Edukasi:
<PetCompanion variant="inline" message="Aku siap menemani belajarmu!" />

// Halaman Pencapaian:
<PetCompanion variant="banner" message="Lihat semua pencapaian kerenmu!" />

// Halaman Tugas (tanpa message — pakai desc default pet):
<PetCompanion variant="floating" />

─────────────────────────────────────────────────────────────────────────────── */