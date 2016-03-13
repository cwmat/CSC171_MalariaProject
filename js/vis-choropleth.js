// Constants
// var POP = ,
//     RISK = ,
//     HIGH_RISK = ,
//     SUS_CASE

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

// Data map
var dataMap = d3.map();

// Create quantize color scale
var quantize = d3.scale.quantize();
    // .domain([0, 0.15])
    // .range(d3.range(9).map(function(i) { return "risk-q" + i + "-9"; }));

// Make data accessor var
var africaData = {};

var africa,
    filterMalaria;

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
      africa = topojson.feature(mapData, mapData.objects.collection).features;

      // console.log(africa);

      // Cycle through geoJSON data and create accessor object
      africa.forEach(function(geom) {
        var prop = geom.properties;

        // Link data to Country ISO code
        africaData[prop.adm0_a3_is] = prop;
      });

      // Limit malaria dataset to just Africa
      var target = "African";

      filterMalaria = malariaData.filter(function(element, index, array) {
        if (element.WHO_region == target) {
          return element;
        }
      });

      // Cycle through malaria data and attach new properties to geoJSON
      filterMalaria.forEach(function(row) {
        // Set a variable equal to the propeties reference
        prop = africaData[row.Code];
        // console.log(row.Code);

        // Join data
        // prop.WHO_region = row.WHO_region;
        // prop.Country = row.Country;
        // prop.UN_population = removeString(row.UN_population);
        // prop.At_risk = removeString(row.At_risk);
        // prop.At_high_risk = removeString(row.At_high_risk);
        // prop.Suspected_malaria_cases = removeString(row.Suspected_malaria_cases);
        // prop.Malaria_cases = removeString(row.Malaria_cases);
      //   prop.WHO_region = row.WHO_region;
        // prop.Country = row.Country;
        row.UN_population = removeString(row.UN_population);
        row.At_risk = removeString(row.At_risk);
        row.At_high_risk = removeString(row.At_high_risk);
        row.Suspected_malaria_cases = removeString(row.Suspected_malaria_cases);
        row.Malaria_cases = removeString(row.Malaria_cases);
      });

      // Update choropleth
      updateChoropleth();
    }
  });


function updateChoropleth() {
  // Get user selection for data view
  var currentSelection = d3.select("#chart-data-select").property("value");

  // Set data map
  filterMalaria.forEach(function(d) {
    dataMap.set(d.Code, d[currentSelection]);
  });

  // console.log(dataMap);
  // Update domain
  quantize.domain(d3.extent(filterMalaria, function(d) { return d[currentSelection]; }))
          .range(d3.range(9).map(function(i) { return "risk-q" + i + "-9"; }));

  // Initialize tool tip
	var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-50, 0])
              .html(function(d) {
                var id = filterMalaria.filter(function(item) { if (item.Code == d.properties.adm0_a3_is) {return item;}})[0];
                // console.log(id.Country);
                var tooltip;
                if (id) {
                  tooltip = "<p>" + id.Country +
                  "</p><p>" + id.UN_population +
                  "</p><p>" + id.At_risk +
                  "</p><p>" + id.At_high_risk +
                  "</p><p>" + id.Suspected_malaria_cases +
                  "</p><p>" + id.Malaria_cases + "</p>";
                } else {
                  tooltip = "<p>No Data</p>"
                }

                return tooltip;
              });

	svg.call(tip);

  // --> Choropleth implementation
  // Draw geo boundaries
  // Enter
  svg.selectAll("path")
      .data(africa)
    .enter().append("path")
      .attr("class", function(d) {
        var id = dataMap.get(d.properties.adm0_a3_is);
        if (id) {
          return "country " + quantize(id);
        } else {
          return "country no-data";
        }
      })
      // .attr("class", function(d){return d.properties.adm0_a3_is;})
      .attr("d", path)
      .on("mouseenter", tip.show)
      .on("mouseleave", tip.hide);

  // Update
  svg.selectAll(".country")
  // .transition()
  // .duration(2500)
  .attr("class", function(d) {
    var id = dataMap.get(d.properties.adm0_a3_is);
    if (id) {
      return "country " + quantize(dataMap.get(d.properties.adm0_a3_is));
    } else {
      return "country no-data";
    }
  });

  // Calculate breaks and add legend
  var currentLegend = [],
      dataDom = quantize.domain(),
      span = (dataDom[1] - dataDom[0])/quantize.range().length,
      breaks = d3.range(0, quantize.range().length).map(function(i) { return i * 1; });

  breaks.forEach(function(d) {
    var category = (d * span) + span;
    currentLegend.push({
      color: quantize(category),
      num: Math.floor(category).toLocaleString("en-US")
    });
  });

  // console.log(currentLegend);

  var legend = svg.append("g")
      .attr("class", "legend")
      .attr("height", 100)
      .attr("width", 100)
      .attr('transform', 'translate(-20,50)')


  var legendColor = legend.selectAll('.legend-color')
      .data(currentLegend);

  legendColor.enter()
    .append("rect")
      .attr("x", width - 65)
      .attr("y", function(d, i){ return i *  20;})
      .attr("width", 10)
      .attr("height", 10)
      .attr("class", function(d) { return "legend-color " + d.color; });

var legendText = legend.selectAll(".legend-text")
      .data(currentLegend);

legendText.enter()
    .append("text")
      .attr("x", width - 52)
      .attr("y", function(d, i){ return i *  20 + 9;})
      .attr("class", "legend-text")
      .text(function(d) { return d.num; });

legendText.transition()
    .duration(1000)
    .text(function(d) { return d.num; });

  legendText.exit().remove();
  legendColor.exit().remove();
  console.log(currentLegend);
  currentLegend = undefined;
  console.log(currentLegend);

}

// Helper
function removeString(input) {
  if (input == "N/A") {
    return 0;
  } else {
    return +input;
  }
}

// Update data view
function updateDataView() {
  var currentSelection = d3.select("#chart-data-select").property("value");

}

// Hover
function mapHover(data) {
  // console.log(data.);
}
