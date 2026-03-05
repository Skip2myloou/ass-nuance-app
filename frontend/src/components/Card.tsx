type CardProps = {
  title?: string;
  children: React.ReactNode;
  tone?: "neutral" | "soft" | "accent";
  delay?: number;
};

export default function Card({
  title,
  children,
  tone = "neutral",
  delay = 0,
}: CardProps) {
  return (
    <div
      className={`card card-${tone}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-content">{children}</div>
    </div>
  );
}
