let tiles = [];
const tileImages = [];
let grid = [];
let DIM_X = 10;
let DIM_Y = 10;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
let currentSetIndex = 0;
let tilt = false;
let currentSeed = 0;
let randSeed = false;
let count = 10;

function createElementJSX(tagName, attrs = {}, ...children) {
  const elem = Object.assign(document.createElement(tagName), attrs);

  for (const child of children) {
    if (Array.isArray(child)) elem.append(...child);else elem.append(child);
  }

  return elem;
}

function preload() {
  for (let s = 0; s < tile_sets.length; s++) {
    let path = tile_sets[s].path;
    tileImages[s] = [];

    for (let i = 0; i < tile_sets[s].tiles.length; i++) {
      file = tile_sets[s].tiles[i][0];
      let str = `${path}/${file}`;
      tileImages[s][i] = loadImage(str);
    }
  }
}

function removeDuplicatedTiles(tiles) {
  const uniqueTilesMap = {};

  for (const tile of tiles) {
    const key = tile.edges.join(',');
    uniqueTilesMap[key] = tile;
  }

  return Object.values(uniqueTilesMap);
}

function setup() {
  let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.parent('canvas-div');
  let params = getURLParams();
  let tilesInUrl = typeof params.tiles !== 'undefined' ? params.tiles.split(",").map(x => parseInt(x)) : undefined;
  currentSetIndex = typeof params.set !== 'undefined' ? JSON.parse(params.set) : 0;
  currentSeed = typeof params.seed !== 'undefined' ? JSON.parse(params.seed) : 0;
  randSeed = typeof params.rand !== 'undefined' ? JSON.parse(params.rand) : true;
  setCount(typeof params.count !== 'undefined' ? JSON.parse(params.count) : 10);

  if (typeof tilesInUrl === 'undefined') {
    let currentTiles = tile_sets[currentSetIndex];
    let allTilesSelected = [...Array(currentTiles.tiles.length)].map((item, index) => {
      return index;
    });
    createUI(allTilesSelected);
  } else {
    createUI(tilesInUrl);
  }

  createTileArray();
  startOver();
}

function checkedChangedHandler() {
  createTileArray();
  startOver();
}

function changeSet(evt) {
  console.log(evt.target.index);
  currentSetIndex = evt.target.index;
  let currentTiles = tile_sets[currentSetIndex];
  let selectedTiles = [...Array(currentTiles.tiles.length)].map((item, index) => {
    return index;
  });
  createUI(selectedTiles);
  createTileArray();
  startOver();
}

function getLink() {
  tileStr = "";

  for (let i = 0; i < tile_sets[currentSetIndex].tiles.length; i++) {
    let chk = document.getElementById("checkboxTiles" + i);

    if (chk.checked) {
      tileStr += i + ",";
    }
  }

  tileStr = tileStr.slice(0, -1);
  let str = window.location.href.split('?')[0] + "?set=" + currentSetIndex + "&tiles=" + tileStr + "&seed=" + currentSeed + "&rand=" + randSeed + "&count=" + count;
  navigator.clipboard.writeText(str);
  console.log(str);
  alert("A link to this configuration has been copied to the clipboard");
}

function setSeed(evt) {
  currentSeed = parseInt(evt.target.value);
}

function useRandomSeed(evt) {
  randSeed = evt.target.checked;
  document.getElementById("inputSeed").disabled = value;
}

function countHandler(evt) {
  let value = parseInt(evt.target.value);
  setCount(value);
  document.getElementById("inputCount").value = value * value;
  startOver();
}

function setCount(value) {
  DIM_X = value;
  DIM_Y = value;
  count = value;
}

function tileClickHandler(evt) {
  let index = evt.target.index;
  window.document.getElementById("checkboxTiles" + index).checked = !window.document.getElementById("checkboxTiles" + index).checked;
  checkedChangedHandler();
}

function createUI(selectedTiles) {
  nav.innerHTML = "";
  nav.append(createElementJSX("div", {
    id: "navLeft"
  }, tile_sets[currentSetIndex].tiles.map((tile, index) => createElementJSX("div", {
    className: "tileItem"
  }, createElementJSX("input", {
    type: "checkbox",
    className: "chk_tiles",
    id: "checkboxTiles" + index,
    onclick: checkedChangedHandler,
    checked: selectedTiles.includes(index) ? "checked" : ""
  }), createElementJSX("img", {
    index: index,
    src: tile_sets[currentSetIndex].path + "/" + tile[0],
    onclick: tileClickHandler
  })))));
  nav.append(createElementJSX("div", {
    id: "navRight"
  }, createElementJSX("div", null, tile_sets.map((tileset, index) => createElementJSX("button", {
    index: index,
    className: currentSetIndex === index ? "selected" : "deselected",
    onclick: changeSet
  }, tileset.title))), createElementJSX("hr", null), createElementJSX("label", null, "Antal fliser"), createElementJSX("input", {
    type: "range",
    className: "slider",
    min: "6",
    max: "50",
    id: "sliderCount",
    value: count,
    oninput: countHandler
  }), createElementJSX("input", {
    size: "1",
    type: "text",
    disabled: true,
    id: "inputCount",
    value: count * count
  }), createElementJSX("hr", null), createElementJSX("label", null, "Seed#"), createElementJSX("input", {
    size: "9",
    type: "number",
    maxlength: "25",
    pattern: "[0-9]",
    id: "inputSeed",
    value: currentSeed,
    disabled: randSeed === true ? "disabled" : "",
    oninput: setSeed
  }), createElementJSX("input", {
    type: "checkbox",
    id: "checkRandom",
    onclick: useRandomSeed,
    checked: randSeed === true ? "checked" : ""
  }), createElementJSX("label", null, "tilf\xE6ldig"), createElementJSX("hr", null), createElementJSX("button", {
    onclick: startOver
  }, "Gener\xE9r"), createElementJSX("button", {
    onclick: getLink
  }, "Hent Link")));
}

