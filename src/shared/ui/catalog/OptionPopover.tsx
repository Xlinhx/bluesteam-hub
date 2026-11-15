import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import './option-popover.css';

export type PopoverOption = { value: string; label: string; icon?: ReactNode; group?: string; count?: number };

export function OptionPopover({ value, onChange, label, options, icon, disabled, className = '', triggerLabel, placeholder, fitTrigger = false }: {
  value: string; onChange: (value: string) => void; label: string; options: PopoverOption[];
  icon?: ReactNode; disabled?: boolean; className?: string; triggerLabel?: string;
  placeholder?: string; fitTrigger?: boolean;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const typed = useRef({ text: '', at: 0 });
  const selected = options.findIndex(option => option.value === value);
  const current = Math.min(active, options.length - 1);
  const optionId = (index: number) => `${id}-${index}`;

  function close(restore = false) {
    setOpen(false);
    typed.current = { text: '', at: 0 };
    if (restore) trigger.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    const element = panel.current;
    const button = trigger.current;
    if (!open || !element || !button) return;
    const place = () => {
      const { left, top, bottom, width } = button.getBoundingClientRect();
      const panelWidth = Math.min(fitTrigger ? width : Math.max(width, 250), window.innerWidth - 24);
      const modal = fitTrigger ? button.closest('.ocean-modal') : null;
      const pageHeader = fitTrigger && !modal ? document.querySelector('.bluesteam-app-header') : null;
      const mobileNav = fitTrigger && !modal ? document.querySelector('.bluesteam-mobile-nav') : null;
      const topEdge = Math.max(16, pageHeader?.getBoundingClientRect().bottom ?? 0, modal?.getBoundingClientRect().top ?? 0);
      const bottomEdge = Math.min(window.innerHeight - 16, mobileNav?.getClientRects().length ? mobileNav.getBoundingClientRect().top : Infinity);
      const below = bottomEdge - bottom - (fitTrigger ? 6 : 0);
      const above = top - topEdge - (fitTrigger ? 6 : 0);
      element.style.width = `${panelWidth}px`;
      const preferred = fitTrigger ? Math.min(280, element.scrollHeight + 2) : 240;
      const up = below < preferred && above > below;
      Object.assign(element.style, {
        left: `${Math.max(12, Math.min(left, window.innerWidth - panelWidth - 12))}px`,
        maxHeight: `${Math.max(44, Math.min(fitTrigger ? 280 : 300, up ? above : below))}px`,
        top: up ? 'auto' : `${bottom + 6}px`, bottom: up ? `${window.innerHeight - top + 6}px` : 'auto',
        transformOrigin: up ? 'bottom left' : 'top left',
      });
    };
    const outside = (event: Event) => {
      if (event.target instanceof Node && !element.contains(event.target) && !button.contains(event.target)) close();
    };
    const scroll = (event: Event) => {
      if (event.target instanceof Node && element.contains(event.target)) return;
      const bounds = button.getBoundingClientRect();
      if (bounds.bottom < 12 || bounds.top > window.innerHeight - 12) close();
      else place();
    };
    element.showPopover();
    place();
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('focusin', outside);
    document.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', place);
    return () => {
      element.hidePopover();
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', place);
    };
  }, [open, fitTrigger, options.length]);

  useEffect(() => {
    const element = panel.current;
    const row = open && current >= 0 ? element?.querySelector('[data-active=true]') : null;
    if (!row || !element) return;
    if (!fitTrigger) { row.scrollIntoView({ block: 'nearest' }); return; }
    const bounds = element.getBoundingClientRect();
    const item = row.getBoundingClientRect();
    if (item.top < bounds.top + 5) element.scrollTop += item.top - bounds.top - 5;
    else if (item.bottom > bounds.bottom - 5) element.scrollTop += item.bottom - bounds.bottom + 5;
  }, [open, current, fitTrigger]);

  function choose(option: PopoverOption) {
    onChange(option.value);
    close(true);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const { key } = event;
    if (key === 'Tab') { close(); return; }
    if (key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); close(true); return; }
    if (!options.length) return;
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(key)) {
      event.preventDefault();
      if (!open) { setActive(Math.max(0, selected)); setOpen(true); return; }
      if (key === 'Enter' || key === ' ') { choose(options[current]); return; }
      const next = key === 'Home' ? 0 : key === 'End' ? options.length - 1 :
        (current + (key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      setActive(next);
      return;
    }
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      typed.current = { text: (now - typed.current.at < 700 ? typed.current.text : '') + key.toLocaleLowerCase('vi'), at: now };
      const next = options.findIndex(option => option.label.toLocaleLowerCase('vi').startsWith(typed.current.text));
      if (next >= 0) {
        setActive(next);
        setOpen(true);
      }
    }
  }

  return <span className={`ocean-select ${className}`}>
    <button className="ui-filter-control" ref={trigger} type="button" role="combobox" aria-label={label}
      aria-expanded={open} aria-controls={`${id}-list`} aria-haspopup="listbox"
      aria-describedby={fitTrigger ? `${id}-value` : undefined}
      aria-activedescendant={open && current >= 0 ? optionId(current) : undefined} disabled={disabled || !options.length}
      onKeyDown={onKeyDown} onClick={() => {
        if (open) close();
        else { setActive(Math.max(0, selected)); setOpen(true); }
      }}>
      {icon}{triggerLabel&&<span className="ocean-select-label">{triggerLabel}</span>}
      <span className="ocean-select-value" id={fitTrigger ? `${id}-value` : undefined}>{options[selected]?.label ?? placeholder ?? label}</span><ChevronDown className="ocean-select-chevron" size={18} aria-hidden="true"/>
    </button>
    <div ref={panel} popover="manual" id={`${id}-list`} role="listbox" aria-label={label} className="ui-option-panel ocean-select-options">
      {options.map((option, index) => <div key={option.value} className="ocean-option-entry" role="presentation">
        {option.group && option.group !== options[index - 1]?.group && <div className="ocean-option-group" aria-hidden="true">{option.group}</div>}
        <div id={optionId(index)} role="option" className="ui-option-row" aria-selected={value === option.value} data-active={current === index}
          aria-describedby={option.group ? `${optionId(index)}-group` : undefined}
          onPointerMove={event => { if (event.pointerType === 'mouse') setActive(index); }}
          onMouseDown={event => event.preventDefault()} onClick={() => choose(option)}>
          {option.icon}<span>{option.label}</span>
          {option.group && <span id={`${optionId(index)}-group`} hidden>{option.group}</span>}
          {option.count !== undefined && <small className="ocean-option-count" aria-hidden="true">{option.count}</small>}
          {value === option.value && <Check className="ocean-option-check" size={18} aria-hidden="true"/>}
        </div>
      </div>)}
    </div>
  </span>;
}
