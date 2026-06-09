"use client";
import { useState, useEffect, useRef, useReducer } from "react";

const RANKS = ["Beginner","Learner","Explorer","Researcher","Mastermind","Legend"];
const RANK_XP = [0,100,300,600,1000,1800];
const RANK_ICONS = ["🌱","📚","🚀","🏆","👑","💎"];
const MOODS = [
  {key:"semangat",label:"😊 Semangat",rec:"Waktu terbaik belajar! Selesaikan Daily Quest sekarang."},
  {key:"biasa",label:"😐 Biasa",rec:"Coba timer 25 menit, pas buat warmup ringan."},
  {key:"lelah",label:"😴 Lelah",rec:"Istirahat 10 menit. Minum air, lalu lanjut flashcard saja."},
  {key:"burnout",label:"😵 Burnout",rec:"Kamu butuh jeda. Buka Mystery Box sebagai reward!"},
];
const FLASHCARDS = [
  {q:"Apa itu pointer di C++?",a:"Variabel yang menyimpan alamat memori dari variabel lain. Dideklarasikan dengan *."},
  {q:"Bedanya array vs linked list?",a:"Array: ukuran tetap, akses O(1). Linked List: ukuran dinamis, akses O(n), insert/delete O(1)."},
  {q:"Apa itu Big-O Notation?",a:"Cara mengukur kompleksitas waktu/ruang algoritma terhadap pertumbuhan input n."},
  {q:"Perbedaan Stack vs Queue?",a:"Stack: LIFO (Last In First Out). Queue: FIFO (First In First Out)."},
  {q:"Apa itu recursion?",a:"Fungsi yang memanggil dirinya sendiri dengan base case untuk menghentikan proses."},
];
const COSTUMES = [
  {key:"default",label:"Default",icon:"🎓",unlock:0},
  {key:"hacker",label:"Hacker",icon:"💻",unlock:200},
  {key:"wizard",label:"Wizard",icon:"🧙",unlock:500},
  {key:"knight",label:"Knight",icon:"⚔️",unlock:1000},
];
const MAP_AREAS = [
  {key:"Hutan Fokus",icon:"🌲",desc:"Latih konsentrasi & deep work",color:"#16a34a",unlockLevel:1},
  {key:"Danau Konsisten",icon:"🌊",desc:"Bangun kebiasaan belajar harian",color:"#0284c7",unlockLevel:2},
  {key:"Kota Prestasi",icon:"🏙️",desc:"Raih achievement & rank baru",color:"#7c3aed",unlockLevel:3},
  {key:"Kastil Master",icon:"🏰",desc:"Area eksklusif Level 5 (Mastermind)",color:"#b45309",unlockLevel:5},
  {key:"Menara Legenda",icon:"🗼",desc:"Hanya untuk para Legend",color:"#dc2626",unlockLevel:6},
  {key:"Dimensi Chaos",icon:"🌀",desc:"Rahasia — unlock 1800 XP",color:"#6366f1",unlockLevel:7},
];
const MYSTERY_REWARDS = [
  {type:"xp",label:"+ 50 XP Bonus!",icon:"⚡",amount:50},
  {type:"coin",label:"+ 30 Koin!",icon:"🪙",amount:30},
  {type:"badge",label:"Badge: Pemburu XP!",icon:"🏅"},
  {type:"energy",label:"+ 20 Energi!",icon:"💚",amount:20},
];
const ALL_ACHIEVEMENTS = [
  {key:"Mulai Perjalanan",icon:"🌱",desc:"Login pertama kali",check:(s:any)=>true},
  {key:"7 Hari Konsisten",icon:"🔥",desc:"Streak 7 hari berturut-turut",check:(s:any)=>s.streak>=7},
  {key:"Raja Catatan",icon:"📝",desc:"Buat 5 catatan",check:(s:any)=>s.noteCount>=5},
  {key:"Master Fokus",icon:"⏱",desc:"Selesaikan 5 sesi Focus Mode",check:(s:any)=>s.focusSessions>=5},
  {key:"Pemburu XP",icon:"⚡",desc:"Kumpulkan 500 XP",check:(s:any)=>s.totalXpEarned>=500},
  {key:"Produktif Level Dewa",icon:"🚀",desc:"Selesaikan 10 Daily Quest",check:(s:any)=>s.totalQuestsDone>=10},
  {key:"Raja Flashcard",icon:"🃏",desc:"Review 20 flashcard",check:(s:any)=>s.flashcardViewed>=20},
  {key:"Money Saver",icon:"💰",desc:"Catat 10 transaksi",check:(s:any)=>s.transactions.length>=10},
  {key:"Explorer",icon:"🗺️",desc:"Kunjungi 3 area Study Map",check:(s:any)=>s.mapVisited.length>=3},
  {key:"Peneliti Muda",icon:"🔬",desc:"Gunakan AI Belajar Kilat 3 kali",check:(s:any)=>s.aiAnalyzeCount>=3},
];
const CAT_ICONS={Jajan:"🍜",Kopi:"☕",Game:"🎮",Hiburan:"🎬",Pendidikan:"📚",Transportasi:"🚗",Belanja:"🛒",Lainnya:"💰"};
const TABS=[
  {key:"dashboard",label:"Life Dashboard",icon:"🌈"},
  {key:"quest",label:"Daily Quest",icon:"🎯"},
  {key:"companion",label:"Plot & Twist",icon:"🐾"},
  {key:"map",label:"Study Maps",icon:"🗺️"},
  {key:"focus",label:"Focus Arena",icon:"🔥"},
  {key:"mystery",label:"Mystery Box",icon:"🎲"},
  {key:"achievement",label:"Achievement",icon:"🏆"},
  {key:"mood",label:"Mood Tracker",icon:"📈"},
  {key:"skill",label:"Skill Collection",icon:"🚀"},
  {key:"journey",label:"Learning Journey",icon:"🌟"},
  {key:"rank",label:"Rank System",icon:"🎖️"},
  {key:"money",label:"Money Tracker",icon:"💰"},
  {key:"calc",label:"Smart Calculator",icon:"🧮"},
];

const INIT={
  xp:0,coins:0,energy:50,maxEnergy:100,streak:0,mood:"semangat",
  totalXpEarned:0,totalQuestsDone:0,focusSessions:0,aiAnalyzeCount:0,
  noteCount:0,flashcardViewed:0,
  achievements:["Mulai Perjalanan"],
  mapVisited:["Hutan Fokus"],studyMapArea:"Hutan Fokus",
  dailyQuests:[
    {id:1,label:"Baca materi 15 menit",xp:30,coin:10,done:false,icon:"📖",type:"read"},
    {id:2,label:"Buat 1 catatan",xp:20,coin:8,done:false,icon:"✍️",type:"note"},
    {id:3,label:"Kerjakan 5 soal",xp:50,coin:15,done:false,icon:"🧩",type:"quiz"},
    {id:4,label:"Buka Focus Mode 25 min",xp:40,coin:12,done:false,icon:"🔥",type:"focus"},
  ],
  transactions:[],
  savingTarget:8000000,savingNow:0,savingMonthly:500000,
  moodHistory:[],flashcardIdx:0,aiMessages:[],
  notesList:[],focusHistory:[],
  mysteryLastOpened:null,
  learningTarget:100,learningDone:0,
  lastLoginDate:null,
  learningMilestones:[
    {id:1,label:"Selesaikan Modul Dasar",done:false,date:"Jun 2026"},
    {id:2,label:"Target 50 Jam Belajar",done:false,date:"Agu 2026"},
    {id:3,label:"Capai Rank Explorer",done:false,date:"Sep 2026"},
    {id:4,label:"Selesaikan 100 Jam Belajar",done:false,date:"Des 2026"},
  ],
};

function getRankIdx(xp:any){let i=0;for(let j=0;j<RANK_XP.length;j++){if(xp>=RANK_XP[j])i=j;}return i;}
function getEvo(xp:any){if(xp>=1000)return"legend";if(xp>=300)return"adult";if(xp>=100)return"teen";return"baby";}
function checkAch(state){
  const newOnes=ALL_ACHIEVEMENTS.filter(a=>a.check(state)&&!state.achievements.includes(a.key)).map(a=>a.key);
  return newOnes.length>0?[...state.achievements,...newOnes]:state.achievements;
}

function reducer(state,action){
  let next={...state};
  switch(action.type){
    case"COMPLETE_QUEST":{
      const q=state.dailyQuests.find(q=>q.id===action.id);
      if(!q||q.done)return state;
      next={...state,dailyQuests:state.dailyQuests.map(q=>q.id===action.id?{...q,done:true}:q),
        xp:state.xp+q.xp,coins:state.coins+q.coin,
        totalXpEarned:state.totalXpEarned+q.xp,totalQuestsDone:state.totalQuestsDone+1};break;
    }
    case"ADD_XP":next={...state,xp:state.xp+action.amount,totalXpEarned:state.totalXpEarned+action.amount};break;
    case"ADD_COIN":next={...state,coins:state.coins+action.amount};break;
    case"ADD_ENERGY":next={...state,energy:Math.min(state.maxEnergy,state.energy+action.amount)};break;
    case"SET_MOOD":{
      const h=[...state.moodHistory,{date:new Date().toLocaleDateString("id-ID",{day:"numeric",month:"short"}),mood:action.mood}].slice(-7);
      next={...state,mood:action.mood,moodHistory:h};break;
    }
    case"SET_COSTUME":next={...state,mascotCostume:action.costume};break;
    case"SET_MAP_AREA":next={...state,studyMapArea:action.area,mapVisited:[...new Set([...state.mapVisited,action.area])]};break;
    case"NEXT_FC":next={...state,flashcardIdx:(state.flashcardIdx+1)%FLASHCARDS.length,flashcardViewed:state.flashcardViewed+1};break;
    case"PREV_FC":next={...state,flashcardIdx:(state.flashcardIdx-1+FLASHCARDS.length)%FLASHCARDS.length};break;
    case"ADD_AI_MSG":next={...state,aiMessages:[...state.aiMessages,{role:action.role,content:action.content}]};break;
    case"CLEAR_AI":next={...state,aiMessages:[]};break;
    case"ADD_TRANSACTION":next={...state,transactions:[...state.transactions,action.tx]};break;
    case"AI_ANALYZE":next={...state,aiAnalyzeCount:state.aiAnalyzeCount+1,xp:state.xp+20,totalXpEarned:state.totalXpEarned+20};break;
    case"ADD_NOTE":next={...state,noteCount:state.noteCount+1,notesList:[...state.notesList,action.note]};break;
    case"ADD_FOCUS":next={...state,focusSessions:state.focusSessions+1,xp:state.xp+40,totalXpEarned:state.totalXpEarned+40,coins:state.coins+15,
      focusHistory:[...state.focusHistory,{date:new Date().toLocaleDateString("id-ID"),mins:action.mins}],
      learningDone:state.learningDone+Math.floor(action.mins/60)};break;
    case"MYSTERY_OPEN":{
      const r=action.reward;
      next={...state,mysteryLastOpened:Date.now()};
      if(r.type==="xp"){next.xp+=r.amount;next.totalXpEarned+=r.amount;}
      if(r.type==="coin")next.coins+=r.amount;
      if(r.type==="energy")next.energy=Math.min(state.maxEnergy,state.energy+r.amount);
      if(r.type==="badge")next.achievements=[...new Set([...state.achievements,"Pemburu XP"])];
      break;
    }
    case"UPDATE_JOURNEY":next={...state,...action.data};break;
    case"TOGGLE_MILESTONE":{
      const ms=state.learningMilestones.map(m=>m.id===action.id?{...m,done:!m.done}:m);
      const done=ms.filter(m=>m.done).length;
      next={...state,learningMilestones:ms,learningDone:Math.round((done/ms.length)*state.learningTarget)};break;
    }
    case"UPDATE_MILESTONE":next={...state,learningMilestones:state.learningMilestones.map(m=>m.id===action.id?{...m,...action.data}:m)};break;
    case"ADD_MILESTONE":next={...state,learningMilestones:[...state.learningMilestones,{id:Date.now(),label:action.label,done:false,date:""}]};break;
    case"FOCUS_QUEST_DONE":next={...state,dailyQuests:state.dailyQuests.map(q=>q.id===4?{...q,done:true}:q),totalQuestsDone:state.totalQuestsDone+1};break;
    case"UPDATE_STREAK":next={...state,streak:action.streak,lastLoginDate:action.date};break;
    case"RESET_DAILY":
      if(state.lastLoginDate&&state.lastLoginDate!==action.date){
        next={...state,dailyQuests:state.dailyQuests.map(q=>({...q,done:false}))};
      }
      break;
    default:return state;
  }
  next.mascotEvo=getEvo(next.xp);
  next.mascotLevel=getRankIdx(next.xp)+1;
  next.achievements=checkAch(next);
  return next;
}

// ── CLAUDE API ────────────────────────────────────────────────────────────────
async function callClaude(messages, system="Kamu adalah AI Mentor belajar yang membantu pelajar Indonesia. Jawab dengan bahasa Indonesia yang ramah, jelas, dan semangat. Gunakan emoji sesekali.") {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system,
      messages,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.content?.map(c => c.text || "").join("") || "Maaf, tidak bisa menjawab sekarang.";
}

// Membaca file sebagai teks (untuk TXT, source code, dll.)
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsText(file, "UTF-8");
  });
}

// Membaca file sebagai base64 (untuk PDF, gambar, dll.)
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

function Mascot({evo,costume,mood,size=56}){
  const c=COSTUMES.find(c=>c.key===(costume||"default"))||COSTUMES[0];
  const evoBorder={baby:"#fca5a5",teen:"#818cf8",adult:"#c4b5fd",legend:"#fcd34d"};
  const border=evoBorder[evo]||"#818cf8";
  const moodEmoji={semangat:"⚡",biasa:"😊",lelah:"😴",burnout:"😵"};
  return(
    <div style={{userSelect:"none",display:"flex",flexDirection:"column",alignItems:"center",position:"relative"}}>
      <div style={{width:size,height:size,borderRadius:"50%",border:`3px solid ${border}`,overflow:"hidden",position:"relative",flexShrink:0,
        boxShadow:`0 0 0 2px ${border}44, 0 4px 14px rgba(0,0,0,0.15)`}}>
        <img src="/petualang.png" alt="Mascot"
          style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
          onError={e=>{
            e.target.style.display="none";
            e.target.parentNode.style.background=`radial-gradient(circle at 35% 35%, ${border}88, ${border})`;
            e.target.parentNode.innerHTML=`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:${size*0.38}px">🎭</div>`;
          }}/>
      </div>
      <span style={{position:"absolute",bottom:-4,right:-4,fontSize:Math.max(10,size*0.22),lineHeight:1,
        background:"#fff",borderRadius:"50%",padding:1,boxShadow:"0 1px 4px rgba(0,0,0,0.15)"}}>
        {moodEmoji[mood]||"😊"}
      </span>
      {c.key!=="default"&&<span style={{position:"absolute",top:-4,right:-4,fontSize:Math.max(8,size*0.18),lineHeight:1,
        background:"#fff",borderRadius:"50%",padding:1,boxShadow:"0 1px 4px rgba(0,0,0,0.15)"}}>
        {c.icon}
      </span>}
    </div>
  );
}

