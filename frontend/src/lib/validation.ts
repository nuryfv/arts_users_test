import type { FieldErrors, UserFormValues } from '../types/user'

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Validacion en el navegador, previa al envio. Refleja las mismas reglas
 * que aplica CodeIgniter en el servidor: esta capa da respuesta inmediata,
 * pero la del servidor sigue siendo la que manda.
 */
export function validarUsuario(values: UserFormValues): FieldErrors {
  const errores: FieldErrors = {}

  const nombre = values.first_name.trim()
  if (nombre === '') {
    errores.first_name = 'El nombre es obligatorio.'
  } else if (nombre.length > 50) {
    errores.first_name = 'El nombre no puede superar los 50 caracteres.'
  }

  const apellido = values.last_name.trim()
  if (apellido === '') {
    errores.last_name = 'El apellido es obligatorio.'
  } else if (apellido.length > 50) {
    errores.last_name = 'El apellido no puede superar los 50 caracteres.'
  }

  const correo = values.email.trim()
  if (correo === '') {
    errores.email = 'El correo es obligatorio.'
  } else if (!CORREO.test(correo)) {
    errores.email = 'El correo no tiene un formato valido.'
  } else if (correo.length > 70) {
    errores.email = 'El correo no puede superar los 70 caracteres.'
  }

  if (values.gender.trim() === '') {
    errores.gender = 'El genero es obligatorio.'
  }

  const telefono = values.telephone.trim()
  if (telefono.length > 20) {
    errores.telephone = 'El telefono no puede superar los 20 caracteres.'
  }

  const edad = values.age.trim()
  if (edad === '') {
    errores.age = 'La edad es obligatoria.'
  } else if (!/^\d+$/.test(edad)) {
    errores.age = 'La edad debe ser un numero entero de 0 o mas.'
  } else if (Number(edad) > 125) {
    errores.age = 'La edad no puede ser mayor a 125.'
  }

  return errores
}
