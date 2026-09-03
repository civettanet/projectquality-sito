// Genera le pagine statiche del blog (public/blog/) a partire dai post
// markdown in content/blog/. Eseguito da Vercel ad ogni deploy (npm run build).
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content", "blog");
const OUT_DIR = path.join(ROOT, "public", "blog");

const md = new MarkdownIt({ html: false, linkify: true, breaks: false });

const STYLE = `
  :root{
    --navy:#203b72;--blue:#046bd2;--blue-dark:#045cb4;--bg-soft:#F0F5FA;
    --slate-700:#334155;--slate-500:#475569;--slate-300:#D1D5DB;
  }
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{margin:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--slate-700);background:#fff;line-height:1.6;}
  a{color:inherit;}
  .wrap{max-width:900px;margin:0 auto;padding:0 24px;}
  img{max-width:100%;display:block;border-radius:12px;}

  header.site{position:sticky;top:0;z-index:20;background:#fff;border-bottom:1px solid #eef1f5;}
  .site-header-inner{max-width:1120px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
  .logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:1.15rem;color:var(--navy);text-decoration:none;}
  .logo img{height:34px;width:auto;border-radius:4px;}
  nav.main-nav{display:none;gap:20px;font-size:.88rem;font-weight:600;flex-wrap:wrap;}
  nav.main-nav a{text-decoration:none;color:var(--slate-700);white-space:nowrap;}
  nav.main-nav a:hover, nav.main-nav a.active{color:var(--blue);}
  @media(min-width:900px){ nav.main-nav{display:flex;} }
  .btn{display:inline-block;padding:12px 22px;border-radius:8px;font-weight:700;font-size:.95rem;text-decoration:none;border:2px solid transparent;cursor:pointer;}
  .btn-primary{background:var(--blue);color:#fff;box-shadow:0 4px 14px rgba(4,107,210,.25);}
  .btn-primary:hover{background:var(--blue-dark);}

  .hero{background:linear-gradient(180deg,var(--bg-soft) 0%,#fff 100%);padding:48px 0 36px;}
  .kicker{display:inline-block;font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--blue);background:#e8f2fd;padding:5px 12px;border-radius:999px;margin-bottom:16px;}
  h1{font-size:2rem;line-height:1.2;color:var(--navy);margin:0 0 14px;font-weight:800;}
  .lead{font-size:1.05rem;color:var(--slate-500);margin:0;max-width:680px;}

  section{padding:36px 0;}
  .post-list{display:flex;flex-direction:column;gap:18px;}
  .post-card{border:1px solid #e6ebf2;border-radius:14px;padding:22px;background:#fff;text-decoration:none;display:block;}
  .post-card:hover{border-color:var(--blue);}
  .post-card .date{font-size:.78rem;font-weight:700;color:var(--blue-dark);text-transform:uppercase;letter-spacing:.03em;margin-bottom:8px;}
  .post-card h2{margin:0 0 8px;color:var(--navy);font-size:1.2rem;}
  .post-card p{margin:0;color:var(--slate-500);font-size:.94rem;}

  article.post .date{font-size:.82rem;font-weight:700;color:var(--blue-dark);text-transform:uppercase;letter-spacing:.03em;margin-bottom:10px;}
  article.post h1{margin-bottom:20px;}
  article.post .cover{margin-bottom:24px;aspect-ratio:16/9;object-fit:cover;width:100%;}
  article.post .body{font-size:1.02rem;color:var(--slate-700);}
  article.post .body h2{color:var(--navy);margin-top:32px;}
  article.post .body a{color:var(--blue);}
  .back-link{display:inline-block;margin-bottom:24px;font-weight:700;color:var(--navy);text-decoration:none;font-size:.92rem;}

  .empty-note{background:var(--bg-soft);border-radius:14px;padding:24px;text-align:center;color:var(--slate-500);}

  footer{background:#0f2447;color:rgba(255,255,255,.75);padding:36px 0;font-size:.85rem;}
  footer .foot-grid{max-width:1120px;margin:0 auto;padding:0 24px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;align-items:center;}
  footer nav{display:flex;flex-wrap:wrap;gap:18px;}
  footer nav a{text-decoration:none;color:rgba(255,255,255,.75);}
  footer nav a:hover{color:#fff;}
`;

