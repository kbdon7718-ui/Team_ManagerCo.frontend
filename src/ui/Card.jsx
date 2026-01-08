import React from 'react';

export default function Card({ title, children, className = '' }) {
  return (
    <section className={`card ${className}`.trim()}>
      {title ? <div className="cardTitle">{title}</div> : null}
      <div className="cardBody">{children}</div>
    </section>
  );
}
