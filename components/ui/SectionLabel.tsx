const COLOR_CLASS = {
  accent: "text-accent",
  accent2: "text-accent2",
  text: "text-text",
} as const;

export default function SectionLabel({
  children,
  color = "accent2",
}: {
  children: React.ReactNode;
  color?: keyof typeof COLOR_CLASS;
}) {
  return (
    <div
      className={`mb-3.5 font-display text-xs font-bold uppercase tracking-[0.08em] ${COLOR_CLASS[color]}`}
    >
      {children}
    </div>
  );
}
