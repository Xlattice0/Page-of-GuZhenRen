from __future__ import annotations

import csv
import html
import json
import os
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from zipfile import ZipFile


EPUB_SIZE = 19663562
BOOK_DIR = Path(r"D:\reading\Books\4287a6b52ae0448aaf2a9f77db47bd99\files")
OUT_DIR = Path(r"D:\MyPages\GuZhenRen\data\characters")


class TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        data = html.unescape(data).strip()
        if data:
            self.parts.append(data)

    def text(self) -> str:
        return "\n".join(self.parts)


@dataclass
class Hit:
    name: str
    evidence: Counter = field(default_factory=Counter)
    chapters: set[int] = field(default_factory=set)
    contexts: list[dict] = field(default_factory=list)
    regions: Counter = field(default_factory=Counter)

    def add(self, chapter: int, pattern: str, context: str) -> None:
        self.evidence[pattern] += 1
        self.chapters.add(chapter)
        if len(self.contexts) < 5:
            self.contexts.append(
                {
                    "chapter": chapter,
                    "pattern": pattern,
                    "context": context,
                }
            )


SURNAME = (
    "赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜"
    "戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳鲍史唐"
    "费廉岑薛雷贺倪汤滕殷罗毕郝邬安常乐于时傅皮卞齐康伍余元卜顾孟平"
    "黄和穆萧尹姚邵湛汪祁毛禹狄米贝明臧计伏成戴谈宋庞熊纪舒屈项祝董"
    "梁杜阮蓝闵席季麻强贾路娄危江童颜郭梅盛林刁钟徐邱骆高夏蔡田胡凌"
    "霍虞万支柯昝管卢莫经房裘缪干解应宗丁宣邓郁单杭洪包诸左石崔吉龚"
    "程邢裴陆荣翁荀羊於惠甄曲家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧"
    "隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘斜厉戎祖武符刘景詹束龙"
    "叶幸司韶郜黎蓟薄印宿白怀蒲台从鄂索咸籍赖卓蔺屠蒙池乔阴能苍双闻"
    "莘党翟谭贡劳逄姬申扶堵冉宰郦雍桑寿通燕浦尚农温别庄晏柴瞿阎连习"
    "容向古易慎戈廖庾终暨居衡步都耿满弘匡国文寇广禄阙东欧殳沃利蔚越"
    "夔隆师巩厍聂晁勾敖融冷訾辛阚那简饶空曾毋沙乜养鞠须丰巢关蒯相查"
    "後荆红游竺权逯盖益桓公"
)

COMPOUND_SURNAME = [
    "欧阳",
    "太史",
    "端木",
    "上官",
    "司马",
    "东方",
    "独孤",
    "南宫",
    "万俟",
    "闻人",
    "夏侯",
    "诸葛",
    "尉迟",
    "公羊",
    "赫连",
    "澹台",
    "皇甫",
    "宗政",
    "濮阳",
    "公冶",
    "太叔",
    "申屠",
    "公孙",
    "慕容",
    "仲孙",
    "钟离",
    "长孙",
    "宇文",
    "司徒",
    "鲜于",
    "司空",
    "闾丘",
    "子车",
    "亓官",
    "司寇",
    "巫马",
    "公西",
    "颛孙",
    "壤驷",
    "公良",
    "漆雕",
    "乐正",
    "宰父",
    "谷梁",
    "拓跋",
    "夹谷",
    "轩辕",
    "令狐",
    "段干",
    "百里",
    "呼延",
    "东郭",
    "南门",
    "羊舌",
    "微生",
    "公户",
    "公玉",
    "公仪",
    "梁丘",
    "公仲",
    "公上",
    "公门",
    "公山",
    "公坚",
    "左丘",
    "公伯",
    "西门",
    "公祖",
    "第五",
    "公乘",
    "贯丘",
    "公皙",
    "南荣",
    "东里",
    "东宫",
    "仲长",
    "子书",
    "子桑",
    "即墨",
    "达奚",
    "褚师",
    "古月",
    "太白",
    "黑楼",
    "白凝",
    "凤金",
    "商心",
    "铁若",
    "花酒",
]

TITLE_SUFFIX = [
    "仙尊",
    "魔尊",
    "老祖",
    "仙子",
    "童子",
    "真君",
    "上人",
    "居士",
    "洞主",
    "蛊仙",
    "蛊师",
    "族长",
    "寨主",
    "家老",
    "长老",
    "大长老",
    "太上大长老",
    "圣女",
    "太子",
    "公子",
    "姑娘",
    "小姐",
    "师兄",
    "师姐",
    "师弟",
    "师妹",
    "地灵",
    "天灵",
]

SPEECH_VERBS = [
    "道",
    "说道",
    "问道",
    "笑道",
    "冷笑",
    "大笑",
    "叹道",
    "喝道",
    "大喝",
    "低喝",
    "怒吼",
    "冷哼",
    "沉吟",
    "点头",
    "摇头",
    "皱眉",
    "暗道",
    "心道",
    "心想",
    "开口",
    "回答",
    "喃喃",
]

