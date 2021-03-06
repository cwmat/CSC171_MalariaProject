// Create svg
var margin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};

var width = 550 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var svg = d3.select("#map-area").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + -300 +  "," + margin.top + ")");

// Setup projection and path generator
var proj = d3.geo.mercator()
      .scale(250);

var path = d3.geo.path()
      .projection(proj);

// Data map
var dataMap = d3.map();

// Create quantize color scale
var quantize = d3.scale.quantize();

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

  // Update domain
  quantize.domain(d3.extent(filterMalaria, function(d) { return d[currentSelection]; }))
          .range(d3.range(9).map(function(i) { return "risk-q" + i + "-9"; }));

  // Initialize tool tip
	var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                var id = filterMalaria.filter(function(item) { if (item.Code == d.properties.adm0_a3_is) {return item;}})[0];
                var tooltip;
                if (id) {
                  tooltip = "<p class='tip-header'>" + id.Country +
                  "</p><p><span class='tip-label'>Population: </span><span class='tip-content'>" + id.UN_population.toLocaleString("en-US") +
                  "</span></p><p><span class='tip-label'>Population at Risk: </span><span class='tip-content'>" + id.At_risk.toLocaleString("en-US") + "%" +
                  "</span></p><p><span class='tip-label'>Population at High Risk: </span><span class='tip-content'>" + id.At_high_risk.toLocaleString("en-US") + "%" +
                  "</span></p><p><span class='tip-label'>Suspected Malaria Cases: </span><span class='tip-content'>" + id.Suspected_malaria_cases.toLocaleString("en-US") +
                  "</span></p><p><span class='tip-label'>Recorded Malaria Cases: </span><span class='tip-content'>" + id.Malaria_cases.toLocaleString("en-US") + "</span></p>";
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
      .attr("d", path)
      .on("mouseenter", tip.show)
      .on("mouseleave", tip.hide);

  // Update
  svg.selectAll(".country")
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
      num: function() {
        // Quick and dirty, not the best/most modular way to implement this :[
        // Just checking if the data max is less than 101 and assuming that then the data are representing a percentage.  This works for this dataset but should not be used with other datsets!!!
        if (dataDom[1] < 101) {
          return Math.floor(category).toLocaleString("en-US") + "%";
        } else {
          return Math.floor(category).toLocaleString("en-US");
        }
      }()
    });
  });

  // Add no data entry to legend
  currentLegend.push({color: "no-data", num: "Missing Data"});

  // Create legend (start by removing old one)
  $(".legend").empty();

  // Add legend group
  var legend = svg.append("g")
      .attr("class", "legend")
      .attr("height", 100)
      .attr("width", 100)
      .attr('transform', 'translate(-135,50)')


  var legendColor = legend.selectAll('.legend-color')
      .data(currentLegend);

  // Enter legend data
  legendColor.enter()
    .append("rect")
      .attr("x", width - 65)
      .attr("y", function(d, i){ return i *  20;})
      .attr("width", 10)
      .attr("height", 10)
      .attr("class", function(d) { return "legend-color " + d.color; });

  var legendText = legend.selectAll(".legend-text")
        .data(currentLegend);

  // Enter legend text
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

  // End updateChoropleth()
}

// Helper
function removeString(input) {
  if (input == "N/A") {
    return 0;
  } else {
    return +input;
  }
}
