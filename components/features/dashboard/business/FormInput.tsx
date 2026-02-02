"use client";

import { LucideIcon } from "lucide-react";

interface FormInputProps {
  label: string;
  icon?: LucideIcon;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const inputStyle = "w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2a3626]/20 focus:border-[#2a3626]/40 transition-all";
const labelStyle = "text-xs font-semibold text-gray-600 uppercase tracking-wider";

export default function FormInput({ 
  label, 
  icon: Icon, 
  type = "text", 
  placeholder, 
  value, 
  onChange,
  required 
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-[#2a3626]/50" />}
        <label className={labelStyle}>{label}{required && " *"}</label>
      </div>
      <input
        type={type}
        placeholder={placeholder}
        className={inputStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
