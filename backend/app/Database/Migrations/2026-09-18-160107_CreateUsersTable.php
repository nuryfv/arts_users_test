<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateUsersTable extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'unsigned'       => true,
                'auto_increment' => true,
            ],
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
        // Solo en MySQL 8.0.16 o superior: en SQLite (la conexion que usan
        // los tests) no existe ALTER TABLE ... ADD CONSTRAINT, y ahi queda
        // vigente la validacion del modelo.
        if ($this->db->DBDriver === 'MySQLi') {
            $tabla = $this->db->prefixTable('users');

            $this->db->query(
                "ALTER TABLE `{$tabla}` ADD CONSTRAINT `users_age_range` CHECK (`age` >= 0 AND `age` <= 125)"
            );
        }
    }

    public function down(): void
    {
        $this->forge->dropTable('users');
    }
}