function createTileArray() {
  tiles = [];

  for (let i = 0; i < tile_sets[currentSetIndex].tiles.length; i++) {
    let chk = document.getElementById("checkboxTiles" + i);
    if (chk.checked) tiles.push(new Tile(tileImages[currentSetIndex][i], tile_sets[currentSetIndex].tiles[i][1]));
  }

  for (let i = 0; i < tiles.length; i++) {
    tiles[i].index = i;
  }

  const initialTileCount = tiles.length;

  for (let i = 0; i < initialTileCount; i++) {
    let tempTiles = [];

    for (let j = 0; j < 4; j++) {
      tempTiles.push(tiles[i].rotate(j));
    }

    tempTiles = removeDuplicatedTiles(tempTiles);
    tiles = tiles.concat(tempTiles);
  }

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    tile.analyze(tiles);
  }
}

function startOver() {
  if (!randSeed) randomSeed(currentSeed);

  for (let i = 0; i < DIM_X * DIM_Y; i++) {
    grid[i] = new Cell(tiles.length);
  }
}

function checkValid(arr, valid) {
  for (let i = arr.length - 1; i >= 0; i--) {
    let element = arr[i];

    if (!valid.includes(element)) {
      arr.splice(i, 1);
    }
  }
}

function mousePressed() {
  redraw();
}

function getIndex(x, y) {
  return x * DIM_Y + y;
}

function draw() {
  background(0);
  const w = Math.ceil(width / DIM_X);
  const h = Math.ceil(height / DIM_Y);
  console.log(w, h);

  for (let y = 0; y < DIM_Y; y++) {
    for (let x = 0; x < DIM_X; x++) {
      let cell = grid[getIndex(x, y)];

      if (cell.collapsed) {
        let index = cell.options[0];
        image(tiles[index].img, x * w, y * h, w, h);
      } else {
        noFill();
        stroke(30);
        rect(x * w, y * h, w, h);
      }
    }
  }

  let gridCopy = grid.slice();
  gridCopy = gridCopy.filter(a => !a.collapsed);

  if (gridCopy.length == 0) {
    return;
  }

  gridCopy.sort((a, b) => {
    return a.options.length - b.options.length;
  });
  let len = gridCopy[0].options.length;
  let stopIndex = 0;

  for (let i = 1; i < gridCopy.length; i++) {
    if (gridCopy[i].options.length > len) {
      stopIndex = i;
      break;
    }
  }

  if (stopIndex > 0) gridCopy.splice(stopIndex);
  const cell = random(gridCopy);
  cell.collapsed = true;
  const pick = random(cell.options);

  if (pick === undefined) {
    startOver();
    return;
  }

  cell.options = [pick];
  const nextGrid = [];

  for (let y = 0; y < DIM_Y; y++) {
    for (let x = 0; x < DIM_X; x++) {
      let index = getIndex(x, y);

      if (grid[index].collapsed) {
        nextGrid[index] = grid[index];
      } else {
        let options = new Array(tiles.length).fill(0).map((x, i) => i);

        if (y > 0) {
          let up = grid[getIndex(x, y - 1)];
          let validOptions = [];

          for (let option of up.options) {
            let valid = tiles[option].down;
            validOptions = validOptions.concat(valid);
          }

          checkValid(options, validOptions);
        }

        if (x < DIM_X - 1) {
          let right = grid[getIndex(x + 1, y)];
          let validOptions = [];

          for (let option of right.options) {
            let valid = tiles[option].left;
            validOptions = validOptions.concat(valid);
          }

          checkValid(options, validOptions);
        }

        if (y < DIM_Y - 1) {
          let down = grid[getIndex(x, y + 1)];
          let validOptions = [];

          for (let option of down.options) {
            let valid = tiles[option].up;
            validOptions = validOptions.concat(valid);
          }

          checkValid(options, validOptions);
        }

        if (x > 0) {
          let left = grid[getIndex(x - 1, y)];
          let validOptions = [];

          for (let option of left.options) {
            let valid = tiles[option].right;
            validOptions = validOptions.concat(valid);
          }

          checkValid(options, validOptions);
        }

        nextGrid[index] = new Cell(options);
      }
    }
  }

  grid = nextGrid;
}