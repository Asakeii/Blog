import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, ArrowUpRight, BookOpen, Github, Sparkles, Tags } from "lucide-react";
import "./styles.css";

type Post = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  topics: string[];
  minutes: number;
  body: string[];
};

const posts: Post[] = [
  {
    slug: "executable-notes",
    title: "把复杂问题写成可执行的笔记",
    date: "2026.07.09",
    summary: "把松散想法拆成约束、路径和可以复用的判断。",
    tags: ["Thinking", "Notes"],
    topics: ["AI Agents", "长期写作", "工具构建"],
    minutes: 6,
    body: [
      "很多问题一开始并不是难，而是没有被写成可以行动的形状。好笔记的价值，是把情绪、猜测和限制条件分开，让下一步自然出现。",
      "我习惯先写下问题边界，再列出已经确定的事实，最后才写方案。这样做会慢一点，但它能减少反复推翻自己的次数。",
      "一篇笔记不必完整。它只需要在未来某个时刻，仍然能帮自己迅速回到当时的判断现场。",
    ],
  },
  {
    slug: "github-pages-blog",
    title: "从 GitHub Pages 开始建立自己的博客",
    date: "2026.07.04",
    summary: "静态博客的发布原理、仓库结构，以及从第一篇文章到自定义域名的路线。",
    tags: ["GitHub", "Web"],
    topics: ["前端工程", "开源实践"],
    minutes: 8,
    body: [
      "GitHub Pages 的核心很简单：把构建后的静态文件放到 GitHub 能托管的位置，然后让浏览器直接请求这些 HTML、CSS 和 JavaScript。",
      "对个人博客来说，这个模型非常舒服。文章可以先写成数据或 Markdown，再由前端构建成页面；发布则变成一次普通的 git push。",
      "真正重要的不是工具链有多复杂，而是你能不能持续把想法放上来，并让访问者很快找到他们想读的东西。",
    ],
  },
  {
    slug: "engineering-taste",
    title: "工程系统里的审美：少做一点，但做准",
    date: "2026.06.28",
    summary: "代码、界面和文档都需要节奏。简约不是空，而是没有多余动作。",
    tags: ["Design", "Engineering"],
    topics: ["前端工程", "工具构建"],
    minutes: 5,
    body: [
      "工程里的审美不是把东西做漂亮那么简单。它更接近一种判断：哪些信息应该出现，哪些动作应该被省掉，哪些复杂度应该被藏到系统内部。",
      "界面也是系统的一部分。按钮如果看起来能点，就必须有结果；列表如果像入口，就应该真的能通向下一层内容。",
      "少做一点不是退缩，而是把有限的注意力用在最关键的连接上。",
    ],
  },
];

const topics = ["全部", "前端工程", "AI Agents", "工具构建", "长期写作", "开源实践"];

const getHashState = () => {
  const hash = window.location.hash.replace(/^#/, "");

  if (hash.startsWith("post/")) {
    return { postSlug: decodeURIComponent(hash.replace("post/", "")), topic: "全部" };
  }

  if (hash.startsWith("topic/")) {
    return { postSlug: "", topic: decodeURIComponent(hash.replace("topic/", "")) || "全部" };
  }

  return { postSlug: "", topic: "全部" };
};

function App() {
  const [route, setRoute] = useState(getHashState);
  const selectedPost = posts.find((post) => post.slug === route.postSlug);

  const visiblePosts = useMemo(() => {
    if (route.topic === "全部") {
      return posts;
    }

    return posts.filter((post) => post.topics.includes(route.topic));
  }, [route.topic]);

  useEffect(() => {
    const onHashChange = () => setRoute(getHashState());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const targetId = selectedPost ? "post-detail" : route.topic !== "全部" ? "writing" : "";
    if (targetId) {
      window.requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView({ block: "start" }));
    }
  }, [route.topic, selectedPost]);

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
          <p className="hero-lede">记录技术、工具和长期思考。保持简洁、清醒，也保留一点个人偏好。</p>
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
          <div className="signal-map" aria-hidden="true">
            {Array.from({ length: 20 }).map((_, index) => (
              <span key={index} style={{ "--delay": `${index * 55}ms` } as React.CSSProperties} />
            ))}
          </div>
        </aside>
      </section>

      {selectedPost ? <PostDetail post={selectedPost} /> : null}

      <section className="content-grid">
        <div className="writing-column" id="writing">
          <div className="section-heading">
            <p className="section-label">{route.topic === "全部" ? "Latest writing" : route.topic}</p>
            <h2>{route.topic === "全部" ? "近期文章" : "主题文章"}</h2>
          </div>
          <div className="post-list">
            {visiblePosts.map((post) => (
              <a className="post-row" href={`#post/${post.slug}`} key={post.slug}>
                <time dateTime={post.date.replaceAll(".", "-")}>{post.date}</time>
                <div>
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                  <div className="post-meta">
                    <span>{post.minutes} min read</span>
                    {post.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <ArrowUpRight className="post-arrow" size={18} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <aside className="profile-column" aria-label="博客信息">
          <div className="profile-block">
            <p className="section-label">About</p>
            <h2>安静索引。</h2>
            <p>工程、工具和写作笔记。短一点，准一点。</p>
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
                <a className={route.topic === topic ? "is-active" : ""} href={topic === "全部" ? "#writing" : `#topic/${encodeURIComponent(topic)}`} key={topic}>
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

function PostDetail({ post }: { post: Post }) {
  return (
    <article className="post-detail" id="post-detail">
      <a className="back-link" href="#writing">
        <ArrowLeft size={17} />
        返回文章
      </a>
      <time dateTime={post.date.replaceAll(".", "-")}>{post.date}</time>
      <h2>{post.title}</h2>
      <p className="post-detail-summary">{post.summary}</p>
      <div className="post-meta">
        <span>{post.minutes} min read</span>
        {post.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="post-body">
        {post.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
