<?php
class puja
{
    private function getPusher()
    {
        $pusher = new Pusher\Pusher(
            '28284af3704b6e0c7492',
            '6398f3b078cff8d75b8d',
            '2138339',
            ['cluster' => 'us2', 'useTLS' => true]
        );
        return $pusher;
    }

    public function getpujasbysubasta($idSubasta)
    {
        try {
            $response = new Response();
            $puja     = new PujaModel();
            $result   = $puja->getPujasbySubasta($idSubasta);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function create()
    {
        try {
            $request       = new Request();
            $response      = new Response();
            $inputJSON     = $request->getJSON();

            $idUsuario     = $inputJSON->idUsuario;
            $idSubasta     = $inputJSON->idSubasta;
            $montoOfertado = $inputJSON->montoOfertado;

            // VALIDACIÓN: usuario con factura pendiente no puede pujar
            $facturacionM = new FacturacionModel();
            if ($facturacionM->usuarioTienePendiente($idUsuario)) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Tienes un pago pendiente. Debes pagar antes de volver a pujar.'
                ]);
                return;
            }

            $subastaM = new SubastaModel();
            $subasta  = $subastaM->verificarYCerrar($idSubasta);

            // Validar subasta activa
            if (!$subasta || $subasta->idEstadoSubasta != 1) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'La subasta no está activa'
                ]);
                return;
            }

            // Validar que no sea el vendedor
            if ($subasta->idUsuario == $idUsuario) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'El vendedor no puede pujar en su propia subasta'
                ]);
                return;
            }

            // Obtener puja máxima actual
            $pujaM       = new PujaModel();
            $pujaActual  = $pujaM->getPujaMaxima($idSubasta);
            $montoActual = $pujaActual ? $pujaActual->montoOfertado : $subasta->precio;

            // Validar monto mayor que puja actual
            if ($montoOfertado <= $montoActual) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'El monto debe ser mayor que la puja actual: ' . $montoActual
                ]);
                return;
            }

            // Validar incremento mínimo
            if (($montoOfertado - $montoActual) < $subasta->incrementoMin) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'El monto no cumple el incremento mínimo de: ' . $subasta->incrementoMin
                ]);
                return;
            }

            // Registrar puja
            $nuevaPuja = $pujaM->create($inputJSON);

            // Emitir evento Pusher
            $pusher = $this->getPusher();
            $pusher->trigger('subasta-' . $idSubasta, 'nueva-puja', [
                'puja'         => $nuevaPuja,
                'montoLider'   => $nuevaPuja->montoOfertado,
                'usuarioLider' => $nuevaPuja->usuario
            ]);

            $response->toJSON($nuevaPuja);

        } catch (Exception $e) {
            handleException($e);
        }
    }

  public function getPujasByUsuario($idUsuario)
{
    try {
        $response = new Response();
        $puja = new PujaModel();
        $result = $puja->getPujasByUsuario($idUsuario);
        $response->toJSON($result);
    } catch (Exception $e) {
        handleException($e);
    }
}
}
