import { useState, useEffect, useCallback, useRef } from "react";



const CONFIG = {
  firebase: {
    apiKey: "AIzaSyAig1lb69DIwmNlL9MN8z9Truy_p2jB7z8",
    authDomain: "dopamine-center.firebaseapp.com",
    projectId: "dopamine-center",
    storageBucket: "dopamine-center.firebasestorage.app",
    messagingSenderId: "382426081147",
    appId: "1:382426081147:web:a8858d8e7ee952badaffde"
  },
  discord: {
    clientId: "1488088246784098464",
    redirectUri: "http://localhost:5173",
    guildId: "1483000167119585432",
    adminIds: ["1463135627854745677", "423847758642937856", "605718663395409920"],
  },
};


function getAuthUrl() {
  const st = Math.random().toString(36).slice(2);
  sessionStorage.setItem("dc_st", st);
  return `https://discord.com/api/oauth2/authorize?${new URLSearchParams({
    client_id: CONFIG.discord.clientId,
    redirect_uri: CONFIG.discord.redirectUri,
    response_type: "token",
    scope: "identify guilds",
    state: st,
  })}`;
}

function grabToken() {
  const h = window.location.hash.slice(1);
  if (!h) return null;
  const p = new URLSearchParams(h);
  const t = p.get("access_token"), s = p.get("state");
  if (s && sessionStorage.getItem("dc_st") !== s) return null;
  sessionStorage.removeItem("dc_st");
  window.history.replaceState({}, "", window.location.pathname);
  return t;
}

async function dcApi(path, tok) {
  const r = await fetch(`https://discord.com/api${path}`, { headers: { Authorization: `Bearer ${tok}` } });
  if (!r.ok) throw new Error(`Discord ${r.status}`);
  return r.json();
}


let db = null, fs = null;
async function initFB() {
  if (db) return;
  const a = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
  fs = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
  db = fs.getFirestore(a.initializeApp(CONFIG.firebase));
}
async function fbAll(c) { if(!db)return[]; const s=await fs.getDocs(fs.collection(db,c)); const o=[]; s.forEach(d=>o.push({id:d.id,...d.data()})); return o; }
async function fbSet(c,id,d) { if(!db)return; await fs.setDoc(fs.doc(db,c,id),d,{merge:true}); }
async function fbAdd(c,d) { if(!db)return"l_"+Date.now(); return(await fs.addDoc(fs.collection(db,c),d)).id; }
async function fbDel(c,id) { if(!db)return; await fs.deleteDoc(fs.doc(db,c,id)); }
async function fbUpd(c,id,d) { if(!db)return; await fs.updateDoc(fs.doc(db,c,id),d); }


const G = {
  bg:"#08080f", bg2:"#0e0e1a", card:"#131320", cardH:"#1a1a2e",
  bdr:"#1f1f3a", bdrH:"#2d2d55",
  tx:"#eee", txM:"#777", txD:"#444",
  neonPink:"#ff2d8a", neonBlue:"#00d4ff", neonPurple:"#b44aff",
  neonYellow:"#ffe156", neonGreen:"#39ff7f",
  acc:"#b44aff", accG:"linear-gradient(135deg,#b44aff,#ff2d8a)",
  discord:"#5865F2",
  red:"#ff4466", green:"#39ff7f", gold:"#ffe156",
};

const glow = (color, blur=20) => `0 0 ${blur}px ${color}40, 0 0 ${blur*2}px ${color}20`;
const neonText = (color) => ({ textShadow: `0 0 7px ${color}80, 0 0 20px ${color}40, 0 0 40px ${color}20` });


function Av({ src, name, size=44 }) {
  if (src) return <img src={src} alt="" style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", flexShrink:0, border:`2px solid ${G.bdr}` }}/>;
  const h = (name||"?").split("").reduce((a,c)=>a+c.charCodeAt(0),0)%360;
  return <div style={{
    width:size, height:size, borderRadius:"50%", flexShrink:0,
    background:`linear-gradient(135deg, hsl(${h},70%,45%), hsl(${h},70%,25%))`,
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:size*.4, fontWeight:700, color:"#fff", border:`2px solid hsl(${h},70%,35%)`,
  }}>{(name||"?")[0]}</div>;
}

function Rank({ n }) {
  const c = {1:G.gold,2:"#c0c0c0",3:"#cd7f32"};
  return <span style={{ fontSize:18, fontWeight:900, width:28, textAlign:"center", color:c[n]||G.txD, display:"inline-block", ...neonText(c[n]||"transparent") }}>{n}</span>;
}

function NeonBtn({ children, onClick, color=G.acc, disabled, small, style:sx }) {
  return <button onClick={onClick} disabled={disabled} style={{
    background: disabled ? G.bdr : `${color}20`,
    border: `1px solid ${disabled ? G.txD : color}60`,
    color: disabled ? G.txD : color,
    padding: small ? "5px 12px" : "8px 18px",
    borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer",
    fontSize: small ? 12 : 13, fontWeight: 600,
    transition: "all .15s", boxShadow: disabled ? "none" : glow(color, 8),
    ...sx,
  }}>{children}</button>;
}


