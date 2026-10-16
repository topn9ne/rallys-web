type PlaceholderProps = {
  label: string;
  ratio?: "1/1" | "3/4" | "4/3" | "4/5" | "16/9";
  /** Base fill color (behind the diagonal stripes). */
  bg?: string;
  /** Stripe color. */
  stripe?: string;
  /** Label text color. */
  color?: string;
  fontSize?: number;
  radius?: number;
};

/**
 * Diagonal-striped photo placeholder with a monospace intent label.
 * Used everywhere the real imagery hasn't landed yet. Keep until the client
 * provides final photos — the labels describe what each real photo should be.
 *
 * Keep until the client provides final photos — the labels describe what each
 * real photo should be.
 */
export function Placeholder({
  label,
  ratio = "16/9",
  bg = "rgba(255,255,255,0.08)",
  stripe = "rgba(74,123,255,0.14)",
  color = "rgba(255,255,255,0.60)",
  fontSize = 11,
  radius = 0,
}: PlaceholderProps) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: ratio,
        background: `repeating-linear-gradient(135deg, ${bg} 0 14px, ${stripe} 14px 15px)`,
        borderRadius: radius,
      }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center p-4 text-center uppercase"
        style={{
          fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
          fontSize,
          letterSpacing: 0.5,
          color,
        }}
      >
        {label}
      </div>
    </div>
  );
}
