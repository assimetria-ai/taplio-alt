import { createServer } from "node:http";

const PORT = process.env.PORT || 3001;

const routes = {
  "GET /api/health": (_req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
  },
};

const server = createServer((req, res) => {
  const key = `${req.method} ${req.url?.split("?")[0]}`;
  const handler = routes[key];

  if (handler) {
    handler(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`WaitlistKit API listening on :${PORT}`);
});
