<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Entrega la aplicacion de React que Vite deja compilada en public/app.
 */
class Spa extends Controller
{
    public function index(): ResponseInterface
    {
        $indice = FCPATH . 'app' . DIRECTORY_SEPARATOR . 'index.html';

        if (! is_file($indice)) {
            return $this->response
                ->setStatusCode(503)
                ->setContentType('text/html')
                ->setBody(
                    '<h1>Falta compilar el frontend</h1>'
                    . '<p>Ejecuta <code>npm run build</code> dentro de la carpeta <code>frontend</code>.</p>'
                );
        }

        return $this->response
            ->setContentType('text/html')
            ->setBody(file_get_contents($indice));
    }
}
