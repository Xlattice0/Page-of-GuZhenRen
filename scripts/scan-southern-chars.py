"""
逐章读取《蛊真人》全文，为南疆人物提取仙蛊、杀招、仙蛊屋。
生成结构化报告供后续填充使用。
"""
import html, json, os, re, time
from collections import defaultdict
from pathlib import Path

CHAPTER_DIR = Path(r"D:\MyPages\GuZhenRen\storage\epub-extracted\OEBPS\Text")
OUT_DIR = Path(r"D:\MyPages\GuZhenRen\storage")
os.makedirs(OUT_DIR, exist_ok=True)

# ========== 南疆人物全名单 (基于 generatedAtlasCharacters southern:86) ==========
SOUTHERN_CHARS = [
    "古月方源", "古月方正", "白凝冰", "商心慈", "商燕飞", "铁若男", "铁血冷",
    "武庸", "武独秀", "陆畏因", "乐土仙尊", "幽魂魔尊", "影无邪", "紫山真君",
    "白兔姑娘", "妙音仙子", "砚石老人", "叶凡", "巴十八", "夏槎",
    "乔丝柳", "乔志材", "池曲由", "池伤", "夏飞快", "武雨伯", "武八重", "武罚",
    "商睚眦", "商青青", "商螭吻", "商蒲牢", "商嘲风", "魏央", "小蝶",
    "萧芒", "萧山", "铁霸修", "铁区中", "铁刀苦", "铁慕白",
    "贾金生", "贾富", "李然", "巨开碑", "炎突", "卫德馨", "江牙",
    "张柱", "熊力", "熊姜", "熊林", "熊骄嫚",
    "古月一代", "古月阴荒", "古月漠尘", "古月赤练", "古月药红", "古月药乐",
    "古月冻土", "古月蛮石", "古月空井", "古月博", "古月青书", "古月赤城",
    "古月漠北", "古月药姬", "古月方想", "白相",
    "花酒行者", "毒蝎娘子", "商一帆", "黑心道人", "石宗",
    "陈双全", "陈鑫", "百陌行", "林大鸟", "李逍遥",
    "吞财童子",
]

# Also track aliases/short names
SHORT_NAMES = {
    "方源": "古月方源", "方正": "古月方正",
    "白凝": "白凝冰", "商心": "商心慈",
    "铁若": "铁若男", "武庸": "武庸",
    "黑楼": "黑楼兰",  # actually northern but tracked
}

# Patterns for detecting gu, moves, houses
GU_RE = re.compile(r'([一-鿿]{1,6}(?:仙)?蛊(?!师|师|虫|材|方|经|诀|术|法|道|修|仙|尊|神|王|圣|帝|皇))')
MOVE_RE = re.compile(r'(?:杀招|战场杀招|复合杀招)[：:]?\s*[一-鿿、　·\w]{2,30}(?:\([^)]*\))?')
HOUSE_RE = re.compile(r'(?:仙蛊屋|仙蛊屋名)[：:]?\s*[一-鿿·]{2,12}')
RANK_RE = re.compile(r'([六七七八九]转)(?:仙蛊|蛊)?\s*([一-鿿]{1,8}(?:仙)?蛊)')

def strip_html(text):
    """Remove HTML tags and decode entities"""
    text = html.unescape(text)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\s+', '', text)  # Chinese text: remove whitespace between chars
    return text

def read_chapters():
    """Generator: yield (chapter_num, title, text) for all chapters"""
    files = sorted(
        [f for f in CHAPTER_DIR.glob("chapter*.html")],
        key=lambda p: int(re.search(r'chapter(\d+)', p.stem).group(1))
    )
    for fp in files:
        num = int(re.search(r'chapter(\d+)', fp.stem).group(1))
        raw = fp.read_text(encoding='utf-8', errors='ignore')
        text = strip_html(raw)

        # Extract title
        title_match = re.search(r'(?:第[一二三四五六七八九十百千\d]+[节章卷][：:\s]*)(.{2,40})', text)
        title = title_match.group(1).strip() if title_match else ""

        yield num, title, text

