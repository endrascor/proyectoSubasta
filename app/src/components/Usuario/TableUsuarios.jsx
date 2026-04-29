import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Edit, Info, Users, ArrowLeft, Shield, Activity,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import UsuarioService from "@/services/UsuarioService";
import EstadoUsuarioService from "@/services/EstadoUsuarioService";
import { useEffect, useState, useRef } from "react";
import { LoadingGrid }  from "../ui/custom/LoadingGrid";
import { ErrorAlert }   from "../ui/custom/ErrorAlert";
import { EmptyState }   from "../ui/custom/EmptyState";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";


const usuarioColumns = [
  { key: "nombre",   label: "Nombre"   },
  { key: "rol",      label: "Rol"      },
  { key: "estado",   label: "Estado"   },
  { key: "acciones", label: "Acciones" },
  { key: "detalle",  label: "Detalle"  },
];

/* ── Animación de strips por fila ── */
function animateRowStrips(canvas, toBlocked, onMidpoint) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W   = canvas.offsetWidth;
  const H   = canvas.offsetHeight;
  canvas.width  = W;
  canvas.height = H;

  const [r,g,b] = toBlocked ? [249,115,22] : [34,197,94];
  const STRIPS  = 10;
  const stripH  = H / STRIPS;
  const TOTAL   = 550;
  const start   = performance.now();
  let changed   = false;

  const easeOut = (t) => 1 - Math.pow(1-t, 3);
  const easeIn  = (t) => t * t * t;

  const frame = (now) => {
    const t = Math.min((now - start) / TOTAL, 1);
    ctx.clearRect(0, 0, W, H);

    if (t < 0.5) {
      const p = easeOut(t / 0.5);
      for (let i = 0; i < STRIPS; i++) {
        const delay  = (i / STRIPS) * 0.4;
        const localT = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
        const w      = W * localT;
        const y      = i * stripH;

        ctx.fillStyle = `rgba(${r},${g},${b},${localT * 0.75})`;
        ctx.fillRect(0, y, w, stripH + 1);

        if (localT > 0 && localT < 1) {
          const grad = ctx.createLinearGradient(w - 12, y, w, y);
          grad.addColorStop(0, `rgba(255,255,255,0)`);
          grad.addColorStop(1, `rgba(255,255,255,0.7)`);
          ctx.fillStyle = grad;
          ctx.fillRect(w - 12, y, 12, stripH + 1);
        }
      }
      if (p > 0.65 && !changed) { changed = true; onMidpoint(); }

    } else {
      if (!changed) { changed = true; onMidpoint(); }
      const p = easeIn((t - 0.5) / 0.5);
      for (let i = 0; i < STRIPS; i++) {
        const delay  = ((STRIPS - 1 - i) / STRIPS) * 0.4;
        const localT = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
        const w      = W * (1 - localT);
        const y      = i * stripH;

        ctx.fillStyle = `rgba(${r},${g},${b},${(1-localT) * 0.75})`;
        ctx.fillRect(0, y, w, stripH + 1);

        if (localT > 0 && localT < 1 && w > 0) {
          const grad = ctx.createLinearGradient(w - 12, y, w, y);
          grad.addColorStop(0, `rgba(255,255,255,0)`);
          grad.addColorStop(1, `rgba(255,255,255,0.5)`);
          ctx.fillStyle = grad;
          ctx.fillRect(w - 12, y, 12, stripH + 1);
        }
      }
    }

    if (t < 1) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, W, H);
  };

  requestAnimationFrame(frame);
}

