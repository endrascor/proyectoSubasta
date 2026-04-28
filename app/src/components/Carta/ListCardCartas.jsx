import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Globe, Info, FilmIcon, User, Zap, Sparkles,
  Pencil, Trash2, Gavel, Plus, AlertTriangle, X,
  ToggleLeft, ToggleRight, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import CartaService from "../../services/CartaService";
import EstadoCartaService from "@/services/EstadoCartaService";
import toast from "react-hot-toast";

ListCardCartas.propTypes = {
  data:      PropTypes.array,
  onRefresh: PropTypes.func,
};

/* ── ESTILOS POR TIPO ── */
const getTypeStyles = (categorias) => {
  if (!categorias || categorias.length === 0) {
    return { glow: "hover:shadow-white/40", ring: "group-hover:ring-white/50", badge: "bg-white/20 text-white", gradient: "from-white/10 via-white/5 to-transparent" };
  }
  const tipo = categorias[0].descripcion.toLowerCase();
  switch (tipo) {
    case "electrico":  return { glow: "hover:shadow-yellow-400/80 hover:border-yellow-400/80", ring: "group-hover:ring-yellow-400/70", badge: "bg-yellow-400/20 text-yellow-300", gradient: "from-yellow-400/30 via-yellow-300/10 to-transparent" };
    case "fuego":      return { glow: "hover:shadow-red-500/80 hover:border-red-500/80",       ring: "group-hover:ring-red-500/70",    badge: "bg-red-500/20 text-red-300",       gradient: "from-red-500/30 via-red-400/10 to-transparent"    };
    case "agua":       return { glow: "hover:shadow-blue-500/80 hover:border-blue-500/80",      ring: "group-hover:ring-blue-500/70",   badge: "bg-blue-500/20 text-blue-300",     gradient: "from-blue-500/30 via-blue-400/10 to-transparent"  };
    case "planta":     return { glow: "hover:shadow-green-500/80 hover:border-green-500/80",    ring: "group-hover:ring-green-500/70",  badge: "bg-green-500/20 text-green-300",   gradient: "from-green-500/30 via-green-400/10 to-transparent" };
    case "pokemon":    return { glow: "hover:shadow-purple-400/80 hover:border-purple-400/80",  ring: "group-hover:ring-purple-400/70", badge: "bg-purple-400/20 text-purple-300", gradient: "from-purple-400/30 via-purple-300/10 to-transparent"};
    case "entrenador": return { glow: "hover:shadow-orange-400/80 hover:border-orange-400/80",  ring: "group-hover:ring-orange-400/70", badge: "bg-orange-400/20 text-orange-300", gradient: "from-orange-400/30 via-orange-300/10 to-transparent"};
    case "objeto":     return { glow: "hover:shadow-slate-300/40 hover:border-slate-300/40",    ring: "group-hover:ring-slate-300/40",  badge: "bg-white/20 text-white",           gradient: "from-slate-300/15 via-slate-200/5 to-transparent"  };
    default:           return { glow: "hover:shadow-yellow-400/80",                              ring: "group-hover:ring-yellow-400/70", badge: "bg-yellow-400/20 text-yellow-300", gradient: "from-yellow-400/30 via-yellow-300/10 to-transparent" };
  }
};

