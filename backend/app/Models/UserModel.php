<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table            = 'users';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;

    protected $allowedFields = [
        'first_name',
        'last_name',
        'email',
        'gender',
        'telephone',
        'age',
    ];

    // La tabla no lleva columnas de fecha.
    protected $useTimestamps = false;

    // MySQLi devuelve todo como cadena; esto entrega enteros reales al JSON.
    // Van como nulables porque el cast corre ANTES de la validacion: si no
    // aceptan null, un campo vacio lanza una excepcion en vez de un 400.
    protected array $casts = [
        'id'  => '?int',
        'age' => '?int',
    ];

    protected $validationRules = [
        // Necesaria para poder usar {id} como marcador en is_unique.
        'id'         => 'permit_empty|is_natural_no_zero',
        'first_name' => 'required|string|max_length[50]',
        'last_name'  => 'required|string|max_length[50]',
        'email'      => 'required|valid_email|max_length[70]|is_unique[users.email,id,{id}]',
        'gender'     => 'required|string|max_length[10]',
        'telephone'  => 'permit_empty|string|max_length[20]',
        'age'        => 'required|is_natural|less_than_equal_to[125]',
    ];

    protected $validationMessages = [
        'first_name' => [
            'required'   => 'El nombre es obligatorio.',
            'max_length' => 'El nombre no puede superar los 50 caracteres.',
        ],
        'last_name' => [
            'required'   => 'El apellido es obligatorio.',
            'max_length' => 'El apellido no puede superar los 50 caracteres.',
        ],
        'email' => [
            'required'    => 'El correo es obligatorio.',
            'valid_email' => 'El correo no tiene un formato valido.',
            'max_length'  => 'El correo no puede superar los 70 caracteres.',
            'is_unique'   => 'Ya existe un usuario registrado con ese correo.',
        ],
        'gender' => [
            'required'   => 'El genero es obligatorio.',
            'max_length' => 'El genero no puede superar los 10 caracteres.',
        ],
        'telephone' => [
            'max_length' => 'El telefono no puede superar los 20 caracteres.',
        ],
        'age' => [
            'required'           => 'La edad es obligatoria.',
            'is_natural'         => 'La edad debe ser un numero entero de 0 o mas.',
            'less_than_equal_to' => 'La edad no puede ser mayor a 125.',
        ],
    ];

    protected $skipValidation     = false;
    protected $cleanValidationRules = true;
}
