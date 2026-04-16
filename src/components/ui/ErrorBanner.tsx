export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded bg-red-900/30 border border-red-700/50 text-red-300 text-xs">
      <span>⚠</span>
      <span>{message}</span>
    </div>
  );
}
