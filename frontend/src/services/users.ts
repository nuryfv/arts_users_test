import { AxiosError } from 'axios'
import { api } from '../lib/api'
import type { FieldErrors, User, UserFormValues, UserListResponse } from '../types/user'

export type ListParams = {
  page?: number
  perPage?: number
  q?: string
  sort?: string
  order?: 'asc' | 'desc'
}

/**
 * Error de validacion devuelto por la API (HTTP 400), con el detalle
 * por campo para pintarlo bajo cada input.
 */
export class ValidationError extends Error {
  readonly fields: FieldErrors

  constructor(fields: FieldErrors) {
    super('La API rechazo los datos enviados.')
    this.name = 'ValidationError'
    this.fields = fields
  }
}

type ApiErrorBody = { messages?: Record<string, string> }

/** Traduce cualquier fallo de axios a un Error con mensaje legible. */
function toError(error: unknown): Error {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined
    const estado = error.response?.status

    // 422 es lo que responde la API ante datos invalidos; se acepta 400
    // por compatibilidad con el comportamiento anterior de CodeIgniter.
    if ((estado === 422 || estado === 400) && body?.messages) {
      return new ValidationError(body.messages as FieldErrors)
    }

    if (body?.messages?.error) {
      return new Error(body.messages.error)
    }

    if (error.code === 'ERR_NETWORK') {
      return new Error('No se pudo contactar al servidor. Verifica que el backend este corriendo.')
    }

    return new Error(error.message)
  }

  return error instanceof Error ? error : new Error('Error desconocido.')
}

export async function listUsers(params: ListParams = {}): Promise<UserListResponse> {
  try {
    const { data } = await api.get<UserListResponse>('/users', { params })
    return data
  } catch (error) {
    throw toError(error)
  }
}

export async function createUser(values: UserFormValues): Promise<User> {
  try {
    const { data } = await api.post<{ data: User }>('/users', serialize(values))
    return data.data
  } catch (error) {
    throw toError(error)
  }
}

export async function updateUser(id: number, values: UserFormValues): Promise<User> {
  try {
    const { data } = await api.put<{ data: User }>(`/users/${id}`, serialize(values))
    return data.data
  } catch (error) {
    throw toError(error)
  }
}

export async function deleteUser(id: number): Promise<void> {
  try {
    await api.delete(`/users/${id}`)
  } catch (error) {
    throw toError(error)
  }
}

/** El telefono vacio viaja como null y la edad como numero. */
function serialize(values: UserFormValues) {
  return {
    ...values,
    telephone: values.telephone.trim() === '' ? null : values.telephone.trim(),
    age: values.age === '' ? null : Number(values.age),
  }
}
