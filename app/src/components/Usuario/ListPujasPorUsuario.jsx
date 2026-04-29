import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PujaService from '../../services/PujaService';
import { LoadingGrid } from '../ui/custom/LoadingGrid';
import { EmptyState } from '../ui/custom/EmptyState';
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function ListPujasPorUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pujas, setPujas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPujas = async () => {
      try {
        // ✅ Usar el método correcto del servicio
        const response = await PujaService.getPujasByUsuario(id);
        console.log("Pujas response:", response.data);
        
        // Manejar diferentes estructuras de respuesta
        let pujasData = [];
        if (Array.isArray(response.data)) {
          pujasData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          pujasData = response.data.data;
        } else if (response.data.pujas && Array.isArray(response.data.pujas)) {
          pujasData = response.data.pujas;
        }
        
        setPujas(pujasData);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPujas();
  }, [id]);

  if (loading) return <LoadingGrid count={3} type="grid" />;
  if (error) return <ErrorAlert title="Error" message={error} />;
  if (pujas.length === 0) return <EmptyState message="No ha realizado pujas" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0a0f1e] to-[#020617] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-white/40">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver
        </Button>
        
        <h1 className="text-2xl font-bold text-white mb-6">Mis Pujas</h1>
        
        <div className="grid gap-4">
          {pujas.map((puja) => (
            <Card key={puja.idPuja || puja.id} className="bg-[#0d1424]/90 border-white/10">
              <CardContent className="p-4">
                <p className="text-white font-semibold">Monto: ${puja.montoOfertado}</p>
                <p className="text-white/60 text-sm">Fecha: {puja.fechaPuja}</p>
                <Button 
                  onClick={() => navigate(`/subasta/detail/${puja.idSubasta}`)}
                  className="mt-2 bg-purple-500"
                >
                  Ver subasta
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}