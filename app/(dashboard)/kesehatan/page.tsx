"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── 3D Emoji renderer (inline-style, no Tailwind dependency) ─────────────────
const EMOJI_3D_BASE = 'https://cdn.jsdelivr.net/gh/ehne/fluentui-twemoji-3d/export/3D_png';

function toEmojiCodepoint(emoji: string): string {
  return Array.from(emoji)
    .map(ch => (ch.codePointAt(0) ?? 0).toString(16))
    .join('-');
}

function Emoji3D({ e, size = 18, style }: { e: string; size?: number; style?: React.CSSProperties }) {
  const [failed, setFailed] = useState(false);
  const imgStyle: React.CSSProperties = {
    display: 'inline-block',
    width: size,
    height: size,
    minWidth: size,
    verticalAlign: 'middle',
    userSelect: 'none',
    ...style,
  };
  if (failed) {
    return <span style={{ fontSize: size * 0.8, lineHeight: 1, ...style }}>{e}</span>;
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
      style={imgStyle}
    />
  );
}

// ─── Types & Data ──────────────────────────────────────────────────────────────

interface StreakState { air: boolean; tidur: boolean; gerak: boolean; }

const IDEAL_SLEEP = 8;
const sleepData = [
  { day: 'Sen', hours: 5.5 }, { day: 'Sel', hours: 7 }, { day: 'Rab', hours: 4 },
  { day: 'Kam', hours: 6.5 }, { day: 'Jum', hours: 3.5 }, { day: 'Sab', hours: 9 },
  { day: 'Min', hours: 6 },
];

const moodFoodMap: Record<string, { emoji: string; title: string; desc: string; avoid: string }> = {
  Ambis:  { emoji: '🍫', title: 'Dark Chocolate & Kacang Almond', desc: 'Boost dopamin + fokus tanpa crash gula.', avoid: 'Hindari: Energy drink & mie instan' },
  Stres:  { emoji: '🍓', title: 'Buah Segar & Yogurt', desc: 'Vitamin C turunkan kortisol. Bukan seblak level 10!', avoid: 'Hindari: Gorengan & kopi berlebih' },
  Capek:  { emoji: '🍌', title: 'Pisang & Oatmeal', desc: 'Karbohidrat kompleks = energi tahan lama.', avoid: 'Hindari: Sugar rush dari minuman manis' },
  Senang: { emoji: '🥗', title: 'Salad Sayur & Telur Rebus', desc: 'Jaga mood tetap stabil dengan protein & serat.', avoid: 'Reward boleh, tapi jangan kebablasan!' },
  Flat:   { emoji: '☕', title: 'Kopi + Protein Bar', desc: 'Dopamin booster ringan buat bangkit dari zombie mode.', avoid: 'Hindari: Skip makan siang' },
};

const napDurations = [
  { label: '10 Menit', seconds: 600 },
  { label: '15 Menit', seconds: 900 },
  { label: '20 Menit', seconds: 1200 },
];

const healthQuotes = [
  "IPK tinggi nggak ada gunanya kalau ginjalmu protes.",
  "Istirahat bukan tanda menyerah — itu strategi buat menang.",
  "Tubuhmu bukan mesin. Bahkan mesin pun butuh perawatan.",
  "Tidur 8 jam bukan pemborosan, itu investasi otak.",
  "Kafein bisa nemenin begadang, tapi nggak bisa gantiin tidur.",
  "Gerak 10 menit sehari lebih baik dari niat 1 jam yang nggak pernah jadi.",
  "Pikiran jernih dimulai dari badan yang nggak minta tolong.",
  "Produktivitas sejati = fokus yang diperbaharui, bukan sesi marathon.",
];

const romanticMessages = [
  { emoji: '🍚', msg: 'Hei kamu... udah makan belum hari ini? Nasi hangat nunggu lho.' },
  { emoji: '💧', msg: 'Eh, kapan terakhir minum air? Bukan kopi ya, tapi air beneran 🥹' },
  { emoji: '🌙', msg: 'Udah malem, badan kamu minta tidur. Dengerin dia ya.' },
  { emoji: '🤗', msg: 'Kamu udah kerja keras banget hari ini. Boleh bangga sama diri sendiri.' },
  { emoji: '🍊', msg: 'Vitamin C-nya udah diminum? Imunmu juga perlu kasih sayang.' },
  { emoji: '🧘', msg: 'Napas dulu. Pelan-pelan. Lima detik masuk, lima detik keluar.' },
  { emoji: '🕐', msg: 'Udah berapa jam duduk? Berdiri bentar, kaki kamu mau protes.' },
  { emoji: '💆', msg: 'Pundak kamu tegang banget tuh. Boleh istirahat 5 menit kok.' },
  { emoji: '🌟', msg: 'Reminder: kamu manusia, bukan robot. Self-care itu wajib.' },
  { emoji: '🍵', msg: 'Teh hangat + jeda 10 menit > 3 jam kerja sambil stress.' },
  { emoji: '🫶', msg: 'Kamu lagi berjuang sendirian? Nggak perlu. Boleh minta bantuan.' },
  { emoji: '🌿', msg: 'Mata kamu butuh hijau-hijauan. Lihat tanaman atau langit bentar.' },
  { emoji: '🥚', msg: 'Sarapan udah? Otak nggak bisa kerja dengan perut kosong, sayang.' },
  { emoji: '🎵', msg: 'Putar lagu favorit kamu sekarang. Dopamin gratis, gaada salahnya.' },
  { emoji: '😴', msg: 'Ngantuk itu sinyal, bukan kelemahan. Tubuhmu lagi minta tolong.' },
  { emoji: '🏃', msg: 'Udah gerak hari ini? Jalan kaki 10 menit aja cukup kok.' },
  { emoji: '🌅', msg: 'Selamat pagi! Udah kena sinar matahari belum? Gratis dan bagus.' },
  { emoji: '🫁', msg: 'Tarik napas dalam-dalam... tahan... dan lepas. Enak kan?' },
  { emoji: '💪', msg: 'Apapun yang kamu hadapi hari ini, kamu mampu. Percaya.' },
  { emoji: '🍇', msg: 'Kapan terakhir makan buah? Tubuh kamu kangen antioksidan.' },
  { emoji: '🛁', msg: 'Mandi air hangat malam ini bisa bantu tidur lebih nyenyak lho.' },
  { emoji: '📵', msg: 'HP-nya taruh dulu. 30 menit tanpa layar = hadiah buat mata kamu.' },
  { emoji: '🤲', msg: 'Kalau lagi overwhelmed, tulis apa yang kamu syukuri. Tiga aja.' },
  { emoji: '🌸', msg: 'Kamu udah cukup baik. Nggak perlu sempurna, cukup terus maju.' },
];

const MAX_COFFEE = 4;
const CAFFEINE_WARNINGS: Record<number, string> = {
  2: 'Sudah 2 cangkir. Mulai pelan ya, jantungmu bukan drum.',
  3: 'Tiga cangkir! Satu lagi dan kamu resmi jadi kopi berjalan.',
  4: 'Dosis kafein sudah cukup! Jantungmu bukan mesin jet.',
  5: 'STOP. Cukup sudah. Minum air putih sekarang!',
};

const vibeZones = [
  { xRange: [50,100], yRange: [0,50],   label: 'Kewalahan 😵', emoji: '😵', advice: 'Kamu lagi cemas dan tegang. Coba Box Breathing dulu, baru balik ke tugas.', color: '#E53E3E', bg: '#FFF5F5', border: '#FED7D7' },
  { xRange: [0,50],   yRange: [0,50],   label: 'Produktif 😤', emoji: '😤', advice: 'Mood pas banget! Kerjain tugas terberatmu sekarang.',                        color: '#276749', bg: '#F0FFF4', border: '#C6F6D5' },
  { xRange: [0,50],   yRange: [50,100], label: 'Santai 😌',    emoji: '😌', advice: 'Tenang tapi kurang tenaga. Minum air, dengerin musik, pelan-pelan.',         color: '#553C9A', bg: '#FAF5FF', border: '#E9D8FD' },
  { xRange: [50,100], yRange: [50,100], label: 'Burnout 😶',   emoji: '😶', advice: 'Kamu kelelahan. Aktifkan Victory Nap atau SOS sekarang!',                   color: '#4A5568', bg: '#F7FAFC', border: '#E2E8F0' },
];

