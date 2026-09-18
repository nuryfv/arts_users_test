import { useEffect, useState } from 'react'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import { validarUsuario } from '../lib/validation'
import type { FieldErrors, User, UserFormValues } from '../types/user'

const VACIO: UserFormValues = {
  first_name: '',
  last_name: '',
  email: '',
  gender: '',
  telephone: '',
  age: '',
}

const CAMPO =
  'border-stroke text-body-color focus:border-primary dark:text-body-color-dark dark:shadow-two dark:focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none'

const ETIQUETA = 'text-dark mb-3 block text-sm font-medium dark:text-white'

type Props = {
  open: boolean
  user: User | null
  saving: boolean
  errors: FieldErrors
  onSubmit: (values: UserFormValues) => void
  onClose: () => void
}

export function UserForm({ open, user, saving, errors, onSubmit, onClose }: Props) {
  const [values, setValues] = useState<UserFormValues>(VACIO)
  // Campos ya corregidos: su error deja de mostrarse hasta el proximo envio.
  const [corregidos, setCorregidos] = useState<string[]>([])
  // Errores detectados en el navegador antes de llamar a la API.
  const [erroresLocales, setErroresLocales] = useState<FieldErrors>({})

  useBodyScrollLock(open)

  // Cada respuesta del servidor vuelve a mostrar todos sus errores.
  useEffect(() => {
    setCorregidos([])
    setErroresLocales({})
  }, [errors])

  // Rellena el formulario al abrirlo, o lo limpia si es un alta.
  useEffect(() => {
    if (!open) return

    setValues(
      user
        ? {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            gender: user.gender,
            telephone: user.telephone ?? '',
            age: String(user.age),
          }
        : VACIO,
    )
  }, [open, user])

  // Cerrar con Escape.
  useEffect(() => {
    if (!open) return

    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [open, onClose])

  if (!open) return null

  const set =
    (campo: keyof UserFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues((v) => ({ ...v, [campo]: e.target.value }))
      setCorregidos((c) => (c.includes(campo) ? c : [...c, campo]))
      setErroresLocales(({ [campo]: _, ...resto }) => resto)
    }

  // El error local pesa mas: es el ultimo que vio el usuario.
  const errorDe = (campo: keyof UserFormValues) =>
    erroresLocales[campo] ?? (corregidos.includes(campo) ? undefined : errors[campo])

  const enviar = (e: React.FormEvent) => {
    e.preventDefault()

    const fallos = validarUsuario(values)

    if (Object.keys(fallos).length > 0) {
      setErroresLocales(fallos)
      setCorregidos([])
      return
    }

    setErroresLocales({})
    onSubmit(values)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-10"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="shadow-three dark:bg-gray-dark w-full max-w-[640px] rounded-xs bg-white p-8 sm:p-[46px]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-formulario"
      >
        <h3
          id="titulo-formulario"
          className="mb-2 text-2xl font-bold text-black sm:text-3xl dark:text-white"
        >
          {user ? 'Editar usuario' : 'Nuevo usuario'}
        </h3>
        <p className="text-body-color mb-8 text-base font-medium">
          {user ? `Modificando el registro #${user.id}.` : 'Completa los datos para registrarlo.'}
        </p>

        <form onSubmit={enviar} noValidate>
          <div className="-mx-4 flex flex-wrap">
            <Campo
              label="Nombre"
              className="md:w-1/2"
              error={errorDe('first_name')}
              input={
                <input
                  type="text"
                  value={values.first_name}
                  onChange={set('first_name')}
                  maxLength={50}
                  placeholder="Ana"
                  className={CAMPO}
                />
              }
            />
            <Campo
              label="Apellido"
              className="md:w-1/2"
              error={errorDe('last_name')}
              input={
                <input
                  type="text"
                  value={values.last_name}
                  onChange={set('last_name')}
                  maxLength={50}
                  placeholder="Perez"
                  className={CAMPO}
                />
              }
            />
            <Campo
              label="Correo"
              error={errorDe('email')}
              input={
                <input
                  type="email"
                  value={values.email}
                  onChange={set('email')}
                  maxLength={70}
                  placeholder="ana@ejemplo.com"
                  className={CAMPO}
                />
              }
            />
            <Campo
              label="Genero"
              className="md:w-1/2"
              error={errorDe('gender')}
              input={
                <select value={values.gender} onChange={set('gender')} className={CAMPO}>
                  <option value="">Selecciona...</option>
                  <option value="femenino">Femenino</option>
                  <option value="masculino">Masculino</option>
                  <option value="otro">Otro</option>
                </select>
              }
            />
            <Campo
              label="Edad"
              className="md:w-1/2"
              error={errorDe('age')}
              input={
                <input
                  type="number"
                  value={values.age}
                  onChange={set('age')}
                  min={0}
                  max={125}
                  placeholder="29"
                  className={CAMPO}
                />
              }
            />
            <Campo
              label="Telefono (opcional)"
              error={errorDe('telephone')}
              input={
                <input
                  type="tel"
                  value={values.telephone}
                  onChange={set('telephone')}
                  maxLength={20}
                  placeholder="3001234567"
                  className={CAMPO}
                />
              }
            />

            <div className="flex w-full flex-wrap gap-4 px-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary shadow-submit hover:bg-primary/90 dark:shadow-submit-dark cursor-pointer rounded-xs px-9 py-4 text-base font-medium text-white duration-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Guardando...' : user ? 'Guardar cambios' : 'Crear usuario'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-body-color border-stroke dark:border-stroke-dark cursor-pointer rounded-xs border px-9 py-4 text-base font-medium duration-300 hover:border-primary hover:text-primary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function Campo({
  label,
  input,
  error,
  className = '',
}: {
  label: string
  input: React.ReactNode
  error?: string
  className?: string
}) {
  return (
    <div className={`w-full px-4 ${className}`}>
      <div className="mb-8">
        <label className={ETIQUETA}>{label}</label>
        {input}
        {error && <p className="text-danger mt-2 text-sm">{error}</p>}
      </div>
    </div>
  )
}
