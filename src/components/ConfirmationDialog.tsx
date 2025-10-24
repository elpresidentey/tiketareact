import { ReactNode } from 'react'

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  confirmButtonClass?: string
  onConfirm: () => void
  onCancel: () => void
  icon?: ReactNode
}

const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-red-600 text-white hover:bg-red-700',
  onConfirm,
  onCancel,
  icon
}: ConfirmationDialogProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <h3 className={`text-lg font-medium text-gray-900 ${icon ? 'ml-3' : ''}`}>
            {title}
          </h3>
        </div>
        
        <div className="text-gray-600 mb-6">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog