import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const assetDir = path.join(publicDir, "assets", "bilibili");
const manifestPath = path.join(assetDir, "manifest.json");
const defaultHostMid = "62037719";

const sceneRules = [
  { label: "三王山炼定仙游", keywords: ["三王山", "三王传承", "定仙游", "炼定仙游"] },
  { label: "义天山大战", keywords: ["义天山", "惊鸿乱斗台", "幽魂"] },
  { label: "青茅山旧局", keywords: ["青茅山", "古月", "狼潮", "花酒"] },
  { label: "王庭与真阳楼", keywords: ["王庭", "真阳楼", "八十八角", "巨阳"] },
  { label: "逆流河", keywords: ["逆流河", "坚持", "柳贯一"] },
  { label: "宿命大战", keywords: ["宿命", "天庭", "龙公", "红莲"] },
  { label: "疯魔窟", keywords: ["疯魔窟", "无极", "书山", "元境"] },
  { label: "大爱仙尊", keywords: ["大爱", "炼道尊者", "方源成尊"] },
  { label: "尊者棋局", keywords: ["星宿", "巨阳", "尊者", "三尊"] },
  { label: "至尊仙窍", keywords: ["至尊仙窍", "至尊仙胎", "影宗"] }
];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    hostMid: defaultHostMid,
    limit: 36,
    cookie: process.env.BILI_COOKIE || "",
    cookieFile: "",
    dryRun: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--host-mid") options.hostMid = args[++index] || options.hostMid;
    if (arg === "--limit") options.limit = Number(args[++index] || options.limit);
    if (arg === "--cookie") options.cookie = args[++index] || "";
    if (arg === "--cookie-file") options.cookieFile = args[++index] || "";
    if (arg === "--dry-run") options.dryRun = true;
  }

  return options;
}

async function readCookie(options) {
  if (options.cookie) return options.cookie.trim();
  if (!options.cookieFile) {
    const defaultCookieFile = path.join(rootDir, "bili-cookie.txt");
    try {
      return (await fs.readFile(defaultCookieFile, "utf8")).trim();
    } catch {
      return "";
    }
  }
  return (await fs.readFile(path.resolve(rootDir, options.cookieFile), "utf8")).trim();
}

function normalizeUrl(url) {
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}

function extFromUrl(url) {
  const clean = url.split("?")[0].toLowerCase();
  const ext = path.extname(clean);
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) return ext;
  return ".jpg";
}

function safeName(input) {
  return String(input)
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 90);
}

function flattenText(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (typeof node !== "object") return "";

  const parts = [];
  if (node.text) parts.push(node.text);
  if (node.orig_text) parts.push(node.orig_text);
  if (node.desc?.text) parts.push(node.desc.text);
  if (node.title) parts.push(node.title);
  if (node.content) parts.push(flattenText(node.content));
  if (node.rich_text_nodes) parts.push(flattenText(node.rich_text_nodes));
  if (node.modules) parts.push(flattenText(node.modules));
  if (node.module_dynamic) parts.push(flattenText(node.module_dynamic));
  if (node.major) parts.push(flattenText(node.major));
  if (node.opus) parts.push(flattenText(node.opus));
  return parts.join(" ").trim();
}

function collectImages(value, out = []) {
  if (!value) return out;
  if (Array.isArray(value)) {
    value.forEach((item) => collectImages(item, out));
    return out;
  }
  if (typeof value !== "object") return out;

  for (const key of ["src", "url", "img_src", "cover", "picture", "image_url"]) {
    if (typeof value[key] === "string" && /bili|hdslb|bilivideo|bfs/.test(value[key])) {
      out.push(normalizeUrl(value[key]));
    }
  }
  for (const key of ["pics", "items", "pictures", "images", "draw", "opus", "major", "archive", "live_rcmd"]) {
    collectImages(value[key], out);
  }
  return out;
}

function collectCommentsText(replyData) {
  const replies = [
    ...(replyData?.data?.replies || []),
    ...(replyData?.data?.top_replies || []),
    ...(replyData?.data?.upper?.top ? [replyData.data.upper.top] : [])
  ];
  return replies
    .map((reply) => reply?.content?.message || "")
    .filter(Boolean)
    .slice(0, 12);
}

