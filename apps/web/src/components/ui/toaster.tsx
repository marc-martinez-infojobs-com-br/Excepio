"use client"

import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@components/ui/toast"
import { useToast } from "@hooks/use-toast"

function getToastIcon(variant: string | undefined) {
  const iconClass = "h-5 w-5 shrink-0"
  
  switch (variant) {
    case "error":
    case "destructive":
      return <AlertCircle className={`${iconClass} text-red-600 dark:text-red-400`} />
    case "warning":
      return <AlertTriangle className={`${iconClass} text-amber-600 dark:text-amber-400`} />
    case "success":
      return <CheckCircle className={`${iconClass} text-green-600 dark:text-green-400`} />
    case "info":
      return <Info className={`${iconClass} text-blue-600 dark:text-blue-400`} />
    default:
      return null
  }
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, showCloseButton = true, ...props }) {
        const icon = getToastIcon(variant)
        
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              {icon}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            {showCloseButton && <ToastClose />}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
