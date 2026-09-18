import { useBodyScrollLock } from '../hooks/useBodyScrollLock'

type Props = {
  open: boolean
  title: string
  message: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, busy, onConfirm, onCancel }: Props) {
  useBodyScrollLock(open)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="shadow-three dark:bg-gray-dark w-full max-w-[420px] rounded-xs bg-white p-8"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <h3 className="mb-3 text-xl font-bold text-black dark:text-white">{title}</h3>
        <p className="text-body-color mb-8 text-base">{message}</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onConfirm}
            disabled={busy}
            className="bg-danger cursor-pointer rounded-xs px-7 py-3 text-base font-medium text-white duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Eliminando...' : 'Si, eliminar'}
          </button>
          <button
            onClick={onCancel}
            className="text-body-color border-stroke dark:border-stroke-dark hover:border-primary hover:text-primary cursor-pointer rounded-xs border px-7 py-3 text-base font-medium duration-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
