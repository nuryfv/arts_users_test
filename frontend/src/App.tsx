import { useCallback, useEffect, useState } from 'react'
import { ConfirmDialog } from './components/ConfirmDialog'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { SectionTitle } from './components/SectionTitle'
import { UserForm } from './components/UserForm'
import { UsersTable } from './components/UsersTable'
import { ValidationError, createUser, deleteUser, listUsers, updateUser } from './services/users'
import type { FieldErrors, ListMeta, User, UserFormValues } from './types/user'

const POR_PAGINA = 10

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [meta, setMeta] = useState<ListMeta>({ page: 1, perPage: POR_PAGINA, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const [page, setPage] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('id')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  const [formOpen, setFormOpen] = useState(false)
  const [editando, setEditando] = useState<User | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState<FieldErrors>({})

  const [porBorrar, setPorBorrar] = useState<User | null>(null)
  const [borrando, setBorrando] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listUsers({ page, perPage: POR_PAGINA, q, sort, order })
      setUsers(res.data)
      setMeta(res.meta)
    } catch (e) {
      setAviso({ tipo: 'error', texto: (e as Error).message })
    } finally {
      setLoading(false)
    }
  }, [page, q, sort, order])

  useEffect(() => {
    void cargar()
  }, [cargar])

  // Espera a que el usuario deje de escribir antes de consultar.
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(busqueda.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [busqueda])

  // Los avisos se ocultan solos.
  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 5000)
    return () => clearTimeout(t)
  }, [aviso])

  function abrirNuevo() {
    setEditando(null)
    setErrores({})
    setFormOpen(true)
  }

  function abrirEdicion(user: User) {
    setEditando(user)
    setErrores({})
    setFormOpen(true)
  }

  async function guardar(values: UserFormValues) {
    setGuardando(true)
    setErrores({})
    try {
      if (editando) {
        await updateUser(editando.id, values)
        setAviso({ tipo: 'ok', texto: 'Usuario actualizado.' })
      } else {
        await createUser(values)
        setAviso({ tipo: 'ok', texto: 'Usuario creado.' })
      }
      setFormOpen(false)
      await cargar()
    } catch (e) {
      if (e instanceof ValidationError) {
        setErrores(e.fields)
      } else {
        setAviso({ tipo: 'error', texto: (e as Error).message })
      }
    } finally {
      setGuardando(false)
    }
  }

  async function confirmarBorrado() {
    if (!porBorrar) return

    setBorrando(true)
    try {
      await deleteUser(porBorrar.id)
      setAviso({ tipo: 'ok', texto: 'Usuario eliminado.' })
      setPorBorrar(null)

      // Si era el ultimo de la pagina, retrocede una.
      if (users.length === 1 && page > 1) {
        setPage((p) => p - 1)
      } else {
        await cargar()
      }
    } catch (e) {
      setAviso({ tipo: 'error', texto: (e as Error).message })
    } finally {
      setBorrando(false)
    }
  }

  function ordenarPor(campo: string) {
    if (sort === campo) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSort(campo)
      setOrder('asc')
    }
    setPage(1)
  }

  return (
    <div className="dark:bg-bg-color-dark flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section id="usuarios" className="py-16 md:py-20">
          <div className="container">
            <SectionTitle
              title="Gestion de usuarios"
              paragraph="Consulta, registra, edita y elimina los usuarios almacenados en la base de datos."
              center
              mb="56px"
            />

            {aviso && (
              <div
                role="status"
                className={`mb-6 rounded-xs px-6 py-4 text-base font-medium ${
                  aviso.tipo === 'ok' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                }`}
              >
                {aviso.texto}
              </div>
            )}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, apellido o correo..."
                className="border-stroke text-body-color focus:border-primary dark:text-body-color-dark dark:shadow-two dark:focus:border-primary w-full max-w-[420px] rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden dark:border-transparent dark:bg-[#2C303B]"
              />
              <button
                onClick={abrirNuevo}
                className="bg-primary shadow-btn hover:bg-primary/90 hover:shadow-btn-hover cursor-pointer rounded-xs px-8 py-3 text-base font-medium text-white duration-300"
              >
                Nuevo usuario
              </button>
            </div>

            <UsersTable
              users={users}
              loading={loading}
              sort={sort}
              order={order}
              onSort={ordenarPor}
              onEdit={abrirEdicion}
              onDelete={setPorBorrar}
            />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-body-color text-sm">
                {meta.total === 0
                  ? 'Sin resultados'
                  : `Mostrando ${users.length} de ${meta.total} usuario(s)`}
              </p>

              {meta.pages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="border-stroke dark:border-stroke-dark text-body-color hover:border-primary hover:text-primary cursor-pointer rounded-xs border px-5 py-2 text-sm font-medium duration-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span className="text-body-color px-2 text-sm">
                    Pagina {meta.page} de {meta.pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                    disabled={page >= meta.pages}
                    className="border-stroke dark:border-stroke-dark text-body-color hover:border-primary hover:text-primary cursor-pointer rounded-xs border px-5 py-2 text-sm font-medium duration-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <UserForm
        open={formOpen}
        user={editando}
        saving={guardando}
        errors={errores}
        onSubmit={guardar}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={porBorrar !== null}
        title="Eliminar usuario"
        message={`Se eliminara a ${porBorrar?.first_name} ${porBorrar?.last_name} de forma permanente.`}
        busy={borrando}
        onConfirm={confirmarBorrado}
        onCancel={() => setPorBorrar(null)}
      />
    </div>
  )
}

export default App
