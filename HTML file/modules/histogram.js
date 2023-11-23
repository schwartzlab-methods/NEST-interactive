import { data, setData } from "../globalvars.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
export function loadHistogram() {
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 20, left: 50 },
    width = 10000 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select("#histogram")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // list of subgroups
  let comp_set = new Set();
  let color_set = new Set();
  for (let i in data.links) {
    comp_set.add(data.links[i]["component"]);

    color_set.add(
      data.nodes.find((x) => x.id === data.links[i]["source"]).color
    );
  }
  var subgroups = Array.from(comp_set);
  var colors = Array.from(color_set);

  // list of groups
  let lig_rec_set = new Set();
  for (let i in data.links) {
    lig_rec_set.add(data.links[i]["ligand-receptor"]);
  }
  var groups = Array.from(lig_rec_set);

  let input = [];
  for (let i in groups) {
    input.push({ "ligand-receptor": groups.at(i) });
    for (let j in subgroups) {
      input[i][subgroups.at(j)] = 0;
    }
  }
  for (let i in data.links) {
    for (let j in input) {
      if (input[j]["ligand-receptor"] == data.links[i]["ligand-receptor"]) {
        input[j][data.links[i]["component"]] += 1;
        break;
      }
    }
  }
  let maxVal = 0;
  input.sort((a, b) => {
    let aSum = 0,
      bSum = 0;
    for (let i in a) {
      if (i != "ligand-receptor") aSum += a[i];
    }
    for (let j in b) {
      if (j != "ligand-receptor") bSum += b[j];
    }
    maxVal = Math.max(maxVal, aSum);
    return aSum - bSum;
  });
  console.log(input);

  // add X axis
  var x = d3.scaleBand().domain(groups).range([0, width]).padding(0.2);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // add Y axis
  var y = d3
    .scaleLinear()
    .domain([0, maxVal + 10])
    .range([height, 10]);
  svg.append("g").call(d3.axisLeft(y));

  // color palette = one color per subgroup
  var color = d3.scaleOrdinal().domain(subgroups).range(colors);

  var stackedData = d3.stack().keys(subgroups)(input);

  svg
    .append("g")
    .selectAll("g")
    .data(stackedData)
    .enter()
    .append("g")
    .attr("fill", function (d) {
      return color(d.key);
    })
    .selectAll("rect")
    .data(function (d) {
      return d;
    })
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return x(d.data["ligand-receptor"]);
    })
    .attr("y", function (d) {
      return y(d[1]);
    })
    .attr("height", function (d) {
      return y(d[0]) - y(d[1]);
    })
    .attr("width", x.bandwidth());
}
