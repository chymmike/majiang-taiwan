import { config } from "../../../config.js";
import { Ruleset } from "./ruleset.js";

/**
 * Taiwan 16-tile mahjong rules (台灣十六張麻將).
 *
 * Scoring: 底 + 台 system (base + tai).
 * Formula: winner receives (BASE_SCORE + TAI_SCORE × tai_count)
 *   - Self-draw: all 3 losers pay
 *   - Discard win: only discarder pays
 *   - Dealer (莊家) adds 1 tai
 */
class TaiwanClassical extends Ruleset {

    constructor() {
        super(
            Ruleset.TAIWAN_BASE_TAI,
            0,      // start score (台灣通常從 0 開始計)
            9999,   // limit (set high, we don't use points/doubles limit)
            0,      // points for winning (handled via tai)
            false,  // no-point hand (屁胡 still gets base)
            false,  // losers do NOT settle scores among themselves
            false,  // east does NOT double up (handled via tai)
            false,  // selfdraw does NOT pay double (handled via tai)
            false,  // discarder does NOT pay double (handled via tai)
            false,  // wind direction: counter-clockwise (default)
            false   // deal does not pass when east wins (莊家胡牌連莊)
        );
    }

    // ===== Individual set scoring =====
    // Taiwan scoring doesn't award points per-set like Chinese Classical.
    // All scoring is done via tai in checkWinnerHandPatterns.

    getPairValue(tile, locked, concealed, names, windTile, windOfTheRoundTile) {
        // No per-pair points in Taiwan rules
        return undefined;
    }

    getChowValue(tile, locked, concealed, names, windTile, windOfTheRoundTile) {
        // No per-chow points
        return undefined;
    }

    getPungValue(tile, locked, concealed, names, windTile, windOfTheRoundTile) {
        // No per-pung points (tai counted in checkWinnerHandPatterns)
        return undefined;
    }

    getKongValue(tile, locked, concealed, names, windTile, windOfTheRoundTile) {
        // No per-kong points (tai counted in checkWinnerHandPatterns)
        return undefined;
    }

    /**
     * Bonus tile scoring for Taiwan rules.
     * Each flower/season = 1 tai.
     * All 4 flowers (花槓) = bonus 2 tai.
     * All 4 seasons (花槓) = bonus 2 tai.
     * All 8 (八仙過海) = 8 tai total (replaces individual).
     */
    checkBonusTilePoints(bonus, windTile, names, result) {
        if (!result.tai) result.tai = 0;

        let allF = this.allFlowers(bonus);
        let allS = this.allSeasons(bonus);

        if (allF && allS) {
            // 八仙過海: 8 tai
            result.tai += 8;
            result.log.push(`8 台 八仙過海`);
            return;
        }

        // Individual flower/season tiles: 1 tai each
        bonus.forEach(tile => {
            result.tai += 1;
            result.log.push(`1 台 花牌 (${names[tile]})`);
        });

        // 花槓 (all 4 flowers or all 4 seasons)
        if (allF) {
            result.tai += 2;
            result.log.push(`2 台 花槓 (四季齊)`);
        }
        if (allS) {
            result.tai += 2;
            result.log.push(`2 台 花槓 (四君子齊)`);
        }
    }

    /**
     * Non-winner hand patterns (applicable to all players).
     * Taiwan rules: losers don't settle, so this is mostly a no-op.
     */
    checkHandPatterns(scorePattern, windTile, windOfTheRoundTile, tilesLeft, scoreObject) {
        // No scoring for non-winners in Taiwan rules
    }

