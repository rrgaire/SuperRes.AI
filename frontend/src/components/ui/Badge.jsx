import React from 'react';
import { clsx } from 'clsx';

const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: "bg-blue-900/30 text-blue-400 border-blue-800",
    green: "bg-green-900/30 text-green-400 border-green-800",
    gray: "bg-slate-800 text-slate-400 border-slate-700",
  };
  return (
    <span className={clsx("text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider", colors[color])}>
      {children}
    </span>
  );
};

export default Badge;