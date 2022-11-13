tileImages = [
  "tiles/ocean.png",
  "tiles/water.png",
  "tiles/port left.png",
  "tiles/port right.png",
  "tiles/lighthouse.png",

  "tiles/lush.png",
  "tiles/lush woods.png",
  "tiles/mountain.png",

  "tiles/plains.png",
  "tiles/forested plains.png",
  "tiles/woods.png",
  "tiles/mossy rocks.png",
  "tiles/forested rocks.png",

  "tiles/moores.png",
  "tiles/bog.png",
  "tiles/swamp.png",
  "tiles/graveyard.png",

  "tiles/desert.png",
  "tiles/dunes.png",
  "tiles/oasis.png",
  "tiles/desert rocks.png",
  "tiles/mesa.png",
  "tiles/desert castle.png",
  "tiles/desert town.png",
  "tiles/desert village.png",

  "tiles/arctic.png",
  "tiles/arctic water.png",
  "tiles/arctic rocks.png",
  "tiles/forested arctic.png",
  "tiles/forested arctic rocks.png",
  "tiles/arctic castle.png",
  "tiles/arctic town.png",
  "tiles/arctic woods.png",

  "tiles/wheat.png",
  "tiles/fort.png",
  "tiles/burh.png",
  "tiles/town.png",
  "tiles/ruins.png",
]

class HexGrid extends HTMLElement {
  connectedCallback() {
    // Get readonly state
    this.readonly = "readonly" in this.dataset;
    // Set style
    this.style.display = "grid";
    this.style.gridAutoFlow = "row";
    this.style.columnGap = "8px";
    this.style.rowGap = "14px";
    // Create tiles array
    this.tiles = [];
    // Set number of rows and columns
    this.resize(this.rows, this.cols);
    // Create menu
    this.menu = new IconPicker();
    this.appendChild(this.menu)
    this.menu.style.position = "absolute";
    this.menu.style.left = 0;
    if (this.readonly) {
      this.menu.style.display = "none";
    }
    // Create size ctrls
    this.sizeCtrls = new SizeCtrls(parent=this)
    this.appendChild(this.sizeCtrls)
    this.sizeCtrls.style.position = "absolute";
    this.sizeCtrls.style.right = 0;
    if (this.readonly) {
      this.sizeCtrls.style.display = "none";
    }
    // If given data, load it
    if (this.dataset['tiles']) {
      let raw = this.dataset['tiles'].split("\n")
      let data = []
      for (let row of raw) {
        data.push(row.split(","))
      }
      this.import(data)
    }
  }

  resize(rows, cols) {
    if (rows) {
      this.rows = rows;
    }
    if (cols) {
      this.cols = cols;
    }
    // Setup css grid
    this.style.gridTemplateRows = `repeat(${this.rows}, 14px)`;
    this.style.gridTemplateColumns = `repeat(${this.cols}, 16px)`;
    // Destroy all tiles
    for (let row of this.tiles) {
      for (let tile of row) {
        tile.remove()
      }
    }
    this.tiles = []
    // Create rows
    while (this.tiles.length < this.rows) {
      this.tiles.push([])
    }
    // Go through each row to manage columns
    for (let row = 0; row < this.rows; row++) {
      // Fill rows with cells
      while (this.tiles[row].length < this.cols) {
        let tile;
        // Create tile
        tile = new HexTile(this, [row, this.tiles[row].length + 1], this.readonly)
        this.tiles[row].push(tile)
        this.appendChild(tile)
      }
    }
  }
  
  get rows() {
    return this.dataset.rows;
  }
  set rows(value) {
    this.dataset.rows = value;
  }

  get cols() {
    return this.dataset.cols;
  }
  set cols(value) {
    this.dataset.cols = value;
  }

  export() {
    let tiles = [];
    for (let row = 0; row < this.rows; row++) {
      tiles.push([])
      for (let col = 0; col < this.cols; col++) {
        tiles[row].push(this.tiles[row][col].type);
      }
    }
    return tiles
  }
  
  import(tiles) {
    // Match file data dimensions
    this.resize(tiles.length, Math.max(0,...tiles.map(s=>s.length)))
    // Import each cell of file data
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.tiles[row][col].type = tiles[row][col]
      }
    }
  }
}
customElements.define("hex-grid", HexGrid);

class HexTile extends HTMLElement {
  constructor(parent, index, readonly=False) {
    super();
    // Set attributes
    this.parent = parent;
    this.readonly = readonly;
    this.index = index;
    this.row = this.index[0];
    this.col = this.index[1];
    // Offset
    if (this.col % 2) {
      this.style.top = "14px";
    }
    // Make sure higher up tiles are always on top
    this.style.zIndex = this.row + this.col % 2;
  }

  connectedCallback() {
    // Set style
    this.style.position = "relative";
    // Create image
    this.img = document.createElement("img");
    this.img.style.position = "absolute";
    this.img.style.left = "-8px";
    this.img.style.right = "-8px";
    this.img.style.bottom = "-1px";
    this.appendChild(this.img)
    // Start off as placeholder
    this.type = "ocean";
    // Bind onclick function
    if (!this.readonly) {
      this.onclick = this.set;
    }
  }

  set() {
    let menu = this.parent.menu;
    this.type = menu.selected.value;
  }

