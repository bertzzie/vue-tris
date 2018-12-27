export default {
  equals: function (left, right) {
    // if the other array is a falsy value, return
    if (!right)
      return false;

    // compare lengths - can save a lot of time
    if (left.length !== right.length)
      return false;

    for (let i = 0, l = left.length; i < l; i++) {
      // Check if we have nested arrays
      if (left[i] instanceof Array && right[i] instanceof Array) {
        // recurse into the nested arrays
        if (!this.equals(left[i] ,(right[i])))
          return false;
      } else if (left[i] !== right[i]) {
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;
      }
    }
    return true;
  },
  groupBy: function (list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }
};