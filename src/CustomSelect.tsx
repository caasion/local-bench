import { useState, useRef, useEffect } from "react";

interface CustomSelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CustomSelect({ options, value, onChange, disabled }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLabel = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div className="custom-select" ref={ref}>
      <button
        className="custom-select__trigger"
        onClick={() => !disabled && setOpen((o) => !o)}
        style={disabled ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
        type="button"
      >
        <span>{activeLabel}</span>
        <svg
          className={`custom-select__arrow ${open ? "custom-select__arrow--open" : ""}`}
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul className="custom-select__menu">
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`custom-select__option ${opt.value === value ? "custom-select__option--active" : ""}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
