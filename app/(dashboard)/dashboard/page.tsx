"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface CalEvent {
  id: number;
  title: string;
  type: string;
  year: number;
  month: number;
  day: number;
  time: string;
  room: string;
}

interface SubTask {
  id: number;
  text: string;
  done: boolean;
}

interface Task {
  id: number;
  title: string;
  subject: string;
  priority: "urgent" | "medium" | "low";
  status: "todo" | "inprogress" | "done";
  deadline: string;
  subtasks: SubTask[];
  xpEarned: number;
}

interface HeroStats {
  focus: number;
  consistency: number;
  willpower: number;
}

interface UserAccount {
  name: string;
  nickname: string;
  productivityLevel: number;
  productivityTitle: string;
  xpToday: number;
  streakDays: number;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}

function formatSisa(dateStr: string): string {
  const d = daysUntil(dateStr);
  if (d < 0) return `${Math.abs(d)}h lalu`;
  if (d === 0) return "Hari ini!";
  if (d === 1) return "Besok!";
  return `${d} hari`;
}

function subTaskPct(subtasks: SubTask[]): number {
  if (!subtasks.length) return 0;
  return Math.round((subtasks.filter((s) => s.done).length / subtasks.length) * 100);
}

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

function getLevelTitle(level: number): string {
  if (level >= 60) return "Legend";
  if (level >= 40) return "Master";
  if (level >= 25) return "Scholar";
  if (level >= 15) return "Adept";
  if (level >= 8) return "Apprentice";
  if (level >= 3) return "Rookie";
  return "Novice";
}

function useUserAccount(): UserAccount {
  const [account, setAccount] = useState<UserAccount>({
    name: "User",
    nickname: "",
    productivityLevel: 0,
    productivityTitle: "Novice",
    xpToday: 0,
    streakDays: 0,
  });

  useEffect(() => {
    try {
      const backup = localStorage.getItem("plotwist_profile_backup");
      if (backup) {
        const d = JSON.parse(backup);
        if (d.name) {
          const xp: number = d.xp ?? 0;
          const level = Math.floor(xp / 500);
          setAccount({
            name: d.name,
            nickname: "",
            productivityLevel: level,
            productivityTitle: getLevelTitle(level),
            xpToday: 0,
            streakDays: 0,
          });
        }
      }
    } catch {}

    let unsubFn: (() => void) | undefined;
    const init = async () => {
      const { db } = await import("@/firebase/config");
      const { doc, onSnapshot } = await import("firebase/firestore");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const unsub = onSnapshot(doc(db, "pengguna", session.user.id), (snap) => {
        if (!snap.exists()) return;
        const d = snap.data();
        const xp: number = d.xp ?? 0;
        const level = Math.floor(xp / 500);
        setAccount({
          name: d.name || "User",
          nickname: "",
          productivityLevel: level,
          productivityTitle: getLevelTitle(level),
          xpToday: d.xpToday ?? 0,
          streakDays: d.streakDays ?? 0,
        });
      });
      return unsub;
    };
    init().then((fn) => { unsubFn = fn; });
    return () => { unsubFn?.(); };
  }, []);

  return account;
}

const RABBIT_HOLE_QUOTE_TEMPLATES = [
  "Udah 30 menit buka dashboard doang, kapan mulai ngetiknya, {nama}?",
  "Satu paragraf sekarang, atau begadang nanti malam?",
  "Tab browser ke-12 bukan solusi, {nama}. Mulai aja.",
  "Prokrastinasi itu hanya utang waktu ke diri sendiri.",
  "Kalau bukan sekarang, kapan? Kalau bukan kamu, siapa?",
  "Kata-kata itu nggak akan nulis sendiri, {nama}.",
];

const MICRO_ADVENTURES = [
  "Push-up 10 kali sekarang! Tubuhmu butuh itu.",
  "Minum segelas air putih dalam 5 detik! Hydration check!",
  "Tarik napas dalam 4 detik, tahan 4, buang 4. Reset mode.",
  "Berdiri dan stretch selama 30 detik. Punggungmu berterima kasih.",
  "Tatap jendela atau jarak jauh selama 20 detik. Mata perlu istirahat.",
  "Tersenyum ke cermin sekarang. Serius. 30 detik.",
];