/* ══════════════════════════════════════
   MODAL CONFIRMAR ELIMINACIÓN PERMANENTE
══════════════════════════════════════ */
function DeleteModal({ item, estadoEliminado, onClose, onConfirmed }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Usa el idEstadoCarta del estado "eliminado" que viene del backend
      await CartaService.updateEstadoCarta({
        idCarta:       item.idCarta,
        idEstadoCarta: estadoEliminado,
      });
      toast.success(`"${item.nombre}" eliminada permanentemente`);
      onConfirmed();
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar la carta");
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
            <h3 className="text-white font-bold text-lg">Eliminar Carta</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-white/60 text-sm leading-relaxed">
            ¿Eliminar permanentemente la carta{" "}
            <span className="text-white font-semibold">"{item.nombre}"</span>?
          </p>
          <p className="text-red-300/60 text-xs mt-2 font-semibold">
            ⚠ Esta acción no se puede revertir. La carta quedará completamente bloqueada.
          </p>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <Button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 bg-transparent text-white/50 hover:text-white hover:bg-white/5 text-sm">
            Cancelar
          </Button>
          <Button type="button" disabled={loading} onClick={handleDelete}
            className="flex-1 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Trash2 className="w-3.5 h-3.5" />
            }
            {loading ? "Eliminando..." : "Eliminar definitivamente"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Colores de acento por categoría ── */
const ACCENT_COLORS = {
  electrico:  [139, 92,  246],
  fuego:      [239, 68,  68 ],
  agua:       [56,  189, 248],
  planta:     [74,  222, 128],
  pokemon:    [168, 85,  247],
  entrenador: [251, 146, 60 ],
  objeto:     [148, 163, 184],
};

function getAccent(categorias) {
  const tipo = categorias?.[0]?.descripcion?.toLowerCase() ?? "";
  return ACCENT_COLORS[tipo] ?? [148, 163, 184];
}

/* ══════════════════════════════════════
   CARRUSEL TCG
══════════════════════════════════════ */
function CardImageCarousel({ imagenes, nombre, BASE_URL, categorias }) {
  const [current,  setCurrent]  = useState(0);
  const [busy,     setBusy]     = useState(false);
  const canvasRef  = useRef(null);
  const changedRef = useRef(false);
  const total = imagenes?.length ?? 0;

  const easeInOut = (t) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
  const easeIn    = (t) => t*t*t;
  const easeOut   = (t) => 1 - Math.pow(1-t, 3);

  const animate = (nextIndex) => {
    if (busy || nextIndex === current || total <= 1) return;
    setBusy(true);
    changedRef.current = false;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx   = canvas.getContext("2d");
    const W     = canvas.width;
    const H     = canvas.height;
    const [r,g,b] = getAccent(categorias);
    const STRIPS  = 12;
    const stripW  = W / STRIPS;
    const TOTAL   = 700;
    const start   = performance.now();

    const frame = (now) => {
      const t = Math.min((now - start) / TOTAL, 1);
      ctx.clearRect(0, 0, W, H);

      if (t < 0.5) {
        // Entrada: strips diagonales bajan con stagger
        const p = easeInOut(t / 0.5);
        for (let i = 0; i < STRIPS; i++) {
          const delay  = (i / STRIPS) * 0.35;
          const localT = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
          const h      = H * easeOut(localT);
          const x      = i * stripW;
          const alpha  = localT * 0.82;

          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fillRect(x, 0, stripW + 1, h);

          // Línea luminosa en el frente
          if (localT > 0 && localT < 1) {
            const grad = ctx.createLinearGradient(x, h - 10, x, h);
            grad.addColorStop(0, `rgba(255,255,255,0)`);
            grad.addColorStop(1, `rgba(255,255,255,0.55)`);
            ctx.fillStyle = grad;
            ctx.fillRect(x, h - 10, stripW + 1, 10);
          }
        }
        // Cambia imagen cuando el 60% está cubierto
        if (p > 0.6 && !changedRef.current) {
          changedRef.current = true;
          setCurrent(nextIndex);
        }

      } else {
        // Salida: strips se retiran en orden inverso
        if (!changedRef.current) {
          changedRef.current = true;
          setCurrent(nextIndex);
        }
        const p = easeInOut((t - 0.5) / 0.5);
        for (let i = 0; i < STRIPS; i++) {
          const delay  = ((STRIPS - 1 - i) / STRIPS) * 0.35;
          const localT = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
          const h      = H * (1 - easeIn(localT));
          const x      = i * stripW;
          const alpha  = (1 - localT) * 0.82;

          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fillRect(x, 0, stripW + 1, h);

          if (localT > 0 && localT < 1) {
            const grad = ctx.createLinearGradient(x, h - 10, x, h);
            grad.addColorStop(0, `rgba(255,255,255,0)`);
            grad.addColorStop(1, `rgba(255,255,255,0.35)`);
            ctx.fillStyle = grad;
            ctx.fillRect(x, h - 10, stripW + 1, 10);
          }
        }
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, W, H);
        setBusy(false);
      }
    };

    requestAnimationFrame(frame);
  };

  const prev = (e) => {
    e.stopPropagation();
    animate((current - 1 + total) % total);
  };
  const next = (e) => {
    e.stopPropagation();
    animate((current + 1) % total);
  };
  const goToIndex = (e, i) => {
    e.stopPropagation();
    animate(i);
  };

  return (
    <div className="flex justify-center px-4 py-4">
      <div className="relative w-56 h-80 rounded-[14px] overflow-hidden border-[3px] border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-black/50 bg-[#0a0f1e] transition-all duration-300 group-hover:border-white/50 group-hover:shadow-[0_16px_50px_rgba(0,0,0,0.85)]">
        {total > 0 ? (
          <>
            <img
              src={`${BASE_URL}/${imagenes[current].imagen}`}
              alt={`${nombre}-${current}`}
              className="w-full h-full object-cover"
            />

            {/* Canvas animación */}
            <canvas
              ref={canvasRef}
              width={224}
              height={320}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            <div className="absolute top-0 left-0 right-0 h-[25%] bg-gradient-to-b from-white/12 to-transparent pointer-events-none" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-white/10 via-transparent to-white/5 transition-opacity duration-300 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

            {total > 1 && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white border border-white/15 transition-all z-20 opacity-0 group-hover:opacity-100">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white border border-white/15 transition-all z-20 opacity-0 group-hover:opacity-100">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
                  {imagenes.map((_, i) => (
                    <button key={i} onClick={(e) => goToIndex(e, i)}
                      className={`rounded-full transition-all duration-200 ${i === current ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/15">
            <FilmIcon className="w-12 h-12" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════ */
export function ListCardCartas({ data, onRefresh }) {
  const navigate  = useNavigate();
  const BASE_URL  = import.meta.env.VITE_BASE_URL + "uploads";

  const [deleteItem, setDeleteItem] = useState(null);

  // Estados del backend — para no hardcodear ids
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    EstadoCartaService.getEstadoCartas()
      .then((res) => setEstados(res.data?.data ?? res.data ?? []))
      .catch(console.error);
  }, []);

  // Busca el id del estado por descripción — comparación exacta
  const getEstadoId = (descripcion) =>
    estados.find((e) => e.descripcion === descripcion)?.idEstadoCarta;

  // id del estado "Agotada" — viene del backend, sin hardcodear
  const idEliminado = getEstadoId("Agotada");

  // Lógica de estados — usa === para comparación exacta
  const isDisponible = (item) => item.estadoCarta?.descripcion === "Disponible";
  const isInactivo   = (item) => item.estadoCarta?.descripcion === "No Disponible";
  const isEliminado  = (item) => item.estadoCarta?.descripcion === "Agotada";

  // Toggle temporal: Disponible ↔ No Disponible
  const handleToggle = async (item) => {
    const activo    = isDisponible(item);
    const idDestino = activo
      ? getEstadoId("No Disponible")
      : getEstadoId("Disponible");

    if (!idDestino) { toast.error("Estado no encontrado"); return; }

    try {
      await CartaService.updateEstadoCarta({
        idCarta:       item.idCarta,
        idEstadoCarta: idDestino,
      });
      toast.success(activo ? `"${item.nombre}" desactivada` : `"${item.nombre}" activada`);
      onRefresh?.();
    } catch (err) {
      console.error(err);
      toast.error("Error al cambiar el estado");
    }
  };

  const handleDeleteConfirmed = () => {
    setDeleteItem(null);
    onRefresh?.();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a]">
        {/* GRID */}
        <div className="grid gap-8 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {data && data.map((item) => {
            const typeStyles   = getTypeStyles(item.categorias);
            const activo       = isDisponible(item);
            const inactivo     = isInactivo(item);
            const eliminado    = isEliminado(item);
            const tieneSubastaActiva = item.subasta?.some(s => s.idEstadoSubasta === "1") ?? false;

            return (
              <Card key={item.idCarta} className={`
                group relative overflow-hidden
                border border-white/10 bg-white/10
                backdrop-blur-xl shadow-xl
                transition-all duration-300 hover:-translate-y-2 rounded-2xl
                ${eliminado ? "opacity-40 grayscale-[70%]" : inactivo ? "opacity-65 grayscale-[30%]" : ""}
                ${typeStyles.glow}
              `}>
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br ${typeStyles.gradient} pointer-events-none`} />
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none ring-2 ${typeStyles.ring} blur-[2px]`} />

                {/* Badge estado */}
                {eliminado && (
                  <div className="absolute top-3 right-3 z-20 bg-red-800/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Eliminada
                  </div>
                )}
                {inactivo && !eliminado && (
                  <div className="absolute top-3 right-3 z-20 bg-orange-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Inactiva
                  </div>
                )}

                {/* HEADER */}
                <CardHeader className="text-center pb-2 relative z-10">
                  <CardTitle className="text-xl font-bold text-yellow-400 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {item.nombre}
                  </CardTitle>
                  <p className="text-sm text-white/70">{item.condicion.descripcion}</p>
                </CardHeader>

                {/* CARRUSEL */}
                <CardImageCarousel imagenes={item.imagenes} nombre={item.nombre} BASE_URL={BASE_URL} categorias={item.categorias} />

                {/* CONTENT */}
                <CardContent className="space-y-4 pt-4 text-white relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg"><User className="w-4 h-4 text-blue-400" /></div>
                    <div>
                      <p className="text-xs text-white/60">Propietario</p>
                      <p className="font-semibold">{item.propietario.nombre}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-500/20 p-2 rounded-lg"><Zap className="w-4 h-4 text-yellow-400" /></div>
                    <div>
                      <p className="text-xs text-white/60">Categorías</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.categorias?.map((cat, i) => (
                          <span key={i} className={`px-2 py-1 text-xs font-semibold rounded-full ${typeStyles.badge}`}>
                            {cat.descripcion}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-green-500/20 p-2 rounded-lg"><Globe className="w-4 h-4 text-green-400" /></div>
                    <div>
                      <p className="text-xs text-white/60">Disponibilidad</p>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        eliminado ? "bg-red-800/40 text-red-400"
                        : inactivo ? "bg-orange-500/20 text-orange-300"
                        : "bg-green-400/20 text-green-300"
                      }`}>
                        {item.estadoCarta.descripcion}
                      </span>
                    </div>
                  </div>
                </CardContent>

                {/* BOTONES */}
                <div className="flex justify-between items-center border-t border-white/10 p-3 relative z-10 bg-white/5 backdrop-blur-md">
                  <div className="flex gap-2">
                    <TooltipProvider>

                      {/* EDITAR — desactivado si inactivo o eliminado */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon"
                            onClick={() => navigate(`/carta/editar/${item.idCarta}`)}
                            disabled={inactivo || eliminado || tieneSubastaActiva}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-blue-500/80 border border-white/20 text-white/70 hover:text-white shadow hover:scale-110 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white/10">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {eliminado ? "Carta eliminada" 
                          : inactivo ? "Activa la carta para editar" 
                         : tieneSubastaActiva ? "No se puede editar con subasta activa"
                           : "Editar"}
                        </TooltipContent>
                      </Tooltip>

                      {/* ELIMINAR (basura) — permanente, solo si no está eliminada y hay estado disponible */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon"
                            onClick={() => setDeleteItem(item)}
                            disabled={eliminado || !idEliminado}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/80 border border-white/20 text-white/70 hover:text-white shadow hover:scale-110 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white/10">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {eliminado ? "Ya eliminada" : "Eliminar permanentemente"}
                        </TooltipContent>
                      </Tooltip>

                      {/* TOGGLE — solo si no está eliminada */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon"
                            onClick={() => handleToggle(item)}
                            disabled={eliminado}
                            className={`w-8 h-8 rounded-full border shadow hover:scale-110 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:scale-100
                              ${activo
                                ? "bg-orange-500/20 hover:bg-orange-500/80 border-orange-500/40 text-orange-400 hover:text-white"
                                : "bg-green-500/20 hover:bg-green-500/80 border-green-500/40 text-green-400 hover:text-white"
                              }`}>
                            {activo ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {eliminado ? "Carta eliminada" : activo ? "Desactivar temporalmente" : "Activar carta"}
                        </TooltipContent>
                      </Tooltip>
                      {/* SUBASTA — solo si está activa */}
                      <Tooltip>
  <TooltipTrigger asChild>
    <Button
  size="icon"
  onClick={() => navigate("/subasta/create", { state: { carta: item } })}
  disabled={tieneSubastaActiva || eliminado || !activo} 
  className="w-8 h-8 rounded-full bg-white/10 hover:bg-yellow-500/80 border border-white/20 text-white/70 hover:text-white shadow hover:scale-110 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white/10"
>
  <Gavel className="w-3.5 h-3.5" />
</Button>
  </TooltipTrigger>
  <TooltipContent>
  {eliminado
    ? "Carta eliminada"
    : !activo
      ? "Activa la carta para subastar"
      : tieneSubastaActiva
        ? "Esta carta ya tiene una subasta activa"
        : "Crear subasta"}
</TooltipContent>
</Tooltip>

                    </TooltipProvider>
                  </div>

                  {/* DETALLE — solo si no está eliminada */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {eliminado ? (
                          <Button size="icon" disabled
                            className="rounded-full bg-yellow-400/30 text-black/40 shadow-lg cursor-not-allowed opacity-25">
                            <Info className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Link to={`/carta/detail/${item.idCarta}`}>
                            <Button size="icon" className="rounded-full bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg hover:scale-110 transition">
                              <Info className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                      </TooltipTrigger>
                      <TooltipContent>{eliminado ? "Carta eliminada" : "Ver detalle"}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* MODAL ELIMINAR — solo si hay idEliminado del backend */}
      {deleteItem && idEliminado && (
        <DeleteModal
          item={deleteItem}
          estadoEliminado={idEliminado}
          onClose={() => setDeleteItem(null)}
          onConfirmed={handleDeleteConfirmed}
        />
      )}
    </>
  );
}
