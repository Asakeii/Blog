# Asakei Blog

一个简约、高级、可部署到 GitHub Pages 的个人博客前端。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 修改内容

- 文章数据在 `src/main.tsx` 的 `posts` 数组里。
- 主题标签在 `src/main.tsx` 的 `topics` 数组里。
- 视觉系统在 `src/styles.css` 和 `DESIGN.md` 里。

## 部署到 GitHub Pages

1. 在 GitHub 新建仓库，例如 `asakei-blog` 或 `Asakeii.github.io`。
2. 推送本项目代码到仓库的 `main` 分支。
3. 在仓库 Settings → Pages 中选择 GitHub Actions。
4. 每次推送到 `main` 后，`.github/workflows/deploy.yml` 会自动构建并发布 `dist`。

如果仓库名是 `Asakeii.github.io`，发布地址通常是 `https://asakeii.github.io/`。如果仓库名是 `asakei-blog`，发布地址通常是 `https://asakeii.github.io/asakei-blog/`。

项目使用相对资源路径构建，所以两种 GitHub Pages 地址都可以正常加载前端资源。
