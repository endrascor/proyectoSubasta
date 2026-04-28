import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Pusher from "pusher-js";
import SubastaService from "@/services/SubastaService";
import PujaService from "@/services/PujaService";
import FacturacionService from "@/services/FacturacionService";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";
import toast from "react-hot-toast";
import {
  Clock, Gavel, ArrowLeft, TrendingUp, User,
  FilmIcon, Crown, AlertCircle, Zap,
  Shield, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoriaGlow, categoriaStyles } from "@/utils/categoriaColors";
import "./DetailSubasta.css"; // 👈 estilos separados

// ── Helpers ───────────────────────────────────────────────────────────────
function parseFechaCR(fechaStr) {
  if (!fechaStr) return null;
  const clean = String(fechaStr).replace(" ", "T") + "Z";
  return new Date(clean);
}

function formatContador(diff) {
  if (diff <= 0) return null;
  const total_s = Math.floor(diff / 1000);
  const dias    = Math.floor(total_s / 86400);
  const horas   = Math.floor((total_s % 86400) / 3600);
  const mins    = Math.floor((total_s % 3600) / 60);
  const segs    = total_s % 60;

  if (dias >= 30) {
    const meses = Math.floor(dias / 30), diasR = dias % 30;
    return {
      partes: diasR > 0
        ? [{ val: meses, label: meses === 1 ? "mes" : "meses" }, { val: diasR, label: diasR === 1 ? "día" : "días" }]
        : [{ val: meses, label: meses === 1 ? "mes" : "meses" }],
      urgencia: "low",
    };
  }
  if (dias >= 7) {
    const semanas = Math.floor(dias / 7), diasR = dias % 7;
    return {
      partes: diasR > 0
        ? [{ val: semanas, label: semanas === 1 ? "semana" : "semanas" }, { val: diasR, label: diasR === 1 ? "día" : "días" }]
        : [{ val: semanas, label: semanas === 1 ? "semana" : "semanas" }],
      urgencia: "low",
    };
  }
  if (dias >= 1)  return { partes: [{ val: dias,  label: dias  === 1 ? "día"     : "días"     }, { val: horas, label: horas === 1 ? "hora"   : "horas"   }], urgencia: dias  >= 3 ? "low"    : "medium"   };
  if (horas >= 1) return { partes: [{ val: horas, label: horas === 1 ? "hora"    : "horas"    }, { val: mins,  label: mins  === 1 ? "minuto" : "minutos" }], urgencia: horas >= 6 ? "medium" : "high"     };
  if (mins  >= 1) return { partes: [{ val: mins,  label: mins  === 1 ? "minuto"  : "minutos"  }, { val: segs,  label: segs  === 1 ? "segundo": "segundos"}], urgencia: mins  >= 5 ? "high"   : "critical" };
  return { partes: [{ val: segs, label: segs === 1 ? "segundo" : "segundos" }], urgencia: "critical" };
}

function getGlow(categorias) {
  if (!categorias?.length) return { hex: "#facc15", rgb: "250,204,21" };
  const desc = categorias[0].descripcion;
  const g    = categoriaGlow[desc];
  return g ? { hex: g.hex, rgb: g.rgb } : { hex: "#facc15", rgb: "250,204,21" };
}

// ── Contador ──────────────────────────────────────────────────────────────
function Contador({ fechaCierre, onExpirado }) {
  const [data, setData]         = useState(null);
  const [expirado, setExpirado] = useState(false);
  const called = useRef(false);

  useEffect(() => {
    const calcular = () => {
      const cierre = parseFechaCR(fechaCierre);
      if (!cierre) return;
      const diff = cierre.getTime() - Date.now();
      if (diff <= 0) {
        setExpirado(true);
        setData(null);
        if (!called.current) { called.current = true; onExpirado?.(); }
        return;
      }
      setData(formatContador(diff));
    };
    calcular();
    const interval = setInterval(calcular, 1000);
    return () => clearInterval(interval);
  }, [fechaCierre]);

  const urgColors = {
    low:      { text: "#4ade80", border: "rgba(74,222,128,.28)",  bg: "rgba(74,222,128,.07)"  },
    medium:   { text: "#facc15", border: "rgba(250,204,21,.28)",  bg: "rgba(250,204,21,.07)"  },
    high:     { text: "#fb923c", border: "rgba(251,146,60,.3)",   bg: "rgba(251,146,60,.07)"  },
    critical: { text: "#f87171", border: "rgba(248,113,113,.35)", bg: "rgba(248,113,113,.08)" },
  };

  if (expirado) return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", borderRadius:40, background:"rgba(248,113,113,.07)", border:".5px solid rgba(248,113,113,.35)", fontFamily:"'DM Mono',monospace", fontSize:12, color:"#f87171" }}>
      <Clock size={13} /> Subasta cerrada
    </div>
  );

  if (!data) return null;
  const c = urgColors[data.urgencia];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:40, background:c.bg, border:`.5px solid ${c.border}`, fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:500, letterSpacing:".04em", color:c.text, animation: data.urgencia === "critical" ? "ds-tick .8s ease-in-out infinite" : undefined }}>
      <Clock size={13} />
      {data.partes.map((p, i) => (
        <span key={i} style={{ display:"flex", alignItems:"baseline", gap:3 }}>
          <span style={{ fontWeight:700, fontSize:14 }}>{p.val}</span>
          <span style={{ fontSize:10, opacity:.75 }}>{p.label}</span>
          {i < data.partes.length - 1 && <span style={{ fontSize:10, opacity:.3, margin:"0 2px" }}>y</span>}
        </span>
      ))}
    </div>
  );
}

