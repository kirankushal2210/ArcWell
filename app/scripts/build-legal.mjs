// Builds the static legal pages (D106) from src/features/legal/docs.ts into public/legal/, for the
// website, the Play Console's privacy policy and account deletion links, and the web build (Expo
// serves public/ at the site root, so they're at /legal/privacy.html and so on).
//
//   node scripts/build-legal.mjs          write the pages
//   node scripts/build-legal.mjs --check  fail if they're out of date (part of `npm run lint`)
//
// Node runs the TypeScript source directly (type stripping), so there is one copy of the text.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const {
  LEGAL_DOCS,
  LEGAL_ORDER,
  LEGAL_UPDATED,
  LEGAL_VERSION,
  OPERATOR,
  parseInline,
  unfilled,
} = await import(join(root, "src/features/legal/docs.ts"));

const outDir = join(root, "public/legal");
const check = process.argv.includes("--check");

const esc = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const href = (t) => (t.startsWith("doc:") ? `${t.slice(4)}.html` : t);

const inline = (text) =>
  parseInline(text)
    .map((r) =>
      r.href
        ? `<a href="${esc(href(r.href))}">${esc(r.text)}</a>`
        : r.bold
          ? `<strong>${esc(r.text)}</strong>`
          : esc(r.text),
    )
    .join("");

const block = (b) =>
  typeof b === "string"
    ? `      <p>${inline(b)}</p>`
    : `      <ul>\n${b.list.map((i) => `        <li>${inline(i)}</li>`).join("\n")}\n      </ul>`;

// Colours come from the design tokens (docs/design/theme-tokens.css), so the pages match the app's
// dark theme. System fonts, no outside requests.
const tokens = Object.fromEntries(
  [
    ...readFileSync(
      join(root, "../docs/design/theme-tokens.css"),
      "utf8",
    ).matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g),
  ].map((m) => [m[1], m[2].trim()]),
);
const color = (name) => {
  let v = tokens[name];
  for (
    let m = /^var\((--[a-z0-9-]+)\)$/.exec(v ?? "");
    m;
    m = /^var\((--[a-z0-9-]+)\)$/.exec(v ?? "")
  )
    v = tokens[m[1]];
  if (!v)
    throw new Error(`build-legal: no value for ${name} in theme-tokens.css`);
  return v;
};
const css = `:root{color-scheme:dark;--bg:${color("--color-bg")};--surface:${color("--color-surface")};--text:${color("--color-text")};--muted:${color("--color-text-muted")};--line:${color("--color-border")};--brand:${color("--color-brand")}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:720px;margin:0 auto;padding:32px 16px 64px}header{margin-bottom:24px}
.brand{font-weight:700;letter-spacing:.02em;color:var(--text);text-decoration:none}
h1{font-size:28px;line-height:1.2;margin:12px 0 4px}h2{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:32px 0 8px}
.meta{color:var(--muted);font-size:14px;margin:0}.lead{color:var(--muted)}a{color:var(--text);text-decoration-color:var(--brand);text-underline-offset:3px}
ul{padding-left:20px}li{margin:6px 0}nav{display:flex;flex-wrap:wrap;gap:8px 16px;margin-top:48px;padding-top:16px;border-top:1px solid var(--line);font-size:14px}`;

const nav = (current) =>
  LEGAL_ORDER.map((s) =>
    s === current
      ? `<span>${esc(LEGAL_DOCS[s].title)}</span>`
      : `<a href="${s}.html">${esc(LEGAL_DOCS[s].title)}</a>`,
  ).join("\n      ");

const page = (title, body, current, description) => `<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} · ${esc(OPERATOR.app)}</title>
  <meta name="description" content="${esc(description)}">
  <style>${css}</style>
</head>
<body>
  <main>
    <header>
      <a class="brand" href="index.html">${esc(OPERATOR.app)}</a>
${body}
    <nav>
      ${nav(current)}
    </nav>
  </main>
</body>
</html>
`;

const files = {};
for (const slug of LEGAL_ORDER) {
  const d = LEGAL_DOCS[slug];
  const body = `      <h1>${esc(d.title)}</h1>
      <p class="meta">Last updated ${esc(LEGAL_UPDATED)} · version ${esc(LEGAL_VERSION)}</p>
    </header>
    <p class="lead">${inline(d.summary)}</p>
${d.sections
  .map(
    (s) => `    <section>
      <h2>${esc(s.heading)}</h2>
${s.blocks.map(block).join("\n")}
    </section>`,
  )
  .join("\n")}`;
  files[`${slug}.html`] = page(d.title, body, slug, d.short);
}
files["index.html"] = page(
  "Legal",
  `      <h1>Legal</h1>
      <p class="meta">Last updated ${esc(LEGAL_UPDATED)}</p>
    </header>
    <ul>
${LEGAL_ORDER.map((s) => `      <li><a href="${s}.html">${esc(LEGAL_DOCS[s].title)}</a>: ${esc(LEGAL_DOCS[s].short)}</li>`).join("\n")}
    </ul>`,
  "",
  `${OPERATOR.app} legal pages`,
);

const todo = unfilled();
if (check) {
  const stale = Object.entries(files)
    .filter(([name, html]) => {
      const p = join(outDir, name);
      return !existsSync(p) || readFileSync(p, "utf8") !== html;
    })
    .map(([name]) => name);
  if (stale.length) {
    console.error(
      `legal:check failed: public/legal is out of date (${stale.join(", ")}). Run npm run legal:build.`,
    );
    process.exit(1);
  }
  console.log(
    `legal:check passed: public/legal matches docs.ts.${todo.length ? ` Still to fill in before launch: ${todo.join(", ")}.` : ""}`,
  );
} else {
  mkdirSync(outDir, { recursive: true });
  for (const [name, html] of Object.entries(files))
    writeFileSync(join(outDir, name), html);
  console.log(`Wrote ${Object.keys(files).length} pages to public/legal.`);
  if (todo.length) console.log(`Still to fill in: ${todo.join(", ")}.`);
}
