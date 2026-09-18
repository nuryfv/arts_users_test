<?php

namespace Tests\Feature;

use App\Database\Seeds\UserSeeder;
use App\Models\UserModel;
use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\DatabaseTestTrait;
use CodeIgniter\Test\FeatureTestTrait;
use PHPUnit\Framework\Attributes\Test;

/**
 * Pruebas de integracion del recurso USER: recorren ruta, controlador,
 * modelo y base de datos reales (SQLite en memoria).
 */
final class UsersApiTest extends CIUnitTestCase
{
    use DatabaseTestTrait;
    use FeatureTestTrait;

    protected $namespace = 'App';
    protected $migrate   = true;
    protected $refresh   = true;
    protected $seed      = UserSeeder::class;

    /** Datos validos de partida para un alta. */
    private function usuarioValido(array $cambios = []): array
    {
        return array_merge([
            'first_name' => 'Nuevo',
            'last_name'  => 'Usuario',
            'email'      => 'nuevo.usuario@artistshot.test',
            'gender'     => 'otro',
            'telephone'  => '3001112233',
            'age'        => 30,
        ], $cambios);
    }

    #[Test]
    public function elSeederCargaDoceUsuarios(): void
    {
        $this->assertSame(12, (new UserModel())->countAllResults());
    }

    #[Test]
    public function listarDevuelve200ConLosUsuariosYSuPaginacion(): void
    {
        $resultado = $this->call('get', 'users');

        $resultado->assertStatus(200);
        $cuerpo = json_decode($resultado->getJSON(), true);

        $this->assertCount(10, $cuerpo['data'], 'La primera pagina trae 10 registros.');
        $this->assertSame(12, $cuerpo['meta']['total']);
        $this->assertArrayHasKey('email', $cuerpo['data'][0]);
    }

    #[Test]
    public function elDetalleDeUnUsuarioExistenteDevuelve200(): void
    {
        $id = (new UserModel())->first()['id'];

        $resultado = $this->call('get', "users/{$id}");

        $resultado->assertStatus(200);
        $this->assertSame($id, json_decode($resultado->getJSON(), true)['data']['id']);
    }

    #[Test]
    public function elDetalleDeUnUsuarioInexistenteDevuelve404(): void
    {
        $this->call('get', 'users/999999')->assertStatus(404);
    }

    #[Test]
    public function crearUnUsuarioValidoDevuelve201YLoGuarda(): void
    {
        $datos = $this->usuarioValido();

        $resultado = $this->withBodyFormat('json')->call('post', 'users', $datos);

        $resultado->assertStatus(201);
        $this->seeInDatabase('users', ['email' => $datos['email']]);
        $this->assertSame(13, (new UserModel())->countAllResults());
    }

    #[Test]
    public function crearSinLosCamposObligatoriosDevuelve422(): void
    {
        $resultado = $this->withBodyFormat('json')->call('post', 'users', []);

        $resultado->assertStatus(422);
        $mensajes = json_decode($resultado->getJSON(), true)['messages'];

        $this->assertArrayHasKey('first_name', $mensajes);
        $this->assertArrayHasKey('email', $mensajes);
        $this->assertArrayHasKey('age', $mensajes);
    }

    #[Test]
    public function crearConUnCorreoInvalidoDevuelve422(): void
    {
        $resultado = $this->withBodyFormat('json')
            ->call('post', 'users', $this->usuarioValido(['email' => 'esto-no-es-un-correo']));

        $resultado->assertStatus(422);
        $this->assertArrayHasKey('email', json_decode($resultado->getJSON(), true)['messages']);
    }

    #[Test]
    public function crearConUnCorreoRepetidoDevuelve422(): void
    {
        $repetido = (new UserModel())->first()['email'];

        $resultado = $this->withBodyFormat('json')
            ->call('post', 'users', $this->usuarioValido(['email' => $repetido]));

        $resultado->assertStatus(422);
        $this->assertSame(12, (new UserModel())->countAllResults(), 'No debe haberse insertado nada.');
    }

    #[Test]
    public function crearConUnaEdadFueraDeRangoDevuelve422(): void
    {
        $resultado = $this->withBodyFormat('json')
            ->call('post', 'users', $this->usuarioValido(['age' => 200]));

        $resultado->assertStatus(422);
        $this->assertArrayHasKey('age', json_decode($resultado->getJSON(), true)['messages']);
    }

    #[Test]
    public function actualizarUnUsuarioDevuelve200YPersisteElCambio(): void
    {
        $id = (new UserModel())->first()['id'];

        $resultado = $this->withBodyFormat('json')
            ->call('put', "users/{$id}", ['age' => 44, 'telephone' => '3009998877']);

        $resultado->assertStatus(200);
        $this->seeInDatabase('users', ['id' => $id, 'age' => 44]);
    }

    #[Test]
    public function actualizarConservandoElPropioCorreoDevuelve200(): void
    {
        $usuario = (new UserModel())->first();

        $resultado = $this->withBodyFormat('json')
            ->call('put', "users/{$usuario['id']}", ['email' => $usuario['email'], 'age' => 50]);

        $resultado->assertStatus(200);
    }

    #[Test]
    public function actualizarConElCorreoDeOtroUsuarioDevuelve422(): void
    {
        $usuarios = (new UserModel())->findAll(2);

        $resultado = $this->withBodyFormat('json')
            ->call('put', "users/{$usuarios[0]['id']}", ['email' => $usuarios[1]['email']]);

        $resultado->assertStatus(422);
    }

    #[Test]
    public function actualizarUnUsuarioInexistenteDevuelve404(): void
    {
        $this->withBodyFormat('json')
            ->call('put', 'users/999999', ['age' => 30])
            ->assertStatus(404);
    }

    #[Test]
    public function borrarUnUsuarioDevuelve204YLoQuitaDeLaBase(): void
    {
        $id = (new UserModel())->first()['id'];

        $resultado = $this->call('delete', "users/{$id}");

        $resultado->assertStatus(204);
        $this->dontSeeInDatabase('users', ['id' => $id]);
        $this->assertSame(11, (new UserModel())->countAllResults());
    }

    #[Test]
    public function borrarUnUsuarioInexistenteDevuelve404(): void
    {
        $this->call('delete', 'users/999999')->assertStatus(404);
    }
}
