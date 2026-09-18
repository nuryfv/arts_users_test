<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Doce usuarios de ejemplo. Se insertan con el Query Builder y se
     * omiten los correos que ya existan, para poder relanzar el seeder
     * sin chocar con el indice unico de `email`.
     */
    public function run(): void
    {
        $usuarios = [
            ['first_name' => 'Ana',      'last_name' => 'Perez',   'email' => 'ana.perez@artistshot.test',      'gender' => 'femenino',  'telephone' => '3001234567', 'age' => 29],
            ['first_name' => 'Luis',     'last_name' => 'Gomez',   'email' => 'luis.gomez@artistshot.test',     'gender' => 'masculino', 'telephone' => '3007654321', 'age' => 41],
            ['first_name' => 'Camila',   'last_name' => 'Rojas',   'email' => 'camila.rojas@artistshot.test',   'gender' => 'femenino',  'telephone' => null,         'age' => 23],
            ['first_name' => 'Mateo',    'last_name' => 'Vargas',  'email' => 'mateo.vargas@artistshot.test',   'gender' => 'masculino', 'telephone' => '3112223344', 'age' => 35],
            ['first_name' => 'Valeria',  'last_name' => 'Castro',  'email' => 'valeria.castro@artistshot.test', 'gender' => 'femenino',  'telephone' => '3155556677', 'age' => 27],
            ['first_name' => 'Santiago', 'last_name' => 'Moreno',  'email' => 'santiago.moreno@artistshot.test', 'gender' => 'masculino', 'telephone' => null,        'age' => 52],
            ['first_name' => 'Daniela',  'last_name' => 'Ortiz',   'email' => 'daniela.ortiz@artistshot.test',  'gender' => 'femenino',  'telephone' => '3009998877', 'age' => 31],
            ['first_name' => 'Andres',   'last_name' => 'Herrera', 'email' => 'andres.herrera@artistshot.test', 'gender' => 'masculino', 'telephone' => '3204445566', 'age' => 45],
            ['first_name' => 'Lucia',    'last_name' => 'Navarro', 'email' => 'lucia.navarro@artistshot.test',  'gender' => 'otro',      'telephone' => '3181112233', 'age' => 19],
            ['first_name' => 'Felipe',   'last_name' => 'Suarez',  'email' => 'felipe.suarez@artistshot.test',  'gender' => 'masculino', 'telephone' => null,         'age' => 38],
            ['first_name' => 'Isabella', 'last_name' => 'Mendoza', 'email' => 'isabella.mendoza@artistshot.test', 'gender' => 'femenino', 'telephone' => '3016667788', 'age' => 26],
            ['first_name' => 'Tomas',    'last_name' => 'Ramirez', 'email' => 'tomas.ramirez@artistshot.test',  'gender' => 'masculino', 'telephone' => '3123334455', 'age' => 33],
        ];

        $existentes = $this->db->table('users')
            ->select('email')
            ->get()
            ->getResultArray();

        $correos = array_column($existentes, 'email');

        $nuevos = array_values(array_filter(
            $usuarios,
            static fn (array $u): bool => ! in_array($u['email'], $correos, true),
        ));

        if ($nuevos !== []) {
            $this->db->table('users')->insertBatch($nuevos);
        }
    }
}
