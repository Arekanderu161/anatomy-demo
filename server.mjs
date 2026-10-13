import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml" };

export function createGalleryServer() {
  return createServer(async (request, response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end("Method not allowed");
      return;
    }
    try {
      const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      const allowed = ["/", "/index.html", "/gallery.css", "/gallery.js", "/LICENSE"].includes(path) || /^\/examples\/[a-z-]+\/[a-z-]+(?:-light)?\.html$/.test(path) || /^\/\.github\/assets\/[a-z-]+\.(webp|png)$/.test(path);
      const full = resolve(root, `.${path === "/" ? "/index.html" : path}`);
      if (!allowed || !full.startsWith(root + sep)) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      const contents = await readFile(full);
      response.writeHead(200, { "Content-Type": types[extname(full)] ?? "text/plain; charset=utf-8", "Cache-Control": "no-cache" });
      response.end(request.method === "HEAD" ? undefined : contents);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  const server = createGalleryServer();
  server.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, "127.0.0.1", () => console.log(`Anatomy demo: http://127.0.0.1:${server.address().port}`));
}
