import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Link } from "react-router-dom";

import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { EmptyState } from "../ui/custom/EmptyState";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { ListCardCartas } from "./ListCardCartas";
import CartaService from "@/services/CartaService";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

export function ListCartas() {

    const { user, authorize } = useUser();
    const isAdmin = authorize(["Administrador"]);

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            let response;

            if (isAdmin) {
                response = await CartaService.getCartas();
            } else {
                response = await CartaService.allCartasbyId(user.idUsuario);
            }

            setData(response.data);
            setError(null);

        } catch (err) {

            if (err.response?.status === 404) {
                setData({ data: [] });
                setError(null);
                return;
            }

            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, isAdmin]);

    return (
        <div className="mx-auto max-w-7xl p-6">

            {/* HEADER SIEMPRE VISIBLE */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
    
    {/* TÍTULO con icono (igual al otro componente) */}
    <h1 className="text-2xl font-bold text-white/90 tracking-tight flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-400" />
        Mis Cartas
    </h1>

    {/* BOTÓN igual al estilo TCG */}
    <Link to="/carta/crear">
        <Button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-full px-5 py-2 shadow-lg shadow-yellow-400/30 hover:scale-105 transition-all duration-200">
            <Plus className="w-4 h-4" />
            Nueva Carta
        </Button>
    </Link>

</div>

            {/* CONTENIDO */}
            {loading ? (
                <LoadingGrid type="grid" />
            ) : error ? (
                <ErrorAlert title="Error al cargar cartas" message={error} />
            ) : !data || data.data.length === 0 ? (
                <EmptyState message="Este usuario no tiene cartas aún." />
            ) : (
                <ListCardCartas
                    data={data.data}
                    onRefresh={fetchData}
                />
            )}

        </div>
    );
}
