import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sparkles, ImagePlus, X, Save, ArrowLeft,
  Zap, BadgeCheck, FileText,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CartaService from "../../services/CartaService";
import CategoriasService from "@/services/CategoriasService";
import CondicionService from "../../services/CondicionService";
import EstadoCartaService from "@/services/EstadoCartaService";
import ImageService from "../../services/ImageService";
import toast from "react-hot-toast";
import { categoriaStyles, categoriaGlow } from "../../utils/categoriaColors";
import { useUser } from "@/hooks/useUser";

export default function CreateCarta() {
  const navigate = useNavigate();

  const [categorias,  setCategorias]  = useState([]);
  const [condiciones, setCondiciones] = useState([]);
  const [estados,     setEstados]     = useState([]);

  const [files,    setFiles]    = useState([]);
  const [fileURLs, setFileURLs] = useState([]);
const { user } = useUser();
  const [form, setForm] = useState({
    nombre:        "",
    descripcion:   "",
    idCondicion:   "",
    idEstadoCarta: "",
    categorias:    [],
    idUsuario:     user?.idUsuario,
  });

  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const handleBlur = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let msg = "";
    if (field === "nombre"      && !(value ?? "").trim())        msg = "Nombre requerido";
    if (field === "idCondicion" && !value)                       msg = "Selecciona una condición";
    if (field === "descripcion" && !(value ?? "").trim())        msg = "Agrega una descripción";
    if (field === "descripcion" && (value ?? "").trim().length > 0 && (value ?? "").trim().length < 20)
                                                                 msg = "La descripción debe tener al menos 20 caracteres";
    setErrors((prev) => ({ ...prev, [field]: msg }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      let msg = "";
      if (field === "nombre"      && !(value ?? "").trim())        msg = "Nombre requerido";
      if (field === "idCondicion" && !value)                       msg = "Selecciona una condición";
      if (field === "descripcion" && !(value ?? "").trim())        msg = "Agrega una descripción";
      if (field === "descripcion" && (value ?? "").trim().length > 0 && (value ?? "").trim().length < 20)
                                                                   msg = "La descripción debe tener al menos 20 caracteres";
      setErrors((prev) => ({ ...prev, [field]: msg }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, condRes, estRes] = await Promise.all([
          CategoriasService.getCategorias(),
          CondicionService.getCondiciones(),
          EstadoCartaService.getEstadoCartas(),
        ]);
        setCategorias(catRes.data?.data   ?? catRes.data  ?? []);
        setCondiciones(condRes.data?.data ?? condRes.data ?? []);
        const estadosList = estRes.data?.data ?? estRes.data ?? [];
        setEstados(estadosList);
        const disponible = estadosList.find((e) => e.descripcion === "Disponible");
        if (disponible) {
          setForm((prev) => ({ ...prev, idEstadoCarta: disponible.idEstadoCarta }));
        }
      } catch {
        toast.error("Error cargando datos del formulario");
      }
    };
    fetchData();
  }, []);

  // Glow dinámico según primera categoría seleccionada
  const firstCat  = categorias.find((c) => form.categorias.includes(c.idCategoria));
  const glowData  = firstCat ? (categoriaGlow[firstCat.descripcion] ?? null) : null;
  const glowClass = glowData ? glowData.border : "border-white/[0.07]";

  const toggleCategoria = (idCategoria) =>
    setForm((prev) => {
      const nuevas = prev.categorias.includes(idCategoria)
        ? prev.categorias.filter((c) => c !== idCategoria)
        : [...prev.categorias, idCategoria];
      setErrors((e) => ({ ...e, categorias: nuevas.length === 0 ? "Selecciona al menos una categoría" : "" }));
      return { ...prev, categorias: nuevas };
    });

  const handleChangeImage = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const previews      = selectedFiles.map((f) => URL.createObjectURL(f));
    setFiles((prev)    => [...prev, ...selectedFiles]);
    setFileURLs((prev) => [...prev, ...previews]);
    setErrors((err) => ({ ...err, imagenes: "" }));
  };

  const removeImage = (index) => {
    setFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) setErrors((e) => ({ ...e, imagenes: "Agrega al menos una imagen" }));
      return updated;
    });
    setFileURLs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.nombre)                                 newErrors.nombre      = "Nombre requerido";
    if (!form.idCondicion)                            newErrors.idCondicion = "Selecciona condición";
    if (!form.descripcion?.trim())                    newErrors.descripcion = "Agrega una descripción";
    else if (form.descripcion.trim().length < 20)     newErrors.descripcion = "La descripción debe tener al menos 20 caracteres";
    if (form.categorias.length === 0)                 newErrors.categorias  = "Selecciona al menos una categoría";
    if (files.length === 0)                           newErrors.imagenes    = "Agrega al menos una imagen";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await CartaService.createCarta({
        nombre:        form.nombre,
        descripcion:   form.descripcion,
        idCondicion:   Number(form.idCondicion),
        idEstadoCarta: Number(form.idEstadoCarta),
        idUsuario:     Number(form.idUsuario),
        categorias:    form.categorias.map(Number),
      });

      const idCarta = response.data?.data?.idCarta ?? response.data?.idCarta;

      if (idCarta) {
        for (const file of files) {
          const formData = new FormData();
          formData.append("file",    file);
          formData.append("idCarta", idCarta);
          await ImageService.createImage(formData);
        }
      }

      toast.success("Carta creada correctamente");
      navigate("/carta");
    } catch (err) {
      console.error(err);
      toast.error("Error al crear la carta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0a0f1e] to-[#020617] flex flex-col items-center py-10 px-4">

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl mb-6 relative z-10">
        <Link to="/carta">
          <Button variant="ghost" className="text-white/40 hover:text-white/80 flex items-center gap-2 pl-0 transition-all duration-200">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver al listado</span>
          </Button>
        </Link>
      </div>

      <Card className={`w-full max-w-2xl relative overflow-hidden border !bg-[#0d1424]/95 backdrop-blur-xl rounded-3xl transition-all duration-700 shadow-2xl ${glowClass}`}>

        <div className="absolute top-0 left-0 right-0 h-[2px]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
        </div>
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="relative z-10 text-center pb-0 pt-10 !bg-transparent">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <CardTitle className="text-3xl font-black text-white tracking-tight">
              Nueva <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">Carta</span>
            </CardTitle>
          </div>
          <p className="text-xs text-white/30 tracking-widest uppercase">Registra tu carta en el sistema</p>
          <div className="flex items-center gap-3 mt-6 px-7">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/40" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6 px-8 pb-9 pt-6 !bg-transparent">

          {/* NOMBRE */}
          <div className="space-y-2">
            <Label className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <BadgeCheck className="w-3 h-3 text-yellow-400" />
              Nombre <span className="text-red-400">*</span>
            </Label>
            <Input
              placeholder="Ej. Charizard Holográfico Edición Especial"
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              onBlur={(e)   => handleBlur("nombre", e.target.value)}
              className="!bg-white/[0.03] border-white/[0.08] !text-white placeholder:text-white/15 focus:border-yellow-400/40 focus:!ring-0 rounded-2xl h-12 text-sm px-4 transition-all duration-300"
            />
            {errors.nombre && <p className="text-red-400/80 text-[11px] flex items-center gap-1.5 pl-1"><span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />{errors.nombre}</p>}
          </div>

          {/* CONDICIÓN */}
          <div className="space-y-2">
            <Label className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <BadgeCheck className="w-3 h-3 text-blue-400" />
              Condición <span className="text-red-400">*</span>
            </Label>
            <select
              value={form.idCondicion || ""}
              onChange={(e) => handleChange("idCondicion", e.target.value ? Number(e.target.value) : "")}
              onBlur={(e)   => handleBlur("idCondicion", e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] text-white rounded-2xl h-12 px-4 text-sm focus:outline-none focus:border-blue-400/40 hover:border-white/15 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#0c1320] text-white/50">Selecciona...</option>
              {condiciones.map((c) => (
                <option key={c.idCondicion} value={c.idCondicion} className="bg-[#0c1320]">{c.descripcion}</option>
              ))}
            </select>
            {errors.idCondicion && <p className="text-red-400/80 text-[11px] flex items-center gap-1.5 pl-1"><span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />{errors.idCondicion}</p>}
          </div>

          <input type="hidden" value={form.idEstadoCarta} />

          {/* DESCRIPCIÓN */}
          <div className="space-y-2">
            <Label className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <FileText className="w-3 h-3 text-purple-400" />
              Descripción <span className="text-red-400">*</span>
            </Label>
            <textarea
              placeholder="Describe la carta: habilidades especiales, rareza, estado físico..."
              value={form.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              onBlur={(e)   => handleBlur("descripcion", e.target.value)}
              rows={3}
              className="w-full bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/15 focus:border-purple-400/40 focus:outline-none hover:border-white/15 rounded-2xl resize-none text-sm px-4 py-3 transition-all duration-300"
            />
            {errors.descripcion && <p className="text-red-400/80 text-[11px] flex items-center gap-1.5 pl-1"><span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />{errors.descripcion}</p>}
          </div>

          {/* CATEGORÍAS — todas las 21 con colores */}
          <div className="space-y-3">
            <Label className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-400" />
              Categorías <span className="text-red-400">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {categorias.map((cat) => {
                const selected = form.categorias.includes(cat.idCategoria);
                const style    = categoriaStyles[cat.descripcion] ?? "bg-white/10 border-white/20 text-white/60";
                return (
                  <button
                    key={cat.idCategoria}
                    type="button"
                    onClick={() => toggleCategoria(cat.idCategoria)}
                    className={`px-4 py-2 rounded-full border-2 text-xs font-bold transition-all duration-200 ${
                      selected
                        ? `${style} shadow-lg scale-105`
                        : "bg-white/[0.03] text-white/40 border-white/10 hover:border-white/20 hover:text-white/60 hover:bg-white/[0.06]"
                    }`}
                  >
                    {cat.descripcion}
                    {selected && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                  </button>
                );
              })}
            </div>
            {errors.categorias && <p className="text-red-400/80 text-[11px] flex items-center gap-1.5 pl-1"><span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />{errors.categorias}</p>}
          </div>

          {/* IMÁGENES */}
          <div className="space-y-3">
            <Label className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <ImagePlus className="w-3 h-3 text-pink-400" />
              Imágenes <span className="text-red-400">*</span>
            </Label>

            {fileURLs.length > 0 && (
              <div className="flex flex-wrap gap-3 p-4 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
                {fileURLs.map((src, i) => (
                  <div key={i} className="relative group/img">
                    <div className="w-24 h-36 rounded-xl overflow-hidden border-2 border-white/20 shadow-xl shadow-black/50 transition-all duration-200 group-hover/img:scale-105 group-hover/img:border-white/40 bg-[#0a0f1e]">
                      <img src={src} className="w-full h-full object-cover" alt={`preview-${i}`} />
                    </div>
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/70 text-white/50 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{i + 1}</div>
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-400 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-150 z-10">
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                ))}
                <div className="w-24 h-36 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-pink-400/30 hover:bg-pink-400/[0.03] transition-all duration-200"
                  onClick={() => document.getElementById("imageInput").click()}>
                  <ImagePlus className="w-5 h-5 text-white/20" />
                  <span className="text-[9px] text-white/20 text-center px-1">Agregar</span>
                </div>
              </div>
            )}

            {fileURLs.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed border-white/[0.08] rounded-2xl cursor-pointer hover:border-pink-400/30 hover:bg-pink-400/[0.03] transition-all duration-300 group/upload"
                onClick={() => document.getElementById("imageInput").click()}>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover/upload:bg-pink-400/10 group-hover/upload:border-pink-400/20 transition-all duration-300">
                  <ImagePlus className="w-5 h-5 text-white/20 group-hover/upload:text-pink-400/60 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-white/30 group-hover/upload:text-white/50 transition-colors font-medium">Click para subir imágenes</p>
                  <p className="text-[10px] text-white/15 mt-0.5">PNG, JPG, GIF</p>
                </div>
              </div>
            )}

            <input id="imageInput" type="file" multiple className="hidden" accept="image/*" onChange={handleChangeImage} />
            {errors.imagenes && <p className="text-red-400/80 text-[11px] flex items-center gap-1.5 pl-1"><span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />{errors.imagenes}</p>}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.06]" />
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.06]" />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3">
            <Link to="/carta" className="flex-1">
              <Button type="button" variant="ghost" className="w-full rounded-2xl h-12 border border-white/[0.07] text-white/30 hover:text-white/60 hover:bg-white/[0.04] hover:border-white/10 text-sm transition-all duration-200">
                Cancelar
              </Button>
            </Link>
            <Button onClick={handleSubmit} disabled={loading}
              className="flex-1 rounded-2xl h-12 bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-300 hover:to-yellow-200 text-black font-bold text-sm shadow-lg shadow-yellow-400/25 hover:shadow-yellow-400/40 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:scale-100">
              {loading
                ? <span className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                : <Save className="w-4 h-4" />
              }
              {loading ? "Guardando..." : "Guardar Carta"}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
