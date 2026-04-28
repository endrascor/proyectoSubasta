import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'carta';

class CartaService {

  getCartas() {
    return axios.get(BASE_URL);
  }

  getCartaById(CartaId){
    return axios.get(BASE_URL + '/' + CartaId);
  }
 
  getSubastasByCarta(id){
    return axios.get(BASE_URL + '/subastas/' + id);
  }

  allCartasActivas(){
    return axios.get(BASE_URL + "/allCartasActivas/");
  }
  allCartasbyId(id){
  return axios.get(BASE_URL + "/allCartasbyId/" + id);
}

  createCarta(Carta) {
    return axios.post(BASE_URL, JSON.stringify(Carta));
  }

updateCarta(carta) {
  return axios({
    method: 'put',
    url: BASE_URL + '/update/' + carta.idCarta,
    data: JSON.stringify(carta)
  });
}

updateEstadoCarta(carta) {
  return axios.put(
    `${BASE_URL}/updateEstado`,  
    JSON.stringify(carta)
  );
}

  delete(Carta) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Carta)

    })
  }
}
export default new CartaService();