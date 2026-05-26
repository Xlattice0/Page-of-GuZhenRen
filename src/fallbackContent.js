import { generatedAtlasCharacters } from "./generatedAtlasCharacters.js";

export const fallbackContent = {
  meta: {
    siteName: "蛊真人",
    sectionLabel: "世界观档案",
    adminNote: "local-content",
  },
  nav: [
    { label: "首页", href: "/", route: "home" },
    { label: "名场面", href: "/moments", route: "moments" },
    { label: "时间线", href: "/timeline", route: "timeline" },
    { label: "棋局", href: "/players", route: "players" },
    { label: "体系", href: "/systems", route: "systems" },
    { label: "星图", href: "/atlas", route: "atlas" },
  ],
  hero: {
    eyebrow: "",
    title: "",
    subtitle: "",
    primaryCta: "",
    secondaryCta: "",
    chips: [],
  },
  productRail: [
    { title: "名场面", caption: "剧情记忆点", icon: "spark", href: "/moments" },
    { title: "时间线", caption: "六段主线", icon: "timeline", href: "/timeline" },
    { title: "人物棋局", caption: "立场与代价", icon: "network", href: "/players" },
    { title: "蛊道体系", caption: "规则引擎", icon: "systems", href: "/systems" },
    { title: "众生星图", caption: "五域两天", icon: "map", href: "/atlas" },
  ],
  overview: {
    kicker: "",
    title: "",
    paragraphs: [],
  },
  moments: [
    {
      kicker: "青茅山",
      title: "重生不是赎罪，而是重新下注。",
      text:
        "春秋蝉把方源送回少年时代。族学、家族、亲情与规则都被重新摆上台面，青茅山不是新手村，而是方源价值观第一次完整亮相的试炼场。",
      slot: "青茅山旧局",
      accent: "#d4b56f",
    },
    {
      kicker: "三王山",
      title: "凡人阶段的资源赌局被推到极限。",
      text:
        "三王传承让方源、白凝冰、铁家、商家与各路蛊师同台争夺。定仙游的炼成，是凡人篇最锋利的收束：胆量、欺骗、时机和代价同时落子。",
      slot: "三王山炼定仙游",
      accent: "#b65b4b",
    },
    {
      kicker: "王庭真阳楼",
      title: "北原风雪里，巨阳意志亲自下场。",
      text:
        "狼王身份、王庭之争、八十八角真阳楼与巨阳仙尊的布置交织在一起。方源开始真正接触尊者级棋盘，也第一次看见时代遗产的重量。",
      slot: "王庭与真阳楼",
      accent: "#8fb8c2",
    },
    {
      kicker: "义天山",
      title: "影宗浮出水面，至尊仙胎成局。",
      text:
        "梦境、僵盟、影宗、天庭与南疆正道同时卷入。义天山大战不是单场大战，而是幽魂魔尊跨时代计划的一次总爆发。",
      slot: "义天山大战",
      accent: "#9b8bd3",
    },
    {
      kicker: "宿命大战",
      title: "宿命蛊毁灭，世界的叙事权被撕开。",
      text:
        "天庭守护秩序，红莲留下后手，方源逆流而上。宿命大战把个人求生推到历史尺度，也让“大时代”真正开始。",
      slot: "宿命蛊毁灭",
      accent: "#d15d61",
    },
    {
      kicker: "大时代",
      title: "尊者复苏，方源以大爱之名入局。",
      text:
        "巨阳、星宿、无极、幽魂等布局相继显影。方源不再只是被追杀的异数，而是能与尊者对弈、改写利益结构的棋手。",
      slot: "大爱仙尊",
      accent: "#8cc5a6",
    },
  ],
  timeline: [
    {
      volume: "第一段",
      title: "青茅山启局",
      detail: "重生、族学、花酒遗藏、狼潮、白凝冰与二次重生，奠定方源的生存逻辑。",
      stat: "春秋蝉",
    },
    {
      volume: "第二段",
      title: "南疆与三王山",
      detail: "商家城、力道修行、三王传承与定仙游，让凡人阶段的资源博弈抵达顶点。",
      stat: "定仙游",
    },
    {
      volume: "第三段",
      title: "北原与真阳楼",
      detail: "狐仙福地、狼王身份、王庭之争、八十八角真阳楼与巨阳意志逐步合流。",
      stat: "巨阳",
    },
    {
      volume: "第四段",
      title: "僵身与义天山",
      detail: "仙僵困局、智慧蛊、梦境初显、影宗抬头，最终在义天山引爆至尊仙胎局。",
      stat: "影宗",
    },
    {
      volume: "第五段",
      title: "宿命大战",
      detail: "逆流河、红莲真传、龙公、天庭与宿命蛊毁灭，个人意志撞上世界秩序。",
      stat: "宿命蛊",
    },
    {
      volume: "第六段",
      title: "尊者与大时代",
      detail: "宿命之后，尊者复苏，三尊对峙，方源以炼道成尊打开新的利益格局。",
      stat: "大爱",
    },
  ],
  players: [
    {
      name: "方源",
      role: "异数",
      text: "以永生为唯一终点，善用重生、伪装、交易和背叛，把自身意志压到规则之上。",
    },
    {
      name: "白凝冰",
      role: "镜像",
      text: "危险、聪明、好奇且不安分。她像方源早期路上的反光面，提醒读者“疯”也有不同方向。",
    },
    {
      name: "黑楼兰",
      role: "盟友",
      text: "从北原权力结构中挣脱，背负仇恨与野心，既能合作也会计算，是方源身边少见的强势变量。",
    },
    {
      name: "影宗",
      role: "暗局",
      text: "幽魂魔尊留下的跨时代计划，推动义天山、至尊仙胎和后续多重身份错位。",
    },
    {
      name: "天庭",
      role: "秩序",
      text: "维护宿命与人族大势的古老组织，既是压迫性的制度机器，也是牺牲者的集合。",
    },
    {
      name: "红莲魔尊",
      role: "裂缝",
      text: "他把对宿命的反抗埋进历史深处，让后来者能在看似注定的世界里找到破口。",
    },
    {
      name: "巨阳仙尊",
      role: "血脉",
      text: "运道、血脉与北原秩序的象征。他的遗产让王庭真阳楼成为尊者棋盘的一角。",
    },
    {
      name: "星宿仙尊",
      role: "智道",
      text: "她代表天庭最深的谋划，也代表一种把自我献给集体秩序后的极端理性。",
    },
  ],
  systems: [
    {
      name: "蛊",
      label: "能力单位",
      text: "力量的最小单元，也是经济、身份、战斗与传承体系的核心资源。人炼蛊，蛊也反过来塑造人的路径。",
    },
    {
      name: "道痕",
      label: "世界刻度",
      text: "道痕决定威能、冲突和增幅，是高阶战斗从招式对拼升级到规则对撞的基础。",
    },
    {
      name: "仙窍",
      label: "个人世界",
      text: "仙窍既是资源仓库，也是生态和战争后方。至尊仙窍让方源获得异常扩张性。",
    },
    {
      name: "杀招",
      label: "组合语言",
      text: "蛊虫、道痕和思路组合成杀招。强大的不是单个零件，而是能否把体系写成自己的语法。",
    },
    {
      name: "梦境",
      label: "新时代入口",
      text: "梦境让境界、传承和历史记忆变得可争夺，也让旧时代强者的优势出现松动。",
    },
    {
      name: "宿命",
      label: "叙事枷锁",
      text: "宿命蛊不只是道具，而是世界叙事的锁。毁掉它，意味着世界进入更混乱也更自由的大时代。",
    },
  ],
  gallerySlots: [
    { title: "青茅山旧局", caption: "少年、族学、狼潮、第一次重生" },
    { title: "三王山炼定仙游", caption: "传承、赌局、定仙游成蛊" },
    { title: "王庭与真阳楼", caption: "北原、狼王、巨阳意志" },
    { title: "义天山大战", caption: "影宗、梦境、至尊仙胎" },
    { title: "宿命大战", caption: "龙公、红莲、宿命蛊毁灭" },
    { title: "大爱仙尊", caption: "炼道成尊、尊者对峙、大时代" },
  ],
  atlas: {
    title: "众生星图",
    subtitle: "按五域两天整理人物档案，并用星图展示角色牵连。人物库会继续扩充到完整名录。",
    regions: [
      { id: "southern", name: "南疆", color: "#b65b4b" },
      { id: "central", name: "中洲", color: "#d4b56f" },
      { id: "northern", name: "北原", color: "#8fb8c2" },
      { id: "eastern", name: "东海", color: "#8cc5a6" },
      { id: "western", name: "西漠", color: "#c89a6b" },
      { id: "white", name: "太古白天", color: "#d9d6c7" },
      { id: "black", name: "太古黑天", color: "#9b8bd3" },
      { id: "unverified", name: "待考", color: "#aaa398" },
    ],
    characters: generatedAtlasCharacters,
  },
  closing: {
    title: "",
    text: "",
  },
};
