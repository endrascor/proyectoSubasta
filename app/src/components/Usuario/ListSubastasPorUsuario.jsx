import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SubastaService from '../../services/SubastaService';
import { LoadingGrid } from '../ui/custom/LoadingGrid';
import { EmptyState } from '../ui/custom/EmptyState';
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Gavel } from "lucide-react";

export function ListSubastasPorUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subastas, setSubastas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubastas = async () => {
      try {
        const response = await SubastaService.getSubastasByUsuario(id);
        console.log("Respuesta del backend:", response.data);
        
        let subastasData = [];
        if (Array.isArray(response.data)) {
          subastasData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          subastasData = response.data.data;
        }
        
        setSubastas(subastasData);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubastas();
  }, [id]);

  if (loading) return <LoadingGrid count={3} type="grid" />;
  if (error) return <ErrorAlert title="Error" message={error} />;
  if (subastas.length === 0) return <EmptyState message="No tiene subastas creadas" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0a0f1e] to-[#020617] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 text-white/40 hover:text-white/80"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver
        </Button>
        
        <h1 className="text-2xl font-bold text-white mb-6">Mis Subastas</h1>
        
        <div className="grid gap-4">
          {subastas.map((subasta) => (
            <Card key={subasta.idSubasta} className="bg-[#0d1424]/90 border-white/10">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">
                      {subasta.carta?.nombre || `Subasta #${subasta.idSubasta}`}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">
                      Precio inicial: ${subasta.precio}
                    </p>
                    <p className="text-white/60 text-sm">
                      Incremento mínimo: ${subasta.incrementoMin}
                    </p>
                    <p className="text-white/60 text-sm">
                      Estado: {subasta.estadoSubasta?.descripcion || (subasta.idEstadoSubasta === 1 ? 'Activa' : 'Finalizada')}
                    </p>
                    <p className="text-white/40 text-xs mt-2">
                      Cierra: {new Date(subasta.fechaCierre).toLocaleString()}
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate(`/subasta/detail/${subasta.idSubasta}`)}
                    className="ml-4 bg-gradient-to-r from-blue-500 to-purple-500"
                  >
                    Ver detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}