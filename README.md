# 寄吧人法环 Demo

一个恶搞魂系横版动作小游戏 Demo。

本项目使用 `Vite + React + TypeScript + Phaser 3 + Zustand + Howler + GSAP + Electron` 制作。游戏主体是浏览器可运行的 Phaser 动作游戏，外层 React 负责菜单、HUD、暂停、胜负界面；也可以通过 Electron 打包成 Windows 可执行版本。

## 快速游玩

如果你只是想从 GitHub 下载下来玩，推荐按下面步骤来。

### 1. 安装运行环境

需要先安装：

- Node.js 18 或更高版本，推荐 Node.js 20+
- Git

安装完成后，在终端里确认：

```bash
node -v
npm -v
git --version
```

### 2. 下载项目

```bash
git clone https://github.com/18833580325/jiba_ring.git
cd jiba_ring
```

### 3. 安装依赖

```bash
npm install
```

第一次安装会下载 Phaser、React、Electron 等依赖，时间取决于网络环境。

### 4. 启动游戏

```bash
npm run dev
```

启动成功后，终端会显示类似：

```text
Local: http://localhost:5173/
```

用浏览器打开这个地址即可游玩。如果 `5173` 被占用，Vite 会自动换成其他端口，以终端显示为准。

## Windows 桌面版

### 本地运行 Electron 外壳

如果想以桌面窗口形式运行：

```bash
npm run build:web
npm run desktop:start
```

这会先构建网页资源，再用 Electron 打开游戏窗口。

### 打包 Windows EXE

```bash
npm run build:exe
```

正常情况下，打包产物会输出到：

```text
release/electron/
```

注意：Electron 打包需要下载 Electron 运行时。如果网络环境较慢，可以先设置 Electron 镜像后再安装或打包：

```bash
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
npm install
npm run build:exe
```

打包后的游戏不要只发送单独的 `.exe` 文件给朋友。Electron 游戏通常依赖同目录下的资源文件，建议把整个 `win-unpacked` 文件夹压缩后发送。

## 网页部署

### 构建静态网页

```bash
npm run build
```

构建完成后，静态文件会生成到：

```text
dist/
```

可以把 `dist/` 部署到任意静态网站服务。

### 部署到 Vercel

1. 在 Vercel 导入 GitHub 仓库。
2. Framework Preset 选择 `Vite`。
3. Build Command 使用：

```bash
npm run build
```

4. Output Directory 使用：

```text
dist
```

### 部署到 Netlify

1. 在 Netlify 导入 GitHub 仓库。
2. Build command：

```bash
npm run build
```

3. Publish directory：

```text
dist
```

### 部署到 GitHub Pages

如果仓库不是部署在域名根路径，而是类似：

```text
https://用户名.github.io/仓库名/
```

需要在 `vite.config.ts` 中配置 `base`：

```ts
export default defineConfig({
  base: "/jiba_ring/",
  plugins: [react()]
});
```

然后构建并发布 `dist/`。

## 游戏玩法

### 基本目标

玩家扮演一名无名褪火者，在黄金废墟中前进，清理路上的敌人，最后挑战守门 Boss。游戏流程是横版动作关卡，包含地面敌人、飞行敌人、特殊防御敌人和 Boss 战。

### 操作方式

| 操作 | 按键 |
| --- | --- |
| 左右移动 | `A / D` 或方向键左右 |
| 跳跃 | `W`、方向键上或 `Space` |
| 翻滚闪避 | `Shift` |
| 普通魔法射击 | `J` 或鼠标左键 |
| 重魔法射击 | `K` 或鼠标右键 |
| 召回仓鼠使魔 | `L / Q` |
| 释放大招 | `R / F` |
| 喝药回血 | `I / E` |
| 暂停 | `ESC / P` |

### 战斗资源

- HP：归零后游戏失败。
- 耐力：移动、翻滚、施法会消耗或影响节奏，停止高强度行动后会恢复。
- 能量：攻击命中敌人后积累，满能量可以释放大招。
- 圣瓶：有限次数回血。
- 使魔血量：仓鼠使魔会自动攻击敌人，也会受到伤害。

### 使魔系统

玩家身边有一只自动战斗的仓鼠使魔。它会：