const breathPhases = [
  { label: 'Tarik Napas',  duration: 4, color: '#3182CE', bg: '#EBF8FF', instruction: 'Tarik napas perlahan lewat hidung...' },
  { label: 'Tahan',        duration: 4, color: '#553C9A', bg: '#FAF5FF', instruction: 'Tahan napas, relakskan bahu...' },
  { label: 'Buang Napas',  duration: 4, color: '#2F855A', bg: '#F0FFF4', instruction: 'Buang napas perlahan lewat mulut...' },
  { label: 'Tahan',        duration: 4, color: '#C05621', bg: '#FFFAF0', instruction: 'Tahan napas, persiapkan diri...' },
];

const stretchMoves = [
  { name: 'Leher Kanan-Kiri', duration: 30, emoji: '🧠', instruction: 'Miringkan kepala ke kanan, tahan 5 detik, lalu ke kiri. Ulangi 3x.', animClass: 'neck' },
  { name: 'Bahu Roll',        duration: 30, emoji: '💪', instruction: 'Putar bahu ke belakang 5x, lalu ke depan 5x. Rasakan ketegangannya lepas.', animClass: 'shoulder' },
  { name: 'Pergelangan',      duration: 30, emoji: '🤲', instruction: 'Putar pergelangan tangan 5x searah jarum jam, lalu berlawanan.', animClass: 'wrist' },
  { name: 'Punggung Tegak',   duration: 30, emoji: '🦴', instruction: 'Duduk tegak, dada terbuka, tahan 10 detik. Perbaiki postur!', animClass: 'back' },
  { name: 'Kaki & Betis',     duration: 30, emoji: '🦵', instruction: 'Angkat tumit, tahan 3 detik, turunkan. Ulangi 10x per kaki.', animClass: 'leg' },
];

const mascotAccessories = ['', '🕶️', '🎧', '👑'];
const mascotNames = ['Biru si Penguin', 'Biru si Kacamata', 'Biru si Headphone', 'Biru — Level Legenda'];

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function getVibeZone(x: number, y: number) {
  return vibeZones.find(z => x >= z.xRange[0] && x < z.xRange[1] && y >= z.yRange[0] && y < z.yRange[1]) ?? vibeZones[2];
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch { return initialValue; }
  });
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const v = value instanceof Function ? value(storedValue) : value;
      setStoredValue(v);
      if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(v));
    } catch (e) { console.error(e); }
  }, [key, storedValue]);
  return [storedValue, setValue] as const;
}

