import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = process.env.PORT || 3001;
const LANDING_DIST = join(__dirname, "../landing/dist");

// In-memory storage for MVP (replace with database later)
const waitlist = [];
let idCounter = 1;

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

// Helper to parse JSON body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
};

const routes = {
  "GET /api/health": (_req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
  },

  "POST /api/waitlist": async (req, res) => {
    try {
      const body = await parseBody(req);
      const { email, name } = body;

      if (!email || !email.includes("@")) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Valid email is required" }));
        return;
      }

      // Check if email already exists
      const existing = waitlist.find((entry) => entry.email === email);
      if (existing) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            email: existing.email,
            position: existing.position,
            message: "You're already on the waitlist!",
          })
        );
        return;
      }

      // Add to waitlist
      const entry = {
        id: idCounter++,
        email,
        name: name || "",
        position: waitlist.length + 1,
        createdAt: new Date().toISOString(),
      };

      waitlist.push(entry);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          email: entry.email,
          position: entry.position,
          message: "Successfully joined the waitlist!",
        })
      );
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to process request" }));
    }
  },

  "GET /api/waitlist": (_req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        total: waitlist.length,
        entries: waitlist.map((entry) => ({
          position: entry.position,
          email: entry.email,
          name: entry.name,
          createdAt: entry.createdAt,
        })),
      })
    );
  },

  "GET /api/stats": (_req, res) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayCount = waitlist.filter((e) => new Date(e.createdAt) >= today).length;
    const weekCount = waitlist.filter((e) => new Date(e.createdAt) >= thisWeek).length;

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        total: waitlist.length,
        today: todayCount,
        thisWeek: weekCount,
      })
    );
  },

  "GET /login": async (_req, res) => {
    // Serve the main index.html for SPA routing
    await serveStatic(join(LANDING_DIST, "index.html"), res);
  },

  "GET /auth": async (_req, res) => {
    // Serve the main index.html for SPA routing
    await serveStatic(join(LANDING_DIST, "index.html"), res);
  },

  "GET /waitlist": async (_req, res) => {
    // Serve the main index.html for SPA routing
    await serveStatic(join(LANDING_DIST, "index.html"), res);
  },

  "GET /join": async (_req, res) => {
    // Serve the main index.html for SPA routing
    await serveStatic(join(LANDING_DIST, "index.html"), res);
  },

  "GET /admin": async (_req, res) => {
    // Serve the main index.html for SPA routing
    await serveStatic(join(LANDING_DIST, "index.html"), res);
  },

  "GET /dashboard": async (_req, res) => {
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
  // Enable CORS for development
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

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

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✨ WaitlistKit API + Landing listening on 0.0.0.0:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎯 Landing page: http://localhost:${PORT}/`);
  console.log(`📝 Waitlist page: http://localhost:${PORT}/waitlist`);
});