// ── PujaRow ───────────────────────────────────────────────────────────────
function PujaRow({ puja, index, isNew }) {
  const [highlight, setHighlight] = useState(isNew);

  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setHighlight(false), 2500);
      return () => clearTimeout(t);
    }
  }, [isNew]);

  const isTop = index === 0;
  return (
    <div
      className={`ds-bid-row ${isTop ? "top" : "reg"} ${isNew ? "fresh" : ""}`}
      style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 14px", borderRadius:14, border:".5px solid",
        borderColor: isTop ? "rgba(250,204,21,.22)" : highlight ? "rgba(74,222,128,.2)" : "rgba(255,255,255,.06)",
        background:  isTop ? "rgba(250,204,21,.06)" : highlight ? "rgba(74,222,128,.05)" : "rgba(255,255,255,.015)",
      }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width:30, height:30, borderRadius:10, flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center",
          background: isTop ? "rgba(250,204,21,.12)" : "rgba(255,255,255,.03)",
          border: `.5px solid ${isTop ? "rgba(250,204,21,.3)" : "rgba(255,255,255,.07)"}`,
          fontSize: isTop ? 14 : 10, fontFamily:"'DM Mono',monospace",
          fontWeight:700, color: isTop ? undefined : "rgba(201,185,154,.25)",
        }}>
          {isTop ? <Crown size={13} color="#facc15" /> : `#${index + 1}`}
        </div>
        <div>
          <p style={{ margin:0, fontFamily:"'Cormorant Garamond',serif", fontSize:15, fontWeight:600, color:"rgba(245,234,216,.82)", lineHeight:1 }}>
            {puja.usuario?.nombre ?? "—"}
          </p>
          <p style={{ margin:"2px 0 0", fontFamily:"'DM Mono',monospace", fontSize:10, color:"rgba(201,185,154,.28)" }}>
            {parseFechaCR(puja.fechaPuja)?.toLocaleString("es-CR") ?? puja.fechaPuja}
          </p>
        </div>
      </div>
      <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize: isTop ? 17 : 14, color: isTop ? "#facc15" : "rgba(201,185,154,.38)" }}>
        ${Number(puja.montoOfertado).toLocaleString()}
      </span>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────
export function DetailSubasta() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const BASE_URL = import.meta.env.VITE_BASE_URL + "uploads";

  // ── Usuario real desde el contexto de sesión ──────────────────────────
