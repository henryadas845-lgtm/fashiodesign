export default function PlaceholderImage({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 text-gray-400 text-center p-6 ${className}`}>
      <span className="font-medium text-sm tracking-wide uppercase">{text}</span>
    </div>
  );
}
