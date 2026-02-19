import { config } from "../../../config.js";
import { Ruleset } from "../../core/scoring/ruleset.js";
import { WallHack } from "../../core/game/wall/wall-hack.js";

class SettingsModal {
  constructor(modal) {
    this.modal = modal;
  }

  show() {
    let panel = this.modal.makePanel(`settings`);
    panel.innerHTML = `
      <h3>遊戲設定</h3>
      <p>
        前三個為遊戲選項，其餘為除錯用。
      </p>
    `;
    const options = this.getOptions();
    const form = this.modal.buildPanelContent(options, true);
    form.setAttribute("name", "settings");
    form.setAttribute("action", "index.html");
    form.setAttribute("method", "GET");
    this.addFormControls(panel, form, options);
    this.modal.addFooter(panel, "關閉（不儲存）");
  }

  addFormControls(panel, form, options) {
    const table = form.querySelector(`table`);
    let row = document.createElement(`tr`);
    row.classList.add(`spacer-1`);
    row.innerHTML = `
      <td>
        <input id="reset" type="reset" value="恢復預設">
      </td>
      <td>
        <input id="ok" type="submit" value="使用這些設定開始">
      </td>
    `;
    table.appendChild(row);

    form.addEventListener(`submit`, (evt) => {
      evt.preventDefault();
      let suffix = options
        .filter((e) => e.value != e.default_value)
        .map((e) => `${e.key}=${e.value}`)
        .join("&");
      globalThis.location.search = suffix ? `?${suffix}` : ``;
    });

    let ok = table.querySelector(`#ok`);
    panel.gainFocus = () => ok.focus();

    let reset = table.querySelector(`#reset`);
    reset.addEventListener("click", (evt) => (globalThis.location.search = ""));
  }

  getOptions() {
    const options = [
      {
        label: `規則`,
        key: `rules`,
        options: [...Ruleset.getRulesetNames()],
      },
      {
        // basic boolean flags:
      },
      {
        label: `🀄 顯示所有玩家手牌`,
        key: `force_open_bot_play`,
        toggle: true,
      },
      {
        label: `✨ 標示可吃碰的牌`,
        key: `show_claim_suggestion`,
        toggle: true,
      },
      {
        label: `💬 顯示電腦建議`,
        key: `show_bot_suggestion`,
        toggle: true,
      },
      {
        // additional boolean flags:
      },
      {
        label: `🎵 音效`,
        key: `use_sound`,
        toggle: true,
      },
      {
        label: `🟢 直接開始遊戲`,
        key: `play_immediately`,
        toggle: true,
      },
      {
        label: `⏸️ 非聚焦時暫停`,
        key: `pause_on_blur`,
        toggle: true,
      },
      {
        label: `💻 除錯模式`,
        key: `debug`,
        toggle: true,
      },
      {
        label: `❌ 模擬上局流局`,
        key: `force_draw`,
        toggle: true,
        debug_only: true,
      },
      {
        label: `📃 結束後產生記錄檔`,
        key: `write_game_log`,
        toggle: true,
        debug_only: true,
      },
      {
        // numerical values:
      },
      {
        label: `亂數種子`,
        key: `seed`,
        debug_only: true,
      },
      {
        label: `電腦快速出牌門檻`,
        key: `bot_chicken_threshold`,
        debug_only: true,
      },
      {
        label: `每手間隔 (毫秒)`,
        key: `play_interval`,
      },
      {
        label: `每局間隔 (毫秒)`,
        key: `hand_interval`,
      },
      {
        label: `電腦反應延遲 (毫秒)`,
        key: `bot_delay_before_discard_ends`,
      },
      {
        label: `電腦自動打延遲 (毫秒)`,
        key: `bot_play_delay`,
      },
      // and debug hacking
      {
        label: `指定牌山`,
        key: `wall_hack`,
        options: [``, ...Object.keys(WallHack.hacks)],
        debug_only: true,
      },
    ];

    options.forEach((entry) => {
      const { key } = entry;
      if (key) {
        const CONFIG_KEY = key.toUpperCase();
        entry.value = config[CONFIG_KEY];
        entry.default_value = config.DEFAULT_CONFIG[CONFIG_KEY];
      }
    });
    return options;
  }
}

export { SettingsModal };
