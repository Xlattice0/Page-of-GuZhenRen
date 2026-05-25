from __future__ import annotations

import csv
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(r"D:\MyPages\GuZhenRen")
DATA_DIR = ROOT / "data" / "characters"
INPUT_JSON = DATA_DIR / "extracted-character-candidates.json"
CLEAN_JSON = DATA_DIR / "character-registry.cleaned.json"
CLEAN_CSV = DATA_DIR / "character-registry.cleaned.csv"
REVIEW_MD = DATA_DIR / "character-registry.review.md"
GENERATED_JS = ROOT / "src" / "generatedAtlasCharacters.js"


REGION_LABELS = {
    "southern": "南疆",
    "central": "中洲",
    "northern": "北原",
    "eastern": "东海",
    "western": "西漠",
    "white": "太古白天",
    "black": "太古黑天",
    "unverified": "待考",
}

REGION_BY_NAME = {
    "方源": "southern",
    "方正": "southern",
    "白凝冰": "southern",
    "商心慈": "southern",
    "商燕飞": "southern",
    "铁若男": "southern",
    "铁血冷": "southern",
    "武庸": "southern",
    "武独秀": "southern",
    "陆畏因": "southern",
    "乐土仙尊": "southern",
    "古月青书": "southern",
    "古月赤城": "southern",
    "古月漠北": "southern",
    "古月博": "southern",
    "古月药姬": "southern",
    "花酒行者": "southern",
    "凤九歌": "central",
    "凤金煌": "central",
    "赵怜云": "central",
    "龙公": "central",
    "紫薇仙子": "central",
    "星宿仙尊": "central",
    "红莲魔尊": "central",
    "无极魔尊": "central",
    "元莲仙尊": "central",
    "元始仙尊": "central",
    "秦鼎菱": "central",
    "天鹤上人": "central",
    "雷鬼真君": "central",
    "马鸿运": "northern",
    "黑楼兰": "northern",
    "黑城": "northern",
    "黎山仙子": "northern",
    "太白云生": "northern",
    "楚度": "northern",
    "巨阳仙尊": "northern",
    "雪胡老祖": "northern",
    "凤仙太子": "northern",
    "长毛老祖": "northern",
    "东方长凡": "northern",
    "常山阴": "northern",
    "气海老祖": "eastern",
    "吴帅": "eastern",
    "宋亦诗": "eastern",
    "沈从声": "eastern",
    "气绝魔仙": "white",
    "华文洞主": "white",
    "房功": "western",
    "房睇长": "western",
    "千变老祖": "western",
    "幽魂魔尊": "black",
    "影无邪": "black",
    "紫山真君": "black",
    "白兔姑娘": "black",
    "妙音仙子": "black",
    "琅琊地灵": "northern",
}

