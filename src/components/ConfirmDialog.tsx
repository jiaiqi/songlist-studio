import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = '确认',
  cancelLabel = '取消',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="confirm-dialog-overlay" role="dialog" aria-modal="true">
      <button
        className="confirm-dialog-overlay-backdrop"
        type="button"
        onClick={onCancel}
        aria-label="关闭对话框"
      />
      <div className="confirm-dialog" role="alertdialog" aria-labelledby="confirm-dialog-title">
        <h3 id="confirm-dialog-title">{title}</h3>
        <p>{message}</p>
        <div className="confirm-dialog-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            className="primary-button danger"
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
