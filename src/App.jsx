import {
  BookOpen,
  Boxes,
  Crown,
  GitBranch,
  Home,
  Map,
  Network,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { fallbackContent } from "./fallbackContent.js";

const iconMap = {
  timeline: GitBranch,
  network: Network,
  spark: Sparkles,
  map: Map,
  crown: Crown,
  book: BookOpen,
  systems: Boxes
};

function useHomepageContent() {
  const [content, setContent] = useState(fallbackContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/homepage")
      .then((res) => {
        if (!res.ok) throw new Error("内容接口暂不可用");
        return res.json();
      })
      .then((data) => {
        if (alive) {
          setContent(data);
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

function useAppleLikeMotion() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealNodes = Array.from(document.querySelectorAll("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -12% 0px" }
    );
    revealNodes.forEach((node) => observer.observe(node));

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      document.documentElement.style.setProperty("--scroll-progress", String(progress));
      document.documentElement.style.setProperty("--hero-lift", `${Math.min(window.scrollY * 0.16, 140)}px`);
      if (!reduceMotion) {
        document.documentElement.style.setProperty("--hero-scale", String(1 + Math.min(progress * 0.08, 0.08)));
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
}

function AtmosphereScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seeds = Array.from({ length: 54 }, (_, index) => ({
      x: (index * 137.5) % 100,
      y: 18 + ((index * 47) % 62),
      speed: 0.18 + (index % 7) * 0.03,
      size: 0.8 + (index % 5) * 0.25
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

    const drawMountain = (width, height, y, color, offset) => {
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, y);
      for (let x = 0; x <= width + 80; x += 80) {
        const peak = y - 34 - Math.sin((x + offset) * 0.015) * 28;
        const valley = y + 26 + Math.cos((x + offset) * 0.012) * 14;
        ctx.quadraticCurveTo(x + 26, peak, x + 80, valley);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      frame += reduceMotion ? 0 : 1;
      ctx.clearRect(0, 0, width, height);

      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#090b0d");
      bg.addColorStop(0.42, "#121314");
      bg.addColorStop(1, "#050505");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalAlpha = 0.28;
      for (let i = 0; i < 9; i += 1) {
        const y = height * (0.18 + i * 0.075);
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= width; x += 24) {
          const wave = Math.sin((x + frame * (0.8 + i * 0.2)) * 0.012 + i) * (10 + i);
          ctx.lineTo(x, y + wave);
        }
        ctx.strokeStyle = i % 2 ? "rgba(215, 214, 204, .16)" : "rgba(175, 196, 206, .12)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      drawMountain(width, height, height * 0.68, "rgba(39, 43, 44, .86)", frame * 0.7);
      drawMountain(width, height, height * 0.78, "rgba(14, 16, 17, .95)", frame * 0.45);

      ctx.save();
      ctx.translate(width * 0.52, height * 0.39);
      ctx.rotate(frame * 0.0012);
      for (let ring = 0; ring < 5; ring += 1) {
        ctx.beginPath();
        ctx.ellipse(0, 0, 92 + ring * 27, 22 + ring * 8, ring * 0.33, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(227, 220, 190, ${0.18 - ring * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      seeds.forEach((seed, index) => {
        const x = ((seed.x + frame * seed.speed) % 100) * width * 0.01;
        const y = seed.y * height * 0.01 + Math.sin(frame * 0.018 + index) * 9;
        ctx.beginPath();
        ctx.arc(x, y, seed.size, 0, Math.PI * 2);
        ctx.fillStyle = index % 4 === 0 ? "rgba(227, 220, 190, .52)" : "rgba(143, 165, 174, .34)";
        ctx.fill();
      });

      if (!reduceMotion) raf = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas className="atmosphere-scene" ref={canvasRef} aria-hidden="true" />;
}

function SiteChrome({ content }) {
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
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
          <a href="/admin">后台</a>
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
            <a className="rail-item" href={item.href || "#timeline"} key={item.title}>
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

function HomePage({ content, loading, error }) {
  useAppleLikeMotion();
  const hero = content.hero || fallbackContent.hero;

  return (
    <main>
      <SiteChrome content={content} />
      <ProductRail items={content.productRail} />

      <section className="hero-section" id="top">
        <AtmosphereScene />
        <div className="hero-copy" data-reveal>
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1>{hero.title}</h1>
          <p className="hero-subtitle">{hero.subtitle}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#timeline">
              {hero.primaryCta}
            </a>
            <a className="button button-secondary" href="/admin">
              {hero.secondaryCta}
            </a>
          </div>
          <div className="chip-row">
            {(hero.chips || []).map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
          {(loading || error) && <p className="quiet-status">{loading ? "载入内容中" : error}</p>}
        </div>
      </section>

      <section className="overview-section" id="overview">
        <div className="overview-sticky" data-reveal>
          <p className="eyebrow">{content.overview?.kicker}</p>
          <h2>{content.overview?.title}</h2>
        </div>
        <div className="overview-copy">
          {(content.overview?.paragraphs || []).map((paragraph) => (
            <p data-reveal key={paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="timeline-section" id="timeline">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">Six-volume arc</p>
          <h2>从凡人棋局，到尊者对弈。</h2>
        </div>
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

      <section className="players-section" id="players">
        <div className="players-stage" data-reveal>
          <p className="eyebrow">Board positions</p>
          <h2>每个人都不是说明书上的标签。</h2>
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

      <section className="systems-section" id="systems">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">World engine</p>
          <h2>设定不是背景，是驱动剧情的机器。</h2>
        </div>
        <div className="system-grid">
          {(content.systems || []).map((system) => (
            <article className="system-card" data-reveal key={system.name}>
              <Boxes size={22} strokeWidth={1.8} />
              <h3>{system.name}</h3>
              <p>{system.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-section" data-reveal>
        <h2>{content.closing?.title}</h2>
        <p>{content.closing?.text}</p>
        <a className="button button-primary" href="/admin">
          打开后台
        </a>
      </section>
    </main>
  );
}

function TextInput({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value || ""} onChange={(event) => onChange(event.target.value)} />
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

function AdminPage({ content, setContent }) {
  const [draft, setDraft] = useState(content);
  const [tab, setTab] = useState("hero");
  const [jsonText, setJsonText] = useState(JSON.stringify(content, null, 2));
  const [status, setStatus] = useState("");

  useEffect(() => {
    setDraft(content);
    setJsonText(JSON.stringify(content, null, 2));
  }, [content]);

  const updateDraft = (updater) => {
    setDraft((current) => {
      const next = updater(structuredClone(current));
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const saveDraft = async (payload = draft) => {
    setStatus("保存中");
    const res = await fetch("/api/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus(data.error || "保存失败");
      return;
    }
    const data = await res.json();
    setContent(data);
    setStatus("已保存");
  };

  const resetDraft = async () => {
    setStatus("重置中");
    const res = await fetch("/api/homepage/reset", { method: "POST" });
    const data = await res.json();
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

  const addTimeline = () => {
    updateDraft((next) => {
      next.timeline.push({ volume: "新卷", title: "新节点", detail: "待补充", stat: "0节" });
      return next;
    });
  };

  const addPlayer = () => {
    updateDraft((next) => {
      next.players.push({ name: "新人物", role: "定位", text: "待补充" });
      return next;
    });
  };

  const addSystem = () => {
    updateDraft((next) => {
      next.systems.push({ name: "新设定", text: "待补充" });
      return next;
    });
  };

  const tabs = useMemo(
    () => [
      { id: "hero", label: "首页文案" },
      { id: "timeline", label: "时间线" },
      { id: "players", label: "人物" },
      { id: "systems", label: "设定" },
      { id: "json", label: "JSON" }
    ],
    []
  );

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
        </div>
      </header>

      <section className="admin-panel">
        <aside className="admin-tabs" aria-label="管理分区">
          {tabs.map((item) => (
            <button className={tab === item.id ? "active" : ""} key={item.id} onClick={() => setTab(item.id)} type="button">
              {item.label}
            </button>
          ))}
        </aside>

        <div className="admin-editor">
          <div className="admin-title">
            <p>Content API</p>
            <h1>首页后台管理</h1>
            <span>{status || "本地 JSON 内容源"}</span>
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
              <TextInput
                label="眉标"
                value={draft.hero?.eyebrow}
                onChange={(value) =>
                  updateDraft((next) => {
                    next.hero.eyebrow = value;
                    return next;
                  })
                }
              />
              <TextInput
                label="主标题"
                value={draft.hero?.title}
                onChange={(value) =>
                  updateDraft((next) => {
                    next.hero.title = value;
                    return next;
                  })
                }
              />
              <TextArea
                label="副标题"
                value={draft.hero?.subtitle}
                onChange={(value) =>
                  updateDraft((next) => {
                    next.hero.subtitle = value;
                    return next;
                  })
                }
              />
              <TextInput
                label="主按钮"
                value={draft.hero?.primaryCta}
                onChange={(value) =>
                  updateDraft((next) => {
                    next.hero.primaryCta = value;
                    return next;
                  })
                }
              />
              <TextInput
                label="副按钮"
                value={draft.hero?.secondaryCta}
                onChange={(value) =>
                  updateDraft((next) => {
                    next.hero.secondaryCta = value;
                    return next;
                  })
                }
              />
              <TextArea
                label="首页概览标题"
                value={draft.overview?.title}
                rows={4}
                onChange={(value) =>
                  updateDraft((next) => {
                    next.overview.title = value;
                    return next;
                  })
                }
              />
              <TextArea
                label="收尾文案"
                value={draft.closing?.text}
                rows={4}
                onChange={(value) =>
                  updateDraft((next) => {
                    next.closing.text = value;
                    return next;
                  })
                }
              />
            </div>
          )}

          {tab === "timeline" && (
            <div className="stack-editor">
              {(draft.timeline || []).map((item, index) => (
                <article className="edit-card" key={`${item.volume}-${index}`}>
                  <button className="delete-button" onClick={() => removeArrayItem("timeline", index)} type="button" title="删除">
                    <Trash2 size={17} />
                  </button>
                  <TextInput label="卷名" value={item.volume} onChange={(value) => updateArrayItem("timeline", index, "volume", value)} />
                  <TextInput label="标题" value={item.title} onChange={(value) => updateArrayItem("timeline", index, "title", value)} />
                  <TextInput label="统计" value={item.stat} onChange={(value) => updateArrayItem("timeline", index, "stat", value)} />
                  <TextArea label="说明" value={item.detail} onChange={(value) => updateArrayItem("timeline", index, "detail", value)} />
                </article>
              ))}
              <button className="add-button" onClick={addTimeline} type="button">
                <Plus size={18} />
                新增时间线节点
              </button>
            </div>
          )}

          {tab === "players" && (
            <div className="stack-editor">
              {(draft.players || []).map((item, index) => (
                <article className="edit-card" key={`${item.name}-${index}`}>
                  <button className="delete-button" onClick={() => removeArrayItem("players", index)} type="button" title="删除">
                    <Trash2 size={17} />
                  </button>
                  <TextInput label="名称" value={item.name} onChange={(value) => updateArrayItem("players", index, "name", value)} />
                  <TextInput label="定位" value={item.role} onChange={(value) => updateArrayItem("players", index, "role", value)} />
                  <TextArea label="说明" value={item.text} onChange={(value) => updateArrayItem("players", index, "text", value)} />
                </article>
              ))}
              <button className="add-button" onClick={addPlayer} type="button">
                <Plus size={18} />
                新增人物
              </button>
            </div>
          )}

          {tab === "systems" && (
            <div className="stack-editor">
              {(draft.systems || []).map((item, index) => (
                <article className="edit-card" key={`${item.name}-${index}`}>
                  <button className="delete-button" onClick={() => removeArrayItem("systems", index)} type="button" title="删除">
                    <Trash2 size={17} />
                  </button>
                  <TextInput label="名称" value={item.name} onChange={(value) => updateArrayItem("systems", index, "name", value)} />
                  <TextArea label="说明" value={item.text} onChange={(value) => updateArrayItem("systems", index, "text", value)} />
                </article>
              ))}
              <button className="add-button" onClick={addSystem} type="button">
                <Plus size={18} />
                新增设定
              </button>
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
  const isAdmin = window.location.pathname.startsWith("/admin");

  if (isAdmin) return <AdminPage content={content} setContent={setContent} />;
  return <HomePage content={content} loading={loading} error={error} />;
}
