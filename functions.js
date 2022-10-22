function exportMap() {
  let map = document.getElementById("map");
  // Get tile values
  let tiles = map.export()
  let tilesCSV = tiles.join(",")

  // Save to file
  let file = new Blob([tilesCSV], { type: "text/csv" });
  window.open(URL.createObjectURL(file));

}

function importMap(tiles) {
  let map = document.getElementById("map");
  let loadbuffer = document.getElementById("loadbuffer");
  // Load the .csv file to a list
  var reader = new FileReader();
  loadbuffer.onchange = function () {
    reader.readAsText(loadbuffer.files[0]);
  };
  // Add listener function so loading actually happens
  reader.addEventListener("loadend", function () {
    let raw = reader.result;
    map.import(raw.split(","));
  });
  // Click to trigger previously defined functions
  loadbuffer.click();
}