import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

// ── Button ───────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'md' | 'sm'
  fullWidth?: boolean
  icon?: ReactNode
}

export function Button({ variant = 'primary', size = 'md', fullWidth, icon, children, className = '', ...rest }: ButtonProps) {
  const cls = ['btn', `btn--${variant}`, `btn--${size}`, fullWidth ? 'btn--full' : '', className].join(' ').trim()
  return (
    <button className={cls} {...rest}>
      {icon}
      {children}
    </button>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={`card ${className}`.trim()} onClick={onClick}>
      {children}
    </div>
  )
}

// ── Badge ────────────────────────────────────────────────────────────────────

type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'muted' | 'violet'

export function Badge({ tone = 'primary', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

// ── Section title ────────────────────────────────────────────────────────────

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {action}
    </div>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}

export function Modal({ open, onClose, title, children, wide }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
          }}
        >
          <motion.div
            className={`modal ${wide ? 'modal--wide' : ''}`}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3>{title}</h3>
              <button className="icon-btn" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="modal__body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Form fields ──────────────────────────────────────────────────────────────

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="input" {...props} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="input input--area" {...props} />
}

// ── Empty state ──────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}
