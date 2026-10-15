import { Script } from "node:vm";
import { readFileSync, readdirSync, existsSync } from "node:fs";
for (const file of ["assets/app.js", "assets/data.js", "sw.js"])
  new Script(readFileSync("ui-demo/" + file, "utf8"), { filename: file });
JSON.parse(readFileSync("ui-demo/manifest.json", "utf8"));
for (const file of readdirSync("ui-demo").filter((f) => f.endsWith(".html"))) {
  const html = readFileSync("ui-demo/" + file, "utf8");
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const path = match[1].split("?")[0];
    if (!path.startsWith("http") && !existsSync("ui-demo/" + path))
      throw new Error(`${file}: missing ${path}`);
  }
}
console.log("PASS: JavaScript, manifest and local page assets.");