function XPBar({xp}){
  const i=getRankIdx(xp),cur=RANK_XP[i]||0,nxt=RANK_XP[i+1]||cur+200;
  const pct=Math.min(100,Math.round(((xp-cur)/(nxt-cur))*100));
  return(
    <div style={{background:"#eef2ff",borderRadius:12,padding:"10px 14px",width:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:11,fontWeight:800,color:"#6366f1"}}>{RANK_ICONS[i]} {RANKS[i]}</span>
        <span style={{fontSize:10,color:"#94a3b8",fontWeight:700}}>{xp} XP</span>
      </div>
      <div style={{background:"#e0e7ff",borderRadius:8,height:6,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#818cf8,#6366f1)",borderRadius:8,transition:"width .6s"}}/>
      </div>
    </div>
  );
}

function Card({children,style:s={}}){return<div style={{background:"#fff",borderRadius:20,padding:"16px 18px",border:"1.5px solid #e8eaf2",...s}}>{children}</div>;}

function FlipCard({card}){
  const[flipped,setFlipped]=useState(false);
  return(
    <div onClick={()=>setFlipped(f=>!f)} style={{cursor:"pointer",perspective:600,height:110,userSelect:"none"}}>
      <div style={{position:"relative",width:"100%",height:"100%",transformStyle:"preserve-3d",transition:"transform 0.45s",transform:flipped?"rotateY(180deg)":"rotateY(0deg)"}}>
        <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",background:"linear-gradient(135deg,#eef2ff,#e0e7ff)",borderRadius:16,padding:"14px 16px",display:"flex",flexDirection:"column",justifyContent:"space-between",border:"1.5px solid #c7d2fe"}}>
          <p style={{fontSize:12,fontWeight:800,color:"#4338ca",margin:0}}>{card.q}</p>
          <p style={{fontSize:10,color:"#818cf8",fontWeight:700,margin:0}}>Klik untuk lihat jawaban 🔄</p>
        </div>
        <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",transform:"rotateY(180deg)",background:"linear-gradient(135deg,#f0fdf4,#d1fae5)",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",border:"1.5px solid #6ee7b7"}}>
          <p style={{fontSize:11,fontWeight:700,color:"#065f46",margin:0,lineHeight:1.5}}>{card.a}</p>
        </div>
      </div>
    </div>
  );
}

function MindMapSVG(){
  const nodes=[{id:"r",label:"Linked List",x:320,y:170,r:44,color:"#6366f1"},{id:"n1",label:"Node",x:150,y:80,r:34,color:"#8b5cf6"},{id:"n2",label:"Pointer",x:500,y:80,r:34,color:"#8b5cf6"},{id:"n3",label:"Insert",x:90,y:250,r:30,color:"#06b6d4"},{id:"n4",label:"Delete",x:210,y:300,r:30,color:"#06b6d4"},{id:"n5",label:"Traverse",x:440,y:300,r:30,color:"#06b6d4"},{id:"n6",label:"Head/Tail",x:560,y:240,r:30,color:"#06b6d4"},{id:"n7",label:"Singly",x:650,y:150,r:26,color:"#f59e0b"},{id:"n8",label:"Doubly",x:650,y:220,r:26,color:"#f59e0b"},{id:"n9",label:"Circular",x:650,y:290,r:26,color:"#f59e0b"}];
  const edges=[["r","n1"],["r","n2"],["r","n3"],["r","n4"],["r","n5"],["r","n6"],["n2","n7"],["n2","n8"],["n2","n9"]];
  return(
    <div style={{overflowX:"auto",borderRadius:16}}>
      <svg viewBox="0 0 700 360" style={{width:"100%",minWidth:520,display:"block"}}>
        {edges.map(([a,b])=>{const na=nodes.find(n=>n.id===a),nb=nodes.find(n=>n.id===b);return<line key={a+b}x1={na.x}y1={na.y}x2={nb.x}y2={nb.y}stroke="#c7d2fe"strokeWidth={2}/>;} )}
        {nodes.map(n=><g key={n.id}><circle cx={n.x}cy={n.y}r={n.r}fill={n.color}opacity={0.9}/><text x={n.x}y={n.y+1}textAnchor="middle"dominantBaseline="middle"fontSize={n.r>40?13:10}fill="#fff"fontWeight="800">{n.label}</text></g>)}
      </svg>
    </div>
  );
}

// ── DOTS LOADING ─────────────────────────────────────────────────────────────
function LoadingDots(){
  return(
    <div style={{display:"flex",gap:6,justifyContent:"center",padding:16}}>
      {[0,1,2].map(i=><div key={i}style={{width:8,height:8,borderRadius:"50%",background:"#818cf8",animation:`bounce 1s ease ${i*0.2}s infinite`}}/>)}
    </div>
  );
}

// ── TAB: DASHBOARD ───────────────────────────────────────────────────────────
function TabDashboard({s,d,setTab}){
  const totalIn=s.transactions.filter(t=>t.type==="in").reduce((a,b)=>a+b.amount,0);
  const totalOut=s.transactions.filter(t=>t.type==="out").reduce((a,b)=>a+b.amount,0);
  const ri=getRankIdx(s.xp);
  const mo=MOODS.find(m=>m.key===s.mood)||MOODS[0];
  const qd=s.dailyQuests.filter(q=>q.done).length;
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
      <div style={{background:"linear-gradient(135deg,#1e1b4b,#312e81)",borderRadius:24,padding:20,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
        <Mascot evo={s.mascotEvo}costume={s.mascotCostume}mood={s.mood}size={80}/>
        <p style={{margin:0,fontWeight:900,color:"#fff",fontSize:16}}>Plot & Twist</p>
        <p style={{margin:0,fontSize:11,color:"#818cf8"}}>Level {s.mascotLevel} · {s.mascotEvo}</p>
        <XPBar xp={s.xp}/>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
          <span style={{background:"rgba(255,255,255,.12)",color:"#fbbf24",fontSize:10,fontWeight:800,padding:"4px 10px",borderRadius:8}}>🪙 {s.coins}</span>
          <span style={{background:"rgba(255,255,255,.12)",color:"#f87171",fontSize:10,fontWeight:800,padding:"4px 10px",borderRadius:8}}>🔥 {s.streak}</span>
          <span style={{background:"rgba(255,255,255,.12)",color:"#6ee7b7",fontSize:10,fontWeight:800,padding:"4px 10px",borderRadius:8}}>💚 {s.energy}</span>
        </div>
      </div>
      <Card>
        <p style={{margin:"0 0 8px",fontSize:13,fontWeight:900,color:"#1e1b4b"}}>📈 Mood Hari Ini</p>
        <p style={{margin:"0 0 4px",fontSize:28}}>{mo.label.split(" ")[0]}</p>
        <p style={{margin:"0 0 10px",fontSize:13,fontWeight:800,color:"#1e1b4b"}}>{mo.label.split(" ").slice(1).join(" ")}</p>
        <div style={{background:"#f0fdf4",borderRadius:12,padding:"10px 12px",border:"1px solid #bbf7d0",marginBottom:10}}>
          <p style={{margin:0,fontSize:11,color:"#065f46",fontWeight:700,lineHeight:1.6}}>🤖 {mo.rec}</p>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {MOODS.map(m=><button key={m.key}onClick={()=>d({type:"SET_MOOD",mood:m.key})}style={{background:s.mood===m.key?"#6366f1":"#f1f5ff",color:s.mood===m.key?"#fff":"#4f46e5",border:"none",borderRadius:10,padding:"5px 10px",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{m.label.split(" ")[0]}</button>)}
        </div>
      </Card>
      <Card>
        <p style={{margin:"0 0 12px",fontSize:13,fontWeight:900,color:"#1e1b4b"}}>💰 Keuangan</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div style={{background:"#f0fdf4",borderRadius:12,padding:"10px 12px",border:"1px solid #bbf7d0"}}><p style={{margin:0,fontSize:9,color:"#16a34a",fontWeight:800}}>MASUK</p><p style={{margin:0,fontSize:15,fontWeight:900,color:"#166534"}}>Rp{(totalIn/1000).toFixed(0)}rb</p></div>
          <div style={{background:"#fef2f2",borderRadius:12,padding:"10px 12px",border:"1px solid #fecaca"}}><p style={{margin:0,fontSize:9,color:"#dc2626",fontWeight:800}}>KELUAR</p><p style={{margin:0,fontSize:15,fontWeight:900,color:"#991b1b"}}>Rp{(totalOut/1000).toFixed(0)}rb</p></div>
        </div>
        <div style={{background:"#f8faff",borderRadius:12,padding:"10px 12px",border:"1px solid #e0e7ff"}}><p style={{margin:0,fontSize:9,color:"#6366f1",fontWeight:800}}>SALDO</p><p style={{margin:0,fontSize:15,fontWeight:900,color:"#4f46e5"}}>Rp{((totalIn-totalOut)/1000).toFixed(0)}rb</p></div>
      </Card>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <p style={{margin:0,fontSize:13,fontWeight:900,color:"#1e1b4b"}}>🎯 Daily Quest</p>
          <button onClick={()=>setTab("quest")}style={{background:"#eef2ff",color:"#4f46e5",border:"none",borderRadius:10,padding:"4px 10px",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Lihat →</button>
        </div>
        <div style={{background:"#e0e7ff",borderRadius:8,height:7,overflow:"hidden",marginBottom:8}}>
          <div style={{height:"100%",width:`${Math.round(qd/s.dailyQuests.length*100)}%`,background:"linear-gradient(90deg,#818cf8,#6366f1)",borderRadius:8,transition:"width .5s"}}/>
        </div>
        <p style={{margin:"0 0 8px",fontSize:11,color:"#6366f1",fontWeight:800}}>{qd}/{s.dailyQuests.length} selesai</p>
        {s.dailyQuests.map(q=>(
          <div key={q.id}style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
            <div style={{width:16,height:16,borderRadius:5,background:q.done?"#6366f1":"#e0e7ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,flexShrink:0,color:"#fff"}}>{q.done?"✓":""}</div>
            <span style={{fontSize:11,fontWeight:700,color:q.done?"#94a3b8":"#1e1b4b",textDecoration:q.done?"line-through":"none"}}>{q.label}</span>
          </div>
        ))}
      </Card>
      <div style={{background:"linear-gradient(135deg,#f0f9ff,#e0f2fe)",borderRadius:20,padding:16,border:"1.5px solid #bae6fd"}}>
        <p style={{margin:"0 0 6px",fontSize:13,fontWeight:900,color:"#0c4a6e"}}>🎖️ Rank Saat Ini</p>
        <p style={{margin:"0 0 2px",fontSize:36}}>{RANK_ICONS[ri]}</p>
        <p style={{margin:"0 0 10px",fontSize:18,fontWeight:900,color:"#0369a1"}}>{RANKS[ri]}</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {s.achievements.slice(-3).map(a=><span key={a}style={{background:"#fff",color:"#0369a1",fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:8,border:"1px solid #bae6fd"}}>🏅 {a}</span>)}
        </div>
      </div>
      <Card>
        <p style={{margin:"0 0 10px",fontSize:13,fontWeight:900,color:"#1e1b4b"}}>💚 Energi & Belajar</p>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,fontWeight:800,color:"#16a34a"}}>Energi</span><span style={{fontSize:11,fontWeight:800,color:"#166534"}}>{s.energy}/{s.maxEnergy}</span></div>
        <div style={{background:"#dcfce7",borderRadius:8,height:8,overflow:"hidden",marginBottom:12}}>
          <div style={{height:"100%",width:`${Math.round(s.energy/s.maxEnergy*100)}%`,background:"linear-gradient(90deg,#6ee7b7,#22c55e)",borderRadius:8,transition:"width .5s"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,fontWeight:800,color:"#6366f1"}}>Target Belajar</span><span style={{fontSize:11,fontWeight:800,color:"#4f46e5"}}>{s.learningDone}/{s.learningTarget}h</span></div>
        <div style={{background:"#e0e7ff",borderRadius:8,height:8,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.min(100,Math.round(s.learningDone/s.learningTarget*100))}%`,background:"linear-gradient(90deg,#a5b4fc,#6366f1)",borderRadius:8,transition:"width .5s"}}/>
        </div>
      </Card>
      <div style={{gridColumn:"1/4",background:"#fff",borderRadius:20,padding:16,border:"1.5px solid #e8eaf2"}}>
        <p style={{margin:"0 0 12px",fontSize:13,fontWeight:900,color:"#1e1b4b"}}>📊 Statistik Global</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}}>
          {[["⚡","Total XP",s.xp],["🪙","Koin",s.coins],["🔥","Streak",s.streak],["📝","Catatan",s.noteCount],["⏱","Sesi Fokus",s.focusSessions],["🧠","AI Analisis",s.aiAnalyzeCount]].map(([ic,lb,vl])=>(
            <div key={lb}style={{background:"#f8faff",borderRadius:14,padding:"10px 12px",textAlign:"center",border:"1px solid #e0e7ff"}}>
              <p style={{margin:0,fontSize:18}}>{ic}</p>
              <p style={{margin:0,fontSize:16,fontWeight:900,color:"#1e1b4b"}}>{vl}</p>
              <p style={{margin:0,fontSize:9,color:"#94a3b8",fontWeight:700}}>{lb}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── TAB: DAILY QUEST ─────────────────────────────────────────────────────────
function TabQuest({s,d}){
  const[active,setActive]=useState(null);
  // --- Baca Materi state ---
  const[readFileName,setReadFileName]=useState(null);
  const[readFileURL,setReadFileURL]=useState(null);   // blob URL untuk preview
  const[readFileType,setReadFileType]=useState(null); // "pdf" | "image" | "text"
  const[readFileText,setReadFileText]=useState(null); // isi teks kalau .txt
  const[readTimer,setReadTimer]=useState(0);
  const[readRunning,setReadRunning]=useState(false);
  const readRef=useRef(null);
  // cleanup blob URL saat unmount
  useEffect(()=>()=>{if(readFileURL)URL.revokeObjectURL(readFileURL);},[readFileURL]);

  const[noteFile,setNoteFile]=useState(null);
  const[noteInput,setNoteInput]=useState("");
  const[quizLoading,setQuizLoading]=useState(false);
  const[quizData,setQuizData]=useState(null);
  const[quizAnswers,setQuizAnswers]=useState({});
  const[quizScore,setQuizScore]=useState(null);

  useEffect(()=>{
    if(readRunning){readRef.current=setInterval(()=>setReadTimer(t=>{if(t>=900){clearInterval(readRef.current);setReadRunning(false);return 900;}return t+1;}),1000);}
    else clearInterval(readRef.current);
    return()=>clearInterval(readRef.current);
  },[readRunning]);

  const handleReadFile = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    // Hapus blob URL lama kalau ada
    if(readFileURL) URL.revokeObjectURL(readFileURL);
    const url = URL.createObjectURL(file);
    setReadFileName(file.name);
    setReadFileURL(url);
    setReadFileText(null);
    setReadTimer(0);
    setReadRunning(false);
    if(file.type === "application/pdf"){
      setReadFileType("pdf");
    } else if(file.type.startsWith("image/")){
      setReadFileType("image");
    } else {
      // teks biasa: baca isinya
      setReadFileType("text");
      try{const txt=await file.text();setReadFileText(txt);}
      catch{setReadFileText("[Tidak bisa membaca isi file ini]");}
    }
  };

  const completeRead=()=>{
    if(readTimer>=300){ // minimal 5 menit membaca
      d({type:"COMPLETE_QUEST",id:1});
      setActive(null);
      // bersihkan
      if(readFileURL)URL.revokeObjectURL(readFileURL);
      setReadFileURL(null);setReadFileName(null);setReadFileType(null);setReadFileText(null);
    }
  };

  const doFile=(e,setter)=>{const f=e.target.files[0];if(f)setter(f.name);};
  const completeNote=()=>{
    if(noteInput.trim().length>=10){
      d({type:"ADD_NOTE",note:{text:noteInput,file:noteFile,date:new Date().toLocaleDateString("id-ID")}});
      d({type:"COMPLETE_QUEST",id:2});setNoteInput("");setNoteFile(null);setActive(null);
    }
  };
  const loadQuiz=async()=>{
    setQuizLoading(true);setQuizData(null);setQuizAnswers({});setQuizScore(null);
    try{
      const txt=await callClaude([{role:"user",content:"Buatkan 5 soal pilihan ganda random tentang materi kuliah (bisa Matematika, Fisika, Pemrograman, atau Bahasa Indonesia). Format HANYA JSON array: [{\"q\":\"...\",\"opts\":[\"A\",\"B\",\"C\",\"D\"],\"ans\":0},...]"}],"Kembalikan HANYA array JSON tanpa teks lain, tanpa markdown, tanpa ```json.");
      const clean=txt.replace(/```json|```/g,"").trim();
      setQuizData(JSON.parse(clean));
    }catch(e){
      setQuizData([
        {q:"Berapa hasil dari 2³?",opts:["4","6","8","16"],ans:2},
        {q:"Siapa penemu gravitasi?",opts:["Einstein","Newton","Galileo","Tesla"],ans:1},
        {q:"HTML singkatan dari?",opts:["High Text Markup Language","HyperText Markup Language","HyperText Machine Language","High Tech Modern Language"],ans:1},
        {q:"Rumus luas lingkaran?",opts:["πr","2πr","πr²","2πr²"],ans:2},
        {q:"Bahasa pemrograman yang pakai indentasi sebagai sintaks?",opts:["Java","C++","Python","JavaScript"],ans:2},
      ]);
    }
    setQuizLoading(false);
  };
  const submitQuiz=()=>{
    let c=0;quizData.forEach((q,i)=>{if(quizAnswers[i]===q.ans)c++;});
    setQuizScore(c);
    if(c>=3){d({type:"COMPLETE_QUEST",id:3});d({type:"ADD_XP",amount:c*5});}
  };

  if(active===1)return(
    <div style={{maxWidth:"100%"}}>
      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,flexWrap:"wrap"}}>
        <button onClick={()=>{setActive(null);setReadRunning(false);if(readFileURL){URL.revokeObjectURL(readFileURL);setReadFileURL(null);}setReadFileName(null);setReadFileType(null);setReadTimer(0);}}style={backBtnStyle}>← Kembali</button>
        <h2 style={{margin:0,fontSize:15,fontWeight:900,color:"#1e1b4b",flex:1}}>📖 Baca Materi</h2>
        {/* Timer pill */}
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#1e1b4b",borderRadius:14,padding:"8px 16px"}}>
          <div style={{position:"relative",width:36,height:36}}>
            <svg width={36}height={36}viewBox="0 0 36 36">
              <circle cx={18}cy={18}r={15}fill="none"stroke="#312e81"strokeWidth={3}/>
              <circle cx={18}cy={18}r={15}fill="none"stroke={readTimer>=300?"#22c55e":"#6366f1"}strokeWidth={3}
                strokeDasharray={`${2*Math.PI*15}`}
                strokeDashoffset={`${2*Math.PI*15*(1-Math.min(readTimer,900)/900)}`}
                strokeLinecap="round"transform="rotate(-90 18 18)"style={{transition:"stroke-dashoffset 1s"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:7,fontWeight:900,color:"#fff",fontFamily:"monospace"}}>{Math.floor(readTimer/60)}'</span>
            </div>
          </div>
          <div>
            <p style={{margin:0,fontSize:16,fontWeight:900,color:"#fff",fontFamily:"monospace",lineHeight:1}}>{String(Math.floor(readTimer/60)).padStart(2,"0")}:{String(readTimer%60).padStart(2,"0")}</p>
            <p style={{margin:0,fontSize:8,color:"#818cf8"}}>min 5 mnt untuk klaim</p>
          </div>
          <div style={{display:"flex",gap:6,marginLeft:8}}>
            <button onClick={()=>setReadRunning(r=>!r)}disabled={!readFileURL}
              style={{background:readRunning?"#f59e0b":"#6366f1",color:"#fff",border:"none",borderRadius:10,padding:"5px 12px",fontSize:11,fontWeight:900,cursor:readFileURL?"pointer":"not-allowed",fontFamily:"inherit",opacity:readFileURL?1:0.5}}>
              {readRunning?"⏸":"▶"}
            </button>
            <button onClick={()=>{setReadRunning(false);setReadTimer(0);}}
              style={{background:"rgba(255,255,255,.1)",color:"#c7d2fe",border:"none",borderRadius:10,padding:"5px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>↩</button>
          </div>
          {readTimer>=300&&(
            <button onClick={completeRead}style={{background:"#22c55e",color:"#fff",border:"none",borderRadius:10,padding:"5px 14px",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"inherit",marginLeft:4}}>
              ✅ Klaim XP!
            </button>
          )}
        </div>
      </div>

      {/* Upload area atau viewer */}
      {!readFileURL ? (
        /* Belum ada file — tampilkan upload zone */
        <div style={{background:"#fff",borderRadius:20,border:"1.5px solid #e8eaf2",padding:32,textAlign:"center"}}>
          <p style={{fontSize:48,margin:"0 0 12px"}}>📄</p>
          <p style={{fontSize:14,fontWeight:900,color:"#1e1b4b",margin:"0 0 6px"}}>Upload file materi kamu</p>
          <p style={{fontSize:11,color:"#94a3b8",margin:"0 0 20px"}}>PDF, gambar (JPG/PNG), atau file teks — akan ditampilkan langsung di sini untuk kamu baca</p>
          <label style={{display:"inline-flex",alignItems:"center",gap:10,padding:"12px 28px",borderRadius:14,border:"2px dashed #6366f1",cursor:"pointer",background:"#eef2ff"}}>
            <span style={{fontSize:20}}>📁</span>
            <span style={{fontSize:13,fontWeight:800,color:"#4f46e5"}}>Pilih File Materi</span>
            <input type="file" style={{display:"none"}} onChange={handleReadFile} accept=".pdf,.png,.jpg,.jpeg,.txt,.md"/>
          </label>
          <p style={{margin:"12px 0 0",fontSize:10,color:"#94a3b8"}}>Timer belajar akan mulai setelah kamu upload file dan klik ▶ Mulai</p>
        </div>
      ) : (
        /* Ada file — tampilkan viewer + opsi ganti file */
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {/* Header file */}
          <div style={{display:"flex",alignItems:"center",gap:10,background:"#fff",borderRadius:14,padding:"10px 14px",border:"1.5px solid #e0e7ff"}}>
            <span style={{fontSize:20}}>{readFileType==="pdf"?"📄":readFileType==="image"?"🖼️":"📝"}</span>
            <span style={{fontSize:12,fontWeight:800,color:"#1e1b4b",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{readFileName}</span>
            <label style={{display:"flex",alignItems:"center",gap:6,background:"#eef2ff",color:"#4f46e5",borderRadius:10,padding:"5px 12px",fontSize:10,fontWeight:800,cursor:"pointer"}}>
              🔄 Ganti File
              <input type="file" style={{display:"none"}} onChange={handleReadFile} accept=".pdf,.png,.jpg,.jpeg,.txt,.md"/>
            </label>
          </div>

          {/* PDF Viewer */}
          {readFileType==="pdf"&&(
            <div style={{background:"#1e1b4b",borderRadius:16,overflow:"hidden",border:"1.5px solid #312e81"}}>
              <div style={{padding:"8px 14px",display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid #312e81"}}>
                <span style={{fontSize:12}}>📄</span>
                <span style={{fontSize:11,fontWeight:800,color:"#c7d2fe",flex:1}}>{readFileName}</span>
                <a href={readFileURL} target="_blank" rel="noopener noreferrer"
                  style={{background:"#6366f1",color:"#fff",borderRadius:8,padding:"3px 10px",fontSize:9,fontWeight:800,textDecoration:"none"}}>
                  Buka Tab Baru ↗
                </a>
              </div>
              <iframe
                src={readFileURL+"#toolbar=1&navpanes=1&scrollbar=1&view=FitH"}
                title="PDF Viewer"
                style={{width:"100%",height:"70vh",border:"none",display:"block",background:"#fff"}}
              />
            </div>
          )}

          {/* Image Viewer */}
          {readFileType==="image"&&(
            <div style={{background:"#1e1b4b",borderRadius:16,overflow:"hidden",border:"1.5px solid #312e81",padding:12,textAlign:"center"}}>
              <img src={readFileURL} alt={readFileName}
                style={{maxWidth:"100%",maxHeight:"70vh",borderRadius:10,objectFit:"contain"}}/>
            </div>
          )}

          {/* Text Viewer */}
          {readFileType==="text"&&(
            <div style={{background:"#0f172a",borderRadius:16,border:"1.5px solid #312e81",overflow:"hidden"}}>
              <div style={{padding:"8px 14px",borderBottom:"1px solid #312e81",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12}}>📝</span>
                <span style={{fontSize:11,fontWeight:800,color:"#c7d2fe"}}>{readFileName}</span>
              </div>
              <pre style={{margin:0,padding:16,fontSize:12,color:"#e2e8f0",lineHeight:1.8,overflowY:"auto",maxHeight:"70vh",whiteSpace:"pre-wrap",wordBreak:"break-word",fontFamily:"'JetBrains Mono', monospace"}}>
                {readFileText}
              </pre>
            </div>
          )}

          <p style={{margin:0,fontSize:10,color:"#94a3b8",textAlign:"center"}}>
            {readTimer<300
              ? `⏱ Baca minimal 5 menit untuk klaim XP · Sudah ${Math.floor(readTimer/60)} menit ${readTimer%60} detik`
              : "✅ Sudah 5 menit! Klik tombol Klaim XP di atas."}
          </p>
        </div>
      )}
    </div>
  );
  if(active===2)return(
    <div style={{maxWidth:520}}>
      <button onClick={()=>setActive(null)}style={backBtnStyle}>← Kembali</button>
      <Card>
        <p style={{margin:"0 0 14px",fontSize:15,fontWeight:900,color:"#1e1b4b"}}>✍️ Buat 1 Catatan</p>
        <div style={{marginBottom:14}}>
          <p style={{margin:"0 0 6px",fontSize:11,fontWeight:800,color:"#64748b"}}>Upload referensi (opsional):</p>
          <label style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:14,border:"2px dashed #c7d2fe",cursor:"pointer",background:"#f8faff"}}>
            <span style={{fontSize:20}}>📁</span>
            <span style={{fontSize:12,fontWeight:700,color:"#4f46e5"}}>{noteFile||"Klik untuk upload referensi"}</span>
            <input type="file"style={{display:"none"}}onChange={e=>doFile(e,setNoteFile)}accept=".pdf,.png,.jpg,.docx,.txt"/>
          </label>
        </div>
        <textarea value={noteInput}onChange={e=>setNoteInput(e.target.value)}placeholder="Tulis catatan kamu di sini (minimal 10 karakter)..."style={{width:"100%",height:150,padding:"12px 14px",borderRadius:14,border:"1.5px solid #e0e7ff",fontSize:12,fontWeight:700,outline:"none",resize:"none",fontFamily:"inherit",marginBottom:12}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:10,color:"#94a3b8"}}>{noteInput.length} karakter</span>
          <button onClick={completeNote}disabled={noteInput.trim().length<10}style={{background:noteInput.trim().length>=10?"#6366f1":"#e0e7ff",color:noteInput.trim().length>=10?"#fff":"#94a3b8",border:"none",borderRadius:12,padding:"8px 20px",fontSize:12,fontWeight:900,cursor:noteInput.trim().length>=10?"pointer":"not-allowed",fontFamily:"inherit"}}>💾 Simpan & Klaim XP</button>
        </div>
      </Card>
    </div>
  );
  if(active===3)return(
    <div style={{maxWidth:600}}>
      <button onClick={()=>{setActive(null);setQuizData(null);setQuizAnswers({});setQuizScore(null);}}style={backBtnStyle}>← Kembali</button>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <p style={{margin:0,fontSize:15,fontWeight:900,color:"#1e1b4b"}}>🧩 Kerjakan 5 Soal AI</p>
          {!quizData&&!quizLoading&&<button onClick={loadQuiz}style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:12,padding:"8px 18px",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>🤖 Generate Soal</button>}
        </div>
        {quizLoading&&<div style={{textAlign:"center",padding:32}}><p style={{color:"#6366f1",fontWeight:800}}>AI sedang membuat soal...</p><LoadingDots/></div>}
        {quizData&&quizScore===null&&(
          <>
            {quizData.map((q,i)=>(
              <div key={i}style={{marginBottom:16,background:"#f8faff",borderRadius:16,padding:14,border:"1.5px solid #e0e7ff"}}>
                <p style={{margin:"0 0 10px",fontSize:12,fontWeight:800,color:"#1e1b4b"}}>{i+1}. {q.q}</p>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {q.opts.map((o,j)=>(
                    <button key={j}onClick={()=>setQuizAnswers(a=>({...a,[i]:j}))}
                      style={{background:quizAnswers[i]===j?"#eef2ff":"#fff",border:`1.5px solid ${quizAnswers[i]===j?"#6366f1":"#e0e7ff"}`,borderRadius:10,padding:"8px 12px",fontSize:11,fontWeight:700,cursor:"pointer",textAlign:"left",color:quizAnswers[i]===j?"#4f46e5":"#1e1b4b",fontFamily:"inherit"}}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={submitQuiz}disabled={Object.keys(quizAnswers).length<quizData.length}style={{width:"100%",background:Object.keys(quizAnswers).length>=quizData.length?"#6366f1":"#e0e7ff",color:Object.keys(quizAnswers).length>=quizData.length?"#fff":"#94a3b8",border:"none",borderRadius:14,padding:"12px",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Submit Jawaban →</button>
          </>
        )}
        {quizScore!==null&&(
          <div style={{textAlign:"center",padding:24}}>
            <p style={{fontSize:48,margin:"0 0 10px"}}>{quizScore>=4?"🎉":quizScore>=3?"😊":"😅"}</p>
            <p style={{fontSize:24,fontWeight:900,color:"#1e1b4b",margin:"0 0 6px"}}>{quizScore}/5 Benar</p>
            <p style={{fontSize:12,color:"#64748b",margin:"0 0 14px"}}>{quizScore>=3?"Quest selesai! XP diklaim.":"Butuh minimal 3 benar. Coba lagi!"}</p>
            {quizScore>=3&&<p style={{fontSize:13,fontWeight:800,color:"#22c55e"}}>✅ +{quizScore*5} XP Bonus!</p>}
            {quizScore<3&&<button onClick={()=>{setQuizData(null);setQuizAnswers({});setQuizScore(null);}}style={{background:"#6366f1",color:"#fff",border:"none",borderRadius:12,padding:"10px 20px",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>🔄 Coba Lagi</button>}
          </div>
        )}
      </Card>
    </div>
  );
  return(
    <div style={{maxWidth:580}}>
      <div style={{background:"linear-gradient(135deg,#1e1b4b,#312e81)",borderRadius:24,padding:"18px 22px",marginBottom:20}}>
        <p style={{margin:0,fontWeight:900,color:"#c7d2fe",fontSize:17}}>🎯 Daily Quest</p>
        <p style={{margin:"4px 0 0",fontSize:12,color:"#818cf8"}}>Selesaikan misi harian untuk dapat XP & Koin!</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {s.dailyQuests.map(q=>(
          <div key={q.id}style={{background:"#fff",borderRadius:20,padding:"16px 20px",border:`1.5px solid ${q.done?"#86efac":"#e0e7ff"}`,display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:28}}>{q.icon}</span>
            <div style={{flex:1}}>
              <p style={{margin:0,fontWeight:800,color:q.done?"#94a3b8":"#1e1b4b",fontSize:13,textDecoration:q.done?"line-through":"none"}}>{q.label}</p>
              <div style={{display:"flex",gap:6,marginTop:4}}>
                <span style={{background:"#eef2ff",color:"#4f46e5",fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:8}}>+{q.xp} XP</span>
                <span style={{background:"#fef3c7",color:"#92400e",fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:8}}>🪙 +{q.coin}</span>
              </div>
            </div>
            {q.done
              ?<span style={{background:"#f0fdf4",color:"#16a34a",padding:"6px 14px",borderRadius:12,fontSize:12,fontWeight:900}}>✅ Done</span>
              :<button onClick={()=>setActive(q.id)}style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:14,padding:"8px 16px",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Mulai →</button>
            }
          </div>
        ))}
      </div>
      <div style={{marginTop:16,background:"#f8faff",borderRadius:18,padding:"14px 18px",border:"1.5px solid #e0e7ff"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <p style={{margin:0,fontSize:12,fontWeight:900,color:"#4f46e5"}}>Progress Hari Ini</p>
          <span style={{fontSize:12,fontWeight:800,color:"#6366f1"}}>{s.dailyQuests.filter(q=>q.done).length}/{s.dailyQuests.length}</span>
        </div>
        <div style={{background:"#e0e7ff",borderRadius:8,height:8,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.round(s.dailyQuests.filter(q=>q.done).length/s.dailyQuests.length*100)}%`,background:"linear-gradient(90deg,#818cf8,#6366f1)",borderRadius:8,transition:"width .5s"}}/>
        </div>
      </div>
    </div>
  );
}

const backBtnStyle={marginBottom:16,background:"#eef2ff",border:"none",borderRadius:12,padding:"8px 16px",fontSize:12,fontWeight:800,color:"#4f46e5",cursor:"pointer",fontFamily:"inherit"};
const focusBtnStyle={background:"#6366f1",color:"#fff",border:"none",borderRadius:14,padding:"10px 24px",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"inherit"};
const focusGhostBtnStyle={background:"rgba(255,255,255,.1)",color:"#c7d2fe",border:"none",borderRadius:14,padding:"10px 18px",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"inherit"};
const claimBtnStyle={background:"#22c55e",color:"#fff",border:"none",borderRadius:14,padding:"10px 24px",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"inherit"};

// ── TAB: COMPANION ───────────────────────────────────────────────────────────
function TabCompanion({s,d}){
  return(
    <div style={{maxWidth:680,display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <div style={{background:"linear-gradient(135deg,#1e1b4b,#312e81)",borderRadius:24,padding:28,display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
        <Mascot evo={s.mascotEvo}costume={s.mascotCostume}mood={s.mood}size={100}/>
        <p style={{margin:0,fontWeight:900,color:"#fff",fontSize:18}}>Plot & Twist</p>
        <p style={{margin:0,fontSize:12,color:"#818cf8"}}>Level {s.mascotLevel} · Evo: {s.mascotEvo}</p>
        <XPBar xp={s.xp}/>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
          <span style={{background:"rgba(255,255,255,.12)",color:"#c7d2fe",fontSize:11,fontWeight:800,padding:"5px 12px",borderRadius:10}}>🔥 {s.streak} hari</span>
          <span style={{background:"rgba(255,255,255,.12)",color:"#fbbf24",fontSize:11,fontWeight:800,padding:"5px 12px",borderRadius:10}}>🪙 {s.coins}</span>
        </div>
        <div style={{width:"100%",background:"rgba(255,255,255,.1)",borderRadius:10,padding:"10px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><p style={{margin:0,fontSize:9,color:"#818cf8",fontWeight:800}}>💚 ENERGI</p><span style={{fontSize:9,color:"#6ee7b7",fontWeight:800}}>{s.energy}/{s.maxEnergy}</span></div>
          <div style={{background:"rgba(255,255,255,.15)",borderRadius:8,height:8,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.round(s.energy/s.maxEnergy*100)}%`,background:"linear-gradient(90deg,#6ee7b7,#22c55e)",borderRadius:8,transition:"width .5s"}}/>
          </div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Card>
          <p style={{margin:"0 0 10px",fontWeight:900,color:"#1e1b4b",fontSize:13}}>🔄 Jalur Evolusi</p>
          {[{key:"baby",label:"Baby",icon:"🐣",req:0},{key:"teen",label:"Teen",icon:"🌱",req:100},{key:"adult",label:"Adult",icon:"🌳",req:300},{key:"legend",label:"Legend",icon:"🌟",req:1000}].map(e=>(
            <div key={e.key}style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,padding:"6px 10px",borderRadius:10,background:s.mascotEvo===e.key?"#eef2ff":"transparent",border:s.mascotEvo===e.key?"1px solid #c7d2fe":"1px solid transparent"}}>
              <span style={{fontSize:18}}>{e.icon}</span>
              <span style={{fontSize:11,fontWeight:800,color:s.xp>=e.req?"#1e1b4b":"#94a3b8"}}>{e.label}</span>
              <span style={{marginLeft:"auto",fontSize:9,color:"#94a3b8"}}>{e.req} XP</span>
              {s.xp>=e.req&&<span style={{fontSize:10,color:"#16a34a",fontWeight:800}}>✓</span>}
            </div>
          ))}
        </Card>
        <Card style={{flex:1}}>
          <p style={{margin:"0 0 10px",fontWeight:900,color:"#1e1b4b",fontSize:13}}>👕 Kostum</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {COSTUMES.map(c=>{
              const owned=s.xp>=c.unlock||c.key==="default";
              return(
                <button key={c.key}onClick={()=>owned&&d({type:"SET_COSTUME",costume:c.key})}
                  style={{background:(s.mascotCostume||"default")===c.key?"#eef2ff":"#f8faff",border:`1.5px solid ${(s.mascotCostume||"default")===c.key?"#6366f1":"#e0e7ff"}`,borderRadius:14,padding:"10px 8px",cursor:owned?"pointer":"not-allowed",opacity:owned?1:0.5,fontFamily:"inherit"}}>
                  <p style={{margin:0,fontSize:22}}>{c.icon}</p>
                  <p style={{margin:0,fontSize:10,fontWeight:800,color:"#1e1b4b"}}>{c.label}</p>
                  {!owned&&<p style={{margin:0,fontSize:9,color:"#94a3b8"}}>{c.unlock} XP</p>}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── TAB: AI BELAJAR KILAT ────────────────────────────────────────────────────
// Perbaikan utama: file benar-benar dibaca & dikirim ke Claude untuk dirangkum
function TabAI({s,d}){
  const[step,setStep]=useState(null); // null | "loading" | "done" | "error"
  const[result,setResult]=useState(null);
  const[view,setView]=useState("summary");
  const[quizAns,setQuizAns]=useState(null);
  const[quizIdx,setQuizIdx]=useState(0);
  const[uploadedFile,setUploadedFile]=useState(null);      // nama file
  const[uploadedFileObj,setUploadedFileObj]=useState(null); // File object asli
  const[topicInput,setTopicInput]=useState("");             // input topik manual
  const[errorMsg,setErrorMsg]=useState("");
  const[aiFlashcards,setAiFlashcards]=useState(null);      // flashcard dari AI
  const[aiQuiz,setAiQuiz]=useState(null);                  // quiz dari AI

  const handleFile = (e) => {
    const f = e.target.files[0];
    if(!f) return;
    setUploadedFile(f.name);
    setUploadedFileObj(f);
    // Reset hasil sebelumnya
    setStep(null);
    setResult(null);
    setAiFlashcards(null);
    setAiQuiz(null);
  };

  const analyze = async () => {
    setStep("loading");
    setResult(null);
    setErrorMsg("");
    setAiFlashcards(null);
    setAiQuiz(null);

    try {
      let messages = [];

      if (uploadedFileObj) {
        const fileType = uploadedFileObj.type;
        const fileName = uploadedFileObj.name;

        if (fileType === "application/pdf") {
          // Kirim PDF sebagai dokumen base64
          const base64Data = await readFileAsBase64(uploadedFileObj);
          messages = [{
            role: "user",
            content: [
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: base64Data }
              },
              {
                type: "text",
                text: `Tolong analisis dan rangkum materi dari dokumen PDF ini. Berikan:

1. **RINGKASAN UTAMA** (3-5 poin penting, padat & jelas)
2. **KONSEP KUNCI** (daftar istilah/konsep penting beserta penjelasan singkat)
3. **POIN BELAJAR** (apa yang harus dipahami dan dihafalkan)
4. **TIPS BELAJAR** (cara terbaik mempelajari materi ini)

Gunakan bahasa Indonesia yang mudah dipahami. Gunakan emoji untuk poin-poin utama agar lebih menarik!`
              }
            ]
          }];
        } else if (fileType.startsWith("image/")) {
          // Kirim gambar
          const base64Data = await readFileAsBase64(uploadedFileObj);
          const mediaType = fileType;
          messages = [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64Data }
              },
              {
                type: "text",
                text: `Tolong analisis gambar/materi ini. Berikan:

1. **RINGKASAN** apa yang ada di gambar ini
2. **KONSEP KUNCI** yang perlu dipahami
3. **POIN BELAJAR** penting
4. **TIPS BELAJAR** untuk materi ini

Gunakan bahasa Indonesia yang mudah dipahami dengan emoji!`
              }
            ]
          }];
        } else {
          // File teks: TXT, DOCX source text, kode, dll.
          let textContent;
          try {
            textContent = await readFileAsText(uploadedFileObj);
            textContent = textContent.slice(0, 8000); // batasi token
          } catch {
            textContent = `[File: ${fileName} — tidak bisa dibaca sebagai teks]`;
          }
          messages = [{
            role: "user",
            content: `Berikut adalah isi file "${fileName}":\n\n${textContent}\n\n---\nTolong analisis dan rangkum materi ini. Berikan:\n\n1. **RINGKASAN UTAMA** (3-5 poin penting)\n2. **KONSEP KUNCI** dengan penjelasan singkat\n3. **POIN BELAJAR** yang harus dipahami\n4. **TIPS BELAJAR** untuk materi ini\n\nGunakan bahasa Indonesia yang mudah dipahami dengan emoji!`
          }];
        }
      } else if (topicInput.trim()) {
        // Topik manual
        messages = [{
          role: "user",
          content: `Tolong buatkan rangkuman belajar untuk topik: "${topicInput}"\n\nBerikan:\n1. **RINGKASAN UTAMA** (3-5 poin penting)\n2. **KONSEP KUNCI** dengan penjelasan singkat\n3. **POIN BELAJAR** yang harus dipahami\n4. **CONTOH NYATA** untuk mempermudah pemahaman\n5. **TIPS BELAJAR** untuk topik ini\n\nGunakan bahasa Indonesia yang mudah dipahami dengan emoji!`
        }];
      } else {
        // Default: topik umum
        messages = [{
          role: "user",
          content: `Buatkan rangkuman belajar tentang Struktur Data - Linked List untuk mahasiswa Computer Science.\n\n1. **RINGKASAN UTAMA** (5 poin)\n2. **KONSEP KUNCI** beserta penjelasan\n3. **POIN BELAJAR** penting\n4. **CONTOH KODE** sederhana\n5. **TIPS BELAJAR**\n\nGunakan bahasa Indonesia dengan emoji!`
        }];
      }

      const summary = await callClaude(
        messages,
        "Kamu adalah tutor AI untuk pelajar/mahasiswa Indonesia. Buat rangkuman belajar yang jelas, padat, mudah dipahami. Selalu gunakan bahasa Indonesia. Gunakan emoji di setiap poin utama. Format dengan markdown (bold, list)."
      );
      setResult(summary);

      // Generate flashcard AI dari hasil rangkuman
      generateAiFlashcards(summary);
      // Generate quiz AI dari hasil rangkuman
      generateAiQuiz(summary);

      setStep("done");
      d({ type: "AI_ANALYZE" });

    } catch (err) {
      setErrorMsg(err.message || "Gagal menghubungi AI. Cek koneksi internet kamu.");
      setStep("error");
    }
  };

  const generateAiFlashcards = async (summary) => {
    try {
      const txt = await callClaude(
        [{ role:"user", content:`Dari ringkasan berikut:\n\n${summary.slice(0,2000)}\n\nBuat 4 flashcard dalam format JSON array: [{"q":"pertanyaan","a":"jawaban singkat"}, ...]\nKEMBALIKAN HANYA JSON, tanpa teks lain.` }],
        "Kembalikan HANYA array JSON tanpa markdown, tanpa ```json, tanpa penjelasan apapun."
      );
      const clean = txt.replace(/```json|```/g,"").trim();
      setAiFlashcards(JSON.parse(clean));
    } catch {
      setAiFlashcards(FLASHCARDS.slice(0,4));
    }
  };

  const generateAiQuiz = async (summary) => {
    try {
      const txt = await callClaude(
        [{ role:"user", content:`Dari ringkasan berikut:\n\n${summary.slice(0,2000)}\n\nBuat 3 soal pilihan ganda dalam format JSON array: [{"q":"soal","opts":["A","B","C","D"],"ans":0}, ...] (ans = index jawaban benar)\nKEMBALIKAN HANYA JSON.` }],
        "Kembalikan HANYA array JSON tanpa markdown, tanpa ```json, tanpa penjelasan apapun."
      );
      const clean = txt.replace(/```json|```/g,"").trim();
      setAiQuiz(JSON.parse(clean));
    } catch {
      setAiQuiz(null);
    }
  };

  const activeFlashcards = aiFlashcards || FLASHCARDS;

  const qz = aiQuiz || [
    {q:"Operasi insert linked list?",opts:["O(1)","O(n)","O(log n)","O(n²)"],ans:0},
    {q:"Circular Linked List berarti?",opts:["Node terakhir menunjuk ke pertama","Ada 2 pointer per node","Hanya bisa dibaca maju","Tidak ada head"],ans:0}
  ];

  return(
    <div style={{maxWidth:700}}>
      <Card style={{marginBottom:16}}>
        <p style={{margin:"0 0 4px",fontSize:15,fontWeight:900,color:"#1e1b4b"}}>🧠 AI Belajar Kilat</p>
        <p style={{margin:"0 0 14px",fontSize:11,color:"#94a3b8"}}>Upload file materi (PDF/gambar/teks) atau ketik topik, lalu AI akan merangkumnya untukmu!</p>

        {/* Upload File */}
        <div style={{marginBottom:12}}>
          <p style={{margin:"0 0 6px",fontSize:11,fontWeight:800,color:"#64748b"}}>📁 Upload file materi (PDF, gambar, TXT):</p>
          <label style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderRadius:14,border:`2px dashed ${uploadedFile?"#6366f1":"#c7d2fe"}`,cursor:"pointer",background:uploadedFile?"#eef2ff":"#f8faff",transition:"all .2s"}}>
            <span style={{fontSize:24}}>{uploadedFile?"📄":"📁"}</span>
            <div>
              <p style={{margin:0,fontSize:12,fontWeight:800,color:"#4f46e5"}}>{uploadedFile||"Klik untuk upload file"}</p>
              <p style={{margin:0,fontSize:9,color:"#94a3b8"}}>PDF, PNG, JPG, TXT, DOCX — maks ~8MB</p>
            </div>
            {uploadedFile&&<span style={{marginLeft:"auto",fontSize:18}}>✅</span>}
            <input type="file" style={{display:"none"}} onChange={handleFile} accept=".pdf,.txt,.docx,.png,.jpg,.jpeg,.md"/>
          </label>
        </div>

        {/* Atau topik manual */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <div style={{flex:1,height:1,background:"#e0e7ff"}}/>
          <span style={{fontSize:10,color:"#94a3b8",fontWeight:700,whiteSpace:"nowrap"}}>atau ketik topik</span>
          <div style={{flex:1,height:1,background:"#e0e7ff"}}/>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <input
            value={topicInput}
            onChange={e=>setTopicInput(e.target.value)}
            placeholder="Contoh: Integral kalkulus, Fotosintesis, Hukum Newton..."
            style={{flex:1,padding:"10px 14px",borderRadius:14,border:"1.5px solid #e0e7ff",fontSize:12,fontWeight:700,outline:"none",background:"#f8faff",fontFamily:"inherit"}}
            onKeyDown={e=>e.key==="Enter"&&analyze()}
          />
          <button onClick={analyze} disabled={step==="loading"}
            style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:14,padding:"10px 20px",fontSize:12,fontWeight:900,cursor:step==="loading"?"not-allowed":"pointer",opacity:step==="loading"?0.7:1,fontFamily:"inherit",whiteSpace:"nowrap"}}>
            {step==="loading"?"⏳ Menganalisis...":"🤖 Analisis AI"}
          </button>
        </div>

        {/* Loading state */}
        {step==="loading"&&(
          <div style={{textAlign:"center",padding:32,background:"#f8faff",borderRadius:16,border:"1.5px solid #e0e7ff"}}>
            <p style={{color:"#6366f1",fontWeight:800,margin:"0 0 8px",fontSize:13}}>🤖 AI sedang membaca & merangkum materi kamu...</p>
            <p style={{color:"#94a3b8",fontSize:10,margin:"0 0 12px"}}>Ini mungkin butuh 10–30 detik tergantung panjang file</p>
            <LoadingDots/>
          </div>
        )}

        {/* Error state */}
        {step==="error"&&(
          <div style={{background:"#fef2f2",borderRadius:14,padding:"14px 16px",border:"1.5px solid #fca5a5"}}>
            <p style={{margin:"0 0 4px",fontSize:12,fontWeight:800,color:"#dc2626"}}>❌ Gagal Menganalisis</p>
            <p style={{margin:"0 0 10px",fontSize:11,color:"#991b1b"}}>{errorMsg}</p>
            <button onClick={()=>setStep(null)}style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:10,padding:"6px 16px",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Coba Lagi</button>
          </div>
        )}

        {/* Done state */}
        {step==="done"&&result&&(
          <>
            {/* Tab selector */}
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              {["summary","flashcard","quiz","mindmap"].map(v=>(
                <button key={v}onClick={()=>setView(v)}style={{background:view===v?"#6366f1":"#eef2ff",color:view===v?"#fff":"#4f46e5",border:"none",borderRadius:12,padding:"6px 14px",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>
                  {v==="summary"?"📝 Ringkasan":v==="flashcard"?"⚡ Flashcard":v==="quiz"?"❓ Kuis":"🧠 Mindmap"}
                </button>
              ))}
            </div>

            {/* Ringkasan */}
            {view==="summary"&&(
              <div style={{background:"#0f172a",borderRadius:16,padding:20,maxHeight:400,overflowY:"auto"}}>
                <p style={{margin:"0 0 10px",fontSize:11,color:"#818cf8",fontWeight:800}}>💡 RANGKUMAN AI — +20 XP diraih!</p>
                <div style={{fontSize:12,color:"#e2e8f0",lineHeight:1.9,whiteSpace:"pre-wrap",fontFamily:"'JetBrains Mono', monospace"}}>
                  {result}
                </div>
              </div>
            )}

            {/* Flashcard dari AI */}
            {view==="flashcard"&&(
              <div>
                {aiFlashcards
                  ? <FlipCard card={activeFlashcards[s.flashcardIdx%activeFlashcards.length]}/>
                  : <div style={{textAlign:"center",padding:16}}><p style={{color:"#94a3b8",fontSize:11}}>Membuat flashcard...</p><LoadingDots/></div>
                }
                <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}>
                  <button onClick={()=>d({type:"PREV_FC"})}style={{background:"#eef2ff",border:"none",borderRadius:10,padding:"6px 14px",fontSize:11,fontWeight:800,color:"#4338ca",cursor:"pointer",fontFamily:"inherit"}}>← Prev</button>
                  <span style={{flex:1,textAlign:"center",fontSize:11,fontWeight:800,color:"#94a3b8"}}>{(s.flashcardIdx%activeFlashcards.length)+1}/{activeFlashcards.length}</span>
                  <button onClick={()=>d({type:"NEXT_FC"})}style={{background:"#eef2ff",border:"none",borderRadius:10,padding:"6px 14px",fontSize:11,fontWeight:800,color:"#4338ca",cursor:"pointer",fontFamily:"inherit"}}>Next →</button>
                </div>
                <p style={{margin:"8px 0 0",fontSize:9,color:"#94a3b8",textAlign:"center"}}>Flashcard dibuat otomatis dari materi yang kamu upload 🤖</p>
              </div>
            )}

            {/* Quiz dari AI */}
            {view==="quiz"&&(
              <div style={{background:"#f8faff",borderRadius:16,padding:16,border:"1.5px solid #e0e7ff"}}>
                {!aiQuiz&&<div style={{textAlign:"center",padding:16}}><p style={{color:"#94a3b8",fontSize:11}}>Membuat soal dari materi...</p><LoadingDots/></div>}
                {aiQuiz&&(
                  <>
                    <p style={{margin:"0 0 12px",fontSize:12,fontWeight:800,color:"#1e1b4b"}}>{qz[quizIdx%qz.length].q}</p>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {qz[quizIdx%qz.length].opts.map((o,i)=>(
                        <button key={i}onClick={()=>setQuizAns(i)}style={{background:quizAns===null?"#fff":i===qz[quizIdx%qz.length].ans?"#f0fdf4":quizAns===i?"#fef2f2":"#fff",border:`1.5px solid ${quizAns===null?"#e0e7ff":i===qz[quizIdx%qz.length].ans?"#86efac":quizAns===i?"#fca5a5":"#e0e7ff"}`,borderRadius:12,padding:"9px 14px",fontSize:11,fontWeight:700,cursor:"pointer",textAlign:"left",color:quizAns===null?"#1e1b4b":i===qz[quizIdx%qz.length].ans?"#166534":quizAns===i?"#991b1b":"#1e1b4b",fontFamily:"inherit"}}>{o}</button>
                      ))}
                    </div>
                    {quizAns!==null&&(
                      <div style={{marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <p style={{margin:0,fontSize:11,fontWeight:800,color:quizAns===qz[quizIdx%qz.length].ans?"#16a34a":"#dc2626"}}>{quizAns===qz[quizIdx%qz.length].ans?"✅ Benar!":"❌ Kurang tepat"}</p>
                        <button onClick={()=>{setQuizIdx(i=>(i+1)%qz.length);setQuizAns(null);}}style={{background:"#6366f1",color:"#fff",border:"none",borderRadius:12,padding:"8px 16px",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Soal Berikutnya →</button>
                      </div>
                    )}
                    <p style={{margin:"10px 0 0",fontSize:9,color:"#94a3b8",textAlign:"center"}}>Soal dibuat otomatis berdasarkan materi kamu 🤖 · {quizIdx%qz.length+1}/{qz.length}</p>
                  </>
                )}
              </div>
            )}

            {view==="mindmap"&&<MindMapSVG/>}
          </>
        )}
      </Card>
    </div>
  );
}

// ── TAB: STUDY MAPS ──────────────────────────────────────────────────────────
function TabMap({s,d}){
  const userLevel=getRankIdx(s.xp)+1;
  return(
    <div style={{maxWidth:680}}>
      <div style={{background:"linear-gradient(135deg,#f0f9ff,#e0f7ef)",borderRadius:24,padding:18,marginBottom:20,border:"1.5px solid #bae6fd"}}>
        <p style={{margin:"0 0 4px",fontSize:16,fontWeight:900,color:"#0c4a6e"}}>🗺️ Study Maps</p>
        <p style={{margin:0,fontSize:11,color:"#0369a1"}}>Level kamu: {RANK_ICONS[userLevel-1]} {RANKS[userLevel-1]} (Level {userLevel}). Area unlock otomatis seiring naik rank!</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {MAP_AREAS.map(area=>{
          const unlocked=userLevel>=area.unlockLevel;
          return(
            <div key={area.key}onClick={()=>unlocked&&d({type:"SET_MAP_AREA",area:area.key})}
              style={{background:"#fff",borderRadius:20,padding:20,border:`2px solid ${s.studyMapArea===area.key?area.color:unlocked?"#e8eaf2":"#f1f5ff"}`,cursor:unlocked?"pointer":"default",opacity:unlocked?1:0.55,transition:"all .2s",position:"relative"}}>
              {s.studyMapArea===area.key&&<div style={{position:"absolute",top:10,right:10,background:area.color,color:"#fff",fontSize:9,fontWeight:900,padding:"3px 8px",borderRadius:8}}>📍 Aktif</div>}
              <p style={{margin:"0 0 8px",fontSize:34}}>{area.icon}</p>
              <p style={{margin:"0 0 4px",fontSize:14,fontWeight:900,color:"#1e1b4b"}}>{area.key}</p>
              <p style={{margin:"0 0 10px",fontSize:11,color:"#64748b"}}>{area.desc}</p>
              {!unlocked
                ?<span style={{background:"#fef3c7",color:"#92400e",fontSize:9,fontWeight:800,padding:"3px 10px",borderRadius:8}}>🔒 Butuh Level {area.unlockLevel} ({RANKS[Math.min(area.unlockLevel-1,RANKS.length-1)]})</span>
                :s.mapVisited.includes(area.key)
                  ?<span style={{background:"#f0fdf4",color:"#16a34a",fontSize:9,fontWeight:800,padding:"3px 10px",borderRadius:8}}>✅ Sudah dikunjungi</span>
                  :<span style={{background:"#eef2ff",color:"#4f46e5",fontSize:9,fontWeight:800,padding:"3px 10px",borderRadius:8}}>Klik untuk kunjungi</span>
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TAB: FOCUS ARENA ─────────────────────────────────────────────────────────
function TabFocus({s,d}){
  const[mode,setMode]=useState("25");
  const[running,setRunning]=useState(false);
  const[secs,setSecs]=useState(25*60);
  const[done,setDone]=useState(false);
  const timerRef=useRef(null);
  const MODES={"25":25*60,"50":50*60,"deep":90*60};
  const LABELS={"25":"25 Menit","50":"50 Menit","deep":"Deep Focus"};
  useEffect(()=>{
    if(running){timerRef.current=setInterval(()=>setSecs(s=>{if(s<=1){clearInterval(timerRef.current);setRunning(false);setDone(true);return 0;}return s-1;}),1000);}
    else clearInterval(timerRef.current);
    return()=>clearInterval(timerRef.current);
  },[running]);
  const claim=()=>{d({type:"ADD_FOCUS",mins:parseInt(mode==="deep"?90:parseInt(mode))});d({type:"FOCUS_QUEST_DONE"});setDone(false);setSecs(MODES[mode]);};
  const mins=Math.floor(secs/60),secR=secs%60,pct=Math.round((1-secs/MODES[mode])*100);
  return(
    <div style={{maxWidth:500}}>
      <div style={{background:"linear-gradient(135deg,#1e1b4b,#312e81)",borderRadius:28,padding:32,display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
        <p style={{margin:0,fontSize:18,fontWeight:900,color:"#c7d2fe"}}>🔥 Focus Arena</p>
        <div style={{display:"flex",gap:8}}>
          {Object.entries(LABELS).map(([k,l])=>(
            <button key={k}onClick={()=>{if(!running){setMode(k);setSecs(MODES[k]);setDone(false);}}}style={{background:mode===k?"#6366f1":"rgba(255,255,255,.1)",color:"#fff",border:"none",borderRadius:12,padding:"6px 14px",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
          ))}
        </div>
        <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width={180}height={180}viewBox="0 0 180 180">
            <circle cx={90}cy={90}r={80}fill="none"stroke="#312e81"strokeWidth={12}/>
            <circle cx={90}cy={90}r={80}fill="none"stroke={done?"#22c55e":"#6366f1"}strokeWidth={12}
              strokeDasharray={`${2*Math.PI*80}`}strokeDashoffset={`${2*Math.PI*80*(1-pct/100)}`}
              strokeLinecap="round"transform="rotate(-90 90 90)"style={{transition:"stroke-dashoffset 1s"}}/>
          </svg>
          <div style={{position:"absolute",textAlign:"center"}}>
            <p style={{margin:0,fontSize:36,fontWeight:900,color:done?"#22c55e":"#fff",fontFamily:"monospace"}}>{done?"✅":String(mins).padStart(2,"0")+":"+String(secR).padStart(2,"0")}</p>
            <p style={{margin:0,fontSize:11,color:"#818cf8"}}>{done?"Selesai!":pct+"% done"}</p>
          </div>
        </div>
        {done
          ?<button onClick={claim}style={claimBtnStyle}>🏆 Klaim +40 XP &amp; +15 Koin!</button>
          :<div style={{display:"flex",gap:10}}>
            <button onClick={()=>setRunning(r=>!r)}style={focusBtnStyle}>{running?"⏸ Pause":"▶ Mulai"}</button>
            <button onClick={()=>{setRunning(false);setSecs(MODES[mode]);setDone(false);}}style={focusGhostBtnStyle}>↩ Reset</button>
          </div>
        }
        <div style={{display:"flex",gap:10,width:"100%"}}>
          {[["XP","⚡","+40"],["Koin","🪙","+15"],["Sesi","⏱",s.focusSessions]].map(([l,i,v])=>(
            <div key={l}style={{flex:1,background:"rgba(255,255,255,.08)",borderRadius:14,padding:"10px 12px",textAlign:"center"}}>
              <p style={{margin:0,fontSize:9,color:"#818cf8",fontWeight:800}}>{l}</p>
              <p style={{margin:0,fontSize:18,fontWeight:900,color:"#c7d2fe"}}>{i} {v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── TAB: MYSTERY BOX ─────────────────────────────────────────────────────────
function TabMystery({s,d}){
  const[opened,setOpened]=useState(false);
  const[reward,setReward]=useState(null);
  const[spinning,setSpinning]=useState(false);
  const COOL=3*60*60*1000;
  const now=Date.now(),last=s.mysteryLastOpened||0;
  const left=Math.max(0,COOL-(now-last));
  const canOpen=left===0;
  const hrs=Math.floor(left/3600000),min=Math.floor((left%3600000)/60000);
  const open=()=>{
    if(!canOpen)return;setSpinning(true);setReward(null);
    setTimeout(()=>{const r=MYSTERY_REWARDS[Math.floor(Math.random()*MYSTERY_REWARDS.length)];setReward(r);setSpinning(false);setOpened(true);d({type:"MYSTERY_OPEN",reward:r});},1800);
  };
  return(
    <div style={{maxWidth:500,display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
      <div style={{background:"linear-gradient(135deg,#7c3aed,#a855f7)",borderRadius:28,padding:32,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:80,marginBottom:16,display:"inline-block",animation:spinning?"spin 0.5s linear infinite":opened?"none":"float 3s ease-in-out infinite alternate"}}>{opened?reward?.icon:"🎲"}</div>
        <p style={{margin:"0 0 6px",fontSize:20,fontWeight:900,color:"#fff"}}>{opened?reward?.label:"Mystery Box"}</p>
        <p style={{margin:"0 0 16px",fontSize:12,color:"rgba(255,255,255,.75)"}}>{opened?"Reward sudah masuk ke akunmu!":canOpen?"Buka mystery box sekarang!":"Bisa dibuka lagi dalam:"}</p>
        {!canOpen&&!opened&&<div style={{background:"rgba(255,255,255,.15)",borderRadius:14,padding:"12px 20px",marginBottom:16,display:"inline-block"}}><p style={{margin:0,fontSize:18,fontWeight:900,color:"#fff",fontFamily:"monospace"}}>{hrs}j {min}m</p></div>}
        {!opened
          ?<button onClick={open}disabled={!canOpen||spinning}style={{background:canOpen?"#fff":"rgba(255,255,255,.3)",color:canOpen?"#7c3aed":"rgba(255,255,255,.6)",border:"none",borderRadius:16,padding:"12px 28px",fontSize:13,fontWeight:900,cursor:canOpen?"pointer":"not-allowed",fontFamily:"inherit"}}>{spinning?"Mengundi...":canOpen?"🎁 Buka Sekarang!":"⏳ Belum Bisa Dibuka"}</button>
          :<button onClick={()=>{setOpened(false);setReward(null);}}style={{background:"rgba(255,255,255,.2)",color:"#fff",border:"none",borderRadius:16,padding:"12px 28px",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Tutup</button>
        }
      </div>
      <div style={{background:"#fff",borderRadius:20,padding:18,width:"100%",border:"1.5px solid #e8eaf2"}}>
        <p style={{margin:"0 0 12px",fontSize:13,fontWeight:900,color:"#1e1b4b"}}>Kemungkinan Reward</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {MYSTERY_REWARDS.map(r=>(
            <div key={r.type}style={{background:"#f8faff",borderRadius:14,padding:"10px 14px",border:"1px solid #e0e7ff",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:22}}>{r.icon}</span><span style={{fontSize:11,fontWeight:800,color:"#1e1b4b"}}>{r.label}</span>
            </div>
          ))}
        </div>
        <p style={{margin:"12px 0 0",fontSize:10,color:"#94a3b8",fontWeight:700,textAlign:"center"}}>⏰ Mystery Box bisa dibuka setiap 3 jam sekali</p>
      </div>
    </div>
  );
}

// ── TAB: ACHIEVEMENT ─────────────────────────────────────────────────────────
function TabAchievement({s}){
  return(
    <div style={{maxWidth:680}}>
      <Card style={{marginBottom:16}}>
        <p style={{margin:"0 0 4px",fontSize:14,fontWeight:900,color:"#1e1b4b"}}>🏆 Achievement System</p>
        <p style={{margin:0,fontSize:11,color:"#94a3b8"}}>Badge otomatis terbuka saat kamu mencapai target di semua fitur!</p>
        <p style={{margin:"8px 0 0",fontSize:12,fontWeight:800,color:"#6366f1"}}>✅ {s.achievements.length}/{ALL_ACHIEVEMENTS.length} badge earned</p>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
        {ALL_ACHIEVEMENTS.map(a=>{
          const earned=s.achievements.includes(a.key);
          return(
            <div key={a.key}style={{background:"#fff",borderRadius:20,padding:18,border:`1.5px solid ${earned?"#fbbf24":"#e8eaf2"}`,textAlign:"center",opacity:earned?1:0.55,transition:"all .3s"}}>
              <p style={{margin:"0 0 6px",fontSize:34}}>{earned?a.icon:"🔒"}</p>
              <p style={{margin:"0 0 4px",fontSize:12,fontWeight:900,color:earned?"#1e1b4b":"#94a3b8"}}>{a.key}</p>
              <p style={{margin:0,fontSize:10,color:"#94a3b8"}}>{a.desc}</p>
              {earned&&<p style={{margin:"6px 0 0",fontSize:9,color:"#f59e0b",fontWeight:800}}>✅ EARNED</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TAB: AI MENTOR ───────────────────────────────────────────────────────────
// Perbaikan: history dikirim dengan benar, streaming simulasi, konteks lebih kaya
function TabMentor({s,d}){
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(false);
  const[streamedText,setStreamedText]=useState(""); // simulasi streaming
  const endRef=useRef(null);
  const inputRef=useRef(null);

  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[s.aiMessages,streamedText]);

  const SUGG=[
    "Jelaskan pointer di C++ dengan contoh kode",
    "Buatkan roadmap belajar algoritma untuk pemula",
    "Buat 3 soal latihan Matematika Kalkulus",
    "Apa itu Big-O notation? Jelaskan dengan analogi",
    "Tips belajar efektif menjelang ujian akhir",
    "Perbedaan Stack dan Queue beserta contoh penggunaan",
    "Buatkan rangkuman materi Hukum Newton",
    "Cara membuat study schedule yang efektif",
  ];

  const MENTOR_SYSTEM = `Kamu adalah AI Mentor belajar pribadi untuk pelajar/mahasiswa Indonesia bernama "Plotwist AI".

Karakter kamu:
- Ramah, supportif, dan penuh semangat 🎓
- Menggunakan bahasa Indonesia yang santai tapi tetap informatif
- Sering menggunakan emoji untuk membuat penjelasan lebih menarik
- Memberikan contoh nyata yang relevan dengan kehidupan pelajar Indonesia
- Kalau menjelaskan kode, gunakan code block dengan bahasa yang tepat
- Selalu memotivasi dan memberi apresiasi atas pertanyaan

Kamu membantu dengan: penjelasan materi kuliah/sekolah, pembuatan soal latihan, tips belajar, perencanaan belajar, debugging kode, dan motivasi akademik.

User saat ini memiliki XP: ${s.xp}, Rank: ${RANKS[getRankIdx(s.xp)]}, Mood: ${s.mood}.
Sesuaikan energi balasanmu dengan mood user (kalau burnout, lebih menenangkan; kalau semangat, lebih energik).`;

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setLoading(true);
    setStreamedText("");

    d({ type: "ADD_AI_MSG", role: "user", content: msg });

    try {
      // Bangun history yang benar — kirim semua pesan sebelumnya + pesan baru
      const history = [
        ...s.aiMessages.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: msg }
      ];

      const reply = await callClaude(history, MENTOR_SYSTEM);

      // Simulasi streaming — tampilkan teks satu per satu
      let i = 0;
      const interval = setInterval(() => {
        if (i < reply.length) {
          setStreamedText(reply.slice(0, i + 1));
          i += Math.ceil(reply.length / 80); // kecepatan tampil
        } else {
          clearInterval(interval);
          setStreamedText("");
          d({ type: "ADD_AI_MSG", role: "assistant", content: reply });
          setLoading(false);
        }
      }, 16);

    } catch (err) {
      const errMsg = `❌ Oops! Koneksi ke AI bermasalah.\n\nError: ${err.message}\n\nCoba lagi ya! Pastikan koneksi internetmu stabil. 😅`;
      d({ type: "ADD_AI_MSG", role: "assistant", content: errMsg });
      setLoading(false);
      setStreamedText("");
    }
  };

  return(
    <div style={{maxWidth:720,display:"flex",flexDirection:"column",height:600}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#1e1b4b,#312e81)",borderRadius:"20px 20px 0 0",padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Mascot evo={s.mascotEvo}costume={s.mascotCostume}mood="semangat"size={40}/>
          <div>
            <p style={{margin:0,fontWeight:900,color:"#fff",fontSize:14}}>🤖 AI Mentor</p>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#22c55e"}}/>
              <p style={{margin:0,fontSize:10,color:"#818cf8"}}>Online · Powered by Claude · Siap bantu belajar!</p>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{background:"rgba(255,255,255,.1)",color:"#c7d2fe",fontSize:9,padding:"3px 8px",borderRadius:8,fontWeight:700}}>{s.aiMessages.filter(m=>m.role==="user").length} pesan</span>
          {s.aiMessages.length>0&&<button onClick={()=>d({type:"CLEAR_AI"})}style={{background:"rgba(255,255,255,.1)",color:"#c7d2fe",border:"none",borderRadius:10,padding:"5px 12px",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>🗑 Hapus Chat</button>}
        </div>
      </div>

      {/* Chat area */}
      <div style={{flex:1,background:"#fff",overflowY:"auto",padding:"16px 16px 8px",display:"flex",flexDirection:"column",gap:12,border:"1.5px solid #e0e7ff"}}>
        {/* Welcome state */}
        {s.aiMessages.length===0&&!loading&&(
          <div style={{textAlign:"center",padding:"16px 10px"}}>
            <p style={{fontSize:40,margin:"0 0 8px"}}>🤖</p>
            <p style={{fontSize:14,color:"#1e1b4b",fontWeight:800,marginBottom:4}}>Halo! Aku AI Mentor Plotwist 👋</p>
            <p style={{fontSize:11,color:"#64748b",marginBottom:16}}>Tanya apa saja tentang pelajaran, minta soal latihan, atau minta tips belajar!</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",maxWidth:580,margin:"0 auto"}}>
              {SUGG.map(sg=>(
                <button key={sg}onClick={()=>send(sg)}style={{background:"#eef2ff",color:"#4f46e5",border:"1px solid #c7d2fe",borderRadius:10,padding:"7px 12px",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
                  {sg}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {s.aiMessages.map((m,i)=>(
          <div key={i}style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:8,alignItems:"flex-end"}}>
            {m.role==="assistant"&&(
              <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,marginBottom:2}}>🤖</div>
            )}
            <div style={{maxWidth:"78%",background:m.role==="user"?"linear-gradient(135deg,#6366f1,#8b5cf6)":"#f8faff",color:m.role==="user"?"#fff":"#1e1b4b",borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"10px 14px",fontSize:12,fontWeight:700,lineHeight:1.7,border:m.role==="assistant"?"1px solid #e0e7ff":"none",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
              {m.content}
            </div>
            {m.role==="user"&&(
              <div style={{width:28,height:28,borderRadius:"50%",background:"#eef2ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,marginBottom:2}}>😊</div>
            )}
          </div>
        ))}

        {/* Streaming text */}
        {loading&&streamedText&&(
          <div style={{display:"flex",justifyContent:"flex-start",gap:8,alignItems:"flex-end"}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🤖</div>
            <div style={{maxWidth:"78%",background:"#f8faff",color:"#1e1b4b",borderRadius:"18px 18px 18px 4px",padding:"10px 14px",fontSize:12,fontWeight:700,lineHeight:1.7,border:"1px solid #e0e7ff",whiteSpace:"pre-wrap"}}>
              {streamedText}<span style={{display:"inline-block",width:2,height:14,background:"#6366f1",marginLeft:2,animation:"blink 1s step-end infinite"}}/>
            </div>
          </div>
        )}

        {/* Loading dots (saat menunggu respons) */}
        {loading&&!streamedText&&(
          <div style={{display:"flex",justifyContent:"flex-start",gap:8,alignItems:"flex-end"}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🤖</div>
            <div style={{background:"#f8faff",borderRadius:"18px 18px 18px 4px",padding:"12px 16px",border:"1px solid #e0e7ff"}}>
              <div style={{display:"flex",gap:5}}>{[0,1,2].map(i=><div key={i}style={{width:7,height:7,borderRadius:"50%",background:"#818cf8",animation:`bounce 1s ease ${i*0.2}s infinite`}}/>)}</div>
            </div>
          </div>
        )}

        <div ref={endRef}/>
      </div>

      {/* Input area */}
      <div style={{background:"#fff",borderRadius:"0 0 20px 20px",padding:"10px 12px",display:"flex",gap:8,border:"1.5px solid #e0e7ff",borderTop:"1px solid #f1f5ff",alignItems:"flex-end"}}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(120,e.target.scrollHeight)+"px";}}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          placeholder="Tanya sesuatu... (Enter untuk kirim, Shift+Enter untuk baris baru)"
          rows={1}
          style={{flex:1,padding:"10px 14px",borderRadius:14,border:"1.5px solid #e0e7ff",fontSize:12,fontWeight:700,outline:"none",background:"#f8faff",fontFamily:"inherit",resize:"none",lineHeight:1.5,maxHeight:120,overflowY:"auto"}}
        />
        <button
          onClick={()=>send()}
          disabled={loading||!input.trim()}
          style={{background:loading||!input.trim()?"#e0e7ff":"linear-gradient(135deg,#6366f1,#8b5cf6)",color:loading||!input.trim()?"#94a3b8":"#fff",border:"none",borderRadius:14,padding:"10px 18px",fontSize:12,fontWeight:900,cursor:loading||!input.trim()?"not-allowed":"pointer",transition:"all .2s",fontFamily:"inherit",flexShrink:0}}>
          {loading?"⏳":"Kirim →"}
        </button>
      </div>
    </div>
  );
}

// ── TAB: MOOD ────────────────────────────────────────────────────────────────
function TabMood({s,d}){
  const mo=MOODS.find(m=>m.key===s.mood)||MOODS[0];
  return(
    <div style={{maxWidth:600}}>
      <Card style={{marginBottom:16}}>
        <p style={{margin:"0 0 12px",fontSize:14,fontWeight:900,color:"#1e1b4b"}}>📈 Mood Tracker</p>
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          {MOODS.map(m=>(
            <button key={m.key}onClick={()=>d({type:"SET_MOOD",mood:m.key})}style={{flex:1,background:s.mood===m.key?"#eef2ff":"#f8faff",border:`2px solid ${s.mood===m.key?"#6366f1":"#e0e7ff"}`,borderRadius:16,padding:"12px 8px",cursor:"pointer",textAlign:"center",fontFamily:"inherit"}}>
              <p style={{margin:0,fontSize:24}}>{m.label.split(" ")[0]}</p>
              <p style={{margin:0,fontSize:9,fontWeight:800,color:s.mood===m.key?"#4f46e5":"#94a3b8"}}>{m.label.split(" ").slice(1).join(" ")}</p>
            </button>
          ))}
        </div>
        <div style={{background:"#f0fdf4",borderRadius:14,padding:"14px 16px",border:"1px solid #bbf7d0"}}>
          <p style={{margin:"0 0 4px",fontSize:10,fontWeight:800,color:"#16a34a"}}>🤖 REKOMENDASI AI</p>
          <p style={{margin:0,fontSize:12,color:"#065f46",fontWeight:700,lineHeight:1.6}}>{mo.rec}</p>
        </div>
      </Card>
      <Card>
        <p style={{margin:"0 0 12px",fontSize:13,fontWeight:900,color:"#1e1b4b"}}>Riwayat Mood</p>
        {s.moodHistory.length===0
          ?<p style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:20}}>Belum ada riwayat. Pilih mood di atas!</p>
          :<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{s.moodHistory.map((h,i)=>{const m=MOODS.find(x=>x.key===h.mood)||MOODS[0];return(<div key={i}style={{background:"#f8faff",borderRadius:14,padding:"10px 8px",textAlign:"center",border:"1px solid #e0e7ff",minWidth:70}}><p style={{margin:0,fontSize:20}}>{m.label.split(" ")[0]}</p><p style={{margin:0,fontSize:8,color:"#94a3b8",fontWeight:700,marginTop:4}}>{h.date}</p></div>);})}</div>
        }
      </Card>
    </div>
  );
}

// ── TAB: SKILL ───────────────────────────────────────────────────────────────
function TabSkill({s}){
  const skills=[
    {key:"Knowledge",icon:"📚",desc:"Dari: XP, AI Analisis, Flashcard review",val:Math.min(100,Math.round((s.totalXpEarned*0.04+s.aiAnalyzeCount*8+s.flashcardViewed*2)))},
    {key:"Logic",icon:"🧠",desc:"Dari: Soal quiz & Daily Quest",val:Math.min(100,Math.round(s.totalQuestsDone*10))},
    {key:"Creativity",icon:"🎨",desc:"Dari: Catatan & Note-Taking",val:Math.min(100,Math.round(s.noteCount*20))},
    {key:"Discipline",icon:"🎯",desc:"Dari: Streak harian & Focus Arena",val:Math.min(100,Math.round(s.streak*10+s.focusSessions*8))},
    {key:"Communication",icon:"💬",desc:"Dari: Chat AI Mentor",val:Math.min(100,Math.round(s.aiMessages.length*5))},
  ];
  const total=Math.round(skills.reduce((a,sk)=>a+sk.val,0)/skills.length);
  return(
    <div style={{maxWidth:600}}>
      <Card style={{marginBottom:16,background:"linear-gradient(135deg,#1e1b4b,#312e81)"}}>
        <p style={{margin:"0 0 4px",fontSize:14,fontWeight:900,color:"#c7d2fe"}}>🚀 Skill Collection</p>
        <p style={{margin:"0 0 10px",fontSize:11,color:"#818cf8"}}>Skill tumbuh otomatis dari semua aktivitasmu!</p>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1,background:"rgba(255,255,255,.1)",borderRadius:8,height:10,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${total}%`,background:"linear-gradient(90deg,#818cf8,#c4b5fd)",borderRadius:8,transition:"width .6s"}}/>
          </div>
          <span style={{fontSize:16,fontWeight:900,color:"#fff"}}>{total}%</span>
        </div>
        <p style={{margin:"6px 0 0",fontSize:10,color:"#818cf8"}}>Overall Skill Score</p>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {skills.map(sk=>(
          <Card key={sk.key}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
              <span style={{fontSize:28}}>{sk.icon}</span>
              <div style={{flex:1}}>
                <p style={{margin:0,fontSize:14,fontWeight:900,color:"#1e1b4b"}}>{sk.key}</p>
                <p style={{margin:0,fontSize:11,color:"#64748b"}}>{sk.desc}</p>
              </div>
              <div style={{width:46,height:46,borderRadius:"50%",background:"#eef2ff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#4f46e5",fontSize:14}}>{sk.val}</div>
            </div>
            <div style={{background:"#e0e7ff",borderRadius:8,height:8,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${sk.val}%`,background:"linear-gradient(90deg,#a5b4fc,#6366f1)",borderRadius:8,transition:"width .6s"}}/>
            </div>
            <p style={{margin:"5px 0 0",fontSize:9,color:"#94a3b8"}}>{sk.val<30?"Pemula":sk.val<60?"Berkembang":sk.val<85?"Mahir":"Expert"}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── TAB: JOURNEY ─────────────────────────────────────────────────────────────
function TabJourney({s,d}){
  const[editTarget,setEditTarget]=useState(false);
  const[editDone,setEditDone]=useState(false);
  const[tmpTarget,setTmpTarget]=useState(s.learningTarget);
  const[tmpDone,setTmpDone]=useState(s.learningDone);
  const[editMs,setEditMs]=useState(null);
  const[newLabel,setNewLabel]=useState("");
  const[adding,setAdding]=useState(false);
  return(
    <div style={{maxWidth:560}}>
      <Card style={{marginBottom:16}}>
        <p style={{margin:"0 0 14px",fontSize:14,fontWeight:900,color:"#1e1b4b"}}>🌟 Learning Journey</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          <div style={{background:"#f8faff",borderRadius:16,padding:"12px 14px",border:"1px solid #e0e7ff"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <p style={{margin:0,fontSize:9,color:"#6366f1",fontWeight:800}}>TARGET (JAM)</p>
              <button onClick={()=>setEditTarget(t=>!t)}style={{background:"none",border:"none",color:"#6366f1",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>✏️</button>
            </div>
            {editTarget
              ?<div style={{display:"flex",gap:6}}><input type="number"value={tmpTarget}onChange={e=>setTmpTarget(Number(e.target.value))}style={{width:"100%",padding:"4px 8px",borderRadius:8,border:"1.5px solid #c7d2fe",fontSize:14,fontWeight:900,fontFamily:"inherit"}}/><button onClick={()=>{d({type:"UPDATE_JOURNEY",data:{learningTarget:tmpTarget}});setEditTarget(false);}}style={{background:"#6366f1",color:"#fff",border:"none",borderRadius:8,padding:"4px 10px",fontSize:10,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>✓</button></div>
              :<p style={{margin:0,fontSize:24,fontWeight:900,color:"#1e1b4b"}}>{s.learningTarget}h</p>
            }
          </div>
          <div style={{background:"#f8faff",borderRadius:16,padding:"12px 14px",border:"1px solid #e0e7ff"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <p style={{margin:0,fontSize:9,color:"#6366f1",fontWeight:800}}>SUDAH (JAM)</p>
              <button onClick={()=>setEditDone(t=>!t)}style={{background:"none",border:"none",color:"#6366f1",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>✏️</button>
            </div>
            {editDone
              ?<div style={{display:"flex",gap:6}}><input type="number"value={tmpDone}onChange={e=>setTmpDone(Number(e.target.value))}style={{width:"100%",padding:"4px 8px",borderRadius:8,border:"1.5px solid #c7d2fe",fontSize:14,fontWeight:900,fontFamily:"inherit"}}/><button onClick={()=>{d({type:"UPDATE_JOURNEY",data:{learningDone:tmpDone}});setEditDone(false);}}style={{background:"#6366f1",color:"#fff",border:"none",borderRadius:8,padding:"4px 10px",fontSize:10,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>✓</button></div>
              :<p style={{margin:0,fontSize:24,fontWeight:900,color:"#1e1b4b"}}>{s.learningDone}h</p>
            }
          </div>
        </div>
        <div style={{background:"#e0e7ff",borderRadius:8,height:10,overflow:"hidden",marginBottom:6}}>
          <div style={{height:"100%",width:`${Math.min(100,Math.round(s.learningDone/s.learningTarget*100))}%`,background:"linear-gradient(90deg,#818cf8,#6366f1)",borderRadius:8,transition:"width .5s"}}/>
        </div>
        <p style={{margin:0,fontSize:11,color:"#6366f1",fontWeight:800}}>{Math.min(100,Math.round(s.learningDone/s.learningTarget*100))}% tercapai</p>
      </Card>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <p style={{margin:0,fontSize:13,fontWeight:900,color:"#1e1b4b"}}>Milestone Perjalanan</p>
          <button onClick={()=>setAdding(t=>!t)}style={{background:"#eef2ff",color:"#4f46e5",border:"none",borderRadius:10,padding:"5px 12px",fontSize:10,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>+ Tambah</button>
        </div>
        {adding&&(
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input value={newLabel}onChange={e=>setNewLabel(e.target.value)}placeholder="Nama milestone..."style={{flex:1,padding:"7px 12px",borderRadius:10,border:"1.5px solid #e0e7ff",fontSize:11,fontWeight:700,outline:"none",fontFamily:"inherit"}}/>
            <button onClick={()=>{if(newLabel.trim()){d({type:"ADD_MILESTONE",label:newLabel.trim()});setNewLabel("");setAdding(false);}}}style={{background:"#6366f1",color:"#fff",border:"none",borderRadius:10,padding:"7px 14px",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>+</button>
          </div>
        )}
        <div style={{position:"relative",paddingLeft:28}}>
          <div style={{position:"absolute",left:12,top:0,bottom:0,width:2,background:"#e0e7ff",borderRadius:2}}/>
          {s.learningMilestones.map(item=>(
            <div key={item.id}style={{position:"relative",marginBottom:14}}>
              <div onClick={()=>d({type:"TOGGLE_MILESTONE",id:item.id})}style={{position:"absolute",left:-22,top:6,width:20,height:20,borderRadius:"50%",background:item.done?"#6366f1":"#e0e7ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,border:"2px solid #fff",cursor:"pointer",color:"#fff"}}>{item.done?"✓":""}</div>
              {editMs===item.id
                ?<div style={{display:"flex",gap:6}}>
                  <input defaultValue={item.label}id={`ml-${item.id}`}style={{flex:1,padding:"6px 10px",borderRadius:10,border:"1.5px solid #c7d2fe",fontSize:11,fontWeight:700,outline:"none",fontFamily:"inherit"}}/>
                  <button onClick={()=>{const v=document.getElementById(`ml-${item.id}`).value;d({type:"UPDATE_MILESTONE",id:item.id,data:{label:v}});setEditMs(null);}}style={{background:"#6366f1",color:"#fff",border:"none",borderRadius:10,padding:"5px 12px",fontSize:10,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>✓</button>
                  <button onClick={()=>setEditMs(null)}style={{background:"#f1f5ff",color:"#6366f1",border:"none",borderRadius:10,padding:"5px 10px",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
                </div>
                :<div style={{background:"#fff",borderRadius:14,padding:"10px 14px",border:`1px solid ${item.done?"#c7d2fe":"#e8eaf2"}`,display:"flex",alignItems:"center",gap:8,opacity:item.done?1:0.8}}>
                  <span style={{fontSize:12,fontWeight:800,color:item.done?"#6366f1":"#94a3b8",flex:1}}>{item.done?"✅ ":""}{item.label}{item.date&&<span style={{marginLeft:8,fontSize:9,color:"#94a3b8"}}>{item.date}</span>}</span>
                  <button onClick={()=>setEditMs(item.id)}style={{background:"none",border:"none",color:"#6366f1",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>✏️</button>
                </div>
              }
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── TAB: RANK ────────────────────────────────────────────────────────────────
function TabRank({s}){
  const cur=getRankIdx(s.xp);
  return(
    <div style={{maxWidth:580}}>
      <Card style={{marginBottom:16}}><p style={{margin:"0 0 4px",fontSize:14,fontWeight:900,color:"#1e1b4b"}}>🎖️ Rank System</p><p style={{margin:0,fontSize:11,color:"#94a3b8"}}>Kumpulkan XP dari semua aktivitas untuk naik rank!</p></Card>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {RANKS.map((rank,i)=>{
          const active=i===cur,done=i<cur;
          const pct=done?100:active?Math.min(100,Math.round(((s.xp-(RANK_XP[i]||0))/((RANK_XP[i+1]||RANK_XP[i]+200)-(RANK_XP[i]||0)))*100)):0;
          return(
            <div key={rank}style={{background:"#fff",borderRadius:20,padding:"16px 20px",border:`2px solid ${active?"#6366f1":done?"#86efac":"#e8eaf2"}`}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:active?10:0}}>
                <span style={{fontSize:32}}>{RANK_ICONS[i]}</span>
                <div style={{flex:1}}><p style={{margin:"0 0 2px",fontSize:15,fontWeight:900,color:active?"#4f46e5":done?"#16a34a":"#94a3b8"}}>{rank}</p><p style={{margin:0,fontSize:10,color:"#94a3b8"}}>{RANK_XP[i]}+ XP</p></div>
                {active&&<span style={{background:"#eef2ff",color:"#4f46e5",fontSize:10,fontWeight:900,padding:"5px 14px",borderRadius:10}}>⭐ Aktif</span>}
                {done&&<span style={{fontSize:18}}>✅</span>}
                {!active&&!done&&<span style={{background:"#f1f5ff",color:"#94a3b8",fontSize:10,fontWeight:900,padding:"5px 14px",borderRadius:10}}>🔒</span>}
              </div>
              {active&&<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:9,color:"#6366f1",fontWeight:800}}>Progress ke {RANKS[i+1]||"MAX"}</span><span style={{fontSize:9,color:"#94a3b8"}}>{s.xp}/{RANK_XP[i+1]||"MAX"} XP</span></div><div style={{background:"#e0e7ff",borderRadius:8,height:7,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#818cf8,#6366f1)",borderRadius:8,transition:"width .5s"}}/></div></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TAB: MONEY ───────────────────────────────────────────────────────────────
function TabMoney({s,d}){
  const[form,setForm]=useState({type:"out",label:"",amount:"",cat:"Jajan"});
  const totalIn=s.transactions.filter(t=>t.type==="in").reduce((a,b)=>a+b.amount,0);
  const totalOut=s.transactions.filter(t=>t.type==="out").reduce((a,b)=>a+b.amount,0);
  const months=Math.ceil((s.savingTarget-s.savingNow)/Math.max(s.savingMonthly,1));
  const kopiTotal=s.transactions.filter(t=>t.cat==="Kopi").reduce((a,b)=>a+b.amount,0);
  const add=()=>{
    if(!form.label||!form.amount)return;
    d({type:"ADD_TRANSACTION",tx:{id:Date.now(),type:form.type,label:form.label,amount:parseInt(form.amount),cat:form.cat,date:new Date().toLocaleDateString("id-ID",{day:"numeric",month:"short"})}});
    setForm(f=>({...f,label:"",amount:""}));
  };
  return(
    <div style={{maxWidth:700}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
        {[["💸 MASUK","#f0fdf4","#86efac","#166534",`Rp${totalIn.toLocaleString("id")}`],["💳 KELUAR","#fef2f2","#fca5a5","#991b1b",`Rp${totalOut.toLocaleString("id")}`],["📈 SALDO","#f8faff","#e0e7ff","#4f46e5",`Rp${(totalIn-totalOut).toLocaleString("id")}`]].map(([l,bg,bd,cl,v])=>(
          <div key={l}style={{background:bg,borderRadius:20,padding:16,border:`1.5px solid ${bd}`}}><p style={{margin:"0 0 4px",fontSize:10,color:cl,fontWeight:800}}>{l}</p><p style={{margin:0,fontSize:17,fontWeight:900,color:cl}}>{v}</p></div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <Card>
          <p style={{margin:"0 0 10px",fontSize:13,fontWeight:900,color:"#1e1b4b"}}>Transaksi Terbaru</p>
          {s.transactions.length===0&&<p style={{fontSize:11,color:"#94a3b8",textAlign:"center",padding:16}}>Belum ada transaksi</p>}
          {s.transactions.slice(-6).reverse().map(t=>(
            <div key={t.id}style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:18}}>{CAT_ICONS[t.cat]||"💰"}</span>
              <div style={{flex:1}}><p style={{margin:0,fontSize:11,fontWeight:800,color:"#1e1b4b"}}>{t.label}</p><p style={{margin:0,fontSize:9,color:"#94a3b8"}}>{t.cat} · {t.date}</p></div>
              <span style={{fontSize:11,fontWeight:900,color:t.type==="in"?"#16a34a":"#dc2626"}}>{t.type==="in"?"+":"-"}Rp{t.amount.toLocaleString("id")}</span>
            </div>
          ))}
        </Card>
        <Card>
          <p style={{margin:"0 0 10px",fontSize:13,fontWeight:900,color:"#1e1b4b"}}>🎯 Target Nabung</p>
          <p style={{margin:"0 0 8px",fontSize:16,fontWeight:900,color:"#4f46e5"}}>Rp{s.savingTarget.toLocaleString("id")}</p>
          <div style={{background:"#e0e7ff",borderRadius:8,height:8,overflow:"hidden",marginBottom:6}}>
            <div style={{height:"100%",width:`${Math.min(100,Math.round(s.savingNow/s.savingTarget*100))}%`,background:"linear-gradient(90deg,#818cf8,#6366f1)",borderRadius:8}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:10,fontWeight:800,color:"#6366f1"}}>Rp{s.savingNow.toLocaleString("id")}</span><span style={{fontSize:10,color:"#94a3b8"}}>{Math.round(s.savingNow/s.savingTarget*100)}%</span></div>
          <div style={{background:"#f0fdf4",borderRadius:12,padding:"8px 12px",border:"1px solid #bbf7d0"}}><p style={{margin:0,fontSize:10,fontWeight:800,color:"#166534"}}>⏱ Est. {isFinite(months)&&months>0?months+"bln":"—"}</p></div>
        </Card>
      </div>
      {kopiTotal>0&&<div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRadius:18,padding:14,border:"1.5px solid #86efac",marginBottom:14}}><p style={{margin:"0 0 4px",fontSize:10,fontWeight:800,color:"#16a34a"}}>🤖 AI INSIGHT</p><p style={{margin:0,fontSize:12,color:"#166534",fontWeight:700}}>Kamu habis Rp{kopiTotal.toLocaleString("id")} untuk kopi ☕. Kurangi 20% → hemat Rp{Math.round(kopiTotal*0.2).toLocaleString("id")}!</p></div>}
      <Card>
        <p style={{margin:"0 0 10px",fontSize:13,fontWeight:900,color:"#1e1b4b"}}>+ Tambah Transaksi</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <input value={form.label}onChange={e=>setForm(f=>({...f,label:e.target.value}))}placeholder="Nama transaksi..."style={{padding:"8px 12px",borderRadius:12,border:"1.5px solid #e0e7ff",fontSize:12,fontWeight:700,outline:"none",fontFamily:"inherit"}}/>
          <input type="number"value={form.amount}onChange={e=>setForm(f=>({...f,amount:e.target.value}))}placeholder="Jumlah (Rp)..."style={{padding:"8px 12px",borderRadius:12,border:"1.5px solid #e0e7ff",fontSize:12,fontWeight:700,outline:"none",fontFamily:"inherit"}}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <select value={form.cat}onChange={e=>setForm(f=>({...f,cat:e.target.value}))}style={{flex:1,padding:"8px 12px",borderRadius:12,border:"1.5px solid #e0e7ff",fontSize:12,fontWeight:700,outline:"none",fontFamily:"inherit"}}>{Object.keys(CAT_ICONS).map(c=><option key={c}>{c}</option>)}</select>
          <select value={form.type}onChange={e=>setForm(f=>({...f,type:e.target.value}))}style={{width:120,padding:"8px 12px",borderRadius:12,border:"1.5px solid #e0e7ff",fontSize:12,fontWeight:700,outline:"none",fontFamily:"inherit"}}><option value="out">Keluar</option><option value="in">Masuk</option></select>
          <button onClick={add}style={{background:"#6366f1",color:"#fff",border:"none",borderRadius:12,padding:"8px 18px",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>+ Tambah</button>
        </div>
      </Card>
    </div>
  );
}

// ── TAB: CALCULATOR ──────────────────────────────────────────────────────────
function TabCalc(){
  const[mode,setMode]=useState("Normal");
  const[display,setDisplay]=useState("0");
  const[avg,setAvg]=useState("");
  const[sn,setSn]=useState("2500000");
  const[st,setSt]=useState("8000000");
  const[sm,setSm]=useState("500000");
  const[td,setTd]=useState("100");
  const[dd,setDd]=useState("0");
  const press=v=>setDisplay(d=>{
    if(v==="C")return"0";
    if(v==="="){try{return String(Function('"use strict";return ('+d.replace(/×/g,"*").replace(/÷/g,"/")+")")())}catch{return"Error"}}
    if(v==="⌫")return d.length>1?d.slice(0,-1):"0";
    return d==="0"&&!["+","-","×","÷","."].includes(v)?v:d+v;
  });
  const btns=["7","8","9","÷","4","5","6","×","1","2","3","-","0",".","=","+"];
  const avgVals=avg.split(",").map(v=>parseFloat(v.trim())).filter(v=>!isNaN(v));
  const avgRes=avgVals.length?avgVals.reduce((a,b)=>a+b,0)/avgVals.length:null;
  const mos=Math.ceil((parseInt(st||"0")-parseInt(sn||"0"))/Math.max(parseInt(sm||"1"),1));
  const pct=Math.min(100,Math.round(parseInt(dd||"0")/Math.max(parseInt(td||"1"),1)*100));
  return(
    <div style={{maxWidth:480}}>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {["Normal","Pelajar","Uang","Produktivitas"].map(m=>(
          <button key={m}onClick={()=>setMode(m)}style={{background:mode===m?"#6366f1":"#eef2ff",color:mode===m?"#fff":"#4f46e5",border:"none",borderRadius:12,padding:"7px 16px",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>{m}</button>
        ))}
      </div>
      {mode==="Normal"&&<Card>
        <div style={{background:"#0f172a",borderRadius:16,padding:"16px 20px",marginBottom:14,textAlign:"right"}}><p style={{margin:0,fontSize:28,fontWeight:900,color:"#34d399",fontFamily:"monospace",wordBreak:"break-all",minHeight:40}}>{display}</p></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {btns.map(b=><button key={b}onClick={()=>press(b)}style={{padding:"14px",borderRadius:14,border:"none",background:["÷","×","-","+","="].includes(b)?"#6366f1":"#f8faff",color:["÷","×","-","+","="].includes(b)?"#fff":"#1e1b4b",fontSize:16,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>{b}</button>)}
          <button onClick={()=>press("C")}style={{padding:"14px",borderRadius:14,border:"none",background:"#fef2f2",color:"#dc2626",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>C</button>
          <button onClick={()=>press("⌫")}style={{padding:"14px",borderRadius:14,border:"none",background:"#fef3c7",color:"#92400e",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>⌫</button>
        </div>
      </Card>}
      {mode==="Pelajar"&&<Card>
        <p style={{margin:"0 0 10px",fontSize:13,fontWeight:900,color:"#1e1b4b"}}>📊 Kalkulator Nilai Rata-rata</p>
        <textarea value={avg}onChange={e=>setAvg(e.target.value)}placeholder="Masukkan nilai dipisah koma, contoh: 80, 75, 90, 85"style={{width:"100%",padding:"10px 14px",borderRadius:14,border:"1.5px solid #e0e7ff",fontSize:12,fontWeight:700,outline:"none",resize:"none",height:70,marginBottom:12,fontFamily:"inherit"}}/>
        {avgRes!==null&&<div style={{background:"#eef2ff",borderRadius:16,padding:"14px 18px",textAlign:"center"}}><p style={{margin:"0 0 4px",fontSize:10,color:"#6366f1",fontWeight:800}}>RATA-RATA</p><p style={{margin:0,fontSize:36,fontWeight:900,color:"#4f46e5"}}>{avgRes.toFixed(1)}</p><p style={{margin:"4px 0 0",fontSize:10,color:"#818cf8"}}>dari {avgVals.length} nilai</p></div>}
      </Card>}
      {mode==="Uang"&&<Card>
        <p style={{margin:"0 0 12px",fontSize:13,fontWeight:900,color:"#1e1b4b"}}>🎯 Kalkulator Target Nabung</p>
        {[["Target (Rp)",st,setSt],["Tabungan sekarang (Rp)",sn,setSn],["Nabung per bulan (Rp)",sm,setSm]].map(([l,v,sv])=>(
          <div key={l}style={{marginBottom:10}}><p style={{margin:"0 0 4px",fontSize:10,fontWeight:800,color:"#64748b"}}>{l}</p><input type="number"value={v}onChange={e=>sv(e.target.value)}style={{width:"100%",padding:"8px 12px",borderRadius:12,border:"1.5px solid #e0e7ff",fontSize:13,fontWeight:700,outline:"none",fontFamily:"inherit"}}/></div>
        ))}
        <div style={{background:"#eef2ff",borderRadius:16,padding:"14px 18px",textAlign:"center",marginTop:12}}><p style={{margin:"0 0 4px",fontSize:10,color:"#6366f1",fontWeight:800}}>ESTIMASI</p><p style={{margin:0,fontSize:36,fontWeight:900,color:"#4f46e5"}}>{isFinite(mos)&&mos>0?mos:"∞"} bulan</p><p style={{margin:"4px 0 0",fontSize:10,color:"#818cf8"}}>Progress: {Math.min(100,Math.round(parseInt(sn||"0")/Math.max(parseInt(st||"1"),1)*100))}%</p></div>
      </Card>}
      {mode==="Produktivitas"&&<Card>
        <p style={{margin:"0 0 12px",fontSize:13,fontWeight:900,color:"#1e1b4b"}}>📊 Kalkulator Produktivitas</p>
        {[["Target Belajar (Jam)",td,setTd],["Sudah Tercapai (Jam)",dd,setDd]].map(([l,v,sv])=>(
          <div key={l}style={{marginBottom:10}}><p style={{margin:"0 0 4px",fontSize:10,fontWeight:800,color:"#64748b"}}>{l}</p><input type="number"value={v}onChange={e=>sv(e.target.value)}style={{width:"100%",padding:"8px 12px",borderRadius:12,border:"1.5px solid #e0e7ff",fontSize:13,fontWeight:700,outline:"none",fontFamily:"inherit"}}/></div>
        ))}
        <div style={{background:"linear-gradient(135deg,#1e1b4b,#312e81)",borderRadius:16,padding:"18px 20px",textAlign:"center",marginTop:12}}><p style={{margin:"0 0 8px",fontSize:10,color:"#818cf8",fontWeight:800}}>PROGRESS BELAJAR</p><p style={{margin:"0 0 10px",fontSize:44,fontWeight:900,color:"#fff"}}>{pct}%</p><div style={{background:"rgba(255,255,255,.15)",borderRadius:8,height:9,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#818cf8,#c4b5fd)",borderRadius:8,transition:"width .6s"}}/></div><p style={{margin:"8px 0 0",fontSize:11,color:"#c7d2fe"}}>{dd}/{td} Jam · Sisa {Math.max(0,parseInt(td||"0")-parseInt(dd||"0"))} Jam</p></div>
      </Card>}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
const STORAGE_KEY="plotwist_state_v1";
function loadState(){
  try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return INIT;return{...INIT,...JSON.parse(raw)};}
  catch(e){return INIT;}
}

export default function PlottwistApp(){
  const[state,dispatch]=useReducer(reducer,undefined,loadState);
  const[tab,setTab]=useState("dashboard");
  const[toast,setToast]=useState(null);
  const ri=getRankIdx(state.xp);

  useEffect(()=>{
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
    catch(e){console.warn("localStorage error:",e);}
  },[state]);

  useEffect(()=>{
    const save=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){}};
    window.addEventListener("beforeunload",save);
    const handleVis=()=>{if(document.visibilityState==="hidden")save();};
    document.addEventListener("visibilitychange",handleVis);
    return()=>{window.removeEventListener("beforeunload",save);document.removeEventListener("visibilitychange",handleVis);};
  },[state]);

  useEffect(()=>{
    const today=new Date().toDateString();
    if(state.lastLoginDate===today)return;
    const yesterday=new Date(Date.now()-86400000).toDateString();
    let newStreak=1,msg="";
    if(!state.lastLoginDate){msg="👋 Selamat datang! Perjalanan belajarmu dimulai hari ini! 🌱";}
    else if(state.lastLoginDate===yesterday){
      newStreak=state.streak+1;
      if(newStreak>=7)msg=`🏅 LUAR BIASA! Streak ${newStreak} hari! Kamu sudah unlock badge "7 Hari Konsisten"!`;
      else msg=`🔥 Streak ${newStreak} hari! Terus pertahankan login tiap hari!`;
    }else{msg="💔 Streak-mu terputus. Mulai lagi dari hari ini — kamu pasti bisa! 💪";}
    dispatch({type:"UPDATE_STREAK",streak:newStreak,date:today});
    dispatch({type:"RESET_DAILY",date:today});
    if(msg){setToast(msg);setTimeout(()=>setToast(null),5000);}
  // eslint-disable-next-line
  },[]);

  const CONTENT={
    dashboard:<TabDashboard s={state}d={dispatch}setTab={setTab}/>,
    quest:<TabQuest s={state}d={dispatch}/>,
    companion:<TabCompanion s={state}d={dispatch}/>,
    map:<TabMap s={state}d={dispatch}/>,
    focus:<TabFocus s={state}d={dispatch}/>,
    mystery:<TabMystery s={state}d={dispatch}/>,
    achievement:<TabAchievement s={state}/>,
    mood:<TabMood s={state}d={dispatch}/>,
    skill:<TabSkill s={state}/>,
    journey:<TabJourney s={state}d={dispatch}/>,
    rank:<TabRank s={state}/>,
    money:<TabMoney s={state}d={dispatch}/>,
    calc:<TabCalc/>,
  };

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;}body{font-family:'Sora',sans-serif;background:#f0f2f8;margin:0;}
        @keyframes bounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}
        @keyframes float{from{transform:translateY(0);}to{transform:translateY(-8px);}}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-20px);}to{opacity:1;transform:translateY(0);}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
        textarea,input,select{font-family:'Sora',sans-serif;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#c7d2fe;border-radius:4px;}
        button:hover{opacity:0.9;}
      `}</style>

      {toast&&(
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:9999,
          background:"linear-gradient(135deg,#1e1b4b,#312e81)",color:"#fff",
          borderRadius:16,padding:"12px 24px",fontSize:13,fontWeight:800,
          boxShadow:"0 8px 32px rgba(99,102,241,0.4)",animation:"slideDown .4s ease",
          maxWidth:480,textAlign:"center",border:"1.5px solid rgba(165,180,252,0.4)"}}>
          {toast}
        </div>
      )}

      <div style={{position:"fixed",bottom:16,right:16,zIndex:999,
        background:"#f0fdf4",color:"#16a34a",fontSize:9,fontWeight:800,
        padding:"4px 10px",borderRadius:10,border:"1px solid #bbf7d0",
        display:"flex",alignItems:"center",gap:4,opacity:0.8}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",display:"inline-block"}}/>
        Auto-saved
      </div>

      <div style={{minHeight:"100vh",background:"#f0f2f8",display:"flex",fontFamily:"'Sora',sans-serif"}}>
        {/* SIDEBAR */}
        <aside style={{width:210,background:"#fff",display:"flex",flexDirection:"column",borderRight:"1.5px solid #e8eaf2",height:"100vh",position:"sticky",top:0,flexShrink:0}}>
          <div style={{padding:"18px 16px 10px"}}>
            <div style={{fontSize:20,fontWeight:900,color:"#4f46e5",letterSpacing:-1,marginBottom:2}}>Plotwist</div>
            <p style={{margin:0,fontSize:9,color:"#94a3b8",fontWeight:700}}>Your Learning Universe</p>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"0 8px 8px"}}>
            {TABS.map(t=>(
              <button key={t.key}onClick={()=>setTab(t.key)}
                style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:12,border:"none",
                  background:tab===t.key?"#eef2ff":"transparent",color:tab===t.key?"#4f46e5":"#94a3b8",
                  fontSize:11,fontWeight:800,cursor:"pointer",textAlign:"left",marginBottom:1,fontFamily:"inherit",transition:"all .1s"}}>
                <span style={{fontSize:14}}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
          <div style={{padding:"12px 14px",borderTop:"1.5px solid #e8eaf2"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <Mascot evo={state.mascotEvo}costume={state.mascotCostume||"default"}mood={state.mood}size={38}/>
              <div>
                <p style={{margin:0,fontSize:10,fontWeight:900,color:"#1e1b4b"}}>{RANK_ICONS[ri]} {RANKS[ri]}</p>
                <p style={{margin:0,fontSize:9,color:"#94a3b8"}}>⚡{state.xp} · 🪙{state.coins}</p>
              </div>
            </div>
            <div style={{background:"#fff7ed",borderRadius:10,padding:"6px 10px",border:"1px solid #fed7aa",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14}}>🔥</span>
              <div>
                <p style={{margin:0,fontSize:10,fontWeight:900,color:"#92400e"}}>{state.streak} hari streak</p>
                <p style={{margin:0,fontSize:8,color:"#b45309"}}>Login tiap hari untuk jaga streak!</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{flex:1,padding:"22px 26px 40px",overflowY:"auto",minWidth:0}}>
          <div style={{marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {tab!=="dashboard"&&(
                <button onClick={()=>setTab("dashboard")}
                  style={{background:"#eef2ff",color:"#4f46e5",border:"none",borderRadius:12,padding:"8px 14px",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>
                  ← Dashboard
                </button>
              )}
              <div>
                <h1 style={{margin:0,fontSize:18,fontWeight:900,color:"#1e1b4b"}}>
                  {TABS.find(t=>t.key===tab)?.icon} {TABS.find(t=>t.key===tab)?.label}
                </h1>
                <p style={{margin:0,fontSize:10,color:"#94a3b8",marginTop:2}}>
                  {new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                </p>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{background:"#eef2ff",borderRadius:12,padding:"5px 12px",fontSize:11,fontWeight:800,color:"#4f46e5"}}>⚡ {state.xp} XP</span>
              <span style={{background:"#fef3c7",borderRadius:12,padding:"5px 12px",fontSize:11,fontWeight:800,color:"#92400e"}}>🪙 {state.coins}</span>
              <span style={{background:"#f0fdf4",borderRadius:12,padding:"5px 12px",fontSize:11,fontWeight:800,color:"#16a34a"}}>💚 {state.energy}</span>
              <span style={{background:"#fff7ed",borderRadius:12,padding:"5px 12px",fontSize:11,fontWeight:800,color:"#92400e",border:"1px solid #fed7aa"}}>🔥 {state.streak} hari</span>
            </div>
          </div>
          {CONTENT[tab]}
        </main>
      </div>
    </>
  );
}