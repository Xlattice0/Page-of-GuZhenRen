import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defaultHomepage } from "./content/defaultHomepage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(__dirname, "content");
const homepagePath = path.join(contentDir, "homepage.json");
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT || 8787);

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

async function ensureContentFile() {
  await fs.mkdir(contentDir, { recursive: true });
  if (!existsSync(homepagePath)) {
    await fs.writeFile(homepagePath, JSON.stringify(defaultHomepage, null, 2), "utf8");
  }
}

async function readHomepage() {
  await ensureContentFile();
  const raw = await fs.readFile(homepagePath, "utf8");
  return JSON.parse(raw);
}

function validateHomepage(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return "内容必须是一个 JSON 对象。";
  }
  if (!input.hero || typeof input.hero.title !== "string") {
    return "缺少 hero.title。";
  }
  if (!Array.isArray(input.timeline)) {
    return "timeline 必须是数组。";
  }
  if (!Array.isArray(input.players)) {
    return "players 必须是数组。";
  }
  if (!Array.isArray(input.systems)) {
    return "systems 必须是数组。";
  }
  return null;
}

async function writeHomepage(nextContent) {
  const error = validateHomepage(nextContent);
  if (error) {
    const invalid = new Error(error);
    invalid.status = 400;
    throw invalid;
  }
  await ensureContentFile();
  await fs.writeFile(homepagePath, JSON.stringify(nextContent, null, 2), "utf8");
  return nextContent;
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "guzhenren-content-api" });
});

app.get("/api/homepage", async (req, res, next) => {
  try {
    res.json(await readHomepage());
  } catch (error) {
    next(error);
  }
});

app.put("/api/homepage", async (req, res, next) => {
  try {
    res.json(await writeHomepage(req.body));
  } catch (error) {
    next(error);
  }
});

app.post("/api/homepage/reset", async (req, res, next) => {
  try {
    res.json(await writeHomepage(defaultHomepage));
  } catch (error) {
    next(error);
  }
});

if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({
    error: error.message || "服务器错误"
  });
});

app.listen(port, () => {
  console.log(`GuZhenRen content API running at http://localhost:${port}`);
});
