<?php

namespace App\Controllers\Api;

use CodeIgniter\API\ResponseTrait;
use CodeIgniter\Controller;
use CodeIgniter\HTTP\ResponseInterface;
use Throwable;

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
            'database'    => $this->estadoBaseDeDatos(),
            'time'        => date('c'),
        ]);
    }

    /**
     * Comprueba la conexion sin tumbar la respuesta: el health check de
     * Render apunta aqui, y si devolviera error el servicio se reiniciaria
     * en bucle cada vez que la base no estuviera disponible.
     *
     * @return array<string, mixed>
     */
    private function estadoBaseDeDatos(): array
    {
        try {
            $db = db_connect();

            return [
                'connected' => true,
                'driver'    => $db->DBDriver,
                'users'     => (int) $db->table('users')->countAllResults(),
            ];
        } catch (Throwable $e) {
            return [
                'connected' => false,
                'driver'    => config('Database')->default['DBDriver'] ?? 'desconocido',
                // Solo el motivo, sin la cadena de conexion ni credenciales.
                'reason'    => $this->motivo($e->getMessage()),
            ];
        }
    }

    /** Recorta el mensaje del motor a la primera linea util. */
    private function motivo(string $mensaje): string
    {
        if (preg_match('/(FATAL|ERROR):\s*(.+)/', $mensaje, $m) === 1) {
            return trim(explode("\n", $m[2])[0]);
        }

        if (preg_match('/could not translate host name[^\n]*/', $mensaje, $m) === 1) {
            return trim($m[0]);
        }

        return trim(explode("\n", $mensaje)[0]);
    }
}
