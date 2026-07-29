export function BrandLogo(props: { href?: string; className?: string; height?: number }) {
  const height = props.height ?? 30;
  const img = (
    <img
      src="/assets/logo-wide.png"
      alt="tokoweb.id"
      width={Math.round((height * 877) / 150)}
      height={height}
      style={`height:${height}px;width:auto;display:block`}
      decoding="async"
    />
  );
  const cls = `brand-logo${props.className ? ` ${props.className}` : ""}`;
  return props.href ? (
    <a class={cls} href={props.href} aria-label="tokoweb.id">
      {img}
    </a>
  ) : (
    <span class={cls}>{img}</span>
  );
}

export function FaviconLinks() {
  return (
    <>
      <link rel="icon" type="image/png" href="/assets/logo-square.png" />
      <link rel="apple-touch-icon" href="/assets/logo-square.png" />
    </>
  );
}