REGION_BY_NAME.update({
    # 归档以出身或长期势力根基为准，避免把临时活动地当作归属。
    "幽魂魔尊": "southern", "影无邪": "southern", "紫山真君": "southern",
    "白兔姑娘": "southern", "妙音仙子": "southern", "砚石老人": "southern",
    "叶凡": "southern", "巴十八": "southern", "夏槎": "southern",
    "乔丝柳": "southern", "乔志材": "southern", "池曲由": "southern",
    "池伤": "southern", "夏飞快": "southern", "武雨伯": "southern",
    "武八重": "southern", "武罚": "southern", "商睚眦": "southern",
    "商青青": "southern", "商螭吻": "southern", "商蒲牢": "southern",
    "商嘲风": "southern", "魏央": "southern", "小蝶": "southern",
    "萧芒": "southern", "萧山": "southern", "铁霸修": "southern",
    "铁区中": "southern", "铁刀苦": "southern", "铁慕白": "southern",
    "贾金生": "southern", "贾富": "southern", "李然": "southern",
    "巨开碑": "southern", "炎突": "southern", "卫德馨": "southern",
    "江牙": "southern", "张柱": "southern", "熊力": "southern",
    "熊姜": "southern", "熊林": "southern", "熊骄嫚": "southern",
    "古月一代": "southern", "古月阴荒": "southern", "古月漠尘": "southern",
    "古月赤练": "southern", "古月药红": "southern", "古月药乐": "southern",
    "古月冻土": "southern", "古月蛮石": "southern", "古月空井": "southern",
    "白相": "southern",
    "毓秀仙子": "central", "陈衣": "central", "墨瑶": "central",
    "宋紫星": "central", "鹤风扬": "central", "白沧水": "central",
    "厉煌": "central", "明皓仙子": "central", "君神光": "central",
    "薄青": "central", "万紫红": "central", "车尾": "central",
    "监天塔主": "central", "碧晨天": "central", "绿蚁居士": "central",
    "苍郁仙子": "central", "黄史上人": "central", "空绝老仙": "central",
    "狐仙地灵": "central", "苏琪涵": "central", "幻灭仙子": "central",
    "石磊": "central", "万象星君": "central", "七星子": "central",
    "白晴仙子": "central",
    "姜钰": "northern", "毛六": "northern", "药皇": "northern",
    "皮水寒": "northern", "自在书生": "northern", "雪松子": "northern",
    "廿二富": "northern", "廿二平之": "northern", "耶律群星": "northern",
    "马英杰": "northern", "马尊": "northern", "常丽": "northern",
    "常极右": "northern", "百足天君": "northern", "贺狼子": "northern",
    "黑凡": "northern", "黑柏": "northern", "回风子": "northern",
    "万寿娘子": "northern", "焚天魔女": "northern", "秦百胜": "northern",
    "苏仙儿": "northern", "毛十二": "northern",
    "蜂将": "eastern", "土头驮": "eastern", "鬼七爷": "eastern",
    "青岳安": "eastern", "苏白曼": "eastern", "气相": "eastern",
    "百八十奴": "eastern", "阳骏": "eastern",
    "花蝶女仙": "eastern", "童画": "eastern", "沈伤": "eastern",
    "任修平": "eastern", "宋启元": "eastern", "庙明神": "eastern",
    "张阴": "eastern", "容婆": "eastern", "曾落子": "eastern",
    "石淼": "eastern",
    "盗天魔尊": "western", "房化生": "western", "房棱": "western",
    "房云": "western", "房沉": "western", "翠波仙子": "western",
    "青仇": "western", "韩立": "western", "萧家老祖": "western",
    "冰晶仙王": "black", "萧荷尖": "black", "寒灰仙姑": "black",
    "夜天狼君": "black",
    "火原洞主": "white", "骷髅姥姥": "white", "华文洞主": "white",
    "气绝魔仙": "unverified", "人祖": "unverified", "大梦仙尊": "unverified",
})

CANONICAL_ALIASES = {
    "黑楼": "黑楼兰",
    "白凝": "白凝冰",
    "太白": "太白云生",
    "巨阳": "巨阳仙尊",
    "紫薇": "紫薇仙子",
    "琅琊": "琅琊地灵",
    "星宿": "星宿仙尊",
    "幽魂": "幽魂魔尊",
    "凤金": "凤金煌",
    "气海": "气海老祖",
    "黎山": "黎山仙子",
    "商心": "商心慈",
    "雪胡": "雪胡老祖",
    "盗天": "盗天魔尊",
    "乐土": "乐土仙尊",
    "紫山": "紫山真君",
    "凤仙": "凤仙太子",
    "妙音": "妙音仙子",
    "铁若": "铁若男",
    "白兔": "白兔姑娘",
    "花酒": "花酒行者",
    "长毛": "长毛老祖",
    "元莲": "元莲仙尊",
    "红莲": "红莲魔尊",
    "无极": "无极魔尊",
    "元始": "元始仙尊",
    "天鹤": "天鹤上人",
    "雷鬼": "雷鬼真君",
    "商燕": "商燕飞",
    "铁血": "铁血冷",
    "张心慈": "商心慈",
    "凝冰": "白凝冰",
    "楼兰": "黑楼兰",
    "怜云仙子": "赵怜云",
    "黑月": "黑楼兰",
    "黑月仙子": "黑楼兰",
    "白兔仙子": "白兔姑娘",
    "墨瑶仙子": "墨瑶",
    "童画仙子": "童画",
    "花蝶仙子": "花蝶女仙",
    "姜钰仙子": "姜钰",
    "沧水仙子": "白沧水",
    "丝柳仙子": "乔丝柳",
    "血龙": "宋紫星",
    "大爱仙尊": "方源",
    "炼天魔尊": "方源",
    "武遗海": "方源",
    "常山阴": "方源",
    "黑月仙子": "黑楼兰",
    "黑菟": "白兔姑娘",
    "白毛地灵": "琅琊地灵",
    "黑毛地灵": "琅琊地灵",
    "龙人吴帅": "吴帅",
    "武帅": "吴帅",
}

