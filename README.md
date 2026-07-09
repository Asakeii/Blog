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

当前仓库使用 `gh-pages` 分支发布：

1. 在本地执行 `npm run build`。
2. 将 `dist` 目录内容推送到远端 `gh-pages` 分支根目录。
3. 仓库 Settings → Pages 保持 `Deploy from a branch`，分支选择 `gh-pages`，目录选择 `/ (root)`。

当前线上地址是 `https://asakeii.github.io/Blog/`。项目使用相对资源路径构建，所以部署在项目子路径下也可以正常加载前端资源。
