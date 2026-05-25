import cors from "cors";
import crypto from "node:crypto";
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
const storageDir = path.join(rootDir, "storage");
const homepagePath = path.join(contentDir, "homepage.json");
const adminSecretPath = path.join(storageDir, "admin-secret.txt");
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT || 8787);
const adminSessions = new Set();

const app = express();

app.use(cors());
app.use(express.json({ limit: "8mb" }));

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

async function getAdminPassword() {
  if (process.env.GZR_ADMIN_PASSWORD) return process.env.GZR_ADMIN_PASSWORD;

  await fs.mkdir(storageDir, { recursive: true });
  if (existsSync(adminSecretPath)) {
    return (await fs.readFile(adminSecretPath, "utf8")).trim();
  }

  const generated = crypto.randomBytes(9).toString("hex");
  await fs.writeFile(adminSecretPath, `${generated}\n`, "utf8");
  console.log(`Admin password generated at ${adminSecretPath}`);
  return generated;
}

function validateHomepage(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return "内容必须是一个 JSON 对象。";
  }
  if (!input.hero || typeof input.hero.title !== "string") {
    return "缺少 hero.title。";
  }
  if (!Array.isArray(input.moments)) {
    return "moments 必须是数组。";
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
  if (!Array.isArray(input.gallerySlots)) {
    return "gallerySlots 必须是数组。";
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

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token || !adminSessions.has(token)) {
    res.status(401).json({ error: "需要管理员登录。" });
    return;
  }
  next();
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "guzhenren-content-api" });
});

app.post("/api/admin/login", async (req, res, next) => {
  try {
    const password = String(req.body?.password || "");
    const expected = await getAdminPassword();
    if (!password || password !== expected) {
      res.status(401).json({ error: "管理员口令错误。" });
      return;
    }

    const token = crypto.randomBytes(24).toString("hex");
    adminSessions.add(token);
    res.json({ ok: true, token });
  } catch (error) {
    next(error);
  }
});

app.get("/api/homepage", async (req, res, next) => {
  try {
    res.json(await readHomepage());
  } catch (error) {
    next(error);
  }
});

app.put("/api/homepage", requireAdmin, async (req, res, next) => {
  try {
    res.json(await writeHomepage(req.body));
  } catch (error) {
    next(error);
  }
});

app.post("/api/homepage/reset", requireAdmin, async (req, res, next) => {
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
    error: error.message || "服务器错误",
  });
});

app.listen(port, async () => {
  await getAdminPassword();
  console.log(`GuZhenRen content API running at http://localhost:${port}`);
});
