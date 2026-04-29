<?php
class facturacion
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

    public function index()
    {
        try {
            $response    = new Response();
            $facturacion = new FacturacionModel();
            $result      = $facturacion->getAll();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function allFacturasbyId($id)
    {
        try {
            $response    = new Response();
            $facturacion = new FacturacionModel();
            $result      = $facturacion->allFacturasbyId($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

 public function confirmarpago()
    {
        try {
            $request     = new Request();
            $response    = new Response();
            $inputJSON   = $request->getJSON();
            $facturacion = new FacturacionModel();
            $result      = $facturacion->confirmarPago($inputJSON->idFacturacion);

            // Emitir evento Pusher
            $pusher = $this->getPusher();
            $pusher->trigger('pagos', 'pago-confirmado', [
                'facturacion' => $result
            ]);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