KNOWN_PEOPLE = {
    *REGION_BY_NAME.keys(),
    "盗天魔尊",
    "狂蛮魔尊",
    "炼日魔尊",
    "大梦仙尊",
    "人祖",
    "古月一代",
    "古月阴荒",
    "古月蛮石",
    "古月冻土",
    "古月方想",
    "古月方正",
    "白莲",
    "熊骄嫚",
    "熊力",
    "熊林",
    "熊姜",
    "百花仙子",
    "炎煌雷泽仙僵",
    "砚石老人",
    "砚石老仙",
    "多宝真人",
    "何风扬",
    "鹤风扬",
    "方功",
    "叶凡",
    "洪易",
    "韩立",
    "韩立分身",
    "秦百胜",
    "秦怜",
    "秦鼎菱",
    "毛六",
    "毛十二",
    "石磊",
    "石宗",
    "姜钰",
    "苏琪涵",
    "苏仙儿",
    "碧晨天",
    "万紫红",
    "车尾",
    "车尾仙人",
    "监天塔主",
    "白沧水",
    "君神光",
    "厉煌",
    "古月青书",
    "古月漠尘",
    "古月赤练",
    "古月漠北",
    "古月赤城",
    "古月药乐",
    "古月药姬",
    "古月方源",
    "商睚眦",
    "商蒲牢",
    "商囚牛",
    "商嘲风",
    "商负屃",
    "商螭吻",
    "商狴犴",
    "商狻猊",
    "商貔貅",
    "商青青",
    "商一帆",
    "魏央",
    "小蝶",
    "小兰",
    "萧芒",
    "萧山",
    "铁慕白",
    "铁霸修",
    "铁刀苦",
    "铁线花",
    "铁傲开",
    "铁区中",
    "巴十八",
    "池曲由",
    "池伤",
    "乔志材",
    "乔丝柳",
    "夏飞快",
    "夏槎",
    "武雨伯",
    "武八重",
    "武真",
    "武遗海",
    "武罚",
    "乔志",
    "马英杰",
    "马尊",
    "常彪",
    "常极右",
    "常极左",
    "常丽",
    "常山阴",
    "黑柏",
    "黑凡",
    "黑楼兰",
    "耶律群星",
    "耶律小金",
    "耶律洪天",
    "药皇",
    "百足天君",
    "廿二富",
    "廿二平之",
    "自在书生",
    "皮水寒",
    "贺狼子",
    "回风子",
    "七星子",
    "万象星君",
    "万寿娘子",
    "焚天魔女",
    "雪松子",
    "雪胡老祖",
    "秦百胜",
    "墨瑶",
    "林秦",
    "琅琊地灵",
    "地灵琅琊",
    "毛六",
    "白晴仙子",
    "凤金煌",
    "凤九歌",
    "赵怜云",
    "方源",
    "房化生",
    "房棱",
    "房云",
    "房沉",
    "陈衣",
    "青仇",
    "寒灰仙姑",
    "冰晶仙王",
    "萧荷尖",
    "夜天狼君",
    "骷髅姥姥",
    "华文洞主",
    "彩石仙妃",
    "黄金仙王",
    "气绝魔仙",
    "气相",
    "吴帅",
    "沈伤",
    "庙明神",
    "曾落子",
    "蜂将",
    "童画",
    "鬼七爷",
    "土头驮",
    "花蝶女仙",
    "任修平",
    "沈从声",
    "宋启元",
    "宋亦诗",
    "青岳安",
    "张阴",
    "容婆",
    "杨子河",
    "石淼",
    "龙公",
    "龙人吴帅",
    "幽魂魔尊",
    "影无邪",
    "薄青",
    "紫山真君",
    "白兔姑娘",
    "妙音仙子",
    "黑菟",
    "白相",
    "魏神经",
    "蓝奇子",
    "白沧水",
    "武帅",
    "宋紫星",
    "贾金生",
    "贾富",
    "江鹤",
    "赤舌",
    "古月药红",
    "古月空井",
    "百陌行",
    "百陌亭",
    "百草率",
    "百莲",
    "百盛景",
    "陈鑫",
    "陈双全",
    "张柱",
    "李然",
    "巨开碑",
    "炎突",
    "卫德馨",
    "江牙",
    "史宏",
    "二毛",
    "林大鸟",
    "宋紫星",
    "黑心道人",
    "钟义",
}

