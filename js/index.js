var margin = {top: 50, right: 50, bottom: 50, left: 40};
        var width = 960 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

var svg = d3.select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top  + margin.bottom);

var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); };

var color = d3.scaleOrdinal(d3.schemeCategory10.map(fader));

var format = d3.format(",d");

var treemap = d3.treemap()
    .tile(d3.treemapResquarify)
    .size([ width, height])
    .paddingInner(2);

d3.json("https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json", function(error, data) {
  if (error) throw error;

  var root = d3.hierarchy(data)
      .eachBefore(function(d) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; })
      .sum((d) => d.value)
      .sort(function(a, b) { return b.height - a.height || b.value - a.value; });

  treemap(root);
  
  var category = root.leaves().map(x => x.data.category).filter((v, i, a) => a.indexOf(v) == i);

  var tile = svg.selectAll("g")
    .data(root.leaves())
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

  var tooltip = d3.select("body").append("div")
                .style("opacity", 0)   
                .attr("id", "tooltip");
             
  var format = d3.format("$,.2s");
  
  tile.append("rect")
      .attr("class", "tile")
      .attr("id", function(d) { return d.data.id; })
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("height", function(d) { return d.y1 - d.y0; })
      .attr("data-name", function(d) {
             return d.data.name;
           })  
      .attr("data-category", function(d) {
         return d.data.category;
           }) 
      .attr("data-value",  function(d) {
             return d.data.value;
           })   
     .attr("fill", function(d) { return color(d.data.category);
                               })
        .on("mouseover", function(d) {    
         tooltip.style("opacity", 0.8)
                 .attr("data-value", d.data.value)
                .style("left", (event.pageX + 28) + "px")
                .style("top", (event.pageY - 28) + "px")
             tooltip.html(
          '<strong>Name: ' + d.data.name + 
          '<br>Category: ' + d.data.category + 
          '<br>Value: ' + format(d.data.value) + '</strong>')
         })
           .on("mouseout", function(d) {
            tooltip.style("opacity", 0);  
      });           
  

  tile.append("text")
   .selectAll("tspan")
      .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
    .enter().append("tspan")
      .attr("x", 4)
      .attr("y", function(d, i) { return 13 + i * 10; })
      .text(function(d) { return d; });
  
var g = svg.append("g")
       .attr("transform", "translate(50,530)");

  
  var legend =  g.selectAll(".legend")
              .data(color.range())
              .enter().append("g")
              .attr("id", "legend")
             .attr("width", 960)
            .attr("height", 100);
                           
  
  var legendHeight = 20;
  var legendWidth = 60;
 
                   
    legend.append("rect")
            .attr("class", "legend-item")
            .attr("width", legendWidth)
            .attr("height", legendHeight)  
            .attr("x", (d, i) => i * 80)
            .attr("y", 25)
            .style("fill", (d, i) =>  i < category.length ? d : "black");
    
    legend.append("text")
          .attr("x", (d, i) => i * (80))
            .attr("y", 40)
            .attr("font-size", 11)
           .text((d, i) => category[i]);

  });