import "../core/utils/utils.js";
import { config } from "../../config.js";
import { modal } from "../page/modal/modal.js";
import { GameManager } from "../core/game/game-manager.js";
import { rotateWinds } from "../core/players/ui/windicator.js";

// import { ClientUIMaster } from "../core/players/ui/client-ui-master.js";

/**
 * This is the function that runs as the very first call
 * when the web page loads: do you want to play a game,
 * or do you want to watch the bots play each other?
 */
(function () {
  // functions are always "hoisted" to above any
  // actual code, so the following lines work,
  // despite the functions being declared "later".
  if (config.PLAY_IMMEDIATELY) play();
  else offerChoice();

  // Forced bot play
  function play() {
    let manager = new GameManager();
    let game = manager.newGame();
    game.startGame(() => {
      document.body.classList.add("finished");
      let gameui = game.players.find((p) => p.ui).ui;
      config.flushLog();
      return modal.showFinalScores(
        gameui,
        game.rules,
        game.scoreHistory,
        () => {
          document.body.classList.remove("finished");
          rotateWinds.reset();
          offerChoice();
        }
      );
    });
  }

  // Optional bot play.
  function offerChoice() {
    const options = [
      { description: "目前提供以下模式：" },
      { label: "我要打麻將！", value: "play" },
      { label: "看電腦自動打", value: "watch" },
      {
        description: "或者修改遊戲設定：",
        align: "center",
      },
      { label: "遊戲設定", value: "settings", back: true },
      { label: "外觀主題", value: "theming", back: true },
      {
        description: "（遊戲中也可以開啟設定）",
        align: "center",
      },
    ];
    options.fixed = true;
    modal.choiceInput(
      "歡迎！請選擇模式",
      options,
      (result) => {
        config.BOT_PLAY = result === "watch";
        if (result === "watch") config.FORCE_OPEN_BOT_PLAY = true;
        if (result === "settings") return modal.pickPlaySettings();
        if (result === "theming") return modal.pickTheming();
        play();
      }
    );
  }
})();
