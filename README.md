# 寄吧人法环 Demo

一个使用 `Vite + React + TypeScript + Phaser 3 + Zustand + Howler + GSAP` 制作的横版魂系动作小游戏 Demo。

## 本地运行

```bash
npm install
npm run dev
```

## 打包

```bash
npm run build
```

构建完成后，静态文件位于 `dist/`，可直接部署到：

- GitHub Pages
- Vercel
- Netlify

## 打包为 Windows EXE

```bash
npm install
npm run build:exe
```

生成后的桌面可执行文件位于 `release/electron/jibaren-ring-demo-portable.exe`。

也可以先单独构建网页资源，再本地直接启动 Electron 外壳：

```bash
npm run build:web
npm run desktop:start
```

## 部署建议

### GitHub Pages

1. 推送仓库到 GitHub
2. 使用 GitHub Actions 或任意静态部署方式发布 `dist/`
3. 如果仓库不是根域部署，请在 `vite.config.ts` 中补 `base: "/你的仓库名/"`

### Vercel

1. 导入仓库
2. Framework 选择 `Vite`
3. Build Command: `npm run build`
4. Output Directory: `dist`

### Netlify

1. 导入仓库
2. Build Command: `npm run build`
3. Publish directory: `dist`

## 玩法说明

- `A / D / ← / →`：移动
- `W / ↑ / Space`：跳跃
- `Shift`：翻滚
- `J / 鼠标左键`：普通攻击
- `K / 鼠标右键`：重攻击 / 拉弓
- `L / Q`：切换武器
- `I / E`：喝药
- `ESC / P`：暂停
