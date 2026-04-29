import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'usuario';
class UsuarioService {
  //Definición para Llamar al API y obtener el listado de usuarios

  //Listas usuarios
  //http://localhost:81/proyectoSubasta/api/usuario
  getUsuarios() {
    return axios.get(BASE_URL);
  }

  allVendedores() {
    return axios.get(BASE_URL + '/allVendedores');
  }
  //Obtener usuario
  //http://localhost:81/proyectoSubasta/api/usuario/1
  getUsuarioById(UsuarioId){
    return axios.get(BASE_URL+'/'+UsuarioId);
  }
  createUsuario(Usuario) {
    return axios.post(BASE_URL + "/create", JSON.stringify(Usuario));
  }
  updateUsuario(Usuario) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Usuario)
    })
  }
  updateEstadoUsuario(usuario) {
    return axios({
      method: 'put',
      url: BASE_URL+ "/updateEstado",
      data: JSON.stringify(usuario)

    })
  }
  loginUsuario(Usuario) {
    return axios.post(BASE_URL + '/login', JSON.stringify(Usuario));
  }
}
export default new UsuarioService();