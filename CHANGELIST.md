# 改動點清單（13張 → 16張台灣麻將）

基於 Pomax/mahjong 原始碼分析，以下是需要修改的檔案和具體位置。

---

## 🔴 核心改動（必須改）

### 1. `src/js/core/game/game.js` (670 lines)
- **L221** `wall.get(13)` → `wall.get(16)` — 發牌張數
- **L103-205** `startHand()` — 連莊/過莊邏輯需改（目前只看 wind rotation）
- **L108-133** 風位輪轉 — 需加入連莊判定（莊家胡=不過莊）
- **L118** `windOfTheRound === 4` 結束遊戲 — 需支援東風戰/東南場設定
- **L462** 流局處理 — 需加入聽牌連莊判定
- **L527-577** `processWin()` — 需支援一炮多響（目前只處理一個 winner）
- **L613-652** `getAllClaims()` — 需修改：多家胡時全部都胡，不是只取最高

### 2. `src/js/core/algorithm/tiles-needed.js` (150 lines)
- **L122** `scount = 4` → `scount = 5` — 從 4 面子改為 5 面子
- `Pattern` 類別的 expand 演算法也可能需要改（看 `pattern.js`）

### 3. `src/js/core/algorithm/pattern.js`
- 核心牌型拆解演算法 — 需確認是否硬編碼了「最多 4 面子」的限制

### 4. `src/js/core/scoring/` — 新增台灣規則
- **新增** `taiwanese.js` — `TaiwaneseClassical extends Ruleset`
- `ruleset.js` L20-53 constructor — 台灣規則的參數設定
- `ruleset.js` L124-183 `settleScores()` — 需改：自摸三家付、放炮獨付、一炮多響

### 5. `src/config.js` (378 lines)
- **L1-5** 加入 `import "./js/core/scoring/taiwanese.js"`
- **L164-208** `TILE_NAMES` — 改為繁中
- **L245-264** `SUIT_NAMES` — 改為繁中
- 新增設定：底/台金額、遊戲長度（東風/東南/全場）

---

## 🟡 需要調整的檔案

### 6. `src/js/core/players/player.js`
- 手牌上限檢查（如果有 hardcoded 13）
- 勝利判定邏輯

### 7. `src/js/core/players/bot.js`
- AI 決策邏輯 — 可能需要適配 16 張
- 聽牌計算需配合新的面子數

### 8. `src/js/core/game/wall/wall.js`
- 牌墩計算（144 張分配 16×4 人）

### 9. `src/js/page/modal/settings.js`
- 新增台灣規則選項
- 新增底/台設定 UI

### 10. `src/js/page/modal/scores.js`
- 結算畫面 — 顯示台數拆解

---

## 🟢 文字替換（中文化）

### 11. `index.html`
- 頁面文字翻譯

### 12. `src/js/page/` 相關檔案
- UI 提示文字（吃/碰/槓/胡/過）
- 設定選單文字

### 13. `src/config.js` TILE_NAMES & SUIT_NAMES
- 牌名和花色名中文化

---

## 📊 改動規模預估

| 類別 | 檔案數 | 難度 |
|------|--------|------|
| 核心演算法 | 3-4 | ⭐⭐⭐⭐⭐ |
| 計分引擎 | 2 (新+改) | ⭐⭐⭐⭐ |
| 遊戲流程 | 1-2 | ⭐⭐⭐ |
| UI/中文化 | 4-5 | ⭐⭐ |
| **總計** | **~13 檔** | |
