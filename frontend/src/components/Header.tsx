import { useTheme } from '../hooks/useTheme'

export function Header() {
  const { theme, toggle } = useTheme()

  return (
    <header className="dark:bg-dark/80 sticky top-0 left-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-stroke-dark">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-2">
            <span className="bg-primary flex h-9 w-9 items-center justify-center rounded-xs text-lg font-bold text-white">
              A
            </span>
            <span className="text-xl font-bold text-black dark:text-white">Artistshot</span>
          </a>

          <nav className="hidden items-center gap-10 md:flex">
            <a
              href="#usuarios"
              className="text-dark hover:text-primary text-base font-medium dark:text-white/70 dark:hover:text-white"
            >
              Usuarios
            </a>
          </nav>

          <button
            onClick={toggle}
            aria-label="Cambiar tema"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gray-light text-black duration-300 hover:text-primary dark:bg-gray-dark dark:text-white"
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm0-18a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1Zm11 11a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1ZM4 12a1 1 0 0 1-1 1H1a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1Zm15.07 7.07a1 1 0 0 1-1.41 0l-1.42-1.42a1 1 0 0 1 1.42-1.41l1.41 1.41a1 1 0 0 1 0 1.42ZM7.76 7.76a1 1 0 0 1-1.41 0L4.93 6.34a1 1 0 0 1 1.41-1.41l1.42 1.41a1 1 0 0 1 0 1.42Zm-2.83 11.31a1 1 0 0 1 0-1.42l1.42-1.41a1 1 0 0 1 1.41 1.41l-1.41 1.42a1 1 0 0 1-1.42 0ZM16.24 7.76a1 1 0 0 1 0-1.42l1.42-1.41a1 1 0 1 1 1.41 1.41l-1.41 1.42a1 1 0 0 1-1.42 0Z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21.64 13a1 1 0 0 0-1.05-.14 8 8 0 0 1-10.45-10.4A1 1 0 0 0 9 1.1 10 10 0 1 0 22 14.05a1 1 0 0 0-.36-1.05Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
