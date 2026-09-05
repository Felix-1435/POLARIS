import { Link } from 'wouter'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

type Props = {
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
  actions?: React.ReactNode
}

export default function PageHeader({ title, subtitle, backTo, backLabel = 'Back', actions }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6"
    >
      <div className="flex items-start gap-3 min-w-0">
        {backTo && (
          <Link href={backTo}>
            <a
              className="mt-0.5 shrink-0 flex items-center justify-center w-9 h-9 rounded-xl border border-ice-700 bg-ice-900/50 text-ice-300 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-colors"
              title={backLabel}
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
          </Link>
        )}
        <div className="min-w-0">
          {backTo && (
            <Link href={backTo}>
              <a className="text-[11px] text-ice-500 hover:text-cyan-400 transition-colors">{backLabel}</a>
            </Link>
          )}
          <h1 className="text-2xl font-bold text-ice-50 tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-ice-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </motion.div>
  )
}
