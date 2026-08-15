import * as React from "react"
import { cn } from "@/lib/utils"
import { FolderOpen } from "lucide-react"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center animate-in fade-in-50 duration-500",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-4">
          {icon || <FolderOpen className="h-10 w-10 text-slate-400" />}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="mb-4 mt-2 text-sm text-slate-500">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  )
}
