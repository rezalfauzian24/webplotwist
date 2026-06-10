'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, CalendarDays, ClipboardList,
  Sun, Heart, BookOpen, Map, UserCircle, Menu, X
} from 'lucide-react'
import PlottwistPro from '@/components/PlottwistPro'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar', label: 'Kalender', icon: CalendarDays },
  { href: '/tugas', label: 'Tugas', icon: ClipboardList },
  { href: '/harian', label: 'Harian', icon: Sun },
  { href: '/kesehatan', label: 'Kesehatan', icon: Heart },
  { href: '/edukasi', label: 'Edukasi', icon: BookOpen },
  { href: '/maps', label: 'Maps', icon: Map },
  { href: '/profile', label: 'Account', icon: UserCircle },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavLinks = () => (
    <>
      {menuItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200
              ${isActive
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-200'
                : 'text-gray-500 hover:bg-purple-50 hover:text-purple-600'
              }`}
          >
            <Icon size={20} className={isActive ? 'text-white' : 'text-purple-400'} />
            {label}
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex w-[260px] h-screen sticky top-0 bg-white shadow-xl flex-col overflow-y-auto overflow-x-hidden">
        <div className="p-6 flex flex-col min-h-full">
          <div className="mb-8 h-16 flex items-center flex-shrink-0">
            <img src="https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/23.png" alt="Plotwist" className="h-full w-auto object-contain" style={{ mixBlendMode: 'multiply' }} />
          </div>
          <nav className="flex flex-col gap-1 flex-shrink-0">
            <NavLinks />
          </nav>
          <div className="mt-4 flex-shrink-0">
            <PlottwistPro />
          </div>
          <div className="mt-6 flex justify-center items-end min-h-[120px] flex-shrink-0">
            <img src="https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/maskotwebsite.png" alt="Maskot Plotwist" className="h-full w-auto object-contain object-bottom" />
          </div>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm flex items-center justify-between px-4 py-3">
        <img src="https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/23.png" alt="Plotwist" className="h-8 w-auto object-contain" style={{ mixBlendMode: 'multiply' }} />
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl text-purple-600 hover:bg-purple-50">
          <Menu size={24} />
        </button>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          {/* Panel */}
          <div className="relative w-[260px] h-full bg-white shadow-xl flex flex-col overflow-y-auto z-10">
            <div className="p-6 flex flex-col min-h-full">
              <div className="mb-6 flex items-center justify-between">
                <img src="https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/23.png" alt="Plotwist" className="h-10 w-auto object-contain" style={{ mixBlendMode: 'multiply' }} />
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                <NavLinks />
              </nav>
              <div className="mt-4">
                <PlottwistPro />
              </div>
              <div className="mt-6 flex justify-center items-end min-h-[100px]">
                <img src="https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/maskotwebsite.png" alt="Maskot Plotwist" className="h-full w-auto object-contain object-bottom" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}