'use client';

import { useRef } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder = 'Search locations...' }: SearchInputProps) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 300);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">
        🔍
      </span>
      <input
        type="text"
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-7 pr-2 py-1.5 bg-bg-tertiary border border-border rounded-lg text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors w-28 sm:w-44"
      />
    </div>
  );
}
