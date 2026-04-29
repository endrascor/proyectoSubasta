import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import FacturacionService from "@/services/FacturacionService";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser"; // ← NUEVO
import {
  CreditCard, CheckCircle, Clock, Trophy,
  User, Gavel, DollarSign, Calendar,
  Sparkles, TrendingUp, Zap,
} from "lucide-react";

/* ─── Keyframes ─────────────────────────────────────────────────────────── */
const CSS = `
  @keyframes fsu   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes rowIn { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
  @keyframes shimmer {
    0%  { background-position:-700px 0 }
    100%{ background-position: 700px 0 }
  }
  @keyframes spin  { to{transform:rotate(360deg)} }
  @keyframes ping  { 75%,100%{transform:scale(2);opacity:0} }
  @keyframes glow  { 0%,100%{opacity:.6} 50%{opacity:1} }
  @keyframes sweepIn {
    from{background-position:-100% 0}
    to  {background-position: 200% 0}
  }
  @keyframes borderPulse {
    0%,100%{border-color:rgba(52,211,153,.25)}
    50%    {border-color:rgba(52,211,153,.65)}
  }
  @keyframes countUp { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
  @keyframes halo {
    0%  {box-shadow:0 0 0 0 rgba(250,204,21,.35)}
    70% {box-shadow:0 0 0 10px rgba(250,204,21,0)}
    100%{box-shadow:0 0 0 0 rgba(250,204,21,0)}
  }

  .fsu { animation: fsu .5s cubic-bezier(.22,1,.36,1) both }
  .d1  { animation-delay:.06s }
  .d2  { animation-delay:.12s }
  .d3  { animation-delay:.18s }

  .row-enter { animation: rowIn .32s cubic-bezier(.22,1,.36,1) both }

  .shimmer-bg {
    background: linear-gradient(90deg,
      rgba(255,255,255,.03) 25%,
      rgba(255,255,255,.08) 50%,
      rgba(255,255,255,.03) 75%);
    background-size: 700px 100%;
    animation: shimmer 1.5s infinite linear;
  }

  .confirmed-sweep { position:relative; overflow:hidden; }
  .confirmed-sweep::after {
    content:''; position:absolute; inset:0; pointer-events:none;
    background:linear-gradient(90deg,transparent,rgba(52,211,153,.12),transparent);
    background-size:200% 100%;
    animation: sweepIn .9s ease-out forwards;
  }

  .btn-confirm { animation: borderPulse 2s ease-in-out infinite; }
  .btn-confirm:hover { animation:none; border-color:rgba(52,211,153,.7) !important; }

  .stat-number { animation: countUp .4s cubic-bezier(.34,1.56,.64,1) both }
  .pending-halo { animation: halo 2.2s ease-in-out infinite }
  .spin     { animation: spin .75s linear infinite }
  .ping-dot { animation: ping 1.2s cubic-bezier(0,0,.2,1) infinite }
  .glow-dot { animation: glow 2.5s ease-in-out infinite }

  .table-row-hover { transition: background .18s, transform .18s }
  .table-row-hover:hover {
    background: rgba(255,255,255,.028) !important;
    transform: translateX(2px);
  }
  .stat-card-wrap { position:relative; transition: transform .25s, box-shadow .25s; }
  .stat-card-wrap:hover { transform:translateY(-3px); }
`;

