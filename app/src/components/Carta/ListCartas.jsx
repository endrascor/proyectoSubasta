import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";

import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { EmptyState } from "../ui/custom/EmptyState";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { ListCardCartas } from "./ListCardCartas";
import CartaService from "@/services/CartaService";

export function ListCartas() {

    const { user, authorize } = useUser();
    const isAdmin = authorize(["Administrador"]);

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {

            let response;

            // 🔥 AQUÍ ESTÁ LA MAGIA
            if (isAdmin) {
                response = await CartaService.getCartas();
            } else {
                response = await CartaService.allCartasbyId(user.idUsuario);
            }

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

    useEffect(() => {
        if (user) { // 👈 importante para evitar undefined
            fetchData();
        }
    }, [user, isAdmin]);

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar cartas" message={error} />;
    if (!data || data.data.length === 0)
        return (
    <div className="mx-auto max-w-7xl p-6">

        {/* 👇 Siempre visible */}
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">Mis Cartas</h1>
        </div>

        {/* 👇 Si no hay cartas */}
        {!data || data.data.length === 0 ? (
            <EmptyState message="Este usuario no tiene cartas aún." />
        ) : (
            <ListCardCartas 
                data={data.data}
                onRefresh={fetchData}  
            />
        )}
    </div>
);

    return (
        <div className="mx-auto max-w-7xl p-6">
            {data && (
                <ListCardCartas 
                    data={data.data}
                    onRefresh={fetchData}  
                />
            )}
        </div>
    );
}