function EnergyWave({ energy, warMode }: { energy: number; warMode: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      tRef.current += warMode ? 0.06 : 0.02;
      const t = tRef.current;
      const amp = (energy / 100) * (H * 0.35);
      const speed = warMode ? 1.5 : 1;

      const grad1 = ctx.createLinearGradient(0, 0, W, 0);
      if (warMode) {
        grad1.addColorStop(0, "rgba(255,60,60,0.7)");
        grad1.addColorStop(1, "rgba(255,140,0,0.7)");
      } else if (energy > 60) {
        grad1.addColorStop(0, "rgba(139,92,246,0.7)");
        grad1.addColorStop(1, "rgba(236,72,153,0.7)");
      } else {
        grad1.addColorStop(0, "rgba(139,92,246,0.3)");
        grad1.addColorStop(1, "rgba(167,139,250,0.3)");
      }

      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x++) {
        const y = H / 2 + Math.sin((x / W) * Math.PI * 4 * speed + t) * amp + Math.sin((x / W) * Math.PI * 2 * speed + t * 1.3) * (amp * 0.4);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = grad1;
      ctx.fill();

      const grad2 = ctx.createLinearGradient(0, 0, W, 0);
      if (warMode) {
        grad2.addColorStop(0, "rgba(255,0,80,0.4)");
        grad2.addColorStop(1, "rgba(255,60,0,0.4)");
      } else {
        grad2.addColorStop(0, "rgba(167,139,250,0.4)");
        grad2.addColorStop(1, "rgba(236,72,153,0.4)");
      }

      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x++) {
        const y = H / 2 + Math.sin((x / W) * Math.PI * 3 * speed + t * 1.5 + 1) * amp * 0.7 + Math.sin((x / W) * Math.PI * 5 * speed + t * 0.8) * (amp * 0.3);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = grad2;
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [energy, warMode]);

  return <canvas ref={canvasRef} width={500} height={120} className="w-full h-full rounded-2xl" />;
}

function Equalizer({ playing }: { playing: boolean }) {
  const bars = [3, 5, 4, 7, 6, 4, 3, 5, 6, 4];
  return (
    <div className="flex items-end gap-[2px] h-5">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-purple-400"
          style={{
            height: playing ? `${h * 3}px` : "4px",
            animation: playing ? `eq-bar ${0.4 + i * 0.07}s ease-in-out infinite alternate` : "none",
            transition: "height 0.3s ease",
          }}
        />
      ))}
      <style>{`@keyframes eq-bar { from{transform:scaleY(0.3)} to{transform:scaleY(1.2)} }`}</style>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-semibold tracking-wide uppercase text-white/70">{label}</span>
        <span className="font-bold text-white">{value}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function useLiveCalendarData() {
  const today = new Date();
  const [jadwal, setJadwal] = useState<CalEvent[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("plotwist_cal:events");
        if (!raw) return;
        const events: CalEvent[] = JSON.parse(raw);
        const todayEvents = events.filter(
          (e) => e.type === "class" && e.year === today.getFullYear() && e.month === today.getMonth() + 1 && e.day === today.getDate()
        );
        setJadwal(todayEvents);
      } catch {}
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  return jadwal;
}

function useLiveTaskData() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("taskpage:tasks");
        if (!raw) return;
        const parsed: Task[] = JSON.parse(raw);
        const active = parsed.filter((t) => t.status !== "done").sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline)).slice(0, 4);
        setTasks(active);
      } catch {}
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  return tasks;
}

