import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";


import { useUser } from "@/hooks/useUser";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Save, ArrowLeft, User, Mail, UserCog } from "lucide-react";

import UsuarioService from "../../services/UsuarioService";

export function UpdateUsuario() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const { user, authorize } = useUser();
  const [error, setError] = useState("");

  /* ── Validación ── */
  const usuarioSchema = yup.object({
    nombre: yup.string().required("El nombre es requerido"),
    email:  yup.string().email("Ingrese un correo válido").required("El correo es requerido"),
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { nombre: "", email: "" },
    resolver: yupResolver(usuarioSchema),
  });

  /* ── Cargar datos ── */
useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await UsuarioService.getUsuarioById(id);

      if (res.data) {
        const u = res.data.data;
        reset({ nombre: u.nombre, email: u.email });
      }
    } catch (err) {
      console.error(err);
      setError("Error cargando datos");
    }
  };

  fetchData();
}, [id, reset]);

  /* ── Submit ── */
  const onSubmit = async (dataForm) => {
    try {
      const usuario = { idUsuario: id, ...dataForm };
      const response = await UsuarioService.updateUsuario(usuario);
      if (response.data) {
        toast.success("Usuario actualizado correctamente", { duration: 3000 });
        navigate("/usuario/table");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar usuario");
    }
  };

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0a0f1e] to-[#020617] flex flex-col items-center py-10 px-4">

      {/* Blobs decorativos */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* BACK */}
      <div className="w-full max-w-lg mb-6 relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-white/40 hover:text-white/80 flex items-center gap-2 pl-0 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al listado</span>
        </Button>
      </div>

      {/* CARD */}
      <Card className="
        w-full max-w-lg relative overflow-hidden
        border border-white/[0.07]
        !bg-[#0d1424]/90 backdrop-blur-xl
        rounded-3xl shadow-2xl shadow-black/50
        transition-all duration-500
      ">
        {/* Barra superior */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
        {/* Glow interno */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER */}
        <CardHeader className="relative z-10 text-center pb-0 pt-10 !bg-transparent">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <UserCog className="w-5 h-5 text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-black text-white tracking-tight">
              Actualizar <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">Usuario</span>
            </CardTitle>
          </div>
          <p className="text-xs text-white/30 tracking-widest uppercase">
            Modifica los datos del usuario
          </p>

          {/* Separador decorativo */}
          <div className="flex items-center gap-3 mt-6 px-7">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400/40" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
          </div>
        </CardHeader>

        <CardContent className="relative z-10 px-8 pb-9 pt-6 !bg-transparent">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* NOMBRE */}
            <div className="space-y-2">
              <Label className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <User className="w-3 h-3 text-blue-400" />
                Nombre <span className="text-red-400">*</span>
              </Label>
              <Controller
                name="nombre"
                control={control}
                render={({ field }) => (
                  <div className="relative group">
                    <Input
                      {...field}
                      placeholder="Nombre completo"
                      className="
                        !bg-white/[0.03] border-white/[0.08] !text-white
                        placeholder:text-white/15
                        focus:border-blue-400/40 focus:!ring-0
                        focus:!bg-white/[0.05]
                        rounded-2xl h-12 text-sm px-4
                        transition-all duration-300
                        group-hover:border-white/15
                      "
                    />
                    <div className="absolute inset-0 rounded-2xl group-focus-within:bg-blue-400/[0.03] pointer-events-none transition-all duration-500" />
                  </div>
                )}
              />
              {errors.nombre && (
                <p className="text-red-400/80 text-[11px] flex items-center gap-1.5 pl-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                  {errors.nombre.message}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <Label className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <Mail className="w-3 h-3 text-purple-400" />
                Email <span className="text-red-400">*</span>
              </Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <div className="relative group">
                    <Input
                      {...field}
                      placeholder="correo@ejemplo.com"
                      className="
                        !bg-white/[0.03] border-white/[0.08] !text-white
                        placeholder:text-white/15
                        focus:border-purple-400/40 focus:!ring-0
                        focus:!bg-white/[0.05]
                        rounded-2xl h-12 text-sm px-4
                        transition-all duration-300
                        group-hover:border-white/15
                      "
                    />
                    <div className="absolute inset-0 rounded-2xl group-focus-within:bg-purple-400/[0.03] pointer-events-none transition-all duration-500" />
                  </div>
                )}
              />
              {errors.email && (
                <p className="text-red-400/80 text-[11px] flex items-center gap-1.5 pl-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Separador */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.06]" />
              <div className="w-1 h-1 rounded-full bg-white/10" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.06]" />
            </div>

            {/* BOTONES */}
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                onClick={() => navigate(-1)}
                className="
                  flex-1 rounded-2xl h-12
                  bg-white/[0.03] hover:bg-white/[0.07]
                  border border-white/[0.07] hover:border-white/10
                  text-white/40 hover:text-white/70
                  text-sm transition-all duration-200
                  flex items-center justify-center gap-2
                "
              >
                <ArrowLeft className="w-4 h-4" />
                Regresar
              </Button>

              <Button
                type="submit"
                className="
                  flex-1 rounded-2xl h-12
                  bg-gradient-to-r from-blue-500 to-blue-400
                  hover:from-blue-400 hover:to-blue-300
                  text-white font-bold text-sm
                  shadow-lg shadow-blue-500/25
                  hover:shadow-blue-500/40 hover:scale-[1.02]
                  transition-all duration-200
                  flex items-center justify-center gap-2
                  disabled:opacity-60 disabled:scale-100
                "
              >
                <Save className="w-4 h-4" />
                Actualizar
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
