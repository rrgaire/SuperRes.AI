import React from 'react';
import { twMerge } from 'tailwind-merge';

const Button = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none font-medium";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-900/20 tracking-wide",
    outline: "border border-slate-600 text-gray-400 hover:text-white hover:border-slate-500 hover:bg-slate-800 bg-transparent",
    ghost: "text-gray-400 hover:text-white hover:bg-slate-800",
    danger: "border border-red-900/30 text-red-400 hover:bg-red-900/20 hover:border-red-800 bg-transparent",
    secondary: "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
  };

  return (
    <button className={twMerge(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};

export default Button;