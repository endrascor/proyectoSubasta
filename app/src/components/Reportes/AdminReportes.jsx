import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Pusher from "pusher-js";
import {
  Activity, BarChart2, Clock3, Gavel, Search,
  ShoppingCart, Users, Wallet, BadgeDollarSign,
  TrendingUp, Award, X, Mail,
} from "lucide-react";

import UsuarioService     from "../../services/UsuarioService";
import SubastaService     from "../../services/SubastaService";
import PujaService        from "../../services/PujaService";
import FacturacionService from "../../services/FacturacionService";

const PUSHER_KEY     = import.meta.env.VITE_PUSHER_KEY     || "28284af3704b6e0c7492";
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || "us2";

/* ─── UTILS ─── */
const arr = (v) => (Array.isArray(v) ? v : []);

function getAR(res) {
  const d = res?.data ?? res;
  if (Array.isArray(d))          return d;
  if (Array.isArray(d?.data))    return d.data;
  if (Array.isArray(d?.result))  return d.result;
  if (Array.isArray(d?.results)) return d.results;
  return [];
}

function pd(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
}

const fmtMoney = (v) =>
  new Intl.NumberFormat("es-CR", { style:"currency", currency:"CRC", maximumFractionDigits:0 }).format(Number(v||0));

const fmtCmp = (v) =>
  new Intl.NumberFormat("es-ES", { notation:"compact", maximumFractionDigits:1 }).format(Number(v||0));

const fmtDate = (v) => { const d = pd(v); return d ? d.toLocaleString("es-CR") : "—"; };

const fmtTime  = (d) => d.toLocaleTimeString("es-CR",  { hour:"2-digit", minute:"2-digit", second:"2-digit" });
const fmtShort = (d) => d.toLocaleDateString("es-CR",  { weekday:"short", day:"numeric", month:"short", year:"numeric" });

function getRol(u) {
  const r = u?.rol;
  if (!r) return "—";
  return r?.nombre || r?.descripcion || r?.detalle || `Rol ${r?.idRol ?? ""}`.trim();
}

const pujaUser    = (p) => p?.usuario?.nombre || "Usuario";
const facturaUser = (f) => f?.usuario?.nombre || "Usuario";

function maxD(...vals) {
  const ds = vals.map(pd).filter(Boolean);
  if (!ds.length) return null;
  return new Date(Math.max(...ds.map(d => d.getTime()))).toISOString();
}

/* ─── AVATAR ─── */
const AV_COLORS = [
  ["#818cf8","#4f46e5"],["#22d3ee","#0891b2"],["#f59e0b","#d97706"],
  ["#34d399","#059669"],["#fb7185","#e11d48"],["#a78bfa","#7c3aed"],
  ["#38bdf8","#0284c7"],["#4ade80","#16a34a"],["#fbbf24","#d97706"],
  ["#e879f9","#a21caf"],["#60a5fa","#2563eb"],["#f87171","#dc2626"],
];

function initials(name = "") {
  return name.trim().split(/\s+/).slice(0,2).map(w => w[0]?.toUpperCase()||"").join("");
}

function Avatar({ name, size = 44, ci = 0 }) {
  const [from, to] = AV_COLORS[ci % AV_COLORS.length];
  return (
    <div style={{ width:size, height:size, borderRadius:size*0.28, background:`linear-gradient(135deg,${from},${to})`, display:"grid", placeItems:"center", fontSize:size*0.36, fontWeight:900, color:"#fff", flexShrink:0, letterSpacing:"-0.02em", boxShadow:`0 4px 14px ${from}55` }}>
      {initials(name)||"?"}
    </div>
  );
}

/* ─── ANIMATED NUMBER ─── */
function AnimNum({ value, fmt = fmtCmp, dur = 900 }) {
  const ref  = useRef(null);
  const prev = useRef(0);
  useEffect(() => {
    if (!ref.current) return;
    const from = prev.current, to = Number(value)||0;
    prev.current = to;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now-start)/dur, 1);
      const e = 1-Math.pow(1-p, 3);
      if (ref.current) ref.current.textContent = fmt(from+(to-from)*e);
      if (p < 1) requestAnimationFrame(tick);
      else if (ref.current) ref.current.textContent = fmt(to);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span ref={ref}>{fmt(Number(value)||0)}</span>;
}

