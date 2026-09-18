<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateUsersTable extends Migration
{
    public function up(): void
    {
        // PostgreSQL no tiene enteros sin signo; ahi la clave primaria se
        // crea como SERIAL y el modificador sobra.
        $id = ['type' => 'INT', 'auto_increment' => true];

        if ($this->db->DBDriver !== 'Postgre') {
            $id['unsigned'] = true;
        }

        $this->forge->addField([
            'id' => $id,
            'first_name' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false,
            ],
            'last_name' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false,
            ],
            'email' => [
                'type'       => 'VARCHAR',
                'constraint' => 70,
                'null'       => false,
            ],
            'gender' => [
                'type'       => 'VARCHAR',
                'constraint' => 10,
                'null'       => false,
            ],
            'telephone' => [
                'type'       => 'VARCHAR',
                'constraint' => 20,
                'null'       => true,
                'default'    => null,
            ],
            'age' => [
                'type' => 'INT',
                'null' => false,
            ],
        ]);

        $this->forge->addPrimaryKey('id');
        $this->forge->addUniqueKey('email');
        $this->forge->createTable('users');

        // El rango de `age` se fuerza tambien en la propia base de datos.
        // MySQL lo admite desde 8.0.16 y PostgreSQL siempre; SQLite (la
        // conexion de los tests) no tiene ALTER TABLE ... ADD CONSTRAINT y
        // ahi queda vigente solo la validacion del modelo.
        $delimitadores = [
            'MySQLi'  => '`',
            'Postgre' => '"',
        ];

        $comilla = $delimitadores[$this->db->DBDriver] ?? null;

        if ($comilla !== null) {
            $tabla = $this->db->prefixTable('users');

            $this->db->query(sprintf(
                'ALTER TABLE %1$s%2$s%1$s ADD CONSTRAINT %1$susers_age_range%1$s'
                . ' CHECK (%1$sage%1$s >= 0 AND %1$sage%1$s <= 125)',
                $comilla,
                $tabla,
            ));
        }
    }

    public function down(): void
    {
        $this->forge->dropTable('users');
    }
}
