<template>
  <div></div>
</template>

<script>
  import PieceInfo from './constants/PieceInfo';
  import ArrayLibs from './lib/ArrayLibs';

  export default {
    name: "Piece",
    data: function () {
      return {
        shapeGrid: PieceInfo.shapes[this.shape].grid
      };
    },
    props: {
      canvasContext: {
        type: CanvasRenderingContext2D
      },
      gridSize: {
        type: Number
      },
      position: {
        type: Object,
        default: function () {
          return { x: 3, y: 0 };
        },
        validator: function (value) {
          return value.hasOwnProperty('x') && value.hasOwnProperty('y');
        }
      },
      rotation: {
        type: Number,
        validator: function (value) {
          return PieceInfo.availableRotations().indexOf(value) !== -1;
        }
      },
      shape: {
        type: String,
        validator: function (value) {
          return PieceInfo.availableKeys().indexOf(value) !== -1;
        }
      }
    },
    methods: {
      drawShape: function () {
        if (!this.canvasContext) {
          return;
        }

        const path = this.getShapePath(this.shape, this.position);

        this.canvasContext.fillStyle = PieceInfo.shapes[this.shape].color;
        this.canvasContext.fill(path);
      },
      getShapeBoundaries: function () {
        return this.shapeGrid.flatMap((row, y) => row.flatMap((val, x) => {
          if (val === 1) {
            return { x: x + this.position.x, y: y + this.position.y };
          }
        })).filter(v => v)
      },
      getShapePath: function (shape, position) {
        const currentGrid = PieceInfo.shapes[shape].grid;
        let shapeGrid = this.shapeGrid;
        if (!ArrayLibs.equals(currentGrid, this.shapeGrid) &&
            this.position.x === 3 && this.position.y === 0) {
          shapeGrid = currentGrid;
        }

        let piece = new Path2D();
        for (let row = 0; row < shapeGrid.length; row++) {
          for (let col = 0; col < shapeGrid[row].length; col++) {
            if (shapeGrid[row][col] === 1) {
              let part = new Path2D();
              const x = (position.x * this.gridSize) + (col * this.gridSize);
              const y = (position.y * this.gridSize) + (row * this.gridSize);
              part.rect(x , y, this.gridSize, this.gridSize);

              piece.addPath(part);
            }
          }
        }

        return piece;
      },
      rotateShapeGrid: function () {
        let temp = Array.from({length: this.shapeGrid[0].length}, () => new Array(this.shapeGrid.length).fill(0));

        for (let row = 0; row < this.shapeGrid.length; row++) {
          for (let col = 0; col < this.shapeGrid[0].length; col++) {
            temp[col][this.shapeGrid.length - row - 1] = this.shapeGrid[row][col];
          }
        }

        this.shapeGrid = temp.slice();
      }
    },
    watch: {
      canvasContext: function () {
        this.drawShape();
      },
      position: {
        handler: function () {
          this.drawShape();
        },
        deep: true
      },
      shape: function (shape) {
        this.shapeGrid = PieceInfo.shapes[shape].grid;
      },
      rotation: function (val, oldVal) {
        if (val !== oldVal) {
          this.rotateShapeGrid();
          this.drawShape();
        }
      }
    },
  }
</script>

<style scoped>

</style>