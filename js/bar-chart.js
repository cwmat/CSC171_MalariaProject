// SVG drawing area

var margin = {top: 40, right: 10, bottom: 60, left: 60};

var width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var barSvg = d3.select("#bar-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Scales
var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], 0.1);

var y = d3.scale.linear()
    .range([height, 0]);

// Axiis
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var yAxisGroup = barSvg.append("g")
      .attr("class", "y-axis axis")
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Millions USD");

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var xAxisGroup = barSvg.append("g")
    .attr("class", "x-axis axis")
    .attr("transform", "translate(0," + height + ")");

var data,
    totals;

// Load data
d3.csv("data/global-funding.csv", function(error, csv){
  // Clean data

  // Remove "--"
  csv.forEach(function(d){
    if (d["2005"] == "--") {
      d["2005"] == 0.0;
    } else if (d["2006"] == "--") {
      d["2006"] == 0.0;
    }

    // Set to numbers
    d["2005"] = parseInt(d["2005"].replace("$", ""));
    d["2006"] = parseInt(d["2006"].replace("$", ""));
    d["2007"] = parseInt(d["2007"].replace("$", ""));
    d["2008"] = parseInt(d["2008"].replace("$", ""));
    d["2009"] = parseInt(d["2009"].replace("$", ""));
    d["2010"] = parseInt(d["2010"].replace("$", ""));
    d["2011"] = parseInt(d["2011"].replace("$", ""));
    d["2012"] = parseInt(d["2012"].replace("$", ""));
    d["2013"] = parseInt(d["2013"].replace("$", ""));
  });

  // Filter
  data = csv.filter(function(d) {
    if (d.Source != "Total") {
      return d;
    }
  });

  totals = csv.filter(function(d) {
    if (d.Source == "Total") {
      return d;
    }
  })[0];

  console.log(totals);

  updateVis();
});

function updateVis() {
  // Get user input
  var currentBarSelection = d3.select("#fund-year").property("value");

  // Update total
  $("#fund-total").text("$" + totals[currentBarSelection].toLocaleString("en-US") + " Million USD");

  // Tip
  var barTip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                barTooltip = "<p class='fund-tip-header'>" + d.Source + "</p>" + "<p>$" + d[currentBarSelection] + "M Out of: $" + totals[currentBarSelection] + "M</p>"
                return barTooltip;
              });

	svg.call(barTip);

  // Domains
  x.domain(data.map(function(d) { return d.Source; }));
  y.domain([0, d3.max(data, function(d) { return d[currentBarSelection]; })]);

  // Join to data
  var bars = barSvg.selectAll("rect")
    .data(data)

  // Update data
  bars.on("mouseover", barTip.show).on("mouseleave", barTip.hide)
  .transition()
  .duration(1000)
  .attr({
    x: function(d) { return x(d.Source); },
    y: function(d) { return y(d[currentBarSelection]); },
    height: function(d) { return height - y(d[currentBarSelection]); },
    width: x.rangeBand(),
    class: function(d) { return "bar " + currentBarSelection; },
  });

  // Enter data
  bars.enter()
  .append("rect")
    .attr({
      x: function(d) { return x(d.Source); },
      y: function(d) { return y(d[currentBarSelection]); },
      height: function(d) { return height - y(d[currentBarSelection]); },
      width: x.rangeBand(),
      class: "bar",
    })
    .on("mouseover", barTip.show)
    .on("mouseleave", barTip.hide);

  // Remove old data
  bars.exit().remove();

  // Update axiis
  barSvg.select(".y-axis")
      .transition()
      .duration(2000)
      .call(yAxis);
  barSvg.select(".x-axis")
      .transition()
      .duration(2000)
      .call(xAxis);
}
