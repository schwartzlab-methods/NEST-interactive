import { data, setLastFilter } from "../globalvars.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { load3D } from "./3d.js";
export function loadHistogram(filter) {
  let dataCpy = data;
  if (filter != "NULL") {
    let newData = JSON.parse(JSON.stringify(data));
    if (filter.indexOf("-") > -1) {
      for (let i = 0; i < newData.links.length; i++) {
        if (newData.links[i]["ligand-receptor"] != filter) {
          newData.links.splice(i, 1);
          i--;
        }
      }
    } else {
      for (let i = 0; i < newData.links.length; i++) {
        if (
          newData.links[i]["ligand"] != filter &&
          newData.links[i]["receptor"] != filter
        ) {
          newData.links.splice(i, 1);
          i--;
        }
      }
    }
    dataCpy = newData;
  }

  // set the dimensions and margins of the graph
  let margin = { top: 10, right: 30, bottom: 100, left: 50 },
    width = ($(window).width() * 11) / 12 - margin.left - margin.right,
    height = ($(window).height() * 4) / 6 - margin.top - margin.bottom;
  d3.select("#histogram").selectAll("*").remove();

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
  for (let i in dataCpy.links) {
    comp_set.add(dataCpy.links[i]["component"]);
    if (dataCpy.links[i]["source"]["color"] != null)
      color_set.add(dataCpy.links[i]["source"]["color"]);
    else color_set.add(dataCpy.nodes[dataCpy.links[i]["source"]]["color"]);
  }
  for (let i in dataCpy.nodes) {
  }
  var subgroups = Array.from(comp_set);
  var colors = Array.from(color_set);

  // list of groups
  let lig_rec_set = new Set();
  for (let i in dataCpy.links) {
    lig_rec_set.add(dataCpy.links[i]["ligand-receptor"]);
  }
  var groups = Array.from(lig_rec_set);

  let input = [];
  for (let i in groups) {
    input.push({ "ligand-receptor": groups.at(i) });
    for (let j in subgroups) {
      input[i][subgroups.at(j)] = 0;
    }
  }
  for (let i in dataCpy.links) {
    for (let j in input) {
      if (input[j]["ligand-receptor"] == dataCpy.links[i]["ligand-receptor"]) {
        input[j][dataCpy.links[i]["component"]] += 1;
        break;
      }
    }
  }

  input.sort((a, b) => {
    let aSum = 0,
      bSum = 0;
    for (let k in a) {
      if (k != "ligand-receptor") aSum += a[k];
      if (k != "ligand-receptor") bSum += b[k];
    }
    return aSum - bSum;
  });
  let groupsCpy = [];
  let maxVal = 0;
  for (let i = input.length - 1; i >= 0; i--) {
    let sum = 0;
    for (let k in input[i]) {
      if (k != "ligand-receptor") sum += input[i][k];
    }
    maxVal = Math.max(sum, maxVal);
    groupsCpy.push(input[i]["ligand-receptor"]);
  }
  groups = groupsCpy;

  // add X axis
  var x = d3.scaleBand().domain(groups).range([0, width]).padding(0.2);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

  // add Y axis
  var y = d3
    .scaleLinear()
    .domain([0, maxVal + 10])
    .range([height, 10]);
  svg.append("g").call(d3.axisLeft(y));

  // color palette = one color per subgroup
  var color = d3.scaleOrdinal().domain(subgroups).range(colors);

  var stackedData = d3
    .stack()
    .keys(subgroups)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone)(input);

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
    .attr("width", x.bandwidth())
    .on("click", function (d) {
      setLastFilter(d.target.__data__.data["ligand-receptor"]);
      load3D({
        type: "nodeSel",
        data: d.target.__data__.data["ligand-receptor"],
      });
      loadHistogram(d.target.__data__.data["ligand-receptor"]);
    });
}
