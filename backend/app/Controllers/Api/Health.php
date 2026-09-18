<?php

namespace App\Controllers\Api;

use CodeIgniter\API\ResponseTrait;
use CodeIgniter\Controller;
use CodeIgniter\HTTP\ResponseInterface;

class Health extends Controller
{
    use ResponseTrait;

    public function index(): ResponseInterface
    {
        return $this->respond([
            'status'      => 'ok',
            'framework'   => 'CodeIgniter ' . \CodeIgniter\CodeIgniter::CI_VERSION,
            'php'         => PHP_VERSION,
            'environment' => ENVIRONMENT,
            'time'        => date('c'),
        ]);
    }
}
