export default function SectionLabel({
  children,
  color = "accent2",
}: {
  children: React.ReactNode;
  color?: "accent" | "accent2";
}) {
  return (
    <div
      className={`mb-3.5 font-display text-xs font-bold uppercase tracking-[0.08em] ${
        color === "accent" ? "text-accent" : "text-accent2"
      }`}
    >
      {children}
    </div>
  );
}