def extract_chapter_data(chapter_num, title, text):
    """Extract character-related data from one chapter"""
    results = []

    for char in SOUTHERN_CHARS:
        if char not in text:
            continue

        # Find all positions of character name
        positions = [m.start() for m in re.finditer(re.escape(char), text)]
        if not positions:
            continue

        data = {"chapter": chapter_num, "title": title.strip(), "character": char, "gu": [], "moves": [], "houses": []}

        for pos in positions:
            # Extract context window (±200 chars around the name)
            start = max(0, pos - 200)
            end = min(len(text), pos + 200)
            context = text[start:end]

            # Look for gu names: pattern "X蛊" or "X仙蛊" near character
            gu_matches = re.findall(r'([一-鿿]{1,6}(?:仙)?蛊)(?!师|虫|材|方|经|诀|术|法)', context)
            for g in gu_matches:
                # Filter noise
                if len(g) >= 2 and g not in ('蛊师','蛊虫','蛊材','蛊方','蛊仙','本命蛊','蛊虫'):
                    if g not in data["gu"]:
                        data["gu"].append(g)

            # Look for rank + gu patterns: "X转 Y蛊"
            rank_matches = re.findall(r'([六七八九]转)\s*([一-鿿]{1,8}(?:仙)?蛊)', context)
            for rank, gname in rank_matches:
                entry = f"{gname}({rank})"
                if entry not in data["gu"]:
                    data["gu"].append(entry)

            # Look for kill moves: "杀招X" or mentions of specific moves
            move_context = re.findall(r'(?:使出|施展|动用|发动|使用|催动|释放|运起)[一-鿿·]{2,20}(?:杀招|手段|之法|之术)', context)
            for m in move_context:
                name = re.sub(r'(?:使出|施展|动用|发动|使用|催动|释放|运起)', '', m)
                if name not in data["moves"] and len(name) >= 3:
                    data["moves"].append(name)

            # Look for named killer moves (quoted or bracketed)
            named_moves = re.findall(r'[「「《]([一-鿿·]{2,16})[」》]', context)
            for m in named_moves:
                if any(kw in context[max(0,context.find(m)-10):context.find(m)]
                       for kw in ['杀招','使出','施展','催动','运起','发动']):
                    if m not in data["moves"]:
                        data["moves"].append(m)

            # Look for immortal gu houses
            house_matches = re.findall(r'(?:仙蛊屋|蛊屋)[：:]?\s*[一-鿿·]{2,12}', context)
            for h in house_matches:
                name = re.sub(r'(?:仙蛊屋|蛊屋)[：:]?\s*', '', h)
                if name not in data["houses"] and len(name) >= 2:
                    data["houses"].append(name)

        if data["gu"] or data["moves"] or data["houses"]:
            results.append(data)

    return results

# ========== Main ==========
print("Starting chapter-by-chapter scan for 南疆 characters...")
print(f"Target characters: {len(SOUTHERN_CHARS)}")
print(f"Chapters to scan: ~2345")

all_results = []
char_summary = defaultdict(lambda: {"gu": set(), "moves": set(), "houses": set(), "chapters": []})

chapter_count = 0
start_time = time.time()
last_report = start_time

for num, title, text in read_chapters():
    chapter_count += 1

    results = extract_chapter_data(num, title, text)
    all_results.extend(results)

    for r in results:
        cname = r["character"]
        for g in r["gu"]:
            char_summary[cname]["gu"].add(g)
        for m in r["moves"]:
            char_summary[cname]["moves"].add(m)
        for h in r["houses"]:
            char_summary[cname]["houses"].add(h)
        char_summary[cname]["chapters"].append(num)

    # Progress every 100 chapters
    if chapter_count % 100 == 0:
        elapsed = time.time() - start_time
        rate = chapter_count / elapsed
        remaining = (2345 - chapter_count) / rate / 60
        print(f"  Ch {chapter_count}/2345 ({chapter_count/2345*100:.1f}%) — "
              f"{len(all_results)} findings — {elapsed:.0f}s elapsed, ~{remaining:.0f}min remaining")

elapsed = time.time() - start_time
print(f"\nScan complete. {chapter_count} chapters in {elapsed:.0f}s")
print(f"Total findings: {len(all_results)} chapter-character hits")

# Build summary
summary = {}
for name in SOUTHERN_CHARS:
    if name in char_summary:
        cs = char_summary[name]
        summary[name] = {
            "gu": sorted(cs["gu"]),
            "moves": sorted(cs["moves"]),
            "houses": sorted(cs["houses"]),
            "chapter_count": len(set(cs["chapters"])),
            "first_chapter": min(cs["chapters"]) if cs["chapters"] else None,
            "last_chapter": max(cs["chapters"]) if cs["chapters"] else None,
        }

# Save
report = {
    "scan_time": time.strftime("%Y-%m-%d %H:%M:%S"),
    "chapters_scanned": chapter_count,
    "southern_characters_scanned": len(SOUTHERN_CHARS),
    "characters_with_data": len(summary),
    "total_findings": len(all_results),
    "summary": summary,
    # Only save first 500 detailed results to keep file manageable
    "detailed_findings": all_results[:500],
}

report_path = OUT_DIR / "southern-character-scan.json"
with open(report_path, 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print(f"\nReport saved to {report_path}")
print(f"\n=== Characters with data ===")
for name, data in sorted(summary.items()):
    print(f"  {name}: {len(data['gu'])} gu, {len(data['moves'])} moves, "
          f"{len(data['houses'])} houses, in {data['chapter_count']} chapters")
