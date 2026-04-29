import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Globe, Info, FilmIcon, Zap, Sparkles, Clock,
  Pencil, Trash2, X, AlertTriangle, Gavel, User,
  TrendingUp, Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import SubastaService from "@/services/SubastaService";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";

/* ══════════════════════════════════════
   BADGE ESTADO
══════════════════════════════════════ */
function EstadoBadge({ descripcion }) {
  const styles = {
    Activa:     "bg-green-500/20 text-green-300 border-green-500/40",
    Finalizada: "bg-red-500/20 text-red-300 border-red-500/40",
    Cancelada:  "bg-orange-500/20 text-orange-300 border-orange-500/40",
    Pausada:    "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[descripcion] ?? "bg-white/10 text-white/60 border-white/20"}`}>
      {descripcion}
    </span>
  );
}
EstadoBadge.propTypes = { descripcion: PropTypes.string };

/* ══════════════════════════════════════
   MODAL CANCELAR
══════════════════════════════════════ */
function DeleteModalSubasta({ item, onClose, onConfirmed }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await SubastaService.delete({
        idSubasta: item.idSubasta, idEstadoSubasta: 3,
      });
      if (response?.data?.success) {
        toast.success(`Subasta #${item.idSubasta} cancelada correctamente`);
        onConfirmed();
      } else {
        toast.error(response?.data?.message || "No se pudo cancelar");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al cancelar la subasta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-[#0d1424]/95 border border-red-500/20 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="text-white font-bold text-lg">Cancelar Subasta</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-white/60 text-sm leading-relaxed">
            ¿Deseas cancelar la <span className="text-white font-semibold">Subasta #{item.idSubasta}</span>?
          </p>
          <p className="text-white/35 text-xs mt-2">
            El estado cambiará a <span className="text-red-300 font-semibold">Cancelada</span>.
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <Button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 bg-transparent text-white/50 hover:text-white hover:bg-white/5 text-sm">
            Volver
          </Button>
          <Button type="button" disabled={loading} onClick={handleDelete}
            className="flex-1 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Trash2 className="w-4 h-4" />}
            {loading ? "Cancelando..." : "Cancelar Subasta"}
          </Button>
        </div>
      </div>
    </div>
  );
}
DeleteModalSubasta.propTypes = {
  item: PropTypes.shape({ idSubasta: PropTypes.number }),
  onClose: PropTypes.func, onConfirmed: PropTypes.func,
};

/* ══════════════════════════════════════
   IMAGEN CARTA TCG
══════════════════════════════════════ */
function CartaImageTCG({ carta, BASE_URL }) {
  if (!carta?.imagenes?.length) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/15">
        <FilmIcon className="w-12 h-12" />
      </div>
    );
  }
  return (
    <img
      src={`${BASE_URL}/${carta.imagenes[0].imagen}`}
      alt={carta.nombre}
      className="w-full h-full object-cover"
    />
  );
}
CartaImageTCG.propTypes = {
  carta: PropTypes.shape({ nombre: PropTypes.string, imagenes: PropTypes.array }),
  BASE_URL: PropTypes.string,
};

/* ══════════════════════════════════════
   SWITCH — mismo estilo visual que el Header
══════════════════════════════════════ */
function MisSubastasSwitch({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "7px 14px", borderRadius: 10,
        background: value ? "rgba(255,204,0,.13)" : "rgba(255,255,255,.05)",
        border: `1px solid ${value ? "rgba(255,204,0,.45)" : "rgba(255,255,255,.12)"}`,
        cursor: "pointer", transition: "all .18s",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        color: value ? "#ffcc00" : "rgba(255,255,255,.5)",
        fontSize: 13, fontWeight: 600,
        whiteSpace: "nowrap",
      }}
      onMouseEnter={e => {
        if (!value) {
          e.currentTarget.style.borderColor = "rgba(255,204,0,.3)";
          e.currentTarget.style.color = "rgba(255,255,255,.8)";
        }
      }}
      onMouseLeave={e => {
        if (!value) {
          e.currentTarget.style.borderColor = "rgba(255,255,255,.12)";
          e.currentTarget.style.color = "rgba(255,255,255,.5)";
        }
      }}
    >
      {/* Toggle pill */}
      <span style={{
        position: "relative", display: "inline-block",
        width: 32, height: 18, borderRadius: 999,
        background: value ? "rgba(255,204,0,.3)" : "rgba(255,255,255,.1)",
        border: `1px solid ${value ? "rgba(255,204,0,.5)" : "rgba(255,255,255,.15)"}`,
        transition: "all .2s", flexShrink: 0,
      }}>
        <span style={{
          position: "absolute", top: 2,
          left: value ? 14 : 2,
          width: 12, height: 12, borderRadius: "50%",
          background: value ? "#ffcc00" : "rgba(255,255,255,.4)",
          transition: "left .2s, background .2s",
          boxShadow: value ? "0 0 6px rgba(255,204,0,.6)" : "none",
        }}/>
      </span>
      <Star style={{ width: 12, height: 12 }} />
      Mis subastas
    </button>
  );
}
MisSubastasSwitch.propTypes = { value: PropTypes.bool, onChange: PropTypes.func };

