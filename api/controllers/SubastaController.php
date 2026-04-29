<?php
class subasta
{
    public function allSubastasActivas()
    {
        try {
            $response = new Response();
            $subasta = new SubastaModel();
            $result = $subasta->allSubastasActivas();
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
            
        }
    }
    
    public function allSubastasFinalizadas()
    {
        try {
            $response = new Response();
            $subasta = new SubastaModel();
            $result = $subasta->allSubastasFinalizadas();
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
            $subasta = new SubastaModel();
            $result = $subasta->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
            
        }
    }

    public function getSubastaCarta($id)
    {
        try {
            $response = new Response();
            $subasta = new SubastaModel();
            $result = $subasta->getSubastaCarta($id);
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
        $inputJSON = $request->getJSON();
        $subasta = new SubastaModel();
        $result = $subasta->create($inputJSON);
        $response->toJSON($result);
    } catch (Exception $e) {
        $response->toJSON($result);
        handleException($e);
    }
}

public function update()
{
    try {
        $request  = new Request();
        $response = new Response();
        $inputJSON = $request->getJSON();  
        $subasta  = new SubastaModel();
        $result   = $subasta->update($inputJSON);
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
        $subasta  = new SubastaModel();
        $result   = $subasta->delete($inputJSON);
        $response->toJSON($result);
    } catch (Exception $e) {
        $response->toJSON($result);
        handleException($e);
    }
}  

public function getSubastasByUsuario($idUsuario)
{
    try {
        $response = new Response();
        $subasta = new SubastaModel();
        $result = $subasta->getSubastasByUsuario($idUsuario);
        $response->toJSON($result);
    } catch (Exception $e) {
        handleException($e);
    }
}
}