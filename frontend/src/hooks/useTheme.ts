import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

/** Alterna la clase `dark` del <html>, que es lo que lee Tailwind. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const guardado = localStorage.getItem('theme')
    if (guardado === 'light' || guardado === 'dark') {
      return guardado
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  return {
    theme,
    toggle: () => setTheme((actual) => (actual === 'dark' ? 'light' : 'dark')),
  }
}