/* ══════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════ */
export function ListCardSubastasActivas({ data, onRefresh, currentUser }) {
  const BASE_URL   = import.meta.env.VITE_BASE_URL + "uploads";
  const navigate   = useNavigate();
  const { authorize } = useUser();

  const isAdmin    = authorize(["Administrador"]);
  const isVendedor = authorize(["Vendedor"]);

  // Switch "solo mis subastas" — solo visible para Vendedor
  const [soloMias, setSoloMias] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const isInactive = (item) => {
    const desc = item.estadoSubasta?.descripcion?.toLowerCase();
    return desc === "cancelada" || desc === "finalizada";
  };

  // ── Ordenar: propias primero, luego el resto ──
  // ── Filtrar si soloMias está activo ──
  const dataOrdenada = useMemo(() => {
    if (!data) return [];

    const esMia = (item) =>
      String(item.creador?.idUsuario ?? item.idUsuario) === String(currentUser?.idUsuario);

    let lista = [...data];

    // Filtrar si el switch está activo
    if (soloMias && isVendedor) {
      lista = lista.filter(esMia);
    } else {
      // Ordenar: propias al frente
      lista.sort((a, b) => {
        const aMia = esMia(a) ? 0 : 1;
        const bMia = esMia(b) ? 0 : 1;
        return aMia - bMia;
      });
    }

    return lista;
  }, [data, soloMias, currentUser?.idUsuario, isVendedor]);

  const handleDeleteConfirmed = () => {
    setDeleteItem(null);
    onRefresh?.();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a]">

        {/* ── HEADER con switch ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
          padding: "24px 24px 8px",
        }}>
          <h1 style={{
            margin: 0, display: "flex", alignItems: "center", gap: 8,
            fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,.9)",
            fontFamily: "'DM Sans','Segoe UI',sans-serif", letterSpacing: ".01em",
          }}>
            <Gavel style={{ width: 20, height: 20, color: "#facc15" }} />
            Subastas
            {soloMias && isVendedor && (
              <span style={{
                fontSize: 11, padding: "2px 10px", borderRadius: 20,
                background: "rgba(255,204,0,.12)", color: "#ffcc00",
                border: "1px solid rgba(255,204,0,.3)",
                fontWeight: 700, letterSpacing: ".06em",
              }}>
                MIS SUBASTAS
              </span>
            )}
          </h1>

          {/* Switch solo para Vendedor */}
          {isVendedor && (
            <MisSubastasSwitch value={soloMias} onChange={setSoloMias} />
          )}
        </div>

        {/* ── Sin resultados tras filtrar ── */}
        {dataOrdenada.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            color: "rgba(255,255,255,.25)", fontSize: 14,
            fontFamily: "'DM Sans',sans-serif",
          }}>
            {soloMias ? "No tienes subastas activas." : "No hay subastas activas."}
          </div>
        )}

        {/* ── GRID ── */}
        <div className="grid gap-8 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {dataOrdenada.map((item) => {
            const inactive   = isInactive(item);
            const tienePujas = Number(item.cantidadPujas) > 0;

            // ¿Es esta subasta del usuario actual?
            const esDueno =
              String(item.creador?.idUsuario ?? item.idUsuario) === String(currentUser?.idUsuario);

            // Puede editar/cancelar: Admin siempre, Vendedor solo las suyas
            const puedeGestionar = isAdmin || (isVendedor && esDueno);

            return (
              <Card
                key={item.idSubasta}
                className={`
                  group relative overflow-hidden
                  border border-white/10 bg-white/10
                  backdrop-blur-xl shadow-xl
                  transition-all duration-300 hover:-translate-y-2 rounded-2xl
                  ${inactive
                    ? "opacity-60 grayscale-[30%]"
                    : "hover:shadow-yellow-400/40 hover:border-yellow-400/40"
                  }
                `}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-yellow-400/15 via-yellow-300/5 to-transparent pointer-events-none" />
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none ring-2 ring-yellow-400/30 blur-[2px]" />

                {/* Badge "Mi subasta" — solo si es del vendedor logueado */}
                {esDueno && isVendedor && (
                  <div className="absolute top-3 left-3 z-20 flex gap-1.5">
                    <EstadoBadge descripcion={item.estadoSubasta?.descripcion} />
                    <span style={{
                      padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
                      background: "rgba(255,204,0,.18)", color: "#ffcc00",
                      border: "1px solid rgba(255,204,0,.4)",
                    }}>
                      ★ Mía
                    </span>
                  </div>
                )}
                {(!esDueno || !isVendedor) && (
                  <div className="absolute top-3 left-3 z-20">
                    <EstadoBadge descripcion={item.estadoSubasta?.descripcion} />
                  </div>
                )}

                {/* ID */}
                <div className="absolute top-3 right-3 z-20 bg-black/50 text-white/50 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                  #{item.idSubasta}
                </div>

                {/* HEADER */}
                <CardHeader className="text-center pb-2 pt-10 relative z-10">
                  <CardTitle className="text-xl font-bold text-yellow-400 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {item.carta?.nombre ?? `Subasta #${item.idSubasta}`}
                  </CardTitle>
                </CardHeader>

                {/* IMAGEN */}
                <div className="flex justify-center px-4 py-3">
                  <div className="relative w-44 h-64 rounded-[14px] overflow-hidden border-[3px] border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-black/50 bg-[#0a0f1e] transition-all duration-300 group-hover:border-white/50 group-hover:shadow-[0_16px_50px_rgba(0,0,0,0.85)]">
                    <CartaImageTCG carta={item.carta} BASE_URL={BASE_URL} />
                    <div className="absolute top-0 left-0 right-0 h-[25%] bg-gradient-to-b from-white/12 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-white/10 via-transparent to-white/5 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                {/* CONTENT */}
                <CardContent className="space-y-3 pt-2 pb-4 text-white relative z-10 px-5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/[0.04] rounded-xl px-3 py-2 border border-white/8">
                      <p className="text-white/40 text-[10px] uppercase tracking-widest">Precio base</p>
                      <p className="text-yellow-400 font-bold text-sm">${item.precio}</p>
                    </div>
                    <div className="bg-white/[0.04] rounded-xl px-3 py-2 border border-white/8">
                      <p className="text-white/40 text-[10px] uppercase tracking-widest">Incremento</p>
                      <p className="text-green-400 font-bold text-sm">${item.incrementoMin}</p>
                    </div>
                  </div>

                  <div className="bg-white/[0.04] rounded-xl px-3 py-2 border border-white/8 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest">Pujas totales</p>
                      <p className="text-white font-semibold text-sm">{item.cantidadPujas}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-xs text-white/50">
                      <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      Inicio: <span className="text-white/70">{item.fechaInicio}</span>
                    </p>
                    <p className="flex items-center gap-2 text-xs text-white/50">
                      <Globe className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      Cierre: <span className="text-white/70">{item.fechaCierre}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    Creador: <span className="text-white/70 font-semibold">{item.creador?.nombre ?? "—"}</span>
                  </div>

                  {item.carta?.categorias?.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      {item.carta.categorias.map((cat, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-yellow-400/15 text-yellow-300 border border-yellow-400/20">
                          {cat.descripcion}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>

                {/* BOTONES */}
                <div className="flex justify-between items-center border-t border-white/10 p-3 relative z-10 bg-white/5 backdrop-blur-md">

                  <div className="flex gap-2">
                    {puedeGestionar && (
                      <TooltipProvider>
                        {/* EDITAR */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon"
                              onClick={() => navigate(`/subasta/edit/${item.idSubasta}`)}
                              disabled={inactive || tienePujas}
                              className="w-8 h-8 rounded-full bg-white/10 hover:bg-blue-500/80 border border-white/20 text-white/70 hover:text-white shadow hover:scale-110 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white/10">
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {inactive ? "Reactiva para editar"
                              : tienePujas ? "No se puede editar con pujas activas"
                              : "Editar"}
                          </TooltipContent>
                        </Tooltip>

                        {/* CANCELAR */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon"
                              onClick={() => setDeleteItem(item)}
                              disabled={inactive || tienePujas}
                              className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/80 border border-white/20 text-white/70 hover:text-white shadow hover:scale-110 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white/10">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {inactive ? "Ya está cancelada"
                              : tienePujas ? "No se puede cancelar con pujas activas"
                              : "Cancelar subasta"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  {/* INFO — siempre visible */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to={`/subasta/detail/${item.idSubasta}`}>
                          <Button size="icon" className="rounded-full bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg hover:scale-110 transition">
                            <Info className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>Ver detalles y pujar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* MODAL CANCELAR */}
      {deleteItem && (
        <DeleteModalSubasta
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirmed={handleDeleteConfirmed}
        />
      )}
    </>
  );
}

ListCardSubastasActivas.propTypes = {
  data:        PropTypes.array,
  onRefresh:   PropTypes.func,
  currentUser: PropTypes.object,
};
