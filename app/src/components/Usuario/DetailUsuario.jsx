import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UsuarioService from '../../services/UsuarioService';
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useUser } from "@/hooks/useUser";


import {
  Clock,
  Globe,
  ArrowLeft,
  User,
  Shield,
  Activity,
  Gavel,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';
import { EmptyState } from '../ui/custom/EmptyState';

export function DetailUsuario() {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const { user, authorize } = useUser();
  const [usuario, setData]   = useState(null);
  const [error,   setError]  = useState(null);
  const [loading, setLoading] = useState(true);


  

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const response = await UsuarioService.getUsuarioById(id);
        console.log(response.data);
        setData(response.data);
        if (!response.data.success) {
          setError(response.data.message);
        }
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData(id);
  }, [id]);

  if (loading) return <LoadingGrid count={1} type="grid" />;
  if (error)   return <ErrorAlert title="Error al cargar usuarios" message={error} />;
  if (!usuario || usuario.data.length === 0)
    return <EmptyState message="No se encontraron usuarios." />;

  const u          = usuario.data;
  const isActive   = u.estadoUsuario?.descripcion?.toLowerCase().includes("activ");
  const hasSubastas = Number(u.cantidadSubastas) > 0;
  const hasPujas    = Number(u.cantidadPujas) > 0;
  const esVendedor = u.rol.nombre === "Vendedor";
const esComprador = u.rol.nombre === "Comprador";





  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0a0f1e] to-[#020617] px-6 py-10">

      {/* Blobs decorativos */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">

        {/* BACK */}
        <div className="mb-7">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-white/40 hover:text-white/80 flex items-center gap-2 pl-0 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver al listado</span>
          </Button>
        </div>

        {/* CARD PRINCIPAL */}
        <Card className="
          relative overflow-hidden
          border border-white/[0.07]
          !bg-[#0d1424]/90 backdrop-blur-xl
          rounded-3xl shadow-2xl shadow-black/50
        ">
          {/* Barra superior */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
          {/* Glow interno */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <CardContent className="relative z-10 p-0">

            {/* HERO — avatar + nombre */}
            <div className="flex items-center gap-5 px-8 pt-9 pb-7 border-b border-white/[0.06]">
              <div className="
                w-20 h-20 rounded-2xl shrink-0
                bg-gradient-to-br from-blue-500/20 to-purple-500/20
                border border-white/10
                flex items-center justify-center
                text-4xl font-black text-white/50
                shadow-lg shadow-black/30
              ">
                {u.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black text-white tracking-tight truncate">
                  {u.nombre}
                </h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1.5">
                    <Shield className="w-3 h-3" />
                    {u.rol.nombre}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5
                    ${isActive
                      ? "bg-green-500/10 text-green-300 border border-green-500/20"
                      : "bg-red-500/10 text-red-300 border border-red-500/20"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                    {u.estadoUsuario.descripcion}
                  </span>
                </div>
              </div>
            </div>

            {/* DETALLES */}
            <div className="px-8 py-6 space-y-4">

              {/* Separador label */}
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-4">
                Información general
              </p>

              {/* Nombre */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors duration-200">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Nombre</p>
                  <p className="text-white/80 text-sm font-medium mt-0.5">{u.nombre}</p>
                </div>
              </div>

              {/* Rol */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors duration-200">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Rol</p>
                  <p className="text-white/80 text-sm font-medium mt-0.5">{u.rol.nombre}</p>
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors duration-200">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isActive ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                  <Activity className={`w-4 h-4 ${isActive ? "text-green-400" : "text-red-400"}`} />
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Estado</p>
                  <p className="text-white/80 text-sm font-medium mt-0.5">{u.estadoUsuario.descripcion}</p>
                </div>
              </div>

              {/* Fecha de registro */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors duration-200">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Fecha de Registro</p>
                  <p className="text-white/80 text-sm font-medium mt-0.5">{u.fechaRegistro}</p>
                </div>
              </div>

              {/* Stats condicionales */}
              {(hasSubastas || hasPujas) && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 pt-2">
                    Actividad
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {hasSubastas && (
                      <div className="p-4 rounded-2xl bg-yellow-400/[0.04] border border-yellow-400/10 hover:bg-yellow-400/[0.07] transition-colors duration-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Gavel className="w-4 h-4 text-yellow-400" />
                          <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Subastas</p>
                        </div>
                        <p className="text-3xl font-black text-yellow-400">{u.cantidadSubastas}</p>
                        <p className="text-[10px] text-white/25 mt-1">creadas</p>
                      </div>
                    )}

                    {hasPujas && (
                      <div className="p-4 rounded-2xl bg-blue-500/[0.04] border border-blue-500/10 hover:bg-blue-500/[0.07] transition-colors duration-200">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                          <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Pujas</p>
                        </div>
                        <p className="text-3xl font-black text-blue-400">{u.cantidadPujas}</p>
                        <p className="text-[10px] text-white/25 mt-1">realizadas</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          </CardContent>
        </Card>
{/* BOTÓN HISTORIAL */}
{(esVendedor || esComprador) && (
  <div className="px-8 pt-6">
    <Button
      onClick={() => {
        if (esVendedor) {
          navigate(`/usuario/${id}/subastas`);
        } else {
          navigate(`/usuario/${id}/pujas`);
        }
      }}
      className="
        w-full rounded-2xl h-11
        bg-gradient-to-r from-purple-500 to-blue-500
        hover:from-purple-400 hover:to-blue-400
        text-white font-semibold text-sm
        shadow-lg shadow-purple-500/20
      "
    >
      {esVendedor ? "Ver mis subastas" : "Ver mis pujas"}
    </Button>
  </div>
)}
      </div>
    </div>
    
  );
}
