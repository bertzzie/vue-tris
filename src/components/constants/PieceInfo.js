export default Object.freeze({
  availableKeys: function () { return ['I', 'J', 'L', 'O', 'S', 'T', 'Z'] },
  availableRotations: function () { return [0, 90, 180, 270]; },
  randomShapes: function () { return this.availableKeys()[Math.floor(Math.random() * this.availableKeys().length)] },
  shapes: {
    I: {
      color: 'red',
      grid: [[1, 1, 1, 1]]
    },
    J: {
      color: 'orange',
      grid: [[1, 1, 1], [0, 0, 1]]
    },
    L: {
      color: 'magenta',
      grid: [[1, 1, 1], [1, 0, 0]]
    },
    O: {
      color: 'blue',
      grid: [[1, 1], [1, 1]]
    },
    S: {
      color: 'green',
      grid: [[0, 1, 1], [1, 1, 0]]
    },
    T: {
      color: 'olive',
      grid: [[1, 1, 1], [0, 1, 0]]
    },
    Z: {
      color: 'cyan',
      grid: [[1, 1, 0], [0, 1, 1]]
    }
  }
});