# Assets

本 Demo 主要使用 Phaser Graphics 程序化绘制角色、Boss、背景和刀光。

如果后续要替换为正式素材，建议按下面分类补充：

- `characters/`: 玩家、小怪、Boss 动画图集
- `effects/`: 刀光、冲击波、命中特效
- `audio/`: attack、hit、dodge、arrow、boss_roar、phase_two、victory、death
- `ui/`: 标题图、按钮装饰、章节插图

当前音频由 `src/game/audio.ts` 提供空实现占位，替换音频文件后可直接接入。