function inferScene(texts) {
  const haystack = texts.join("\n");
  let best = { label: "蛊真人画面", score: 0 };
  for (const rule of sceneRules) {
    const score = rule.keywords.reduce((sum, keyword) => sum + (haystack.includes(keyword) ? 1 : 0), 0);
    if (score > best.score) best = { label: rule.label, score };
  }
  return best.label;
}

async function biliFetch(url, cookie) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      accept: "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      referer: `https://space.bilibili.com/${defaultHostMid}/dynamic`,
      cookie
    }
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Bilibili request failed ${res.status}: ${text.slice(0, 180)}`);
  }
  const json = JSON.parse(text);
  if (json.code !== 0) {
    throw new Error(`Bilibili API returned code ${json.code}: ${json.message || text.slice(0, 180)}`);
  }
  return json;
}

async function fetchReplies(item, cookie) {
  const oid = item.basic?.comment_id_str || item.basic?.comment_id || item.id_str || item.id;
  const type = item.basic?.comment_type;
  if (!oid || !type) return [];

  const url = new URL("https://api.bilibili.com/x/v2/reply");
  url.searchParams.set("type", String(type));
  url.searchParams.set("oid", String(oid));
  url.searchParams.set("pn", "1");
  url.searchParams.set("ps", "20");
  url.searchParams.set("sort", "2");

  try {
    const replyData = await biliFetch(url.toString(), cookie);
    return collectCommentsText(replyData);
  } catch (error) {
    console.warn(`Skip comments for ${item.id_str || item.id}: ${error.message}`);
    return [];
  }
}

async function downloadImage(url, destination, cookie) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      referer: "https://www.bilibili.com/",
      cookie
    }
  });
  if (!res.ok) throw new Error(`image ${res.status} ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destination, buffer);
}

async function fetchDynamicItems(hostMid, limit, cookie) {
  const items = [];
  let offset = "";
  let page = 0;

  while (items.length < limit && page < 12) {
    const url = new URL("https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space");
    url.searchParams.set("host_mid", hostMid);
    url.searchParams.set("features", "itemOpusStyle");
    if (offset) url.searchParams.set("offset", offset);

    const json = await biliFetch(url.toString(), cookie);
    const pageItems = json.data?.items || [];
    items.push(...pageItems);
    offset = json.data?.offset || "";
    page += 1;
    if (!json.data?.has_more || !offset) break;
  }

  return items.slice(0, limit);
}

async function main() {
  const options = parseArgs();
  const cookie = await readCookie(options);
  if (!cookie) {
    throw new Error(
      "Missing Bilibili login cookie. Set BILI_COOKIE, pass --cookie, or create D:/MyPages/GuZhenRen/bili-cookie.txt."
    );
  }

  await fs.mkdir(assetDir, { recursive: true });
  const dynamicItems = await fetchDynamicItems(options.hostMid, options.limit, cookie);
  const scenes = [];

  for (const item of dynamicItems) {
    const dynamicId = item.id_str || String(item.id || scenes.length + 1);
    const dynamicText = flattenText(item);
    const images = [...new Set(collectImages(item.modules?.module_dynamic || item))].filter(Boolean);
    if (!images.length) continue;

    const comments = await fetchReplies(item, cookie);
    const scene = inferScene([dynamicText, ...comments]);
    const localImages = [];

    for (let index = 0; index < images.length; index += 1) {
      const imageUrl = images[index];
      const fileName = `${safeName(scene)}-${dynamicId}-${String(index + 1).padStart(2, "0")}${extFromUrl(imageUrl)}`;
      const destination = path.join(assetDir, fileName);
      if (!options.dryRun) await downloadImage(imageUrl, destination, cookie);
      localImages.push(`/assets/bilibili/${fileName}`);
    }

    scenes.push({
      id: dynamicId,
      scene,
      source: `https://t.bilibili.com/${dynamicId}`,
      pubTime: item.modules?.module_author?.pub_time || "",
      text: dynamicText.slice(0, 220),
      comments: comments.slice(0, 5),
      images: localImages
    });
  }

  const manifest = {
    sourceSpace: `https://space.bilibili.com/${options.hostMid}/dynamic`,
    generatedAt: new Date().toISOString(),
    count: scenes.length,
    scenes
  };

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Saved ${scenes.length} scene groups to ${manifestPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