GOOD_TITLE_SUFFIXES = (
    "仙尊",
    "魔尊",
    "老祖",
    "仙子",
    "真君",
    "上人",
    "行者",
    "太子",
    "姑娘",
    "童子",
    "居士",
    "洞主",
    "仙王",
    "天君",
    "真人",
    "魔仙",
    "天灵",
    "地灵",
    "姥姥",
    "魔女",
    "女仙",
    "书生",
    "神君",
    "仙姑",
    "娘子",
)

GENERIC_TITLE_SUFFIXES = (
    "蛊仙",
    "蛊师",
    "族长",
    "寨主",
    "家老",
    "长老",
    "大长老",
    "太上大长老",
    "道友",
    "前辈",
    "大人",
)

ACTION_SUFFIXES = (
    "道",
    "知",
    "点",
    "点头",
    "摇",
    "摇头",
    "开口",
    "冷笑",
    "哈哈",
    "微微",
    "闻言",
    "又道",
    "心",
    "知道",
    "说道",
    "问道",
    "大笑",
    "一笑",
)

NOISE_EXACT = {
    "不知",
    "于是",
    "他知",
    "我知",
    "你知",
    "要知",
    "也不知",
    "就知",
    "她知",
    "这位",
    "那位",
    "诸位",
    "就是",
    "毕竟",
    "对于",
    "那么",
    "终于",
    "许多",
    "很多",
    "其余",
    "其他",
    "继续",
    "成为",
    "变化",
    "无数",
    "开口",
    "智道",
    "水道",
    "奴道",
    "天道",
    "力道",
    "宙道",
    "木道",
    "火道",
    "土道",
    "金道",
    "风道",
    "云道",
    "魂道",
    "梦道",
    "运道",
    "血道",
    "剑道",
    "信道",
    "食道",
    "暗道",
    "光道",
    "冰道",
    "毒道",
    "律道",
    "偷道",
    "阵道",
    "炼道",
    "东方",
    "古月",
    "黑家",
    "武家",
    "房家",
    "毛民",
    "天庭",
    "师父",
    "学堂",
    "家老",
    "百里",
    "第五",
    "太上大",
    "太上二",
    "周围",
    "第一",
    "移动元泉",
    "推算",
    "贝草绳",
    "奔雷手",
    "夺舍",
    "净魂",
    "成真",
    "温暖",
    "花雾太泽",
    "师法自然",
    "沙黄",
    "焦黄",
    "第一势力",
    "便宜无好货",
    "因祸得福",
    "众目睽睽",
    "天人感应",
    "天工人代",
    "白云压城似如",
    "炼八门",
    "安祖地沟",
    "牛之力",
    "自信",
    "规矩",
    "孤独",
    "光阴",
    "赤铁真元",
    "三星洞",
    "焦雷土豆",
    "天机",
    "自然天灵",
    "护短仙尊",
    "何若",
    "言仙",
    "虚天",
    "星宿仙僵",
}

NOISE_SUBSTRINGS = (
    "蛊仙",
    "蛊师",
    "凡人",
    "异人",
    "众仙",
    "群仙",
    "诸仙",
    "道痕",
    "蛊虫",
    "仙蛊",
    "凡蛊",
    "杀招",
    "仙窍",
    "福地",
    "洞天",
    "真传",
    "传承",
    "大多数",
    "绝大多数",
    "这些",
    "那些",
    "这种",
    "那种",
    "这个",
    "那个",
    "什么",
    "怎么",
    "如此",
    "已经",
    "没有",
    "不是",
    "因为",
    "所以",
    "关键时刻",
    "时间流逝",
    "冷哼一声",
    "别的不说",
    "别忘了",
    "从今以后",
    "周围的",
    "口中",
    "成功了",
)

