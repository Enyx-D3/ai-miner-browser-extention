import fs from "node:fs";
import path from "node:path";

const root = path.resolve(".");
const ignoredDirs = new Set([".git", "node_modules", "web-upstream"]);

const forbiddenNames = [
  /^\.DS_Store$/i,
  /^Thumbs\.db$/i,
  /\.bak$/i,
  /\.backup$/i,
  /\.old$/i,
  /~$/,
  /^\.env$/i,
  /^\.env\.(local|production|development|test)$/i
];

const forbiddenDirNames = [/backup/i, /old-http/i];
const privateKeyMarker = [
  "-----BEGIN ",
  "PRIVATE KEY",
  "-----"
].join("");
const offenders = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;

    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replaceAll(path.sep, "/");

    if (entry.isDirectory()) {
      if (forbiddenDirNames.some(re => re.test(entry.name))) {
        offenders.push(rel + "/");
      } else {
        walk(full);
      }
      continue;
    }

    if (forbiddenNames.some(re => re.test(entry.name))) offenders.push(rel);
  }
}

walk(root);

for (const file of fs.readdirSync(root)) {
  if (!/\.(js|mjs|json|html)$/.test(file)) continue;

  const full = path.join(root, file);
  if (!fs.statSync(full).isFile()) continue;

  const text = fs.readFileSync(full, "utf8");
  if (text.includes(privateKeyMarker)) {
    offenders.push(`${file}:private-key-material`);
  }
}

if (offenders.length) {
  throw new Error(
    "Release hygiene failed:\n" +
    offenders.map(x => ` - ${x}`).join("\n")
  );
}

console.log("Brain2 extension release hygiene PASS");