  get type() {
    return this._type;
  }
  set type(value) {
    this._type = value;
    this.src = `tiles/${this._type}.png`;
  }

  get src() {
    return this.img.src;
  }
  set src(value) {
    this.img.src = value;
  }
}
customElements.define("hex-tile", HexTile);

class IconPicker extends HTMLElement {
  connectedCallback() {
    // Setup style
    this.style.display = "grid";
    this.style.gridTemplateColumns = "repeat(3, 1fr)";
    this.style.padding = "14px";
    this.style.zIndex = 100;
    // Make icons
    this.options = {}
    for (let imgFile of tileImages) {
      let opt = new IconOption(parent=this);
      this.appendChild(opt);
      opt.src = imgFile;
      this.options[opt.value] = opt;
    }
    // Start off with ocean selected
    this.selected = this.options['ocean'];
  }

  get selected() {
    return this._selected;
  }
  set selected(value) {
    this._selected = value;
    for (let [key, opt] of Object.entries(this.options)) {
      opt.styleSelected(opt === value);
    }
  }

}
customElements.define("icon-picker", IconPicker);

class IconOption extends HTMLElement {
  constructor(parent) {
    super();

    this.parent = parent;
    // Start off as an ocean tile
    this._value = "ocean"
    this._src = "tiles/ocean.png"
  }

  connectedCallback() {
    // Create container for option
    this.style.width = "32px";
    this.style.height = "29px";
    this.style.position = "relative";
    this.style.padding = "7px";
    this.style.borderRadius = "7px";
    this.style.border = "2px solid transparent";
    // Create image
    let img = document.createElement("img");
    img.style.position = "absolute";
    img.style.bottom = "6px";
    img.style.left = "7px";
    img.style.right = "7px";
    this.img = img;
    this.appendChild(img)
    // Bind hover
    this.addEventListener("mouseover", this.hoverOn)
    this.addEventListener("mouseleave", this.hoverOff)
    // Bind onclick
    this.onclick = this.toggleSelected
  }

  get src() {
    return `tiles/${this.value}.png`;
  }
  set src(value) {
    this.value = value.replace("tiles/", "").replace(".png", "");
  }

  get value() {
    return this._value;
  }
  set value(value) {
    this._value = value;
    this.img.src = `tiles/${value}.png`
  }

  hoverOn() {
    this.style.backgroundColor = "rgba(255, 255, 255, 0.075)";
  }
  hoverOff() {
    this.style.backgroundColor = "transparent";
  }

  toggleSelected() {
    this.parent.selected = this;
  }

  styleSelected(selected) {
    if (selected) {
      this.style.border = "2px solid white";
    } else {
      this.style.border = "2px solid transparent";
    }
  }
}
customElements.define("icon-option", IconOption);

class SizeCtrls extends HTMLElement {
  constructor(parent) {
    super();
    this.parent = parent;
  }
  
  connectedCallback() {
    // Style size ctrls box
    this.style.display = "grid";
    this.style.gridTemplateColumns = "10rem"; 
    this.style.width = "10rem";
    this.style.padding = "1rem";
    this.style.zIndex = 100;
    // Create row lbl
    this.rowLbl = document.createElement("label");
    this.rowLbl.textContent = "Rows:";
    this.rowLbl.marginTop = "1rem";
    this.appendChild(this.rowLbl);
    // Create row ctrl
    this.rowCtrl = document.createElement("input");
    this.rowCtrl.value = this.parent.rows;
    this.rowCtrl.grid = this.parent;
    this.rowCtrl.type = "number";
    this.rowCtrl.onchange = this.onSetRows
    this.appendChild(this.rowCtrl)
    // Create col lbl
    this.colLbl = document.createElement("label");
    this.colLbl.textContent = "Columns:";
    this.colLbl.marginTop = "1rem";
    this.appendChild(this.colLbl);
    // Create col ctrl
    this.colCtrl = document.createElement("input");
    this.colCtrl.value = this.parent.cols;
    this.colCtrl.grid = this.parent;
    this.colCtrl.type = "number";
    this.colCtrl.onchange = this.onSetCols
    this.appendChild(this.colCtrl)
  }

  onSetRows(evt) {
    this.grid.resize(this.value, undefined)
  }

  onSetCols(evt) {
    this.grid.resize(undefined, this.value)
  }
}
customElements.define("hex-size-ctrls", SizeCtrls);

function exportMap(map) {
  // Get tile values
  let tiles = map.export()
  let tilesCSV = []
  for (let row of tiles) {
    tilesCSV.push(row.join(","))
  }
  tilesCSV = tilesCSV.join("\n")

  // Save to file
  let file = new Blob([tilesCSV], { type: "text/csv" });
  window.open(URL.createObjectURL(file));

}

function loadFile(file) {
  let reader = new FileReader();
  reader.addEventListener("loadend", function () {
    let raw = reader.result;
    let processed = [];
    let rows = raw.split("\n");
    for (let row of rows) {
      if (row.includes(",")) {
        processed.push(row.split(","))
      }
    }
    map.import(processed);
  })
  reader.readAsText(file);
}

function importMap(map) {
  let loadbuffer = document.getElementById("loadbuffer");
  // Load the .csv file to a list
  loadbuffer.onchange = function () {
    loadFile(loadbuffer.files[0]);
  };
  // Click to trigger previously defined functions
  loadbuffer.click();
}