<?php

namespace App\Controllers\Api;

use App\Models\UserModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Users extends ResourceController
{
    protected $modelName = UserModel::class;
    protected $format    = 'json';

    /**
     * Los datos invalidos responden 422 (Unprocessable Content) en vez del
     * 400 que trae CodeIgniter por defecto.
     *
     * @var array<string, int>
     */
    protected $codes = [
        'created'                  => 201,
        'updated'                  => 200,
        'deleted'                  => 204,
        'no_content'               => 204,
        'invalid_request'          => 400,
        'unsupported_response_type' => 400,
        'invalid_scope'            => 400,
        'temporarily_unavailable'  => 400,
        'invalid_grant'            => 400,
        'invalid_credentials'      => 400,
        'invalid_refresh'          => 400,
        'no_data'                  => 422,
        'invalid_data'             => 422,
        'access_denied'            => 401,
        'unauthorized'             => 401,
        'invalid_client'           => 401,
        'forbidden'                => 403,
        'resource_not_found'       => 404,
        'not_acceptable'           => 406,
        'resource_exists'          => 409,
        'conflict'                 => 409,
        'resource_gone'            => 410,
        'payload_too_large'        => 413,
        'unsupported_media_type'   => 415,
        'too_many_requests'        => 429,
        'server_error'             => 500,
        'unsupported_grant_type'   => 501,
        'not_implemented'          => 501,
    ];

    /**
     * GET /api/users
     *
     * Admite ?page=, ?perPage=, ?q= (busca en nombre, apellido y correo)
     * y ?sort= / ?order= para el ordenamiento.
     */
    public function index(): ResponseInterface
    {
        $perPage = (int) ($this->request->getGet('perPage') ?? 10);
        $perPage = max(1, min($perPage, 100));
        $page    = max(1, (int) ($this->request->getGet('page') ?? 1));

        $sortable = ['id', 'first_name', 'last_name', 'email', 'age'];
        $sort     = in_array($this->request->getGet('sort'), $sortable, true)
            ? $this->request->getGet('sort')
            : 'id';
        $order = strtolower((string) $this->request->getGet('order')) === 'desc' ? 'DESC' : 'ASC';

        $builder = $this->model->orderBy($sort, $order);

        if (($q = trim((string) $this->request->getGet('q'))) !== '') {
            $builder = $builder->groupStart()
                ->like('first_name', $q)
                ->orLike('last_name', $q)
                ->orLike('email', $q)
                ->groupEnd();
        }

        $users = $builder->paginate($perPage, 'default', $page);
        $pager = $this->model->pager;

        return $this->respond([
            'data' => $users,
            'meta' => [
                'page'    => $page,
                'perPage' => $perPage,
                'total'   => $pager->getTotal(),
                'pages'   => $pager->getPageCount(),
            ],
        ]);
    }

    /**
     * GET /api/users/{id}
     */
    public function show($id = null): ResponseInterface
    {
        $user = $this->model->find((int) $id);

        if ($user === null) {
            return $this->failNotFound('No existe un usuario con el id ' . $id . '.');
        }

        return $this->respond(['data' => $user]);
    }

    /**
     * POST /api/users
     */
    public function create(): ResponseInterface
    {
        $data = $this->requestData();

        if ($data === []) {
            // Sin cuerpo, se valida igualmente para que la respuesta diga
            // cuales son los campos obligatorios en vez de un error suelto.
            $data = array_fill_keys(
                ['first_name', 'last_name', 'email', 'gender', 'age'],
                null,
            );
        }

        $id = $this->model->insert($data, true);

        if ($id === false) {
            return $this->failValidationErrors($this->model->errors());
        }

        return $this->respondCreated([
            'data'    => $this->model->find($id),
            'message' => 'Usuario creado.',
        ]);
    }

    /**
     * PUT|PATCH /api/users/{id}
     */
    public function update($id = null): ResponseInterface
    {
        $id = (int) $id;

        if ($this->model->find($id) === null) {
            return $this->failNotFound('No existe un usuario con el id ' . $id . '.');
        }

        $data = $this->requestData();

        if ($data === []) {
            return $this->failValidationErrors('No se recibieron datos.');
        }

        // Necesario para que la regla is_unique excluya al propio registro.
        $data['id'] = $id;

        if ($this->model->update($id, $data) === false) {
            return $this->failValidationErrors($this->model->errors());
        }

        return $this->respond([
            'data'    => $this->model->find($id),
            'message' => 'Usuario actualizado.',
        ]);
    }

    /**
     * DELETE /api/users/{id}
     */
    public function delete($id = null): ResponseInterface
    {
        $id = (int) $id;

        if ($this->model->find($id) === null) {
            return $this->failNotFound('No existe un usuario con el id ' . $id . '.');
        }

        $this->model->delete($id);

        // 204: borrado correcto, sin cuerpo de respuesta.
        return $this->respondNoContent();
    }

    /**
     * Lee el cuerpo como JSON y, si no lo es, cae a los datos de formulario.
     *
     * @return array<string, mixed>
     */
    private function requestData(): array
    {
        $json = $this->request->getJSON(true);

        if (is_array($json) && $json !== []) {
            return $json;
        }

        return (array) ($this->request->getRawInput() ?: []);
    }
}
