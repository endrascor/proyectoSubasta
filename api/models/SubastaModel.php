<?php
class SubastaModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function allSubastasActivas()
    {
        try {
            $cartaM         = new CartaModel();
            $estadoSubastaM = new EstadoSubastaModel();
            $usuarioM       = new UsuarioModel();

            // Cerrar subastas vencidas antes de listar
            $vencidas = $this->enlace->ExecuteSQL(
                "SELECT idSubasta FROM subasta WHERE idEstadoSubasta = 1 AND fechaCierre <= NOW()"
            );
            if (!empty($vencidas) && is_array($vencidas)) {
                foreach ($vencidas as $v) {
                    $this->verificarYCerrar($v->idSubasta);
                }
            }

            $vSql = "SELECT
                        u.idSubasta, u.fechaInicio, u.fechaCierre, u.precio,
                        u.incrementoMin, u.idEstadoSubasta, u.idUsuario, u.idCarta,
                        (SELECT COUNT(*) FROM puja s WHERE s.idSubasta = u.idSubasta) AS cantidadPujas
                     FROM subasta u
                     WHERE u.idEstadoSubasta = 1 AND u.fechaCierre > NOW()
                     ORDER BY idSubasta DESC";

            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (!empty($vResultado) && is_array($vResultado)) {
                for ($i = 0; $i < count($vResultado); $i++) {
                    $vResultado[$i]->carta         = $cartaM->get($vResultado[$i]->idCarta);
                    $vResultado[$i]->estadoSubasta = $estadoSubastaM->get($vResultado[$i]->idEstadoSubasta);
                    $vResultado[$i]->creador       = $usuarioM->get($vResultado[$i]->idUsuario);
                }
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function allSubastasFinalizadas()
    {
        try {
            $cartaM         = new CartaModel();
            $estadoSubastaM = new EstadoSubastaModel();
            $usuarioM       = new UsuarioModel();
            $vSql = "SELECT
                        u.idSubasta, u.fechaInicio, u.fechaCierre, u.precio,
                        u.incrementoMin, u.idEstadoSubasta, u.idUsuario, u.idCarta,
                        (SELECT COUNT(*) FROM puja s WHERE s.idSubasta = u.idSubasta) AS cantidadPujas
                     FROM subasta u
                     WHERE u.idEstadoSubasta = 2 OR u.idEstadoSubasta = 3
                     ORDER BY idSubasta DESC";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (!empty($vResultado) && is_array($vResultado)) {
                for ($i = 0; $i < count($vResultado); $i++) {
                    $vResultado[$i]->carta         = $cartaM->get($vResultado[$i]->idCarta);
                    $vResultado[$i]->estadoSubasta = $estadoSubastaM->get($vResultado[$i]->idEstadoSubasta);
                    $vResultado[$i]->creador       = $usuarioM->get($vResultado[$i]->idUsuario);
                }
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function get($id)
    {
        try {
            $cartaM         = new CartaModel();
            $estadoSubastaM = new EstadoSubastaModel();
            $usuarioM       = new UsuarioModel();

            $vSql = "SELECT
                        u.idSubasta, u.fechaInicio, u.fechaCierre, u.precio,
                        u.incrementoMin, u.idEstadoSubasta, u.idUsuario, u.idCarta,
                        (SELECT COUNT(*) FROM puja s WHERE s.idSubasta = u.idSubasta) AS cantidadPujas
                     FROM subasta u
                     WHERE u.idSubasta = $id
                     ORDER BY idSubasta DESC";

            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (!empty($vResultado)) {
                $vResultado = $vResultado[0];

                // Auto-cerrar si está activa y ya venció
                if ($vResultado->idEstadoSubasta == 1) {
                    $ahora  = new DateTime('now', new DateTimeZone('UTC'));
                    $cierre = new DateTime($vResultado->fechaCierre, new DateTimeZone('UTC'));
                    if ($ahora >= $cierre) {
                        $this->cerrarSubasta($id);
                        $vResultado->idEstadoSubasta = 2;

                        $pujaM      = new PujaModel();
                        $pujaMaxima = $pujaM->getPujaMaxima($id);
                        if ($pujaMaxima) {
                            $facturacionM = new FacturacionModel();
                            $facturacionM->crearDesdeSubasta($id, $pujaMaxima->idUsuario, $pujaMaxima->montoOfertado);
                        }

                        $ganador = null;
                        if ($pujaMaxima) {
                            $ganador = $usuarioM->get($pujaMaxima->idUsuario);
                        }

                        $pusher = new Pusher\Pusher(
                            '28284af3704b6e0c7492',
                            '6398f3b078cff8d75b8d',
                            '2138339',
                            ['cluster' => 'us2', 'useTLS' => true]
                        );
                        $pusher->trigger('subasta-' . $id, 'subasta-cerrada', [
                            'idSubasta' => $id,
                            'ganador'   => $ganador
                        ]);

                        // Emitir también en canal pagos si hay factura
                        if ($pujaMaxima) {
                            $factura = $facturacionM->getBySubasta($id);
                            if ($factura) {
                                $pusher->trigger('pagos', 'nuevo-pago', [
                                    'facturacion' => $factura
                                ]);
                            }
                        }
                    }
                }

                $vResultado->carta         = $cartaM->get($vResultado->idCarta);
                $vResultado->estadoSubasta = $estadoSubastaM->get($vResultado->idEstadoSubasta);
                $vResultado->creador       = $usuarioM->get($vResultado->idUsuario);
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getSubastaCarta($idCarta)
    {
        try {
            $vSql       = "SELECT * FROM subasta WHERE idCarta = $idCarta";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function create($objeto)
    {
        try {
            $sql = "INSERT INTO subasta
                        (fechaInicio, fechaCierre, precio, incrementoMin, idUsuario, idEstadoSubasta, idCarta)
                    VALUES (
                        '$objeto->fechaInicio', '$objeto->fechaCierre',
                        $objeto->precio, $objeto->incrementoMin,
                        $objeto->idUsuario, 1, $objeto->idCarta
                    )";
            $idSubasta = $this->enlace->executeSQL_DML_last($sql);
            return $this->get($idSubasta);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function update($objeto)
    {
        try {
            $sql = "UPDATE subasta SET
                        fechaInicio   = '$objeto->fechaInicio',
                        fechaCierre   = '$objeto->fechaCierre',
                        precio        = $objeto->precio,
                        incrementoMin = $objeto->incrementoMin
                    WHERE idSubasta = $objeto->idSubasta";
            $this->enlace->executeSQL_DML($sql);
            return $this->get($objeto->idSubasta);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function delete($objeto)
    {
        try {
            $sql = "UPDATE subasta SET idEstadoSubasta = $objeto->idEstadoSubasta
                    WHERE idSubasta = $objeto->idSubasta";
            $this->enlace->executeSQL_DML($sql);
            return $this->get($objeto->idSubasta);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function cerrarSubasta($idSubasta)
    {
        try {
            $sql = "UPDATE subasta SET idEstadoSubasta = 2 WHERE idSubasta = $idSubasta";
            $this->enlace->executeSQL_DML($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function verificarYCerrar($idSubasta)
    {
        try {
            $vSql       = "SELECT *, (fechaCierre <= NOW()) as vencida FROM subasta WHERE idSubasta = $idSubasta";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (empty($vResultado)) return null;

            $subasta = $vResultado[0];
            if ($subasta->idEstadoSubasta != 1) return $this->get($idSubasta);

            if ($subasta->vencida) {
                $this->cerrarSubasta($idSubasta);

                $pujaM      = new PujaModel();
                $pujaMaxima = $pujaM->getPujaMaxima($idSubasta);

                $ganador = null;
                if ($pujaMaxima) {
                    $facturacionM = new FacturacionModel();
                    $facturacionM->crearDesdeSubasta($idSubasta, $pujaMaxima->idUsuario, $pujaMaxima->montoOfertado);
                    $usuarioM = new UsuarioModel();
                    $ganador  = $usuarioM->get($pujaMaxima->idUsuario);
                }

                $pusher = new Pusher\Pusher(
                    '28284af3704b6e0c7492',
                    '6398f3b078cff8d75b8d',
                    '2138339',
                    ['cluster' => 'us2', 'useTLS' => true]
                );
                $pusher->trigger('subasta-' . $idSubasta, 'subasta-cerrada', [
                    'idSubasta' => $idSubasta,
                    'ganador'   => $ganador
                ]);

                if ($pujaMaxima) {
                    $factura = (new FacturacionModel())->getBySubasta($idSubasta);
                    if ($factura) {
                        $pusher->trigger('pagos', 'nuevo-pago', ['facturacion' => $factura]);
                    }
                }
            }

            return $this->get($idSubasta);
        } catch (Exception $e) {
            handleException($e);
        }
    }

public function getSubastasByUsuario($idUsuario)
{
    try {
        $cartaM         = new CartaModel();
        $estadoSubastaM = new EstadoSubastaModel();
        $usuarioM       = new UsuarioModel();
        
        $vSql = "SELECT
                    u.idSubasta, u.fechaInicio, u.fechaCierre, u.precio,
                    u.incrementoMin, u.idEstadoSubasta, u.idUsuario, u.idCarta,
                    (SELECT COUNT(*) FROM puja s WHERE s.idSubasta = u.idSubasta) AS cantidadPujas
                 FROM subasta u
                 WHERE u.idUsuario = $idUsuario
                 ORDER BY idSubasta DESC";
        
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        // Debug: Ver qué está devolviendo
        error_log("Subastas para usuario $idUsuario: " . json_encode($vResultado));
        
        if (!empty($vResultado) && is_array($vResultado)) {
            for ($i = 0; $i < count($vResultado); $i++) {
                $vResultado[$i]->carta         = $cartaM->get($vResultado[$i]->idCarta);
                $vResultado[$i]->estadoSubasta = $estadoSubastaM->get($vResultado[$i]->idEstadoSubasta);
                $vResultado[$i]->creador       = $usuarioM->get($vResultado[$i]->idUsuario);
            }
        }
        return $vResultado;
    } catch (Exception $e) {
        handleException($e);
    }
}
}
