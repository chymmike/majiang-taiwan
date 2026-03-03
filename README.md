# 🀄 麻將台灣 (majiang-taiwan)

台灣十六張麻將單機練習遊戲，基於 [Pomax/mahjong](https://github.com/Pomax/mahjong) 修改。

**[🎮 點此立即遊玩 (Click to Play)](https://chymmike.github.io/majiang-taiwan/)**

## 特色

- 🎯 **台灣十六張規則** — 16 張手牌、5 面子 + 1 雀頭
- 🧮 **台數制計分** — 底 + 台，完整台數表
- 🤖 **AI 對手** — 3 個 AI 陪你練牌
- 🇹🇼 **全繁體中文** — UI、牌名、結算全中文化
- 🔊 **語音提示** — 加入吃、碰、槓、胡、聽牌等中文語音
- 📱 **介面優化** — 結算台數拆解明細、牌桌及玩家資訊視覺優化
- 🎮 **零安裝** — 純 HTML/CSS/JS，無框架，瀏覽器直接開打

## 台灣規則支援

- ✅ 十六張制（5 面子 + 1 雀頭）
- ✅ 台數制計分（自摸、門清、平胡、碰碰胡、混一色、清一色…）
- ✅ 連莊 / 拉莊（連一拉一）
- ✅ 一炮多響（放炮者全賠）
- ✅ 補花、正花
- ✅ 槓上開花、搶槓胡、海底撈月、河底撈魚
- ✅ 大牌：大小三元、大小四喜、天胡、地胡、字一色

*(由於是單機休閒練習，部分嚴格的實體賭場防作弊或特殊罰符規則可能未完全實作)*

## 快速開始

```bash
# Clone
git clone https://github.com/chymmike/majiang-taiwan.git
cd majiang-taiwan

# 直接用瀏覽器開
open index.html
```

不需要 npm、不需要 build，開瀏覽器就能玩。

## 設定選項

| 設定 | 預設值 | 說明 |
|------|--------|------|
| 底 | 300 | 基本分 |
| 每台 | 100 | 每台金額 |
| 遊戲長度 | 東風戰 | 可選：東風 / 東南 / 全場 |

## 技術

- 純 HTML + CSS + JavaScript
- 無 bundler、無框架
- Fork 自 [Pomax/mahjong](https://github.com/Pomax/mahjong)

## 文件

- [PRD.md](./PRD.md) — 產品需求文件
- [DEVPLAN.md](./DEVPLAN.md) — 開發進程規劃
- [CHANGELIST.md](./CHANGELIST.md) — 改動點清單

## License

沿用原專案授權。
