import type { ReactNode } from 'react';

interface WindowProps {
  title: string;
  meta?: string;
  className?: string;
  children: ReactNode;
}

export function Window({ title, meta, className = '', children }: WindowProps) {
  return (
    <section className={`window ${className}`}>
      <header className="window-bar">
        <h2 className="window-title" title={title}>
          {title}
        </h2>
        {meta && <span className="window-meta">{meta}</span>}
      </header>
      <div className="window-body">{children}</div>
    </section>
  );
}
