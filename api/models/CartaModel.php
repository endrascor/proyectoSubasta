<?php
class CartaModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /* 
    LISTAR TODAS LAS CARTAS
       */
    public function all()
    {
        try {
            $imagenM = new ImageModel();
            $categoriaM = new CategoriaModel();
            $subastaM = new SubastaModel();
            $condicionM = new CondicionModel();
            $estadoCartaM = new EstadoCartaModel();
            $usuarioM = new UsuarioModel();
            $vSQL = "SELECT * FROM carta order by nombre desc;";
            $vResultado = $this->enlace->ExecuteSQL($vSQL);
            if(!empty($vResultado) && is_array($vResultado)){
                for($i=0; $i < count($vResultado); $i++){
                    //Imagenes
                    $vResultado[$i]->imagenes=$imagenM->getImageCarta($vResultado[$i]->idCarta);
                    //Categorias
                    $vResultado[$i]->categorias=$categoriaM->getCategoriaCarta($vResultado[$i]->idCarta);
                    //Condicion
                    $vResultado[$i]->condicion = $condicionM->get($vResultado[$i]->idCondicion);
                    // Usuario dueño
                    $vResultado[$i]->propietario = $usuarioM->get($vResultado[$i]->idUsuario);
                    // Estado carta
                    $vResultado[$i]->estadoCarta = $estadoCartaM->get($vResultado[$i]->idEstadoCarta);
                    // Subasta
                    $vResultado[$i]->subasta = $subastaM->getSubastaCarta($vResultado[$i]->idCarta);
                }
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function allCartasbyId($id)
    {
        try {
            $imagenM = new ImageModel();
            $categoriaM = new CategoriaModel();
            $subastaM = new SubastaModel();
            $condicionM = new CondicionModel();
            $estadoCartaM = new EstadoCartaModel();
            $usuarioM = new UsuarioModel();
            $vSQL = "SELECT * FROM carta WHERE idUsuario = $id order by nombre desc;";
            $vResultado = $this->enlace->ExecuteSQL($vSQL);
            if(!empty($vResultado) && is_array($vResultado)){
                for($i=0; $i < count($vResultado); $i++){
                    //Imagenes
                    $vResultado[$i]->imagenes=$imagenM->getImageCarta($vResultado[$i]->idCarta);
                    //Categorias
                    $vResultado[$i]->categorias=$categoriaM->getCategoriaCarta($vResultado[$i]->idCarta);
                    //Condicion
                    $vResultado[$i]->condicion = $condicionM->get($vResultado[$i]->idCondicion);
                    // Usuario dueño
                    $vResultado[$i]->propietario = $usuarioM->get($vResultado[$i]->idUsuario);
                    // Estado carta
                    $vResultado[$i]->estadoCarta = $estadoCartaM->get($vResultado[$i]->idEstadoCarta);
                    // Subasta
                    $vResultado[$i]->subasta = $subastaM->getSubastaCarta($vResultado[$i]->idCarta);
                }
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function allCartasActivas()
	{
        try{
            $imagenM = new ImageModel();
            $categoriaM = new CategoriaModel();
            $subastaM = new SubastaModel();
            $condicionM = new CondicionModel();
            $estadoCartaM = new EstadoCartaModel();
            $usuarioM = new UsuarioModel();
		    $vSQL = "SELECT * FROM carta where idEstadoCarta = 1 order by nombre desc;";
		    $vResultado = $this->enlace->ExecuteSQL($vSQL);
            if (!empty($vResultado) && is_array($vResultado)) {
                for ($i = 0; $i < count($vResultado); $i++) {
                    //Imagenes
                    $vResultado[$i]->imagenes=$imagenM->getImageCarta($vResultado[$i]->idCarta);
                    //Categorias
                    $vResultado[$i]->categorias=$categoriaM->getCategoriaCarta($vResultado[$i]->idCarta);
                    //Condicion
                    $vResultado[$i]->condicion = $condicionM->get($vResultado[$i]->idCondicion);
                    // Usuario dueño
                    $vResultado[$i]->propietario = $usuarioM->get($vResultado[$i]->idUsuario);
                    // Estado carta
                    $vResultado[$i]->estadoCarta = $estadoCartaM->get($vResultado[$i]->idEstadoCarta);
                    // Subasta
                    $vResultado[$i]->subasta = $subastaM->getSubastaCarta($vResultado[$i]->idCarta);
                }
		    }
		    return $vResultado;
	    } catch (Exception $e) {
            handleException($e);
        }
    }

    /* 
       OBTENER UNA CARTA
       */
    public function get($id)
    {
        try {
            $usuarioM = new UsuarioModel();
            $imagenM = new ImageModel();
            $subastaM = new SubastaModel();
            $estadoCartaM = new EstadoCartaModel();
            $categoriaM = new CategoriaModel();
            $condicionM = new CondicionModel();
            $vSql = "SELECT * FROM carta WHERE idCarta = $id;";
            $vResultado = $this->enlace->executeSQL($vSql);
            if (!empty($vResultado))
            {
                $vResultado = $vResultado[0];
                // Imagen
                $vResultado->imagenes = $imagenM->getImageCarta($vResultado->idCarta);
                // Categorias
                $vResultado->categorias = $categoriaM->getCategoriaCarta($id);
                // Usuario dueño
                $vResultado->propietario = $usuarioM->get($vResultado->idUsuario);
                // Estado carta
                $vResultado->estadoCarta = $estadoCartaM->get($vResultado->idEstadoCarta);
                // Condición
                $vResultado->condicion = $condicionM->get($vResultado->idCondicion);
                // Subasta
                $vResultado->subasta = $subastaM->getSubastaCarta($vResultado->idCarta);
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

 public function create($objeto)
{
    try {
        $sql = "INSERT INTO carta 
                (nombre, descripcion, idUsuario, idEstadoCarta, idCondicion, fechaRegistro)
                VALUES (
                    '$objeto->nombre',
                    '$objeto->descripcion',
                    $objeto->idUsuario,
                    $objeto->idEstadoCarta,
                    $objeto->idCondicion,
                    NOW()
                )";

        $idCarta = $this->enlace->executeSQL_DML_last($sql);
        //Crear elementos a insertar en categorias
        foreach ($objeto->categorias as $value) {
            $sql = "Insert into carta_categoria(idCarta,idCategoria)" .
                " Values($idCarta,$value)";
            $vResultadoCat = $this->enlace->executeSQL_DML($sql);
        }

        return $this->get($idCarta);

    } catch (Exception $e) {
        handleException($e);
    }
}

public function update($objeto)
    {
        //Consulta sql
        $sql = "Update carta SET nombre ='$objeto->nombre'," .
            "descripcion ='$objeto->descripcion',fechaRegistro='$objeto->fechaRegistro',idUsuario=$objeto->idUsuario,idEstadoCarta =$objeto->idEstadoCarta," .
            "idCondicion=$objeto->idCondicion" .
            " Where idCarta=$objeto->idCarta";

        //Ejecutar la consulta
        $cResults = $this->enlace->executeSQL_DML($sql);
        //--- Generos ---
        //Eliminar generos asociados a la carta
        $sql = "Delete from carta_categoria where idCarta=$objeto->idCarta";
        $vResultadoD = $this->enlace->executeSQL_DML($sql);
        //Insertar categorias
        foreach ($objeto->categorias as $item) {
            $sql = "Insert into carta_categoria(idCarta,idCategoria)" .
                " Values($objeto->idCarta,$item)";
            $vResultadoCat = $this->enlace->executeSQL_DML($sql);
        }
        //Retornar carta
        return $this->get($objeto->idCarta);
    }

    public function updateEstado($objeto)
{
    try {
        $sql = "Update carta SET idEstadoCarta=$objeto->idEstadoCarta WHERE idCarta=$objeto->idCarta";
        $this->enlace->executeSQL_DML($sql);
        return $this->get($objeto->idCarta);
    } catch (Exception $e) {
        handleException($e);
    }
}
public function delete($objeto)
{
    try {
        $sql = "Update carta SET idEstadoCarta=3 WHERE idCarta=$objeto->idCarta";
        $this->enlace->executeSQL_DML($sql);
        return $this->get($objeto->idCarta);
    } catch (Exception $e) {
        handleException($e);
    }
}
}