function LoginScreen({ onLogin }) {
  return (
    <div style={{
      minHeight:"100vh", background:G.bg, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:24, position:"relative", overflow:"hidden",
    }}>
      {/* Background glow effects */}
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:`radial-gradient(circle, ${G.neonPink}15, transparent 70%)`, top:"-10%", left:"-10%", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:`radial-gradient(circle, ${G.neonBlue}10, transparent 70%)`, bottom:"-15%", right:"-10%", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:`radial-gradient(circle, ${G.neonPurple}12, transparent 70%)`, top:"30%", right:"20%", pointerEvents:"none" }}/>

      <div style={{ position:"relative", zIndex:1, textAlign:"center", maxWidth:500 }}>
        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontSize: 56, fontWeight: 900, lineHeight: 1.15, marginBottom: 8,
            letterSpacing: -2,
          }}>
            <span style={{ color:G.neonYellow, ...neonText(G.neonYellow) }}>도파민</span>
            <br/>
            <span style={{ color:G.neonPink, ...neonText(G.neonPink) }}>중독</span>
            <span style={{ color:G.neonBlue, ...neonText(G.neonBlue) }}>구역</span>
          </div>
          <div style={{
            display:"inline-block", padding:"6px 24px", borderRadius:20,
            border:`1px solid ${G.neonBlue}50`, background:`${G.neonBlue}10`,
            fontSize:14, fontWeight:600, color:G.neonBlue, letterSpacing:3,
            ...neonText(G.neonBlue),
          }}>DOPAMINE ZONE</div>
        </div>

        {/* Sparks decoration */}
        <div style={{ fontSize:12, color:G.neonYellow, marginBottom:8, ...neonText(G.neonYellow) }}>⚡ ⚡ ⚡</div>

        <p style={{ color:G.txM, fontSize:15, lineHeight:1.7, marginBottom:40 }}>
          게임 파티를 만들고, 함께할 동료를 모집하세요
        </p>

        <button onClick={onLogin} style={{
          background: G.discord, color:"#fff", border:"none",
          padding:"14px 40px", borderRadius:14, cursor:"pointer",
          fontSize:16, fontWeight:700, display:"inline-flex", alignItems:"center", gap:10,
          boxShadow: `0 0 30px ${G.discord}50, 0 4px 20px rgba(0,0,0,0.5)`,
          transition:"transform .15s, box-shadow .15s",
        }}
          onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 0 40px ${G.discord}70, 0 8px 30px rgba(0,0,0,0.5)`; }}
          onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=`0 0 30px ${G.discord}50, 0 4px 20px rgba(0,0,0,0.5)`; }}
        >
          <svg width="22" height="17" viewBox="0 0 71 55" fill="none"><path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.2a58.9 58.9 0 0017.7 9a.2.2 0 00.3-.1 42.1 42.1 0 003.6-5.9.2.2 0 00-.1-.3 38.8 38.8 0 01-5.6-2.7.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 42 42 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.4 36.4 0 01-5.6 2.7.2.2 0 00-.1.3 47.3 47.3 0 003.6 5.9.2.2 0 00.3.1A58.7 58.7 0 0070.4 45.7v-.2c1.4-15-2.3-28.1-9.8-39.7a.2.2 0 00-.1-.1h0zM23.7 37.3c-3.4 0-6.3-3.2-6.3-7s2.8-7 6.3-7 6.4 3.1 6.3 7-2.8 7-6.3 7zm23.2 0c-3.4 0-6.3-3.2-6.3-7s2.8-7 6.3-7 6.4 3.1 6.3 7-2.8 7-6.3 7z" fill="white"/></svg>
          Discord로 시작하기
        </button>

        <p style={{ color:G.txD, fontSize:12, marginTop:20 }}>디스코드 서버 멤버만 이용할 수 있습니다</p>
      </div>
    </div>
  );
}


function NicknameModal({ current, onSave, onClose }) {
  const [nick, setNick] = useState(current || "");
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:G.card, borderRadius:20, padding:32, width:380, border:`1px solid ${G.bdr}` }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:G.tx, marginBottom:8 }}>닉네임 설정</h2>
        <p style={{ color:G.txM, fontSize:13, marginBottom:20 }}>서버에서 사용할 닉네임을 입력하세요</p>
        <input value={nick} onChange={e=>setNick(e.target.value)} placeholder="닉네임 입력" maxLength={20} autoFocus
          style={{ width:"100%", background:G.bg2, border:`1px solid ${G.bdr}`, color:G.tx, padding:"12px 16px", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:20 }}
          onKeyDown={e=>{ if(e.key==="Enter" && nick.trim()) onSave(nick.trim()); }}
        />
        <div style={{ display:"flex", gap:10 }}>
          <NeonBtn onClick={onClose} color={G.txM} style={{flex:1}}>취소</NeonBtn>
          <button onClick={()=>nick.trim()&&onSave(nick.trim())} style={{
            flex:1, padding:"11px 0", borderRadius:10, cursor:"pointer", fontSize:14,
            background:G.accG, border:"none", color:"#fff", fontWeight:600,
            boxShadow:glow(G.neonPink,10),
          }}>저장</button>
        </div>
      </div>
    </div>
  );
}


function Header({ page, setPage, user, onLogout, onEditNick, isAdmin }) {
  return (
    <header style={{ background:`${G.bg2}ee`, borderBottom:`1px solid ${G.bdr}`, position:"sticky", top:0, zIndex:100, backdropFilter:"blur(12px)" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", height:58, gap:16 }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", flexShrink:0 }} onClick={()=>setPage("home")}>
          <span style={{ fontSize:20, fontWeight:900, color:G.neonYellow, ...neonText(G.neonYellow) }}>도파민</span>
          <span style={{ fontSize:20, fontWeight:900, color:G.neonPink, ...neonText(G.neonPink) }}>중독구역</span>
        </div>

        <nav style={{ display:"flex", gap:4, marginLeft:"auto" }}>
          {[
            {id:"home",lb:"홈"},
            {id:"play",lb:"파티 모집"},
            {id:"members",lb:"멤버"},
            ...(isAdmin ? [{id:"admin",lb:"🛡️ 관리"}] : []),
          ].map(t=>(
            <button key={t.id} onClick={()=>setPage(t.id)} style={{
              background:page===t.id?`${G.neonPurple}18`:"transparent",
              border:page===t.id?`1px solid ${G.neonPurple}40`:"1px solid transparent",
              color:page===t.id?G.neonPurple:G.txM,
              padding:"7px 14px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:500,
              transition:"all .15s",
            }}>{t.lb}</button>
          ))}
        </nav>

        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Av src={user?.avatar} name={user?.nickname} size={30}/>
          <span style={{ fontSize:13, color:G.tx, fontWeight:500, cursor:"pointer" }} onClick={onEditNick} title="닉네임 변경">{user?.nickname}</span>
          <button onClick={onLogout} style={{ background:"none", border:`1px solid ${G.bdr}`, color:G.txM, padding:"4px 10px", borderRadius:6, cursor:"pointer", fontSize:11 }}>로그아웃</button>
        </div>
      </div>
    </header>
  );
}

// ─── HOME PAGE ──────────────────────────────────────────────
function HomePage({ parties, members, setPage }) {
  const now = new Date();
  const sow = new Date(now); sow.setDate(now.getDate()-now.getDay()+1); sow.setHours(0,0,0,0);
  const som = new Date(now.getFullYear(), now.getMonth(), 1);

  function countGames(since) {
    const c={};
    parties.filter(p=>new Date(p.date)>=since && p.status!=="ended").forEach(p=>{c[p.game]=(c[p.game]||0)+1;});
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n,ct],i)=>({rank:i+1,name:n,count:ct}));
  }
  function countMembers(since) {
    const c={};
    parties.filter(p=>new Date(p.date)>=since).forEach(p=>{(p.participants||[]).forEach(pid=>{c[pid]=(c[pid]||0)+1;});});
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([id,ct],i)=>{
      const m=members.find(x=>x.id===id);
      return {rank:i+1, nickname:m?.nickname||"???", avatar:m?.avatar, count:ct};
    });
  }

  const gi={"PUBG: BATTLEGROUNDS":"🔫","Apex Legends":"⚡","House Flipper 2":"🏠","Party Animals":"🎉","REANIMAL":"🐾","Valorant":"🎯","League of Legends":"⚔️","Overwatch 2":"🛡️","Minecraft":"⛏️","Counter-Strike 2":"💥"};

  const upcomingParties = parties
    .filter(p => p.status !== "ended" && new Date(p.date + "T" + (p.time||"23:59")) >= new Date())
    .sort((a,b) => new Date(a.date+"T"+a.time) - new Date(b.date+"T"+b.time))
    .slice(0, 3);

  const Card=({title,icon,items,type,color})=>(
    <div style={{ background:G.card, borderRadius:16, padding:24, border:`1px solid ${G.bdr}`, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, transparent, ${color}, transparent)` }}/>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
        <span style={{ fontSize:18 }}>{icon}</span>
        <h2 style={{ fontSize:16, fontWeight:700, color:G.tx }}>{title}</h2>
      </div>
      {items.length===0 && <p style={{color:G.txD,fontSize:13,padding:"16px 0",textAlign:"center"}}>아직 데이터가 없습니다</p>}
      {items.map((it,idx)=>(
        <div key={idx} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0", borderBottom:idx<items.length-1?`1px solid ${G.bdr}40`:"none" }}>
          <Rank n={it.rank}/>
          {type==="game"?(
            <div style={{ width:38,height:38,borderRadius:8,background:G.bg2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{gi[it.name]||"🎮"}</div>
          ):(<Av name={it.nickname} src={it.avatar} size={36}/>)}
          <span style={{ flex:1, color:G.tx, fontSize:13, fontWeight:500 }}>{type==="game"?it.name:it.nickname}</span>
          <span style={{ color:color, fontSize:13, fontWeight:600, ...neonText(color) }}>{it.count}회</span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px" }}>
      {/* Hero */}
      <div style={{
        textAlign:"center", padding:"48px 24px 56px", marginBottom:32,
        background:G.card, borderRadius:24, border:`1px solid ${G.bdr}`,
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:300, height:300, borderRadius:"50%", background:`radial-gradient(circle, ${G.neonPink}08, transparent 70%)`, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:-50, right:-50, width:200, height:200, borderRadius:"50%", background:`radial-gradient(circle, ${G.neonBlue}06, transparent 70%)`, pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ fontSize:12, color:G.neonYellow, marginBottom:12, letterSpacing:2, ...neonText(G.neonYellow) }}>⚡ ⚡ ⚡</div>
          <h1 style={{ fontSize:42, fontWeight:900, lineHeight:1.2, marginBottom:8, letterSpacing:-1 }}>
            <span style={{ color:G.neonYellow, ...neonText(G.neonYellow) }}>도파민</span>{" "}
            <span style={{ color:G.neonPink, ...neonText(G.neonPink) }}>중독</span>
            <span style={{ color:G.neonBlue, ...neonText(G.neonBlue) }}>구역</span>
          </h1>
          <div style={{ display:"inline-block", padding:"4px 18px", borderRadius:16, border:`1px solid ${G.neonBlue}40`, background:`${G.neonBlue}08`, fontSize:12, fontWeight:600, color:G.neonBlue, letterSpacing:2, marginBottom:16, ...neonText(G.neonBlue) }}>
            DOPAMINE ZONE
          </div>
          <p style={{ color:G.txM, fontSize:14, lineHeight:1.6, marginBottom:24 }}>게임 파티를 만들고, 함께할 동료를 모집하세요</p>
          <button onClick={()=>setPage("play")} style={{
            background:G.accG, color:"#fff", border:"none", padding:"12px 32px",
            borderRadius:12, cursor:"pointer", fontSize:14, fontWeight:700,
            boxShadow:`0 0 25px ${G.neonPink}40`, transition:"transform .15s",
          }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform=""}>
            🎮 파티 모집 바로가기
          </button>
        </div>
      </div>

      {/* Upcoming */}
      {upcomingParties.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:G.tx, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color:G.neonGreen, ...neonText(G.neonGreen) }}>●</span> 다가오는 파티
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {upcomingParties.map(p=>(
              <div key={p.id} onClick={()=>setPage("play")} style={{ background:G.card, borderRadius:14, padding:"16px 18px", border:`1px solid ${G.bdr}`, cursor:"pointer", transition:"border-color .15s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=G.bdrH}
                onMouseLeave={e=>e.currentTarget.style.borderColor=G.bdr}>
                <div style={{ fontSize:14, fontWeight:700, color:G.tx, marginBottom:4 }}>{p.game}</div>
                <div style={{ fontSize:12, color:G.txM }}>{p.date} {p.time}</div>
                <div style={{ fontSize:12, color:G.neonPurple, marginTop:6 }}>{(p.participants||[]).length}/{p.maxPlayers}명</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card title="이번주 인기 게임" icon="📈" items={countGames(sow)} type="game" color={G.neonPink}/>
        <Card title="이번주 열정 멤버" icon="🏆" items={countMembers(sow)} type="member" color={G.neonBlue}/>
        <Card title="이번달 인기 게임" icon="🏅" items={countGames(som)} type="game" color={G.neonPurple}/>
        <Card title="이번달 열정 멤버" icon="🕐" items={countMembers(som)} type="member" color={G.neonGreen}/>
      </div>
    </div>
  );
}

// ─── PARTY MODAL (Create / Edit) ────────────────────────────
function PartyModal({ onClose, onSubmit, initial, isEdit }) {
  const [f, setF] = useState(initial || { game:"", date:new Date().toISOString().slice(0,10), time:"21:00", maxPlayers:4, description:"" });
  const s = (k,v) => setF(p=>({...p,[k]:v}));
  const [saving, setSaving] = useState(false);
  const inp = { width:"100%", background:G.bg2, border:`1px solid ${G.bdr}`, color:G.tx, padding:"10px 14px", borderRadius:10, fontSize:13, outline:"none", boxSizing:"border-box" };

  const submit = async () => {
    if(!f.game.trim()){alert("게임 이름을 입력하세요!");return;}
    setSaving(true); await onSubmit(f); setSaving(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:G.card, borderRadius:20, padding:30, width:440, border:`1px solid ${G.bdr}`, maxHeight:"90vh", overflow:"auto" }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:G.tx, marginBottom:20 }}>{isEdit ? "✏️ 파티 수정" : "🎮 새 파티 만들기"}</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ display:"block", fontSize:12, color:G.txM, marginBottom:5 }}>게임 이름 *</label>
            <input value={f.game} onChange={e=>s("game",e.target.value)} placeholder="예: League of Legends, Valorant..." style={inp} autoFocus/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div>
              <label style={{ display:"block", fontSize:12, color:G.txM, marginBottom:5 }}>날짜 *</label>
              <input type="date" value={f.date} onChange={e=>s("date",e.target.value)} style={inp}/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, color:G.txM, marginBottom:5 }}>시간 *</label>
              <input type="time" value={f.time} onChange={e=>s("time",e.target.value)} style={inp}/>
            </div>
          </div>
      <div>
            <label style={{ display:"block", fontSize:12, color:G.txM, marginBottom:5 }}>최대 인원 (명)</label>
            <input 
              type="number" 
              min="2" 
              max="100" 
              value={f.maxPlayers} 
              onChange={e => s("maxPlayers", parseInt(e.target.value, 10) || 2)} 
              style={inp} 
            />
          </div>
          <div>
            <label style={{ display:"block", fontSize:12, color:G.txM, marginBottom:5 }}>설명</label>
            <textarea value={f.description} onChange={e=>s("description",e.target.value)} placeholder="어떤 파티인지 설명" rows={3} style={{...inp,resize:"vertical"}}/>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:22 }}>
          <NeonBtn onClick={onClose} color={G.txM} style={{flex:1}}>취소</NeonBtn>
          <button onClick={submit} disabled={saving} style={{
            flex:1, padding:"11px 0", borderRadius:10, cursor:"pointer", fontSize:14,
            background:G.accG, border:"none", color:"#fff", fontWeight:600,
            opacity:saving?.6:1, boxShadow:glow(G.neonPink,10),
          }}>{saving?"저장 중...":isEdit?"수정 완료":"파티 만들기"}</button>
        </div>
      </div>
    </div>
  );
}


