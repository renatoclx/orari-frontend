// Gera manual-usuario.pdf: numera os capítulos, monta o sumário e imprime pelo
// Chrome. Duas passadas: a primeira descobre em que página cada capítulo cai
// (pdftotext), a segunda grava os números no sumário.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(dir, "manual.html"), "utf8");
const tmp = join(dir, ".manual-build.html");
const pdf = join(dir, "manual-usuario.pdf");
const chrome = process.env.CHROME ?? "google-chrome";

// Capítulos: <h1 class="chapter" data-toc="Título"><span class="num"></span>
const chapters = [...src.matchAll(/data-toc="([^"]+)"/g)].map((m) => m[1]);

function render(pages) {
  let n = 0;
  let html = src.replace(/<span class="num"><\/span>/g, () => `<span class="num">${++n}</span>`);
  const toc = chapters
    .map(
      (t, i) =>
        `<li><span class="n">${i + 1}</span><span class="t">${t}</span><span class="p">${pages?.[i] ?? ""}</span></li>`,
    )
    .join("\n");
  html = html.replace('<ol id="toc"></ol>', `<ol id="toc">${toc}</ol>`);
  writeFileSync(tmp, html);
  execFileSync(
    chrome,
    [
      "--headless=new", "--no-sandbox", "--disable-gpu",
      "--no-pdf-header-footer", `--print-to-pdf=${pdf}`,
      "--virtual-time-budget=10000", pathToFileURL(tmp).href,
    ],
    { stdio: "ignore" },
  );
}

function chapterPages() {
  const total = Number(
    /Pages:\s+(\d+)/.exec(execFileSync("pdfinfo", [pdf], { encoding: "utf8" }))[1],
  );
  const found = [];
  for (let p = 3; p <= total; p++) {
    const text = execFileSync("pdftotext", ["-f", String(p), "-l", String(p), pdf, "-"], { encoding: "utf8" });
    const first = text.trim().split("\n").filter((l) => l.trim() && !l.startsWith("Orari ·"))[0] ?? "";
    chapters.forEach((t, i) => {
      if (found[i] === undefined && first.replace(/^\d+\s*/, "").trim() === t) found[i] = p;
    });
  }
  return { found, total };
}

render();
const { found, total } = chapterPages();
render(found);
console.log(`manual-usuario.pdf: ${total} páginas`, found);
