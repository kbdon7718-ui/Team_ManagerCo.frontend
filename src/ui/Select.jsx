import React from 'react';

export default function Select({ value, onChange, options, placeholder = 'Select…' }) {
  return (
    <select className="select" value={value || ''} onChange={(e) => onChange(e.target.value)}>
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