function injectCSS() {
  if (document.getElementById("lf-css")) return;
  const s = document.createElement("style");
  s.id = "lf-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ─── EstadoBadge ─────────────────────────────────────────────────────────── */
function EstadoBadge({ estado }) {
  const ok = !estado?.toLowerCase().includes("pendiente") && estado !== "1";
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border tracking-wide ${
      ok
        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
        : "bg-yellow-400/10 border-yellow-400/25 text-yellow-400"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ok ? "bg-emerald-400" : "bg-yellow-400 ping-dot"}`} />
      {ok ? "Confirmado" : "Pendiente"}
    </span>
  );
}

/* ─── SkeletonRow ─────────────────────────────────────────────────────────── */
function SkeletonRow({ delay = 0 }) {
  return (
    <div className="grid items-center px-6 py-5 border-b border-white/[0.04]"
      style={{ gridTemplateColumns:"56px 1fr 1fr 130px 110px 150px", gap:16, animation:`fsu .35s ease ${delay}s both` }}>
      {[40,160,140,80,90,110].map((w,i) => (
        <div key={i} className="shimmer-bg rounded-md" style={{ height:13, width:w, maxWidth:"100%" }} />
      ))}
    </div>
  );
}

/* ─── StatCard ────────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, borderC, bgC, iconBg, glowC, delay }) {
  return (
    <div className={`stat-card-wrap fsu ${delay} flex items-center gap-4 p-5 rounded-2xl backdrop-blur-sm`}
      style={{ border:`1px solid ${borderC}`, background:bgC, boxShadow:"none" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 16px 40px ${glowC}`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-[14px] flex items-center justify-center"
        style={{ background:iconBg, border:`1px solid ${borderC}` }}>
        <Icon style={{ width:20, height:20, color }} />
      </div>
      <div>
        <p className="m-0 text-[10px] font-black uppercase tracking-[.2em] mb-1" style={{ color:"rgba(255,255,255,.3)" }}>
          {label}
        </p>
        <p className="m-0 text-3xl font-black leading-none stat-number" style={{ color }}>
          {value}
        </p>
      </div>
      <div className="absolute bottom-0 left-4 right-4 h-px rounded-full opacity-30"
        style={{ background:`linear-gradient(90deg,transparent,${color},transparent)` }} />
    </div>
  );
}

