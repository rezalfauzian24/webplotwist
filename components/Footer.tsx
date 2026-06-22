import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="pw-footer">
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
            Mulai Produktif di Plotwist
          </Link>
        </div>

        {/* KOLOM 2: Navigasi */}
        <div>
          <p className="pw-col-title">Navigasi</p>
          <ul className="pw-nav-list">
            {[
              { href: "/dashboard",   label: "Dashboard"   },
              { href: "/kalender",    label: "Kalender"    },
              { href: "/tugas",       label: "Tugas"       },
              { href: "/harian",      label: "Harian"      },
              { href: "/kesehatan",   label: "Kesehatan"   },
              { href: "/edukasi",     label: "Edukasi"     },
              { href: "/maps",        label: "Maps"        },
              { href: "/account",     label: "Account"     },
              { href: "/pet-academy", label: "Pet Academy" },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="pw-nav-link">
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
              <span className="ci">Lokasi:</span>
              <span>Sukabumi, Jawa Barat, Indonesia</span>
            </li>
            <li>
              <span className="ci">Email:</span>
              <a href="mailto:plotwistofficialid@gmail.com" className="pw-contact-link">plotwistofficialid@gmail.com</a>
            </li>
            <li>
              <span className="ci">Instagram:</span>
              <a href="https://instagram.com/plotwist.id_" target="_blank" rel="noreferrer" className="pw-contact-link">@plotwist.id_</a>
            </li>
          </ul>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="pw-footer-bottom">
        <p className="pw-copyright">
          &copy; 2026 <strong>PLOTWIST.MY.ID</strong>. All rights reserved.
        </p>
        <div className="pw-badge">
          Made with love in Indonesia
        </div>
      </div>

    </footer>
  );
}