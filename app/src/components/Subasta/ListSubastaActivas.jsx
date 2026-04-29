import { useEffect, useState } from "react";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { EmptyState } from "../ui/custom/EmptyState";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { ListCardSubastasActivas } from "./ListCardSubastasActivas";
import SubastaService from "@/services/SubastaService";
import { useUser } from "@/hooks/useUser";

export function ListSubastasActivas() {
  const [data, setData]       = useState(null);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(true);
  const { user }              = useUser();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await SubastaService.allSubastasActivas();
      if (response.data.success === false) {
        setError(response.data.message || "Error desconocido");
        setData([]);
      } else {
        setData(response.data.data || []);
      }
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingGrid type="grid" />;
  if (error)   return <ErrorAlert title="Error al cargar subastas activas" message={error} />;
  if (!data || data.length === 0)
    return <EmptyState message="No se encontraron subastas activas." />;

  return (
    <div className="mx-auto max-w-7xl p-6">
      <ListCardSubastasActivas
        data={data}
        onRefresh={fetchData}
        currentUser={user}
      />
    </div>
  );
}
