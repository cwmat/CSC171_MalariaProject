// Height and width
var tWidth = 500,
    tHeight = 500;

// Tree layout
var tree = d3.layout.tree()
    .size([tWidth, tHeight]);

// Make diagonal generator to be used for links
var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, d.y]; });

// Make new SVG in DOM
var treeSvg = d3.select("#tree-area").append("svg")
      .attr("width", tWidth + margin.left + margin.right)
      .attr("height", tHeight + margin.top + margin.bottom)
      .attr("viewBox", "0 0 " + tWidth + " " + tHeight)
      .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Load the data
d3.json("data/malaria-parasites.json", function(error, data) {
  if (error) {
    consoloe.log("An Error Occured!");
  } else {

    var root = data[0];
    console.log(root);

    var nodes = tree.nodes(root),
        links = tree.links(nodes);

    // Reduce space between links
    nodes.forEach(function(d) { d.y = d.depth * 100; });

    // Initialize nodes
    var node = treeSvg.selectAll("g.node")
  	  .data(nodes, function(d, i) { return d.id || (d.id = ++i); });

    // Enter node data and create SVG groups
    var nodeData = node.enter().append("g")
  	  .attr("class", "node")
  	  .attr("transform", function(d) {
  		  return "translate(" + d.x + "," + d.y + ")"; });

    // Make dots for node locations
    nodeData.append("circle")
  	  .attr("r", 5);

    // Add text labels
    nodeData.append("text")
  	  .attr("x", function(d) { return d.children; })
      .attr("dx", -50)
  	  .attr("dy", -10)
  	  .attr("text-anchor", function(d) { return d.children; })
  	  .text(function(d) { return d.name; });

    // Create links
    var link = treeSvg.selectAll("path.link")
  	  .data(links, function(d) { return d.target.id; });

    // Enter links
    link.enter().insert("path", "g")
  	  .attr("class", "link")
  	  .attr("d", diagonal);

    }
})
