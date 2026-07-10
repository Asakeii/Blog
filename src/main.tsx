import { StrictMode, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, ArrowUpRight, Github, LayoutDashboard, PenLine, Plus, Save, Tags, Trash2 } from "lucide-react";
import DOMPurify from "dompurify";
import { marked } from "marked";
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
  markdown?: string;
  draft?: boolean;
};

type RouteState = {
  page: "home" | "post" | "draft" | "admin";
  slug: string;
  topic: string;
};

type DraftForm = {
  title: string;
  summary: string;
  topic: string;
  body: string;
};

const basePosts: Post[] = [
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

const defaultTopics = ["全部", "前端工程", "AI Agents", "工具构建", "长期写作", "开源实践"];
const draftsKey = "asakei-blog-drafts";
const deletedPostsKey = "asakei-blog-deleted-posts";
const customTopicsKey = "asakei-blog-custom-topics";

const emptyDraftForm: DraftForm = {
  title: "",
  summary: "",
  topic: "长期写作",
  body: "# 新的博客\n\n从这里开始写 Markdown。\n\n- 支持列表\n- 支持 **加粗** 和链接\n\n```ts\nconst idea = \"Asakei\";\n```",
};

const getHashState = (): RouteState => {
  const hash = window.location.hash.replace(/^#/, "");

  if (hash.startsWith("post/")) {
    return { page: "post", slug: decodeURIComponent(hash.replace("post/", "")), topic: "全部" };
  }

  if (hash.startsWith("draft/")) {
    return { page: "draft", slug: decodeURIComponent(hash.replace("draft/", "")), topic: "全部" };
  }

  if (hash.startsWith("topic/")) {
    return { page: "home", slug: "", topic: decodeURIComponent(hash.replace("topic/", "")) || "全部" };
  }

  if (hash === "admin") {
    return { page: "admin", slug: "", topic: "全部" };
  }

  return { page: "home", slug: "", topic: "全部" };
};

const loadDrafts = (): Post[] => {
  try {
    const raw = window.localStorage.getItem(draftsKey);
    return raw ? (JSON.parse(raw) as Post[]) : [];
  } catch {
    return [];
  }
};

const saveDrafts = (drafts: Post[]) => {
  window.localStorage.setItem(draftsKey, JSON.stringify(drafts));
};

const loadDeletedPostSlugs = (): string[] => {
  try {
    const raw = window.localStorage.getItem(deletedPostsKey);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const saveDeletedPostSlugs = (slugs: string[]) => {
  window.localStorage.setItem(deletedPostsKey, JSON.stringify(slugs));
};

const uniqueTopics = (items: string[]) => Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

const loadCustomTopics = (): string[] => {
  try {
    const raw = window.localStorage.getItem(customTopicsKey);
    return raw ? uniqueTopics(JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const saveCustomTopics = (items: string[]) => {
  window.localStorage.setItem(customTopicsKey, JSON.stringify(items));
};

const renderMarkdown = (markdown: string) => DOMPurify.sanitize(marked.parse(markdown, { async: false }) as string);

const createSlug = (title: string) =>
  title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "") || `draft-${Date.now()}`;

const today = () => new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()).replaceAll("/", ".");

function App() {
  const [route, setRoute] = useState(getHashState);
  const [drafts, setDrafts] = useState<Post[]>(loadDrafts);
  const [deletedPostSlugs, setDeletedPostSlugs] = useState<string[]>(loadDeletedPostSlugs);
  const [customTopics, setCustomTopics] = useState<string[]>(loadCustomTopics);
  const publishedPosts = useMemo(() => basePosts.filter((post) => !deletedPostSlugs.includes(post.slug)), [deletedPostSlugs]);
  const deletedPosts = useMemo(() => basePosts.filter((post) => deletedPostSlugs.includes(post.slug)), [deletedPostSlugs]);
  const allPosts = useMemo(() => [...drafts, ...publishedPosts], [drafts, publishedPosts]);
  const allTopics = useMemo(
    () => ["全部", ...uniqueTopics([...defaultTopics.filter((topic) => topic !== "全部"), ...customTopics, ...allPosts.flatMap((post) => post.topics)])],
    [allPosts, customTopics],
  );
  const selectedPost = route.page === "post" ? publishedPosts.find((post) => post.slug === route.slug) : undefined;
  const selectedDraft = route.page === "draft" ? drafts.find((post) => post.slug === route.slug) : undefined;
  const activePost = selectedPost || selectedDraft;

  const visiblePosts = useMemo(() => {
    if (route.topic === "全部") {
      return allPosts;
    }

    return allPosts.filter((post) => post.topics.includes(route.topic));
  }, [allPosts, route.topic]);

  const updateDrafts = (nextDrafts: Post[]) => {
    setDrafts(nextDrafts);
    saveDrafts(nextDrafts);
  };

  const addTopic = (topic: string) => {
    const nextTopic = topic.trim();

    if (!nextTopic || allTopics.includes(nextTopic)) {
      return;
    }

    const nextTopics = uniqueTopics([...customTopics, nextTopic]);
    setCustomTopics(nextTopics);
    saveCustomTopics(nextTopics);
  };

  const removeDraft = (slug: string) => {
    const nextDrafts = drafts.filter((draft) => draft.slug !== slug);
    updateDrafts(nextDrafts);
    if (route.slug === slug) {
      window.location.hash = "admin";
    }
  };

  const removePublishedPost = (slug: string) => {
    const nextSlugs = Array.from(new Set([...deletedPostSlugs, slug]));
    setDeletedPostSlugs(nextSlugs);
    saveDeletedPostSlugs(nextSlugs);
    if (route.slug === slug) {
      window.location.hash = "admin";
    }
  };

  const restorePublishedPost = (slug: string) => {
    const nextSlugs = deletedPostSlugs.filter((deletedSlug) => deletedSlug !== slug);
    setDeletedPostSlugs(nextSlugs);
    saveDeletedPostSlugs(nextSlugs);
  };

  const createDraft = (form: DraftForm) => {
    const title = form.title.trim();
    const markdown = form.body.trim();
    const body = markdown
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    if (!title || body.length === 0) {
      return;
    }

    const draft: Post = {
      slug: `${createSlug(title)}-${Date.now().toString(36)}`,
      title,
      date: today(),
      summary: form.summary.trim() || body[0].slice(0, 72),
      tags: ["Draft"],
      topics: [form.topic],
      minutes: Math.max(1, Math.ceil(body.join("").length / 500)),
      body,
      markdown,
      draft: true,
    };

    updateDrafts([draft, ...drafts]);
    window.location.hash = `draft/${draft.slug}`;
  };

  useEffect(() => {
    const onHashChange = () => setRoute(getHashState());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      if (route.page === "home" && window.location.hash === "#writing") {
        document.getElementById("writing")?.scrollIntoView({ block: "start", behavior: "smooth" });
        return;
      }

      if (route.page === "home" && route.topic !== "全部") {
        document.getElementById("writing")?.scrollIntoView({ block: "start", behavior: "smooth" });
        return;
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [route.page, route.slug, route.topic]);

  return (
    <main className="site-shell">
      <Header />

      {activePost ? (
        <PostDetail post={activePost} onDeleteDraft={activePost.draft ? removeDraft : undefined} />
      ) : route.page === "admin" ? (
        <AdminPage
          deletedPosts={deletedPosts}
          drafts={drafts}
          onAddTopic={addTopic}
          onCreateDraft={createDraft}
          onDeleteDraft={removeDraft}
          onDeletePublishedPost={removePublishedPost}
          onRestorePublishedPost={restorePublishedPost}
          publishedPosts={publishedPosts}
          topics={allTopics}
        />
      ) : (
        <HomePage visiblePosts={visiblePosts} selectedTopic={route.topic} topics={allTopics} />
      )}

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

function Header() {
  return (
    <header className="site-header" aria-label="主导航">
      <a className="brand-mark" href="#top" aria-label="Asakei Blog 首页">
        <img className="logo-mark" src="./asakei-logo.svg" alt="" aria-hidden="true" />
        <strong>Asakei</strong>
      </a>
      <nav>
        <a href="#writing">文章</a>
        <a href="#topics">主题</a>
        <a href="#admin">管理</a>
        <a href="https://github.com/Asakeii" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </nav>
      <a className="icon-button" href="https://github.com/Asakeii" target="_blank" rel="noreferrer" aria-label="打开 Asakei 的 GitHub">
        <Github size={18} />
      </a>
    </header>
  );
}

function HomePage({ visiblePosts, selectedTopic, topics }: { visiblePosts: Post[]; selectedTopic: string; topics: string[] }) {
  return (
    <>
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
            <a className="secondary-action" href="#admin">
              <PenLine size={17} />
              新建博客
            </a>
          </div>
        </div>

        <aside className="studio-panel" aria-label="Asakei blog visual signal">
          <div className="studio-mark">A</div>
          <div className="studio-lines" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="studio-index" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </aside>
      </section>

      <section className="content-grid">
        <div className="writing-column" id="writing">
          <div className="section-heading">
            <p className="section-label">{selectedTopic === "全部" ? "Latest writing" : selectedTopic}</p>
            <h2>{selectedTopic === "全部" ? "近期文章" : "主题文章"}</h2>
          </div>
          <PostList posts={visiblePosts} />
        </div>

        <AsideInfo selectedTopic={selectedTopic} topics={topics} />
      </section>
    </>
  );
}

function PostList({ posts }: { posts: Post[] }) {
  return (
    <div className="post-list">
      {posts.map((post) => (
        <a className="post-row" href={`#${post.draft ? "draft" : "post"}/${post.slug}`} key={post.slug}>
          <time dateTime={post.date.replaceAll(".", "-")}>{post.date}</time>
          <div>
            <h3>{post.title}</h3>
            <p>{post.summary}</p>
            <div className="post-meta">
              <span>{post.draft ? "Draft" : `${post.minutes} min read`}</span>
              {post.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <ArrowUpRight className="post-arrow" size={18} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

function AsideInfo({ selectedTopic, topics }: { selectedTopic: string; topics: string[] }) {
  return (
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
        <a href="#admin" aria-label="管理博客">
          <LayoutDashboard size={18} />
        </a>
        <a href="#topics" aria-label="查看主题">
          <Tags size={18} />
        </a>
      </div>

      <div className="topics" id="topics">
        <p className="section-label">Topics</p>
        <div>
          {topics.map((topic) => (
            <a className={selectedTopic === topic ? "is-active" : ""} href={topic === "全部" ? "#writing" : `#topic/${encodeURIComponent(topic)}`} key={topic}>
              {topic}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}

function PostDetail({ post, onDeleteDraft }: { post: Post; onDeleteDraft?: (slug: string) => void }) {
  return (
    <article className="post-detail page-panel" id="post-detail">
      <div className="detail-topbar">
        <a className="back-link" href="#writing">
          <ArrowLeft size={17} />
          返回文章
        </a>
        {onDeleteDraft ? (
          <button className="text-action danger-action" type="button" onClick={() => onDeleteDraft(post.slug)}>
            <Trash2 size={16} />
            删除草稿
          </button>
        ) : null}
      </div>
      <time dateTime={post.date.replaceAll(".", "-")}>{post.date}</time>
      <h2>{post.title}</h2>
      <p className="post-detail-summary">{post.summary}</p>
      <div className="post-meta">
        <span>{post.draft ? "Draft" : `${post.minutes} min read`}</span>
        {post.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="post-body">
        {post.markdown ? <MarkdownContent markdown={post.markdown} /> : post.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </article>
  );
}

function MarkdownContent({ markdown }: { markdown: string }) {
  const html = useMemo(() => renderMarkdown(markdown), [markdown]);
  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
}

function MarkdownSourceView({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  let isCodeBlock = false;

  return (
    <div className="markdown-source-view" aria-hidden="true">
      {lines.map((line, index) => {
        const codeFence = line.match(/^(```.*)$/);

        if (codeFence) {
          isCodeBlock = !isCodeBlock;
          return (
            <div className="source-line source-code-fence" key={`${index}-${line}`}>
              {line}
            </div>
          );
        }

        if (isCodeBlock) {
          return (
            <div className="source-line source-code-line" key={`${index}-${line}`}>
              {line || " "}
            </div>
          );
        }

        const heading = line.match(/^(#{1,6})(\s+)(.*)$/);
        if (heading) {
          return (
            <div className={`source-line source-heading source-heading-${heading[1].length}`} key={`${index}-${line}`}>
              <span className="source-token">{heading[1]}</span>
              {heading[2]}
              <span>{heading[3]}</span>
            </div>
          );
        }

        const listItem = line.match(/^(\s*)([-*+]|\d+\.)(\s+)(.*)$/);
        if (listItem) {
          return (
            <div className="source-line source-list-item" key={`${index}-${line}`}>
              {listItem[1]}
              <span className="source-token">{listItem[2]}</span>
              {listItem[3]}
              {renderSourceInline(listItem[4])}
            </div>
          );
        }

        const quote = line.match(/^(>\s?)(.*)$/);
        if (quote) {
          return (
            <div className="source-line source-quote" key={`${index}-${line}`}>
              <span className="source-token">{quote[1]}</span>
              {renderSourceInline(quote[2])}
            </div>
          );
        }

        return (
          <div className="source-line" key={`${index}-${line}`}>
            {line ? renderSourceInline(line) : "\u00a0"}
          </div>
        );
      })}
    </div>
  );
}

function renderSourceInline(text: string) {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  const parts: ReactNode[] = [];
  let cursor = 0;

  text.replace(pattern, (match, _token, offset) => {
    if (offset > cursor) {
      parts.push(text.slice(cursor, offset));
    }

    if (match.startsWith("**")) {
      parts.push(
        <span className="source-strong" key={`${match}-${offset}`}>
          <span className="source-token">**</span>
          <strong>{match.slice(2, -2)}</strong>
          <span className="source-token">**</span>
        </span>,
      );
    } else if (match.startsWith("`")) {
      parts.push(
        <span className="source-inline-code" key={`${match}-${offset}`}>
          <span className="source-token">`</span>
          {match.slice(1, -1)}
          <span className="source-token">`</span>
        </span>,
      );
    } else {
      const link = match.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      parts.push(
        <span className="source-link" key={`${match}-${offset}`}>
          <span className="source-token">[</span>
          {link?.[1] ?? match}
          <span className="source-token">]({link?.[2] ?? ""})</span>
        </span>,
      );
    }

    cursor = offset + match.length;
    return match;
  });

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
}

function AdminPage({
  deletedPosts,
  drafts,
  onAddTopic,
  onCreateDraft,
  onDeleteDraft,
  onDeletePublishedPost,
  onRestorePublishedPost,
  publishedPosts,
  topics,
}: {
  deletedPosts: Post[];
  drafts: Post[];
  onAddTopic: (topic: string) => void;
  onCreateDraft: (form: DraftForm) => void;
  onDeleteDraft: (slug: string) => void;
  onDeletePublishedPost: (slug: string) => void;
  onRestorePublishedPost: (slug: string) => void;
  publishedPosts: Post[];
  topics: string[];
}) {
  const [form, setForm] = useState<DraftForm>(emptyDraftForm);
  const [newTopic, setNewTopic] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const canSave = form.title.trim().length > 0 && form.body.trim().length > 0;

  const updateForm = (key: keyof DraftForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyDraftForm);
    setNewTopic("");
  };

  const addTopicFromInput = () => {
    const nextTopic = newTopic.trim();

    if (!nextTopic) {
      return;
    }

    onAddTopic(nextTopic);
    updateForm("topic", nextTopic);
    setNewTopic("");
  };

  return (
    <section className="admin-page page-panel" id="admin">
      <div className="admin-heading">
        <p className="section-label">Blog admin</p>
        <h1>写新的博客</h1>
      </div>

      <div className="writing-workbench">
        <form
          className="editor-panel"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSave) {
              onCreateDraft(form);
              resetForm();
            }
          }}
        >
          <div className="editor-toolbar">
            <label>
              <span>标题</span>
              <input value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="新的博客标题" />
            </label>
            <label>
              <span>摘要</span>
              <input value={form.summary} onChange={(event) => updateForm("summary", event.target.value)} placeholder="一句话摘要" />
            </label>
            <label>
              <span>主题</span>
              <select value={form.topic} onChange={(event) => updateForm("topic", event.target.value)}>
                {topics
                  .filter((topic) => topic !== "全部")
                  .map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              <span>新主题</span>
              <div className="topic-composer">
                <input
                  value={newTopic}
                  onChange={(event) => setNewTopic(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTopicFromInput();
                    }
                  }}
                  placeholder="例如：系统设计"
                />
                <button type="button" aria-label="新增主题" onClick={addTopicFromInput}>
                  <Plus size={16} />
                </button>
              </div>
            </label>
          </div>

          <div className="live-markdown-canvas">
            <div className="canvas-toolbar">
              <span>Typora style</span>
              <span>符号可见 / 实时样式</span>
            </div>
            <div className="live-canvas-surface">
              <MarkdownSourceView markdown={form.body} />
              <textarea
                aria-label="Markdown 写作区"
                className="markdown-editor markdown-source-input"
                onChange={(event) => updateForm("body", event.target.value)}
                onScroll={(event) => {
                  const mirror = event.currentTarget.previousElementSibling;
                  if (mirror instanceof HTMLElement) {
                    mirror.style.transform = `translateY(-${event.currentTarget.scrollTop}px)`;
                  }
                }}
                placeholder="用 Markdown 写下你的博客..."
                ref={editorRef}
                spellCheck={false}
                value={form.body}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="primary-action" type="submit" disabled={!canSave}>
              <Save size={17} />
              保存草稿
            </button>
            <button className="secondary-action" type="button" onClick={resetForm}>
              清空
            </button>
          </div>
        </form>

        <div className="manage-panel">
          <div className="manage-section">
            <h2>草稿</h2>
            {drafts.length > 0 ? (
              drafts.map((draft) => (
                <div className="manage-row" key={draft.slug}>
                  <a href={`#draft/${draft.slug}`}>
                    <span>{draft.date}</span>
                    {draft.title}
                  </a>
                  <button type="button" aria-label={`删除 ${draft.title}`} onClick={() => onDeleteDraft(draft.slug)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <p className="empty-copy">暂无草稿</p>
            )}
          </div>

          <div className="manage-section">
            <h2>已发布</h2>
            {publishedPosts.map((post) => (
              <div className="manage-row" key={post.slug}>
                <a href={`#post/${post.slug}`}>
                  <span>{post.date}</span>
                  {post.title}
                </a>
                <button type="button" aria-label={`删除 ${post.title}`} onClick={() => onDeletePublishedPost(post.slug)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {publishedPosts.length === 0 ? <p className="empty-copy">暂无已发布文章</p> : null}
          </div>

          <div className="manage-section">
            <h2>已删除</h2>
            {deletedPosts.length > 0 ? (
              deletedPosts.map((post) => (
                <div className="manage-row restore-row" key={post.slug}>
                  <span>
                    <span>{post.date}</span>
                    {post.title}
                  </span>
                  <button type="button" onClick={() => onRestorePublishedPost(post.slug)}>
                    恢复
                  </button>
                </div>
              ))
            ) : (
              <p className="empty-copy">暂无删除记录</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
