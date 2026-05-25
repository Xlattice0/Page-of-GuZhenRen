import {
  ArrowLeft,
  BookOpen,
  Boxes,
  CircleDot,
  Crown,
  ExternalLink,
  GitBranch,
  Home,
  ImagePlus,
  KeyRound,
  LogOut,
  Map as MapIcon,
  Network,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Waves,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { fallbackContent } from "./fallbackContent.js";
import { atlasSourceSummary, characterEvidenceByName } from "./generatedAtlasCharacters.js";

const iconMap = {
  timeline: GitBranch,
  network: Network,
  spark: Sparkles,
  map: MapIcon,
  crown: Crown,
  book: BookOpen,
  systems: Boxes,
  image: ImagePlus,
};

const accents = ["#d4b56f", "#b65b4b", "#8fb8c2", "#9b8bd3", "#d15d61", "#8cc5a6"];
const STAR_NODE_LIMIT = 300;
const externalCharacterSources = {
  方源: [
    {
      label: "百度百科：古月方源",
      href: "https://baike.baidu.com/item/%E5%8F%A4%E6%9C%88%E6%96%B9%E6%BA%90?fromModule=lemma_search-box",
      type: "人物外部词条",
    },
  ],
  方正: [
    {
      label: "百度百科：古月方正",
      href: "https://baike.baidu.com/item/%E5%8F%A4%E6%9C%88%E6%96%B9%E6%AD%A3/19812746",
      type: "人物外部词条",
    },
  ],
};
const verifiedImmortalGuProfiles = {
  方源: {
    groups: [
      {
        path: "智道",
        items: [
          { name: "智慧蛊", rank: "九转", note: "未炼化" },
          { name: "态度蛊", rank: "八转" },
          { name: "慧剑蛊", rank: "八转" },
          { name: "解谜蛊", rank: "六转" },
        ],
      },
      {
        path: "剑道",
        items: [
          { name: "剑遁蛊", rank: "七转" },
          { name: "浪剑蛊", rank: "七转" },
          { name: "剑眉蛊", rank: "七转" },
        ],
      },
      { path: "魂道", items: [{ name: "换魂蛊", rank: "七转" }] },
      { path: "血道", items: [{ name: "血本蛊", rank: "六转" }] },
      { path: "暗道", items: [{ name: "暗渡仙蛊", rank: "六转" }] },
      { path: "运道", items: [{ name: "狗屎运仙蛊", rank: "六转" }] },
    ],
  },
  方正: {
    groups: [
      {
        path: "血道",
        items: [{ name: "冷血仙蛊" }, { name: "血仇仙蛊" }],
      },
    ],
  },
};
const immortalGuPaths = [
  "天道",
  "人道",
  "炼道",
  "木道",
  "智道",
  "梦道",
  "宙道",
  "变化道",
  "律道",
  "运道",
  "力道",
  "剑道",
  "血道",
  "魂道",
  "信道",
  "宇道",
  "偷道",
  "土道",
  "食道",
  "阵道",
  "奴道",
  "刀道",
  "气道",
  "水道",
  "音道",
  "雷道",
  "金道",
  "毒道",
  "炎道",
  "星道",
  "暗道",
  "骨道",
  "冰雪道",
  "风道",
  "云道",
  "光道",
  "火道",
  "虚道",
  "幻道",
  "画道",
  "丹道",
  "香道",
];
const immortalGuRanks = ["五转", "六转", "七转", "八转", "九转"];
const verifiedKillerMoveProfiles = {
  方源: {
    sections: [
      {
        label: "复合",
        groups: [
          {
            label: "攻伐",
            items: [
              "力道大手印", "万蛟", "斗战胜伏奴", "大盗鬼手", "阎罗战场", "阎罗网",
              "万剑鬼蛟", "万一鬼蛟剑", "万念剑瀑", "剑客", "剑羽刀翅", "化炼蝶",
              "痛心泣血", "雷韵丝流", "偷袭战场", "十里宙疾风", "舌剑龙魂",
              "腐毒阴烬", "遗毒蚁祸", "五术虹光", "七杀虹光", "彼来龙蛇尘雾爆魄风",
              "此去惊年梦浪荡魂音",
            ],
          },
          { label: "防御", items: ["阎帝", "鬼官衣", "天鬼匿形", "混彩虹光"] },
          { label: "移动", items: ["翠流珠", "天地游", "风火光电轮"] },
          { label: "治疗", items: ["人如故"] },
          { label: "经营", items: ["江山如故"] },
        ],
      },
      {
        label: "九转",
        groups: [
          { label: "攻伐", items: ["残炼"] },
          { label: "防御", items: ["鬼不觉", "天机混淆", "天网恢恢"] },
          { label: "辅助", items: ["天相", "盗天机", "石洞天机", "天消意散", "天纲地常", "天地无情"] },
        ],
      },
      {
        label: "八转",
        groups: [
          {
            label: "攻伐",
            items: [
              "炼阵雨", "天妒英才", "运往来动", "梦里轻烟", "人间烟火", "五禁玄光气",
              "落魄印", "荡魂落魄印", "魂河", "五指拳心剑", "金丝剑", "气海无量",
              "乎昂", "归海气宗", "刀气", "阴阳大杀手", "暴气吼", "弹指神通",
              "流气环", "气绝逢生", "光阴飞刃", "未来身", "春剪", "夏扇",
              "流年不利", "年兽召来", "太古剑龙变", "太古匪猴变", "太古年兽变",
              "气罡猪变化", "一气鹤变化", "落星棒子变", "奔雷黄鸟变", "囫囵蓝豹变",
              "内息绿鱼变", "自由残缺变", "图腾",
            ],
          },
          { label: "防御", items: ["冬裘", "血染征袍", "逆流护身印", "镇定自若", "罡布衣", "天罡斗衣", "万籁俱寂"] },
          { label: "侦查", items: ["气运交感", "察运", "秋毫", "三息后现"] },
          { label: "移动", items: ["生路", "血漂流"] },
          { label: "治疗", items: ["炼己", "血愈湖", "舍命血印", "吐气如兰"] },
          {
            label: "辅助",
            items: [
              "吞食天地", "因果神树", "运筹帷幄", "固运", "人复活海", "爱的劝慰",
              "退一步海阔天空", "万物大同变", "见面曾相识", "三世梦渡有缘人",
              "梦中之梦", "天人感应", "天工人代", "自在天痕", "缩时", "后患无穷",
              "年富力强", "百年好合", "蚁念",
            ],
          },
          { label: "战场", items: ["万军蚁穴", "紫辰断命"] },
          {
            label: "经营",
            items: [
              "贤才入瓮", "一方乐土", "春耕", "夏耘", "秋收", "冬藏", "丰年",
              "度日如年", "度月如年", "度年如日", "度年如月", "春芽", "夏日",
            ],
          },
        ],
      },
      {
        label: "七转",
        groups: [
          {
            label: "攻伐",
            items: [
              "万我", "引魂入梦", "领袖群星", "百八十奴", "剑痕索命", "剑浪三叠",
              "无形飞剑", "云霄飞剑", "万里飞剑", "穷追飞剑", "暗歧杀", "燃念飞石",
              "一念花开", "一念化万千", "乱方混向雾", "智取", "紫念洞悉·灵动星芒",
              "意解纷呈", "杂念丛生", "血光镇灵", "剑蛟变", "卜卦龟背变",
            ],
          },
          { label: "移动", items: ["随意祥云"] },
          { label: "防御", items: ["刚背", "紫念光护", "定真枝丫变"] },
          {
            label: "辅助",
            items: [
              "吃力", "天光轮转", "春秋必成", "春秋准定", "成竹在胸", "纯梦求真变",
              "梦中换魂", "燃魂爆运", "魂兽召来", "魂穿", "分魂", "换魂", "魂爆",
              "魂压", "洁身自好", "集思广益", "智平祸", "斗志昂扬", "暗久藏",
              "仙劫锻窍",
            ],
          },
          { label: "经营", items: ["菌光普照"] },
        ],
      },
      {
        label: "六转",
        groups: [
          {
            label: "攻伐",
            items: ["万我", "毒气喷吐", "万星飞萤", "见面似相识", "星云磨盘", "星蛇索", "六幻星身", "位星移", "星魂战场", "飞熊变"],
          },
          { label: "移动", items: ["星火遁"] },
          { label: "侦察", items: ["外映星念", "星感应"] },
          { label: "辅助", items: ["解梦", "造梦", "蝶探天机", "生死仙窍转换法", "力转生死", "取窍法门", "血丝游", "春星雨"] },
        ],
      },
    ],
  },
  方正: {
    sections: [
      {
        label: "已录入",
        groups: [{ label: "血道", items: ["血渐冷", "血亲心仇"] }],
      },
    ],
  },
};
const atlasAmbiences = {
  southern: {
    clear: 0x030505,
    fog: 0x060808,
    core: 0x92572e,
    orbit: [0x74533f, 0x416b60],
    ribbon: [0xae7044, 0x4c8a81, 0x62456e],
    dust: [0xc9905a, 0x65a78e],
    stars: [0xc78c54, 0x63978a],
    signature: "ridge",
  },
  central: {
    clear: 0x060504,
    fog: 0x0b0905,
    core: 0xb48a39,
    orbit: [0x8d7742, 0x506473],
    ribbon: [0xe1bb5e, 0x78a9b8, 0x9f8351],
    dust: [0xe0bf69, 0xa6c2c6],
    stars: [0xf1d68a, 0x90b1b4],
    signature: "river",
  },
  northern: {
    clear: 0x030609,
    fog: 0x060b10,
    framing: 1.18,
    core: 0x598698,
    orbit: [0x4d7382, 0x75838e],
    ribbon: [0x85c5d8, 0xb5d5dd, 0x57718f],
    dust: [0xa8d8e2, 0xd9eaed],
    stars: [0xc8ebef, 0x70adbc],
    signature: "wind",
  },
  eastern: {
    clear: 0x020808,
    fog: 0x041010,
    framing: 1.24,
    core: 0x287f7e,
    orbit: [0x3c8884, 0x357077],
    ribbon: [0x59c0b5, 0x397e9b, 0x9acdc4],
    dust: [0x72c4b7, 0x76b2c3],
    stars: [0x80ded1, 0x5f9eac],
    signature: "tide",
  },
  western: {
    clear: 0x090604,
    fog: 0x100a05,
    fitSparseScene: true,
    core: 0xb36f2d,
    orbit: [0x987046, 0x71503a],
    ribbon: [0xd5a152, 0xbd7143, 0x8c6b48],
    dust: [0xe0ae64, 0xc58c54],
    stars: [0xe9c279, 0xb47d4c],
    signature: "dune",
  },
  white: {
    clear: 0x090b0e,
    fog: 0x10151b,
    fitSparseScene: true,
    core: 0xc5c5b0,
    orbit: [0xc4c6bb, 0x7ca1b2],
    ribbon: [0xf0ebd2, 0xaacbd6, 0xcfc5ad],
    dust: [0xf1eed8, 0xb7d8df],
    stars: [0xfff7da, 0xb5dce6],
    signature: "cloud",
  },
  black: {
    clear: 0x030308,
    fog: 0x080711,
    fitSparseScene: true,
    core: 0x6350a0,
    orbit: [0x655394, 0x374c74],
    ribbon: [0x9f83e4, 0x4f8da7, 0xc06b99],
    dust: [0xaf8de5, 0x608ea8],
    stars: [0xc0a4ff, 0x6aaaca],
    signature: "void",
  },
  unverified: {
    clear: 0x050505,
    fog: 0x090909,
    core: 0x81796b,
    orbit: [0x665f54, 0x53585c],
    ribbon: [0x928977, 0x62747b, 0x6e6264],
    dust: [0xb1a589, 0x77848b],
    stars: [0xb7ae9b, 0x7b878b],
    signature: "mist",
  },
};

const curatedAtlasRegions = {
  白兔姑娘: "southern",
  妙音仙子: "southern",
  幽魂魔尊: "southern",
  影无邪: "southern",
  紫山真君: "southern",
  砚石老人: "southern",
  姜钰: "northern",
  毛六: "northern",
  盗天魔尊: "western",
  冰晶仙王: "black",
  萧荷尖: "black",
  寒灰仙姑: "black",
  夜天狼君: "black",
  火原洞主: "white",
  华文洞主: "white",
  气绝魔仙: "unverified",
  皮水寒: "northern",
  自在书生: "northern",
  万象星君: "northern",
  雪松子: "northern",
  药皇: "northern",
  廿二富: "northern",
  廿二平之: "northern",
  耶律群星: "northern",
  叶凡: "southern",
  夏槎: "southern",
  巴十八: "southern",
  蜂将: "eastern",
  毓秀仙子: "central",
  陈衣: "central",
};

const curatedAtlasLinks = {
  方源: [["方正", "兄弟对照"], ["白凝冰", "互相利用"], ["黑楼兰", "盟约与交易"], ["影无邪", "夺胎因果"], ["龙公", "宿命大战敌手"]],
  方正: [["方源", "兄弟对照"]],
  白凝冰: [["方源", "同路与背刺"], ["影无邪", "影宗同行"]],
  商心慈: [["方源", "旧识"], ["商燕飞", "父女"]],
  商燕飞: [["商心慈", "父女"]],
  铁若男: [["方源", "追查与对立"], ["铁血冷", "父女"]],
  铁血冷: [["铁若男", "父女"]],
  武庸: [["武独秀", "母子"], ["方源", "对手与交易"]],
  武独秀: [["武庸", "母子"]],
  陆畏因: [["乐土仙尊", "传承"], ["方源", "合作与布局"]],
  凤九歌: [["凤金煌", "父女"], ["白晴仙子", "夫妻"], ["方源", "敌手与变量"]],
  凤金煌: [["凤九歌", "父女"], ["白晴仙子", "母女"], ["方源", "梦道竞争"]],
  白晴仙子: [["凤九歌", "夫妻"], ["凤金煌", "母女"]],
  赵怜云: [["马鸿运", "恋人"]],
  龙公: [["红莲魔尊", "师徒"], ["方源", "宿命大战敌手"]],
  紫薇仙子: [["方源", "推演与追杀"], ["幽魂魔尊", "后期受制"]],
  星宿仙尊: [["方源", "尊者对弈"], ["巨阳仙尊", "三尊对峙"]],
  马鸿运: [["赵怜云", "恋人"], ["巨阳仙尊", "运道牵连"]],
  黑楼兰: [["方源", "盟约与交易"], ["黑城", "父女仇怨"], ["黎山仙子", "亲族同盟"]],
  黑城: [["黑楼兰", "父女仇怨"], ["姜钰", "扶持与利用"]],
  黎山仙子: [["黑楼兰", "亲族同盟"], ["方源", "盟约交易"]],
  太白云生: [["方源", "同行"]],
  楚度: [["方源", "力道交易"]],
  巨阳仙尊: [["马鸿运", "运道牵连"], ["方源", "尊者对弈"], ["星宿仙尊", "三尊对峙"]],
  雪胡老祖: [["万寿娘子", "夫妻"]],
  万寿娘子: [["雪胡老祖", "夫妻"]],
  琅琊地灵: [["方源", "合作与决裂"], ["毛六", "潜伏者"]],
  气海老祖: [["方源", "分身"], ["气绝魔仙", "气道交锋"]],
  吴帅: [["方源", "分身"]],
  宋亦诗: [["方源", "东海旧事"]],
  沈从声: [],
  房功: [["房睇长", "同族"]],
  房睇长: [["房功", "同族"], ["方源", "算计与争夺"]],
  千变老祖: [["方源", "真传争夺"]],
  华文洞主: [],
  气绝魔仙: [["气海老祖", "气道交锋"], ["方源", "冲突与交易"]],
  幽魂魔尊: [["影无邪", "分魂"], ["紫山真君", "分魂"], ["方源", "至尊仙胎争夺"], ["紫薇仙子", "后期控制"]],
  影无邪: [["幽魂魔尊", "分魂"], ["方源", "夺胎因果"], ["白凝冰", "影宗同行"], ["妙音仙子", "影宗同行"], ["白兔姑娘", "影宗同行"]],
  紫山真君: [["幽魂魔尊", "分魂"], ["影无邪", "影宗传承"]],
  妙音仙子: [["影无邪", "影宗同行"], ["白兔姑娘", "南疆同路"]],
  白兔姑娘: [["影无邪", "影宗同行"], ["妙音仙子", "南疆同路"]],
  姜钰: [["黑城", "扶持与利用"], ["影无邪", "影宗线"]],
  毛六: [["琅琊地灵", "潜伏"], ["方源", "敌对与交易"]],
  冰晶仙王: [["萧荷尖", "两天盟共事"]],
  萧荷尖: [["冰晶仙王", "两天盟共事"]],
  红莲魔尊: [["龙公", "师徒"], ["方源", "真传受益"]],
  乐土仙尊: [["陆畏因", "传承"], ["方源", "后手布局"]],
};

const adminTabs = [
  { id: "hero", label: "首页" },
  { id: "moments", label: "名场面" },
  { id: "timeline", label: "时间线" },
  { id: "players", label: "人物" },
  { id: "systems", label: "体系" },
  { id: "atlas", label: "星图" },
  { id: "gallery", label: "视觉位" },
  { id: "json", label: "JSON" },
];

function cloneContent(value) {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function mergeById(baseItems = [], incomingItems = []) {
  const byId = new Map();
  [...baseItems, ...incomingItems].forEach((item) => {
    const key = item?.id || item?.name;
    if (key) byId.set(key, item);
  });
  return Array.from(byId.values());
}

function mergeContent(base, incoming = {}) {
  const merged = { ...base, ...incoming };
  merged.atlas = {
    ...(base.atlas || {}),
    ...(incoming.atlas || {}),
    regions: mergeById(base.atlas?.regions || [], incoming.atlas?.regions || []),
    characters: mergeById(base.atlas?.characters || [], incoming.atlas?.characters || []),
  };
  return merged;
}

function curateAtlasCharacters(characters = []) {
  const byName = new Map(characters.map((character) => [character.name, character]));

  return characters.map((character) => {
    const linkDefinitions = curatedAtlasLinks[character.name];
    const relations = linkDefinitions
      ? linkDefinitions.flatMap(([targetName, type]) => {
          const target = byName.get(targetName);
          return target ? [{ target: target.id, type }] : [];
        })
      : character.relations || [];

    return {
      ...character,
      region: curatedAtlasRegions[character.name] || character.region,
      relations,
      immortalGuProfile: verifiedImmortalGuProfiles[character.name],
      killerMoveProfile: verifiedKillerMoveProfiles[character.name],
      source: {
        ...(characterEvidenceByName[character.name] || {}),
        ...(character.source || {}),
      },
    };
  });
}

function characterHref(characterId) {
  return `/atlas/person/${encodeURIComponent(characterId)}`;
}

function getCharacterRouteId() {
  const match = window.location.pathname.match(/^\/atlas\/person\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : "";
}

function getRoute() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/moments") return "moments";
  if (path === "/timeline") return "timeline";
  if (path === "/players") return "players";
  if (path === "/systems") return "systems";
  if (path === "/atlas") return "atlas";
  if (path.startsWith("/atlas/person/")) return "character";
  if (path === "/admin") return "admin";
  return "home";
}

function useHomepageContent() {
  const [content, setContent] = useState(fallbackContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/homepage")
      .then((res) => {
        if (!res.ok) throw new Error("内容接口暂不可用。");
        return res.json();
      })
      .then((data) => {
        if (alive) {
          setContent(mergeContent(fallbackContent, data));
          setError("");
        }
      })
      .catch((err) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { content, setContent, loading, error };
}

function useAppleLikeMotion(dependency) {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealNodes = Array.from(document.querySelectorAll("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.22, rootMargin: "0px 0px -12% 0px" },
    );

    revealNodes.forEach((node) => observer.observe(node));

    let ticking = false;
    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      document.documentElement.style.setProperty("--scroll-progress", String(progress));
      document.documentElement.style.setProperty("--hero-lift", `${Math.min(window.scrollY * 0.12, 132)}px`);
      if (!reduceMotion) {
        document.documentElement.style.setProperty("--hero-scale", String(1 + Math.min(progress * 0.07, 0.07)));
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScroll);
      }
    };

    const onPointerMove = (event) => {
      if (reduceMotion) return;
      document.documentElement.style.setProperty("--cursor-x", (event.clientX / window.innerWidth - 0.5).toFixed(4));
      document.documentElement.style.setProperty("--cursor-y", (event.clientY / window.innerHeight - 0.5).toFixed(4));
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [dependency]);
}

function AtmosphereScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles = Array.from({ length: 72 }, (_, index) => ({
      x: (index * 137.5) % 100,
      y: 14 + ((index * 47) % 68),
      speed: 0.12 + (index % 9) * 0.025,
      size: 0.6 + (index % 5) * 0.24,
      alpha: 0.2 + (index % 6) * 0.045,
    }));
    let frame = 0;
    let raf = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawRidge = (width, height, y, color, offset, density) => {
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, y);
      for (let x = 0; x <= width + density; x += density) {
        const peak = y - 28 - Math.sin((x + offset) * 0.018) * 36;
        const valley = y + 24 + Math.cos((x + offset) * 0.01) * 16;
        ctx.quadraticCurveTo(x + density * 0.42, peak, x + density, valley);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      frame += reduceMotion ? 0 : 1;
      ctx.clearRect(0, 0, width, height);

      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#060708");
      bg.addColorStop(0.44, "#11100e");
      bg.addColorStop(0.74, "#16120e");
      bg.addColorStop(1, "#050505");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalAlpha = 0.34;
      for (let i = 0; i < 8; i += 1) {
        const y = height * (0.16 + i * 0.074);
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= width; x += 26) {
          const wave = Math.sin((x + frame * (0.55 + i * 0.12)) * 0.012 + i) * (8 + i * 2);
          ctx.lineTo(x, y + wave);
        }
        ctx.strokeStyle = i % 2 ? "rgba(216, 193, 123, .14)" : "rgba(143, 184, 194, .11)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.translate(width * 0.52, height * 0.42);
      ctx.rotate(frame * 0.001);
      for (let ring = 0; ring < 7; ring += 1) {
        ctx.beginPath();
        ctx.ellipse(0, 0, 92 + ring * 30, 20 + ring * 8, ring * 0.28, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(235, 225, 184, ${0.18 - ring * 0.017})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      particles.forEach((particle, index) => {
        const x = ((particle.x + frame * particle.speed) % 100) * width * 0.01;
        const y = particle.y * height * 0.01 + Math.sin(frame * 0.016 + index) * 8;
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = index % 5 === 0
          ? `rgba(214, 181, 111, ${particle.alpha})`
          : `rgba(160, 190, 182, ${particle.alpha * 0.75})`;
        ctx.fill();
      });

      drawRidge(width, height, height * 0.64, "rgba(44, 40, 36, .72)", frame * 0.5, 74);
      drawRidge(width, height, height * 0.75, "rgba(17, 17, 16, .94)", frame * 0.34, 88);

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas className="atmosphere-scene" ref={canvasRef} aria-hidden="true" />;
}

function SiteChrome({ content, activeRoute }) {
  return (
    <>
      <div className="progress-line" aria-hidden="true" />
      <header className="global-nav">
        <a className="brand-mark" href="/">
          <span className="brand-dot" />
          {content.meta?.siteName || "蛊真人"}
        </a>
        <nav aria-label="主导航">
          {(content.nav || []).map((item) => (
            <a className={item.route === activeRoute ? "active" : ""} key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>
    </>
  );
}

function ProductRail({ items = [] }) {
  return (
    <section className="product-rail" aria-label="内容入口">
      <div className="rail-track">
        {items.map((item) => {
          const Icon = iconMap[item.icon] || Sparkles;
          return (
            <a className="rail-item" href={item.href} key={`${item.title}-${item.href}`}>
              <Icon size={24} strokeWidth={1.8} />
              <strong>{item.title}</strong>
              <span>{item.caption}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function PublicLayout({ content, activeRoute, children, showRail = true }) {
  useAppleLikeMotion(activeRoute);
  return (
    <main>
      <SiteChrome content={content} activeRoute={activeRoute} />
      {showRail && <ProductRail items={content.productRail} />}
      {children}
    </main>
  );
}

function VisualPlaceholder({ label, caption, accent, index, large = false }) {
  return (
    <div
      className={`visual-placeholder${large ? " large" : ""}`}
      style={{ "--accent": accent || accents[index % accents.length] }}
    >
      <div className="visual-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="visual-mark" aria-hidden="true">
        <CircleDot size={large ? 58 : 42} strokeWidth={1.25} />
      </div>
      <div className="visual-caption">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>{label}</strong>
        {caption && <p>{caption}</p>}
      </div>
    </div>
  );
}

function PageHero({ eyebrow, title, text }) {
  return (
    <section className="page-hero" data-reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {text && <p>{text}</p>}
    </section>
  );
}

function HomePage({ content, loading, error }) {
  return (
    <PublicLayout content={content} activeRoute="home">
      <section className="hero-section home-only" id="top">
        <AtmosphereScene />
        {(loading || error) && <p className="quiet-status home-status">{loading ? "载入内容中" : error}</p>}
      </section>
    </PublicLayout>
  );
}

function MomentsPage({ content }) {
  const moments = content.moments || [];
  const slots = content.gallerySlots || [];
  return (
    <PublicLayout content={content} activeRoute="moments">
      <PageHero eyebrow="Scenes" title="名场面" text="这里只放关键场景。具体图片你后面安排，页面先留好位置。" />
      <section className="moments-section page-section">
        <div className="moments-stack">
          {moments.map((moment, index) => (
            <article className={`moment-block${index % 2 === 1 ? " reverse" : ""}`} data-reveal key={`${moment.kicker}-${moment.title}`}>
              <div className="moment-copy">
                <p className="eyebrow">{moment.kicker}</p>
                <h3>{moment.title}</h3>
                <p>{moment.text}</p>
              </div>
              <VisualPlaceholder
                label={moment.slot || moment.kicker}
                caption="照片稍后由你安排"
                accent={moment.accent}
                index={index}
                large
              />
            </article>
          ))}
        </div>
      </section>
      <section className="gallery-section page-section">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">Visual slots</p>
          <h2>图片位置先留着。</h2>
        </div>
        <div className="gallery-grid">
          {slots.map((slot, index) => (
            <VisualPlaceholder
              key={`${slot.title}-${index}`}
              label={slot.title}
              caption={slot.caption}
              accent={accents[index % accents.length]}
              index={index}
            />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

function TimelinePage({ content }) {
  return (
    <PublicLayout content={content} activeRoute="timeline">
      <PageHero eyebrow="Timeline" title="时间线" text="六段主线单独成页，首页不再承载这些内容。" />
      <section className="timeline-section page-section">
        <div className="timeline-track">
          {(content.timeline || []).map((item, index) => (
            <article className="timeline-card" data-reveal key={`${item.volume}-${item.title}`}>
              <span className="timeline-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="timeline-stat">{item.stat}</span>
              <p>{item.volume}</p>
              <h3>{item.title}</h3>
              <span>{item.detail}</span>
            </article>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

function PlayersPage({ content }) {
  return (
    <PublicLayout content={content} activeRoute="players">
      <PageHero eyebrow="Board" title="人物棋局" text="人物和势力单独放在这里，后续可以继续扩成关系图。" />
      <section className="players-section page-section">
        <div className="players-stage" data-reveal>
          <p className="eyebrow">Positions</p>
          <h2>立场、欲望和代价。</h2>
        </div>
        <div className="player-grid">
          {(content.players || []).map((player) => (
            <article className="player-card" data-reveal key={player.name}>
              <span>{player.role}</span>
              <h3>{player.name}</h3>
              <p>{player.text}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

function SystemExplorer({ systems = [] }) {
  const [active, setActive] = useState(0);
  const current = systems[active] || systems[0];

  useEffect(() => {
    if (active >= systems.length) setActive(0);
  }, [active, systems.length]);

  if (!systems.length) return null;

  return (
    <div className="system-explorer" data-reveal>
      <div className="system-tabs" role="tablist" aria-label="蛊道体系">
        {systems.map((system, index) => (
          <button
            aria-selected={active === index}
            className={active === index ? "active" : ""}
            key={system.name}
            onClick={() => setActive(index)}
            role="tab"
            type="button"
          >
            <span>{system.label || "体系"}</span>
            {system.name}
          </button>
        ))}
      </div>
      <div className="system-stage">
        <div className="system-core" aria-hidden="true">
          <Waves size={92} strokeWidth={1.1} />
        </div>
        <p>{current.label}</p>
        <h3>{current.name}</h3>
        <span>{current.text}</span>
      </div>
    </div>
  );
}

function SystemsPage({ content }) {
  return (
    <PublicLayout content={content} activeRoute="systems">
      <PageHero eyebrow="System" title="蛊道体系" text="体系页只解释规则引擎，不和首页混在一起。" />
      <section className="systems-section page-section">
        <SystemExplorer systems={content.systems || []} />
      </section>
    </PublicLayout>
  );
}

function buildAtlas3DNodes(characters) {
  const nodes = [];
  const orbits = [];
  let ring = 0;
  let cursor = 0;

  while (cursor < characters.length) {
    const radius = 11.5 + ring * 10.2;
    const capacity = Math.max(7, Math.floor((Math.PI * 2 * radius) / 11.5));
    const count = Math.min(capacity, characters.length - cursor);
    const orbit = {
      radius,
      squash: 0.8 + ((ring * 13) % 4) * 0.045,
      wave: 0.7 + (ring % 3) * 0.38,
      phase: ring * 0.82,
      rotation: new THREE.Euler(
        [0.18, 0.78, -0.9, 1.16, -0.6, 0.94][ring % 6],
        ring * 0.27,
        [0.16, -0.38, 0.52, -0.24, 0.42, -0.48][ring % 6],
      ),
    };
    orbits.push(orbit);

    for (let slot = 0; slot < count; slot += 1) {
      const character = characters[cursor + slot];
      const angle = (slot / count) * Math.PI * 2 + ring * 0.57;
      nodes.push({
        ...character,
        position: atlasOrbitPoint(orbit, angle),
        radius,
        ring,
      });
    }
    cursor += count;
    ring += 1;
  }

  return { nodes, orbits };
}

function atlasOrbitPoint(orbit, angle) {
  const point = new THREE.Vector3(
    Math.cos(angle) * orbit.radius,
    Math.sin(angle * 2 + orbit.phase) * orbit.wave,
    Math.sin(angle) * orbit.radius * orbit.squash,
  );
  return point.applyEuler(orbit.rotation);
}

function createOrbitLine(orbit, color = 0x5b5247) {
  const points = Array.from({ length: 240 }, (_, index) => {
    const angle = (index / 240) * Math.PI * 2;
    return atlasOrbitPoint(orbit, angle);
  });
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineDashedMaterial({
    color,
    dashSize: 0.8,
    gapSize: 0.72,
    transparent: true,
    opacity: 0.33,
  });
  const line = new THREE.LineLoop(geometry, material);
  line.computeLineDistances();
  return line;
}

function createGlowTexture() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 128;
  canvas.height = 128;
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255, 249, 218, 1)");
  gradient.addColorStop(0.12, "rgba(245, 212, 137, 0.94)");
  gradient.addColorStop(0.38, "rgba(202, 135, 73, 0.32)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.userData.sharedAtlasGlow = true;
  return texture;
}

function seededValue(seed) {
  const value = Math.sin(seed * 93.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createStarCloud(count, innerRadius, outerRadius, color, size, opacity, glowTexture) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (let index = 0; index < count; index += 1) {
    const distance = innerRadius + seededValue(index + count) * (outerRadius - innerRadius);
    const theta = seededValue(index * 2.17 + 2) * Math.PI * 2;
    const vertical = (seededValue(index * 4.13 + 7) - 0.5) * outerRadius * 1.45;
    positions.push(Math.cos(theta) * distance, vertical, Math.sin(theta) * distance);
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    map: glowTexture,
    color,
    size,
    transparent: true,
    opacity,
    fog: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geometry, material);
}

function createSpiralMist(count, radius, color, size, opacity, turn, glowTexture) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (let index = 0; index < count; index += 1) {
    const distance = radius * (0.14 + Math.pow(seededValue(index * 1.91 + turn), 0.72) * 0.86);
    const arm = index % 3;
    const angle = (arm / 3) * Math.PI * 2 + (distance / radius) * turn
      + (seededValue(index * 3.8 + 9) - 0.5) * 0.62;
    const elevation = (seededValue(index * 5.4 + 14) - 0.5) * (1.2 + distance * 0.12);
    positions.push(Math.cos(angle) * distance, elevation, Math.sin(angle) * distance);
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      map: glowTexture,
      color,
      size,
      transparent: true,
      opacity,
      fog: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}

function createFaintTwinkles(radius, colors, glowTexture) {
  const group = new THREE.Group();
  group.add(
    createStarCloud(118, radius * 0.28, radius * 1.18, colors[0], 0.17, 0.34, glowTexture),
    createStarCloud(64, radius * 0.34, radius * 1.32, colors[1], 0.22, 0.3, glowTexture),
  );
  group.rotation.set(0.2, -0.32, 0.08);
  return group;
}

function createDriftingGlints(colors, glowTexture) {
  const group = new THREE.Group();
  const palette = [colors[0], colors[1], 0xd47c50, 0xe0b75b, 0x64b092, 0x62a7c0, 0x9070c5, 0xc56562];
  for (let index = 0; index < 26; index += 1) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: palette[index % palette.length],
        transparent: true,
        opacity: 0.44 + seededValue(index * 4.3 + 5) * 0.22,
        fog: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    const scale = 1.38 + seededValue(index * 7.4 + 4) * 1.12;
    sprite.scale.set(scale, scale, 1);
    sprite.userData = {
      baseOpacity: sprite.material.opacity,
      baseScale: scale,
      phase: seededValue(index * 4.07 + 7) * Math.PI * 2,
      position: {
        x: -0.9 + seededValue(index * 6.19 + 3) * 1.8,
        y: -0.84 + seededValue(index * 9.31 + 8) * 1.68,
      },
      drift: {
        x: 0.018 + seededValue(index * 5.33 + 18) * 0.05,
        y: 0.014 + seededValue(index * 8.11 + 26) * 0.045,
        speed: 0.46 + seededValue(index * 3.71 + 33) * 0.62,
      },
    };
    group.add(sprite);
  }
  return group;
}

function positionDriftingGlints(group, camera, time = 0) {
  const distance = 180;
  const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
  const halfWidth = halfHeight * camera.aspect;
  group.children.forEach((glint) => {
    const travel = time * glint.userData.drift.speed + glint.userData.phase;
    glint.position.set(
      (glint.userData.position.x + Math.sin(travel) * glint.userData.drift.x) * halfWidth,
      (glint.userData.position.y + Math.cos(travel * 0.82) * glint.userData.drift.y) * halfHeight,
      -distance,
    );
  });
}

function createAtmosphericLine(points, color, opacity = 0.26, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points, closed, "catmullrom", 0.45);
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(closed ? 132 : 84));
  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}

function createDomainSignature(signature, radius, colors) {
  const group = new THREE.Group();
  const point = ([x, y, z]) => new THREE.Vector3(x * radius, y * radius, z * radius);
  const add = (coordinates, index = 0, opacity = 0.22, closed = false) => {
    group.add(createAtmosphericLine(coordinates.map(point), colors[index % colors.length], opacity, closed));
  };

  if (signature === "ridge") {
    for (let lane = 0; lane < 3; lane += 1) {
      const yBase = -0.33 + lane * 0.11;
      add(
        Array.from({ length: 11 }, (_, index) => {
          const x = -1.05 + index * 0.21;
          const peak = index % 2 ? 0.08 + seededValue(index + lane * 12) * 0.15 : 0;
          return [x, yBase + peak, -0.46 + lane * 0.13];
        }),
        lane,
        0.22 - lane * 0.035,
      );
    }
  } else if (signature === "river") {
    add([[-1.02, -0.2, -0.4], [-0.56, -0.13, -0.1], [-0.18, -0.22, 0.13], [0.2, -0.12, 0.22], [0.56, -0.2, -0.05], [1.02, -0.1, -0.35]], 1, 0.32);
    add([[-0.92, -0.31, -0.22], [-0.42, -0.23, 0.07], [0.04, -0.3, 0.25], [0.5, -0.22, 0.05], [0.9, -0.28, -0.26]], 0, 0.2);
  } else if (signature === "wind") {
    for (let lane = 0; lane < 4; lane += 1) {
      const y = -0.28 + lane * 0.18;
      add([[-1.1, y, -0.36], [-0.62, y + 0.08, -0.16], [-0.12, y + 0.03, 0.02], [0.4, y + 0.11, 0.12], [1.08, y + 0.02, -0.28]], lane, 0.18 + lane * 0.025);
    }
  } else if (signature === "tide" || signature === "cloud") {
    const loops = signature === "tide" ? 4 : 3;
    for (let lane = 0; lane < loops; lane += 1) {
      const size = 0.18 + lane * 0.14;
      const coordinates = Array.from({ length: 28 }, (_, index) => {
        const angle = (index / 28) * Math.PI * 2;
        return [
          0.4 + Math.cos(angle) * size * 1.65,
          -0.2 + lane * 0.065 + Math.sin(angle) * size * (signature === "cloud" ? 0.42 : 0.28),
          -0.26 + Math.sin(angle) * size,
        ];
      });
      add(coordinates, lane, signature === "tide" ? 0.2 : 0.16, true);
    }
  } else if (signature === "dune") {
    for (let lane = 0; lane < 4; lane += 1) {
      add(
        Array.from({ length: 15 }, (_, index) => {
          const x = -1.1 + index * 0.16;
          return [x, -0.43 + lane * 0.09 + Math.sin(index * 0.8 + lane) * 0.045, -0.28 + lane * 0.1];
        }),
        lane,
        0.19 + lane * 0.02,
      );
    }
  } else if (signature === "void") {
    add([[-0.9, 0.38, -0.38], [-0.52, 0.08, -0.18], [-0.1, 0.27, 0], [0.28, -0.03, 0.16], [0.74, 0.25, -0.08]], 0, 0.26);
    add([[-0.76, -0.32, -0.18], [-0.38, -0.02, 0.2], [0.06, -0.24, 0.08], [0.53, 0.04, -0.2], [0.94, -0.21, -0.36]], 1, 0.22);
  } else {
    add([[-0.92, -0.22, -0.25], [-0.48, -0.16, 0.08], [0, -0.25, 0.14], [0.45, -0.16, 0.04], [0.92, -0.23, -0.28]], 0, 0.14);
  }

  group.rotation.x = -0.17;
  return group;
}

function createOrbitDust(orbit, color, glowTexture) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (let index = 0; index < 90; index += 1) {
    const angle = (index / 90) * Math.PI * 2 + seededValue(index + orbit.radius) * 0.11;
    const point = atlasOrbitPoint(orbit, angle);
    point.multiplyScalar(1 + (seededValue(index * 7.2 + orbit.radius) - 0.5) * 0.035);
    positions.push(point.x, point.y, point.z);
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      map: glowTexture,
      color,
      size: 0.42,
      transparent: true,
      opacity: 0.58,
      fog: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}

function createEnergyRibbon(radius, verticalReach, color, phase) {
  const points = Array.from({ length: 96 }, (_, index) => {
    const angle = (index / 96) * Math.PI * 2;
    const stretch = radius + Math.sin(angle * 3 + phase) * radius * 0.11;
    return new THREE.Vector3(
      Math.cos(angle + phase) * stretch,
      Math.sin(angle * 2 + phase) * verticalReach,
      Math.sin(angle + phase) * stretch * 0.74,
    );
  });
  const curve = new THREE.CatmullRomCurve3(points, true);
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, 180, 0.065, 5, true),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}

function createTextSprite(text, color = "#f7f2e7", scale = 1) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const width = 512;
  const height = 128;
  canvas.width = width;
  canvas.height = height;
  context.clearRect(0, 0, width, height);
  context.font = '800 48px "Microsoft YaHei UI", "PingFang SC", sans-serif';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.shadowColor = "rgba(0, 0, 0, 0.82)";
  context.shadowBlur = 16;
  context.fillStyle = color;
  context.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(Math.min(4.8, 1.35 + text.length * 0.32) * scale, 0.8 * scale, 1);
  return sprite;
}

function positionAtlasLabel(label, node, distance = 1.55) {
  const outward = node.position.clone().normalize().multiplyScalar(distance * 0.48);
  label.position.copy(node.position).add(outward).add(new THREE.Vector3(0, distance * 0.76, 0));
}

function createRelationArc(source, target, glowTexture) {
  const distance = source.distanceTo(target);
  const midpoint = source.clone().lerp(target, 0.5);
  const outward = midpoint.lengthSq() > 0.01 ? midpoint.clone().normalize() : new THREE.Vector3(0, 1, 0);
  midpoint.add(outward.multiplyScalar(Math.min(6.2, distance * 0.11 + 1.6)));
  midpoint.y += Math.min(7.2, distance * 0.17 + 2.2);
  const curve = new THREE.QuadraticBezierCurve3(source, midpoint, target);
  const group = new THREE.Group();
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 52, 0.045, 6, false),
    new THREE.MeshBasicMaterial({
      color: 0xd4b56f,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    }),
  );
  const signal = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffdc88,
      transparent: true,
      opacity: 0.94,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  signal.scale.set(1.45, 1.45, 1);
  group.add(tube, signal);
  group.userData.curve = curve;
  group.userData.signal = signal;
  return group;
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (material.map && !material.map.userData.sharedAtlasGlow) material.map.dispose();
        material.dispose();
      });
    }
  });
}

function resolveAtlasFraming(ambience, population, compactViewport) {
  if (!ambience.fitSparseScene) {
    return compactViewport ? ambience.compactFraming || ambience.framing || 1 : ambience.framing || 1;
  }

  const sparseRatio = THREE.MathUtils.clamp((14 - population) / 10, 0, 1);
  return compactViewport
    ? THREE.MathUtils.lerp(1.62, 2.2, sparseRatio)
    : THREE.MathUtils.lerp(1.4, 1.96, sparseRatio);
}

function ThreeAtlasScene({ characters, regions, activeRegion, regionPopulation, selectedId, onSelect }) {
  const mountRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const sceneStateRef = useRef(null);
  const selectedRef = useRef(selectedId);
  const relatedIdsRef = useRef(new Set());

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const ambience = atlasAmbiences[activeRegion] || atlasAmbiences.unverified;
    const { nodes, orbits } = buildAtlas3DNodes(characters);
    const maxRadius = Math.max(18, ...nodes.map((node) => node.radius));
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(ambience.fog, 0.0045);

    const camera = new THREE.PerspectiveCamera(49, 1, 0.1, 1000);
    const framing = resolveAtlasFraming(ambience, regionPopulation, window.innerWidth < 760);
    camera.position.set(maxRadius * 0.92 * framing, maxRadius * 0.64 * framing, maxRadius * 1.28 * framing);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(ambience.clear, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.target.set(0, 1, 0);
    controls.minDistance = 16;
    controls.maxDistance = Math.max(124, maxRadius * 4.6);
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: undefined,
    };

    const ambient = new THREE.AmbientLight(0xcbbf9f, 1.2);
    const key = new THREE.PointLight(0xf2c276, 112, 130);
    key.position.set(-12, 20, 16);
    const fill = new THREE.PointLight(0x72bfc6, 72, 130);
    fill.position.set(28, -2, -26);
    const rim = new THREE.PointLight(0x9b78db, 64, 120);
    rim.position.set(-30, -12, -18);
    scene.add(ambient, key, fill, rim);

    const root = new THREE.Group();
    scene.add(root);

    const glowTexture = createGlowTexture();
    const farStars = createStarCloud(1450, maxRadius + 20, maxRadius + 106, ambience.stars[0], 0.42, 0.34, glowTexture);
    const coldStars = createStarCloud(760, maxRadius + 15, maxRadius + 94, ambience.stars[1], 0.34, 0.28, glowTexture);
    const fieldDust = createStarCloud(380, maxRadius * 0.18, maxRadius * 1.18, ambience.stars[0], 0.18, 0.16, glowTexture);
    const twinkles = createFaintTwinkles(maxRadius, ambience.stars, glowTexture);
    const driftingGlints = createDriftingGlints(ambience.stars, glowTexture);
    const primaryMist = createSpiralMist(1280, maxRadius * 0.94, ambience.ribbon[0], 0.25, 0.16, 8.4, glowTexture);
    const secondaryMist = createSpiralMist(760, maxRadius * 0.84, ambience.ribbon[1], 0.2, 0.12, -7.3, glowTexture);
    primaryMist.rotation.set(0.22, -0.28, 0.14);
    secondaryMist.rotation.set(-0.34, 0.12, -0.2);
    const domainSignature = createDomainSignature(ambience.signature, maxRadius, ambience.ribbon);
    scene.add(farStars, coldStars, fieldDust, twinkles, primaryMist, secondaryMist);
    camera.add(driftingGlints);
    scene.add(camera);
    root.add(domainSignature);

    const orbitDusts = [];
    orbits.forEach((orbit, index) => {
      const orbitLine = createOrbitLine(orbit, ambience.orbit[index % ambience.orbit.length]);
      const dust = createOrbitDust(orbit, ambience.dust[index % ambience.dust.length], glowTexture);
      root.add(orbitLine, dust);
      orbitDusts.push(dust);
    });

    const currents = new THREE.Group();
    currents.add(
      createEnergyRibbon(maxRadius * 0.52, maxRadius * 0.15, ambience.ribbon[0], 0.2),
      createEnergyRibbon(maxRadius * 0.72, maxRadius * 0.2, ambience.ribbon[1], 1.7),
      createEnergyRibbon(maxRadius * 0.92, maxRadius * 0.24, ambience.ribbon[2], 3.4),
    );
    root.add(currents);

    const coreGroup = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.15, 5),
      new THREE.MeshPhysicalMaterial({
        color: 0x171018,
        emissive: ambience.core,
        emissiveIntensity: 0.92,
        roughness: 0.38,
        metalness: 0.62,
        clearcoat: 0.6,
      }),
    );
    const coreHalo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: ambience.core,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    coreHalo.scale.set(15, 15, 1);
    const coreRingA = new THREE.Mesh(
      new THREE.TorusGeometry(4.4, 0.045, 8, 160),
      new THREE.MeshBasicMaterial({ color: ambience.ribbon[0], transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending }),
    );
    coreRingA.rotation.set(1.13, 0.3, 0.28);
    const coreRingB = new THREE.Mesh(
      new THREE.TorusGeometry(5.65, 0.025, 8, 160),
      new THREE.MeshBasicMaterial({ color: ambience.ribbon[1], transparent: true, opacity: 0.46, blending: THREE.AdditiveBlending }),
    );
    coreRingB.rotation.set(0.72, -0.18, -0.65);
    coreGroup.add(coreHalo, core, coreRingA, coreRingB);
    root.add(coreGroup);

    const regionColor = new Map(regions.map((region) => [region.id, region.color || "#d4b56f"]));
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const nodeMeshes = [];
    const pickMeshes = [];
    const nodeHalos = new Map();
    const baseLabels = new Map();
    const selectionGroup = new THREE.Group();
    root.add(selectionGroup);
    const sphereGeometry = new THREE.IcosahedronGeometry(0.7, 3);
    const pickGeometry = new THREE.SphereGeometry(characters.length > 52 ? 1.28 : 1.52, 8, 8);
    const pickMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const labelScale = characters.length > 52 ? 3.12 : characters.length > 28 ? 3.35 : 3.62;

    nodes.forEach((node, index) => {
      const orbitalAccents = ["#e9ae5d", "#69adbb", "#9d83cc", "#d78165", "#dbbd71"];
      const glowColor = new THREE.Color(orbitalAccents[node.ring % orbitalAccents.length]);
      const color = new THREE.Color(regionColor.get(node.region) || "#d4b56f").lerp(
        new THREE.Color("#f3ddbc"),
        0.34,
      );
      glowColor.lerp(color, 0.36);
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 1.04,
        roughness: 0.28,
        metalness: 0.42,
      });
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTexture,
          color: glowColor,
          transparent: true,
          opacity: 0.44,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      halo.position.copy(node.position);
      halo.userData = { baseScale: 4.25, phase: index * 0.73, highlight: 1 };
      halo.scale.set(4.25, 4.25, 1);
      root.add(halo);
      nodeHalos.set(node.id, halo);

      const mesh = new THREE.Mesh(sphereGeometry, material);
      mesh.position.copy(node.position);
      mesh.scale.setScalar(1);
      mesh.userData.characterId = node.id;
      root.add(mesh);
      nodeMeshes.push(mesh);

      const pickMesh = new THREE.Mesh(pickGeometry, pickMaterial);
      pickMesh.position.copy(node.position);
      pickMesh.userData = { characterId: node.id, displayMesh: mesh };
      root.add(pickMesh);
      pickMeshes.push(pickMesh);

      const label = createTextSprite(node.name, "#e2c98a", labelScale);
      positionAtlasLabel(label, node, 2.18);
      root.add(label);
      baseLabels.set(node.id, label);
    });
    sceneStateRef.current = { root, nodes, nodeMap, nodeMeshes, nodeHalos, baseLabels, selectionGroup, glowTexture };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = null;
    let hoveredMesh = null;
    let frame = 0;
    let raf = 0;

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      positionDriftingGlints(driftingGlints, camera);
    };

    const updatePointer = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
    };

    const handlePointerMove = (event) => {
      updatePointer(event);
      const hit = raycaster.intersectObjects(pickMeshes, false)[0]?.object || null;
      if (hoveredMesh && hoveredMesh !== hit && hoveredMesh.userData.characterId !== selectedRef.current) {
        hoveredMesh.userData.displayMesh.scale.setScalar(
          relatedIdsRef.current.has(hoveredMesh.userData.characterId) ? 1.55 : 1,
        );
      }
      hoveredMesh = hit;
      renderer.domElement.style.cursor = hit ? "pointer" : "grab";
      if (hit && hit.userData.characterId !== selectedRef.current) hit.userData.displayMesh.scale.setScalar(1.7);
    };

    const handlePointerDown = (event) => {
      if (event.button !== 0) return;
      pointerDown = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event) => {
      if (event.button !== 0 || !pointerDown) return;
      const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
      pointerDown = null;
      if (moved > 8) return;
      updatePointer(event);
      const hit = raycaster.intersectObjects(pickMeshes, false)[0]?.object;
      if (hit?.userData.characterId) onSelectRef.current(hit.userData.characterId);
    };

    const allowBrowserContextMenu = (event) => {
      event.stopImmediatePropagation();
    };

    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("contextmenu", allowBrowserContextMenu, true);
    window.addEventListener("resize", resize);

    const animate = () => {
      frame += 1;
      const corePulse = 1 + Math.sin(frame * 0.024) * 0.085;
      core.scale.setScalar(corePulse);
      coreHalo.material.opacity = 0.43 + Math.sin(frame * 0.018) * 0.08;
      coreRingA.rotation.z += 0.0022;
      coreRingB.rotation.y -= 0.0017;
      currents.rotation.y -= 0.00062;
      currents.rotation.x = Math.sin(frame * 0.002) * 0.035;
      nodeHalos.forEach((halo) => {
        const pulse = 1 + Math.sin(frame * 0.027 + halo.userData.phase) * 0.13;
        const scale = halo.userData.baseScale * halo.userData.highlight * pulse;
        halo.scale.set(scale, scale, 1);
      });
      selectionGroup.children.forEach((object, index) => {
        if (!object.userData.curve) return;
        object.userData.signal.position.copy(object.userData.curve.getPoint((frame * 0.008 + index * 0.18) % 1));
      });
      orbitDusts.forEach((dust, index) => {
        dust.material.opacity = 0.42 + Math.sin(frame * 0.014 + index) * 0.13;
      });
      root.rotation.y += 0.00028;
      farStars.rotation.y += 0.00008;
      coldStars.rotation.y -= 0.00006;
      fieldDust.rotation.y += 0.00018;
      fieldDust.rotation.z = Math.sin(frame * 0.001) * 0.025;
      twinkles.rotation.y -= 0.00009;
      positionDriftingGlints(driftingGlints, camera, frame * 0.004);
      driftingGlints.children.forEach((glint) => {
        const shimmer = 0.86 + Math.sin(frame * 0.012 + glint.userData.phase) * 0.14;
        const scale = glint.userData.baseScale * (0.94 + shimmer * 0.08);
        glint.material.opacity = glint.userData.baseOpacity * shimmer;
        glint.scale.set(scale, scale, 1);
      });
      primaryMist.rotation.y += 0.00022;
      secondaryMist.rotation.y -= 0.00027;
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    resize();
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("contextmenu", allowBrowserContextMenu, true);
      controls.dispose();
      sceneStateRef.current = null;
      disposeObject(scene);
      glowTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [characters, regions, activeRegion, regionPopulation]);

  useEffect(() => {
    selectedRef.current = selectedId;
    const state = sceneStateRef.current;
    if (!state) return;

    disposeObject(state.selectionGroup);
    state.selectionGroup.clear();

    const selectedNode = selectedId ? state.nodeMap.get(selectedId) : null;
    const relatedIds = new Set((selectedNode?.relations || []).map((relation) => relation.target));
    relatedIdsRef.current = relatedIds;
    state.baseLabels.forEach((label, id) => {
      label.visible = id !== selectedId && !relatedIds.has(id);
    });

    state.nodeMeshes.forEach((mesh) => {
      const id = mesh.userData.characterId;
      const isSelected = id === selectedId;
      const isRelated = relatedIds.has(id);
      mesh.scale.setScalar(isSelected ? 2.35 : isRelated ? 1.55 : 1);
      mesh.material.emissiveIntensity = isSelected ? 1.7 : isRelated ? 1.25 : 0.92;
      const halo = state.nodeHalos.get(id);
      if (halo) {
        halo.userData.highlight = isSelected ? 2.35 : isRelated ? 1.62 : 1;
        halo.material.opacity = isSelected ? 0.8 : isRelated ? 0.62 : 0.42;
      }
    });

    if (!selectedNode) return;

    const selectedRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.46, 0.048, 8, 100),
      new THREE.MeshBasicMaterial({
        color: 0xf4d27e,
        transparent: true,
        opacity: 0.78,
        blending: THREE.AdditiveBlending,
      }),
    );
    selectedRing.position.copy(selectedNode.position);
    selectedRing.rotation.set(0.9, -0.2, 0.36);
    state.selectionGroup.add(selectedRing);

    const selectedLabel = createTextSprite(selectedNode.name, "#fff7df", 3.45);
    positionAtlasLabel(selectedLabel, selectedNode, 2.85);
    state.selectionGroup.add(selectedLabel);

    selectedNode.relations?.forEach((relation) => {
      const target = state.nodeMap.get(relation.target);
      if (!target) return;
      state.selectionGroup.add(createRelationArc(selectedNode.position, target.position, state.glowTexture));
      const targetRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.93, 0.028, 8, 72),
        new THREE.MeshBasicMaterial({
          color: 0xbfd6be,
          transparent: true,
          opacity: 0.54,
          blending: THREE.AdditiveBlending,
        }),
      );
      targetRing.position.copy(target.position);
      targetRing.rotation.set(-0.45, 0.32, -0.3);
      state.selectionGroup.add(targetRing);
      const label = createTextSprite(target.name, "#f3d38b", 2.85);
      positionAtlasLabel(label, target, 2.52);
      state.selectionGroup.add(label);
    });
  }, [characters, regions, selectedId, activeRegion]);

  return <div className="atlas-three-scene" ref={mountRef} aria-label="三维人物星图" />;
}

function AtlasPage({ content }) {
  const atlas = content.atlas || fallbackContent.atlas;
  const regions = atlas.regions || [];
  const characters = useMemo(() => curateAtlasCharacters(atlas.characters || []), [atlas.characters]);
  const [activeRegion, setActiveRegion] = useState(regions[0]?.id || "southern");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim();
  const activeRegionMeta = regions.find((region) => region.id === activeRegion);

  const regionCharacters = useMemo(
    () => characters.filter((character) => character.region === activeRegion),
    [characters, activeRegion],
  );
  const filteredCharacters = useMemo(() => {
    if (!normalizedQuery) return regionCharacters;
    return characters.filter((character) => {
      const haystack = `${character.name}${character.role}${character.faction}${character.intro}`;
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, regionCharacters, characters]);
  const sceneCharacters = useMemo(() => regionCharacters.slice(0, STAR_NODE_LIMIT), [regionCharacters]);

  return (
    <PublicLayout content={content} activeRoute="atlas" showRail={false}>
      <section className="atlas-immersive">
        <ThreeAtlasScene
          characters={sceneCharacters}
          regions={regions}
          activeRegion={activeRegion}
          regionPopulation={regionCharacters.length}
          selectedId=""
          onSelect={(id) => {
            window.location.assign(characterHref(id));
          }}
        />

        <div className="atlas-hud">
          <div className="atlas-title-chip">
            <strong>{atlas.title || "众生星图"}</strong>
            <span>{activeRegionMeta?.name || "五域两天"} · {regionCharacters.length} 人</span>
          </div>
          <div className="atlas-toolbar compact">
            {regions.map((region) => (
              <button
                className={activeRegion === region.id ? "active" : ""}
                key={region.id}
                onClick={() => {
                  setActiveRegion(region.id);
                  setQuery("");
                }}
                type="button"
              >
                <span style={{ background: region.color }} />
                {region.name}
              </button>
            ))}
          </div>
        </div>

        <div className="atlas-search">
          <input
            aria-label="查找人物"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="查找人物"
            value={query}
          />
          {normalizedQuery && (
            <div className="atlas-search-results">
              <strong>{filteredCharacters.length} 个结果</strong>
              {filteredCharacters.slice(0, 12).map((character) => (
                <a href={characterHref(character.id)} key={character.id}>
                  <span>{character.role}</span>
                  {character.name}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="atlas-help">
          <span className="desktop-help">左键拖拽旋转 · 滚轮缩放 · 点击星点进入人物条目</span>
          <span className="mobile-help">拖动旋转 · 双指缩放 · 轻触星点进入人物条目</span>
        </div>
      </section>
    </PublicLayout>
  );
}

function CharacterArticlePage({ content, characterId }) {
  const atlas = content.atlas || fallbackContent.atlas;
  const regions = atlas.regions || [];
  const characters = useMemo(() => curateAtlasCharacters(atlas.characters || []), [atlas.characters]);
  const character = characters.find((item) => item.id === characterId);

  if (!character) {
    return (
      <PublicLayout content={content} activeRoute="atlas" showRail={false}>
        <section className="entry-missing">
          <p>人物条目</p>
          <h1>未找到该人物</h1>
          <a href="/atlas">
            <ArrowLeft size={17} />
            返回众生星图
          </a>
        </section>
      </PublicLayout>
    );
  }

  const region = regions.find((item) => item.id === character.region);
  const source = character.source || {};
  const externalSources = externalCharacterSources[character.name] || [];
  const hasCuratedRecord = !String(character.id).startsWith("auto-");

  return (
    <PublicLayout content={content} activeRoute="atlas" showRail={false}>
      <section className="character-entry">
        <div className="entry-breadcrumb">
          <a href="/atlas">
            <ArrowLeft size={16} />
            众生星图
          </a>
          <span>/</span>
          <span>{region?.name || "待考"}</span>
          <span>/</span>
          <strong>{character.name}</strong>
        </div>

        <div className="entry-layout">
          <aside className="entry-sidebar">
            <header className="entry-heading">
              <p>{region?.name || "五域两天"} · 人物条目</p>
              <h1>{character.name}</h1>
              <span>{character.role}</span>
            </header>

            <nav className="entry-toc" aria-label="条目目录">
              <strong>目录</strong>
              <a href="#summary">人物概览</a>
              <a href="#immortal-gu">仙蛊</a>
              <a href="#killer-moves">仙道杀招</a>
              <a href="#immortal-house">仙蛊屋</a>
              <a href="#references">资料依据</a>
            </nav>
          </aside>

          <article className="entry-article">
            <section className="entry-section" id="summary">
              <h2>人物概览</h2>
              <p className="entry-intro">{character.intro}</p>
              <div className="entry-status">
                <span>整理状态</span>
                <strong>{hasCuratedRecord ? "主要设定已录入" : "原文定位完成，设定待细校"}</strong>
              </div>
            </section>

            <section className="entry-section entry-matrix-section" id="immortal-gu">
              <h2>仙蛊</h2>
              <ImmortalGuMatrix profile={character.immortalGuProfile} />
            </section>

            <section className="entry-section" id="killer-moves">
              <h2>仙道杀招</h2>
              <KillerMoveGroups profile={character.killerMoveProfile} />
            </section>

            <section className="entry-section" id="immortal-house">
              <h2>仙蛊屋</h2>
              <DetailList items={character.houses} />
            </section>

            <section className="entry-section" id="references">
              <h2>资料依据</h2>
              <div className="source-note">
                <strong>{atlasSourceSummary.title}</strong>
                <p>
                  本条目基于提供的原著全文索引建立。涉及仙蛊、杀招与仙蛊屋的内容，
                  只展示已经整理录入的项目；仙蛊栏不收入凡蛊或无法确认品阶的泛称。
                </p>
                {source.status ? (
                  <dl>
                    <div>
                      <dt>索引状态</dt>
                      <dd>{source.status}</dd>
                    </div>
                    <div>
                      <dt>首次定位</dt>
                      <dd>第 {source.firstChapter} 章</dd>
                    </div>
                    <div>
                      <dt>末次定位</dt>
                      <dd>第 {source.lastChapter} 章</dd>
                    </div>
                    <div>
                      <dt>文本命中</dt>
                      <dd>{source.count} 次</dd>
                    </div>
                    <div>
                      <dt>涉及章节</dt>
                      <dd>{source.chapters} 章</dd>
                    </div>
                    <div>
                      <dt>全文范围</dt>
                      <dd>{atlasSourceSummary.chapterCount} 章</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="entry-empty">该条目的原文索引关联仍待复核。</p>
                )}
              </div>

              {externalSources.length > 0 && (
                <div className="external-sources">
                  <h3>外部核对</h3>
                  {externalSources.map((item) => (
                    <a href={item.href} key={item.href} rel="noreferrer" target="_blank">
                      <span>{item.type}</span>
                      <strong>{item.label}</strong>
                      <ExternalLink size={16} />
                    </a>
                  ))}
                </div>
              )}
            </section>
          </article>

          <aside className="entry-infobox">
            <div className="entry-portrait" aria-label="人物图像待补充">
              <CircleDot size={40} strokeWidth={1.1} />
              <span>人物图像待补充</span>
            </div>
            <h2>{character.name}</h2>
            <p>{character.role}</p>
            <dl>
              <div>
                <dt>地域</dt>
                <dd>{region?.name || "待考"}</dd>
              </div>
              <div>
                <dt>势力</dt>
                <dd>{character.faction || "待核录"}</dd>
              </div>
              <div>
                <dt>资料等级</dt>
                <dd>{hasCuratedRecord ? "人物档案" : "全文定位"}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}

function ImmortalGuMatrix({ profile }) {
  const extraPaths = (profile?.groups || []).map((group) => group.path);
  const paths = [...new Set([...immortalGuPaths, ...extraPaths])];
  const cellContents = new Map();

  (profile?.groups || []).forEach((group) => {
    group.items.forEach((item) => {
      if (!immortalGuRanks.includes(item.rank)) return;
      const key = `${group.path}-${item.rank}`;
      cellContents.set(key, [...(cellContents.get(key) || []), item]);
    });
  });

  return (
    <div className="gu-matrix-frame">
      <table className="gu-matrix">
        <thead>
          <tr>
            <th className="gu-matrix-corner" scope="col">
              <span className="matrix-rank-label">转数</span>
              <span className="matrix-path-label">流派</span>
            </th>
            {immortalGuRanks.map((rank) => (
              <th key={rank} scope="col">{rank}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paths.map((path) => (
            <tr key={path}>
              <th scope="row">{path}</th>
              {immortalGuRanks.map((rank) => {
                const items = cellContents.get(`${path}-${rank}`) || [];
                return (
                  <td className={items.length ? "filled" : ""} key={`${path}-${rank}`}>
                    {items.length
                      ? items.map((item) => (
                        <span className="gu-matrix-item" key={item.name}>
                          {item.name}
                          {item.note && <small>{item.note}</small>}
                        </span>
                      ))
                      : <span className="gu-matrix-empty">-</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KillerMoveGroups({ profile }) {
  const sections = profile?.sections || [];

  if (!sections.length) return <p className="entry-empty">-</p>;

  return (
    <div className="killer-move-groups">
      {sections.map((section) => (
        <section className="killer-move-tier" key={section.label}>
          <h3>{section.label}</h3>
          <div className="killer-move-grid">
            {section.groups.map((group) => (
              <section className="killer-move-category" key={`${section.label}-${group.label}`}>
                <h4>{group.label}</h4>
                <ul>
                  {group.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function DetailList({ title, items = [] }) {
  return (
    <div className="detail-list">
      {title && <h3>{title}</h3>}
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>待逐章核录</p>
      )}
    </div>
  );
}

function TextInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea rows={rows} value={value || ""} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ArrayEditor({ items = [], fields, onChange, onAdd, onRemove, addLabel }) {
  return (
    <div className="stack-editor">
      {items.map((item, index) => (
        <article className="edit-card" key={`${addLabel}-${index}`}>
          <button className="delete-button" onClick={() => onRemove(index)} type="button" title="删除">
            <Trash2 size={17} />
          </button>
          {fields.map((field) => {
            const Component = field.area ? TextArea : TextInput;
            return (
              <Component
                key={field.key}
                label={field.label}
                rows={field.rows}
                value={item[field.key]}
                onChange={(value) => onChange(index, field.key, value)}
              />
            );
          })}
        </article>
      ))}
      <button className="add-button" onClick={onAdd} type="button">
        <Plus size={18} />
        {addLabel}
      </button>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("需要管理员口令。");

  const submit = async (event) => {
    event.preventDefault();
    setStatus("验证中");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(data.error || "口令错误");
      return;
    }
    localStorage.setItem("guzhenren-admin-token", data.token);
    onLogin(data.token);
  };

  return (
    <main className="admin-shell login-shell">
      <form className="login-panel" onSubmit={submit}>
        <KeyRound size={26} />
        <h1>后台管理</h1>
        <p>{status}</p>
        <TextInput label="管理员口令" type="password" value={password} onChange={setPassword} />
        <button className="add-button" type="submit">
          进入后台
        </button>
        <a href="/">返回首页</a>
      </form>
    </main>
  );
}

function AdminPage({ content, setContent }) {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("guzhenren-admin-token") || "");
  const [draft, setDraft] = useState(content);
  const [tab, setTab] = useState("hero");
  const [jsonText, setJsonText] = useState(JSON.stringify(content, null, 2));
  const [status, setStatus] = useState("");

  useEffect(() => {
    setDraft(content);
    setJsonText(JSON.stringify(content, null, 2));
  }, [content]);

  if (!authToken) return <AdminLogin onLogin={setAuthToken} />;

  const updateDraft = (updater) => {
    setDraft((current) => {
      const next = updater(cloneContent(current));
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  };

  const handleUnauthorized = () => {
    localStorage.removeItem("guzhenren-admin-token");
    setAuthToken("");
  };

  const saveDraft = async (payload = draft) => {
    setStatus("保存中");
    const res = await fetch("/api/homepage", {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) handleUnauthorized();
      setStatus(data.error || "保存失败");
      return;
    }
    const data = await res.json();
    setContent(data);
    setStatus("已保存");
  };

  const resetDraft = async () => {
    setStatus("重置中");
    const res = await fetch("/api/homepage/reset", {
      method: "POST",
      headers: authHeaders,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) handleUnauthorized();
      setStatus(data.error || "重置失败");
      return;
    }
    setContent(data);
    setDraft(data);
    setJsonText(JSON.stringify(data, null, 2));
    setStatus("已恢复默认内容");
  };

  const saveJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setDraft(parsed);
      saveDraft(parsed);
    } catch (error) {
      setStatus(`JSON 格式错误：${error.message}`);
    }
  };

  const logout = () => {
    localStorage.removeItem("guzhenren-admin-token");
    setAuthToken("");
  };

  const updateArrayItem = (key, index, field, value) => {
    updateDraft((next) => {
      next[key][index][field] = value;
      return next;
    });
  };

  const removeArrayItem = (key, index) => {
    updateDraft((next) => {
      next[key] = next[key].filter((_, itemIndex) => itemIndex !== index);
      return next;
    });
  };

  const addArrayItem = (key, template) => {
    updateDraft((next) => {
      next[key] = [...(next[key] || []), template];
      return next;
    });
  };

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <a className="brand-mark" href="/">
          <Home size={17} />
          返回首页
        </a>
        <div className="admin-actions">
          <button className="icon-button" onClick={() => saveDraft()} type="button" title="保存">
            <Save size={18} />
            保存
          </button>
          <button className="icon-button ghost" onClick={resetDraft} type="button" title="恢复默认">
            <RefreshCw size={18} />
            重置
          </button>
          <button className="icon-button ghost" onClick={logout} type="button" title="退出">
            <LogOut size={18} />
            退出
          </button>
        </div>
      </header>

      <section className="admin-panel">
        <aside className="admin-tabs" aria-label="管理分区">
          {adminTabs.map((item) => (
            <button className={tab === item.id ? "active" : ""} key={item.id} onClick={() => setTab(item.id)} type="button">
              {item.label}
            </button>
          ))}
        </aside>

        <div className="admin-editor">
          <div className="admin-title">
            <p>Content API</p>
            <h1>后台管理</h1>
            <span>{status || "已通过管理员验证"}</span>
          </div>

          {tab === "hero" && (
            <div className="form-grid">
              <TextInput
                label="站点名"
                value={draft.meta?.siteName}
                onChange={(value) =>
                  updateDraft((next) => {
                    next.meta.siteName = value;
                    return next;
                  })
                }
              />
              <TextArea
                label="首页备注"
                rows={4}
                value={draft.closing?.text}
                onChange={(value) =>
                  updateDraft((next) => {
                    next.closing.text = value;
                    return next;
                  })
                }
              />
            </div>
          )}

          {tab === "moments" && (
            <ArrayEditor
              addLabel="新增名场面"
              fields={[
                { key: "kicker", label: "小标题" },
                { key: "title", label: "标题" },
                { key: "slot", label: "视觉位名称" },
                { key: "accent", label: "强调色" },
                { key: "text", label: "说明", area: true, rows: 4 },
              ]}
              items={draft.moments}
              onAdd={() =>
                addArrayItem("moments", {
                  kicker: "新场景",
                  title: "新的名场面",
                  text: "待补充",
                  slot: "图片预留",
                  accent: "#d4b56f",
                })
              }
              onChange={(index, field, value) => updateArrayItem("moments", index, field, value)}
              onRemove={(index) => removeArrayItem("moments", index)}
            />
          )}

          {tab === "timeline" && (
            <ArrayEditor
              addLabel="新增时间线节点"
              fields={[
                { key: "volume", label: "阶段" },
                { key: "title", label: "标题" },
                { key: "stat", label: "关键词" },
                { key: "detail", label: "说明", area: true },
              ]}
              items={draft.timeline}
              onAdd={() => addArrayItem("timeline", { volume: "新阶段", title: "新节点", detail: "待补充", stat: "关键词" })}
              onChange={(index, field, value) => updateArrayItem("timeline", index, field, value)}
              onRemove={(index) => removeArrayItem("timeline", index)}
            />
          )}

          {tab === "players" && (
            <ArrayEditor
              addLabel="新增人物"
              fields={[
                { key: "name", label: "名称" },
                { key: "role", label: "定位" },
                { key: "text", label: "说明", area: true },
              ]}
              items={draft.players}
              onAdd={() => addArrayItem("players", { name: "新人物", role: "定位", text: "待补充" })}
              onChange={(index, field, value) => updateArrayItem("players", index, field, value)}
              onRemove={(index) => removeArrayItem("players", index)}
            />
          )}

          {tab === "systems" && (
            <ArrayEditor
              addLabel="新增体系"
              fields={[
                { key: "name", label: "名称" },
                { key: "label", label: "标签" },
                { key: "text", label: "说明", area: true },
              ]}
              items={draft.systems}
              onAdd={() => addArrayItem("systems", { name: "新设定", label: "标签", text: "待补充" })}
              onChange={(index, field, value) => updateArrayItem("systems", index, field, value)}
              onRemove={(index) => removeArrayItem("systems", index)}
            />
          )}

          {tab === "gallery" && (
            <ArrayEditor
              addLabel="新增视觉位"
              fields={[
                { key: "title", label: "标题" },
                { key: "caption", label: "说明" },
              ]}
              items={draft.gallerySlots}
              onAdd={() => addArrayItem("gallerySlots", { title: "新视觉位", caption: "待安排图片" })}
              onChange={(index, field, value) => updateArrayItem("gallerySlots", index, field, value)}
              onRemove={(index) => removeArrayItem("gallerySlots", index)}
            />
          )}

          {tab === "atlas" && (
            <div className="form-grid">
              <TextInput
                label="模块名"
                value={draft.atlas?.title}
                onChange={(value) =>
                  updateDraft((next) => {
                    next.atlas.title = value;
                    return next;
                  })
                }
              />
              <TextArea
                label="模块说明"
                rows={4}
                value={draft.atlas?.subtitle}
                onChange={(value) =>
                  updateDraft((next) => {
                    next.atlas.subtitle = value;
                    return next;
                  })
                }
              />
            </div>
          )}

          {tab === "json" && (
            <div className="json-editor">
              <textarea value={jsonText} onChange={(event) => setJsonText(event.target.value)} spellCheck="false" />
              <button className="add-button" onClick={saveJson} type="button">
                <Save size={18} />
                保存 JSON
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const { content, setContent, loading, error } = useHomepageContent();
  const route = getRoute();

  if (route === "admin") return <AdminPage content={content} setContent={setContent} />;
  if (route === "moments") return <MomentsPage content={content} />;
  if (route === "timeline") return <TimelinePage content={content} />;
  if (route === "players") return <PlayersPage content={content} />;
  if (route === "systems") return <SystemsPage content={content} />;
  if (route === "atlas") return <AtlasPage content={content} />;
  if (route === "character") return <CharacterArticlePage characterId={getCharacterRouteId()} content={content} />;
  return <HomePage content={content} loading={loading} error={error} />;
}
