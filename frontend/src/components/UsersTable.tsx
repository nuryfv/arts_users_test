import type { User } from '../types/user'

type Props = {
  users: User[]
  loading: boolean
  sort: string
  order: 'asc' | 'desc'
  onSort: (campo: string) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

const COLUMNAS: { campo: string; titulo: string; ordenable: boolean }[] = [
  { campo: 'id', titulo: '#', ordenable: true },
  { campo: 'first_name', titulo: 'Nombre', ordenable: true },
  { campo: 'email', titulo: 'Correo', ordenable: true },
  { campo: 'gender', titulo: 'Genero', ordenable: false },
  { campo: 'telephone', titulo: 'Telefono', ordenable: false },
  { campo: 'age', titulo: 'Edad', ordenable: true },
]

export function UsersTable({ users, loading, sort, order, onSort, onEdit, onDelete }: Props) {
  return (
    <div className="shadow-three dark:bg-gray-dark overflow-x-auto rounded-xs bg-white">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="border-b border-gray-200 dark:border-stroke-dark">
            {COLUMNAS.map((c) => (
              <th key={c.campo} className="px-6 py-5">
                {c.ordenable ? (
                  <button
                    onClick={() => onSort(c.campo)}
                    className="text-dark hover:text-primary flex cursor-pointer items-center gap-1 text-sm font-semibold dark:text-white"
                  >
                    {c.titulo}
                    <span className="text-body-color text-xs">
                      {sort === c.campo ? (order === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  </button>
                ) : (
                  <span className="text-dark text-sm font-semibold dark:text-white">{c.titulo}</span>
                )}
              </th>
            ))}
            <th className="px-6 py-5 text-right">
              <span className="text-dark text-sm font-semibold dark:text-white">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={7} className="text-body-color px-6 py-12 text-center text-base">
                Cargando usuarios...
              </td>
            </tr>
          )}

          {!loading && users.length === 0 && (
            <tr>
              <td colSpan={7} className="text-body-color px-6 py-12 text-center text-base">
                Todavia no hay usuarios registrados.
              </td>
            </tr>
          )}

          {!loading &&
            users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-gray-200 last:border-0 hover:bg-gray-light dark:border-stroke-dark dark:hover:bg-black/20"
              >
                <td className="text-body-color px-6 py-5 text-base">{u.id}</td>
                <td className="px-6 py-5">
                  <span className="text-dark text-base font-medium dark:text-white">
                    {u.first_name} {u.last_name}
                  </span>
                </td>
                <td className="text-body-color px-6 py-5 text-base">{u.email}</td>
                <td className="px-6 py-5">
                  <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium capitalize">
                    {u.gender}
                  </span>
                </td>
                <td className="text-body-color px-6 py-5 text-base">{u.telephone ?? '—'}</td>
                <td className="text-body-color px-6 py-5 text-base">{u.age}</td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(u)}
                      className="text-primary hover:bg-primary/10 cursor-pointer rounded-xs px-4 py-2 text-sm font-medium duration-300"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(u)}
                      className="text-danger cursor-pointer rounded-xs px-4 py-2 text-sm font-medium duration-300 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
