// Adapted from Motion Primitives by ibelick, MIT © 2024.
// Upstream source and local changes: third-party/motion-primitives/README.md.
import {
  createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
  type ComponentPropsWithoutRef, type CSSProperties, type ReactNode, type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, MotionConfig, motion, useReducedMotion, type Transition } from 'motion/react'
import { cn } from '@/lib/utils'
import './morphing-dialog.css'

type DialogContext = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  uniqueId: string
  triggerRef: RefObject<HTMLButtonElement | null>
  reducedMotion: boolean
}
const Context = createContext<DialogContext | null>(null)
const ExpandedContext = createContext(false)
const DialogElementContext = createContext<HTMLDialogElement | null>(null)
function useMorphingDialog() {
  const context = useContext(Context)
  if (!context) throw new Error('MorphingDialog components require MorphingDialog')
  return context
}

type ChildrenProps = { children: ReactNode; className?: string; style?: CSSProperties }
export function MorphingDialog({ children, transition }: { children: ReactNode; transition?: Transition }) {
  const [isOpen, setIsOpen] = useState(false)
  const uniqueId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const reducedMotion = Boolean(useReducedMotion())
  const value = useMemo(() => ({ isOpen, setIsOpen, uniqueId, triggerRef, reducedMotion }), [isOpen, uniqueId, reducedMotion])
  return <Context.Provider value={value}><MotionConfig transition={reducedMotion ? { duration: 0 } : (transition ?? { type: 'spring', duration: .45, bounce: 0 })}>{children}</MotionConfig></Context.Provider>
}

type TriggerProps = ChildrenProps & { 'aria-label'?: string }
export function MorphingDialogTrigger({ children, className, style, 'aria-label': label }: TriggerProps) {
  const { isOpen, setIsOpen, uniqueId, triggerRef, reducedMotion } = useMorphingDialog()
  return <motion.button
    ref={triggerRef} type="button" className={cn('mp-dialog-trigger', className)} style={style}
    layoutId={reducedMotion ? undefined : `dialog-${uniqueId}`}
    onClick={() => setIsOpen(true)} aria-haspopup="dialog" aria-expanded={isOpen}
    aria-controls={`motion-ui-morphing-dialog-content-${uniqueId}`} aria-label={label}
  >{children}</motion.button>
}

export function MorphingDialogContainer({ children, className, style }: ChildrenProps) {
  const { isOpen, setIsOpen, uniqueId, triggerRef, reducedMotion } = useMorphingDialog()
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [dialogElement, setDialogElement] = useState<HTMLDialogElement | null>(null)
  const connectDialog = useCallback((element: HTMLDialogElement | null) => {
    dialogRef.current = element
    setDialogElement(element)
  }, [])
  const pointerStartedOnBackdrop = useRef(false)
  const scrollLock = useRef<{ overflow: string; paddingRight: string } | null>(null)
  useEffect(() => { setMounted(true) }, [])

  const unlockScroll = () => {
    if (!scrollLock.current) return
    document.body.style.overflow = scrollLock.current.overflow
    document.body.style.paddingRight = scrollLock.current.paddingRight
    scrollLock.current = null
  }
  const finishClose = () => {
    dialogRef.current?.close()
    unlockScroll()
    if (triggerRef.current?.isConnected) triggerRef.current.focus({ preventScroll: true })
  }

  useLayoutEffect(() => {
    const dialog = dialogElement
    if (!mounted || !isOpen || !dialog) return
    if (!scrollLock.current) {
      const gap = Math.max(0, window.innerWidth - document.documentElement.clientWidth)
      scrollLock.current = { overflow: document.body.style.overflow, paddingRight: document.body.style.paddingRight }
      const padding = parseFloat(getComputedStyle(document.body).paddingRight) || 0
      document.body.style.overflow = 'hidden'
      if (gap) document.body.style.paddingRight = `${padding + gap}px`
    }
    if (!dialog.open) dialog.showModal()
    dialog.querySelector<HTMLButtonElement>('[data-dialog-close]')?.focus({ preventScroll: true })
  }, [isOpen, mounted, dialogElement])

  useEffect(() => () => {
    dialogRef.current?.close()
    unlockScroll()
  }, [])

  if (!mounted) return null
  return createPortal(<dialog
    ref={connectDialog} id={`motion-ui-morphing-dialog-content-${uniqueId}`}
    className={cn('mp-dialog', className)} style={style} data-open={isOpen}
    aria-labelledby={`motion-ui-morphing-dialog-title-${uniqueId}`}
    aria-describedby={`motion-ui-morphing-dialog-description-${uniqueId}`}
    onCancel={event => { event.preventDefault(); setIsOpen(false) }}
    onPointerDown={event => { pointerStartedOnBackdrop.current = event.target === event.currentTarget }}
    onClick={event => { if (pointerStartedOnBackdrop.current && event.target === event.currentTarget) setIsOpen(false) }}
  >
    <DialogElementContext.Provider value={dialogElement}><AnimatePresence initial={false} mode="sync" onExitComplete={finishClose}>
      {isOpen && <motion.div key={`stage-${uniqueId}`} className="mp-dialog-stage" layoutRoot
        initial={{ opacity: reducedMotion ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : .18 }}
      ><ExpandedContext.Provider value={true}>{children}</ExpandedContext.Provider></motion.div>}
    </AnimatePresence></DialogElementContext.Provider>
  </dialog>, document.body)
}

