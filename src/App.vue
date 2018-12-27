<template>
  <div id="app">
    <div class="container">
      <h3 class="title">VueTris</h3>
      <input type="button" class="button button-start" value="Start Game" v-if="!isPlaying" v-on:click="isPlaying = true; gameOver = false;">
      <input type="button" class="button button-pause" value="Pause Game" v-if="isPlaying && !gameOver" v-on:click="isPlaying = false">
    </div>
    <div class="container game-container">
      <Board v-on:user-scores="updateScore" ref="board" v-on:game-over="onGameOver" v-bind:is-playing="isPlaying || gameOver" />
      <div class="information" v-if="isPlaying">
        Score: {{ score }}
      </div>
      <div class="game-over-wrapper" v-if="gameOver">
        <h2 class="game-over">Game Over</h2>
        <input type="button" class="button button-restart" value="Restart Game" v-if="gameOver" v-on:click="restartGame">
      </div>
    </div>
  </div>
</template>

<script>
import Board from './components/Board.vue'

export default {
  name: 'app',
  components: {
    Board
  },
  data: function () {
    return {
      isPlaying: false,
      gameOver: false,
      score: 0
    };
  },
  methods: {
    onGameOver: function () {
      this.gameOver = true;
    },
    restartGame: function () {
      this.$refs.board.resetGameState();

      this.isPlaying = true;
      this.gameOver = false;
      this.score = 0;

      this.$refs.board.startGame();
    },
    updateScore: function (additionalScore) {
      this.score = this.score + additionalScore;
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.container {
  align-items: center;
  display: flex;
  justify-content: center;
}

.game-container {
  align-items: flex-start;
}

.information {
  margin-left: 25px;
}

.title {
  display: flex;
  margin-right: 15pt;
  max-width: 45vw;
}

.game-over-wrapper {
  background: rgba(128, 128, 128, 0.75);
  padding: 50px 0;
  position: absolute;
  top: 50vh;
  width: 80%;
}

.game-over {
  animation: blinker 5s linear infinite;
  color: red;
  display: inline-block;
  margin: 0;
  position: relative;
  top: 50%;
  width: 100%;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}

.button {
  border: 0;
  color: #FFF;
  display: flex;
  padding: 7px 21px;
}

.button:hover {
  cursor: pointer;
}

.button-start {
  background: rgba(0, 0, 255, 0.7);
}

.button-pause {
  background: rgba(255, 0, 0, 0.7);
}

.button-restart {
  background: rgba(0, 100, 0, 0.7);
  display: inline-block;
  margin-top: 7px;
}
</style>