NOISE_PATTERNS = [
    re.compile(r"[一二三四五六七八九十两百千万几多余诸众各些]+位"),
    re.compile(r"[一二三四五六七八九十]转"),
    re.compile(r"^(正道|魔道|散修|智道|力道|魂道|梦道|宙道|信道|阵道|炼道)"),
    re.compile(r"^(是|也|就|方源|他|她|我|你|他们|众人).*(道|知|点头|开口|冷笑|闻言|心)$"),
    re.compile(r"^(这|那|此|某|其|一|两|三|四|五|六|七|八|九|十).*(蛊仙|蛊师|仙|人)$"),
]

LOCATION_SUFFIXES = (
    "山寨",
    "地沟",
    "福地",
    "洞天",
    "湖",
    "海",
    "山",
    "堂",
    "阁",
    "屋",
    "楼",
    "宫",
    "门",
    "寨",
    "城",
    "太泽",
    "石林",
    "亭",
)

OBJECT_SUFFIXES = (
    "真元",
    "之力",
    "杀招",
    "战场",
    "仙蛊",
    "凡蛊",
    "蛊",
    "法",
    "阵",
    "印",
    "刀",
    "手",
    "茶",
    "汤",
    "鱼",
    "鸟",
    "蝉",
)

LEADING_NOISE_WORDS = (
    "就是",
    "当年",
    "当初",
    "到了",
    "对付",
    "交给",
    "源自",
    "源和",
    "帅和",
    "还请",
    "承了",
    "做",
    "和",
    "与",
    "对",
    "被",
    "让",
    "在",
    "到",
)

TRAILING_PARTICLES = ("好了", "了", "呢", "吗", "吧", "啊")

PERSON_CONTEXT_WORDS = (
    "蛊师",
    "蛊仙",
    "女仙",
    "仙僵",
    "毛民",
    "弟子",
    "青年",
    "少年",
    "少女",
    "女子",
    "男子",
    "老人",
    "老者",
    "族长",
    "少主",
    "公子",
    "姑娘",
    "本名",
    "姓名",
    "姓",
    "名叫",
    "叫做",
    "名为",
    "唤作",
)

OBJECT_CONTEXT_PATTERNS = [
    re.compile(r"蛊名为"),
    re.compile(r"(名为|叫做|命名为|取名为)[\u4e00-\u9fff]{1,8}(蛊|湖|海|山|寨|堂|阁|屋|楼|法|阵|招|杀招|战场|真元|之力|仙蛊|凡蛊)"),
    re.compile(r"这(只|种|片|座|条|招|记|个)(蛊|湖|海|山|屋|法|阵|杀招)"),
]


def load_manual_atlas_names() -> set[str]:
    source = (ROOT / "src" / "fallbackContent.js").read_text(encoding="utf-8")
    atlas_source = source.split("atlas:", 1)[-1]
    return set(re.findall(r'name:\s*"([^"]+)"', atlas_source))


def normalize_name(name: str) -> str:
    name = re.sub(r"[^\u4e00-\u9fff]", "", name)
    if "的" in name:
        prefix = name.split("的", 1)[0]
        if 2 <= len(prefix) <= 5:
            name = prefix
    for particle in TRAILING_PARTICLES:
        if name.endswith(particle) and len(name) > len(particle) + 1:
            name = name[: -len(particle)]
    known_suffixes = sorted(
        {value for value in CANONICAL_ALIASES.values()} | KNOWN_PEOPLE,
        key=len,
        reverse=True,
    )
    for known in known_suffixes:
        if known != name and len(known) >= 3 and name.endswith(known):
            prefix = name[: -len(known)]
            if prefix in LEADING_NOISE_WORDS or len(prefix) <= 2:
                name = known
                break
    for prefix in ("是", "为", "乃", "这位", "那位", "一位", "两位", "三位", "位"):
        if name.startswith(prefix) and len(name) > len(prefix) + 1:
            name = name[len(prefix) :]
    for prefix in LEADING_NOISE_WORDS:
        if name.startswith(prefix) and len(name) > len(prefix) + 1:
            maybe = name[len(prefix) :]
            if maybe in CANONICAL_ALIASES or maybe in KNOWN_PEOPLE or has_good_title(maybe):
                name = maybe
                break
    if name.startswith("古月方源"):
        return "方源"
    if name.startswith("古月方正"):
        return "方正"
    if name in {"张心慈"}:
        return "商心慈"
    if name == "凝冰":
        return "白凝冰"
    return CANONICAL_ALIASES.get(name, name)