function PlayPage({ parties, setParties, user, members, isAdmin, onSave, onDel, onUpd }) {
  const today = new Date();
  const [vd, setVd] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selDay, setSelDay] = useState(today.getDate());
  const [showModal, setShowModal] = useState(false);
  const [editParty, setEditParty] = useState(null);
  const [myOnly, setMyOnly] = useState(false);

  const yr=vd.getFullYear(), mo=vd.getMonth();
  const dim=new Date(yr,mo+1,0).getDate();
  const fdow=(new Date(yr,mo,1).getDay()+6)%7;
  const pmd=new Date(yr,mo,0).getDate();
  const dn=["월","화","수","목","금","토","일"];
  const cells=[];
  for(let i=fdow-1;i>=0;i--)cells.push({day:pmd-i,cur:false});
  for(let d=1;d<=dim;d++)cells.push({day:d,cur:true});
  while(cells.length<42)cells.push({day:cells.length-fdow-dim+1,cur:false});

  const dk=d=>`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const selKey=dk(selDay);

  const filterP=ps=>{if(myOnly&&user)return ps.filter(p=>p.participants?.includes(user.id));return ps;};

  // 시간순 정렬 + 종료된 파티 하단
  const sortParties = (ps) => {
    const now = new Date();
    return [...ps].sort((a,b) => {
      const aEnded = a.status === "ended";
      const bEnded = b.status === "ended";
      if (aEnded !== bEnded) return aEnded ? 1 : -1;
      // 시간 이미 지난 파티도 하단
      const aTime = new Date(a.date + "T" + (a.time || "23:59"));
      const bTime = new Date(b.date + "T" + (b.time || "23:59"));
      const aPast = aTime < now && !aEnded;
      const bPast = bTime < now && !bEnded;
      if (aPast !== bPast) return aPast ? 1 : -1;
      return aTime - bTime;
    });
  };

  const dayP = sortParties(filterP(parties.filter(p=>p.date===selKey)));
  const countOn=ds=>filterP(parties.filter(p=>p.date===ds)).length;

  const canManage = (p) => user && (p.hostId === user.id || isAdmin);

  const toggleJoin=async(pid)=>{
    if(!user){alert("로그인이 필요합니다!");return;}
    const p=parties.find(x=>x.id===pid);if(!p||p.status==="ended")return;
    const parts=p.participants||[];
    const joined=parts.includes(user.id);
    let next;
    if(joined){next=parts.filter(id=>id!==user.id);}
    else{if(parts.length>=p.maxPlayers)return;next=[...parts,user.id];}
    setParties(prev=>prev.map(x=>x.id===pid?{...x,participants:next}:x));
    try{await onUpd(pid,{participants:next});}catch{}
  };

  const endParty=async(pid)=>{
    if(!window.confirm("이 파티를 종료(마감)할까요?"))return;
    setParties(prev=>prev.map(p=>p.id===pid?{...p,status:"ended"}:p));
    try{await onUpd(pid,{status:"ended"});}catch{}
  };

  const delParty=async(pid)=>{
    if(!window.confirm("이 파티를 삭제할까요? 되돌릴 수 없습니다."))return;
    setParties(prev=>prev.filter(p=>p.id!==pid));
    try{await onDel(pid);}catch{}
  };

  const editSubmit=async(form)=>{
    setParties(prev=>prev.map(p=>p.id===editParty.id?{...p,...form}:p));
    try{await onUpd(editParty.id,form);}catch{}
    setEditParty(null);
  };

  const createSubmit=async(form)=>{
    const d={...form,hostId:user.id,hostName:user.nickname,hostAvatar:user.avatar||null,participants:[user.id],status:"open",createdAt:new Date().toISOString()};
    const id=await onSave(d);
    setParties(prev=>[...prev,{...d,id}]);
    setShowModal(false);
  };

  const getName=pid=>{if(user&&pid===user.id)return user.nickname;const m=members.find(x=>x.id===pid);return m?.nickname||"???";};
  const getAv=pid=>{if(user&&pid===user.id)return user.avatar;const m=members.find(x=>x.id===pid);return m?.avatar;};

  const isEnded=(p)=>p.status==="ended";
  const isPast=(p)=>!isEnded(p)&&new Date(p.date+"T"+(p.time||"23:59"))<new Date();

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px" }}>
      {/* Top */}
      <div style={{ background:G.card, borderRadius:16, padding:"20px 24px", border:`1px solid ${G.bdr}`, marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:G.tx, marginBottom:4 }}>
            <span style={{ color:G.neonPink, ...neonText(G.neonPink) }}>⚡</span> 파티 모집
          </h2>
          <p style={{ color:G.txM, fontSize:13 }}>파티를 만들거나 참여하세요!</p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <label style={{ display:"flex", alignItems:"center", gap:5, color:G.txM, fontSize:12, cursor:"pointer" }}>
            <input type="checkbox" checked={myOnly} onChange={e=>setMyOnly(e.target.checked)} style={{accentColor:G.acc}}/>
            내 참여만
          </label>
          <button onClick={()=>setShowModal(true)} style={{
            background:G.accG, color:"#fff", border:"none", padding:"9px 20px",
            borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:600,
            boxShadow:glow(G.neonPink,8),
          }}>+ 새 파티</button>
        </div>
      </div>

      {/* Calendar */}
      <div style={{ background:G.card, borderRadius:16, padding:22, border:`1px solid ${G.bdr}`, marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <button onClick={()=>setVd(new Date(yr,mo-1,1))} style={{background:"none",border:"none",color:G.neonBlue,fontSize:22,cursor:"pointer",padding:"4px 12px",...neonText(G.neonBlue)}}>‹</button>
          <h3 style={{ fontSize:16, fontWeight:600, color:G.tx }}>{yr}년 {mo+1}월</h3>
          <button onClick={()=>setVd(new Date(yr,mo+1,1))} style={{background:"none",border:"none",color:G.neonBlue,fontSize:22,cursor:"pointer",padding:"4px 12px",...neonText(G.neonBlue)}}>›</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
          {dn.map((d,i)=><div key={d} style={{textAlign:"center",fontSize:12,fontWeight:600,padding:"5px 0",color:i===6?G.red:i===5?G.neonBlue:G.txM}}>{d}</div>)}
          {cells.map((c,idx)=>{
            const key=dk(c.day), pCnt=c.cur?countOn(key):0;
            const isSel=c.cur&&c.day===selDay;
            const isToday=c.cur&&c.day===today.getDate()&&mo===today.getMonth()&&yr===today.getFullYear();
            const col=idx%7;
            return (
              <div key={idx} onClick={()=>c.cur&&setSelDay(c.day)} style={{
                padding:"9px 2px", textAlign:"center", cursor:c.cur?"pointer":"default",
                borderRadius:10, background:isSel?`${G.neonPurple}30`:isToday?`${G.neonBlue}15`:"transparent",
                border:isSel?`1px solid ${G.neonPurple}50`:"1px solid transparent",
                transition:"all .12s",
              }}>
                <span style={{ fontSize:14, fontWeight:isSel||isToday?600:400,
                  color:!c.cur?G.txD:isSel?G.neonPurple:col===6?G.red:col===5?G.neonBlue:G.tx,
                }}>{c.day}</span>
                {pCnt>0&&<div style={{display:"flex",gap:2,justifyContent:"center",marginTop:3}}>
                  {Array.from({length:Math.min(pCnt,4)}).map((_,i)=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:isSel?G.neonPurple:G.neonBlue,boxShadow:glow(G.neonBlue,4)}}/>)}
                </div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Party List */}
      <div style={{ background:G.card, borderRadius:16, padding:22, border:`1px solid ${G.bdr}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <h3 style={{ fontSize:15, fontWeight:600, color:G.tx }}>{mo+1}월 {selDay}일 파티</h3>
          <span style={{ fontSize:12, color:G.txM }}>{dayP.length}개</span>
        </div>

        {dayP.length===0&&<div style={{padding:"32px 0",textAlign:"center"}}>
          <p style={{color:G.txM,fontSize:14,marginBottom:12}}>파티가 없습니다</p>
          <NeonBtn onClick={()=>setShowModal(true)} color={G.neonPurple}>+ 파티 만들기</NeonBtn>
        </div>}

        {dayP.map(p=>{
          const parts=p.participants||[];
          const isHost=user?.id===p.hostId;
          const isJoined=user&&parts.includes(user.id);
          const isFull=parts.length>=p.maxPlayers;
          const ended=isEnded(p);
          const past=isPast(p);
          const dim=ended||past;

          return (
            <div key={p.id} style={{
              background:dim?`${G.bg2}80`:G.bg2, borderRadius:14, padding:"18px 22px", marginBottom:10,
              border:`1px solid ${ended?G.txD+"30":G.bdr}`,
              opacity:dim?.6:1, transition:"all .15s",
            }}>
              {/* Header Row */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginBottom:10 }}>
                <div style={{flex:1}}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5, flexWrap:"wrap" }}>
                    <span style={{ fontSize:16, fontWeight:700, color:ended?G.txM:G.tx }}>{p.game}</span>
                    <span style={{ fontSize:12, color:G.txM, background:G.bdr, padding:"2px 10px", borderRadius:5 }}>{p.time}</span>
                    {ended && <span style={{ fontSize:11, color:G.txD, background:`${G.txD}20`, padding:"2px 8px", borderRadius:5 }}>종료됨</span>}
                    {past && !ended && <span style={{ fontSize:11, color:G.gold, background:`${G.gold}15`, padding:"2px 8px", borderRadius:5 }}>시간 지남</span>}
                  </div>
                  {p.description&&<p style={{fontSize:13,color:G.txM,marginBottom:6,lineHeight:1.5}}>{p.description}</p>}
                  <div style={{fontSize:12,color:G.txM}}>
                    주최 <span style={{color:G.tx,fontWeight:500}}>{p.hostName}</span>{" · "}
                    <span style={{color:isFull?G.red:G.green,fontWeight:600,...neonText(isFull?G.red:G.green)}}>{parts.length}/{p.maxPlayers}명</span>
                  </div>
                </div>
                {!ended && (
                  <div style={{display:"flex",gap:5,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
                    {canManage(p)&&<>
                      <NeonBtn onClick={()=>setEditParty(p)} color={G.neonBlue} small>수정</NeonBtn>
                      <NeonBtn onClick={()=>endParty(p.id)} color={G.gold} small>종료</NeonBtn>
                      <NeonBtn onClick={()=>delParty(p.id)} color={G.red} small>삭제</NeonBtn>
                    </>}
                    <NeonBtn onClick={()=>toggleJoin(p.id)} disabled={isFull&&!isJoined}
                      color={isJoined?G.red:isFull?G.txD:G.neonGreen} small>
                      {isJoined?"참가 취소":isFull?"마감":"참가하기"}
                    </NeonBtn>
                  </div>
                )}
              </div>

              {/* Participants */}
              <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                {parts.map(pid=>(
                  <div key={pid} style={{
                    display:"flex",alignItems:"center",gap:4,
                    background:pid===p.hostId?`${G.gold}12`:`${G.neonPurple}10`,
                    border:`1px solid ${pid===p.hostId?`${G.gold}25`:`${G.neonPurple}20`}`,
                    padding:"3px 10px 3px 3px", borderRadius:20,
                  }}>
                    <Av name={getName(pid)} src={getAv(pid)} size={20}/>
                    <span style={{fontSize:11,color:G.tx,fontWeight:500}}>{getName(pid)}</span>
                    {pid===p.hostId&&<span style={{fontSize:8}}>👑</span>}
                  </div>
                ))}
                {!isFull&&!ended&&<span style={{fontSize:11,color:G.txD,padding:"3px 8px",border:`1px dashed ${G.bdr}`,borderRadius:16}}>+{p.maxPlayers-parts.length}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {showModal&&<PartyModal onClose={()=>setShowModal(false)} onSubmit={createSubmit}/>}
      {editParty&&<PartyModal onClose={()=>setEditParty(null)} onSubmit={editSubmit} initial={editParty} isEdit/>}
    </div>
  );
}

// ─── MEMBERS PAGE ───────────────────────────────────────────
function MembersPage({ members }) {
  const [q,setQ]=useState("");
  const list=members.filter(m=>(m.nickname||"").toLowerCase().includes(q.toLowerCase())||(m.discordName||"").toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px" }}>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20}}>
        <div style={{flex:1,display:"flex",alignItems:"center",background:G.card,border:`1px solid ${G.bdr}`,borderRadius:10,padding:"0 14px"}}>
          <span style={{color:G.txM,marginRight:8}}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="닉네임으로 검색" style={{flex:1,background:"none",border:"none",color:G.tx,padding:"10px 0",fontSize:13,outline:"none"}}/>
        </div>
        <span style={{color:G.txM,fontSize:12}}>총 {list.length}명</span>
      </div>
      {list.length===0&&<p style={{color:G.txM,textAlign:"center",padding:"40px 0"}}>멤버가 없습니다</p>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {list.map(m=>(
          <div key={m.id} style={{background:G.card,borderRadius:14,padding:"16px 18px",border:`1px solid ${G.bdr}`,display:"flex",alignItems:"center",gap:14,transition:"border-color .15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=G.bdrH}
            onMouseLeave={e=>e.currentTarget.style.borderColor=G.bdr}>
            <Av name={m.nickname} src={m.avatar} size={46}/>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:G.tx,marginBottom:2}}>{m.nickname}</div>
              <div style={{color:G.txM,fontSize:12}}>{m.discordName||""}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function AdminPage({ parties, setParties, members, setMembers, onUpd, onDel }) {
  const [tab,setTab]=useState("parties");

  const endP=async id=>{setParties(p=>p.map(x=>x.id===id?{...x,status:"ended"}:x));try{await onUpd(id,{status:"ended"});}catch{}};
  const delP=async id=>{if(!confirm("삭제?"))return;setParties(p=>p.filter(x=>x.id!==id));try{await onDel(id);}catch{}};
  const delM=async id=>{if(!confirm("이 멤버를 삭제할까요?"))return;setMembers(p=>p.filter(x=>x.id!==id));try{await fbDel("members",id);}catch{}};

  return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:"24px"}}>
      <h2 style={{fontSize:20,fontWeight:700,color:G.tx,marginBottom:20}}>🛡️ 관리자 패널</h2>
      <div style={{display:"flex",gap:6,marginBottom:20}}>
        {["parties","members"].map(t=>(
          <NeonBtn key={t} onClick={()=>setTab(t)} color={tab===t?G.neonPurple:G.txM}>{t==="parties"?"파티 관리":"회원 관리"}</NeonBtn>
        ))}
      </div>

      {tab==="parties"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {parties.length===0&&<p style={{color:G.txM,textAlign:"center",padding:20}}>파티 없음</p>}
          {parties.map(p=>(
            <div key={p.id} style={{background:G.card,borderRadius:12,padding:"14px 18px",border:`1px solid ${G.bdr}`,display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1}}>
                <span style={{color:G.tx,fontWeight:600,fontSize:14}}>{p.game}</span>
                <span style={{color:G.txM,fontSize:12,marginLeft:8}}>{p.date} {p.time}</span>
                <span style={{color:G.txM,fontSize:12,marginLeft:8}}>by {p.hostName}</span>
                {p.status==="ended"&&<span style={{color:G.txD,fontSize:11,marginLeft:8}}>[종료됨]</span>}
              </div>
              {p.status!=="ended"&&<NeonBtn onClick={()=>endP(p.id)} color={G.gold} small>종료</NeonBtn>}
              <NeonBtn onClick={()=>delP(p.id)} color={G.red} small>삭제</NeonBtn>
            </div>
          ))}
        </div>
      )}

      {tab==="members"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {members.map(m=>(
            <div key={m.id} style={{background:G.card,borderRadius:12,padding:"14px 18px",border:`1px solid ${G.bdr}`,display:"flex",alignItems:"center",gap:12}}>
              <Av name={m.nickname} src={m.avatar} size={36}/>
              <div style={{flex:1}}>
                <span style={{color:G.tx,fontWeight:600,fontSize:14}}>{m.nickname}</span>
                <span style={{color:G.txM,fontSize:12,marginLeft:8}}>@{m.discordName}</span>
              </div>
              <NeonBtn onClick={()=>delM(m.id)} color={G.red} small>삭제</NeonBtn>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default function App() {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [parties, setParties] = useState([]);
  const [page, setPage] = useState("home");
  const [error, setError] = useState(null);
  const [showNickModal, setShowNickModal] = useState(false);
  const authDone = useRef(false);

  const isAdmin = user && CONFIG.discord.adminIds.includes(user.id);


  useEffect(()=>{
    try{const s=localStorage.getItem("dz_user");if(s)setUser(JSON.parse(s));}catch{}
  },[]);


  const loadData = useCallback(async()=>{
    await initFB();
    try{const[m,p]=await Promise.all([fbAll("members"),fbAll("parties")]);setMembers(m);setParties(p);}catch(e){console.error(e);}
  },[]);
  useEffect(()=>{loadData();},[loadData]);

  useEffect(()=>{
    if(authDone.current)return;
    const tok=grabToken();
    if(!tok)return;
    authDone.current=true;
    (async()=>{
      try{
        const du=await dcApi("/users/@me",tok);
        const guilds=await dcApi("/users/@me/guilds",tok);
        if(!guilds.some(g=>g.id===CONFIG.discord.guildId)){
          setError("디스코드 서버 멤버만 이용할 수 있습니다!");return;
        }
        const av=du.avatar?`https://cdn.discordapp.com/avatars/${du.id}/${du.avatar}.png?size=128`:null;
        const ud={id:du.id,nickname:du.global_name||du.username,discordName:du.username,avatar:av,joinedAt:new Date().toISOString(),gamesPlayed:0};
        await initFB();

        try {
          const existing = members.find(m => m.id === du.id);
          if (existing?.nickname) ud.nickname = existing.nickname;
        } catch {}
        await fbSet("members",du.id,ud);
        setUser(ud);
        localStorage.setItem("dz_user",JSON.stringify(ud));
        await loadData();
      }catch(e){console.error(e);setError("로그인 오류: "+e.message);}
    })();
  },[loadData,members]);

  const handleLogin=()=>{window.location.href=getAuthUrl();};
  const handleLogout=()=>{setUser(null);localStorage.removeItem("dz_user");};

  const saveNick=async(nick)=>{
    const updated={...user,nickname:nick};
    setUser(updated);
    localStorage.setItem("dz_user",JSON.stringify(updated));
    await initFB();
    await fbSet("members",user.id,{nickname:nick});
    setMembers(prev=>prev.map(m=>m.id===user.id?{...m,nickname:nick}:m));
    setShowNickModal(false);
  };

  const onSave=async d=>{try{return await fbAdd("parties",d);}catch{return"l_"+Date.now();}};
  const onDel=async id=>{try{await fbDel("parties",id);}catch{}};
  const onUpd=async(id,d)=>{try{await fbUpd("parties",id,d);}catch{}};


  if (!user) {
    return (
      <>
        {error && (
          <div style={{position:"fixed",top:0,left:0,right:0,background:`${G.red}20`,borderBottom:`1px solid ${G.red}30`,padding:"12px 24px",textAlign:"center",zIndex:9999}}>
            <span style={{fontSize:13,color:G.red}}>{error}</span>
            <button onClick={()=>setError(null)} style={{marginLeft:12,background:"none",border:"none",color:G.red,cursor:"pointer",fontSize:13,textDecoration:"underline"}}>닫기</button>
          </div>
        )}
        <LoginScreen onLogin={handleLogin}/>
      </>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:G.bg, color:G.tx, fontFamily:"'Pretendard Variable','Pretendard',-apple-system,'Noto Sans KR',sans-serif" }}>
      <Header page={page} setPage={setPage} user={user} onLogout={handleLogout} onEditNick={()=>setShowNickModal(true)} isAdmin={isAdmin}/>

      {error&&<div style={{background:`${G.red}12`,borderBottom:`1px solid ${G.red}25`,padding:"10px 24px",textAlign:"center"}}>
        <span style={{fontSize:13,color:G.red}}>{error}</span>
        <button onClick={()=>setError(null)} style={{marginLeft:12,background:"none",border:"none",color:G.red,cursor:"pointer",fontSize:13,textDecoration:"underline"}}>닫기</button>
      </div>}

      {page==="home"&&<HomePage parties={parties} members={members} setPage={setPage}/>}
      {page==="play"&&<PlayPage parties={parties} setParties={setParties} user={user} members={members} isAdmin={isAdmin} onSave={onSave} onDel={onDel} onUpd={onUpd}/>}
      {page==="members"&&<MembersPage members={members}/>}
      {page==="admin"&&isAdmin&&<AdminPage parties={parties} setParties={setParties} members={members} setMembers={setMembers} onUpd={onUpd} onDel={onDel}/>}

      {showNickModal&&<NicknameModal current={user.nickname} onSave={saveNick} onClose={()=>setShowNickModal(false)}/>}
    </div>
  );
}
