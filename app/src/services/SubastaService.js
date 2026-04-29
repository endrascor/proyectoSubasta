import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'subasta';

class SubastaService {

  allSubastasActivas() {
    return axios.get(BASE_URL + "/allSubastasActivas/");
  }

  allSubastasFinalizadas() {
    return axios.get(BASE_URL + "/allSubastasFinalizadas/");
  }

  getSubastaById(SubastaId) {
    return axios.get(BASE_URL + '/' + SubastaId);
  }

  getSubastaCarta(id) {
  return axios.get(BASE_URL + "/getSubastaCarta/" + id);
}

  createSubasta(Subasta) {
    return axios.post(BASE_URL, JSON.stringify(Subasta));
  }

updateSubasta(Subasta) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Subasta)
    })
  }

delete(subasta) {
    return axios({
      method: 'put',
      url: BASE_URL+ "/delete",
      data: JSON.stringify(subasta)

    })
  }
  getSubastasByUsuario(usuarioId) {
    return axios.get(BASE_URL + "/getSubastasByUsuario/" + usuarioId);
  }
}


export default new SubastaService();