export function MorphingDialogContent({ children, className, style }: ChildrenProps) {
  const { uniqueId, reducedMotion } = useMorphingDialog()
  return <motion.div className={cn('mp-dialog-content', className)} style={style}
    layoutId={reducedMotion ? undefined : `dialog-${uniqueId}`} layoutScroll
  >{children}</motion.div>
}

export function MorphingDialogTitle({ children, className, style }: ChildrenProps) {
  const { uniqueId, reducedMotion } = useMorphingDialog()
  const expanded = useContext(ExpandedContext)
  return <motion.div className={className} style={style}
    layoutId={reducedMotion ? undefined : `dialog-title-container-${uniqueId}`}
    id={expanded ? `motion-ui-morphing-dialog-title-${uniqueId}` : undefined}
  >{children}</motion.div>
}

export function MorphingDialogSubtitle({ children, className, style }: ChildrenProps) {
  const { uniqueId, reducedMotion } = useMorphingDialog()
  return <motion.div className={className} style={style} layoutId={reducedMotion ? undefined : `dialog-subtitle-container-${uniqueId}`}>{children}</motion.div>
}

export function MorphingDialogDescription({ children, className, style, disableLayoutAnimation = false }: ChildrenProps & { disableLayoutAnimation?: boolean }) {
  const { uniqueId, reducedMotion } = useMorphingDialog()
  const expanded = useContext(ExpandedContext)
  return <motion.div className={className} style={style}
    id={expanded ? `motion-ui-morphing-dialog-description-${uniqueId}` : undefined}
    layoutId={reducedMotion || disableLayoutAnimation ? undefined : `dialog-description-content-${uniqueId}`}
  >{children}</motion.div>
}

type ImageProps = Omit<ComponentPropsWithoutRef<'img'>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'>
export function MorphingDialogImage({ src, alt, className, style, ...props }: ImageProps) {
  const { uniqueId, reducedMotion } = useMorphingDialog()
  return <motion.img {...props} src={src} alt={alt} className={className} style={style}
    layoutId={reducedMotion ? undefined : `dialog-img-${uniqueId}`} />
}

export function MorphingDialogClose({ children, className, 'aria-label': label = 'Close dialog' }: { children?: ReactNode; className?: string; 'aria-label'?: string }) {
  const { setIsOpen } = useMorphingDialog()
  const dialogElement = useContext(DialogElementContext)
  if (!dialogElement) return null
  // A native-dialog child escapes the content's temporary Motion transform.
  return createPortal(<button type="button" data-dialog-close className={cn('mp-dialog-close', className)} aria-label={label} onClick={() => setIsOpen(false)}>
    {children ?? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>}
  </button>, dialogElement)
}
