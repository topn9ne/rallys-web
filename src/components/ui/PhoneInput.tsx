"use client";

import { useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { formatPhone, isValidUSPhone } from "@/lib/phone";

interface PhoneInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value"> {
  label?: string;
  error?: string;
  hint?: string;
  value?: string;
  onChange?: (formatted: string) => void;
}

export function PhoneInput({
  label,
  error,
  hint,
  className,
  id,
  defaultValue,
  value: controlledValue,
  onChange,
  required,
  ...props
}: PhoneInputProps) {
  const [internal, setInternal] = useState(() =>
    defaultValue ? formatPhone(String(defaultValue)) : ""
  );
  const [touched, setTouched] = useState(false);

  const isControlled = controlledValue !== undefined;
  const display = isControlled ? formatPhone(controlledValue) : internal;

  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const digits = display.replace(/\D/g, "");
  const isEmpty = digits.length === 0;
  const showError =
    touched && !isEmpty && !isValidUSPhone(display)
      ? "Enter a valid 10-digit phone number."
      : touched && isEmpty && required
        ? "Phone number is required."
        : null;

  const displayError = error || showError;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatPhone(e.target.value);
    if (isControlled) {
      onChange?.(formatted);
    } else {
      setInternal(formatted);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-gray-800"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="tel"
        value={display}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        placeholder="(555) 123-4567"
        required={required}
        className={cn(
          "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900",
          "placeholder:text-gray-400",
          "focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
          displayError && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {hint && !displayError && <p className="text-xs text-gray-500">{hint}</p>}
      {displayError && <p className="text-xs text-red-600">{displayError}</p>}
    </div>
  );
}