    /**
     * Calculate tai (台) for the winner.
     * This is the core of Taiwan scoring.
     */
    checkWinnerHandPatterns(scorePattern, winset, selfdraw, selftile, robbed, windTile, windOfTheRoundTile, tilesLeft, scoreObject) {
        let names = config.TILE_NAMES;
        let state = this.getState(scorePattern, winset, selfdraw, selftile, robbed, windTile, windOfTheRoundTile, tilesLeft);

        if (!scoreObject.tai) scoreObject.tai = 0;

        // ─── 基本台數 ───

        // 自摸 + 門清 combo check
        let isMenqing = (state.concealedCount === (config.REQUIRED_SETS + 1));

        if (isMenqing && state.selfdraw) {
            // 門清自摸: 3 tai (不與單獨的自摸/門清重計)
            scoreObject.tai += 3;
            scoreObject.log.push(`3 台 門清自摸`);
        } else {
            if (state.selfdraw) {
                scoreObject.tai += 1;
                scoreObject.log.push(`1 台 自摸`);
            }
            if (isMenqing) {
                scoreObject.tai += 1;
                scoreObject.log.push(`1 台 門清`);
            }
        }

        // 莊家: 1 tai
        if (windTile === 27) { // East = 27
            scoreObject.tai += 1;
            scoreObject.log.push(`1 台 莊家`);
        }

        // ─── 平胡 (all chows, no honours, not selfdraw, not waiting on pair) ───
        if (state.chowhand && !state.majorPair && !state.honours && !state.selfdraw && !state.outonPair) {
            scoreObject.tai += 2;
            scoreObject.log.push(`2 台 平胡`);
        }

        // ─── 碰碰胡 (all pungs/kongs) ───
        if (state.punghand) {
            scoreObject.tai += 4;
            scoreObject.log.push(`4 台 碰碰胡`);
        }

        // ─── 花色 ───
        if (state.onesuit) {
            if (state.allhonours) {
                // 字一色: 16 tai
                scoreObject.tai += 16;
                scoreObject.log.push(`16 台 字一色`);
            } else if (state.honours) {
                // 混一色: 4 tai
                scoreObject.tai += 4;
                scoreObject.log.push(`4 台 混一色`);
            } else {
                // 清一色: 8 tai
                scoreObject.tai += 8;
                scoreObject.log.push(`8 台 清一色`);
            }
        }

        // ─── 三元牌 ───
        let dragonTotal = state.dragonPungCount + state.dragonKongCount;

        // Individual dragon pungs/kongs: 1 tai each
        scorePattern.forEach(set => {
            let tiles = set.tiles();
            let tile = tiles[0];
            if (tile > 30 && tiles.length >= 3 && tile === tiles[1]) {
                scoreObject.tai += 1;
                scoreObject.log.push(`1 台 三元牌刻子 (${names[tile]})`);
            }
        });

        if (dragonTotal === 3) {
            // 大三元: 8 tai
            scoreObject.tai += 8;
            scoreObject.log.push(`8 台 大三元`);
        } else if (dragonTotal === 2 && state.dragonPair) {
            // 小三元: 4 tai
            scoreObject.tai += 4;
            scoreObject.log.push(`4 台 小三元`);
        }

        // ─── 四喜 ───
        let windTotal = state.windPungCount + state.windKongCount;

        if (windTotal === 4) {
            // 大四喜: 8 tai
            scoreObject.tai += 8;
            scoreObject.log.push(`8 台 大四喜`);
        } else if (windTotal === 3 && state.windPair) {
            // 小四喜: 4 tai
            scoreObject.tai += 4;
            scoreObject.log.push(`4 台 小四喜`);
        }

        // ─── 風牌刻子 ───
        if (state.ownWindPung || state.ownWindKong) {
            scoreObject.tai += 1;
            scoreObject.log.push(`1 台 門風刻`);
        }
        if (state.wotrPung || state.wotrKong) {
            scoreObject.tai += 1;
            scoreObject.log.push(`1 台 圈風刻`);
        }

        // ─── 槓 ───
        scorePattern.forEach(set => {
            let tiles = set.tiles();
            if (tiles.length === 4) {
                if (set.concealed) {
                    scoreObject.tai += 2;
                    scoreObject.log.push(`2 台 暗槓 (${names[tiles[0]]})`);
                } else {
                    scoreObject.tai += 1;
                    scoreObject.log.push(`1 台 明槓 (${names[tiles[0]]})`);
                }
            }
        });

        // ─── 暗刻計數 ───
        let concealedPungCount = 0;
        scorePattern.forEach(set => {
            let tiles = set.tiles();
            let tile = tiles[0];
            if (tiles.length >= 3 && tile === tiles[1] && (!set.locked || set.concealed)) {
                concealedPungCount++;
            }
        });

        if (concealedPungCount === 3) {
            scoreObject.tai += 2;
            scoreObject.log.push(`2 台 三暗刻`);
        } else if (concealedPungCount === 4) {
            scoreObject.tai += 5;
            scoreObject.log.push(`5 台 四暗刻`);
        } else if (concealedPungCount >= 5) {
            scoreObject.tai += 8;
            scoreObject.log.push(`8 台 五暗刻`);
        }

        // ─── 搶槓 ───
        if (state.robbed) {
            scoreObject.tai += 1;
            scoreObject.log.push(`1 台 搶槓`);
        }

        // ─── 海底 ───
        if (state.lastTile) {
            scoreObject.tai += 1;
            if (state.selfdraw) {
                scoreObject.log.push(`1 台 海底撈月`);
            } else {
                scoreObject.log.push(`1 台 河底撈魚`);
            }
        }

        // ─── 全求人 (all locked, win on discard) ───
        if (state.concealedCount === 1 && !state.selfdraw) {
            scoreObject.tai += 2;
            scoreObject.log.push(`2 台 全求人`);
        }
    }

