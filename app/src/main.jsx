import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Home } from './components/Home/Home'
import { PageNotFound } from './components/Home/PageNotFound'
import TableUsuarios from './components/Usuario/TableUsuarios'
import { DetailUsuario } from './components/Usuario/DetailUsuario'
import { ListCartas } from './components/Carta/ListCartas'
import { DetailCarta } from './components/Carta/DetailCarta'
import { ListSubastasActivas } from './components/Subasta/ListSubastaActivas'
import { ListSubastasFinalizadas } from './components/Subasta/ListSubastasFinalizadas'
import { DetailSubasta } from './components/Subasta/DetailSubasta'
import { CreateUsuario } from './components/Usuario/CreateUsuario'
import { UpdateUsuario } from './components/Usuario/UpdateUsuario'
import { DeleteUsuario } from './components/Usuario/DeleteUsuario'
import { CartaSubastas } from './components/Carta/CartaSubastas'
import { CreateSubasta } from './components/Subasta/CreateSubasta'
import CartaCRUD from './components/Carta/CrearCarta'
import { EditSubasta } from './components/Subasta/EditSubasta'
import { CustomToaster } from './components/ui/CustomToaster'
import EditCarta from './components/Carta/EditCarta'
import { ListFacturacion } from './components/Facturacion/ListFacturacion'
import { RoleRoute } from './components/Auth/RoleRoute'
import Login from './components/Usuario/Login'

const rutas = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "*", element: <PageNotFound /> },
      { path: "usuario/table",          element: (<RoleRoute requiredRoles={["Administrador"]}><TableUsuarios /></RoleRoute>)},
      { path: "usuario/detail/:id",     element: (<RoleRoute requiredRoles={["Administrador"]}><DetailUsuario /></RoleRoute>)},
      { path: "carta",                  element: (<RoleRoute requiredRoles={["Administrador","Vendedor"]}><ListCartas /></RoleRoute>)},
      { path: "carta/detail/:id",       element: (<RoleRoute requiredRoles={["Administrador","Vendedor"]}><DetailCarta /></RoleRoute>)},
      { path: "subasta/SubastasActivas",    element: <ListSubastasActivas /> },
      { path: "subasta/SubastasFinalizadas", element: <ListSubastasFinalizadas /> },
      { path: "subasta/detail/:id",     element: <DetailSubasta /> },
      { path: "usuario/login",         element: <Login /> },
      { path: "usuario/create",         element: <CreateUsuario /> },
      { path: "usuario/edit/:id",       element: <UpdateUsuario /> },
      { path: "usuario/delete/:id",     element: <DeleteUsuario /> },
      { path: "carta/:id/subastas",     element: <CartaSubastas /> },
      { path: "subasta/create",         element: <CreateSubasta /> },
      { path: "carta/crear",            element: <CartaCRUD /> },
      { path: "subasta/edit/:id",       element: <EditSubasta /> },
      { path: "carta/editar/:id",       element: <EditCarta /> },
      { path: "facturacion",            element: <ListFacturacion /> },
    ],
  },
])

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={rutas} />
    {/* CustomToaster reemplaza al Toaster default de react-hot-toast */}
    <CustomToaster />
  </StrictMode>
)