export default function TableUsuarios() {
  const { user, authorize } = useUser();
const isAdmin = authorize(["Administrador"]);
  const navigate   = useNavigate();
  const canvasRefs = useRef({});

  const [usuarios, setUsuarios] = useState([]);
  const [estados,  setEstados]  = useState([]);
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [animando, setAnimando] = useState({}); // bloquea botón durante animación

  /* ── Cargar usuarios y estados del backend ── */
  const fetchData = async () => {
    try {
      const [usuRes, estRes] = await Promise.all([
        UsuarioService.getUsuarios(),
        EstadoUsuarioService.getEstadoUsuarios(),
      ]);
      if (usuRes.data.success) {
        setUsuarios(usuRes.data.data ?? []);
      } else {
        setError(usuRes.data.message ?? "Error desconocido");
      }
      setEstados(estRes.data?.data ?? estRes.data ?? []);
    } catch (err) {
      setError(err.message ?? "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ── Busca id de estado por nombre exacto ── */
  const getEstadoId = (descripcion) =>
    estados.find((e) => e.descripcion === descripcion)?.idEstadoUsuario;

  /* ── Toggle Activo ↔ Bloqueado con animación ── */
  const handleToggle = async (usuario) => {
    if (animando[usuario.idUsuario]) return;

    const esActivo  = usuario.estadoUsuario?.descripcion === "Activo";
    const idDestino = esActivo ? getEstadoId("Bloqueado") : getEstadoId("Activo");
    if (!idDestino) { toast.error("Estado no encontrado"); return; }

    setAnimando((prev) => ({ ...prev, [usuario.idUsuario]: true }));

    const canvas    = canvasRefs.current[usuario.idUsuario];
    const toBlocked = esActivo;

    animateRowStrips(canvas, toBlocked, async () => {
      // Llama al backend en el punto medio de la animación
      try {
        await UsuarioService.updateEstadoUsuario({
          idUsuario:       usuario.idUsuario,
          idEstadoUsuario: idDestino,
        });
        toast.success(toBlocked ? `"${usuario.nombre}" bloqueado` : `"${usuario.nombre}" activado`);
        fetchData();
      } catch (err) {
        console.error(err);
        toast.error("Error al cambiar el estado");
      } finally {
        setAnimando((prev) => ({ ...prev, [usuario.idUsuario]: false }));
      }
    });
  };

  if (loading) return <LoadingGrid type="grid" />;
  if (error)   return <ErrorAlert title="Error al cargar usuarios" message={error} />;
  if (usuarios.length === 0)
    return <EmptyState message="No se encontraron usuarios en esta tienda." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0a0f1e] to-[#020617] px-6 py-10">

      {/* Blobs decorativos */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Gestión de{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
                  Usuarios
                </span>
              </h1>
              <p className="text-white/30 text-xs tracking-widest uppercase mt-0.5">
                {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 h-10 px-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/15 text-white/50 hover:text-white/80 rounded-xl text-sm transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Regresar
          </Button>
        </div>

        {/* TABLA */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1424]/80 backdrop-blur-xl shadow-2xl shadow-black/50">

          {/* Barra superior */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

          {/* THEAD */}
          <div className="grid grid-cols-5 px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
            {usuarioColumns.map((col) => (
              <div key={col.key} className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                {col.key === "nombre"   && <Users    className="w-3 h-3" />}
                {col.key === "rol"      && <Shield   className="w-3 h-3" />}
                {col.key === "estado"   && <Activity className="w-3 h-3" />}
                {col.label}
              </div>
            ))}
          </div>

          {/* ROWS */}
          <div className="divide-y divide-white/[0.04]">
            {usuarios.map((usuario, idx) => {
              const esActivo    = usuario.estadoUsuario?.descripcion === "Activo";
              const esBloqueado = usuario.estadoUsuario?.descripcion === "Bloqueado";
              const esInactivo  = usuario.estadoUsuario?.descripcion === "Inactivo";

              return (
                <div
                  key={usuario.idUsuario}
                  className={`
                    grid grid-cols-5 px-6 py-4 items-center
                    hover:bg-white/[0.03] transition-all duration-500 group
                    relative overflow-hidden
                    ${esInactivo  ? "opacity-40 grayscale-[60%]" : ""}
                    ${esBloqueado ? "opacity-55 grayscale-[30%]" : ""}
                  `}
                >
                  {/* Canvas animación strips */}
                  <canvas
                    ref={(el) => { if (el) canvasRefs.current[usuario.idUsuario] = el; }}
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  />
                  {/* Nombre */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl shrink-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-white/60 text-sm font-bold">
                      {usuario.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white/90 text-sm font-semibold leading-tight">
                        {usuario.nombre}
                      </p>
                      <p className="text-white/25 text-[10px] mt-0.5">
                        #{String(idx + 1).padStart(3, "0")}
                      </p>
                    </div>
                  </div>

                  {/* Rol */}
                  <div>
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {usuario.rol.nombre}
                    </span>
                  </div>

                  {/* Estado */}
                  <div>
                    <span className={`
                      flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg text-[11px] font-semibold
                      ${esActivo    ? "bg-green-500/10 text-green-300 border border-green-500/20"
                      : esBloqueado ? "bg-orange-500/10 text-orange-300 border border-orange-500/20"
                      :               "bg-red-500/10 text-red-300 border border-red-500/20"}
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        esActivo    ? "bg-green-400 animate-pulse"
                        : esBloqueado ? "bg-orange-400"
                        :               "bg-red-400"
                      }`} />
                      {usuario.estadoUsuario.descripcion}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1.5">
                    <TooltipProvider>

                      {/* Editar */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon"
                           onClick={() => {
  if (isAdmin || user.idUsuario === usuario.idUsuario) {
    navigate(`/usuario/edit/${usuario.idUsuario}`);
  } else {
    toast.error("No puedes editar otros usuarios");
  }
}}
                            className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-blue-500/20 border border-white/[0.06] hover:border-blue-500/30 text-white/30 hover:text-blue-400 transition-all duration-200">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>

                      {/* Toggle Activo ↔ Bloqueado */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon"
                            onClick={() => handleToggle(usuario)}
                           disabled={
  esInactivo ||
  !!animando[usuario.idUsuario] ||
  user.idUsuario === usuario.idUsuario
}
                            className={`
                              w-8 h-8 rounded-xl border transition-all duration-200
                              disabled:opacity-25 disabled:cursor-not-allowed
                              ${esActivo
                                ? "bg-orange-500/10 hover:bg-orange-500/25 border-orange-500/20 hover:border-orange-500/40 text-orange-400/60 hover:text-orange-400"
                                : "bg-green-500/10 hover:bg-green-500/25 border-green-500/20 hover:border-green-500/40 text-green-400/60 hover:text-green-400"
                              }
                            `}>
                            {esActivo
                              ? <ToggleRight className="w-3.5 h-3.5" />
                              : <ToggleLeft  className="w-3.5 h-3.5" />
                            }
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {esInactivo   ? "Usuario inactivo"
                          : esActivo    ? "Bloquear usuario"
                          :               "Activar usuario"}
                        </TooltipContent>
                      </Tooltip>

                    </TooltipProvider>
                  </div>

                  {/* Detalle */}
                  <div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link to={`/usuario/detail/${usuario.idUsuario}`}>
                            <Button variant="ghost" size="icon"
                              className="w-8 h-8 rounded-xl bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/20 hover:border-yellow-400/40 text-yellow-400/60 hover:text-yellow-400 transition-all duration-200">
                              <Info className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>Ver detalle</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-white/[0.04] bg-white/[0.01] flex items-center justify-between">
            <p className="text-white/20 text-[11px]">
              Mostrando {usuarios.length} resultado{usuarios.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400/10" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