/* ─── Componente principal ────────────────────────────────────────────────── */
export function ListFacturacion() {
  const [facturas,    setFacturas]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [confirmando, setConfirmando] = useState(null);
  const [newlyDone,   setNewlyDone]   = useState(new Set());
  const localRef = useRef(new Set());

  // ← NUEVO: obtener usuario logueado y verificar si es admin
  const { user, authorize } = useUser();
  const isAdmin = authorize(["Administrador"]);

  useEffect(() => { injectCSS(); }, []);

  /* ─── Carga inicial filtrada por rol ─────────────────────────────────────
     - Admin: trae todos los pagos (getAll)
     - Otros: trae solo los pagos del usuario logueado (getByUsuario)
  ─────────────────────────────────────────────────────────────────────── */
useEffect(() => {
    if (!user) {
      setLoading(false); // ← invitado: dejar de cargar y mostrar vacío
      return;
    }

    const fetchData = async () => {
      try {
        let res;
        if (isAdmin) {
          // Admin ve todos los pagos
          res = await FacturacionService.getAll();
        } else {
          // Comprador/Vendedor ve solo sus pagos
          res = await FacturacionService.allFacturasbyId(user.idUsuario);
        }
        const data = res.data?.data ?? res.data;
        setFacturas(Array.isArray(data) ? data : []);
      } catch (err) {
      // 404 = sin pagos todavía, no mostrar toast
      if (err?.response?.status !== 404) {
      toast.error("Error al cargar pagos");
        }
       setFacturas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, isAdmin]);

  /* Pusher — actualizaciones en tiempo real */
  useEffect(() => {
    const pusher  = new Pusher(import.meta.env.VITE_PUSHER_KEY, { cluster: import.meta.env.VITE_PUSHER_CLUSTER });
    const channel = pusher.subscribe("pagos");

    channel.bind("nuevo-pago", (data) => {
      if (data.facturacion) {
        // ← NUEVO: si no es admin, solo agregar si el pago es del usuario logueado
        const esDelUsuario = isAdmin || String(data.facturacion.idUsuario) === String(user?.idUsuario);
        if (!esDelUsuario) return;

        setFacturas(prev => {
          const existe = prev.some(f => String(f.idFacturacion) === String(data.facturacion.idFacturacion));
          if (existe) return prev;
          return [data.facturacion, ...prev];
        });
        toast("Nueva factura generada", { icon: "🧾" });
      }
    });

    channel.bind("pago-confirmado", (data) => {
      const fid = String(data.facturacion?.idFacturacion);
      setFacturas(p => p.map(f =>
        String(f.idFacturacion) === fid
          ? { ...f, idEstadoFacturacion:2, resultado:"Confirmado", estadoDescripcion:"Confirmado" }
          : f
      ));
      if (!localRef.current.has(fid)) toast.success("Pago confirmado en tiempo real");
      markDone(fid);
    });

    return () => { channel.unbind_all(); pusher.unsubscribe("pagos"); pusher.disconnect(); };
  }, [user, isAdmin]);

  const markDone = (fid) => {
    setNewlyDone(p => new Set([...p, fid]));
    setTimeout(() => setNewlyDone(p => { const n = new Set(p); n.delete(fid); return n; }), 2000);
  };

  const handleConfirmar = async (id) => {
    const fid = String(id);
    setConfirmando(id);
    localRef.current.add(fid);
    try {
      await FacturacionService.confirmarPago(id);
      setFacturas(p => p.map(f =>
        String(f.idFacturacion) === fid
          ? { ...f, idEstadoFacturacion:2, resultado:"Confirmado", estadoDescripcion:"Confirmado" }
          : f
      ));
      markDone(fid);
      toast.success("Pago confirmado correctamente");
    } catch {
      toast.error("Error al confirmar el pago");
      localRef.current.delete(fid);
    } finally {
      setConfirmando(null);
      setTimeout(() => localRef.current.delete(fid), 2000);
    }
  };

  const pendientes  = facturas.filter(f => String(f.idEstadoFacturacion) === "1" || f.resultado === "Pendiente");
  const confirmados = facturas.filter(f => String(f.idEstadoFacturacion) === "2" || f.resultado === "Confirmado");

  return (
    <div className="min-h-screen px-4 py-10 relative overflow-hidden"
      style={{ background:"linear-gradient(135deg,#020617 0%,#080d1a 50%,#020617 100%)" }}>

      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[650px] h-[650px] rounded-full"
          style={{ background:"radial-gradient(circle,rgba(250,204,21,.08) 0%,transparent 65%)", transform:"translate(30%,-30%)" }} />
        <div className="absolute bottom-0 left-0 w-[550px] h-[550px] rounded-full"
          style={{ background:"radial-gradient(circle,rgba(52,211,153,.06) 0%,transparent 65%)", transform:"translate(-30%,30%)" }} />
        <div className="absolute inset-0" style={{
          backgroundImage:"linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px)",
          backgroundSize:"72px 72px",
          maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)",
          WebkitMaskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)",
        }} />
      </div>

      <div className="relative z-10 max-w-[1120px] mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="fsu flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center pending-halo"
              style={{ background:"rgba(250,204,21,.1)", border:"1px solid rgba(250,204,21,.25)" }}>
              <CreditCard className="w-7 h-7" style={{ color:"#facc15" }} />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
              style={{ background:"#facc15", boxShadow:"0 0 8px #facc15" }}>
              <div className="w-3 h-3 rounded-full ping-dot absolute" style={{ background:"#facc15" }} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Sparkles className="w-3 h-3" style={{ color:"rgba(250,204,21,.55)" }} />
              <p className="m-0 text-[10px] font-black uppercase tracking-[.25em]" style={{ color:"rgba(255,255,255,.28)" }}>
                {/* ← NUEVO: subtítulo diferente según rol */}
                {isAdmin ? "Todos los pagos" : "Mis pagos"}
              </p>
            </div>
            <h1 className="m-0 text-[28px] font-black tracking-tight leading-none" style={{ color:"#fff" }}>
              Registro de Pagos
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ border:"1px solid rgba(52,211,153,.2)", background:"rgba(52,211,153,.06)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ping-dot flex-shrink-0" />
            <span className="text-[11px] font-bold" style={{ color:"#34d399" }}>En vivo</span>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total pagos"  value={facturas.length}    icon={DollarSign}  delay=""
            color="rgba(255,255,255,.82)" borderC="rgba(255,255,255,.1)"  bgC="rgba(255,255,255,.04)"
            iconBg="rgba(255,255,255,.07)" glowC="rgba(255,255,255,.06)" />
          <StatCard label="Pendientes"   value={pendientes.length}  icon={Clock}       delay="d1"
            color="#facc15"               borderC="rgba(250,204,21,.25)"  bgC="rgba(250,204,21,.07)"
            iconBg="rgba(250,204,21,.12)" glowC="rgba(250,204,21,.18)" />
          <StatCard label="Confirmados"  value={confirmados.length} icon={TrendingUp}  delay="d2"
            color="#34d399"               borderC="rgba(52,211,153,.25)"  bgC="rgba(52,211,153,.07)"
            iconBg="rgba(52,211,153,.12)" glowC="rgba(52,211,153,.18)" />
        </div>

        {/* ── Tabla ── */}
        {loading ? (
          <div className="fsu rounded-3xl overflow-hidden"
            style={{ border:"1px solid rgba(255,255,255,.07)", background:"rgba(8,13,26,.7)" }}>
            <div className="grid px-6 py-3.5 border-b border-white/[0.05] bg-white/[0.02]"
              style={{ gridTemplateColumns:"56px 1fr 1fr 130px 110px 150px", gap:16 }}>
              {["#","Comprador","Subasta","Monto","Fecha","Estado"].map((h,i) => (
                <p key={i} className="m-0 text-[10px] font-black uppercase tracking-[.15em]"
                  style={{ color:"rgba(255,255,255,.2)" }}>{h}</p>
              ))}
            </div>
            {[0,.07,.14,.21].map((d,i) => <SkeletonRow key={i} delay={d} />)}
          </div>

        ) : facturas.length === 0 ? (
          <div className="fsu text-center py-24">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)" }}>
              <CreditCard className="w-9 h-9" style={{ color:"rgba(255,255,255,.15)" }} />
            </div>
            <p className="m-0 text-sm font-semibold mb-2" style={{ color:"rgba(255,255,255,.3)" }}>
              No hay pagos registrados
            </p>
            <p className="m-0 text-xs" style={{ color:"rgba(255,255,255,.15)" }}>
              {isAdmin
                ? "Aún no se han generado pagos en el sistema"
                : "Tus pagos aparecerán aquí cuando ganes una subasta"}
            </p>
          </div>

        ) : (
          <div className="fsu d1 rounded-3xl overflow-hidden"
            style={{ border:"1px solid rgba(255,255,255,.07)", background:"rgba(8,13,26,.75)", backdropFilter:"blur(20px)" }}>

            <div className="grid px-6 py-3.5 border-b border-white/[0.05] bg-white/[0.02]"
              style={{ gridTemplateColumns:"56px 1fr 1fr 130px 110px 150px", gap:16 }}>
              {["#","Comprador","Subasta","Monto","Fecha","Estado / Acción"].map((h,i) => (
                <p key={i} className="m-0 text-[10px] font-black uppercase tracking-[.15em]"
                  style={{ color:"rgba(255,255,255,.22)" }}>{h}</p>
              ))}
            </div>

            <div>
              {facturas.map((f, idx) => {
                const fid         = String(f.idFacturacion);
                const isPendiente = String(f.idEstadoFacturacion) === "1" || f.resultado === "Pendiente";
                const isConf      = confirmando === f.idFacturacion || confirmando === fid;
                const justDone    = newlyDone.has(fid);
                const monto       = Number(f.monto);
                const fecha       = f.fechaFactura ? String(f.fechaFactura).slice(0,16).replace("T"," ") : "—";

                return (
                  <div key={fid}
                    className={`row-enter table-row-hover grid items-center px-6 border-b border-white/[0.04] ${justDone ? "confirmed-sweep" : ""}`}
                    style={{
                      gridTemplateColumns:"56px 1fr 1fr 130px 110px 150px",
                      gap:16, paddingTop:18, paddingBottom:18,
                      opacity: !isPendiente && !justDone ? .55 : 1,
                      transition:"opacity .4s",
                      animationDelay:`${idx * .038}s`,
                    }}
                  >
                    <span className="text-xs font-mono font-bold" style={{ color:"rgba(255,255,255,.2)" }}>#{fid}</span>

                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-[10px] flex-shrink-0 flex items-center justify-center"
                        style={{ background:"rgba(99,102,241,.14)", border:"1px solid rgba(99,102,241,.22)" }}>
                        <User style={{ width:13, height:13, color:"#818cf8" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="m-0 text-[13px] font-bold truncate" style={{ color:"rgba(255,255,255,.82)" }}>{f.usuario?.nombre ?? "—"}</p>
                        <p className="m-0 text-[11px] truncate" style={{ color:"rgba(255,255,255,.25)" }}>{f.usuario?.email ?? ""}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-[10px] flex-shrink-0 flex items-center justify-center"
                        style={{ background:"rgba(139,92,246,.14)", border:"1px solid rgba(139,92,246,.22)" }}>
                        <Gavel style={{ width:13, height:13, color:"#a78bfa" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="m-0 text-[13px] font-bold truncate" style={{ color:"rgba(255,255,255,.82)" }}>
                          {f.subasta?.carta?.nombre ?? `Subasta #${f.idSubasta}`}
                        </p>
                        <p className="m-0 text-[11px]" style={{ color:"rgba(255,255,255,.25)" }}>Subasta #{f.idSubasta}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Trophy style={{ width:14, height:14, color:"rgba(250,204,21,.55)", flexShrink:0 }} />
                      <span className="font-black text-[17px] leading-none"
                        style={{ color:"#facc15", textShadow:"0 0 20px rgba(250,204,21,.4)" }}>
                        ${isNaN(monto) ? "—" : monto.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar style={{ width:11, height:11, color:"rgba(255,255,255,.2)", flexShrink:0 }} />
                      <span className="text-[11px]" style={{ color:"rgba(255,255,255,.3)" }}>{fecha}</span>
                    </div>

                    <div>
                      {/* ← NUEVO: solo Admin puede confirmar pagos */}
                      {isPendiente && isAdmin ? (
                        <button
                          className="btn-confirm flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-black border"
                          style={{
                            background: isConf ? "rgba(52,211,153,.08)" : "rgba(52,211,153,.12)",
                            color:"#34d399", cursor: isConf ? "not-allowed" : "pointer",
                            opacity: isConf ? .7 : 1, whiteSpace:"nowrap",
                            transition:"background .2s, transform .15s",
                          }}
                          disabled={isConf}
                          onClick={() => handleConfirmar(f.idFacturacion)}
                          onMouseEnter={e => { if (!isConf) { e.currentTarget.style.background="rgba(52,211,153,.22)"; e.currentTarget.style.transform="scale(1.04)"; }}}
                          onMouseLeave={e => { e.currentTarget.style.background="rgba(52,211,153,.12)"; e.currentTarget.style.transform="scale(1)"; }}
                        >
                          {isConf ? (
                            <>
                              <span className="spin flex-shrink-0"
                                style={{ width:12, height:12, borderRadius:"50%", display:"inline-block",
                                  border:"2px solid rgba(52,211,153,.3)", borderTopColor:"#34d399" }} />
                              Confirmando…
                            </>
                          ) : (
                            <>
                              <Zap style={{ width:12, height:12, flexShrink:0 }} />
                              Confirmar
                            </>
                          )}
                        </button>
                      ) : (
                        <EstadoBadge estado={f.resultado ?? f.estadoDescripcion} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
