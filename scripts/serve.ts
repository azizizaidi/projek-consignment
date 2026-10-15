import { resolve } from "node:path";
const root = resolve(import.meta.dir, "../ui-demo");
const port = Number(process.env.PORT || 4320);
Bun.serve({
  port,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);
    let path: string;
    try {
      path = resolve(
        root,
        "." +
          decodeURIComponent(
            url.pathname === "/" ? "/login.html" : url.pathname,
          ),
      );
    } catch {
      return new Response("Bad request", { status: 400 });
    }
    if (!path.startsWith(root + "/"))
      return new Response("Forbidden", { status: 403 });
    const file = Bun.file(path);
    return (await file.exists())
      ? new Response(file, { headers: { "Cache-Control": "no-store" } })
      : new Response("Not found", { status: 404 });
  },
});
console.log(`SAS EMPIRE preview: http://localhost:${port}/`);
