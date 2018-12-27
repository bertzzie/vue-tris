<template>
  <canvas ref="board"
          tabindex="1"
          v-bind:width="canvasWidth"
          v-bind:height="canvasHeight"
          v-on:keydown.left="currentPieceMoveLeft"
          v-on:keydown.right="currentPieceMoveRight"
          v-on:keyup.r="currentPieceRotate">
    <Piece v-bind:canvas-context="currentPiece.canvasContext"
           v-bind:gridSize="size.grid"
           v-bind:position="currentPiece.position"
           v-bind:rotation="currentPiece.rotation"
           v-bind:shape="currentPiece.shape"
           ref="currentPiece"></Piece>
  </canvas>
</template>

<script>
  import Piece from './Piece';
  import PieceInfo from "./constants/PieceInfo";
  import ArrayLibs from './lib/ArrayLibs';

  const INITIAL_STATE = {
    blocks: [],
    currentPiece: {
      canvasContext: undefined,
      position: { x: 3, y: 0 },
      rotation: 0,
      shape: PieceInfo.randomShapes()
    },
    gameTickTimeoutID: 0
  };

  export default {
    name: "Board",
    components: {
      Piece
    },
    data: function () {
      return INITIAL_STATE;
    },
    props: {
      dropInterval: {
        type: Number,
        default: function () {
          return 200;
        }
      },
      isPlaying: {
        type: Boolean,
        default: function () {
          return false;
        }
      },
      size: {
        type: Object,
        default: function () {
          return { width: 10, height: 24, grid: 20 };
        }
      }
    },
    computed: {
      canvasHeight: function () {
        return this.size.height * this.size.grid;
      },
      canvasWidth: function () {
        return this.size.width * this.size.grid;
      }
    },
    methods: {
      resetGameState: function () {
        this.blocks = [];
        this.currentPiece = Object.assign({}, this.currentPiece, INITIAL_STATE.currentPiece);
      },
      resetBoard: function () {
        this.clearBoard();
        this.drawBoard();
      },
      resetCurrentPiece() {
        this.currentPiece = Object.assign({}, this.currentPiece, {
          position: { x: 3, y: 0 },
          rotation: 0,
          shape: PieceInfo.randomShapes()
        });
      },
      startGame: function () {
        this.currentPiece.canvasContext = this.drawBoard();

        this.gameTickTimeoutID = window.setInterval(this.gameLoop, this.dropInterval);

        this.$refs.board.focus();
      },
      stopGame: function () {
        if (this.gameTickTimeoutID) {
          window.clearInterval(this.gameTickTimeoutID);
          this.$emit('game-over');
        }
      },
      isGameOver: function () {
        return this.blocks.filter(block => block.y === 0).length > 0;
      },
      gameLoop: function () {
        this.resetBoard();

        if (this.blockCollides()) {
          this.buildBlock();

          if (this.isGameOver()) {
            this.stopGame();
            this.resetBoard();
            return ;
          }

          this.clearLines();
          this.resetBoard();
          this.resetCurrentPiece();
          return;
        }

        this.currentPiece.position = Object.assign({}, this.currentPiece.position, {
          y: this.currentPiece.position.y + 1
        });
      },
      clearLines: function () {
        const groupedBlocks = ArrayLibs.groupBy(this.blocks, pos => pos.y);
        const lines = Array.from(groupedBlocks.keys())
          .filter(key => groupedBlocks.get(key).length === 10);

        let newBlocks = this.blocks.filter(block => lines.indexOf(block.y) < 0);
        const score = Math.floor((this.blocks.length - newBlocks.length) / 10);
        if (score > 0) {
          const highestLine = Math.max(...lines);
          newBlocks = newBlocks.map(block => {
            if (block.y < highestLine) { // < because we use left hand coordinate
              return Object.assign({}, block, { y: block.y + score });
            }

            return block;
          });

          this.$emit('user-scores', score);
        }

        this.blocks = newBlocks;
      },
      buildBlock: function () {
        const newBlock = this.$refs.currentPiece.getShapeBoundaries();
        this.blocks = this.blocks.concat(newBlock);
      },
      isNextTickCollides: function (transformer) {
        return this.$refs.currentPiece.getShapeBoundaries()
          .map(transformer)
          .filter(s => this.blocks.filter(b => b.y === s.y && b.x === s.x).length > 0)
          .length > 0;
      },
      blockCollides: function () {
        return this.bottomMostShapePosition() + 1 === this.size.height ||
               this.isNextTickCollides(v => ({ x: v.x, y: v.y + 1}));
      },
      bottomMostShapePosition: function () {
        const shapeBoundaries = this.$refs.currentPiece.getShapeBoundaries();

        return Math.max(...shapeBoundaries.map(v => v.y));
      },
      leftMostShapePosition: function () {
        const shapeBoundaries = this.$refs.currentPiece.getShapeBoundaries();

        return Math.min(...shapeBoundaries.map(v => v.x));
      },
      rightMostShapePosition: function () {
        const shapeBoundaries = this.$refs.currentPiece.getShapeBoundaries();

        return Math.max(...shapeBoundaries.map(v => v.x));
      },
      clearBoard: function () {
        const context = this.getContext();
        if (!context) {
          return;
        }

        context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      },
      currentPieceMoveLeft: function () {
        if (this.leftMostShapePosition() === 0 || this.isNextTickCollides(v => ({ x: v.x - 1, y: v.y }))) {
          return ;
        }

        this.resetBoard();
        this.currentPiece.position = Object.assign({}, this.currentPiece.position, {
          x: this.currentPiece.position.x - 1
        });
      },
      currentPieceMoveRight: function () {
        // +1 because we calculate for next move
        if (this.rightMostShapePosition() + 1 === this.size.width ||
            this.isNextTickCollides(v => ({ x: v.x + 1, y: v.y }))) {
          return ;
        }

        this.resetBoard();
        this.currentPiece.position = Object.assign({}, this.currentPiece.position, {
          x: this.currentPiece.position.x + 1
        });
      },
      currentPieceRotate: function () {
        this.resetBoard();
        this.currentPiece.rotation = (this.currentPiece.rotation + 90) % 360;
      },
      drawBlocks: function (context) {
        const gridSize = this.size.grid;
        let blockShapes = new Path2D();

        for (let i = 0; i < this.blocks.length; i++) {
          let blockShape = new Path2D();
          const x = this.blocks[i].x * gridSize;
          const y = this.blocks[i].y * gridSize;
          blockShape.rect(x , y, gridSize, gridSize);

          blockShapes.addPath(blockShape);
        }

        context.fillStyle = 'blue';
        context.fill(blockShapes);
      },
      drawBoardGrid: function (context, gridSize) {
        context.beginPath();
        for (let i = 0; i <= this.size.width; i ++) {
          context.moveTo(i * gridSize, 0);
          context.lineTo(i * gridSize, this.size.height * gridSize);
        }

        for (let i = 0; i <= this.size.height; i ++) {
          context.moveTo(0, i * gridSize);
          context.lineTo(this.size.width * gridSize, i * gridSize);
        }

        context.globalAlpha = 0.5;
        context.strokeStyle = "rgba(0, 0, 0, 0.2)";
        context.stroke();
      },
      drawBoard: function () {
        const context = this.getContext();
        if (!context) {
          return;
        }

        this.drawBoardGrid(context, this.size.grid);
        this.drawBlocks(context);

        return context;
      },
      getContext() {
        const canvas = this.$refs.board;
        if (!canvas) {
          return;
        }

        return canvas.getContext("2d");
      }
    },
    watch: {
      isPlaying: function (val) {
        if (val) {
          this.startGame();
        } else {
          this.stopGame();
        }
      }
    },
    beforeDestroy() {
      this.stopGame();
    }
  }
</script>

<style scoped>

</style>