const { user } = useContext(UserContext);
  // user.idUsuario, user.nombre, user.correo

  const [subasta,        setSubasta]        = useState(null);
  const [pujas,          setPujas]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [monto,          setMonto]          = useState("");
  const [montoError,     setMontoError]     = useState("");
  const [pujaSuper,      setPujaSuper]      = useState(false);
  const [cerrada,        setCerrada]        = useState(false);
  const [enviando,       setEnviando]       = useState(false);
  const [nuevasPujas,    setNuevasPujas]    = useState(new Set());
  const [mounted,        setMounted]        = useState(false);
  const [tienePendiente, setTienePendiente] = useState(false);
  const bidInpRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // ── Verificar si el usuario tiene factura pendiente ───────────────────
  const verificarPendiente = async () => {
    if (!user?.idUsuario) return;
    try {
      const res     = await FacturacionService.getAll();
      const data    = res.data?.data ?? res.data ?? [];
      const facturas = Array.isArray(data) ? data : [];
      const pendiente = facturas.some(f =>
        String(f.idUsuario) === String(user.idUsuario) &&
        (String(f.idEstadoFacturacion) === "1" || f.resultado === "Pendiente")
      );
      setTienePendiente(pendiente);
    } catch {
      setTienePendiente(false);
    }
  };

  // ── Cargar subasta + pujas ────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resSub      = await SubastaService.getSubastaById(id);
        const subastaData = resSub.data?.data ?? resSub.data;
        setSubasta(subastaData);
        if (subastaData?.idEstadoSubasta != 1) setCerrada(true);
        try {
          const resPujas  = await PujaService.getPujasbySubasta(id);
          const pujasData = resPujas.data?.data ?? resPujas.data;
          if (pujasData && Array.isArray(pujasData))
            setPujas([...pujasData].sort((a, b) => Number(b.montoOfertado) - Number(a.montoOfertado)));
        } catch {
          setPujas([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ── Re-verificar pendiente cuando cambia el usuario ───────────────────
  useEffect(() => {
    verificarPendiente();
  }, [user?.idUsuario]);

  // ── Pusher: canal de la subasta ───────────────────────────────────────
  useEffect(() => {
    const pusher  = new Pusher(import.meta.env.VITE_PUSHER_KEY, { cluster: import.meta.env.VITE_PUSHER_CLUSTER });
    const channel = pusher.subscribe("subasta-" + id);

    channel.bind("nueva-puja", (data) => {
      setPujas((prev) => {
        const liderAnterior = prev[0];
        const nuevas = [data.puja, ...prev].sort((a, b) => Number(b.montoOfertado) - Number(a.montoOfertado));
        // Notificar si el usuario actual fue superado
        if (
          liderAnterior &&
          String(liderAnterior.idUsuario) === String(user?.idUsuario) &&
          String(data.puja.idUsuario)     !== String(user?.idUsuario)
        ) {
          setPujaSuper(true);
          setTimeout(() => setPujaSuper(false), 6000);
        }
        return nuevas;
      });
      setNuevasPujas(prev => {
        const s = new Set(prev);
        s.add(data.puja.idPuja);
        setTimeout(() => setNuevasPujas(p => { const n = new Set(p); n.delete(data.puja.idPuja); return n; }), 3000);
        return s;
      });
    });

    channel.bind("subasta-cerrada", (data) => {
      setCerrada(true);
      setSubasta(prev => prev
        ? { ...prev, idEstadoSubasta: 2, estadoSubasta: { idEstadoSubasta: 2, descripcion: "Finalizada" } }
        : prev
      );
      toast.success("🏁 Subasta finalizada — Ganador: " + (data.ganador?.nombre ?? "Sin ganador"));
    });

    return () => { channel.unbind_all(); pusher.unsubscribe("subasta-" + id); pusher.disconnect(); };
  }, [id, user?.idUsuario]);

  // ── Pusher: canal de pagos ────────────────────────────────────────────
  useEffect(() => {
    const pusher  = new Pusher(import.meta.env.VITE_PUSHER_KEY, { cluster: import.meta.env.VITE_PUSHER_CLUSTER });
    const channel = pusher.subscribe("pagos");
    channel.bind("pago-confirmado", () => verificarPendiente());
    channel.bind("nuevo-pago",      () => verificarPendiente());
    return () => { channel.unbind_all(); pusher.unsubscribe("pagos"); pusher.disconnect(); };
  }, [user?.idUsuario]);

  // ── Cuando el contador expira ─────────────────────────────────────────
  const handleExpirado = async () => {
    try {
      const res  = await SubastaService.getSubastaById(id);
      const data = res.data?.data ?? res.data;
      setSubasta(data);
      setCerrada(true);
    } catch (e) {
      console.error(e);
    }
  };

  // ── Validación del monto ──────────────────────────────────────────────
  const handleMontoChange = (val) => {
    setMonto(val);
    if (!val) { setMontoError(""); return; }
    const num = Number(val);
    if (isNaN(num) || num <= 0) { setMontoError("Ingresa un número válido"); return; }
    if (num < montoMinimo)      { setMontoError(`Mínimo requerido: $${montoMinimo.toLocaleString()}`); return; }
    setMontoError("");
  };

  // ── Enviar puja ───────────────────────────────────────────────────────
  const handlePujar = async () => {
    const montoNum = Number(monto);
    if (!monto || isNaN(montoNum) || montoNum <= 0) { setMontoError("Ingresa un monto válido"); return; }
    if (montoNum < montoMinimo) { setMontoError(`El monto mínimo es $${montoMinimo.toLocaleString()}`); return; }
    setEnviando(true);
    try {
      const res = await PujaService.createPuja({
        idUsuario:     user.idUsuario, // 👈 usuario real
        idSubasta:     Number(id),
        montoOfertado: montoNum,
      });
      if (res.data?.success === false) {
        setMontoError(res.data.message);
        if (res.data.message?.includes("pago pendiente")) setTienePendiente(true);
      } else {
        setMonto("");
        setMontoError("");
        if (bidInpRef.current) bidInpRef.current.className = "ds-bid-inp";
        toast.success("¡Puja registrada!");
      }
    } catch {
      toast.error("Error al registrar la puja");
    } finally {
      setEnviando(false);
    }
  };

  // ── Estados de carga / error ──────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#07060f", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div style={{ position:"relative", width:64, height:64 }}>
          <div style={{ position:"absolute", inset:0, borderRadius:16, border:"2px solid rgba(250,204,21,.1)", transform:"rotate(45deg)" }} />
          <div style={{ position:"absolute", inset:8, borderRadius:12, border:"2px solid rgba(250,204,21,.22)", animation:"ds-spinr .9s linear infinite" }} />
          <Gavel style={{ position:"absolute", inset:0, margin:"auto", width:24, height:24, color:"rgba(250,204,21,.6)" }} />
        </div>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:".3em", textTransform:"uppercase", color:"rgba(255,255,255,.25)", margin:0 }}>
          Cargando subasta
        </p>
      </div>
    </div>
  );

  if (!subasta) return (
    <div style={{ minHeight:"100vh", background:"#07060f", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <AlertCircle style={{ width:40, height:40, color:"#f87171", margin:"0 auto 12px" }} />
        <p style={{ color:"rgba(255,255,255,.5)", fontSize:14, margin:"0 0 12px" }}>No se encontró la subasta</p>
        <Button onClick={() => navigate(-1)} variant="ghost">Volver</Button>
      </div>
    </div>
  );

  // ── Valores derivados ─────────────────────────────────────────────────
  const data        = subasta;
  const glow        = getGlow(data?.carta?.categorias);
  const isActive    = String(data?.idEstadoSubasta) === "1" && !cerrada;
  const pujaLider   = pujas[0] ?? null;
  const esVendedor  = String(data?.idUsuario) === String(user?.idUsuario);
  const montoMinimo = pujaLider
    ? Number(pujaLider.montoOfertado) + Number(data?.incrementoMin)
    : Number(data?.precio)            + Number(data?.incrementoMin);
  const categorias  = data?.carta?.categorias ?? [];
  const bloqueado   = esVendedor || tienePendiente;

  const razonesBloqueado = () => {
    if (esVendedor)     return "Eres el vendedor de esta subasta";
    if (tienePendiente) return "Tienes un pago pendiente — ve a Pagos para confirmar";
    return null;
  };

  const quickBids = [
    montoMinimo,
    montoMinimo + Math.ceil(Number(data?.incrementoMin) * 2),
    montoMinimo + Math.ceil(Number(data?.incrementoMin) * 5),
  ];

  const inpClass = () => {
    if (montoError) return "ds-bid-inp err";
    if (monto && Number(monto) >= montoMinimo) return "ds-bid-inp ok";
    return "ds-bid-inp";
  };

  // ── RENDER ────────────────────────────────────────────────────────────
  return (
    <div className="ds-root" style={{ minHeight:"100vh", background:"#07060f", position:"relative", overflowX:"hidden" }}>

      {/* FONDO GLOW */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", top:0, left:"25%", width:700, height:500, borderRadius:"50%", filter:"blur(140px)", background:glow.hex, animation:"ds-glowPulse 5s ease-in-out infinite", opacity:.06 }} />
        <div style={{ position:"absolute", bottom:0, right:"25%", width:400, height:300, borderRadius:"50%", filter:"blur(100px)", background:glow.hex, opacity:.03 }} />
        <div style={{ position:"absolute", inset:0, opacity:.012, backgroundImage:"linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
      </div>

      {/* ALERTA PUJA SUPERADA */}
      {pujaSuper && (
        <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", zIndex:60, display:"flex", alignItems:"center", gap:14, padding:"16px 22px", borderRadius:20, background:"rgba(9,7,18,.97)", border:".5px solid rgba(248,113,113,.4)", backdropFilter:"blur(24px)", boxShadow:"0 24px 60px rgba(0,0,0,.7),0 0 40px rgba(248,113,113,.1)", animation:"ds-slideIn .5s cubic-bezier(.22,1,.36,1) both", minWidth:300 }}>
          <div style={{ width:40, height:40, borderRadius:13, background:"rgba(248,113,113,.1)", border:".5px solid rgba(248,113,113,.28)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, animation:"ds-floatY 2s ease-in-out infinite" }}>
            <AlertCircle size={19} color="#f87171" />
          </div>
          <div>
            <p style={{ margin:0, fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:"#fca5a5" }}>¡Tu puja fue superada!</p>
            <p style={{ margin:"3px 0 0", fontFamily:"'DM Mono',monospace", fontSize:10, color:"rgba(255,255,255,.28)" }}>Alguien ofreció más — ¿vuelves a pujar?</p>
          </div>
          <button
            onClick={() => setPujaSuper(false)}
            style={{ marginLeft:6, background:"none", border:"none", color:"rgba(255,255,255,.2)", fontSize:20, cursor:"pointer", lineHeight:1, transition:"all .25s" }}
            onMouseEnter={e => e.target.style.color = "rgba(255,255,255,.6)"}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,.2)"}
          >×</button>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ position:"relative", zIndex:10, maxWidth:1140, margin:"0 auto", padding:"28px 20px 100px", opacity: mounted ? 1 : 0, transition:"opacity .5s" }}>

        {/* TOPBAR */}
        <div className="ds-a1" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32 }}>
          <button
            onClick={() => navigate(-1)}
            className="ds-back-btn"
            style={{ display:"flex", alignItems:"center", gap:7, background:"none", border:".5px solid rgba(201,185,154,.12)", color:"#c9b99a", fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:".1em", textTransform:"uppercase", padding:"9px 16px", borderRadius:10, cursor:"pointer", transition:"all .3s" }}
          >
            <ArrowLeft size={14} /> Regresar
          </button>
        </div>

        {/* HERO CARD */}
        <div className="ds-a2" style={{ position:"relative", borderRadius:28, overflow:"hidden", marginBottom:18, background:"linear-gradient(145deg,#161323 0%,#0e0c1c 50%,#0b0916 100%)", border:".5px solid rgba(250,204,21,.22)", animation:"ds-goldRing 6s ease-in-out infinite" }}>
          <div className="ds-hero-scanline" />
          <div className="ds-hero-topline" />
          <div className="ds-orb-a" />
          <div className="ds-orb-b" />
          <div className="ds-orb-c" />

          <div style={{ padding:"30px 36px 24px", position:"relative", zIndex:4 }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:20, background:"rgba(74,222,128,.08)", border:".5px solid rgba(74,222,128,.3)", fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:".18em", textTransform:"uppercase", color:"#4ade80" }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", animation:"ds-tick 1.2s ease-in-out infinite", boxShadow:"0 0 8px rgba(74,222,128,.8)", display:"inline-block" }} />
                    {isActive ? "Subasta en vivo" : "Subasta"}
                  </div>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"rgba(201,185,154,.25)", letterSpacing:".1em" }}>Lote #{data.idSubasta}</span>
                </div>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(26px,5vw,48px)", fontWeight:900, lineHeight:.95, color:"#f5ead8", letterSpacing:"-.02em", margin:0 }}>
                  {data.carta?.nombre ?? "—"}
                </h1>
                {categorias.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:12 }}>
                    {categorias.map(cat => (
                      <span key={cat.idCategoria} className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${categoriaStyles[cat.descripcion] ?? "bg-white/5 border-white/10 text-white/40"}`}>
                        {cat.descripcion}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:9, flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 18px", borderRadius:40, fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:500, background: isActive ? "rgba(74,222,128,.07)" : "rgba(248,113,113,.07)", border: isActive ? ".5px solid rgba(74,222,128,.3)" : ".5px solid rgba(248,113,113,.3)", color: isActive ? "#4ade80" : "#f87171" }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background: isActive ? "#4ade80" : "#f87171", display:"inline-block", animation: isActive ? "ds-tick 1.2s ease-in-out infinite" : undefined }} />
                  {isActive ? "En curso" : "Finalizada"}
                </div>
                {data.fechaCierre && <Contador fechaCierre={data.fechaCierre} onExpirado={handleExpirado} />}
              </div>
            </div>
          </div>

          {/* STATS BAR */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", borderTop:".5px solid rgba(250,204,21,.08)", position:"relative", zIndex:4 }}>
            {[
              { label:"Precio base",     value:`$${Number(data.precio).toLocaleString()}`,        color:"#facc15" },
              { label:"Incremento mín.", value:`$${Number(data.incrementoMin).toLocaleString()}`, color:"#a78bfa" },
              { label:"Total pujas",     value: pujas.length,                                      color:"#7aaee8" },
            ].map((s, i) => (
              <div key={i} className="ds-stat-cell" style={{ padding:"20px 28px", textAlign:"center", borderRight: i < 2 ? ".5px solid rgba(250,204,21,.07)" : "none", position:"relative", overflow:"hidden", cursor:"default" }}>
                <p style={{ margin:"0 0 7px", fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color:"rgba(201,185,154,.28)" }}>{s.label}</p>
                <p style={{ margin:0, fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:s.color, lineHeight:1 }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* GRID PRINCIPAL */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 390px", gap:18, alignItems:"start" }}>

          {/* ── COLUMNA IZQUIERDA ── */}
          <div>
            <div className="ds-a3 ds-card" style={{ borderRadius:22, border:".5px solid rgba(250,204,21,.1)", background:"linear-gradient(150deg,#141122 0%,#0e0c1c 100%)", overflow:"hidden", marginBottom:16 }}>
              <div style={{ padding:"16px 22px", borderBottom:".5px solid rgba(250,204,21,.07)" }}>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:".22em", textTransform:"uppercase", color:"rgba(201,185,154,.32)" }}>
                  🎴 Carta en subasta
                </span>
              </div>
              <div style={{ padding:22 }}>
                <div style={{ display:"flex", gap:22 }}>

                  {/* IMAGEN */}
                  <div className="ds-img-wrap" style={{ flexShrink:0, width:112, height:158, borderRadius:16, overflow:"hidden", border:`1.5px solid rgba(${glow.rgb},.3)`, boxShadow:`0 16px 48px rgba(0,0,0,.7),0 0 28px rgba(${glow.rgb},.1)`, position:"relative", cursor:"pointer" }}>
                    {data.carta?.imagenes?.length > 0 ? (
                      <>
                        <img src={`${BASE_URL}/${data.carta.imagenes[0].imagen}`} alt={data.carta.nombre} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(255,255,255,.06) 0%,transparent 40%,rgba(0,0,0,.5) 100%)", pointerEvents:"none" }} />
                      </>
                    ) : (
                      <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,.02)", color:"rgba(201,185,154,.2)" }}>
                        <FilmIcon size={36} />
                      </div>
                    )}
                  </div>

                  {/* INFO CARTA */}
                  <div style={{ flex:1, display:"flex", flexDirection:"column", gap:11 }}>
                    <p style={{ margin:0, fontFamily:"'Playfair Display',serif", fontSize:21, fontWeight:700, color:"#f5ead8", lineHeight:1.05 }}>{data.carta?.nombre ?? "—"}</p>
                    {data.carta?.descripcion && (
                      <p style={{ margin:0, fontSize:13, color:"rgba(201,185,154,.42)", lineHeight:1.7, fontStyle:"italic" }}>{data.carta.descripcion}</p>
                    )}
                    <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                      {data.carta?.condicion?.descripcion && (
                        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:10, background:"rgba(255,255,255,.025)", border:".5px solid rgba(255,255,255,.07)", fontFamily:"'DM Mono',monospace", fontSize:10 }}>
                          <span style={{ width:5, height:5, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 6px rgba(74,222,128,.6)", flexShrink:0 }} />
                          <span style={{ color:"rgba(201,185,154,.45)" }}>Condición</span>
                          <strong style={{ color:"rgba(201,185,154,.82)" }}>{data.carta.condicion.descripcion}</strong>
                        </div>
                      )}
                      {data.carta?.fechaRegistro && (
                        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:10, background:"rgba(255,255,255,.025)", border:".5px solid rgba(255,255,255,.07)", fontFamily:"'DM Mono',monospace", fontSize:10 }}>
                          <span style={{ width:5, height:5, borderRadius:"50%", background:"#60a5fa", boxShadow:"0 0 6px rgba(96,165,250,.6)", flexShrink:0 }} />
                          <span style={{ color:"rgba(201,185,154,.45)" }}>Registrada</span>
                          <strong style={{ color:"rgba(201,185,154,.82)" }}>{data.carta.fechaRegistro?.slice(0, 10)}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* PUJA LÍDER */}
                <div className="ds-leader-card" style={{ marginTop:18, padding:"20px 22px", borderRadius:18, background:"linear-gradient(135deg,rgba(250,204,21,.07),rgba(232,115,107,.03))", border:".5px solid rgba(250,204,21,.25)", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", inset:0, borderRadius:18, background:"radial-gradient(ellipse at 80% -10%,rgba(250,204,21,.14) 0%,transparent 60%)", pointerEvents:"none" }} />
                  <p style={{ margin:"0 0 12px", fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color:"rgba(250,204,21,.42)", display:"flex", alignItems:"center", gap:6 }}>
                    👑 Puja más alta
                  </p>
                  {pujaLider ? (
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                        <div className="ds-crown" style={{ width:40, height:40, borderRadius:14, background:"rgba(250,204,21,.1)", border:".5px solid rgba(250,204,21,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, cursor:"default" }}>👑</div>
                        <div>
                          <p style={{ margin:0, fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:16, color:"#f5ead8" }}>{pujaLider.usuario?.nombre ?? "—"}</p>
                          <p style={{ margin:"2px 0 0", fontFamily:"'DM Mono',monospace", fontSize:10, color:"rgba(201,185,154,.28)" }}>
                            {parseFechaCR(pujaLider.fechaPuja)?.toLocaleString("es-CR") ?? pujaLider.fechaPuja}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <p style={{ margin:0, fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:900, lineHeight:1, background:"linear-gradient(135deg,#f7d88a,#e8a83c)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                          ${Number(pujaLider.montoOfertado).toLocaleString()}
                        </p>
                        <p style={{ margin:"3px 0 0", fontFamily:"'DM Mono',monospace", fontSize:10, color:"rgba(201,185,154,.28)" }}>
                          próxima mín: ${montoMinimo.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <p style={{ margin:0, fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(201,185,154,.3)" }}>Sin pujas aún</p>
                      <div style={{ textAlign:"right" }}>
                        <p style={{ margin:0, fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, color:"rgba(201,185,154,.4)" }}>${Number(data.precio).toLocaleString()}</p>
                        <p style={{ margin:"2px 0 0", fontFamily:"'DM Mono',monospace", fontSize:10, color:"rgba(201,185,154,.25)" }}>precio base</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* VENDEDOR */}
                <div className="ds-seller-row" style={{ marginTop:14, display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:13, background:"rgba(255,255,255,.018)", border:".5px solid rgba(255,255,255,.06)", transition:"all .3s", cursor:"default" }}>
                  <div className="ds-s-icon" style={{ width:34, height:34, borderRadius:11, background:"rgba(96,165,250,.1)", border:".5px solid rgba(96,165,250,.22)", display:"flex", alignItems:"center", justifyContent:"center", transition:"transform .3s" }}>
                    <User size={15} color="#60a5fa" />
                  </div>
                  <div>
                    <p style={{ margin:0, fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:".15em", color:"rgba(201,185,154,.28)", textTransform:"uppercase" }}>Vendedor</p>
                    <p style={{ margin:"1px 0 0", fontSize:13, color:"rgba(201,185,154,.72)", fontWeight:600 }}>{data.creador?.nombre ?? "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── COLUMNA DERECHA ── */}
          <div className="ds-a4">

            {/* PANEL PUJA — solo si la subasta está activa y el usuario puede pujar */}
            {isActive && !bloqueado && (
              <div className="ds-bid-panel" style={{ padding:24, borderRadius:22, border:".5px solid rgba(250,204,21,.2)", background:"linear-gradient(160deg,#161224 0%,#100e1e 100%)", position:"relative", overflow:"hidden", marginBottom:16 }}>
                <div className="ds-bp-glow-a" style={{ position:"absolute", width:300, height:220, borderRadius:"50%", filter:"blur(80px)", background:"rgba(250,204,21,.09)", top:-80, right:-80, pointerEvents:"none" }} />
                <div className="ds-bp-glow-b" style={{ position:"absolute", width:200, height:150, borderRadius:"50%", filter:"blur(60px)", background:"rgba(167,139,250,.06)", bottom:-40, left:-40, pointerEvents:"none" }} />
                <div className="ds-bp-topline" />

                <div style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(250,204,21,.5)", marginBottom:20, position:"relative", zIndex:1 }}>
                  <Zap size={13} color="#facc15" /> Realizar puja
                </div>

                {/* INPUT */}
                <div style={{ position:"relative", marginBottom:8, zIndex:1 }}>
                  <span style={{ position:"absolute", left:18, top:"50%", transform:"translateY(-50%)", fontFamily:"'Playfair Display',serif", fontSize:20, color:"rgba(250,204,21,.35)", pointerEvents:"none" }}>$</span>
                  <input
                    ref={bidInpRef}
                    type="number"
                    value={monto}
                    onChange={e => handleMontoChange(e.target.value)}
                    placeholder={montoMinimo.toLocaleString()}
                    className={inpClass()}
                    style={{ width:"100%", background:"rgba(255,255,255,.03)", border:".5px solid rgba(255,255,255,.1)", borderRadius:16, padding:"16px 18px 16px 40px", fontFamily:"'Playfair Display',serif", fontSize:22, color:"#f5ead8", MozAppearance:"textfield" }}
                  />
                </div>
                <p style={{ margin:"0 0 12px", fontFamily:"'DM Mono',monospace", fontSize:10, padding:"0 4px", color: montoError ? "rgba(248,113,113,.8)" : "rgba(201,185,154,.38)", minHeight:16, position:"relative", zIndex:1 }}>
                  {montoError || <>Mínimo: <strong>${montoMinimo.toLocaleString()}</strong></>}
                </p>

                {/* QUICK BIDS */}
                <div style={{ display:"flex", gap:8, marginBottom:16, position:"relative", zIndex:1 }}>
                  {quickBids.map((q, i) => (
                    <button
                      key={i}
                      className="ds-qb"
                      onClick={() => { setMonto(String(q)); handleMontoChange(String(q)); }}
                      style={{ flex:1, padding:"9px 6px", borderRadius:11, background:"rgba(250,204,21,.06)", border:".5px solid rgba(250,204,21,.18)", color:"rgba(250,204,21,.65)", fontFamily:"'DM Mono',monospace", fontSize:11, cursor:"pointer", textAlign:"center" }}
                    >
                      ${q.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* BOTÓN PUJAR */}
                <button
                  className="ds-bid-btn"
                  onClick={handlePujar}
                  disabled={enviando || !!montoError || !monto}
                  style={{ width:"100%", padding:16, borderRadius:16, border:"none", cursor: enviando || !!montoError || !monto ? "not-allowed" : "pointer", fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, letterSpacing:".03em", background:"linear-gradient(135deg,#e8a83c 0%,#facc15 45%,#f7d88a 100%)", color:"#07060f", opacity: enviando || !!montoError || !monto ? .3 : 1 }}
                >
                  {enviando
                    ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                        <span style={{ width:18, height:18, border:"2px solid rgba(0,0,0,.2)", borderTopColor:"rgba(0,0,0,.7)", borderRadius:"50%", animation:"ds-spinr .7s linear infinite", display:"inline-block" }} />
                        Registrando...
                      </span>
                    : "Pujar ahora"
                  }
                </button>
              </div>
            )}

            {/* BLOQUEADO — vendedor o pago pendiente */}
            {isActive && bloqueado && (
              <div style={{ padding:"22px", borderRadius:22, textAlign:"center", background: tienePendiente ? "rgba(251,146,60,.05)" : "rgba(250,204,21,.05)", border: tienePendiente ? ".5px solid rgba(251,146,60,.2)" : ".5px solid rgba(250,204,21,.15)", marginBottom:16 }}>
                <div style={{ width:40, height:40, borderRadius:14, background: tienePendiente ? "rgba(251,146,60,.1)" : "rgba(250,204,21,.1)", border: tienePendiente ? ".5px solid rgba(251,146,60,.2)" : ".5px solid rgba(250,204,21,.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                  {tienePendiente ? <CreditCard size={18} color="#fb923c" /> : <Shield size={18} color="#facc15" />}
                </div>
                <p style={{ margin:"0 0 5px", fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color: tienePendiente ? "rgba(251,146,60,.8)" : "rgba(250,204,21,.7)" }}>
                  {tienePendiente ? "Pago pendiente" : "Eres el vendedor"}
                </p>
                <p style={{ margin:0, fontFamily:"'DM Mono',monospace", fontSize:10, color:"rgba(201,185,154,.3)", lineHeight:1.6 }}>
                  {razonesBloqueado()}
                </p>
              </div>
            )}

            {/* SUBASTA FINALIZADA */}
            {!isActive && (
              <div className="ds-winner-card" style={{ padding:"28px 24px", borderRadius:22, textAlign:"center", background: pujaLider ? "linear-gradient(135deg,rgba(250,204,21,.07),rgba(232,115,107,.03))" : "rgba(255,255,255,.018)", border: pujaLider ? ".5px solid rgba(250,204,21,.28)" : ".5px solid rgba(255,255,255,.08)", marginBottom:16, position:"relative", overflow:"hidden" }}>
                {pujaLider && <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% -20%,rgba(250,204,21,.12) 0%,transparent 60%)", pointerEvents:"none" }} />}
                <div style={{ position:"relative", zIndex:1 }}>
                  <div style={{ fontSize:32, marginBottom:10, animation:"ds-floatY 3s ease-in-out infinite", display:"inline-block" }}>
                    {pujaLider ? "🏆" : "🎴"}
                  </div>
                  <p style={{ margin:"0 0 8px", fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color: pujaLider ? "#f5ead8" : "rgba(201,185,154,.4)" }}>
                    Subasta finalizada
                  </p>
                  {pujaLider ? (
                    <>
                      <p style={{ margin:"0 0 4px", fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:".15em", textTransform:"uppercase", color:"rgba(250,204,21,.45)" }}>Ganador</p>
                      <p style={{ margin:"0 0 6px", fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:"#facc15" }}>{pujaLider.usuario?.nombre ?? "—"}</p>
                      <p style={{ margin:0, fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, background:"linear-gradient(135deg,#f7d88a,#e8a83c)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                        ${Number(pujaLider.montoOfertado).toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ margin:"0 0 4px", fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,185,154,.28)" }}>Resultado</p>
                      <p style={{ margin:0, fontFamily:"'Playfair Display',serif", fontSize:16, color:"rgba(201,185,154,.4)", fontStyle:"italic" }}>Sin ganador — ninguna puja registrada</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* HISTORIAL DE PUJAS */}
            <div className="ds-a5 ds-card" style={{ borderRadius:22, border:".5px solid rgba(250,204,21,.1)", background:"linear-gradient(150deg,#141122 0%,#0e0c1c 100%)", overflow:"hidden" }}>
              <div style={{ padding:"16px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:".5px solid rgba(250,204,21,.07)" }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:".22em", textTransform:"uppercase", color:"rgba(201,185,154,.32)", display:"flex", alignItems:"center", gap:7 }}>
                  <TrendingUp size={12} /> Historial de pujas
                </div>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"rgba(201,185,154,.28)", background:"rgba(255,255,255,.03)", border:".5px solid rgba(255,255,255,.06)", padding:"4px 11px", borderRadius:20 }}>
                  {pujas.length} {pujas.length === 1 ? "puja" : "pujas"}
                </span>
              </div>
              <div
                style={{ maxHeight:380, overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:7 }}
                className="[&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-yellow-400/20 [&::-webkit-scrollbar-track]:bg-transparent"
              >
                {pujas.length === 0 ? (
                  <div style={{ padding:"44px 20px", textAlign:"center" }}>
                    <div style={{ fontSize:28, opacity:.25, marginBottom:10, animation:"ds-floatY 3s ease-in-out infinite" }}>🎴</div>
                    <p style={{ margin:0, fontFamily:"'DM Mono',monospace", fontSize:11, color:"rgba(201,185,154,.2)", lineHeight:1.7 }}>
                      Sin pujas todavía<br />Sé el primero en pujar
                    </p>
                  </div>
                ) : pujas.map((puja, index) => (
                  <PujaRow key={puja.idPuja ?? index} puja={puja} index={index} isNew={nuevasPujas.has(puja.idPuja)} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}