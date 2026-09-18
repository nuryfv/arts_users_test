import { useEffect } from 'react'

/**
 * Congela el scroll de la pagina mientras hay un dialogo abierto.
 *
 * El bloqueo va sobre <html>, que es quien desplaza el documento; ponerlo
 * solo en <body> no basta. Se compensa el ancho de la barra de scroll para
 * que el contenido no salte al abrir el dialogo.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return

    const raiz = document.documentElement
    const overflowPrevio = raiz.style.overflow
    const paddingPrevio = raiz.style.paddingRight
    const anchoBarra = window.innerWidth - raiz.clientWidth

    raiz.style.overflow = 'hidden'
    if (anchoBarra > 0) {
      raiz.style.paddingRight = `${anchoBarra}px`
    }

    return () => {
      raiz.style.overflow = overflowPrevio
      raiz.style.paddingRight = paddingPrevio
    }
  }, [active])
}
