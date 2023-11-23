import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { svg, data } from "../globalvars.js";
const margin = { top: 10, right: 10, bottom: 10, left: 10 };
const width = 1000 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;
export function loadNetwork(filter) {
  // reset svg
  let svgCpy = svg,
    dataCpy = data;
  svgCpy.selectAll("*").remove();
  let g = svgCpy
    .append("g")
    .attr("id", "g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  g.append("svg:defs")
    .append("svg:marker")
    .attr("id", "arrowhead")
    .attr("refX", 3)
    .attr("refY", 2)
    .attr("markerWidth", 20)
    .attr("markerHeight", 20)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 L 4 2 L 0 4 z");

  // filter with fuzzy search
  if (filter != "NULL") {
    let newData = JSON.parse(JSON.stringify(dataCpy));
    let nodeSet = new Set();
    if (filter.indexOf("-") > -1) {
      for (let i = 0; i < newData.links.length; i++) {
        if (newData.links[i]["ligand-receptor"] != filter) {
          newData.links.splice(i, 1);
          i--;
        } else {
          nodeSet.add(newData.links[i]["source"]["id"]);
          nodeSet.add(newData.links[i]["target"]["id"]);
        }
      }
      for (let i = 0; i < newData.nodes.length; i++) {
        if (!nodeSet.has(newData.nodes[i]["id"])) {
          newData.nodes[i]["color"] = "#D3D3D3";
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
        } else {
          nodeSet.add(newData.links[i]["source"]["id"]);
          nodeSet.add(newData.links[i]["target"]["id"]);
        }
      }
      for (let i = 0; i < newData.nodes.length; i++) {
        if (!nodeSet.has(newData.nodes[i]["id"])) {
          newData.nodes[i]["color"] = "#D3D3D3";
        }
      }
    }
    dataCpy = newData;
  }

  // initialize the links (edges)
  const link = g
    .selectAll("line")
    .data(dataCpy.links)
    .join("line")
    .style("stroke", "black")
    .style("stroke-width", (link) => link.value + 1)
    .style("marker-end", "url(#arrowhead)");

  // initialize the nodes
  let circles = [];
  let rects = [];
  let ellipses = [];
  for (let i = 0; i < dataCpy.nodes.length; i++) {
    if (dataCpy.nodes[i].shape == "circle") circles.push(dataCpy.nodes[i]);
    else if (dataCpy.nodes[i].shape == "box") rects.push(dataCpy.nodes[i]);
    else ellipses.push(dataCpy.nodes[i]);
  }
  const nodeCir = g
    .selectAll("circle")
    .data(circles)
    .join("circle")
    .attr("r", 5)
    .style("fill", (d) => d.color);
  const nodeRect = g
    .selectAll("rect")
    .data(rects)
    .join("rect")
    .attr("width", 8)
    .attr("height", 4)
    .style("fill", (d) => d.color);
  const nodeElli = g
    .selectAll("ellipse")
    .data(ellipses)
    .join("ellipse")
    .attr("rx", 8)
    .attr("ry", 4)
    .style("fill", (d) => d.color);

  const simulation = d3
    .forceSimulation(dataCpy.nodes)
    .nodes(dataCpy.nodes)
    .force("link", d3.forceLink(dataCpy.links))
    .on("end", ticked);
  const zoomRect = svgCpy
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all");
  const zoom = d3
    .zoom()
    .scaleExtent([1 / 2, 64])
    .on("zoom", function () {
      g.attr("transform", d3.zoomTransform(this));
    });
  zoomRect.call(zoom).call(zoom.translateTo, width / 2, height / 2);

  function ticked() {
    link
      .attr("x1", function (d) {
        return d.source.fx;
      })
      .attr("y1", function (d) {
        return d.source.fy;
      })
      .attr("x2", function (d) {
        return d.target.fx;
      })
      .attr("y2", function (d) {
        return d.target.fy;
      });

    nodeRect
      .attr("x", function (d) {
        return d.fx - 4;
      })
      .attr("y", function (d) {
        return d.fy - 2;
      });
    nodeCir
      .attr("cx", function (d) {
        return d.fx;
      })
      .attr("cy", function (d) {
        return d.fy;
      });
    nodeElli
      .attr("cx", function (d) {
        return d.fx - 4;
      })
      .attr("cy", function (d) {
        return d.fy - 2;
      });
  }
}
