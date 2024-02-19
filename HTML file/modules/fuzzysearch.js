import { data, setLastFilter, colourType, vertexTypes } from "../globalvars.js";
import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.esm.js";
import { load3D } from "./3d.js";
import { loadHistogram } from "./histogram.js";

function generateFuzzySearch(e, resultsID, typeSel) {
  document.querySelector(resultsID).innerHTML = "";
  const options = {
    includeScore: true,
    threshold: 0.3,
  };
  let gene_and_conn_set = new Set();
  let fuse;
  if (typeSel == "Vertex Type") {
    fuse = new Fuse(Object.keys(vertexTypes), options);
  } else {
    for (let i in data.links) {
      if (typeSel == "") {
        gene_and_conn_set.add(data.links[i]["ligand"]);
        gene_and_conn_set.add(data.links[i]["receptor"]);
      }
      gene_and_conn_set.add(data.links[i]["ligand-receptor"]);
    }
    fuse = new Fuse(Array.from(gene_and_conn_set), options);
  }
  const result = fuse.search(e.target.value);
  for (let i in result) {
    let b = document.createElement("p");
    b.classList.add("text-base", "p-3", "result-child");
    b.innerHTML = result[i].item;
    b.addEventListener("click", function () {
      if (typeSel == "") {
        setLastFilter(b.innerHTML);
        load3D({ type: "nodeSel", data: b.innerHTML });
        loadHistogram(b.innerHTML);
      } else {
        document.getElementById("colour_type_input").value = b.innerHTML;
      }
    });
    document.querySelector(resultsID).appendChild(b);
  }
}

export var fuzzySearchGeneOrConnection = document
  .querySelector("#gene_or_connection")
  .addEventListener("keydown", (e) => {
    generateFuzzySearch(e, "#gene_or_connection_results", "");
  });

export var fuzzySearchColourType = document
  .querySelector("#colour_type_input")
  .addEventListener("keydown", (e) => {
    if (colourType == "Ligand-Receptor") {
      generateFuzzySearch(e, "#colour_type_results", "Ligand-Receptor");
    } else if (colourType == "Vertex Type") {
      generateFuzzySearch(e, "#colour_type_results", "Vertex Type");
    }
  });