    /**
     * Override limit hand checking for 16-tile.
     * Thirteen orphans (十三么) requires exactly 14 tiles — not applicable.
     * Nine gates (九蓮寶燈) also requires 14 tiles — not applicable.
     */
    checkForLimit(allTiles, lockedSize) {
        // These limit hands don't apply to 16-tile mahjong
        return undefined;
    }

    /**
     * Override getTileScore to use tai-based scoring.
     */
    getTileScore(scorePattern, windTile, windOfTheRoundTile, bonus, winset, winner, selfdraw, selftile, robbed, tilesLeft) {
        let names = config.TILE_NAMES;

        // Start with empty result
        let result = { score: 0, doubles: 0, tai: 0, log: [], total: 0 };
        result.wind = windTile;
        result.wotr = windOfTheRoundTile;

        // Bonus tiles (花牌)
        this.checkBonusTilePoints(bonus, windTile, names, result);

        // Hand patterns for non-winners
        this.checkHandPatterns(scorePattern, windTile, windOfTheRoundTile, tilesLeft, result);

        if (winner) {
            // Winner-specific patterns (all the tai calculation)
            this.checkWinnerHandPatterns(scorePattern, winset, selfdraw, selftile, robbed, windTile, windOfTheRoundTile, tilesLeft, result);
        }

        // Convert tai to total score: 底 + 台 × 台數
        let base = config.BASE_SCORE || 300;
        let taiValue = config.TAI_SCORE || 20;
        result.total = base + (result.tai * taiValue);

        result.log.push(`── 合計 ${result.tai} 台 ──`);
        result.log.push(`得分: ${base}底 + ${result.tai}台 × ${taiValue} = ${result.total}`);

        return result;
    }

    /**
     * Override settleScores for Taiwan rules:
     * - Self-draw: all 3 losers each pay the full amount
     * - Discard win: only the discarder pays
     */
    settleScores(scores, winningplayer, eastplayer, discardpid) {
        console.debug(`%c台灣結算`, `color: red`);

        let adjustments = [0, 0, 0, 0];
        let wscore = scores[winningplayer].total;
        let selfdraw = (discardpid === false);

        if (selfdraw) {
            // 自摸: 三家各付
            for (let i = 0; i < 4; i++) {
                if (i === winningplayer) continue;
                adjustments[winningplayer] += wscore;
                adjustments[i] -= wscore;
                console.debug(`${winningplayer} 從 ${i} 收 ${wscore}`);
            }
        } else {
            // 放槍: 放槍者付
            adjustments[winningplayer] += wscore;
            adjustments[discardpid] -= wscore;
            console.debug(`${winningplayer} 從 ${discardpid} (放槍) 收 ${wscore}`);
        }

        return adjustments;
    }
}

// Register as a ruleset
Ruleset.register(TaiwanClassical);

export { TaiwanClassical };
