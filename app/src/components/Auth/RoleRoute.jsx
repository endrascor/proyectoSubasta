import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import PropTypes from "prop-types";

export function RoleRoute({ children, requiredRoles }) {
    const { authorize } = useUser();
    const navigate = useNavigate();

    if (authorize(requiredRoles)) {
        return children;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h2 className="text-2xl font-bold text-red-600">Acceso no autorizado</h2>
            <p className="text-gray-500 mt-2">
                No tienes permisos para ver esta sección.
            </p>
            <Button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-secondary flex items-center gap-2 my-2"
            >
                <ArrowLeft className="w-4 h-4" />
                Regresar
            </Button>
        </div>
    );
}

RoleRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requiredRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};