- 跟随玩家移动。
- 自动锁定附近敌人。
- 发射使魔弹幕。
- 被敌人攻击时会掉血。
- 玩家释放大招时，使魔会回复血量并提高输出节奏。

### 敌人类型

#### 普通敌人

基础近战小怪，会巡逻、靠近玩家并进行短距离攻击。

#### 飞天虫

空中飞行的小型敌人。它会在空中盘旋，玩家靠近后追踪骚扰。飞天虫不受地形限制，适合用远程魔法快速处理。

#### 坚果怪

高防御地面敌人。普通魔法对它伤害很低，但它有明显的硬壳头顶，可以被玩家从上方踩碎。

踩头方式：

1. 跳到坚果怪上方。
2. 下落时碰到坚果怪头顶。
3. 坚果怪会被直接击破，玩家会反弹起跳。

#### Boss

第一关 Boss 是守门重骑士。它拥有多种攻击：

- 横扫
- 冲锋
- 践踏
- 回身斩
- 震荡波
- 二阶段连招

Boss 半血后会进入二阶段，攻击频率和压迫感提高。建议保留圣瓶和大招，在二阶段集中输出。

## 角色设计说明

### 主角：无名褪火者

主角是一个黑白粉配色的暗黑幻想召唤师少女：

- 银白短发，发梢带粉色渐变。
- 黑色贝雷帽。
- 黑色哥特风外衣与白色宽袖。
- 袖口和发饰带有花朵元素。
- 使用粉色魔法弹幕攻击。
- 战斗风格偏灵巧，依靠翻滚、远程施法和使魔配合取胜。

角色动作帧包括：

- 待机
- 奔跑
- 普通射击
- 重魔法 / 大招施法
- 翻滚闪避
- 受击 / 疲惫

### 仓鼠使魔

仓鼠使魔是主角的自动战斗伙伴。它承担“副武器”和“陪伴感”的作用，让玩家即使在走位和闪避时也能保持一定输出。

### 怪物美术方向

游戏怪物整体走“恶搞魂系 + 可爱暗黑”的方向：

- 普通怪偏腐化士兵感。
- 飞天虫偏黑甲蛾虫，带粉色魔法污染。
- 坚果怪偏硬壳防御单位，读图时要让玩家直觉知道“这东西很硬，但能踩”。
- Boss 体型大、动作慢但攻击范围广，强调魂系 Boss 的压迫感。

## 项目结构

```text
src/
  App.tsx                 React 应用入口
  game/
    GameScene.ts          Phaser 主场景，包含关卡、战斗和 Boss 逻辑
    Player.ts             玩家状态与动作
    Enemy.ts              普通敌人
    FlyingBug.ts          飞天虫敌人
    NutEnemy.ts           坚果怪敌人
    Boss.ts               Boss 状态
    Familiar.ts           仓鼠使魔
    Projectile.ts         弹幕
    constants.ts          游戏常量
  store/
    gameStore.ts          Zustand 全局状态
  ui/
    HUD.tsx               血条、耐力、Boss 血条等 UI
    MainMenu.tsx          主菜单
    PauseMenu.tsx         暂停菜单
    GameOver.tsx          失败界面
    VictoryScreen.tsx     胜利界面

public/
  sprites/                普通敌人、Boss 等素材
  summoner/               主角、使魔、大招 CG 素材
  enemies/                新增飞天虫和坚果怪素材
  images/                 背景图

electron/
  main.cjs                Electron 桌面窗口入口
```

## 常见问题

### npm install 很慢怎么办？

可以换 npm 镜像源：

```bash
npm config set registry https://registry.npmmirror.com
npm install
```

如果是 Electron 下载慢，可以设置：

```bash
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
npm install
```

### 运行时页面空白怎么办？

先确认依赖安装成功：

```bash
npm install
```

再重新启动：

```bash
npm run dev
```

如果浏览器地址不是 `5173`，以终端显示的地址为准。

### 修改后如何重新打包？

```bash
npm run build
```

如果要更新桌面版：

```bash
npm run build:exe
```

## 开发说明

这是一个 Demo 项目，重点是快速验证恶搞魂系横版动作玩法。当前仍有继续扩展空间：

- 更完整的多关卡流程
- 更细的 Boss 招式动画
- 音效和音乐替换
- 更多敌人类型
- 存档、设置、键位修改
- 更完整的打包自动化
