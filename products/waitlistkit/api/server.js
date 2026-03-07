import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = process.env.PORT || 3001;
const LANDING_DIST = join(__dirname, "../landing/dist");

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const routes = {
  "GET /api/health": (_req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
  },
  "GET /login": async (_req, res) => {
    // Serve the main index.html for SPA routing
    await serveStatic(join(LANDING_DIST, "index.html"), res);
  },
};

const serveStatic = async (filepath, res) => {
  try {
    const content = await readFile(filepath);
    const ext = extname(filepath);
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch (err) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
};

const server = createServer(async (req, res) => {
  const key = `${req.method} ${req.url?.split("?")[0]}`;
  const handler = routes[key];

  if (handler) {
    handler(req, res);
  } else if (req.method === "GET") {
    // Serve static files from landing/dist
    let filepath = join(LANDING_DIST, req.url === "/" ? "index.html" : req.url);
    
    // Try to serve the file, if it doesn't exist, serve index.html (SPA fallback)
    try {
      await readFile(filepath);
      await serveStatic(filepath, res);
    } catch {
      // Fallback to index.html for client-side routing
      await serveStatic(join(LANDING_DIST, "index.html"), res);
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`WaitlistKit API + Landing listening on :${PORT}`);
});
