import axios from 'axios';
//http://http://localhost:81/appmovie/api/movie/
const BASE_URL = import.meta.env.VITE_BASE_URL + 'puja';
class PujaService {
  //Definición para Llamar al API y obtener el listado de pujas

  //Obtener puja
  //http://localhost:81/proyectoSubasta/api/puja/1
  getPujasbySubasta(SubastaId){
    return axios.get(BASE_URL+'/getPujasbySubasta/'+SubastaId);
  }


  createPuja(puja) {
    return axios.post(BASE_URL, JSON.stringify(puja), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

   getPujasByUsuario(usuarioId) {
    return axios.get(BASE_URL + "/getPujasByUsuario/" + usuarioId);
  }
}
export default new PujaService();