def has_good_title(name: str) -> bool:
    return name.endswith(GOOD_TITLE_SUFFIXES)


def has_generic_title(name: str) -> bool:
    return name.endswith(GENERIC_TITLE_SUFFIXES)


def is_noise(name: str) -> bool:
    if not (2 <= len(name) <= 8):
        return True
    if name in KNOWN_PEOPLE:
        return False
    if name in NOISE_EXACT:
        return True
    if name in {"仙尊", "魔尊", "老祖", "仙子", "真君", "上人", "地灵", "天灵", "小姑娘", "亚仙尊"}:
        return True
    if name.endswith("家") and name not in KNOWN_PEOPLE:
        return True
    if name.endswith(LOCATION_SUFFIXES) and name not in KNOWN_PEOPLE and not has_good_title(name):
        return True
    if name.endswith(OBJECT_SUFFIXES) and name not in KNOWN_PEOPLE and not has_good_title(name):
        return True
    if any(name.startswith(prefix) for prefix in LEADING_NOISE_WORDS) and name not in KNOWN_PEOPLE:
        return True
    if "的" in name:
        return True
    if any(part in name for part in NOISE_SUBSTRINGS):
        return True
    if has_generic_title(name) and not has_good_title(name):
        return True
    if len(name) <= 3 and name.endswith("道"):
        return True
    if len(set(name)) == 1:
        return True
    if name.startswith("方源") and name != "方源":
        return True
    if name.startswith(("他", "她", "我", "你", "此", "其", "这", "那")):
        return True
    if any(name.endswith(suffix) for suffix in ACTION_SUFFIXES) and name not in KNOWN_PEOPLE:
        return True
    return any(pattern.search(name) for pattern in NOISE_PATTERNS)


def merge_contexts(existing: list[dict], incoming: list[dict], limit: int = 6) -> list[dict]:
    seen = {(item.get("chapter"), item.get("context")) for item in existing}
    for item in incoming:
        key = (item.get("chapter"), item.get("context"))
        if key in seen:
            continue
        existing.append(item)
        seen.add(key)
        if len(existing) >= limit:
            break
    return existing


def region_for(name: str, regions: Counter) -> str:
    if name in REGION_BY_NAME:
        return REGION_BY_NAME[name]
    return "unverified"


def score_entry(entry: dict) -> float:
    evidence = entry["evidence"]
    score = 0.0
    if entry["name"] in KNOWN_PEOPLE:
        score += 100
    if has_good_title(entry["name"]):
        score += 42
    if evidence.get("named-as"):
        score += 28
    if entry.get("personContext"):
        score += 45
    if evidence.get("title-full"):
        score += 24
    if evidence.get("compound-surname"):
        score += 18
    if evidence.get("surname"):
        score += 12
    if evidence.get("possessive"):
        score += 4
    score += min(entry["chapters"], 20) * 1.7
    score += min(entry["count"], 80) * 0.22

    strong_evidence = (
        evidence.get("named-as", 0)
        + evidence.get("title-full", 0)
        + evidence.get("compound-surname", 0)
        + evidence.get("surname", 0)
    )
    if strong_evidence == 0:
        score -= 22
    if entry["name"] in REGION_BY_NAME:
        score += 8
    return round(score, 2)


