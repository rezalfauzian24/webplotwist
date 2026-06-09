import { createServerClient } from '@supabase/ssr'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export default async function middleware(req) {
  const res = NextResponse.next()

  // 1. Ambil token Next-Auth
  const nextAuthToken = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // 2. Inisialisasi Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Ambil sesi Supabase
  const { data: { session: supabaseSession } } = await supabase.auth.getSession()

  // 4. Cek status login
  const isLoggedIn = !!nextAuthToken || !!supabaseSession
  const { pathname } = req.nextUrl

  // KONDISI 1: Jika belum login dan mencoba masuk ke halaman utama (/) atau /dashboard
  if ((pathname === '/' || pathname.startsWith('/dashboard')) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // KONDISI 2: Jika sudah login tapi mencoba mengakses halaman /login atau /register
  const isLogoutRedirect = req.nextUrl.searchParams.get('logout') === 'true'

  if ((pathname === '/login' || pathname === '/register') && isLoggedIn && !isLogoutRedirect) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/register'],
}