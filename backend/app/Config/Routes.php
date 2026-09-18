<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Spa::index');

/**
 * Recurso USER. Se publica en dos rutas sobre el mismo controlador:
 * /users, que es la que pide la especificacion, y /api/users, que deja
 * la API agrupada bajo un prefijo propio.
 */
$definirUsuarios = static function (RouteCollection $routes): void {
    // El navegador envia un preflight OPTIONS antes de cualquier peticion
    // con JSON o cabeceras propias. Sin esta ruta responde 404 y el
    // filtro cors nunca llega a contestar.
    $routes->options('users', static function (): void {});
    $routes->options('users/(:any)', static function (): void {});

    $routes->resource('users', [
        'controller' => 'Api\Users',
        'except'     => 'new,edit',
    ]);
};

$definirUsuarios($routes);

$routes->group('api', static function (RouteCollection $routes) use ($definirUsuarios): void {
    $routes->options('(:any)', static function (): void {});
    $routes->get('health', 'Api\Health::index');

    $definirUsuarios($routes);
});