const C = {
  pageBg: '#F0F2F5', card: '#FFFFFF', border: '#E8ECF0',
  text: '#1A202C', muted: '#4A5568', hint: '#A0AEC0',
  green: '#38A169', greenBg: '#F0FFF4', greenBd: '#C6F6D5',
  purple: '#6B46C1', purpleBg: '#FAF5FF', purpleBd: '#E9D8FD',
  blue: '#3182CE', blueBg: '#EBF8FF', blueBd: '#BEE3F8',
  orange: '#DD6B20', orangeBg: '#FFFAF0', orangeBd: '#FEEBC8',
  red: '#E53E3E', redBg: '#FFF5F5', redBd: '#FED7D7',
  pink: '#D53F8C', pinkBg: '#FFF5F7', pinkBd: '#FED7E2',
  teal: '#2C7A7B', tealBg: '#E6FFFA', tealBd: '#81E6D9',
  amber: '#B7791F', amberBg: '#FFFFF0', amberBd: '#FAF089',
};

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  .kes-root *, .kes-root *::before, .kes-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .kes-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: ${C.pageBg};
    color: ${C.text};
    min-height: 100vh;
  }
  .kes-root ::-webkit-scrollbar { width: 4px; }
  .kes-root ::-webkit-scrollbar-thumb { background: #CBD5E0; border-radius: 4px; }

  .kes-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 18px;
    padding: 20px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  .kb { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:700; padding:3px 9px; border-radius:20px; letter-spacing:0.04em; }
  .kb-green  { background:${C.greenBg};  color:${C.green};  border:1px solid ${C.greenBd}; }
  .kb-purple { background:${C.purpleBg}; color:${C.purple}; border:1px solid ${C.purpleBd}; }
  .kb-blue   { background:${C.blueBg};   color:${C.blue};   border:1px solid ${C.blueBd}; }
  .kb-orange { background:${C.orangeBg}; color:${C.orange}; border:1px solid ${C.orangeBd}; }
  .kb-red    { background:${C.redBg};    color:${C.red};    border:1px solid ${C.redBd}; }
  .kb-pink   { background:${C.pinkBg};   color:${C.pink};   border:1px solid ${C.pinkBd}; }
  .kb-teal   { background:${C.tealBg};   color:${C.teal};   border:1px solid ${C.tealBd}; }
  .kb-amber  { background:${C.amberBg};  color:${C.amber};  border:1px solid ${C.amberBd}; }
  .kb-gray   { background:#F7FAFC; color:#718096; border:1px solid #E2E8F0; }

  .kbtn { cursor:pointer; font-family:inherit; font-weight:700; border:none; outline:none; transition:all 0.18s; border-radius:10px; display:inline-flex; align-items:center; justify-content:center; gap:6px; }
  .kbtn:active { transform:scale(0.97); }
  .kbtn-green  { background:${C.green};  color:#fff; }
  .kbtn-green:hover  { background:#2F855A; }
  .kbtn-purple { background:${C.purple}; color:#fff; }
  .kbtn-purple:hover { background:#553C9A; }
  .kbtn-blue   { background:${C.blue};   color:#fff; }
  .kbtn-blue:hover   { background:#2B6CB0; }
  .kbtn-teal   { background:${C.teal};   color:#fff; }
  .kbtn-teal:hover   { background:#285E61; }
  .kbtn-red    { background:${C.red};    color:#fff; }
  .kbtn-red:hover    { background:#C53030; }
  .kbtn-orange { background:${C.orange}; color:#fff; }
  .kbtn-orange:hover { background:#C05621; }
  .kbtn-ghost  { background:transparent; border:1px solid ${C.border}; color:${C.muted}; }
  .kbtn-ghost:hover  { background:#F7FAFC; color:${C.text}; }

  .kmood { cursor:pointer; font-size:11px; font-weight:700; padding:5px 12px; border-radius:20px; border:1.5px solid ${C.border}; background:#F7FAFC; color:${C.muted}; transition:all 0.15s; }
  .kmood.active { background:${C.purple}; color:#fff; border-color:${C.purple}; }
  .kmood:hover:not(.active) { border-color:${C.purple}; color:${C.purple}; background:${C.purpleBg}; }

  .kstreak { cursor:pointer; font-size:11px; font-weight:700; padding:6px 14px; border-radius:10px; border:1.5px solid ${C.border}; background:#F7FAFC; color:${C.muted}; transition:all 0.15s; display:inline-flex; align-items:center; gap:6px; font-family:inherit; }
  .kstreak.done { background:${C.greenBg}; color:${C.green}; border-color:${C.greenBd}; cursor:default; }
  .kstreak:hover:not(.done) { border-color:${C.green}; color:${C.green}; background:${C.greenBg}; }

  .knapdur { cursor:pointer; padding:6px 0; border-radius:8px; border:1.5px solid ${C.border}; background:#F7FAFC; color:${C.muted}; font-size:11px; font-weight:700; font-family:inherit; transition:all 0.15s; flex:1; text-align:center; }
  .knapdur.active { background:${C.purple}; color:#fff; border-color:${C.purple}; }

  @keyframes neckAnim { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(15deg)} 75%{transform:rotate(-15deg)} }
  @keyframes shoulderAnim { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(360deg)} }
  @keyframes wristAnim { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(360deg) scale(1.1)} }
  @keyframes backAnim { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.08)} }
  @keyframes legAnim { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  .anim-neck     { display:inline-block; animation:neckAnim     2s ease-in-out infinite; }
  .anim-shoulder { display:inline-block; animation:shoulderAnim 2s linear infinite; }
  .anim-wrist    { display:inline-block; animation:wristAnim    1.5s linear infinite; }
  .anim-back     { display:inline-block; animation:backAnim     2s ease-in-out infinite; }
  .anim-leg      { display:inline-block; animation:legAnim      1s ease-in-out infinite; }

  @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .slide-up { animation:slideUp 0.35s ease-out; }

  @keyframes eyeBlink { 0%,100%{opacity:1} 50%{opacity:0} }
  .eye-blink { animation:eyeBlink 0.3s ease-in-out 2; }

  @keyframes sosPulse { 0%,100%{box-shadow:0 0 0 0 rgba(229,62,62,0.4)} 50%{box-shadow:0 0 0 10px rgba(229,62,62,0)} }
  .sos-pulse { animation:sosPulse 1.2s ease-in-out infinite; }

  @keyframes romanticGlow { 0%,100%{box-shadow:0 0 0 0 rgba(213,63,140,0.15)} 50%{box-shadow:0 4px 20px rgba(213,63,140,0.15)} }
  .romantic-glow { animation:romanticGlow 3s ease-in-out infinite; }

  .detox-overlay { position:fixed; inset:0; z-index:9999; background:linear-gradient(135deg,#F0FFF4,#E6FFFA); display:flex; align-items:center; justify-content:center; }

  .kgrid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media(max-width:860px){ .kgrid2 { grid-template-columns:1fr; } }

  .ksect { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:${C.hint}; margin-bottom:12px; display:flex; align-items:center; gap:8px; }
  .ksect::after { content:''; flex:1; height:1px; background:${C.border}; }
`;

export default function KesehatanPage() {
  const firstName = 'Kamu';

  const [waterCount,    setWaterCount]    = useLocalStorage('kes_waterCount', 1.2);
  const [currentMood,   setCurrentMood]   = useLocalStorage('kes_currentMood', 'Ambis');
  const [coffeeCount,   setCoffeeCount]   = useLocalStorage('kes_coffeeCount', 0);
  const [sunDone,       setSunDone]       = useLocalStorage('kes_sunDone', false);
  const [streakItems,   setStreakItems]   = useLocalStorage<StreakState>('kes_streakItems', { air:false, tidur:false, gerak:false });
  const [streakDays,    setStreakDays]    = useLocalStorage('kes_streakDays', 0);
  const [vibeX,         setVibeX]         = useLocalStorage('kes_vibeX', 50);
  const [vibeY,         setVibeY]         = useLocalStorage('kes_vibeY', 50);
  const [lastResetDate, setLastResetDate] = useLocalStorage('kes_lastResetDate', '');

  const [isSOSActive,    setIsSOSActive]    = useState(false);
  const [detoxActive,    setDetoxActive]    = useState(false);
  const [detoxCountdown, setDetoxCountdown] = useState(300);
  const detoxRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const [napActive,    setNapActive]    = useState(false);
  const [napDone,      setNapDone]      = useState(false);
  const [napSeconds,   setNapSeconds]   = useState(napDurations[1].seconds);
  const [napRemaining, setNapRemaining] = useState(napDurations[1].seconds);
  const [selectedNap,  setSelectedNap]  = useState(1);
  const napRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const [quoteIdx,     setQuoteIdx]     = useState(() => Math.floor(Math.random() * healthQuotes.length));
  const [vibeDragging, setVibeDragging] = useState(false);
  const vibeArenaRef   = useRef<HTMLDivElement>(null);
  const currentVibe    = getVibeZone(vibeX, vibeY);

  const [timerRunning, setTimerRunning] = useState(false);
  const [inEyeBreak,   setInEyeBreak]   = useState(false);
  const [timerSecs,    setTimerSecs]    = useState(20 * 60);
  const [eyeIconBlink, setEyeIconBlink] = useState(false);
  const timerRef      = useRef<ReturnType<typeof setInterval>|null>(null);
  const timerSecsRef  = useRef(20 * 60);
  const inBreakRef    = useRef(false);

  const [streakUnlocked, setStreakUnlocked] = useState(false);
  const [showPosture,    setShowPosture]    = useState(false);
  const [postureFixed,   setPostureFixed]   = useState(false);

  const [breathActive,     setBreathActive]     = useState(false);
  const [breathPhaseIdx,   setBreathPhaseIdx]   = useState(0);
  const [breathSecsLeft,   setBreathSecsLeft]   = useState(4);
  const [breathCycleCount, setBreathCycleCount] = useState(0);
  const [breathScale,      setBreathScale]      = useState(0.6);
  const breathRef      = useRef<ReturnType<typeof setInterval>|null>(null);
  const breathSecsRef  = useRef(4);
  const breathPhaseRef = useRef(0);

  const startBreathing = () => {
    setBreathActive(true); setBreathPhaseIdx(0); setBreathSecsLeft(4); setBreathCycleCount(0); setBreathScale(0.6);
    breathSecsRef.current = 4; breathPhaseRef.current = 0;
    if (breathRef.current) clearInterval(breathRef.current);
    breathRef.current = setInterval(() => {
      breathSecsRef.current -= 1;
      setBreathSecsLeft(breathSecsRef.current);
      const phase = breathPhaseRef.current;
      const prog  = 1 - breathSecsRef.current / 4;
      if (phase === 0) setBreathScale(0.6 + 0.4 * prog);
      else if (phase === 1) setBreathScale(1);
      else if (phase === 2) setBreathScale(1 - 0.4 * prog);
      else setBreathScale(0.6);
      if (breathSecsRef.current <= 0) {
        const next = (breathPhaseRef.current + 1) % 4;
        breathPhaseRef.current = next; breathSecsRef.current = 4;
        setBreathPhaseIdx(next); setBreathSecsLeft(4);
        if (next === 0) setBreathCycleCount(c => c + 1);
      }
    }, 1000);
  };
  const stopBreathing = () => {
    clearInterval(breathRef.current!);
    setBreathActive(false); setBreathPhaseIdx(0); setBreathSecsLeft(4); setBreathCycleCount(0); setBreathScale(0.6);
  };

  const [stretchActive,   setStretchActive]   = useState(false);
  const [stretchMoveIdx,  setStretchMoveIdx]  = useState(0);
  const [stretchSecsLeft, setStretchSecsLeft] = useState(stretchMoves[0].duration);
  const [stretchDone,     setStretchDone]     = useState(false);
  const stretchRef     = useRef<ReturnType<typeof setInterval>|null>(null);
  const stretchSecRef  = useRef(stretchMoves[0].duration);
  const stretchMoveRef = useRef(0);

  const startStretch = () => {
    setStretchActive(true); setStretchMoveIdx(0); setStretchSecsLeft(stretchMoves[0].duration); setStretchDone(false);
    stretchSecRef.current = stretchMoves[0].duration; stretchMoveRef.current = 0;
    if (stretchRef.current) clearInterval(stretchRef.current);
    stretchRef.current = setInterval(() => {
      stretchSecRef.current -= 1;
      setStretchSecsLeft(stretchSecRef.current);
      if (stretchSecRef.current <= 0) {
        const next = stretchMoveRef.current + 1;
        if (next >= stretchMoves.length) { clearInterval(stretchRef.current!); setStretchActive(false); setStretchDone(true); }
        else { stretchMoveRef.current = next; stretchSecRef.current = stretchMoves[next].duration; setStretchMoveIdx(next); setStretchSecsLeft(stretchMoves[next].duration); }
      }
    }, 1000);
  };
  const stopStretch = () => { clearInterval(stretchRef.current!); setStretchActive(false); setStretchMoveIdx(0); setStretchSecsLeft(stretchMoves[0].duration); setStretchDone(false); };

  const [romanticIdx, setRomanticIdx] = useState(() => Math.floor(Math.random() * romanticMessages.length));
  useEffect(() => {
    const now = new Date();
    const msToNextHour = (60 - now.getMinutes()) * 60000 - now.getSeconds() * 1000;
    const t = setTimeout(() => {
      setRomanticIdx(Math.floor(Math.random() * romanticMessages.length));
      const iv = setInterval(() => setRomanticIdx(Math.floor(Math.random() * romanticMessages.length)), 3600000);
      return () => clearInterval(iv);
    }, msToNextHour);
    return () => clearTimeout(t);
  }, []);
  const currentRomantic = romanticMessages[romanticIdx];

  useEffect(() => {
    const today = new Date().toDateString();
    if (lastResetDate !== today) { setCoffeeCount(0); setSunDone(false); setStreakItems({ air:false, tidur:false, gerak:false }); setLastResetDate(today); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startDetox = () => {
    setDetoxActive(true); setDetoxCountdown(300);
    detoxRef.current = setInterval(() => setDetoxCountdown(p => { if (p <= 1) { clearInterval(detoxRef.current!); setDetoxActive(false); return 300; } return p - 1; }), 1000);
  };
  const cancelDetox = () => { clearInterval(detoxRef.current!); setDetoxActive(false); setDetoxCountdown(300); };

  const startNap = () => {
    setNapDone(false); setNapActive(true); setNapRemaining(napSeconds);
    napRef.current = setInterval(() => setNapRemaining(p => { if (p <= 1) { clearInterval(napRef.current!); setNapActive(false); setNapDone(true); return 0; } return p - 1; }), 1000);
  };
  const stopNap = () => { clearInterval(napRef.current!); setNapActive(false); setNapRemaining(napSeconds); setNapDone(false); };
  const selectNapDuration = (idx: number) => { setSelectedNap(idx); setNapSeconds(napDurations[idx].seconds); setNapRemaining(napDurations[idx].seconds); setNapDone(false); if (napActive) stopNap(); };

  const getVibePos = useCallback((cx: number, cy: number) => {
    if (!vibeArenaRef.current) return [50, 50];
    const r = vibeArenaRef.current.getBoundingClientRect();
    return [Math.max(5, Math.min(95, ((cx - r.left) / r.width) * 100)), Math.max(5, Math.min(95, ((cy - r.top) / r.height) * 100))];
  }, []);
  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (!vibeDragging) return; const [x, y] = getVibePos(e.clientX, e.clientY); setVibeX(x); setVibeY(y); };
    const onUp   = () => setVibeDragging(false);
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [vibeDragging, getVibePos]);

  const toggleTimer = () => {
    if (timerRunning) { clearInterval(timerRef.current!); setTimerRunning(false); return; }
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      timerSecsRef.current -= 1; setTimerSecs(timerSecsRef.current);
      if (!inBreakRef.current && timerSecsRef.current <= 0) { inBreakRef.current = true; timerSecsRef.current = 20; setInEyeBreak(true); setEyeIconBlink(true); setTimeout(() => setEyeIconBlink(false), 1000); }
      else if (inBreakRef.current && timerSecsRef.current <= 0) { inBreakRef.current = false; timerSecsRef.current = 20 * 60; setInEyeBreak(false); setEyeIconBlink(true); setTimeout(() => setEyeIconBlink(false), 1000); }
    }, 1000);
  };

  const logStreak = (type: keyof StreakState) => {
    if (streakItems[type]) return;
    const next = { ...streakItems, [type]: true };
    setStreakItems(next);
    if (Object.values(next).filter(Boolean).length === 3) { setStreakDays(d => d + 1); setStreakUnlocked(true); setTimeout(() => setStreakUnlocked(false), 4000); }
  };

  useEffect(() => () => { clearInterval(detoxRef.current!); clearInterval(napRef.current!); clearInterval(timerRef.current!); clearInterval(breathRef.current!); clearInterval(stretchRef.current!); }, []);

  const totalDebt      = sleepData.reduce((a, d) => a + Math.max(0, IDEAL_SLEEP - d.hours), 0);
  const sleepStatus    = totalDebt <= 2 ? { text: 'Tidur Cukup', cls: 'kb-green' } : totalDebt <= 6 ? { text: 'Zombie Ringan', cls: 'kb-orange' } : { text: 'Zombie Kampus', cls: 'kb-red' };
  const napProgress    = 1 - napRemaining / napSeconds;
  const napCirc        = 2 * Math.PI * 38;
  const currentFood    = moodFoodMap[currentMood] ?? moodFoodMap['Ambis'];
  const caffeinePct    = Math.min((coffeeCount / MAX_COFFEE) * 100, 100);
  const cafBar         = coffeeCount <= 2 ? C.amber : coffeeCount === 3 ? C.orange : C.red;
  const cafWarning     = CAFFEINE_WARNINGS[Math.min(coffeeCount, 5)];
  const timerCirc      = 2 * Math.PI * 42;
  const timerTotal     = inEyeBreak ? 20 : 20 * 60;
  const timerProgress  = 1 - timerSecs / timerTotal;
  const streakCount    = Object.values(streakItems).filter(Boolean).length;
  const streakLevel    = Math.min(streakDays, 3);
  const curBreath      = breathPhases[breathPhaseIdx];
  const curStretch     = stretchMoves[stretchMoveIdx];
  const stretchProg    = stretchActive ? (1 - stretchSecsLeft / curStretch.duration) : 0;

  const sh = { boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };

  // Breathing face emoji per phase
  const breathFaceEmoji = !breathActive ? '🧘' : breathPhaseIdx === 0 ? '😮' : breathPhaseIdx === 2 ? '😤' : '😌';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyle }} />

      {/* DETOX OVERLAY */}
      {detoxActive && (
        <div className="detox-overlay">
          <div style={{ textAlign:'center', maxWidth:400, padding:'0 24px' }}>
            <div style={{ fontSize:80, marginBottom:20, lineHeight:1 }}><Emoji3D e="🌿" size={80} /></div>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.15em', color:C.teal, textTransform:'uppercase', marginBottom:8 }}>Digital Detox Aktif</div>
            <h2 style={{ fontSize:28, fontWeight:900, color:C.text, marginBottom:12 }}>Istirahat Sejenak</h2>
            <p style={{ fontSize:14, color:C.muted, lineHeight:1.7, marginBottom:24 }}>Pandangi sesuatu yang jauh — minimal 6 meter.<br/>Biarkan matamu bernapas.</p>
            <div style={{ fontSize:52, fontWeight:900, color:C.teal, fontVariantNumeric:'tabular-nums', marginBottom:20 }}>{formatTime(detoxCountdown)}</div>
            <div style={{ width:240, height:6, background:C.tealBd, borderRadius:3, margin:'0 auto 24px', overflow:'hidden' }}>
              <div style={{ height:'100%', background:C.teal, borderRadius:3, width:`${((300-detoxCountdown)/300)*100}%`, transition:'width 1s linear' }} />
            </div>
            <button onClick={cancelDetox} className="kbtn kbtn-ghost" style={{ padding:'10px 24px', fontSize:13 }}>Kembali ke Plotwist</button>
          </div>
        </div>
      )}

      {/* POSTURE MODAL */}
      {showPosture && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }}
          onClick={() => { setShowPosture(false); setPostureFixed(false); }}>
          <div onClick={e => e.stopPropagation()} className="kes-card slide-up" style={{ maxWidth:380, width:'100%', margin:'0 16px', border:`2px solid ${C.teal}` }}>
            <div style={{ textAlign:'center', marginBottom:16 }}>
              <div style={{ fontSize:52, marginBottom:10, display:'inline-block', transform:postureFixed?'none':'rotate(12deg)', transition:'transform 0.7s', lineHeight:1 }}>
                <Emoji3D e={postureFixed ? '🧍' : '🦐'} size={52} />
              </div>
              <span className={`kb ${postureFixed?'kb-green':'kb-orange'}`}>{postureFixed?'✅ Postur Sudah Oke!':'⚠️ Chaos Tamers Alert!'}</span>
              <h2 style={{ fontSize:17, fontWeight:800, color:C.text, marginTop:10 }}>{postureFixed?`Mantap! Tulang punggungmu berterima kasih.`:`Punggungmu bukan udang, ${firstName}.`}</h2>
              <p style={{ fontSize:12, color:C.muted, marginTop:6, lineHeight:1.6 }}>{postureFixed?'Pertahankan posisi ini. Set pengingat 30 menit lagi!':'Tegak dikit napa! Bahu ke belakang, dagu sedikit naik.'}</p>
            </div>
            {!postureFixed && (
              <div style={{ background:C.pageBg, borderRadius:10, padding:14, marginBottom:14 }}>
                {['Punggung menempel sandaran kursi','Kedua kaki menyentuh lantai','Layar sejajar atau sedikit di bawah mata','Bahu rileks, tidak terangkat'].map((item,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', fontSize:12, color:C.muted, borderBottom:i<3?`1px solid ${C.border}`:'none' }}>
                    <div style={{ width:14, height:14, borderRadius:4, border:`1.5px solid ${C.teal}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <div style={{ width:6, height:6, background:C.teal, borderRadius:'50%' }} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => { setShowPosture(false); setPostureFixed(false); }} className="kbtn kbtn-ghost" style={{ flex:1, padding:'10px 0', fontSize:12 }}>Tutup</button>
              {!postureFixed && <button onClick={() => setPostureFixed(true)} className="kbtn kbtn-teal" style={{ flex:1, padding:'10px 0', fontSize:12 }}>Sudah Tegak! ✓</button>}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN PAGE ─────────────────────────────────────────────────────────── */}
      <div className="kes-root" style={{ padding:'24px' }}>

        {/* ROMANTIC BANNER */}
        <div className="romantic-glow" style={{ background:`linear-gradient(135deg, ${C.pinkBg}, #FFF0F6)`, border:`1.5px solid ${C.pinkBd}`, borderRadius:16, padding:'14px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:14, ...sh }}>
          <span style={{ flexShrink:0, lineHeight:1 }}><Emoji3D e={currentRomantic.emoji} size={32} /></span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:C.pink, marginBottom:4 }}>
              <Emoji3D e="💌" size={12} style={{ verticalAlign:'middle', marginRight:4 }} />
              Pengingat Sayang — Berganti Tiap Jam
            </div>
            <p style={{ fontSize:13, fontWeight:600, color:'#97266D', lineHeight:1.5 }}>{currentRomantic.msg}</p>
          </div>
          <button onClick={() => setRomanticIdx(i => (i+1) % romanticMessages.length)}
            style={{ background:C.pinkBg, border:`1px solid ${C.pinkBd}`, color:C.pink, borderRadius:8, padding:'6px 10px', cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:'inherit', flexShrink:0 }}>
            Ganti ↻
          </button>
        </div>

        {/* HEADER */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:20, flexWrap:'wrap' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <h1 style={{ fontSize:22, fontWeight:900, color:C.text }}>Kesehatan & Keseimbangan</h1>
              <span className="kb kb-green">● Live</span>
            </div>
            <p style={{ fontSize:13, color:C.muted }}>Hei, <span style={{ color:C.purple, fontWeight:800 }}>{firstName}</span>! Jangan biarkan tugas memadamkan semangatmu. <Emoji3D e="🌟" size={16} /></p>
            <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
              {Object.keys(moodFoodMap).map(m => <button key={m} onClick={() => setCurrentMood(m)} className={`kmood ${currentMood===m?'active':''}`}>{m}</button>)}
            </div>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {[{ label:'Burnout Radar', value:'35%', cls:'kb-green' }, { label:'Sleep Quality', value:'6.5 Jam', cls:'kb-orange' }, { label:'Mood', value:currentMood, cls:'kb-purple' }].map(m => (
              <div key={m.label} className="kes-card" style={{ padding:'12px 16px', textAlign:'center', minWidth:100 }}>
                <div style={{ fontSize:10, color:C.hint, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{m.label}</div>
                <span className={`kb ${m.cls}`} style={{ fontSize:12 }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* QUOTE */}
        <div style={{ background:C.purpleBg, borderLeft:`4px solid ${C.purple}`, borderRadius:'0 14px 14px 0', padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, border:`1px solid ${C.purpleBd}`, borderLeftWidth:4 }}>
          <p style={{ fontSize:13, fontWeight:600, color:'#553C9A', fontStyle:'italic', lineHeight:1.6 }}>
            <Emoji3D e="💡" size={14} style={{ marginRight:6, verticalAlign:'middle' }} />
            &ldquo;{healthQuotes[quoteIdx]}&rdquo;
          </p>
          <button onClick={() => setQuoteIdx(i => (i+1) % healthQuotes.length)} className="kbtn kbtn-ghost" style={{ padding:'6px 12px', fontSize:11, flexShrink:0 }}>Ganti ↻</button>
        </div>

        {/* POSTURE BANNER */}
        <button onClick={() => { setShowPosture(true); setPostureFixed(false); }}
          style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, background:`linear-gradient(135deg, ${C.tealBg}, #E6FFFA)`, border:`1.5px solid ${C.tealBd}`, borderRadius:14, padding:'14px 20px', cursor:'pointer', marginBottom:20, fontFamily:'inherit', ...sh }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Emoji3D e="🦴" size={28} />
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:13, fontWeight:800, color:C.teal }}>Posture Police — Cek Punggungmu!</div>
              <div style={{ fontSize:11, color:'#285E61', marginTop:2 }}>Punggungmu bukan udang. Tegak dikit napa!</div>
            </div>
          </div>
          <span style={{ color:C.teal, fontSize:16, fontWeight:800 }}>→</span>
        </button>

        {/* ROW 1: VIBE + EYE TIMER */}
        <div className="kgrid2" style={{ marginBottom:20 }}>
          {/* VIBE */}
          <div className="kes-card" style={{ border:`1.5px solid ${C.purpleBd}`, background:C.purpleBg }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:C.text, display:'flex', alignItems:'center', gap:6 }}>
                  Vibe Check <Emoji3D e="🎯" size={18} />
                </div>
                <div style={{ fontSize:11, color:C.hint, marginTop:3 }}>Drag maskot ke zona mood-mu</div>
              </div>
              <span className="kb" style={{ background:currentVibe.bg, color:currentVibe.color, border:`1px solid ${currentVibe.border}`, fontSize:11 }}>{currentVibe.label}</span>
            </div>
            <div ref={vibeArenaRef} style={{ position:'relative', width:'100%', height:170, background:'#F7FAFC', borderRadius:12, border:`1px solid ${C.border}`, overflow:'hidden', cursor:'crosshair', userSelect:'none' }}
              onMouseDown={() => setVibeDragging(true)}>
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', pointerEvents:'none' }}><div style={{ width:'100%', height:1, background:C.border }} /></div>
              <div style={{ position:'absolute', inset:0, display:'flex', justifyContent:'center', pointerEvents:'none' }}><div style={{ height:'100%', width:1, background:C.border }} /></div>
              {[{ s:{ top:6, left:'50%', transform:'translateX(-50%)' }, t:'Bersemangat ↑' },{ s:{ bottom:6, left:'50%', transform:'translateX(-50%)' }, t:'↓ Lelah' },{ s:{ left:6, top:'50%', transform:'translateY(-50%)' }, t:'← Tenang' },{ s:{ right:6, top:'50%', transform:'translateY(-50%)' }, t:'Cemas →' }].map((l,i) => (
                <span key={i} style={{ position:'absolute', fontSize:9, fontWeight:800, color:C.hint, pointerEvents:'none', ...l.s }}>{l.t}</span>
              ))}
              <span style={{ position:'absolute', top:14, left:14, fontSize:9, fontWeight:800, color:C.green, pointerEvents:'none' }}>Produktif</span>
              <span style={{ position:'absolute', top:14, right:14, fontSize:9, fontWeight:800, color:C.red, pointerEvents:'none' }}>Kewalahan</span>
              <span style={{ position:'absolute', bottom:14, left:14, fontSize:9, fontWeight:800, color:C.purple, pointerEvents:'none' }}>Santai</span>
              <span style={{ position:'absolute', bottom:14, right:14, fontSize:9, fontWeight:800, color:C.muted, pointerEvents:'none' }}>Burnout</span>
              {/* draggable mascot using 3D emoji */}
              <div style={{ position:'absolute', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'grab', zIndex:10, left:`${vibeX}%`, top:`${vibeY}%`, transform:'translate(-50%,-50%)' }}
                onMouseDown={e => { e.preventDefault(); setVibeDragging(true); }}>
                <Emoji3D e={currentVibe.emoji} size={30} />
              </div>
            </div>
            <div style={{ marginTop:10, padding:12, borderRadius:10, background:currentVibe.bg, border:`1px solid ${currentVibe.border}`, fontSize:12, fontWeight:600, color:currentVibe.color, lineHeight:1.5 }}>
              💬 {currentVibe.advice}
            </div>
          </div>

          {/* EYE TIMER */}
          <div className="kes-card" style={{ border:`1.5px solid ${C.blueBd}`, background:C.blueBg }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:C.text, display:'flex', alignItems:'center', gap:8 }}>
                  <span className={eyeIconBlink?'eye-blink':''} style={{ display:'inline-flex' }}><Emoji3D e="👁️" size={20} /></span>
                  Aturan 20-20-20
                </div>
                <div style={{ fontSize:11, color:C.hint, marginTop:3 }}>Tiap 20 menit → lihat 6m → 20 detik</div>
              </div>
              <span className={`kb ${inEyeBreak?'kb-orange':timerRunning?'kb-green':'kb-gray'}`}>
                {inEyeBreak ? (
                  <><Emoji3D e="🔴" size={11} /> Istirahat!</>
                ) : timerRunning ? (
                  <><Emoji3D e="🟢" size={11} /> Aktif</>
                ) : 'Belum mulai'}
              </span>
            </div>
            {inEyeBreak && (
              <div style={{ background:C.orangeBg, border:`1px solid ${C.orangeBd}`, borderRadius:10, padding:10, textAlign:'center', marginBottom:10 }}>
                <p style={{ fontSize:12, fontWeight:800, color:C.orange, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  <Emoji3D e="👁️" size={16} /> Lihat sesuatu sejauh 6 meter selama 20 detik!
                </p>
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'center', padding:'8px 0' }}>
              <div style={{ position:'relative', width:96, height:96 }}>
                <svg style={{ width:'100%', height:'100%', transform:'rotate(-90deg)' }} viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke={C.blueBd} strokeWidth="6" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={inEyeBreak?C.orange:C.blue} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={timerCirc} strokeDashoffset={timerCirc*(1-timerProgress)} style={{ transition:'stroke-dashoffset 1s linear' }} />
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:18, fontWeight:900, color:C.text, fontVariantNumeric:'tabular-nums' }}>{formatTime(timerSecs)}</span>
                  <span style={{ fontSize:9, color:C.hint, fontWeight:700 }}>{inEyeBreak?'Istirahat':'Menuju istirahat'}</span>
                </div>
              </div>
            </div>
            <button onClick={toggleTimer} className={`kbtn ${timerRunning?'kbtn-ghost':'kbtn-blue'}`} style={{ width:'100%', padding:'10px 0', fontSize:12, gap:6 }}>
              {timerRunning ? (
                <>⏸ Jeda Timer</>
              ) : (
                <><Emoji3D e="👁️" size={15} /> Mulai Timer 20-20-20</>
              )}
            </button>
          </div>
        </div>

        {/* ROW 2: MINDFULNESS + DESK STRETCH */}
        <div className="kgrid2" style={{ marginBottom:20 }}>
          {/* MINDFULNESS */}
          <div className="kes-card" style={{ border:`1.5px solid ${C.purpleBd}`, background:C.purpleBg }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:C.text, display:'flex', alignItems:'center', gap:6 }}>
                  Mindfulness & Breathing <Emoji3D e="🧘" size={18} />
                </div>
                <div style={{ fontSize:11, color:C.hint, marginTop:3 }}>Box Breathing — turunkan kecemasan instan</div>
              </div>
              {breathActive && <span className="kb kb-purple">Siklus {breathCycleCount}</span>}
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'12px 0' }}>
              <div style={{ position:'relative', width:140, height:140, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ position:'absolute', width:140, height:140, borderRadius:'50%', border:`2px solid ${breathActive?curBreath.color+'40':C.purpleBd}`, transition:'border-color 0.5s' }} />
                <div style={{
                  width:80, height:80, borderRadius:'50%',
                  background:breathActive?curBreath.bg:C.card,
                  border:`2.5px solid ${breathActive?curBreath.color:C.purpleBd}`,
                  transform:`scale(${breathScale})`, transition:'transform 1s ease-in-out, background 0.5s, border-color 0.5s',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:breathActive?`0 0 20px ${curBreath.color}30`:'none',
                }}>
                  <Emoji3D e={breathFaceEmoji} size={30} />
                </div>
                {breathActive && <div style={{ position:'absolute', bottom:8, fontSize:11, fontWeight:800, color:curBreath.color }}>{breathSecsLeft}s</div>}
              </div>
              <div style={{ marginTop:12, textAlign:'center' }}>
                {breathActive ? (
                  <>
                    <div style={{ fontSize:16, fontWeight:900, color:curBreath.color, marginBottom:4 }}>{curBreath.label}</div>
                    <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{curBreath.instruction}</div>
                  </>
                ) : (
                  <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>
                    {breathCycleCount>0?`✅ ${breathCycleCount} siklus selesai! Bagaimana perasaanmu?`:'Ikuti ritme lingkaran. Tarik, tahan, buang, tahan — masing-masing 4 detik.'}
                  </div>
                )}
              </div>
              {breathActive && (
                <div style={{ display:'flex', gap:6, marginTop:12 }}>
                  {breathPhases.map((p,i) => <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:i===breathPhaseIdx?p.color:C.border, transition:'background 0.3s' }} />)}
                </div>
              )}
            </div>
            <button onClick={breathActive?stopBreathing:startBreathing} className={`kbtn ${breathActive?'kbtn-ghost':'kbtn-purple'}`} style={{ width:'100%', padding:'10px 0', fontSize:12 }}>
              {breathActive ? '⏹ Stop Breathing' : <><Emoji3D e="🧘" size={15} /> Ambil Napas Sekarang</>}
            </button>
          </div>

          {/* DESK STRETCH */}
          <div className="kes-card" style={{ border:`1.5px solid ${C.greenBd}`, background:C.greenBg }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:C.text, display:'flex', alignItems:'center', gap:6 }}>
                  Desk Stretch Guide <Emoji3D e="🤸" size={18} />
                </div>
                <div style={{ fontSize:11, color:C.hint, marginTop:3 }}>5 gerakan × 30 detik = 2.5 menit sehat</div>
              </div>
              {stretchActive && <span className="kb kb-green">{stretchMoveIdx+1}/{stretchMoves.length}</span>}
            </div>
            {stretchDone ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ marginBottom:10, lineHeight:1 }}><Emoji3D e="🎉" size={52} /></div>
                <div style={{ fontSize:15, fontWeight:900, color:C.green, marginBottom:6 }}>Selesai! Keren banget!</div>
                <div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>Badanmu berterima kasih. Ulangi tiap 2 jam ya!</div>
                <button onClick={stopStretch} className="kbtn kbtn-green" style={{ marginTop:14, padding:'8px 20px', fontSize:12 }}>Reset</button>
              </div>
            ) : stretchActive ? (
              <div style={{ textAlign:'center' }}>
                <div style={{ marginBottom:8, lineHeight:1 }}>
                  <span className={`anim-${curStretch.animClass}`} style={{ display:'inline-block' }}>
                    <Emoji3D e={curStretch.emoji} size={54} />
                  </span>
                </div>
                <div style={{ fontSize:15, fontWeight:900, color:C.green, marginBottom:6 }}>{curStretch.name}</div>
                <div style={{ fontSize:12, color:C.muted, lineHeight:1.6, marginBottom:14, padding:'0 8px' }}>{curStretch.instruction}</div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:C.muted, marginBottom:6 }}>
                    <span>{curStretch.name}</span>
                    <span style={{ fontWeight:800, color:C.green, fontVariantNumeric:'tabular-nums' }}>{stretchSecsLeft}s</span>
                  </div>
                  <div style={{ height:6, background:C.greenBd, borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:C.green, borderRadius:3, width:`${stretchProg*100}%`, transition:'width 1s linear' }} />
                  </div>
                </div>
                <div style={{ display:'flex', gap:4, justifyContent:'center', marginBottom:12 }}>
                  {stretchMoves.map((m,i) => (
                    <div key={i} style={{ width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                      background:i<stretchMoveIdx?C.greenBg:i===stretchMoveIdx?C.green:C.card,
                      border:`1.5px solid ${i===stretchMoveIdx?C.green:C.greenBd}` }}>
                      <Emoji3D e={m.emoji} size={16} />
                    </div>
                  ))}
                </div>
                <button onClick={stopStretch} className="kbtn kbtn-ghost" style={{ width:'100%', padding:'8px 0', fontSize:12 }}>Berhenti</button>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
                  {stretchMoves.map((m,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:C.card, borderRadius:10, border:`1px solid ${C.greenBd}` }}>
                      <Emoji3D e={m.emoji} size={22} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{m.name}</div>
                        <div style={{ fontSize:10, color:C.hint }}>{m.duration} detik</div>
                      </div>
                      <span className="kb kb-green" style={{ fontSize:10 }}>{m.duration}s</span>
                    </div>
                  ))}
                </div>
                <button onClick={startStretch} className="kbtn kbtn-green" style={{ width:'100%', padding:'10px 0', fontSize:12 }}>
                  <Emoji3D e="🤸" size={15} /> Mulai Peregangan
                </button>
              </>
            )}
          </div>
        </div>

        {/* ROW 3: SUNLIGHT + COFFEE */}
        <div className="kgrid2" style={{ marginBottom:20 }}>
          {/* SUNLIGHT */}
          <div className="kes-card" style={{ border:`1.5px solid ${sunDone?C.amberBd:C.border}`, background:sunDone?C.amberBg:C.card, transition:'all 0.4s' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:C.text, display:'flex', alignItems:'center', gap:6 }}>
                  Sunlight Tracker <Emoji3D e="☀️" size={18} />
                </div>
                <div style={{ fontSize:11, color:C.hint, marginTop:3 }}>Jangan jadi vampir kampus</div>
              </div>
              <span className={`kb ${sunDone?'kb-amber':'kb-gray'}`}>{sunDone?'✅ Sudah!':'Belum'}</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
              <div onClick={() => setSunDone((d: boolean) => !d)}
                style={{ cursor:'pointer', filter:sunDone?'none':'grayscale(0.7)', transform:sunDone?'scale(1.15)':'scale(1)', transition:'all 0.4s', userSelect:'none', lineHeight:1 }}>
                <Emoji3D e="☀️" size={64} />
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                <input type="checkbox" checked={sunDone} onChange={e => setSunDone(e.target.checked)} style={{ width:16, height:16, accentColor:C.amber, cursor:'pointer' }} />
                <span style={{ fontSize:13, fontWeight:700, color:C.text }}>Sudah kena sinar matahari hari ini</span>
              </label>
            </div>
            <div style={{ marginTop:14, padding:12, borderRadius:10, background:sunDone?C.amberBg:C.pageBg, border:`1px solid ${sunDone?C.amberBd:C.border}`, fontSize:12, fontWeight:600, color:sunDone?C.amber:C.muted, lineHeight:1.5 }}>
              {sunDone ? (
                <><Emoji3D e="🌟" size={14} style={{ marginRight:4 }} />Vitamin D-mu tercukupi! Kulitmu berterima kasih, dan mood-mu juga.</>
              ) : (
                '🧛 Warna kulitmu udah kayak drakula. Ayo keluar bentar sebelum jadi urban legend!'
              )}
            </div>
          </div>

          {/* COFFEE */}
          <div className="kes-card" style={{ border:`1.5px solid ${coffeeCount>=MAX_COFFEE?C.redBd:C.border}`, background:coffeeCount>=MAX_COFFEE?C.redBg:C.card, transition:'all 0.4s' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:C.text, display:'flex', alignItems:'center', gap:6 }}>
                  Student Fuel Tracker <Emoji3D e="☕" size={18} />
                </div>
                <div style={{ fontSize:11, color:C.hint, marginTop:3 }}>Batas aman: {MAX_COFFEE} cangkir / hari</div>
              </div>
              <span className={`kb ${coffeeCount>=MAX_COFFEE?'kb-red':coffeeCount>=2?'kb-orange':'kb-gray'}`}>{coffeeCount} cangkir</span>
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ height:8, background:C.border, borderRadius:4, overflow:'hidden', marginBottom:6 }}>
                <div style={{ height:'100%', background:cafBar, borderRadius:4, width:`${caffeinePct}%`, transition:'all 0.5s' }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:C.hint, fontWeight:700 }}><span>0</span><span>2</span><span>4 (max)</span></div>
            </div>
            {coffeeCount>=2 && (
              <div style={{ padding:10, borderRadius:10, background:coffeeCount>=MAX_COFFEE?C.redBg:C.orangeBg, border:`1px solid ${coffeeCount>=MAX_COFFEE?C.redBd:C.orangeBd}`, fontSize:12, fontWeight:600, color:coffeeCount>=MAX_COFFEE?C.red:C.orange, lineHeight:1.5, marginBottom:12 }}>
                ⚠️ {cafWarning}
              </div>
            )}
            <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:14 }}>
              {Array.from({ length: MAX_COFFEE }).map((_,i) => (
                <span key={i} style={{ filter:i<coffeeCount?'none':'grayscale(1) opacity(0.3)', transition:'all 0.3s', lineHeight:1 }}>
                  <Emoji3D e="☕" size={26} />
                </span>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setCoffeeCount((c: number) => Math.min(c+1, MAX_COFFEE+1))} className={`kbtn ${coffeeCount>=MAX_COFFEE?'kbtn-ghost':'kbtn-orange'}`} style={{ flex:1, padding:'10px 0', fontSize:12 }} disabled={coffeeCount>MAX_COFFEE}>
                <Emoji3D e="☕" size={15} /> Catat Kopi
              </button>
              <button onClick={() => setCoffeeCount(0)} className="kbtn kbtn-ghost" style={{ padding:'10px 14px', fontSize:12 }}>↺</button>
            </div>
          </div>
        </div>

        {/* HEALTH STREAK */}
        <div className="kes-card" style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:C.text, display:'flex', alignItems:'center', gap:6 }}>
                Health Streak <Emoji3D e="🔥" size={18} />
              </div>
              <div style={{ fontSize:11, color:C.hint, marginTop:3 }}>Konsisten tiap hari → maskot makin stylish</div>
            </div>
            <span className="kb kb-orange" style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
              {streakDays} hari <Emoji3D e="🔥" size={13} />
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
            <div style={{ textAlign:'center', minWidth:80 }}>
              <div style={{ position:'relative', display:'inline-block', lineHeight:1 }}>
                <Emoji3D e="🐧" size={52} />
                {streakLevel > 0 && (
                  <span style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', fontSize:20, lineHeight:1 }}>
                    <Emoji3D e={mascotAccessories[streakLevel]} size={22} />
                  </span>
                )}
              </div>
              <div style={{ fontSize:10, fontWeight:700, color:C.hint, marginTop:8 }}>{mascotNames[streakLevel]}</div>
            </div>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                {(['air','tidur','gerak'] as (keyof StreakState)[]).map(key => {
                  const icons: Record<keyof StreakState, string>  = { air:'💧', tidur:'🌙', gerak:'🏃' };
                  const labels: Record<keyof StreakState, string> = { air:'Air Cukup', tidur:'Tidur Cukup', gerak:'Sudah Gerak' };
                  return (
                    <button key={key} disabled={streakItems[key]} onClick={() => logStreak(key)} className={`kstreak ${streakItems[key]?'done':''}`}>
                      <Emoji3D e={icons[key]} size={14} />
                      {labels[key]}
                      {streakItems[key] && ' ✓'}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize:12, color:C.muted, fontWeight:600, marginBottom:10, lineHeight:1.5 }}>
                {streakDays===0&&streakCount<3&&`Selesaikan ${3-streakCount} tantangan lagi untuk mulai streak!`}
                {streakDays===0&&streakCount===3&&'Streak hari ini dicatat! Besok lagi ya.'}
                {streakDays===1&&<>Streak 1 hari! Terus konsisten untuk upgrade maskot. <Emoji3D e="🕶️" size={14} /></>}
                {streakDays===2&&<>Streak 2 hari! Hampir dapet mahkota juara! <Emoji3D e="🎧" size={14} /></>}
                {streakDays>=3&&<>STREAK LEGENDA! Biru sudah fully equipped. <Emoji3D e="👑" size={14} /></>}
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {[1,2,3].map(day => <div key={day} style={{ height:6, flex:1, borderRadius:3, background:streakDays>=day?C.orange:C.border, transition:'background 0.4s' }} />)}
              </div>
            </div>
          </div>
          {streakUnlocked && (
            <div style={{ marginTop:14, padding:12, background:C.greenBg, border:`1px solid ${C.greenBd}`, borderRadius:10, textAlign:'center' }}>
              <p style={{ fontSize:12, fontWeight:800, color:C.green, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <Emoji3D e="🎉" size={16} /> 3 tantangan selesai! Streak hari ini dicatat. Besok lagi ya buat naik level!
              </p>
            </div>
          )}
        </div>

        {/* BOTTOM: WATER + SLEEP + SIDE */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 320px', gap:16 }} className="kbottomgrid">
          <style>{`@media(max-width:1100px){.kbottomgrid{grid-template-columns:1fr 1fr!important;}.ksidecol{grid-column:1/-1!important;}}@media(max-width:700px){.kbottomgrid{grid-template-columns:1fr!important;}}`}</style>

          {/* WATER */}
          <div className="kes-card" style={{ border:`1.5px solid ${C.blueBd}`, background:C.blueBg }}>
            <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:4, display:'flex', alignItems:'center', gap:6 }}>
              Water Intake <Emoji3D e="💧" size={18} />
            </div>
            <div style={{ fontSize:11, color:C.hint, marginBottom:14 }}>Target: 2.5 L / Hari</div>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:40, height:110, background:C.card, borderRadius:20, position:'relative', overflow:'hidden', border:`1.5px solid ${C.blueBd}`, flexShrink:0 }}>
                <div style={{ position:'absolute', bottom:0, width:'100%', background:`linear-gradient(${C.blue}, #2B6CB0)`, transition:'height 0.5s', height:`${Math.min((waterCount/2.5)*100,100)}%`, borderRadius:'0 0 20px 20px' }} />
              </div>
              <div>
                <div style={{ fontSize:30, fontWeight:900, color:C.text, fontVariantNumeric:'tabular-nums' }}>{waterCount.toFixed(1)} <span style={{ fontSize:14, color:C.hint }}>L</span></div>
                <div style={{ fontSize:11, color:C.hint, marginBottom:10 }}>dari 2.5 L target</div>
                <button onClick={() => setWaterCount((p: number) => Math.min(p+0.2,2.5))} className="kbtn kbtn-blue" style={{ padding:'7px 16px', fontSize:12 }}>
                  <Emoji3D e="💧" size={14} /> +200ml
                </button>
                {waterCount>=2.5 && (
                  <div style={{ fontSize:11, fontWeight:800, color:C.blue, marginTop:6, display:'flex', alignItems:'center', gap:4 }}>
                    <Emoji3D e="💧" size={14} /> Goal Tercapai!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SLEEP */}
          <div className="kes-card">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:C.text, display:'flex', alignItems:'center', gap:6 }}>
                  Sleep Debt <Emoji3D e="🌙" size={18} />
                </div>
                <div style={{ fontSize:11, color:C.hint, marginTop:3 }}>Ideal: {IDEAL_SLEEP} jam/hari</div>
              </div>
              <span className={`kb ${sleepStatus.cls}`}>{sleepStatus.text}</span>
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:80, marginBottom:8 }}>
              {sleepData.map((d,i) => {
                const pct   = (d.hours/IDEAL_SLEEP)*100;
                const debt  = Math.max(0,IDEAL_SLEEP-d.hours);
                const isGood= d.hours>=IDEAL_SLEEP;
                return (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                    <div style={{ width:'100%', height:68, display:'flex', flexDirection:'column', justifyContent:'flex-end', position:'relative' }}>
                      {!isGood && <div style={{ position:'absolute', top:0, width:'100%', background:C.redBg, border:`1px solid ${C.redBd}`, borderRadius:'4px 4px 0 0', height:`${(debt/IDEAL_SLEEP)*100}%` }} />}
                      <div style={{ width:'100%', height:`${Math.min(pct,100)}%`, background:isGood?C.green:C.blue, borderRadius:4, transition:'height 0.4s' }} />
                    </div>
                    <span style={{ fontSize:8, fontWeight:800, color:C.hint }}>{d.day}</span>
                    <span style={{ fontSize:7, fontWeight:700, color:isGood?C.green:C.red }}>{d.hours}j</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11 }}>
              <div style={{ display:'flex', gap:10, color:C.muted, fontWeight:600 }}>
                <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:8, height:8, background:C.blue, borderRadius:2, display:'inline-block' }} />Tidur</span>
                <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:8, height:8, background:C.redBg, border:`1px solid ${C.redBd}`, borderRadius:2, display:'inline-block' }} />Utang</span>
              </div>
              <span style={{ fontWeight:900, fontSize:13, color:totalDebt>6?C.red:totalDebt>2?C.orange:C.green }}>−{totalDebt.toFixed(1)} jam</span>
            </div>
            {totalDebt>4 && (
              <div style={{ marginTop:10, padding:10, background:C.redBg, border:`1px solid ${C.redBd}`, borderRadius:10, fontSize:11, fontWeight:600, color:C.red, lineHeight:1.5, display:'flex', alignItems:'center', gap:6 }}>
                <Emoji3D e="🛌" size={16} /> Utang tidurmu {totalDebt.toFixed(1)} jam. Butuh kasur, bukan kopi!
              </div>
            )}
          </div>

          {/* SIDE COLUMN */}
          <div className="ksidecol" style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* SOS */}
            <div className="kes-card" style={{ border:`1.5px solid ${isSOSActive?C.redBd:C.border}`, background:isSOSActive?C.redBg:C.card, transition:'all 0.4s' }}>
              <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
                SOS Panic Button <Emoji3D e="🆘" size={18} />
              </div>
              <p style={{ fontSize:12, color:C.muted, marginBottom:12, lineHeight:1.5 }}>Terlalu berat? Aktifkan protokol darurat emosional.</p>
              {isSOSActive && (
                <div style={{ padding:10, background:C.redBg, border:`1px solid ${C.redBd}`, borderRadius:10, fontSize:12, color:C.red, fontWeight:600, lineHeight:1.5, marginBottom:12, display:'flex', alignItems:'flex-start', gap:6 }}>
                  <Emoji3D e="📌" size={14} style={{ marginTop:2 }} />
                  Musik lofi diputar. Semua deadline disembunyikan 15 menit. Napas dulu...
                </div>
              )}
              <button onClick={() => setIsSOSActive(!isSOSActive)} className={`kbtn ${isSOSActive?'kbtn-red sos-pulse':'kbtn-ghost'}`}
                style={{ width:'100%', padding:'10px 0', fontSize:13, borderColor:isSOSActive?undefined:C.redBd, color:isSOSActive?undefined:C.red }}>
                {isSOSActive ? (
                  <><Emoji3D e="🔴" size={15} /> MATIKAN SOS</>
                ) : (
                  <><Emoji3D e="🆘" size={15} /> AKTIFKAN SOS</>
                )}
              </button>
            </div>

            {/* DETOX */}
            <div className="kes-card" style={{ border:`1.5px solid ${C.tealBd}`, background:C.tealBg }}>
              <div style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:C.teal, marginBottom:4, display:'flex', alignItems:'center', gap:4 }}>
                <Emoji3D e="🌿" size={14} /> Saatnya Kabur
              </div>
              <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:6 }}>Digital Detox Timer</div>
              <p style={{ fontSize:11, color:C.muted, lineHeight:1.5, marginBottom:12 }}>Layar PC nggak bakal lari, tapi matamu bisa.</p>
              <button onClick={startDetox} disabled={detoxActive} className="kbtn kbtn-teal" style={{ width:'100%', padding:'10px 0', fontSize:12 }}>
                <Emoji3D e="🌿" size={15} /> Kabur Sejenak (5 menit)
              </button>
            </div>

            {/* NAP */}
            <div className="kes-card" style={{ border:`1.5px solid ${C.purpleBd}`, background:C.purpleBg }}>
              <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:4, display:'flex', alignItems:'center', gap:6 }}>
                Victory Nap <Emoji3D e="⚡" size={18} />
              </div>
              <div style={{ fontSize:11, color:C.hint, marginBottom:12 }}>Power nap = cheat code hidup</div>
              <div style={{ display:'flex', gap:6, marginBottom:14 }}>
                {napDurations.map((d,i) => <button key={i} onClick={() => selectNapDuration(i)} className={`knapdur ${selectedNap===i?'active':''}`}>{d.label}</button>)}
              </div>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
                <div style={{ position:'relative', width:100, height:100 }}>
                  <svg style={{ width:'100%', height:'100%', transform:'rotate(-90deg)' }} viewBox="0 0 88 88">
                    <circle cx="44" cy="44" r="38" fill="none" stroke={C.purpleBd} strokeWidth="6" />
                    <circle cx="44" cy="44" r="38" fill="none" stroke={napDone?C.green:C.purple} strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={napCirc} strokeDashoffset={napCirc*(1-napProgress)} style={{ transition:'stroke-dashoffset 1s linear' }} />
                  </svg>
                  <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                    {napDone ? (
                      <Emoji3D e="🎉" size={26} />
                    ) : (
                      <>
                        <span style={{ fontSize:18, fontWeight:900, color:C.text, fontVariantNumeric:'tabular-nums' }}>{formatTime(napRemaining)}</span>
                        <span style={{ fontSize:9, color:C.hint, fontWeight:700 }}>{napActive?'Zzz...':'Siap tidur?'}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {napDone ? (
                <div style={{ padding:10, background:C.greenBg, border:`1px solid ${C.greenBd}`, borderRadius:10, textAlign:'center', marginBottom:10 }}>
                  <div style={{ fontSize:12, fontWeight:800, color:C.green, display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                    <Emoji3D e="⚡" size={14} /> Level energi dipulihkan!
                  </div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>Siap bantai tugas lagi?</div>
                  <button onClick={() => { setNapDone(false); setNapRemaining(napSeconds); }} style={{ marginTop:8, fontSize:11, fontWeight:700, color:C.green, background:'none', border:'none', cursor:'pointer', textDecoration:'underline', fontFamily:'inherit' }}>Reset Timer</button>
                </div>
              ) : (
                <button onClick={napActive?stopNap:startNap} className={`kbtn ${napActive?'kbtn-ghost':'kbtn-purple'}`}
                  style={{ width:'100%', padding:'10px 0', fontSize:12, borderColor:napActive?C.redBd:undefined, color:napActive?C.red:undefined }}>
                  {napActive ? '⏹ Stop Nap' : <><Emoji3D e="😴" size={15} /> Mulai Victory Nap</>}
                </button>
              )}
            </div>

            {/* MOOD FOOD */}
            <div className="kes-card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ fontSize:14, fontWeight:800, color:C.text, display:'flex', alignItems:'center', gap:6 }}>
                  Mood-Food <Emoji3D e="🍽️" size={18} />
                </div>
                <span className="kb kb-purple">Mood: {currentMood}</span>
              </div>
              <div style={{ padding:14, background:C.purpleBg, borderRadius:12, border:`1px solid ${C.purpleBd}`, marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <Emoji3D e={currentFood.emoji} size={36} />
                  <div>
                    <div style={{ fontSize:12, fontWeight:800, color:C.text }}>{currentFood.title}</div>
                    <div style={{ fontSize:11, color:'#553C9A', marginTop:2, lineHeight:1.4 }}>{currentFood.desc}</div>
                  </div>
                </div>
                <div style={{ padding:'7px 10px', background:C.redBg, border:`1px solid ${C.redBd}`, borderRadius:8, fontSize:11, fontWeight:600, color:C.red }}>
                  ⚠️ {currentFood.avoid}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}