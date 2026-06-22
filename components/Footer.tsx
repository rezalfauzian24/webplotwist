import Image from "next/image";
import Link from "next/link";

/* ── 3D EMOJI SYSTEM ────────────────────────────────────────────────────
   Pakai Fluent Emoji 3D (Microsoft, open-source) via jsDelivr CDN.
   Jauh lebih glossy & bervolume dibanding emoji bawaan HP/OS.
   Kalau CDN gagal load, fallback otomatis ke native emoji dengan
   drop-shadow supaya tetap terasa "berbeda".
------------------------------------------------------------------------- */
const EMOJI_3D_MAP: Record<string, string> = {
  "🚀": "Rocket",
  "🗂️": "Card index dividers",
  "📅": "Calendar",
  "✅": "Check mark button",
  "🌤️": "Sun behind small cloud",
  "❤️": "Red heart",
  "📖": "Open book",
  "🗺️": "World map",
  "👤": "Bust in silhouette",
  "🐾": "Paw prints",
  "📍": "Round pushpin",
  "✉️": "Envelope",
  "📸": "Camera with flash",
  "🛡️": "Shield",
  "♥": "Red heart",
}

function emoji3dUrl(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "_")
  return `https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/${name}/3D/${slug}_3d.png`
}

interface Emoji3DProps {
  e: string
  size?: number
  className?: string
  style?: React.CSSProperties
}

function Emoji3D({ e, size = 22, className = "", style }: Emoji3DProps) {
  const mapped = EMOJI_3D_MAP[e]

  if (mapped) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={emoji3dUrl(mapped)}
        alt={e}
        draggable={false}
        width={size}
        height={size}
        className={`inline-block align-middle select-none ${className}`}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.30))",
          ...style,
        }}
        onError={(ev) => {
          // Fallback: hide img, show emoji span sibling
          const img = ev.currentTarget
          img.style.display = "none"
          const span = img.nextElementSibling as HTMLElement | null
          if (span) span.style.display = "inline"
        }}
      />
    )
  }

  // Native emoji fallback (also used as hidden backup for img above)
  return (
    <span
      className={`inline-block align-middle select-none ${className}`}
      style={{
        fontSize: size * 0.9,
        lineHeight: 1,
        filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))",
        ...style,
      }}
    >
      {e}
    </span>
  )
}

/* Pasangan img + span fallback tersembunyi */
function Emoji3DSafe({ e, size = 22, className = "" }: Emoji3DProps) {
  const mapped = EMOJI_3D_MAP[e]
  if (!mapped) return <Emoji3D e={e} size={size} className={className} />
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={emoji3dUrl(mapped)}
        alt={e}
        draggable={false}
        width={size}
        height={size}
        className={`inline-block align-middle select-none ${className}`}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.30))",
        }}
        onError={(ev) => {
          ev.currentTarget.style.display = "none";
          const sib = ev.currentTarget.nextElementSibling as HTMLElement | null
          if (sib) sib.style.display = "inline"
        }}
      />
      <span
        className={`inline-block align-middle select-none ${className}`}
        style={{
          fontSize: size * 0.9,
          lineHeight: 1,
          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))",
          display: "none",
        }}
      >
        {e}
      </span>
    </>
  )
}
/* ───────────────────────────────────────────────────────────────────── */

export default function Footer() {
  return (
    <footer className="pw-footer">
      {/* Dekorasi orb */}
      <div className="pw-orb1" />
      <div className="pw-orb2" />

      <div className="pw-footer-top">

        {/* KOLOM 1: Logo + Deskripsi + CTA */}
        <div className="pw-logo-area">
          <div className="pw-logo-wrap">
            <Image
              src="https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/23.png"
              alt="Plotwist Logo"
              width={160}
              height={42}
              className="pw-logo-img"
              priority
            />
          </div>
          <p className="pw-tagline">
            Plotwist.my.id adalah asisten produktivitas digital interaktif yang
            dirancang untuk membantu pelajar dan mahasiswa serta kreator tetap fokus, konsisten,
            dan terhindar dari rabbit hole dunia maya. Ubah rutinitas harianmu
            menjadi petualangan!
          </p>
          <Link href="/dashboard" className="pw-cta-btn">
            <Emoji3DSafe e="🚀" size={20} />
            {" "}Mulai Produktif di Plotwist
          </Link>
        </div>

        {/* KOLOM 2: Navigasi */}
        <div>
          <p className="pw-col-title">Navigasi</p>
          <ul className="pw-nav-list">
            {[
              { href: "/dashboard",   icon: "🗂️",  label: "Dashboard"   },
              { href: "/kalender",    icon: "📅",  label: "Kalender"    },
              { href: "/tugas",       icon: "✅",  label: "Tugas"       },
              { href: "/harian",      icon: "🌤️", label: "Harian"      },
              { href: "/kesehatan",   icon: "❤️",  label: "Kesehatan"   },
              { href: "/edukasi",     icon: "📖",  label: "Edukasi"     },
              { href: "/maps",        icon: "🗺️",  label: "Maps"        },
              { href: "/account",     icon: "👤",  label: "Account"     },
              { href: "/pet-academy", icon: "🐾",  label: "Pet Academy" },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="pw-nav-link">
                  <Emoji3DSafe e={item.icon} size={20} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* KOLOM 3: Kontak */}
        <div>
          <p className="pw-col-title">Hubungi Kami</p>
          <ul className="pw-contact-list">
            <li>
              <span className="ci">
                <Emoji3DSafe e="📍" size={20} />
              </span>
              <span>Sukabumi, Jawa Barat, Indonesia</span>
            </li>
            <li>
              <span className="ci">
                <Emoji3DSafe e="✉️" size={20} />
              </span>
              <a href="mailto:plotwistofficialid@gmail.com" className="pw-contact-link">
                plotwistofficialid@gmail.com
              </a>
            </li>
            <li>
              <span className="ci">
                <Emoji3DSafe e="📸" size={20} />
              </span>
              <a
                href="https://instagram.com/plotwist.id_"
                target="_blank"
                rel="noopener noreferrer"
                className="pw-contact-link"
              >
                @plotwist.id_
              </a>
            </li>
          </ul>
        </div>

      </div>{/* end pw-footer-top */}

      {/* BOTTOM BAR */}
      <div className="pw-footer-bottom">
        <p className="pw-copyright">
          © 2026 <strong>PLOTWIST.MY.ID</strong>. All rights reserved.
        </p>
        <div className="pw-badge">
          <Emoji3DSafe e="🛡️" size={18} />
          {" "}Made with{" "}
          <Emoji3DSafe e="❤️" size={16} />
          {" "}in Indonesia
        </div>
      </div>

    </footer>
  )
}