import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const storageDir = path.join(rootDir, "storage", "bilibili-browser");
const cookiePath = path.join(rootDir, "bili-cookie.txt");

async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

async function writeCookieFile(context) {
  const cookies = await context.cookies("https://www.bilibili.com");
  const usefulCookies = cookies.filter((cookie) =>
    ["SESSDATA", "bili_jct", "DedeUserID", "DedeUserID__ckMd5", "sid", "buvid3", "b_nut"].includes(cookie.name)
  );
  const cookieHeader = usefulCookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
  await fs.writeFile(cookiePath, cookieHeader, "utf8");
  return usefulCookies.map((cookie) => cookie.name);
}

async function main() {
  const credentials = await readStdinJson();
  const username = credentials.username || process.env.BILI_USERNAME || "";
  const password = credentials.password || process.env.BILI_PASSWORD || "";

  await fs.mkdir(storageDir, { recursive: true });
  const context = await chromium.launchPersistentContext(storageDir, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto("https://space.bilibili.com/62037719/dynamic", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3500);

  const alreadyLoggedIn = await page.locator('a[href*="/account"], .header-avatar-wrap, .bili-avatar').count();
  if (!alreadyLoggedIn && username && password) {
    const accountInput = page.locator('input[placeholder*="账号"], input[placeholder*="请输入账号"]').first();
    const passwordInput = page.locator('input[type="password"], input[placeholder*="密码"]').first();
    if ((await accountInput.count()) && (await passwordInput.count())) {
      await accountInput.fill(username);
      await passwordInput.fill(password);
      const loginButton = page.locator('button:has-text("登录"), .btn_primary:has-text("登录"), .login-btn:has-text("登录")').first();
      if (await loginButton.count()) await loginButton.click();
    }
  }

  console.log("If a verification, QR, slider, or SMS step appears, complete it in the opened browser.");
  console.log("Waiting up to 180 seconds for Bilibili login cookies...");

  const deadline = Date.now() + 180_000;
  let cookieNames = [];
  while (Date.now() < deadline) {
    cookieNames = await writeCookieFile(context);
    if (cookieNames.includes("SESSDATA")) break;
    await page.waitForTimeout(3000);
  }

  if (!cookieNames.includes("SESSDATA")) {
    console.log("Login cookies were not detected. Browser stays open for manual completion.");
    await page.waitForTimeout(300_000);
    cookieNames = await writeCookieFile(context);
  }

  await context.close();
  if (!cookieNames.includes("SESSDATA")) {
    throw new Error("Bilibili login cookie SESSDATA was not exported.");
  }
  console.log(`Exported Bilibili cookies to ${cookiePath}`);
  console.log(`Cookie keys: ${cookieNames.join(", ")}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
