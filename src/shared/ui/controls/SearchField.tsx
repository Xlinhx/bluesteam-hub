import { useCallback, useRef, type ComponentPropsWithRef, type ReactNode } from 'react';
import { Search, X } from 'lucide-react';

type SearchFieldProps = Omit<ComponentPropsWithRef<'input'>, 'aria-label' | 'type' | 'value' | 'onChange' | 'className' | 'children'> & {
  label: string;
  type?: 'search' | 'text';
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
  trailingAction?: ReactNode;
};

export function SearchField({
  label, value, onChange, onClear, className = '', trailingAction, placeholder = label,
  disabled, ref, type = 'search', ...inputProps
}: SearchFieldProps) {
  const input = useRef<HTMLInputElement>(null);
  const bindInput = useCallback((node: HTMLInputElement | null) => {
    input.current = node;
    if (typeof ref === 'function') return ref(node);
    if (ref) ref.current = node;
  }, [ref]);

  return (
    <div className={`ui-search-field ${className}`} onClick={event => {
      if (event.target === event.currentTarget) input.current?.focus();
    }}>
      <span className="ui-search-icon" aria-hidden="true" onClick={() => input.current?.focus()}><Search size={17} /></span>
      <input
        {...inputProps}
        ref={bindInput}
        type={type}
        aria-label={label}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={event => onChange(event.target.value)}
      />
      {value && !disabled && (
        <button className="ui-search-clear" type="button" aria-label={`Xóa ${label.toLocaleLowerCase('vi')}`} onClick={() => {
          input.current?.focus({ preventScroll: true });
          if (onClear) onClear();
          else onChange('');
        }}>
          <X size={17} aria-hidden="true" />
        </button>
      )}
      {trailingAction}
    </div>
  );
}
