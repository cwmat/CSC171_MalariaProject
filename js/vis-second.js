

var diameter = 960;

// Make tree layout
// var tree = d3.layout.tree()
//     .size([height, width]);
//     // .size([360, diameter / 2 - 120])
//     // .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });
//
// var diagonal = d3.svg.diagonal()
//     .projection(function(d) { return [d.y, d.x]; });

var tWidth = 500,
    tHeight = 500;

var tree = d3.layout.tree()
    .size([tWidth, tHeight]);
    // .size([360, diameter / 2 - 120])
    // .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, d.y]; });

var treeSvg = d3.select("#tree-area").append("svg")
      .attr("width", tWidth + margin.left + margin.right)
      .attr("height", tHeight + margin.top + margin.bottom)
      .attr("viewBox", "0 0 " + tWidth + " " + tHeight)
      .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data/malaria-parasites.json", function(error, data) {
  if (error) {
    consoloe.log("An Error Occured!");
  } else {

    var root = data[0];
    console.log(root);

    var nodes = tree.nodes(root),
        links = tree.links(nodes);

    // Reduce size of links
    nodes.forEach(function(d) { d.y = d.depth * 100; });

    // Initialize nodes
    var node = treeSvg.selectAll("g.node")
  	  .data(nodes, function(d, i) { return d.id || (d.id = ++i); });
      // .data(nodes);

    // Enter nodes
    var nodeData = node.enter().append("g")
  	  .attr("class", "node")
  	  .attr("transform", function(d) {
  		  return "translate(" + d.x + "," + d.y + ")"; });

    nodeData.append("circle")
  	  .attr("r", 5);
  	  // .style("stroke", function(d) { return d.type; })
  	  // .style("fill", function(d) { return d.level; });

    // nodeEnter.append("text")
  	//   .attr("x", function(d) {
  	// 	  return d.children || d._children ?
  	// 	  (d.value + 4) * -1 : d.value + 4 })
  	//   .attr("dy", ".35em")
  	//   .attr("text-anchor", function(d) {
  	// 	  return d.children || d._children ? "end" : "start"; })
  	//   .text(function(d) { return d.name; })
  	//   .style("fill-opacity", 1);

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
  //
  //   var link = treeSvg.selectAll(".link")
  //         .data(links)
  //       .enter().append("g")
  //         .attr("class", "tree-node")
  //         .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });
  //
  //   var node = treeSvg.selectAll(".node")
  //     .data(nodes)
  //   .enter().append("g")
  //     .attr("class", "node")
  //     .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });
  //
  //   node.append("circle")
  //   .attr("r", 4.5);
  //
  //   node.append("text")
  //       .attr("dy", ".31em")
  //       .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
  //       .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
  //       .text(function(d) { return d.name; });
  // }
})