REGION_WORDS = {
    "southern": ["南疆", "青茅山", "商家城", "义天山", "武家", "铁家", "白家", "古月"],
    "central": ["中洲", "天庭", "灵缘斋", "仙鹤门", "十大古派", "监天塔"],
    "northern": ["北原", "王庭", "真阳楼", "长生天", "黑家", "马家", "楚门"],
    "eastern": ["东海", "龙宫", "气海", "宋家", "沈家"],
    "western": ["西漠", "房家", "豆神宫"],
    "white": ["太古白天", "白天洞天", "华文洞天"],
    "black": ["太古黑天", "黑天", "影宗", "幽魂"],
}

BAD_SUBSTRINGS = [
    "本章",
    "章节",
    "作者",
    "起点",
    "手机",
    "阅读",
    "全文",
    "小说",
    "时候",
    "什么",
    "怎么",
    "如此",
    "这些",
    "那些",
    "这个",
    "那个",
    "自己",
    "心中",
    "眼前",
    "之前",
    "之后",
    "现在",
    "刚刚",
    "已经",
    "没有",
    "不是",
    "因为",
    "所以",
    "但是",
    "只是",
    "可以",
    "能够",
    "一道",
    "一位",
    "一个",
    "一种",
    "一些",
    "众人",
    "蛊虫",
    "仙蛊",
    "凡蛊",
    "杀招",
    "蛊方",
    "福地",
    "洞天",
    "真传",
    "传承",
    "仙窍",
    "道痕",
    "梦境",
    "天意",
    "五域",
    "两天",
    "南疆",
    "中洲",
    "北原",
    "东海",
    "西漠",
]

BAD_EXACT = {
    "方才",
    "方可",
    "白光",
    "黑暗",
    "黑白",
    "红光",
    "青光",
    "大人",
    "主人",
    "众仙",
    "群仙",
    "蛊仙",
    "蛊师",
    "凡人",
    "人族",
    "异人",
    "正道",
    "魔道",
    "散修",
    "家族",
    "族人",
    "老者",
    "少年",
    "少女",
    "男子",
    "女子",
    "老人",
    "太上",
    "长老",
    "族长",
    "寨主",
    "仙尊",
    "魔尊",
    "地灵",
    "天灵",
}


def find_epub() -> Path:
    env = os.environ.get("GZR_EPUB")
    if env:
        return Path(env)
    matches = [path for path in BOOK_DIR.glob("*.epub") if path.stat().st_size == EPUB_SIZE]
    if not matches:
        raise FileNotFoundError("Cannot find Gu Zhen Ren EPUB by expected size.")
    return matches[0]


def chapter_number(name: str) -> int:
    match = re.search(r"chapter(\d+)\.html$", name)
    return int(match.group(1)) if match else 0


def strip_html(raw: bytes) -> str:
    text = raw.decode("utf-8", errors="ignore")
    parser = TextExtractor()
    parser.feed(text)
    cleaned = parser.text()
    cleaned = re.sub(r"\s+", "\n", cleaned)
    return cleaned


def normalize_name(name: str, keep_title: bool = False) -> str:
    name = re.sub(r"[^\u4e00-\u9fff]", "", name)
    prefixes = ["那", "这", "此", "某", "一", "有", "被", "将", "却", "但", "而", "若", "如", "其"]
    while len(name) > 2 and name[0] in prefixes:
        name = name[1:]
    if keep_title:
        return name
    for suffix in ["大人", "前辈", "道友", "仙友", "先生", "姑娘", "小姐", "公子", "师兄", "师姐", "师弟", "师妹"]:
        if name.endswith(suffix) and len(name) > len(suffix) + 1:
            name = name[: -len(suffix)]
    return name


def valid_name(name: str) -> bool:
    if not (2 <= len(name) <= 6):
        return False
    if name in BAD_EXACT:
        return False
    if any(part in name for part in BAD_SUBSTRINGS):
        return False
    if re.search(r"(之中|之下|之前|之后|时候|起来|下去|出来|过去|过去)$", name):
        return False
    if len(set(name)) == 1:
        return False
    return True


def context_for(text: str, start: int, end: int, width: int = 36) -> str:
    left = max(0, start - width)
    right = min(len(text), end + width)
    return text[left:right].replace("\n", "")


def add_hit(hits: dict[str, Hit], name: str, chapter: int, pattern: str, context: str) -> None:
    name = normalize_name(name)
    if not valid_name(name):
        return
    if name not in hits:
        hits[name] = Hit(name=name)
    hits[name].add(chapter, pattern, context)
    for region, words in REGION_WORDS.items():
        if any(word in context for word in words):
            hits[name].regions[region] += 1