export default function Dashboard() {
  const userAccount = useUserAccount();
  const displayName = userAccount.nickname ? userAccount.nickname : getFirstName(userAccount.name);
  const resolveQuote = (template: string) => template.replace(/\{nama\}/g, displayName);

  const [energy, setEnergy] = useState(72);
  const [warMode, setWarMode] = useState(false);
  const [heroStats] = useState<HeroStats>({ focus: 68, consistency: 85, willpower: 54 });
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [adventure, setAdventure] = useState<string | null>(null);
  const [adventureTimer, setAdventureTimer] = useState(0);
  const [adventureInterval, setAdventureInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [meshOffset, setMeshOffset] = useState(0);
  const [vinylRotation, setVinylRotation] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const vinylRef = useRef<number>(0);

  useEffect(() => {
    const audio = new Audio("https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/lagu.mp3");
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;
    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => setPlaying(false));
    return () => { audio.pause(); audio.src = ""; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.play().catch(() => setPlaying(false)); }
    else { audioRef.current.pause(); }
  }, [playing]);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  useEffect(() => {
    if (playing) {
      const spin = () => { setVinylRotation((r) => (r + 0.5) % 360); vinylRef.current = requestAnimationFrame(spin); };
      vinylRef.current = requestAnimationFrame(spin);
    } else { cancelAnimationFrame(vinylRef.current); }
    return () => cancelAnimationFrame(vinylRef.current);
  }, [playing]);

  const formatTime = (sec: number) => {
    if (!isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) audioRef.current.currentTime = val;
  };

  const currentQuote = resolveQuote(RABBIT_HOLE_QUOTE_TEMPLATES[quoteIdx]);
  const jadwalHariIni = useLiveCalendarData();
  const deadlineTasks = useLiveTaskData();

  useEffect(() => {
    const id = setInterval(() => setMeshOffset((p) => (p + 0.3) % 360), 50);
    return () => clearInterval(id);
  }, []);

  const urgentCount = deadlineTasks.filter((t) => daysUntil(t.deadline) <= 1).length;
  useEffect(() => { if (urgentCount >= 2 || energy < 30) setWarMode(true); }, [urgentCount, energy]);

  useEffect(() => {
    const id = setInterval(() => { setQuoteIdx((p) => (p + 1) % RABBIT_HOLE_QUOTE_TEMPLATES.length); }, 8000);
    return () => clearInterval(id);
  }, []);

  const triggerAdventure = () => {
    if (adventureInterval) clearInterval(adventureInterval);
    const msg = MICRO_ADVENTURES[Math.floor(Math.random() * MICRO_ADVENTURES.length)];
    setAdventure(msg);
    setAdventureTimer(15);
    const id = setInterval(() => {
      setAdventureTimer((t) => { if (t <= 1) { clearInterval(id); setAdventure(null); return 0; } return t - 1; });
    }, 1000);
    setAdventureInterval(id);
  };

  const bgMesh = warMode
    ? `radial-gradient(ellipse at ${30 + Math.sin(meshOffset * 0.02) * 10}% 40%, rgba(255,60,60,0.15) 0%, transparent 60%),
      radial-gradient(ellipse at 70% ${50 + Math.cos(meshOffset * 0.015) * 10}%, rgba(255,100,0,0.12) 0%, transparent 60%),
      radial-gradient(ellipse at 50% 80%, rgba(200,0,50,0.1) 0%, transparent 50%),
      #1a0505`
    : `radial-gradient(ellipse at ${30 + Math.sin(meshOffset * 0.02) * 8}% 40%, rgba(139,92,246,0.18) 0%, transparent 60%),
      radial-gradient(ellipse at 70% ${50 + Math.cos(meshOffset * 0.015) * 8}%, rgba(236,72,153,0.14) 0%, transparent 60%),
      radial-gradient(ellipse at 50% 85%, rgba(99,102,241,0.12) 0%, transparent 50%),
      #f8f7ff`;

  const cardBase = "backdrop-blur-md bg-white/60 border border-white/40 shadow-xl rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl";
  const warCard = "backdrop-blur-md bg-red-950/40 border border-red-500/30 shadow-xl rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl";
  const card = warMode ? warCard : cardBase;
  const textPrimary = warMode ? "text-red-100" : "text-gray-800";
  const textSecondary = warMode ? "text-red-300" : "text-purple-600";

  const nowHour = new Date().getHours();
  const nowMin = new Date().getMinutes();
  const isPast = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h < nowHour || (h === nowHour && m <= nowMin);
  };

  return (
    <div
      className="min-h-screen transition-all duration-700 relative overflow-hidden"
      style={{ background: bgMesh }}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {warMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600/90 backdrop-blur-sm text-white text-center py-2 text-sm font-bold tracking-widest uppercase animate-pulse">
          WAR MODE ACTIVE — Get to work, {displayName}! The chaos is winning!
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="p-4 md:p-8 pt-6 md:pt-10">

        {/* ── HEADER ── */}
        <div className="mb-6 md:mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={`text-xs font-semibold tracking-widest uppercase mb-1 ${textSecondary}`}>
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1
              className={`font-black leading-none ${warMode ? "text-red-200" : "text-gray-900"}`}
              style={{
                fontSize: "clamp(2rem, 6vw, 4rem)",
                fontFamily: "'Syne', 'Space Grotesk', sans-serif",
                background: warMode
                  ? "linear-gradient(135deg, #ff6b6b, #ff4500)"
                  : "linear-gradient(135deg, #7c3aed, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Hello {userAccount.name}
            </h1>
          </div>
          <button
            onClick={() => setWarMode((w) => !w)}
            className={`self-start sm:self-auto px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
              warMode
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-white/60 text-purple-700 hover:bg-purple-100 border border-purple-200"
            }`}
          >
            {warMode ? "Peace Mode" : "War Mode"}
          </button>
        </div>

        {/* ── TOP ROW: Daily Pulse + Hero Stats + Now Playing ── */}
        {/* Mobile: 1 col | Tablet: 2 col | Desktop: 3 col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-4 md:mb-5">

          {/* Daily Pulse */}
          <div className={`${card} p-4 md:p-5`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className={`text-xs font-bold tracking-widest uppercase ${textSecondary}`}>Daily Pulse</p>
                <p className={`text-xl md:text-2xl font-black ${textPrimary}`}>{energy}% Energy</p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => setEnergy((e) => Math.min(100, e + 10))} className="text-xs bg-purple-500/20 hover:bg-purple-500/40 text-purple-700 rounded-lg px-2 py-1 font-bold">+10</button>
                <button onClick={() => setEnergy((e) => Math.max(0, e - 10))} className="text-xs bg-pink-500/20 hover:bg-pink-500/40 text-pink-700 rounded-lg px-2 py-1 font-bold">-10</button>
              </div>
            </div>
            <div className="h-[90px] md:h-[100px] rounded-2xl overflow-hidden">
              <EnergyWave energy={energy} warMode={warMode} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>06:00</span><span>Sekarang</span><span>24:00</span>
            </div>
          </div>

          {/* Hero Stats */}
          <div
            className="rounded-3xl p-4 md:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            style={{ background: warMode ? "linear-gradient(135deg, #7f1d1d, #450a0a)" : "linear-gradient(135deg, #4f1d96, #831843)" }}
          >
            <p className="text-xs font-bold tracking-widest uppercase text-white/60 mb-1">Hero Stats</p>
            <p className="text-lg md:text-xl font-black text-white mb-4">Level {userAccount.productivityLevel} {userAccount.productivityTitle}</p>
            <StatBar label="Focus" value={heroStats.focus} color="linear-gradient(90deg,#a78bfa,#818cf8)" />
            <StatBar label="Consistency" value={heroStats.consistency} color="linear-gradient(90deg,#f472b6,#fb7185)" />
            <StatBar label="Willpower" value={heroStats.willpower} color="linear-gradient(90deg,#34d399,#06b6d4)" />
            <p className="text-xs text-white/40 mt-2 italic">+{userAccount.xpToday} XP hari ini · Streak {userAccount.streakDays} hari</p>
          </div>

          {/* Now Playing — full width on mobile sm, spans both cols on tablet, 1 col on desktop */}
          <div className={`${card} p-4 md:p-5 sm:col-span-2 lg:col-span-1 relative overflow-hidden`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://rmkmqafgjbpisopuaxle.supabase.co/storage/v1/object/public/assets/cinta.png"
              alt="Maskot Cinta"
              className="absolute bottom-0 right-0 pointer-events-none z-0"
              style={{ width: 80, height: "auto", opacity: 0.92 }}
            />
            <div className="relative z-10">
              <p className={`text-xs font-bold tracking-widest uppercase ${textSecondary} mb-1`}>Now Playing</p>
              <p className={`text-base md:text-lg font-black ${textPrimary} mb-3`}>Productivity Audio</p>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="relative shrink-0"
                  style={{ width: 52, height: 52, transform: `rotate(${vinylRotation}deg)`, transition: playing ? "none" : "transform 0.5s ease" }}
                >
                  <div
                    className="w-full h-full rounded-full border-4 border-purple-900/40 flex items-center justify-center"
                    style={{
                      background: "conic-gradient(from 0deg, #1e1b4b, #4c1d95, #6d28d9, #1e1b4b, #4c1d95, #1e1b4b)",
                      boxShadow: playing ? "0 0 16px rgba(139,92,246,0.6)" : "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  >
                    <div className="w-4 h-4 rounded-full bg-white/80 border-2 border-purple-300/60" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-black truncate ${textPrimary}`}>lagu.mp3</p>
                  <p className={`text-xs ${warMode ? "text-red-400" : "text-purple-500"} font-semibold`}>
                    {playing ? "Sedang diputar..." : "Dijeda"}
                  </p>
                  <div className="mt-1">
                    <Equalizer playing={playing} />
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <input
                  type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #7c3aed ${duration ? (currentTime / duration) * 100 : 0}%, rgba(139,92,246,0.2) 0%)`,
                    accentColor: "#7c3aed",
                  }}
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              <button
                onClick={() => setPlaying((p) => !p)}
                className={`w-full py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 mb-3 ${
                  playing ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-white/60 text-purple-700 border border-purple-200 hover:bg-purple-50"
                }`}
              >
                <span className="text-base">{playing ? "||" : ">"}</span>
                <span>{playing ? "Pause" : "Play"}</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs">{volume === 0 ? "Mute" : volume < 0.5 ? "Low" : "High"}</span>
                <input
                  type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #a78bfa ${volume * 100}%, rgba(167,139,250,0.2) 0%)`,
                    accentColor: "#a78bfa",
                  }}
                />
                <span className="text-[10px] text-gray-400 font-mono w-8 text-right">{Math.round(volume * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW: Jadwal + Deadline + Rabbit Hole ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">

          {/* Jadwal */}
          <div className={`${card} p-4 md:p-5`}>
            <div className="flex items-center justify-between mb-1">
              <p className={`text-xs font-bold tracking-widest uppercase ${textSecondary}`}>Jadwal</p>
              <a href="/calendar" className={`text-xs font-semibold underline underline-offset-2 ${textSecondary} hover:opacity-70 transition`}>Lihat semua →</a>
            </div>
            <p className={`text-lg md:text-xl font-black ${textPrimary} mb-4`}>Hari Ini</p>
            {jadwalHariIni.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <p className={`text-sm text-center ${warMode ? "text-red-300/60" : "text-gray-400"}`}>Tidak ada kuliah hari ini.</p>
                <a href="/calendar" className="mt-1 text-xs bg-purple-100 text-purple-600 px-3 py-1.5 rounded-xl font-bold hover:bg-purple-200 transition">+ Tambah di Kalender</a>
              </div>
            ) : (
              <div className="space-y-2">
                {jadwalHariIni.sort((a, b) => a.time.localeCompare(b.time)).map((j) => {
                  const startTime = j.time.split(" - ")[0] ?? j.time;
                  const done = isPast(startTime);
                  return (
                    <div key={j.id} className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all ${done ? "opacity-40" : "bg-white/40 hover:bg-purple-50/60"}`}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${done ? "bg-gray-300" : "bg-purple-500"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${textPrimary} ${done ? "line-through" : ""}`}>{j.title}</p>
                        <p className="text-xs text-gray-400">{j.time} · {j.room}</p>
                      </div>
                      {!done && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-lg font-semibold flex-shrink-0">Next</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Deadline Tugas */}
          <div className={`${card} p-4 md:p-5`}>
            <div className="flex items-center justify-between mb-1">
              <p className={`text-xs font-bold tracking-widest uppercase ${textSecondary}`}>Deadline Tugas</p>
              <a href="/tugas" className={`text-xs font-semibold underline underline-offset-2 ${textSecondary} hover:opacity-70 transition`}>Lihat semua →</a>
            </div>
            <p className={`text-lg md:text-xl font-black ${textPrimary} mb-4`}>Jangan Lupa</p>
            {deadlineTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <p className={`text-sm text-center ${warMode ? "text-red-300/60" : "text-gray-400"}`}>Semua tugas beres! Good job!</p>
                <a href="/tugas" className="mt-1 text-xs bg-purple-100 text-purple-600 px-3 py-1.5 rounded-xl font-bold hover:bg-purple-200 transition">+ Tambah Tugas</a>
              </div>
            ) : (
              <div className="space-y-3">
                {deadlineTasks.map((t) => {
                  const sisa = daysUntil(t.deadline);
                  const persen = subTaskPct(t.subtasks);
                  const urgent = sisa <= 1;
                  return (
                    <a href="/tugas" key={t.id} className="block">
                      <div className={`p-3 rounded-2xl cursor-pointer hover:scale-[1.01] transition-all ${urgent ? warMode ? "bg-red-900/40" : "bg-red-50 border border-red-200" : "bg-white/40"}`}>
                        <div className="flex justify-between items-start mb-1.5">
                          <div className="flex-1 min-w-0 mr-2">
                            <p className={`text-sm font-bold truncate ${urgent ? "text-red-600" : textPrimary}`}>{t.title}</p>
                            <p className="text-xs text-gray-400">{t.subject}</p>
                          </div>
                          <span className={`text-xs font-black px-2 py-1 rounded-xl flex-shrink-0 ${urgent ? "bg-red-500 text-white" : sisa <= 3 ? "bg-yellow-400 text-black" : "bg-purple-100 text-purple-600"}`}>
                            {formatSisa(t.deadline)}
                          </span>
                        </div>
                        {t.subtasks.length > 0 && (
                          <>
                            <div className="h-1.5 bg-gray-200/60 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${persen}%`, background: urgent ? "#ef4444" : "linear-gradient(90deg,#8b5cf6,#ec4899)" }} />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{persen}% sub-task selesai</p>
                          </>
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rabbit Hole — full width on sm, 1 col on lg */}
          <div
            className="rounded-3xl p-4 md:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden sm:col-span-2 lg:col-span-1"
            style={{
              background: "linear-gradient(135deg, #fdf4ff, #fce7f3)",
              border: warMode ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(216,180,254,0.5)",
            }}
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-purple-300/20 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-pink-300/20 blur-xl" />
            <p className={`text-xs font-bold tracking-widest uppercase ${textSecondary} mb-1 relative z-10`}>Rabbit Hole Prevention</p>
            <p className={`text-lg md:text-xl font-black ${textPrimary} mb-4 relative z-10`}>Reality Check</p>
            <div className={`p-4 rounded-2xl relative z-10 ${warMode ? "bg-pink-50/60" : "bg-white/50"}`}>
              <p className="text-sm font-semibold leading-relaxed italic text-gray-700" key={quoteIdx} style={{ animation: "fade-in 0.5s ease" }}>
                "{currentQuote}"
              </p>
            </div>
            <p className="text-xs mt-3 relative z-10 text-purple-400/60">Pesan berganti otomatis setiap 8 detik...</p>
            <style>{`@keyframes fade-in { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }`}</style>
          </div>
        </div>
      </div>

      {/* ── Micro Adventure Button ── */}
      <button
        onClick={triggerAdventure}
        className="fixed bottom-8 right-4 md:right-8 w-12 h-12 md:w-14 md:h-14 rounded-2xl shadow-2xl flex items-center justify-center text-xl md:text-2xl transition-all hover:scale-110 active:scale-95 z-40"
        style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)", boxShadow: "0 8px 32px rgba(124,58,237,0.4)" }}
        title="Klik untuk Micro-Adventure!"
      >
        ?
      </button>

      {adventure && (
        <div className="fixed bottom-24 right-4 md:right-8 max-w-[280px] md:max-w-xs z-50 p-4 md:p-5 rounded-3xl shadow-2xl" style={{ background: "linear-gradient(135deg, #4f1d96, #831843)", animation: "slide-up 0.3s ease" }}>
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold tracking-widest uppercase text-purple-300">Micro-Adventure!</p>
            <span className="text-xs text-white/50 font-mono">{adventureTimer}s</span>
          </div>
          <p className="text-white font-bold text-sm leading-relaxed">{adventure}</p>
          <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-purple-400 rounded-full transition-all duration-1000" style={{ width: `${(adventureTimer / 15) * 100}%` }} />
          </div>
          <style>{`@keyframes slide-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }`}</style>
        </div>
      )}
    </div>
  );
}