import fs from "node:fs/promises";
import path from "node:path";

const sourceManifestPath = "D:/MyPages/GuZhenRen/public/assets/bilibili/manifest.json";
const sourceAssetRoot = "D:/MyPages/GuZhenRen/public";
const targetDir = "D:/MyPages/img-GuZhenRen";

const picks = [
  {
    id: "1202735729339269120",
    image: 0,
    file: "001-宿命大战-龙公-龙御上宾.jpg",
    scene: "宿命大战-龙公-龙御上宾",
    reason: "动态正文为“龙御上宾”，评论明确提到龙公；保留高清版，剔除同画面低清重复图。",
  },
  {
    id: "1187311037173465105",
    image: 0,
    file: "002-方源被围-大爱仙尊.jpg",
    scene: "方源被围-大爱仙尊",
    reason: "动态归类为大爱仙尊，画面与方源/大爱仙尊主题吻合，评论围绕小说阅读。",
  },
  {
    id: "1187311037173465105",
    image: 1,
    file: "003-方源独行-大爱仙尊.jpg",
    scene: "方源独行-大爱仙尊",
    reason: "同组大爱仙尊画面，人物意象与方源主题一致。",
  },
  {
    id: "1172413320330739720",
    image: 0,
    file: "004-方源不悔-大爱仙尊.jpg",
    scene: "方源不悔-大爱仙尊",
    reason: "动态正文含“仙尊悔而我不悔”，评论明确提到大爱仙尊；保留高清版。",
  },
  {
    id: "1172413320330739720",
    image: 1,
    file: "005-方源与尊者幻影-大爱仙尊.jpg",
    scene: "方源与尊者幻影-大爱仙尊",
    reason: "同组“不悔/大爱仙尊”主题画面，符合方源相关素材。",
  },
  {
    id: "1172413320330739720",
    image: 2,
    file: "006-方源特写-大爱仙尊.jpg",
    scene: "方源特写-大爱仙尊",
    reason: "同组“不悔/大爱仙尊”人物特写，符合方源相关素材。",
  },
  {
    id: "1158450678014672930",
    image: 0,
    file: "007-红莲与柳淑仙-宿命.jpg",
    scene: "红莲与柳淑仙-宿命",
    reason: "评论明确提到柳淑仙、洪亭、宿命、红莲、龙公。",
  },
  {
    id: "1169675051046273047",
    image: 0,
    file: "008-悔蛊-光阴长河.jpg",
    scene: "悔蛊-光阴长河",
    reason: "动态正文为“悔”，评论提到悔蛊与光阴长河；保留高清版，剔除同画面低清重复图。",
  },
  {
    id: "1158686433067663365",
    image: 0,
    file: "009-悔蛊-人物特写.jpg",
    scene: "悔蛊-人物特写",
    reason: "动态正文为“我后悔了”，评论提到“不悔”和仙尊语境。",
  },
  {
    id: "1163661375321407495",
    image: 0,
    file: "010-红莲手书-悔.jpg",
    scene: "红莲手书-悔",
    reason: "评论明确提到红莲手书，作为宿命大战/红莲线辅助素材保留。",
  },
  {
    id: "1179744391435124740",
    image: 0,
    file: "011-送友风-武庸杀招-01.jpg",
    scene: "送友风-武庸杀招",
    reason: "评论出现“你我一见如故”，与武庸杀招送友风语境吻合；保留高清组图。",
  },
  {
    id: "1179744391435124740",
    image: 1,
    file: "012-送友风-武庸杀招-02.jpg",
    scene: "送友风-武庸杀招",
    reason: "同组送友风连续画面，保留为场景序列素材。",
  },
  {
    id: "1179744391435124740",
    image: 2,
    file: "013-送友风-武庸杀招-03.jpg",
    scene: "送友风-武庸杀招",
    reason: "同组送友风连续画面，保留为场景序列素材。",
  },
  {
    id: "1179744391435124740",
    image: 3,
    file: "014-送友风-武庸杀招-04.jpg",
    scene: "送友风-武庸杀招",
    reason: "同组送友风连续画面，保留为场景序列素材。",
  },
  {
    id: "1143137478931120130",
    image: 0,
    file: "015-万蛟杀招.jpg",
    scene: "万蛟杀招",
    reason: "动态正文为“万蛟”，评论中有“蛊真人万蛟龙”等明确指向；保留高清版。",
  },
];

const manifest = JSON.parse(await fs.readFile(sourceManifestPath, "utf8"));
const scenesById = new Map(manifest.scenes.map((scene) => [scene.id, scene]));

await fs.mkdir(targetDir, { recursive: true });

for (const entry of await fs.readdir(targetDir)) {
  if (/^\d{3}-.+\.(jpe?g|png|webp)$/i.test(entry) || entry === "manifest.json" || entry === "contact-sheet.jpg") {
    await fs.rm(path.join(targetDir, entry), { force: true });
  }
}

const exported = [];
for (const pick of picks) {
  const scene = scenesById.get(pick.id);
  if (!scene) {
    throw new Error(`Missing dynamic ${pick.id}`);
  }

  const imagePath = scene.images[pick.image];
  if (!imagePath) {
    throw new Error(`Missing image ${pick.image} for dynamic ${pick.id}`);
  }

  const sourcePath = path.join(sourceAssetRoot, imagePath.replace(/^\//, ""));
  const targetPath = path.join(targetDir, pick.file);
  await fs.copyFile(sourcePath, targetPath);

  exported.push({
    file: pick.file,
    scene: pick.scene,
    source: scene.source,
    dynamicId: pick.id,
    sourceImage: imagePath,
    reason: pick.reason,
    pubTime: scene.pubTime,
    text: scene.text,
    comments: scene.comments,
  });
}

await fs.writeFile(
  path.join(targetDir, "manifest.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: manifest.sourceSpace,
      count: exported.length,
      exported,
    },
    null,
    2,
  ),
  "utf8",
);

console.log(`Exported ${exported.length} curated Gu Zhen Ren images to ${targetDir}`);
