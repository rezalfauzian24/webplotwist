'use client'

import { useEffect, useState } from 'react'

interface Props {
  trigger: boolean          // set true untuk memunculkan popup
  mode?: 'celebrate' | 'levelup'
  onDone?: () => void       // callback setelah animasi selesai
}

export default function MascotPopup({ trigger, mode = 'celebrate', onDone }: Props) {
  const [visible, setVisible] = useState(false)
  const [animOut, setAnimOut] = useState(false)

  useEffect(() => {
    if (!trigger) return
    setVisible(true)
    setAnimOut(false)

    // Mulai animasi keluar setelah 2.5 detik
    const t1 = setTimeout(() => setAnimOut(true), 2500)
    // Hilang total setelah 3 detik
    const t2 = setTimeout(() => {
      setVisible(false)
      onDone?.()
    }, 3000)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [trigger])

  if (!visible) return null

  const img   = mode === 'levelup' ? 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/14.png' : 'https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/16.png'
  const title = mode === 'levelup' ? '🎓 Level Up!' : '🎉 Keren banget!'
  const desc  = mode === 'levelup'
    ? 'Kamu udah fokus 5 jam! Plowie naik level!'
    : 'Sesi selesai! Plowie bangga sama kamu!'

  return (
    <>
      {/* Overlay gelap */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 9998,
          opacity: animOut ? 0 : 1,
          transition: 'opacity 0.5s ease',
        }}
        onClick={() => { setAnimOut(true); setTimeout(() => { setVisible(false); onDone?.() }, 500) }}
      />

      {/* Pop-up maskot */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: animOut
            ? 'translate(-50%, -50%) scale(0.5)'
            : 'translate(-50%, -50%) scale(1)',
          opacity: animOut ? 0 : 1,
          transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease',
          zIndex: 9999,
          background: 'white',
          borderRadius: 28,
          padding: '32px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          minWidth: 280,
          boxShadow: '0 20px 60px rgba(127,119,221,0.3)',
          animation: animOut ? 'none' : 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Konfeti */}
        <div style={{ position: 'absolute', top: 12, fontSize: 22, letterSpacing: 8 }}>
          🎊✨🎉✨🎊
        </div>

        {/* Gambar maskot */}
        <img
          src={img}
          alt="Maskot Plowie"
          style={{
            width: 160,
            height: 160,
            objectFit: 'contain',
            animation: 'mascotJump 0.6s ease-in-out infinite alternate',
            marginTop: 16,
          }}
        />

        {/* Teks */}
        <p style={{ fontSize: 22, fontWeight: 800, color: '#3C3489', margin: 0 }}>{title}</p>
        <p style={{ fontSize: 13, color: '#888', textAlign: 'center', margin: 0 }}>{desc}</p>

        {/* Tombol tutup */}
        <button
          onClick={() => { setAnimOut(true); setTimeout(() => { setVisible(false); onDone?.() }, 500) }}
          style={{
            marginTop: 8,
            padding: '8px 28px',
            borderRadius: 20,
            border: 'none',
            background: 'linear-gradient(90deg, #7F77DD, #D4537E)',
            color: 'white',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Yeay! 🙌
        </button>
      </div>

      <style>{`
        @keyframes popIn {
          0%   { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
        }
        @keyframes mascotJump {
          0%   { transform: translateY(0) rotate(-3deg); }
          100% { transform: translateY(-12px) rotate(3deg); }
        }
      `}</style>
    </>
  )
}