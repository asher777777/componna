import React, { useState, useContext, createContext, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AccordionGroupContextType {
  activeId: string | null;
  toggleId: (id: string) => void;
}

const AccordionGroupContext = createContext<AccordionGroupContextType | null>(null);

/**
 * PageBuilderAccordionGroup enforces mutual exclusion across child accordions:
 * - Default state: ALL CLOSED (activeId: null)
 * - Only one accordion open at any time
 */
export const PageBuilderAccordionGroup: React.FC<{
  children: React.ReactNode;
  defaultActiveId?: string | null;
  className?: string;
}> = ({ children, defaultActiveId = null, className }) => {
  const [activeId, setActiveId] = useState<string | null>(defaultActiveId);

  const toggleId = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <AccordionGroupContext.Provider value={{ activeId, toggleId }}>
      <div className={twMerge('flex flex-col gap-3', className)}>{children}</div>
    </AccordionGroupContext.Provider>
  );
};

export interface PageBuilderAccordionProps {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
  badge?: React.ReactNode;
  actionNode?: React.ReactNode;
  className?: string;
}

export const PageBuilderAccordion: React.FC<PageBuilderAccordionProps> = ({
  id,
  title,
  subtitle,
  icon,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  children,
  badge,
  actionNode,
  className,
}) => {
  const group = useContext(AccordionGroupContext);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef<boolean>(false);

  // Determine whether this accordion is open:
  // 1. If inside an AccordionGroup with an ID, group state controls it.
  // 2. Else if controlled via isOpen/onToggle props, use controlled state.
  // 3. Otherwise fall back to local internal state (default false = all closed).
  const isGroupControlled = Boolean(group && id);
  const isDirectlyControlled = typeof controlledIsOpen === 'boolean';

  const effectiveOpen = isGroupControlled
    ? group!.activeId === id
    : isDirectlyControlled
    ? controlledIsOpen!
    : internalOpen;

  useEffect(() => {
    if (effectiveOpen && !prevOpenRef.current) {
      const timer = setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
      prevOpenRef.current = effectiveOpen;
      return () => clearTimeout(timer);
    }
    prevOpenRef.current = effectiveOpen;
  }, [effectiveOpen]);

  const handleToggle = () => {
    if (isGroupControlled) {
      group!.toggleId(id!);
    } else if (isDirectlyControlled && controlledOnToggle) {
      controlledOnToggle();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  return (
    <div
      ref={containerRef}
      className={twMerge(
        clsx(
          'border border-slate-800 bg-slate-900/40 rounded-2xl overflow-hidden transition-all duration-200',
          effectiveOpen && 'border-slate-700 bg-slate-900/80 shadow-lg ring-1 ring-amber-500/20',
          className
        )
      )}
      dir="rtl"
    >
      <div
        onClick={handleToggle}
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-slate-400">{icon}</span>}
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{title}</span>
              {badge}
            </div>
            {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {actionNode}
          <button
            type="button"
            onClick={handleToggle}
            className="p-1 text-slate-400 hover:text-white transition-transform cursor-pointer"
          >
            <ChevronDown
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                effectiveOpen && 'rotate-180 text-amber-400'
              )}
            />
          </button>
        </div>
      </div>

      {effectiveOpen && (
        <div className="px-4 py-3.5 border-t border-slate-800/80 bg-slate-950/40 flex flex-col gap-3.5 animate-in slide-in-from-top-1 duration-150">
          {children}
        </div>
      )}
    </div>
  );
};