def has_person_context(row: dict, name: str) -> bool:
    if not row.get("evidence", {}).get("named-as"):
        return False
    contexts = "".join(item.get("context", "") for item in row.get("contexts", []))
    if not contexts:
        return False
    if any(pattern.search(contexts) for pattern in OBJECT_CONTEXT_PATTERNS):
        return False
    escaped = re.escape(name)
    local_person_patterns = [
        re.compile(rf"(名叫|叫做|名为|唤作|本名叫做|本名叫|本名，叫做){escaped}(的)?(男|女|青年|少年|少女|蛊师|蛊仙|女仙|仙僵|毛民|弟子|老人|老者|族长|少主|公子|姑娘|家奴|人)"),
        re.compile(rf"(一位|这位|那位|其中一位|其中有一子).{{0,14}}(名叫|叫做|名为|唤作){escaped}"),
        re.compile(rf"{escaped}.{{0,14}}(号称|乃是|是).{{0,18}}(蛊师|蛊仙|女仙|仙僵|少主|族长|尊者|魔尊|仙尊|真人|老祖|仙子|上人|天君|仙王)"),
        re.compile(rf"(姓[\u4e00-\u9fff]名{escaped}|姓名.{0,8}{escaped}|本名.{0,8}{escaped})"),
    ]
    if any(pattern.search(contexts) for pattern in local_person_patterns):
        return True
    if has_good_title(name) and any(word in contexts for word in ("号称", "乃是", "本名", "蛊仙", "女仙", "仙僵")):
        return True
    return False


def slug_for(name: str, index: int) -> str:
    digest = hashlib.sha1(name.encode("utf-8")).hexdigest()[:10]
    return f"auto-{index:04d}-{digest}"


def role_for(entry: dict) -> str:
    name = entry["name"]
    if name in KNOWN_PEOPLE:
        if has_good_title(name):
            return "全文人物"
        return "人物档案"
    if has_good_title(name):
        return "称号人物"
    return "全文候选"


