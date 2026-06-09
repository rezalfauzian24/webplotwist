'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Sun,
  Heart,
  BookOpen,
  Map,
  UserCircle,
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

  return (
    <aside className="w-[260px] h-screen sticky top-0 bg-white shadow-xl flex flex-col overflow-y-auto overflow-x-hidden">
      
      <div className="p-6 flex flex-col min-h-full">

        {/* LOGO */}
        <div className="mb-8 h-16 flex items-center flex-shrink-0">
          <img
            src="/23.png"
            alt="Plotwist"
            className="h-full w-auto object-contain"
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>

        {/* MENU */}
        <nav className="flex flex-col gap-1 flex-shrink-0">
          {menuItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + '/')

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-200'
                      : 'text-gray-500 hover:bg-purple-50 hover:text-purple-600'
                  }`}
              >
                <Icon
                  size={20}
                  className={
                    isActive ? 'text-white' : 'text-purple-400'
                  }
                />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* PLOTWIST PRO */}
        <div className="mt-4 flex-shrink-0">
          <PlottwistPro />
        </div>

        {/* MASKOT */}
        <div className="mt-6 flex justify-center items-end min-h-[120px] flex-shrink-0">
          <img
            src="/maskotwebsite.png"
            alt="Maskot Plotwist"
            className="h-full w-auto object-contain object-bottom"
          />
        </div>

      </div>
    </aside>
  )
}