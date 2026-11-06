"use client"

// Adapted from Cult UI direction-aware-tabs. See third-party/cult-ui/README.md.
import { type ReactNode, useId, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import useMeasure from "react-use-measure"
import { cn } from "@/lib/utils"

type Tab = { id: number; label: string; content: ReactNode }
interface DirectionAwareTabsProps {
  tabs: Tab[]
  className?: string
  rounded?: string
  roundedInner?: string
  ariaLabel?: string
  onChange?: () => void
  defaultTabId?: number
}

function DirectionAwareTabs({ tabs, className, rounded, roundedInner, ariaLabel = "Experience", onChange, defaultTabId }: DirectionAwareTabsProps) {
  const [selected, setSelected] = useState(defaultTabId ?? tabs[0]?.id)
  const [direction, setDirection] = useState(1)
  const [ref, bounds] = useMeasure()
  const reducedMotion = useReducedMotion()
  const prefix = useId()
  const buttons = useRef(new Map<number, HTMLButtonElement>())
  const activeTab = tabs.some(tab => tab.id === selected) ? selected : tabs[0]?.id
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab)
  const select = (id: number) => {
    if (id === activeTab) return
    setDirection(tabs.findIndex(tab => tab.id === id) > activeIndex ? 1 : -1)
    setSelected(id)
    onChange?.()
  }
  if (!tabs.length) return null

  return (
    <div className="flex w-full flex-col items-center">
      <div role="tablist" aria-label={ariaLabel} className={cn("flex space-x-1 rounded-full bg-neutral-200/70 p-1", className, rounded)}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${prefix}-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`${prefix}-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            ref={node => { if (node) buttons.current.set(tab.id, node); else buttons.current.delete(tab.id) }}
            onClick={() => select(tab.id)}
            onKeyDown={event => {
              let next = activeIndex
              if (event.key === "ArrowRight") next = (activeIndex + 1) % tabs.length
              else if (event.key === "ArrowLeft") next = (activeIndex - 1 + tabs.length) % tabs.length
              else if (event.key === "Home") next = 0
              else if (event.key === "End") next = tabs.length - 1
              else return
              event.preventDefault()
              select(tabs[next].id)
              buttons.current.get(tabs[next].id)?.focus()
            }}
            className={cn("relative rounded-full px-5 py-2.5 text-sm font-medium text-neutral-600 outline-offset-4 focus-visible:outline-2 focus-visible:outline-blue-600", activeTab === tab.id && "text-neutral-950", rounded && roundedInner)}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {activeTab === tab.id && <motion.span aria-hidden="true" layoutId={`${prefix}-bubble`} className={cn("absolute inset-0 rounded-full bg-white shadow-sm", rounded && roundedInner)} transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 450, damping: 36 }} />}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
      <motion.div className="relative mx-auto w-full overflow-hidden" initial={false} animate={{ height: bounds.height || "auto" }} transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 36 }}>
        <div className="p-1" ref={ref}>
          {tabs.map(tab => <div key={tab.id} role="tabpanel" id={`${prefix}-panel-${tab.id}`} aria-labelledby={`${prefix}-tab-${tab.id}`} hidden={activeTab !== tab.id} tabIndex={0}>
            {activeTab === tab.id && <motion.div key={`${tab.id}-content`} initial={reducedMotion ? false : { x: direction * 18, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}>{tab.content}</motion.div>}
          </div>)}
        </div>
      </motion.div>
    </div>
  )
}
export { DirectionAwareTabs }
