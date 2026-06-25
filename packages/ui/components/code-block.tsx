import type { ReactNode } from 'react';

interface CodeBlockProps {
  children: ReactNode;
  id?: string;
}

const style: React.CSSProperties = {
  borderRadius: 12,
  padding: 16,
  backgroundColor: '#ffffff',
  border: '1px solid #ebebeb',
  fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
  fontSize: 14,
  lineHeight: 1.6,
  overflowX: 'auto',
  whiteSpace: 'pre-wrap',
};

export function CodeBlock({ children, id }: CodeBlockProps) {
  return <pre id={id} style={style}><code>{children}</code></pre>;
}
