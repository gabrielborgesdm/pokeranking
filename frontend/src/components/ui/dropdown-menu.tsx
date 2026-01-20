"use client"

import * as React from "react"
import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Context for dropdown state
interface DropdownContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const DropdownContext = createContext<DropdownContextValue | null>(null)

function useDropdown() {
  const context = useContext(DropdownContext)
  if (!context) {
    throw new Error("Dropdown components must be used within a DropdownMenu")
  }
  return context
}

// Sub-menu context
interface SubMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLDivElement | null>
}

const SubMenuContext = createContext<SubMenuContextValue | null>(null)

function useSubMenu() {
  return useContext(SubMenuContext)
}

interface DropdownMenuProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  className?: string
}

function DropdownMenu({
  children,
  open: controlledOpen,
  onOpenChange,
  className,
}: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    },
    [controlledOpen, onOpenChange]
  )

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <div data-slot="dropdown-menu" className={cn("inline-flex flex-col gap-2", className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

function DropdownMenuTrigger({
  children,
  asChild,
  onClick,
  ...props
}: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdown()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setOpen(!open)
      onClick?.(e)
    },
    [open, setOpen, onClick]
  )

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      onClick: handleClick,
      ref: triggerRef,
      "aria-expanded": open,
      "aria-haspopup": "menu",
      ...props,
    } as React.HTMLAttributes<HTMLElement>)
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      data-slot="dropdown-menu-trigger"
      aria-expanded={open}
      aria-haspopup="menu"
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  sideOffset?: number
}

function DropdownMenuContent({
  children,
  className,
  align = "center",
  sideOffset = 8,
  ...props
}: DropdownMenuContentProps) {
  const { open, setOpen, triggerRef } = useDropdown()
  const contentRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)

  // Handle SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate position based on trigger element
  useEffect(() => {
    if (!open || !triggerRef.current) return

    const updatePosition = () => {
      const trigger = triggerRef.current
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()
      const contentWidth = contentRef.current?.offsetWidth || 200
      const contentHeight = contentRef.current?.offsetHeight || 200

      let left: number
      if (align === "start") {
        left = rect.left
      } else if (align === "end") {
        left = rect.right - contentWidth
      } else {
        left = rect.left + rect.width / 2 - contentWidth / 2
      }

      // Keep within viewport bounds
      const padding = 12
      left = Math.max(padding, Math.min(left, window.innerWidth - contentWidth - padding))

      // Calculate top position, flip to top if not enough space below
      let top = rect.bottom + sideOffset
      if (top + contentHeight > window.innerHeight - padding) {
        top = rect.top - contentHeight - sideOffset
      }

      setPosition({ top, left })
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)

    return () => {
      window.removeEventListener("resize", updatePosition)
    }
  }, [open, align, sideOffset, triggerRef])

  // Close on scroll outside
  useEffect(() => {
    if (!open) return

    const handleScroll = (e: Event) => {
      // Only close if scrolling outside the dropdown content
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    window.addEventListener("scroll", handleScroll, true)
    return () => window.removeEventListener("scroll", handleScroll, true)
  }, [open, setOpen])

  // Close on outside click
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node

      // Check if click is inside a submenu content (which is portaled to body)
      const subMenuContent = document.querySelector('[data-slot="dropdown-menu-sub-content"]')
      if (subMenuContent?.contains(target)) {
        return
      }

      if (
        contentRef.current &&
        !contentRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [open, setOpen, triggerRef])

  // Close on escape
  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, setOpen, triggerRef])

  if (!open || !mounted) return null

  const content = (
    <div
      ref={contentRef}
      data-slot="dropdown-menu-content"
      role="menu"
      className={cn(
        "fixed z-50 min-w-[10rem] overflow-hidden rounded-xl border bg-popover/95 backdrop-blur-sm p-1 text-popover-foreground shadow-xl",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
      {...props}
    >
      {children}
    </div>
  )

  return createPortal(content, document.body)
}

function DropdownMenuGroup({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="dropdown-menu-group" role="group" {...props}>
      {children}
    </div>
  )
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
  variant?: "default" | "destructive"
  disabled?: boolean
  asChild?: boolean
}

function DropdownMenuItem({
  children,
  className,
  inset,
  variant = "default",
  disabled,
  onClick,
  asChild,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdown()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) {
        e.preventDefault()
        return
      }
      onClick?.(e)
      setOpen(false)
    },
    [disabled, onClick, setOpen]
  )

  const itemClassName = cn(
    "relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none select-none transition-colors",
    "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
    "active:bg-accent/80",
    variant === "destructive" && "text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive",
    disabled && "pointer-events-none opacity-50",
    inset && "pl-8",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
    variant === "destructive" && "[&_svg]:!text-destructive",
    className
  )

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      className: cn(itemClassName, (children as React.ReactElement<{ className?: string }>).props.className),
      onClick: handleClick,
      role: "menuitem",
      tabIndex: disabled ? -1 : 0,
      ...props,
    } as React.HTMLAttributes<HTMLElement>)
  }

  return (
    <div
      data-slot="dropdown-menu-item"
      data-variant={variant}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      className={itemClassName}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
}

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

