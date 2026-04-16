export default function Spinner({ size = 16 }: { size?: number }) {
  return (
    <div
      className="inline-block animate-spin rounded-full border-2 border-border border-t-accent"
      style={{ width: size, height: size }}
    />
  );
}
