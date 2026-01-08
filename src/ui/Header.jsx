import React from 'react';

export default function Header({ left, right }) {
  return (
    <header className="header">
      <div className="headerInner">
        <div>{left}</div>
        <div>{right}</div>
      </div>
    </header>
  );
}
