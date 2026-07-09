import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ArrowUpRight, BookOpen, Github, Sparkles, Tags } from "lucide-react";
import "./styles.css";

const posts = [
  {
    title: "把复杂问题写成可执行的笔记",
    date: "2026.07.09",
    summary: "关于如何把松散的想法拆成约束、路径和可以复用的判断。",
    tags: ["Thinking", "Notes"],
    minutes: 6,
  },
  {
    title: "从 GitHub Pages 开始建立自己的博客",
    date: "2026.07.04",
    summary: "静态博客的发布原理、仓库结构，以及从第一篇文章到自定义域名的路线。",
    tags: ["GitHub", "Web"],
    minutes: 8,
  },
  {
    title: "工程系统里的审美：少做一点，但做准",
    date: "2026.06.28",
    summary: "代码、界面和文档都需要节奏。真正的简约不是空，而是没有多余动作。",
    tags: ["Design", "Engineering"],
    minutes: 5,
  },
];

const topics = ["前端工程", "AI Agents", "工具构建", "长期写作", "开源实践"];

function App() {
  return (
    <main className="site-shell">
      <header className="site-header" aria-label="主导航">
        <a className="brand-mark" href="#top" aria-label="Asakei Blog 首页">
          <span>A</span>
          <strong>Asakei</strong>
        </a>
        <nav>
          <a href="#writing">文章</a>
          <a href="#topics">主题</a>
          <a href="https://github.com/Asakeii" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
        <a className="icon-button" href="https://github.com/Asakeii" target="_blank" rel="noreferrer" aria-label="打开 Asakei 的 GitHub">
          <Github size={18} />
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="section-label">Personal blog / Engineering notes</p>
          <h1>Asakei 写作的地方。</h1>
          <p className="hero-lede">
            记录技术、工具、设计判断和那些需要慢慢想清楚的问题。这里保持简洁、清醒，也允许一点锋利的个人偏好。
          </p>
          <div className="hero-actions" aria-label="主要操作">
            <a className="primary-action" href="#writing">
              开始阅读
              <ArrowUpRight size={17} />
            </a>
            <a className="secondary-action" href="https://github.com/Asakeii" target="_blank" rel="noreferrer">
              <Github size={17} />
              GitHub / Asakeii
            </a>
          </div>
        </div>

        <aside className="signal-panel" aria-label="Asakei blog visual signal">
          <div className="signal-head">
            <span>asakei.index</span>
            <Sparkles size={16} />
          </div>
          <div className="signal-grid" aria-hidden="true">
            {Array.from({ length: 42 }).map((_, index) => (
              <span key={index} style={{ "--delay": `${index * 28}ms` } as React.CSSProperties} />
            ))}
          </div>
          <p>clear notes / durable tools / small systems</p>
        </aside>
      </section>

      <section className="content-grid">
        <div className="writing-column" id="writing">
          <div className="section-heading">
            <p className="section-label">Latest writing</p>
            <h2>近期文章</h2>
          </div>
          <div className="post-list">
            {posts.map((post) => (
              <article className="post-row" key={post.title}>
                <time dateTime={post.date.replaceAll(".", "-")}>{post.date}</time>
                <div>
                  <h3>
                    <a href="#writing">{post.title}</a>
                  </h3>
                  <p>{post.summary}</p>
                  <div className="post-meta">
                    <span>{post.minutes} min read</span>
                    {post.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <ArrowUpRight className="post-arrow" size={18} aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>

        <aside className="profile-column" aria-label="博客信息">
          <div className="profile-block">
            <p className="section-label">About</p>
            <h2>一个安静的索引。</h2>
            <p>
              这里会收集 Asakei 对工程、产品和写作的长期笔记。文章可以很短，但每一篇都应该留下些什么。
            </p>
          </div>

          <div className="tool-strip" aria-label="快捷入口">
            <a href="https://github.com/Asakeii" target="_blank" rel="noreferrer" aria-label="打开 GitHub">
              <Github size={18} />
            </a>
            <a href="#writing" aria-label="查看文章">
              <BookOpen size={18} />
            </a>
            <a href="#topics" aria-label="查看主题">
              <Tags size={18} />
            </a>
          </div>

          <div className="topics" id="topics">
            <p className="section-label">Topics</p>
            <div>
              {topics.map((topic) => (
                <a href="#writing" key={topic}>
                  {topic}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <footer>
        <span>© 2026 Asakei</span>
        <a href="https://github.com/Asakeii" target="_blank" rel="noreferrer">
          Published from GitHub
          <ArrowUpRight size={15} />
        </a>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
