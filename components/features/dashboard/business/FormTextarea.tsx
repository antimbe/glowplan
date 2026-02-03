"use client";

import { LucideIcon } from "lucide-react";

interface FormTextareaProps {
  label: string;
  icon?: LucideIcon;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
}

const labelStyle = "text-xs font-semibold text-gray-600 uppercase tracking-wider";

export default function FormTextarea({ 
  label, 
  icon: Icon, 
  placeholder, 
  value, 
  onChange,
  rows = 4,
  required 
}: FormTextareaProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-primary/50" />}
        <label className={labelStyle}>{label}{required && " *"}</label>
      </div>
      <textarea
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