def make_js_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def write_generated_js(characters: list[dict], manual_names: set[str]) -> None:
    supplemental = [item for item in characters if item["name"] not in manual_names]
    lines = [
        "export const generatedAtlasCharacters = [",
    ]
    for index, item in enumerate(supplemental, start=1):
        region_label = REGION_LABELS.get(item["region"], "五域两天")
        first = item.get("firstChapter") or ""
        if item["region"] == "unverified":
            source = f"原文已出现，地域归属尚待逐条复核。首次出现第 {first} 章。" if first else "原文已出现，地域归属尚待逐条复核。"
            faction = "地域待考"
        else:
            source = f"原文人物档案，按出身或主要势力根基归入{region_label}。首次出现第 {first} 章。" if first else f"原文人物档案，按出身或主要势力根基归入{region_label}。"
            faction = f"{region_label}归档"
        lines.extend(
            [
                "  {",
                f'    id: "{slug_for(item["name"], index)}",',
                f"    name: {make_js_string(item['name'])},",
                f'    region: "{item["region"]}",',
                f"    faction: {make_js_string(faction)},",
                f"    role: {make_js_string(role_for(item))},",
                f"    intro: {make_js_string(source)},",
                "    gu: [],",
                "    moves: [],",
                "    houses: [],",
                "    relations: [],",
                f"    source: {{ firstChapter: {json.dumps(first, ensure_ascii=False)}, count: {item['count']}, regionLabel: {make_js_string(region_label)} }},",
                "  },",
            ]
        )
    lines.append("];")
    lines.append("")
    GENERATED_JS.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    raw = json.loads(INPUT_JSON.read_text(encoding="utf-8"))
    manual_names = load_manual_atlas_names()
    groups: dict[str, dict] = {}
    rejected = 0

    for row in raw["characters"]:
        name = normalize_name(row["name"])
        if is_noise(name):
            rejected += 1
            continue

        entry = groups.setdefault(
            name,
            {
                "name": name,
                "count": 0,
                "chaptersSet": set(),
                "firstChapter": None,
                "lastChapter": None,
                "regionCounter": Counter(),
                "evidence": Counter(),
                "aliases": Counter(),
                "contexts": [],
                "personContext": 0,
            },
        )
        entry["count"] += row["count"]
        entry["chaptersSet"].update(range(row["firstChapter"], row["lastChapter"] + 1) if False else [])
        entry["firstChapter"] = row["firstChapter"] if entry["firstChapter"] is None else min(entry["firstChapter"], row["firstChapter"])
        entry["lastChapter"] = row["lastChapter"] if entry["lastChapter"] is None else max(entry["lastChapter"], row["lastChapter"])
        entry["evidence"].update(row["evidence"])
        entry["aliases"][row["name"]] += row["count"]
        if row.get("regionGuess"):
            entry["regionCounter"][row["regionGuess"]] += row["count"]
        entry["contexts"] = merge_contexts(entry["contexts"], row.get("contexts", []))
        entry["chapterHits"] = max(entry.get("chapterHits", 0), row["chapters"])
        if has_person_context(row, name):
            entry["personContext"] += row["evidence"].get("named-as", 1)

    cleaned = []
    review = []
    for entry in groups.values():
        output = {
            "name": entry["name"],
            "level": "review",
            "score": 0,
            "count": entry["count"],
            "chapters": entry.get("chapterHits", 0),
            "firstChapter": entry["firstChapter"],
            "lastChapter": entry["lastChapter"],
            "region": region_for(entry["name"], entry["regionCounter"]),
            "regionLabel": REGION_LABELS.get(region_for(entry["name"], entry["regionCounter"]), ""),
            "evidence": dict(entry["evidence"]),
            "aliases": dict(entry["aliases"]),
            "contexts": entry["contexts"],
            "personContext": entry["personContext"],
        }
        output["score"] = score_entry(output)
        if (
            output["name"] in KNOWN_PEOPLE
            or output["score"] >= 88
            or output["personContext"]
            or (has_good_title(output["name"]) and output["score"] >= 84 and output["count"] >= 5)
        ):
            output["level"] = "confirmed"
            cleaned.append(output)
        elif output["score"] >= 55:
            review.append(output)

    cleaned.sort(key=lambda item: (-item["score"], item["firstChapter"] or 9999, item["name"]))
    review.sort(key=lambda item: (-item["score"], item["firstChapter"] or 9999, item["name"]))

    payload = {
        "source": raw["source"],
        "chapterCount": raw["chapterCount"],
        "inputCandidates": raw["totalCandidates"],
        "rejectedAsNoise": rejected,
        "confirmedCount": len(cleaned),
        "reviewCount": len(review),
        "characters": cleaned,
        "review": review,
    }
    CLEAN_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    with CLEAN_CSV.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=[
                "name",
                "level",
                "score",
                "count",
                "chapters",
                "firstChapter",
                "lastChapter",
                "regionLabel",
                "aliases",
                "contextSample",
            ],
        )
        writer.writeheader()
        for row in [*cleaned, *review]:
            writer.writerow(
                {
                    "name": row["name"],
                    "level": row["level"],
                    "score": row["score"],
                    "count": row["count"],
                    "chapters": row["chapters"],
                    "firstChapter": row["firstChapter"],
                    "lastChapter": row["lastChapter"],
                    "regionLabel": row["regionLabel"],
                    "aliases": " / ".join(row["aliases"].keys()),
                    "contextSample": row["contexts"][0]["context"] if row["contexts"] else "",
                }
            )

    md_lines = [
        "# 蛊真人人物抽取复核",
        "",
        f"- EPUB 章节数：{raw['chapterCount']}",
        f"- 原始候选：{raw['totalCandidates']}",
        f"- 自动剔除噪声：{rejected}",
        f"- 已确认人物：{len(cleaned)}",
        f"- 待人工复核：{len(review)}",
        "",
        "## 已确认人物前 120",
        "",
    ]
    for index, row in enumerate(cleaned[:120], start=1):
        md_lines.append(f"{index}. {row['name']}｜{row['regionLabel']}｜首次第 {row['firstChapter']} 章｜证据 {row['count']}")
    md_lines.extend(["", "## 待复核前 80", ""])
    for index, row in enumerate(review[:80], start=1):
        md_lines.append(f"{index}. {row['name']}｜{row['regionLabel']}｜首次第 {row['firstChapter']} 章｜分数 {row['score']}")
    REVIEW_MD.write_text("\n".join(md_lines) + "\n", encoding="utf-8")

    write_generated_js(cleaned, manual_names)

    print(
        json.dumps(
            {
                "confirmed": len(cleaned),
                "review": len(review),
                "rejected": rejected,
                "top": [row["name"] for row in cleaned[:40]],
                "outputs": [str(CLEAN_JSON), str(CLEAN_CSV), str(REVIEW_MD), str(GENERATED_JS)],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