function DropdownMenuLabel({
  children,
  className,
  inset,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <div
      data-slot="dropdown-menu-label"
      className={cn(
        "px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      role="separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

// Sub-menu components
function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)

  return (
    <SubMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div data-slot="dropdown-menu-sub" className="relative">
        {children}
      </div>
    </SubMenuContext.Provider>
  )
}

interface DropdownMenuSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

function DropdownMenuSubTrigger({
  children,
  className,
  inset,
  ...props
}: DropdownMenuSubTriggerProps) {
  const subMenu = useSubMenu()
  if (!subMenu) return null

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    subMenu.setOpen(!subMenu.open)
  }

  return (
    <div
      ref={subMenu.triggerRef}
      data-slot="dropdown-menu-sub-trigger"
      data-state={subMenu.open ? "open" : "closed"}
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={subMenu.open}
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none select-none transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        inset && "pl-8",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </div>
  )
}

function DropdownMenuSubContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const subMenu = useSubMenu()
  const { setOpen: setMainMenuOpen } = useDropdown()
  const contentRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate position based on sub-trigger element
  useEffect(() => {
    if (!subMenu?.open || !subMenu.triggerRef.current) return

    const updatePosition = () => {
      const trigger = subMenu.triggerRef.current
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()
      const contentWidth = contentRef.current?.offsetWidth || 200
      const contentHeight = contentRef.current?.offsetHeight || 100

      let left = rect.right + 4
      let top = rect.top

      // If would overflow right, show on left side
      if (left + contentWidth > window.innerWidth - 8) {
        left = rect.left - contentWidth - 4
      }

      // Keep within vertical viewport bounds
      if (top + contentHeight > window.innerHeight - 8) {
        top = window.innerHeight - contentHeight - 8
      }

      setPosition({ top, left })
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [subMenu?.open, subMenu?.triggerRef])

  // Close submenu on outside click
  useEffect(() => {
    if (!subMenu?.open) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node

      // Don't close if clicking on the submenu trigger
      if (subMenu.triggerRef.current?.contains(target)) {
        return
      }

      // Don't close if clicking inside the submenu content
      if (contentRef.current?.contains(target)) {
        return
      }

      subMenu.setOpen(false)
    }

    // Use a small delay to prevent immediate closing when submenu just opened
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [subMenu])

  if (!subMenu?.open || !mounted) return null

  // Handle click on submenu items - close both submenu and main menu
  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    // Check if clicking on an actual menu item (not the container)
    if (target.closest('[data-slot="dropdown-menu-item"]')) {
      subMenu.setOpen(false)
      setMainMenuOpen(false)
    }
  }

  const content = (
    <div
      ref={contentRef}
      data-slot="dropdown-menu-sub-content"
      role="menu"
      className={cn(
        "fixed z-[51] min-w-[10rem] overflow-hidden rounded-xl border bg-popover/95 backdrop-blur-sm p-1 text-popover-foreground shadow-xl",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-left-2",
        className
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
      onClick={handleContentClick}
      {...props}
    >
      {children}
    </div>
  )

  return createPortal(content, document.body)
}

// Checkbox and Radio items - simplified versions
interface DropdownMenuCheckboxItemProps extends Omit<DropdownMenuItemProps, "children"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  children: React.ReactNode
}

function DropdownMenuCheckboxItem({
  children,
  checked,
  onCheckedChange,
  className,
  onClick,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onCheckedChange?.(!checked)
    onClick?.(e)
  }

  return (
    <DropdownMenuItem
      className={cn("pl-8", className)}
      onClick={handleClick}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      {children}
    </DropdownMenuItem>
  )
}

function DropdownMenuRadioGroup({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="dropdown-menu-radio-group" role="radiogroup" {...props}>
      {children}
    </div>
  )
}

interface DropdownMenuRadioItemProps extends Omit<DropdownMenuItemProps, "children"> {
  value: string
  children: React.ReactNode
}

function DropdownMenuRadioItem({
  children,
  className,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <DropdownMenuItem
      className={cn("pl-8", className)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-2"
        >
          <circle cx="12" cy="12" r="6" />
        </svg>
      </span>
      {children}
    </DropdownMenuItem>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
