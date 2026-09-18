export type User = {
  id: number
  first_name: string
  last_name: string
  email: string
  gender: string
  telephone: string | null
  age: number
}

/** Lo que viaja en el formulario: sin id y con la edad como texto. */
export type UserFormValues = {
  first_name: string
  last_name: string
  email: string
  gender: string
  telephone: string
  age: string
}

export type ListMeta = {
  page: number
  perPage: number
  total: number
  pages: number
}

export type UserListResponse = {
  data: User[]
  meta: ListMeta
}

/** Errores de validacion de CodeIgniter: { campo: mensaje }. */
export type FieldErrors = Partial<Record<keyof UserFormValues, string>>
