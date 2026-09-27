export default function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src="/brand/solune-logo.png"
      width="1254"
      height="1254"
      alt=""
      aria-hidden="true"
      decoding="async"
    />
  );
}
