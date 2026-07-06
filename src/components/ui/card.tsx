type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return <div className={`surface-card min-w-0 ${className}`.trim()}>{children}</div>;
}
