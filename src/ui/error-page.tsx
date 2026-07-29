const ERROR_STYLES = `
* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  background:
    radial-gradient(38rem 38rem at 110% -6%, rgba(232, 160, 60, 0.12), transparent 60%),
    radial-gradient(30rem 30rem at -12% 80%, rgba(196, 80, 27, 0.07), transparent 55%),
    #F6F2EA;
  color: #1C1917;
  text-align: center;
  padding: 1.5rem;
}
.box { max-width: 24rem; }
.code {
  font-size: 5rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  margin: 0 0 0.5rem;
  background: linear-gradient(120deg, #C4501B, #E8632C);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
h1 { font-size: 1.3rem; margin: 0 0 0.5rem; letter-spacing: -0.01em; }
p { color: #78716C; font-size: 0.95rem; line-height: 1.55; margin: 0 0 1.5rem; }
a {
  display: inline-block;
  padding: 0.7rem 1.5rem;
  border-radius: 9999px;
  background: linear-gradient(120deg, #C4501B, #E8632C);
  color: #FFF;
  font-weight: 650;
  text-decoration: none;
  box-shadow: 0 6px 16px -8px rgba(196, 80, 27, 0.5);
}
.brand { margin-top: 2rem; font-weight: 700; color: #1C1917; font-size: 0.9rem; }
.brand .dot {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  margin-right: 0.3rem;
  background: linear-gradient(135deg, #C4501B, #E8632C);
}
`;

export function errorPageHtml(props: {
  code: number;
  title: string;
  message: string;
  backHref: string;
  backLabel: string;
}): string {
  const page = (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>{`${props.code} — ${props.title}`}</title>
        <style dangerouslySetInnerHTML={{ __html: ERROR_STYLES }} />
      </head>
      <body>
        <div class="box">
          <p class="code">{String(props.code)}</p>
          <h1>{props.title}</h1>
          <p>{props.message}</p>
          <a href={props.backHref}>{props.backLabel}</a>
          <div class="brand">
            <span class="dot" />
            tokoweb
          </div>
        </div>
      </body>
    </html>
  );
  return `<!doctype html>${String(page)}`;
}

export function notFoundHtml(backHref = "/"): string {
  return errorPageHtml({
    code: 404,
    title: "Halaman tidak ditemukan",
    message: "Halaman yang kamu cari tidak ada atau sudah dipindah.",
    backHref,
    backLabel: "Kembali ke beranda",
  });
}

export function serverErrorHtml(backHref = "/"): string {
  return errorPageHtml({
    code: 500,
    title: "Ada gangguan sebentar",
    message:
      "Bukan salahmu — sistem kami sedang bermasalah. Coba muat ulang, atau kabari kami via WhatsApp kalau terus terjadi.",
    backHref,
    backLabel: "Muat ulang",
  });
}