def compile_patterns() -> list[tuple[str, re.Pattern]]:
    surname_class = "".join(sorted(set(SURNAME)))
    compound = "|".join(sorted(COMPOUND_SURNAME, key=len, reverse=True))
    suffix = "|".join(sorted(TITLE_SUFFIX, key=len, reverse=True))
    verbs = "|".join(sorted(SPEECH_VERBS, key=len, reverse=True))
    patterns: list[tuple[str, re.Pattern]] = [
        ("compound-surname", re.compile(rf"({compound})[\u4e00-\u9fff]{{1,3}}")),
        ("surname", re.compile(rf"(?<![\u4e00-\u9fff])([{surname_class}][\u4e00-\u9fff]{{1,3}})(?![\u4e00-\u9fff])")),
        ("title-full", re.compile(rf"([\u4e00-\u9fff]{{1,4}}(?:{suffix}))")),
        ("before-title", re.compile(rf"([\u4e00-\u9fff]{{2,5}})(?:{suffix})")),
        ("speech", re.compile(rf"([\u4e00-\u9fff]{{2,5}})(?:{verbs})")),
        ("named-as", re.compile(r"(?:名叫|叫做|名为|唤作|号称|自称)([\u4e00-\u9fff]{2,6})")),
        ("possessive", re.compile(r"([\u4e00-\u9fff]{2,5})的(?:脸色|声音|目光|神情|心中|仙窍|福地|杀招|蛊虫|仙蛊)")),
    ]
    return patterns


def classify(hit: Hit) -> str:
    weighted = (
        hit.evidence["compound-surname"] * 5
        + hit.evidence["title-full"] * 5
        + hit.evidence["before-title"] * 4
        + hit.evidence["named-as"] * 4
        + hit.evidence["speech"] * 2
        + hit.evidence["surname"] * 2
        + hit.evidence["possessive"]
    )
    chapter_count = len(hit.chapters)
    if weighted >= 18 or chapter_count >= 4:
        return "confirmed"
    if weighted >= 7 or chapter_count >= 2:
        return "candidate"
    return "noise-review"


def main() -> None:
    epub = find_epub()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    patterns = compile_patterns()
    hits: dict[str, Hit] = {}
    chapters: list[dict] = []

    with ZipFile(epub) as archive:
        chapter_names = sorted(
            [name for name in archive.namelist() if re.search(r"OEBPS/Text/chapter\d+\.html$", name)],
            key=chapter_number,
        )
        for name in chapter_names:
            chapter = chapter_number(name)
            text = strip_html(archive.read(name))
            title = text.split("\n", 1)[0] if text else f"chapter{chapter}"
            chapters.append({"chapter": chapter, "title": title, "chars": len(text)})
            flat = text.replace("\n", "")

            for pattern_name, pattern in patterns:
                for match in pattern.finditer(flat):
                    raw = match.group(1)
                    keep_title = pattern_name == "title-full"
                    candidate = normalize_name(raw, keep_title=keep_title)
                    add_hit(hits, candidate, chapter, pattern_name, context_for(flat, match.start(1), match.end(1)))

    rows = []
    for hit in hits.values():
        level = classify(hit)
        region = hit.regions.most_common(1)[0][0] if hit.regions else ""
        rows.append(
            {
                "name": hit.name,
                "level": level,
                "count": sum(hit.evidence.values()),
                "chapters": len(hit.chapters),
                "firstChapter": min(hit.chapters) if hit.chapters else None,
                "lastChapter": max(hit.chapters) if hit.chapters else None,
                "regionGuess": region,
                "evidence": dict(hit.evidence),
                "contexts": hit.contexts,
            }
        )

    rows.sort(key=lambda item: ({"confirmed": 0, "candidate": 1, "noise-review": 2}[item["level"]], -item["chapters"], -item["count"], item["name"]))

    payload = {
        "source": str(epub),
        "chapterCount": len(chapters),
        "totalCandidates": len(rows),
        "countsByLevel": dict(Counter(row["level"] for row in rows)),
        "chapters": chapters,
        "characters": rows,
    }

    (OUT_DIR / "extracted-character-candidates.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    with (OUT_DIR / "extracted-character-candidates.csv").open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=["name", "level", "count", "chapters", "firstChapter", "lastChapter", "regionGuess", "evidenceSample", "contextSample"],
        )
        writer.writeheader()
        for row in rows:
            writer.writerow(
                {
                    "name": row["name"],
                    "level": row["level"],
                    "count": row["count"],
                    "chapters": row["chapters"],
                    "firstChapter": row["firstChapter"],
                    "lastChapter": row["lastChapter"],
                    "regionGuess": row["regionGuess"],
                    "evidenceSample": json.dumps(row["evidence"], ensure_ascii=False),
                    "contextSample": row["contexts"][0]["context"] if row["contexts"] else "",
                }
            )

    confirmed = [row for row in rows if row["level"] == "confirmed"]
    print(
        json.dumps(
            {
                "chapters": len(chapters),
                "totalCandidates": len(rows),
                "countsByLevel": payload["countsByLevel"],
                "topConfirmed": [row["name"] for row in confirmed[:30]],
                "output": str(OUT_DIR),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