/* ─── STAT CARD ─── */
function StatCard({ title, value, subtitle, icon, accent="#6366f1", index=0, fmt }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.opacity = "0";
    ref.current.style.transform = "translateY(22px)";
    const t = setTimeout(() => {
      if (!ref.current) return;
      ref.current.style.transition = `opacity .5s cubic-bezier(.22,1,.36,1) ${index*65}ms,transform .5s cubic-bezier(.22,1,.36,1) ${index*65}ms`;
      ref.current.style.opacity = "1";
      ref.current.style.transform = "translateY(0)";
    }, 60);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => { if(ref.current){ref.current.style.transition="transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease";ref.current.style.transform="translateY(-4px) scale(1.015)";ref.current.style.boxShadow=`0 20px 40px ${accent}30`;}}}
      onMouseLeave={() => { if(ref.current){ref.current.style.transition="transform .2s ease,box-shadow .2s ease";ref.current.style.transform="";ref.current.style.boxShadow=`0 8px 24px ${accent}12`;}}}
      style={{ background:"linear-gradient(145deg,rgba(15,20,35,.98),rgba(8,11,22,.99))", border:`1px solid ${accent}28`, borderRadius:20, padding:"20px 22px", boxShadow:`0 8px 24px ${accent}12`, position:"relative", overflow:"hidden", cursor:"default" }}
    >
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${accent}88,transparent)` }}/>
      <div style={{ position:"absolute", top:-30, right:-30, width:90, height:90, background:`radial-gradient(circle,${accent}18,transparent 70%)`, borderRadius:"50%", pointerEvents:"none" }}/>
      <div style={{ display:"flex", justifyContent:"space-between", gap:14, position:"relative" }}>
        <div>
          <div style={{ color:"rgba(255,255,255,.42)", fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:10 }}>{title}</div>
          <div style={{ fontSize:29, fontWeight:900, color:"#fff", lineHeight:1, letterSpacing:"-0.02em" }}>
            <AnimNum value={value} fmt={fmt||fmtCmp}/>
          </div>
          <div style={{ color:"rgba(255,255,255,.32)", fontSize:12, marginTop:8 }}>{subtitle}</div>
        </div>
        <div style={{ width:46, height:46, borderRadius:14, display:"grid", placeItems:"center", background:`${accent}18`, border:`1px solid ${accent}38`, color:accent, flexShrink:0 }}>{icon}</div>
      </div>
    </div>
  );
}

/* ─── USER PANEL ─── */
function UserPanel({ user, ci, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!panelRef.current) return;
    panelRef.current.style.transform = "translateX(110%)";
    panelRef.current.style.opacity   = "0";
    requestAnimationFrame(() => {
      if (!panelRef.current) return;
      panelRef.current.style.transition = "transform .36s cubic-bezier(.22,1,.36,1),opacity .28s ease";
      panelRef.current.style.transform  = "translateX(0)";
      panelRef.current.style.opacity    = "1";
    });
  }, [user?.id]);

  const close = () => {
    if (!panelRef.current) { onClose(); return; }
    panelRef.current.style.transition = "transform .26s cubic-bezier(.55,0,1,.45),opacity .2s ease";
    panelRef.current.style.transform  = "translateX(110%)";
    panelRef.current.style.opacity    = "0";
    setTimeout(onClose, 260);
  };

  if (!user) return null;
  const [from] = AV_COLORS[ci % AV_COLORS.length];

  const actStats = [
    { l:"Subastas creadas",  v:user.auctionsCreated,  c:"#818cf8" },
    { l:"Activas ahora",     v:user.auctionsActive,   c:"#34d399" },
    { l:"Finalizadas",       v:user.auctionsFinished, c:"#22d3ee" },
    { l:"Pujas realizadas",  v:user.bidsCount,        c:"#f59e0b" },
    { l:"Ventas",            v:user.salesCount,       c:"#a78bfa" },
    { l:"Compras",           v:user.purchasesCount,   c:"#fb7185" },
  ];

  return (
    <>
      <div onClick={close} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:998, backdropFilter:"blur(3px)" }}/>
      <div ref={panelRef} style={{ position:"fixed", top:0, right:0, bottom:0, width:Math.min(430, window.innerWidth-20), background:"linear-gradient(160deg,rgba(13,17,30,.99),rgba(6,8,17,1))", borderLeft:`1px solid ${from}28`, zIndex:999, overflowY:"auto", boxShadow:`-24px 0 60px rgba(0,0,0,.6),-2px 0 0 ${from}18`, display:"flex", flexDirection:"column" }}>

        <div style={{ height:3, background:`linear-gradient(90deg,${from},transparent)`, flexShrink:0 }}/>

        <div style={{ padding:"22px 24px 36px", flex:1 }}>
          {/* Close btn */}
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:18 }}>
            <button onClick={close} style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", color:"rgba(255,255,255,.65)", cursor:"pointer", display:"grid", placeItems:"center" }}>
              <X size={15}/>
            </button>
          </div>

          {/* Identity */}
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:22 }}>
            <Avatar name={user.name} size={66} ci={ci}/>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:21, fontWeight:900, color:"#fff", letterSpacing:"-0.025em", lineHeight:1.2 }}>{user.name}</div>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:6, color:"rgba(255,255,255,.42)", fontSize:13 }}>
                <Mail size={11}/><span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.email}</span>
              </div>
              <div style={{ marginTop:8 }}>
                <span style={{ padding:"3px 9px", borderRadius:7, background:`${from}18`, border:`1px solid ${from}30`, color:from, fontSize:11, fontWeight:700 }}>{user.role}</span>
              </div>
            </div>
          </div>

          <div style={{ height:1, background:"rgba(255,255,255,.06)", marginBottom:20 }}/>

          {/* Activity grid */}
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:".09em", textTransform:"uppercase", color:"rgba(255,255,255,.32)", marginBottom:12 }}>Actividad</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:20 }}>
            {actStats.map(s => (
              <div key={s.l} style={{ background:`${s.c}0b`, border:`1px solid ${s.c}22`, borderRadius:13, padding:"11px 13px" }}>
                <div style={{ fontSize:9, color:"rgba(255,255,255,.38)", fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", marginBottom:5 }}>{s.l}</div>
                <div style={{ fontSize:28, fontWeight:900, color:s.c, lineHeight:1 }}>{s.v}</div>
              </div>
            ))}
          </div>

          <div style={{ height:1, background:"rgba(255,255,255,.06)", marginBottom:20 }}/>

          {/* Money */}
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:".09em", textTransform:"uppercase", color:"rgba(255,255,255,.32)", marginBottom:12 }}>Movimientos financieros</div>
          <div style={{ display:"grid", gap:9, marginBottom:20 }}>
            <div style={{ background:"rgba(52,211,153,.07)", border:"1px solid rgba(52,211,153,.18)", borderRadius:13, padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:13, color:"rgba(255,255,255,.55)" }}>Total vendido</div>
              <div style={{ fontSize:18, fontWeight:800, color:"#34d399" }}>{fmtMoney(user.totalSold)}</div>
            </div>
            <div style={{ background:"rgba(251,191,36,.07)", border:"1px solid rgba(251,191,36,.18)", borderRadius:13, padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:13, color:"rgba(255,255,255,.55)" }}>Total gastado</div>
              <div style={{ fontSize:18, fontWeight:800, color:"#fbbf24" }}>{fmtMoney(user.totalSpent)}</div>
            </div>
          </div>

          {/* Last activity */}
          <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:13, padding:"12px 16px" }}>
            <div style={{ fontSize:9, color:"rgba(255,255,255,.32)", fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", marginBottom:5 }}>Última actividad</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,.65)" }}>{fmtDate(user.lastActivity)}</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── BAR CHART ─── */
const ACCENTS = ["#818cf8","#22d3ee","#f59e0b","#34d399","#fb7185","#a78bfa","#38bdf8","#4ade80","#fbbf24","#e879f9","#60a5fa","#f87171"];

function BarChart({ data, onSelect }) {
  const svgRef = useRef(null);
  const [hov, setHov] = useState(null);
  const safe = arr(data).filter(d => d.value > 0).slice(0, 12);

  const W=880, H=300, PAD={top:24,right:20,bottom:68,left:48};
  const cW = W-PAD.left-PAD.right, cH = H-PAD.top-PAD.bottom;
  const max = Math.max(...safe.map(d=>d.value), 1);
  const barW = safe.length>0 ? Math.min(56,(cW/safe.length)*0.62) : 40;
  const gap  = safe.length>0 ? cW/safe.length : cW;

  const key = safe.map(d=>d.value).join(",");
  useEffect(() => {
    const bars = svgRef.current?.querySelectorAll(".br");
    if (!bars?.length) return;
    bars.forEach((bar, i) => {
      const tH = parseFloat(bar.getAttribute("data-h"));
      const tY = parseFloat(bar.getAttribute("data-y"));
      bar.setAttribute("height", 0);
      bar.setAttribute("y", tY+tH);
      const t = setTimeout(() => {
        bar.style.transition = `height .6s cubic-bezier(.34,1.2,.64,1) ${i*50}ms,y .6s cubic-bezier(.34,1.2,.64,1) ${i*50}ms`;
        bar.setAttribute("height", tH);
        bar.setAttribute("y", tY);
      }, 100);
      return () => clearTimeout(t);
    });
  }, [key]);

  if (!safe.length) return (
    <div style={{ textAlign:"center", padding:"48px 0", color:"rgba(255,255,255,.32)", fontSize:14 }}>No hay datos de subastas por usuario</div>
  );

  return (
    <div>
      <div style={{ fontSize:11, color:"rgba(255,255,255,.32)", marginBottom:8, textAlign:"right", fontStyle:"italic" }}>
        ← haz clic en una barra para ver el perfil del usuario
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto" }}>
        <defs>
          {safe.map((_,i)=>(
            <linearGradient key={i} id={`bg${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={ACCENTS[i%ACCENTS.length]} stopOpacity="1"/>
              <stop offset="100%" stopColor={ACCENTS[i%ACCENTS.length]} stopOpacity="0.28"/>
            </linearGradient>
          ))}
        </defs>

        {/* Grid */}
        {[0,.25,.5,.75,1].map((r,i)=>{
          const y = PAD.top+cH*(1-r);
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={W-PAD.right} y2={y} stroke="rgba(255,255,255,.05)" strokeDasharray="4 7"/>
              <text x={PAD.left-8} y={y+4} textAnchor="end" fill="rgba(255,255,255,.25)" fontSize="11">{Math.round(max*r)}</text>
            </g>
          );
        })}

        {/* Bars */}
        {safe.map((item, i) => {
          const bH  = Math.max(6,(item.value/max)*cH);
          const bY  = PAD.top+cH-bH;
          const bX  = PAD.left+gap*i+gap/2-barW/2;
          const ac  = ACCENTS[i%ACCENTS.length];
          const isH = hov===i;

          return (
            <g key={i} style={{ cursor:"pointer" }}
              onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
              onClick={()=>onSelect && onSelect(item.userData, i)}>

              {/* Clickable area */}
              <rect x={bX-12} y={PAD.top} width={barW+24} height={cH+PAD.bottom} fill="transparent"/>

              {/* Glow */}
              {isH && <rect x={bX-7} y={bY-7} width={barW+14} height={bH+14} rx="13" fill={ac} opacity=".09"/>}

              {/* Bar */}
              <rect className="br" x={bX} data-y={bY} data-h={bH} width={barW} rx="9"
                fill={`url(#bg${i})`} opacity={isH?1:.75}
                style={{ filter:isH?`drop-shadow(0 0 14px ${ac}99)`:"none", transition:"opacity .15s,filter .15s" }}/>

              {/* Count */}
              <text x={bX+barW/2} y={bY-10} textAnchor="middle"
                fill={isH?ac:"rgba(255,255,255,.62)"} fontSize="13" fontWeight="800"
                style={{ transition:"fill .15s" }}>{item.value}</text>

              {/* Avatar circle */}
              <circle cx={bX+barW/2} cy={PAD.top+cH+22} r="17"
                fill={isH?ac:"rgba(255,255,255,.07)"}
                stroke={ac} strokeWidth={isH?"2":"1"}
                style={{ transition:"fill .15s,stroke-width .15s" }}/>
              <text x={bX+barW/2} y={PAD.top+cH+28} textAnchor="middle"
                fill={isH?"#fff":ac} fontSize="10" fontWeight="900">
                {initials(item.userData?.name||item.label)}
              </text>

              {/* Name */}
              <text x={bX+barW/2} y={PAD.top+cH+56} textAnchor="middle"
                fill={isH?ac:"rgba(255,255,255,.38)"} fontSize="10" fontWeight="600"
                style={{ transition:"fill .15s" }}>
                {(item.userData?.name||item.label).split(" ")[0].slice(0,11)}
              </text>
            </g>
          );
        })}

        {/* Tooltip */}
        {hov!==null && safe[hov] && (()=>{
          const item = safe[hov];
          const bX = PAD.left+gap*hov+gap/2;
          const bH = Math.max(6,(item.value/max)*cH);
          const bY = PAD.top+cH-bH;
          const tx = Math.min(Math.max(bX,115), W-120);
          const ty = Math.max(bY-62, PAD.top+2);
          const ac = ACCENTS[hov%ACCENTS.length];
          return (
            <g style={{ pointerEvents:"none" }}>
              <rect x={tx-112} y={ty-4} width={224} height={54} rx="13" fill="rgba(8,10,20,.97)" stroke={ac+"44"} strokeWidth="1"/>
              <text x={tx} y={ty+14} textAnchor="middle" fill="rgba(255,255,255,.45)" fontSize="11">{item.userData?.name||item.label}</text>
              <text x={tx} y={ty+34} textAnchor="middle" fill={ac} fontSize="15" fontWeight="900">
                {item.value} subasta{item.value!==1?"s":""}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

/* ─── EVENT BADGE ─── */
const EV = { puja:{c:"#f59e0b",l:"PUJA"}, pago:{c:"#34d399",l:"PAGO"}, venta:{c:"#818cf8",l:"FACTURA"}, subasta:{c:"#22d3ee",l:"SUBASTA"} };
function EvBadge({ type }) {
  const cfg = EV[type]||{c:"#64748b",l:(type||"").toUpperCase()};
  return <span style={{ fontSize:9, fontWeight:800, letterSpacing:".08em", padding:"3px 7px", borderRadius:6, background:cfg.c+"20", border:`1px solid ${cfg.c}40`, color:cfg.c }}>{cfg.l}</span>;
}

/* ─── LIVE CLOCK ─── */
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(()=>setNow(new Date()), 1000);
    return ()=>clearInterval(id);
  }, []);
  return (
    <div style={{ textAlign:"right" }}>
      <div style={{ fontSize:23, fontWeight:900, color:"#fff", letterSpacing:"-0.03em", lineHeight:1, fontVariantNumeric:"tabular-nums" }}>{fmtTime(now)}</div>
      <div style={{ fontSize:11, color:"rgba(255,255,255,.38)", fontWeight:600, marginTop:2 }}>{fmtShort(now)}</div>
    </div>
  );
}

/* ─── MAIN ─── */
export default function AdminReportes() {
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [search,    setSearch]    = useState("");
  const [activeIds, setActiveIds] = useState([]);
  const [sortF,     setSortF]     = useState("auctionsCreated");
  const [sortD,     setSortD]     = useState("desc");
  const [selUser,   setSelUser]   = useState(null);
  const [selCI,     setSelCI]     = useState(0);

  const [dash, setDash] = useState({
    summary:{ totalUsers:0,totalBids:0,totalSales:0,totalRevenue:0,activeAuctions:0,finishedAuctions:0,pendingPayments:0,confirmedPayments:0 },
    chartBarSubastas:[],
    users:[],
    liveEvents:[],
  });

  const pusherRef  = useRef(null);
  const userMapRef = useRef(new Map());   // keep latest map for panel refresh

  const loadDashboard = useCallback(async () => {
    try {
      setError("");
      const [uR,aR,fR,facR] = await Promise.all([
        UsuarioService.getUsuarios(),
        SubastaService.allSubastasActivas(),
        SubastaService.allSubastasFinalizadas(),
        FacturacionService.getAll(),
      ]);

      const usuarios        = getAR(uR);
      const activeAuctions  = getAR(aR);
      const finishedAuctions= getAR(fR);
      const invoices        = getAR(facR);
      const allAuctions     = [...activeAuctions,...finishedAuctions];

      setActiveIds(activeAuctions.map(s=>s.idSubasta));

      const pujasBySubasta = await Promise.all(
        allAuctions.map(s => PujaService.getPujasbySubasta(s.idSubasta).then(r=>getAR(r)).catch(()=>[]))
      );
      const allBids = allAuctions.flatMap((s,i)=>arr(pujasBySubasta[i]).map(p=>({...p,idSubasta:s.idSubasta,subasta:s})));

      /* Build userMap */
      const um = new Map();
      usuarios.forEach(u => {
        um.set(Number(u.idUsuario),{
          id:Number(u.idUsuario), name:u?.nombre||"Sin nombre", email:u?.email||"Sin correo", role:getRol(u),
          bidsCount:0, salesCount:0, purchasesCount:0, totalSold:0, totalSpent:0,
          auctionsCreated:0, auctionsActive:0, auctionsFinished:0,
          lastActivity:u?.fechaRegistro||null,
        });
      });

      allAuctions.forEach(s=>{
        const u=um.get(Number(s?.idUsuario));
        if(!u) return;
        u.auctionsCreated+=1;
        if(Number(s?.idEstadoSubasta)===1) u.auctionsActive+=1; else u.auctionsFinished+=1;
        u.lastActivity=maxD(u.lastActivity,s?.fechaInicio,s?.fechaCierre);
      });
      allBids.forEach(p=>{
        const u=um.get(Number(p?.idUsuario));
        if(!u) return;
        u.bidsCount+=1; u.lastActivity=maxD(u.lastActivity,p?.fechaPuja);
      });
      invoices.forEach(f=>{
        const m=Number(f?.monto||0);
        const buyer=um.get(Number(f?.idUsuario)), seller=um.get(Number(f?.subasta?.idUsuario));
        if(buyer){buyer.purchasesCount+=1;buyer.totalSpent+=m;buyer.lastActivity=maxD(buyer.lastActivity,f?.fechaFactura);}
        if(seller){seller.salesCount+=1;seller.totalSold+=m;seller.lastActivity=maxD(seller.lastActivity,f?.fechaFactura);}
      });

      userMapRef.current = um;

      const usersBreakdown = Array.from(um.values())
        .sort((a,b)=>b.auctionsCreated-a.auctionsCreated||b.bidsCount-a.bidsCount);

      const chartBarSubastas = usersBreakdown
        .filter(u=>u.auctionsCreated>0)
        .slice(0,12)
        .map(u=>({ label:u.name.split(" ")[0], fullName:u.name, value:u.auctionsCreated, userData:u }));

      const liveEvents = [
        ...allBids.map(p=>({id:`puja-${p.idPuja}`,type:"puja",title:"Nueva puja",user:pujaUser(p),amount:Number(p?.montoOfertado||0),createdAt:p?.fechaPuja})),
        ...invoices.map(f=>({id:`fac-${f.idFacturacion}`,type:Number(f?.idEstadoFacturacion)===2?"pago":"venta",title:Number(f?.idEstadoFacturacion)===2?"Pago confirmado":"Factura pendiente",user:facturaUser(f),amount:Number(f?.monto||0),createdAt:f?.fechaFactura})),
        ...allAuctions.map(s=>({id:`sub-${s.idSubasta}`,type:"subasta",title:Number(s?.idEstadoSubasta)===1?"Subasta activa":"Subasta finalizada",user:s?.creador?.nombre||"Vendedor",amount:Number(s?.precio||0),createdAt:s?.fechaCierre||s?.fechaInicio})),
      ].filter(e=>e.createdAt).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,14);

      const summary={
        totalUsers:usuarios.length, totalBids:allBids.length, totalSales:invoices.length,
        totalRevenue:invoices.reduce((a,f)=>a+Number(f?.monto||0),0),
        activeAuctions:activeAuctions.length, finishedAuctions:finishedAuctions.length,
        pendingPayments:invoices.filter(f=>Number(f?.idEstadoFacturacion)===1).length,
        confirmedPayments:invoices.filter(f=>Number(f?.idEstadoFacturacion)===2).length,
      };

      setDash({ summary, chartBarSubastas, users:usersBreakdown, liveEvents });

      // Refresh open panel data silently
      setSelUser(prev => (prev ? um.get(prev.id)||prev : null));

    } catch(err) {
      console.error(err);
      setError("No se pudo cargar el reporte admin");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(()=>{loadDashboard();},[loadDashboard]);

  /* Pusher — pagos */
  useEffect(()=>{
    const pusher = new Pusher(PUSHER_KEY,{cluster:PUSHER_CLUSTER,forceTLS:true});
    pusherRef.current = pusher;
    const ch = pusher.subscribe("pagos");
    const ref = ()=>loadDashboard();
    ch.bind("nuevo-pago",ref); ch.bind("pago-confirmado",ref);
    return ()=>{ ch.unbind("nuevo-pago",ref); ch.unbind("pago-confirmado",ref); pusher.unsubscribe("pagos"); pusher.disconnect(); };
  },[loadDashboard]);

  /* Pusher — subastas activas */
  useEffect(()=>{
    if(!pusherRef.current||!activeIds.length) return;
    const ref = ()=>loadDashboard();
    const subs = activeIds.map(id=>{
      const ch = pusherRef.current.subscribe(`subasta-${id}`);
      ch.bind("nueva-puja",ref); ch.bind("subasta-cerrada",ref);
      return {id,ch};
    });
    return ()=>subs.forEach(({id,ch})=>{ch.unbind("nueva-puja",ref);ch.unbind("subasta-cerrada",ref);pusherRef.current?.unsubscribe(`subasta-${id}`);});
  },[activeIds,loadDashboard]);

  const handleSort = (f)=>{ if(f===sortF) setSortD(d=>d==="desc"?"asc":"desc"); else{setSortF(f);setSortD("desc");} };

  const filteredUsers = useMemo(()=>{
    const term = search.trim().toLowerCase();
    let list = term ? dash.users.filter(u=>`${u.name} ${u.email} ${u.role}`.toLowerCase().includes(term)) : [...dash.users];
    list.sort((a,b)=>{ const va=a[sortF]??0,vb=b[sortF]??0; return sortD==="desc"?vb-va:va-vb; });
    return list;
  },[dash.users,search,sortF,sortD]);

  const topBid  = useMemo(()=>[...dash.users].sort((a,b)=>b.bidsCount-a.bidsCount)[0],[dash.users]);
  const topSell = useMemo(()=>[...dash.users].sort((a,b)=>b.totalSold-a.totalSold)[0],[dash.users]);
  const topAuct = useMemo(()=>[...dash.users].sort((a,b)=>b.auctionsCreated-a.auctionsCreated)[0],[dash.users]);

  const COLS=[
    {k:"name",            l:"Usuario",          s:false},
    {k:"role",            l:"Rol",              s:false},
    {k:"auctionsCreated", l:"Subastas",         s:true},
    {k:"bidsCount",       l:"Pujas",            s:true},
    {k:"salesCount",      l:"Ventas",           s:true},
    {k:"purchasesCount",  l:"Compras",          s:true},
    {k:"totalSold",       l:"Total vendido",    s:true},
    {k:"totalSpent",      l:"Total gastado",    s:true},
    {k:"lastActivity",    l:"Última actividad", s:false},
  ];
  const SA=({field})=>sortF!==field?<span style={{opacity:.18,marginLeft:4}}>↕</span>:<span style={{color:"#818cf8",marginLeft:4}}>{sortD==="desc"?"↓":"↑"}</span>;

  /* ── RENDER ── */
  return (
    <div style={{ minHeight:"100vh", padding:"110px 24px 60px", background:"radial-gradient(ellipse 80% 50% at top left,rgba(79,70,229,.18),transparent 55%),radial-gradient(ellipse 60% 40% at top right,rgba(245,158,11,.12),transparent 55%),radial-gradient(ellipse 50% 60% at bottom center,rgba(34,211,238,.06),transparent 60%),linear-gradient(180deg,#050816,#080c18)", color:"#fff", fontFamily:"'Inter',system-ui,sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .ag{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:18px}
        .s12{grid-column:span 12}.s8{grid-column:span 8}.s4{grid-column:span 4}.s3{grid-column:span 3}
        @media(max-width:1100px){.s8,.s4,.s3{grid-column:span 12}}
        .glass{background:linear-gradient(145deg,rgba(15,20,35,.97),rgba(8,11,22,.99));border:1px solid rgba(255,255,255,.07);border-radius:22px;padding:22px 24px}
        .tbl{width:100%;border-collapse:collapse}
        .tbl th,.tbl td{padding:13px 12px;border-bottom:1px solid rgba(255,255,255,.05);text-align:left;font-size:13px}
        .tbl th{color:rgba(255,255,255,.35);font-weight:700;font-size:11px;letter-spacing:.07em;text-transform:uppercase}
        .tbl td{color:rgba(255,255,255,.82)}
        .tbl tbody tr{cursor:pointer}.tbl tbody tr:hover td{background:rgba(255,255,255,.025)}
        .tbl thead tr{background:rgba(255,255,255,.022)}
        .th-s{cursor:pointer;user-select:none}.th-s:hover{color:rgba(255,255,255,.7)}
        .pdot{width:8px;height:8px;border-radius:50%;background:#34d399;animation:pd 2s ease-in-out infinite;flex-shrink:0}
        @keyframes pd{0%,100%{opacity:1;transform:scale(1);box-shadow:0 0 0 0 #34d39944}50%{opacity:.65;transform:scale(1.3);box-shadow:0 0 0 7px #34d39900}}
        .shim{background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 75%);background-size:400% 100%;animation:sh 1.5s infinite;border-radius:14px}
        @keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .rbadge{width:24px;height:24px;border-radius:8px;display:inline-grid;place-items:center;font-size:11px;font-weight:900}
      `}</style>

      <div style={{ maxWidth:1440, margin:"0 auto" }}>

        {/* HEADER */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16, flexWrap:"wrap", marginBottom:32 }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:12, padding:"7px 14px", borderRadius:999, background:"rgba(52,211,153,.1)", border:"1px solid rgba(52,211,153,.22)", color:"#34d399", fontSize:11, fontWeight:800, letterSpacing:".08em" }}>
              <div className="pdot"/>
              DASHBOARD ADMIN · EN VIVO
            </div>
            <h1 style={{ margin:0, fontSize:38, fontWeight:900, letterSpacing:"-0.03em", background:"linear-gradient(135deg,#fff 30%,rgba(255,255,255,.5))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Reportes del Sistema
            </h1>
            <p style={{ margin:"10px 0 0", color:"rgba(255,255,255,.4)", fontSize:14 }}>
              Datos en tiempo real — Pusher activo, sin necesidad de recargar.
            </p>
          </div>

          {/* Live clock — replaces the "Actualizar" button */}
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 20px", borderRadius:18, background:"rgba(255,255,255,.035)", border:"1px solid rgba(255,255,255,.07)" }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:"#34d399", boxShadow:"0 0 10px #34d39988", animation:"pd 2s ease-in-out infinite" }}/>
            <LiveClock/>
          </div>
        </div>

        {error && <div style={{ marginBottom:20, background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.22)", color:"#fca5a5", borderRadius:16, padding:"14px 18px", fontSize:14 }}>{error}</div>}

        {loading ? (
          <div className="ag">
            {[...Array(8)].map((_,i)=><div key={i} className="s3"><div className="shim" style={{height:100}}/></div>)}
            <div className="s8"><div className="shim" style={{height:400}}/></div>
            <div className="s4"><div className="shim" style={{height:400}}/></div>
            <div className="s12"><div className="shim" style={{height:300}}/></div>
          </div>
        ) : (
          <div className="ag">

            {/* STAT CARDS */}
            {[
              {title:"Usuarios",            value:dash.summary.totalUsers,        subtitle:"Total registrados",       icon:<Users size={22}/>,          accent:"#22d3ee"},
              {title:"Pujas",               value:dash.summary.totalBids,         subtitle:"Total del sistema",       icon:<Gavel size={22}/>,          accent:"#f59e0b"},
              {title:"Ventas / Facturas",   value:dash.summary.totalSales,        subtitle:"Total generadas",         icon:<ShoppingCart size={22}/>,   accent:"#34d399"},
              {title:"Monto total",         value:dash.summary.totalRevenue,      subtitle:"Facturación acumulada",   icon:<Wallet size={22}/>,         accent:"#818cf8", fmt:v=>fmtMoney(Math.round(v))},
              {title:"Subastas activas",    value:dash.summary.activeAuctions,    subtitle:"En este momento",         icon:<Activity size={22}/>,       accent:"#fb7185"},
              {title:"Subastas finalizadas",value:dash.summary.finishedAuctions,  subtitle:"Histórico total",         icon:<BarChart2 size={22}/>,      accent:"#a78bfa"},
              {title:"Pagos pendientes",    value:dash.summary.pendingPayments,   subtitle:"Sin confirmar",           icon:<Clock3 size={22}/>,         accent:"#f97316"},
              {title:"Pagos confirmados",   value:dash.summary.confirmedPayments, subtitle:"Confirmados",             icon:<BadgeDollarSign size={22}/>,accent:"#10b981"},
            ].map((c,i)=>(
              <div key={i} className="s3"><StatCard {...c} index={i}/></div>
            ))}

            {/* HIGHLIGHTS — clickable */}
            {[
              {l:"Más pujador",   user:topBid,  val:`${topBid?.bidsCount||0} pujas`,             icon:<Gavel size={14}/>,     ac:"#f59e0b"},
              {l:"Mejor vendedor",user:topSell, val:fmtMoney(topSell?.totalSold||0),             icon:<TrendingUp size={14}/>, ac:"#34d399"},
              {l:"Más subastas",  user:topAuct, val:`${topAuct?.auctionsCreated||0} subastas`,   icon:<Award size={14}/>,      ac:"#818cf8"},
            ].map((h,i)=>(
              <div key={i} className="s4">
                <div
                  onClick={()=>{ if(h.user){setSelUser(h.user);setSelCI(i);} }}
                  style={{ padding:"14px 18px", borderRadius:16, background:`${h.ac}0d`, border:`1px solid ${h.ac}26`, display:"flex", alignItems:"center", gap:12, cursor:h.user?"pointer":"default", transition:"background .18s" }}
                  onMouseEnter={e=>{ if(h.user) e.currentTarget.style.background=`${h.ac}18`; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=`${h.ac}0d`; }}
                >
                  <Avatar name={h.user?.name||"?"} size={40} ci={i}/>
                  <div>
                    <div style={{ color:"rgba(255,255,255,.35)", fontSize:10, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase" }}>{h.l}</div>
                    <div style={{ color:"#fff", fontWeight:800, fontSize:15 }}>{h.user?.name||"—"}</div>
                    <div style={{ color:h.ac, fontWeight:700, fontSize:12 }}>{h.val}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* BAR CHART */}
            <div className="s8">
              <div className="glass">
                <h2 style={{ margin:"0 0 4px", fontSize:20, fontWeight:800, letterSpacing:"-0.02em" }}>Subastas por usuario</h2>
                <p style={{ margin:"0 0 18px", color:"rgba(255,255,255,.4)", fontSize:13 }}>
                  Subastas creadas — de mayor a menor. Clic en la barra para ver el perfil completo.
                </p>
                <BarChart
                  data={dash.chartBarSubastas}
                  onSelect={(userData, ci)=>{ if(userData){setSelUser(userData);setSelCI(ci);} }}
                />
              </div>
            </div>

            {/* LIVE EVENTS */}
            <div className="s4">
              <div className="glass" style={{ height:"100%" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>Actividad reciente</h2>
                  <div className="pdot"/>
                </div>
                <p style={{ margin:"0 0 14px", color:"rgba(255,255,255,.4)", fontSize:13 }}>Eventos en tiempo real vía Pusher.</p>
                <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:468, overflowY:"auto" }}>
                  {dash.liveEvents.length===0
                    ? <div style={{ color:"rgba(255,255,255,.35)", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", borderRadius:13, padding:14, fontSize:13 }}>No hay actividad reciente.</div>
                    : dash.liveEvents.map(ev=>(
                        <div key={ev.id} style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", borderRadius:13, padding:"10px 13px" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginBottom:5 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <EvBadge type={ev.type}/>
                              <strong style={{ color:"#fff", fontSize:13 }}>{ev.title}</strong>
                            </div>
                            <span style={{ color:"rgba(255,255,255,.28)", fontSize:10, whiteSpace:"nowrap" }}>{fmtDate(ev.createdAt)}</span>
                          </div>
                          <div style={{ color:"rgba(255,255,255,.52)", fontSize:12 }}>{ev.user}</div>
                          <div style={{ marginTop:4, color:"#fbbf24", fontWeight:700, fontSize:13 }}>{fmtMoney(ev.amount)}</div>
                        </div>
                      ))
                  }
                </div>
              </div>
            </div>

            {/* USER TABLE */}
            <div className="s12">
              <div className="glass">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:20 }}>
                  <div>
                    <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>Desglose por usuario</h2>
                    <p style={{ margin:"6px 0 0", color:"rgba(255,255,255,.4)", fontSize:13 }}>Clic en columna para ordenar · clic en fila para ver perfil.</p>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:280, padding:"10px 14px", borderRadius:14, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)" }}>
                    <Search size={15} color="rgba(255,255,255,.35)"/>
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre, correo o rol…" style={{ width:"100%", background:"transparent", border:"none", outline:"none", color:"#fff", fontSize:14 }}/>
                  </div>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th style={{ width:36 }}>#</th>
                        {COLS.map(col=>(
                          <th key={col.k} className={col.s?"th-s":""} onClick={col.s?()=>handleSort(col.k):undefined}>
                            {col.l}{col.s&&<SA field={col.k}/>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length===0
                        ? <tr><td colSpan={COLS.length+1} style={{ color:"rgba(255,255,255,.35)", padding:"24px 12px" }}>No hay datos para mostrar.</td></tr>
                        : filteredUsers.map((user,idx)=>(
                          <tr key={user.id} onClick={()=>{setSelUser(user);setSelCI(idx%AV_COLORS.length);}}>
                            <td>
                              <span className="rbadge" style={{
                                background:idx===0?"#f59e0b22":idx===1?"#94a3b822":idx===2?"#cd7f3222":"rgba(255,255,255,.05)",
                                color:idx===0?"#f59e0b":idx===1?"#94a3b8":idx===2?"#cd7f32":"rgba(255,255,255,.3)",
                                border:`1px solid ${idx===0?"#f59e0b33":idx===1?"#94a3b833":idx===2?"#cd7f3233":"rgba(255,255,255,.07)"}`,
                              }}>{idx+1}</span>
                            </td>
                            <td>
                              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                <Avatar name={user.name} size={32} ci={idx%AV_COLORS.length}/>
                                <div>
                                  <div style={{ fontWeight:700, fontSize:13 }}>{user.name}</div>
                                  <div style={{ color:"rgba(255,255,255,.35)", fontSize:11 }}>{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td><span style={{ padding:"3px 8px", borderRadius:6, background:"rgba(129,140,248,.1)", border:"1px solid rgba(129,140,248,.2)", color:"#a5b4fc", fontSize:11, fontWeight:700 }}>{user.role}</span></td>
                            <td>
                              <span style={{ fontWeight:800, color:user.auctionsCreated>0?"#818cf8":"rgba(255,255,255,.38)" }}>{user.auctionsCreated}</span>
                              {user.auctionsActive>0&&<span style={{ marginLeft:5, fontSize:10, color:"#34d399" }}>({user.auctionsActive} activas)</span>}
                            </td>
                            <td style={{ fontWeight:700, color:user.bidsCount>0?"#f59e0b":"rgba(255,255,255,.38)" }}>{user.bidsCount}</td>
                            <td>{user.salesCount}</td>
                            <td>{user.purchasesCount}</td>
                            <td style={{ color:"#34d399", fontWeight:700 }}>{fmtMoney(user.totalSold)}</td>
                            <td style={{ color:"#fbbf24", fontWeight:700 }}>{fmtMoney(user.totalSpent)}</td>
                            <td style={{ color:"rgba(255,255,255,.4)", fontSize:12 }}>{fmtDate(user.lastActivity)}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* USER PANEL */}
      {selUser && <UserPanel user={selUser} ci={selCI} onClose={()=>setSelUser(null)}/>}
    </div>
  );
}