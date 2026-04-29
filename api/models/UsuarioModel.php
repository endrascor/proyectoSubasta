<?php
use Firebase\JWT\JWT;
class UsuarioModel
{
	public $enlace;
	public function __construct()
	{
		$this->enlace = new MySqlConnect();
	}

	public function all()
	{
        try{
            $rolM = new RolModel();
            $estadoUsuarioM = new EstadoUsuarioModel();
		    $vSql = "SELECT * FROM usuario order by idUsuario desc;";
		    $vResultado = $this->enlace->ExecuteSQL($vSql);
		    if (!empty($vResultado) && is_array($vResultado)) {
                for ($i = 0; $i < count($vResultado); $i++) {
                    //Rol
                    $vResultado[$i]->rol = $rolM->get($vResultado[$i]->idRol);
                    //Estado
                    $vResultado[$i]->estadoUsuario = $estadoUsuarioM->get($vResultado[$i]->idEstadoUsuario);
                }
		    }
		    return $vResultado;
	    } catch (Exception $e) {
            handleException($e);
        }
    }

    public function allVendedores()
	{
        try{
            $rolM = new RolModel();
            $estadoUsuarioM = new EstadoUsuarioModel();
		    $vSql = "SELECT 
                        u.idUsuario,
                        u.cedula,
                        u.nombre,
                        u.email,
                        u.idRol,
                        u.idEstadoUsuario,
                        u.fechaRegistro,

                        (SELECT COUNT(*) 
                        FROM subasta s 
                        WHERE s.idUsuario = u.idUsuario) 
                        AS cantidadSubastas,

                        FROM usuario u
                        WHERE u.idRol = 1;"; // 1 es el ID del rol de vendedor
		    $vResultado = $this->enlace->ExecuteSQL($vSql);
		    if (!empty($vResultado) && is_array($vResultado)) {
                for ($i = 0; $i < count($vResultado); $i++) {
                    //Rol
                    $vResultado[$i]->rol = $rolM->get($vResultado[$i]->idRol);
                    //Estado
                    $vResultado[$i]->estadoUsuario = $estadoUsuarioM->get($vResultado[$i]->idEstadoUsuario);
                }
		    }
		    return $vResultado;
	    } catch (Exception $e) {
            handleException($e);
        }
    }

	public function get($id)
	{
        try{
            $rolM = new RolModel();
            $estadoUsuarioM = new EstadoUsuarioModel();

		    $vSql = "SELECT 
                        u.idUsuario,
                        u.cedula,
                        u.nombre,
                        u.email,
                        u.idRol,
                        u.idEstadoUsuario,
                        u.fechaRegistro,

                        (SELECT COUNT(*) 
                        FROM subasta s 
                        WHERE s.idUsuario = u.idUsuario) 
                        AS cantidadSubastas,

                        (SELECT COUNT(*) 
                        FROM puja p 
                        WHERE p.idUsuario = u.idUsuario) 
                        AS cantidadPujas

                        FROM usuario u
                        WHERE u.idUsuario = $id;";

		    $vResultado = $this->enlace->ExecuteSQL($vSql);
		    if (!empty($vResultado)) {
                $vResultado = $vResultado[0];
            //Rol
                $vResultado->rol = $rolM->get($vResultado->idRol);
            //Estado
                $vResultado->estadoUsuario = $estadoUsuarioM->get($vResultado->idEstadoUsuario);
            }
		    return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
	}

	public function login($objeto)
	{
		$vSql = "SELECT * from usuario where email='$objeto->email' and idEstadoUsuario=1";
		//Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);
		if (is_object($vResultado[0])) {
			$usuario = $vResultado[0];
			if (password_verify($objeto->password, $usuario->password)) {
				$usuario = $this->get($usuario->idUsuario);
				if (!empty($usuario)) {
					// Datos para el token JWT
					$data = [
						'idUsuario' => $usuario->idUsuario,
                        'nombre' => $usuario->nombre,
						'email' => $usuario->email,
						'rol' => $usuario->rol,
						'iat' => time(),  // Hora de emisión
						'exp' => time() + 3600 // Expiración en 1 hora
					];

					// Generar el token JWT
					$jwt_token = JWT::encode($data, config::get('SECRET_KEY'), 'HS256');

					// Enviar el token como respuesta
					return $jwt_token;
				}
			}
		} else {
			return false;
		}
	}

	public function create($objeto)
    {
        if (isset($objeto->password) && $objeto->password != null) {
			$crypt = password_hash($objeto->password, PASSWORD_BCRYPT);
			$objeto->password = $crypt;
		}
		//Consulta sql            
		$vSql = "Insert into usuario (cedula,nombre,email,password,idRol,idEstadoUsuario,fechaRegistro)" .
			" Values ('$objeto->cedula','$objeto->nombre','$objeto->email','$objeto->password',$objeto->idRol,1,NOW())";

		//Ejecutar la consulta
		$vResultado = $this->enlace->executeSQL_DML_last($vSql);
		// Retornar el objeto creado
		return $this->get($vResultado);
    }

    public function update($objeto)
{
    try {

        // Consulta SQL
        $sql = "UPDATE usuario SET 
                    nombre = '$objeto->nombre',
                    email = '$objeto->email'
                WHERE idUsuario = $objeto->idUsuario";

        // Ejecutar consulta
        $this->enlace->executeSQL_DML($sql);

        // Retornar usuario actualizado
        return $this->get($objeto->idUsuario);

    } catch (Exception $e) {
        handleException($e);
    }
}
public function updateEstado($objeto)
{
    try {

        // Consulta SQL
        $sql = "UPDATE usuario 
                SET idEstadoUsuario =$objeto->idEstadoUsuario
                WHERE idUsuario = $objeto->idUsuario";
        $this->enlace->executeSQL_DML($sql);
        return $this->get($objeto->idUsuario);
    } catch (Exception $e) {
        handleException($e);
    }
}
}