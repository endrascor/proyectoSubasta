import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Globe,
  Info,
  FilmIcon,
  Zap,
  Sparkles,
  Clock,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Gavel,
  User,
  TrendingUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import SubastaService from "@/services/SubastaService";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser"; // ← NUEVO

/* ══════════════════════════════════════
   BADGE DE ESTADO
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
   MODAL CONFIRMAR CANCELAR
══════════════════════════════════════ */
function DeleteModalSubasta({ item, onClose, onConfirmed }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await SubastaService.delete({
        idSubasta:       item.idSubasta,
        idEstadoSubasta: 3,
      });
      if (response?.data?.success) {
        toast.success(`Subasta #${item.idSubasta} cancelada correctamente`);
        onConfirmed();
      } else {
        toast.error(response?.data?.message || "No se pudo cancelar la subasta");
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
              : <Trash2 className="w-4 h-4" />
            }
            {loading ? "Cancelando..." : "Cancelar Subasta"}
          </Button>
        </div>
      </div>
    </div>
  );
}
DeleteModalSubasta.propTypes = {
  item:        PropTypes.shape({ idSubasta: PropTypes.number }),
  onClose:     PropTypes.func,
  onConfirmed: PropTypes.func,
};

/* ══════════════════════════════════════
   IMAGEN CARTA — estilo TCG
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
  carta:    PropTypes.shape({ nombre: PropTypes.string, imagenes: PropTypes.array }),
  BASE_URL: PropTypes.string,
};

/* ══════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════ */
export function ListCardSubastasActivas({ data, onRefresh }) {
  const BASE_URL = import.meta.env.VITE_BASE_URL + "uploads";
  const navigate = useNavigate();

  // ← NUEVO: obtener rol del usuario logueado
  const { authorize } = useUser();
  const puedeGestionar = authorize(["Administrador", "Vendedor"]);

  const [deleteItem, setDeleteItem] = useState(null);

  const isInactive = (item) => {
    const desc = item.estadoSubasta?.descripcion?.toLowerCase();
    return desc === "cancelada" || desc === "finalizada";
  };

  const handleDeleteConfirmed = () => {
    setDeleteItem(null);
    onRefresh?.();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a]">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h1 className="text-2xl font-bold text-white/90 tracking-tight flex items-center gap-2">
            <Gavel className="w-5 h-5 text-yellow-400" />
            Subastas
          </h1>
        </div>

        {/* GRID */}
        <div className="grid gap-8 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {data && data.map((item) => {
            const inactive   = isInactive(item);
            const tienePujas = Number(item.cantidadPujas) > 0;

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
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-yellow-400/15 via-yellow-300/5 to-transparent pointer-events-none" />
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none ring-2 ring-yellow-400/30 blur-[2px]" />

                {/* Badge estado */}
                <div className="absolute top-3 left-3 z-20">
                  <EstadoBadge descripcion={item.estadoSubasta?.descripcion} />
                </div>

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

                  {/* ← NUEVO: botones editar/cancelar solo para Admin y Vendedor */}
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

                  {/* DETALLE — siempre visible para todos */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to={`/subasta/detail/${item.idSubasta}`}>
                          <Button size="icon" className="rounded-full bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg hover:scale-110 transition">
                            <Info className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>Realizar puja y ver detalles</TooltipContent>
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
  data:      PropTypes.array,
  onRefresh: PropTypes.func,
};