function header(active) {
  const link = (href, label, key) =>
    `<a href="${href}"${key === active ? ' class="active"' : ""}>${label}</a>`;
  return `
<header class="site">
  <div class="site-header-inner">
    <a class="logo" href="/#top">
      <img src="https://projectqualitystudio.it/wp-content/uploads/2024/07/PQS__Logo_orizzontale-1-300x109.png" alt="Project Quality" />
    </a>
    <nav class="main-nav">
      ${link("/#valore", "Servizi", "")}
      ${link("/concretum.html", "Concretum", "")}
      ${link("/casi-studio.html", "Casi Studio", "")}
      ${link("/team.html", "Team", "")}
      ${link("/blog/", "Blog", "blog")}
      ${link("/#faq", "FAQ", "")}
      ${link("/#cta", "Contatti", "")}
    </nav>
  </div>
</header>`;
}

function footer() {
  return `
<footer>
  <div class="foot-grid">
    <span>© Project Quality — Consulenza in sistemi di gestione, Triveneto e Lombardia · P.IVA 01298170257</span>
    <nav>
      <a href="/#valore">Servizi</a>
      <a href="/concretum.html">Concretum</a>
      <a href="/casi-studio.html">Casi Studio</a>
      <a href="/team.html">Team</a>
      <a href="/blog/">Blog</a>
      <a href="/#faq">FAQ</a>
      <a href="/#cta">Contatti</a>
      <a href="https://clienti.projectquality.it" target="_blank" rel="noopener">Area riservata clienti</a>
    </nav>
  </div>
</footer>`;
}

function page({ title, description, active, body }) {
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${title}</title>
<link rel="icon" href="https://projectqualitystudio.it/wp-content/uploads/2024/07/cropped-cropped-PQS__Logotipo_PQ-32x32.png" sizes="32x32" />
<meta name="description" content="${description}" />
<style>${STYLE}</style>
</head>
<body>
${header(active)}
${body}
${footer()}
</body>
</html>
`;
}

function formatDate(d) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

function slugFromFilename(filename) {
  return filename.replace(/\.md$/, "");
}

function build() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"));

  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    const slug = slugFromFilename(file);
    return {
      slug,
      title: data.title || slug,
      date: data.date || "",
      excerpt: data.excerpt || "",
      cover: data.cover || "",
      html: md.render(content),
    };
  });

  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // pagine singole
  for (const post of posts) {
    const body = `
<section class="hero">
  <div class="wrap">
    <a class="back-link" href="/blog/">← Tutti gli articoli</a>
  </div>
</section>
<section>
  <div class="wrap">
    <article class="post">
      <div class="date">${formatDate(post.date)}</div>
      <h1>${post.title}</h1>
      ${post.cover ? `<img class="cover" src="${post.cover}" alt="${post.title}" />` : ""}
      <div class="body">${post.html}</div>
    </article>
  </div>
</section>`;
    const html = page({
      title: `${post.title} — Blog Project Quality`,
      description: post.excerpt || post.title,
      active: "blog",
      body,
    });
    fs.writeFileSync(path.join(OUT_DIR, `${post.slug}.html`), html);
  }

  // indice del blog
  const listHtml =
    posts.length > 0
      ? `<div class="post-list">${posts
          .map(
            (post) => `
      <a class="post-card" href="/blog/${post.slug}.html">
        <div class="date">${formatDate(post.date)}</div>
        <h2>${post.title}</h2>
        <p>${post.excerpt || ""}</p>
      </a>`
          )
          .join("")}</div>`
      : `<div class="empty-note">I primi articoli sono in arrivo — torna presto a trovarci.</div>`;

  const indexBody = `
<section class="hero">
  <div class="wrap">
    <span class="kicker">Normative, scadenze, sistemi di gestione</span>
    <h1>Blog Project Quality</h1>
    <p class="lead">Aggiornamenti pratici su ISO 9001, sicurezza sul lavoro, marcatura CE e GDPR, scritti per chi deve applicarli in azienda, non solo conoscerli.</p>
  </div>
</section>
<section>
  <div class="wrap">
    ${listHtml}
  </div>
</section>`;

  fs.writeFileSync(
    path.join(OUT_DIR, "index.html"),
    page({
      title: "Blog — Project Quality",
      description: "Aggiornamenti su normative, sistemi di gestione ISO e sicurezza sul lavoro per PMI.",
      active: "blog",
      body: indexBody,
    })
  );

  console.log(`Blog generato: ${posts.length} articoli.`);
}

build();
