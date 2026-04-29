import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'facturacion';

class FacturacionService {

  // Admin: trae todos los pagos
  getAll() {
    return axios.get(BASE_URL);
  }

  // Comprador/Vendedor: trae solo sus pagos
  // ← NUEVO: necesitas crear este endpoint en el backend
  getByUsuario(idUsuario) {
    return axios.get(BASE_URL + '/byUsuario/' + idUsuario);
  }

  confirmarPago(idFacturacion) {
    return axios({
      method: 'put',
      url: BASE_URL + '/confirmarpago',
      data: JSON.stringify({ idFacturacion }),
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export default new FacturacionService();
