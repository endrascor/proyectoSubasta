<?php
class carta
{
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $cartaM = new CartaModel();
            $result = $cartaM->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
            
        }
    }
    public function get($id)
    {
        try {
            $response = new Response();
            $carta = new CartaModel();
            $result = $carta->get($id);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
            
        }
    }



public function subastas($id)
{
    try {
        $response = new Response();

        $subasta = new SubastaModel();

        $result = $subasta->getSubastaCarta($id);

        $response->toJSON($result);

    } catch (Exception $e) {
        handleException($e);
    }
}

public function allCartasActivas()
    {
        try {
            $response = new Response();
            $carta = new CartaModel();
            $result = $carta->allCartasActivas();
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
            
        }
    }

public function allCartasbyId($id)
    {
        try {
            $response = new Response();
            $carta = new CartaModel();
            $result = $carta->allCartasbyId($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
            
        }
    }
public function create()
{
    try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $carta = new CartaModel();
            //Acción del modelo a ejecutar
            $result = $carta->create($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
            
        }
}

public function update($id)
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $carta = new CartaModel();
            $result = $carta->update($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
    public function updateEstado()
{
    try {
        $request  = new Request();
        $response = new Response();
        $inputJSON     = $request->getJSON();
        $carta  = new CartaModel();
        $result   = $carta->updateEstado($inputJSON);
        $response->toJSON($result);
    } catch (Exception $e) {
        $response->toJSON($result);
        handleException($e);
    }
}
public function delete()
{
    try {
        $request  = new Request();
        $response = new Response();
        $inputJSON     = $request->getJSON();
        $carta  = new CartaModel();
        $result   = $carta->delete($inputJSON);
        $response->toJSON($result);
    } catch (Exception $e) {
        $response->toJSON($result);
        handleException($e);
    }
}
}