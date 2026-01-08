import React from 'react';

export default function Button({ variant = 'primary', type = 'button', disabled, onClick, children }) {
  const className = `btn btn-${variant}`;
  return (
    <button type={type} className={className} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
