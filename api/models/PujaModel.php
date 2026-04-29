<?php
class PujaModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function getPujasbySubasta($idSubasta)
    {
        try {
            $usuarioM = new UsuarioModel();
            $vSql = "SELECT * FROM puja WHERE idSubasta=$idSubasta ORDER BY montoOfertado DESC";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (!empty($vResultado) && is_array($vResultado)) {
                for ($i = 0; $i < count($vResultado); $i++) {
                    $vResultado[$i]->usuario = $usuarioM->get($vResultado[$i]->idUsuario);
                }
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function getPujaMaxima($idSubasta)
    {
        try {
            $vSql = "SELECT * FROM puja WHERE idSubasta=$idSubasta ORDER BY montoOfertado DESC LIMIT 1";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (!empty($vResultado)) {
                return $vResultado[0];
            }
            return null;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function create($objeto)
    {
        try {
            $sql = "INSERT INTO puja (montoOfertado, fechaPuja, idUsuario, idSubasta)
                    VALUES (
                        $objeto->montoOfertado,
                        NOW(),
                        $objeto->idUsuario,
                        $objeto->idSubasta
                    )";
            $idPuja = $this->enlace->executeSQL_DML_last($sql);

            // Retornar la puja con usuario
            $usuarioM = new UsuarioModel();
            $vSql = "SELECT * FROM puja WHERE idPuja=$idPuja";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (!empty($vResultado)) {
                $puja = $vResultado[0];
                $puja->usuario = $usuarioM->get($puja->idUsuario);
                return $puja;
            }
        } catch (Exception $e) {
            handleException($e);
        }
    }

 public function getPujasByUsuario($idUsuario)
{
    try {
        $subastaM = new SubastaModel();
        $vSql = "SELECT * FROM puja WHERE idUsuario = $idUsuario ORDER BY fechaPuja DESC";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        if (!empty($vResultado) && is_array($vResultado)) {
            for ($i = 0; $i < count($vResultado); $i++) {
                $vResultado[$i]->subasta = $subastaM->get($vResultado[$i]->idSubasta);
            }
        }
        return $vResultado;
    } catch (Exception $e) {
        handleException($e);
    }
}
}