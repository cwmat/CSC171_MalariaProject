// Create svg
var margin = {
  top: 40,
  right: 40,
  bottom: 40,
  left: 40
};

var width = 1140 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

var svg = d3.select("#map-area").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", "0 0 " + width + " " + height)
      .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Setup projection and path generator
var proj = d3.geo.mercator()
      .scale(250);

var path = d3.geo.path()
      .projection(proj);

// Use the Queue.js library to read multiple files
queue()
  .defer(d3.json, "data/africa.topo.json")
  .defer(d3.csv, "data/global-malaria-2015.csv")
  .await(function(error, mapData, malariaData){
    // --> PROCESS DATA
    if (error) {
      consoloe.log("An Error Occured!");
    } else {
      // Unpack topoJSON to geoJson
      var africa = topojson.feature(mapData, mapData.objects.collection).features;

      // Make data accessor var
      var africaData = {};

      // console.log(africa);

      // Cycle through geoJSON data and create accessor object
      africa.forEach(function(geom) {
        var prop = geom.properties;

        // Link data to Country ISO code
        africaData[prop.adm0_a3_is] = prop;
      });

      // Limit malaria dataset to just Africa
      var target = "African";

      var filter = malariaData.filter(function(element, index, array) {
        if (element.WHO_region == target) {
          return element;
        }
      });

      // Cycle through malaria data and attach new properties to geoJSON
      filter.forEach(function(row) {
        // Set a variable equal to the propeties reference
        prop = africaData[row.Code];
        // console.log(row.Code);

        // Join data
        prop.WHO_region = row.WHO_region;
        prop.Country = row.Country;
        prop.UN_population = row.UN_population;
        prop.At_risk = row.At_risk;
        prop.At_high_risk = row.At_high_risk;
        prop.Suspected_malaria_cases = row.Suspected_malaria_cases;
        prop.Malaria_cases = row.Malaria_cases;
      });

      // Draw geo boundaries
      svg.selectAll("path")
          .data(africa)
        .enter().append("path")
          .attr("d", path);


      // Update choropleth
      updateChoropleth();
    }
  });


function updateChoropleth() {

  // --> Choropleth implementation

}
