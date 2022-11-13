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
    // Set number of columns and rows
    this.cols = this.dataset.cols;
    this.rows = this.dataset.rows;
    // Create menu
    this.menu = new IconPicker();
    this.appendChild(this.menu)
    this.menu.style.position = "absolute";
    this.menu.style.left = 0;
    if (this.readonly) {
      this.menu.style.display = "none";
    }
    
    // Create tiles
    this.tiles = [];
    let tile
    for (let row = 0; row < this.rows; row++) {
      this.tiles.push([])
      for (let col = 0; col < this.cols; col++) {
        // Create tile
        tile = new HexTile(this, this.readonly)
        this.tiles[row].push(tile)
        this.appendChild(tile)
        // Offset
        if (col % 2) {
          tile.style.top = "14px";
        }
        // Make sure higher up tiles are always on top
        tile.style.zIndex = row + col % 2;
        // Set attributes
        tile.index = [row, col];
        tile.type = "ocean";
      }
    }

    if (this.dataset['tiles']) {
      this.import(this.dataset['tiles'].split(","))
    }
  }

  get rows() {
    return this.dataset.rows;
  }
  set rows(value) {
    // Store value
    this.dataset.rows = value;
    // Set css grid rows
    this.style.gridTemplateRows = `repeat(${value}, 14px)`;
  }

  get cols() {
    return this.dataset.cols;
  }
  set cols(value) {
    // Store value
    this.dataset.cols = value;
    // Set css grid columns
    this.style.gridTemplateColumns = `repeat(${value}, 16px)`;
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
    this.rows = tiles.length;
    this.cols = Math.max(0,...tiles.map(s=>s.length));
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
  constructor(parent, readonly=False) {
    super();
    this.parent = parent;
    this.readonly = readonly;
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
    this.type = this._type;
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
      processed.push(row.split(","))
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