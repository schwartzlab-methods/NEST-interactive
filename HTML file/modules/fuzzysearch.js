import { loadNetwork } from "./network.js";
import { data } from "../globalvars.js";
import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.esm.js";
import { load3D } from "./3d.js";
import { loadHistogram } from "./histogram.js";
export var fuzzySearch = document
  .querySelector("#gene_or_connection")
  .addEventListener("change", (e) => {
    document.querySelector("#gene_or_connection_results").innerHTML = "";
    const options = {
      includeScore: true,
      threshold: 0.3,
    };
    let gene_and_conn_set = new Set();
    for (let i in data.links) {
      gene_and_conn_set.add(data.links[i]["ligand"]);
      gene_and_conn_set.add(data.links[i]["receptor"]);
      gene_and_conn_set.add(data.links[i]["ligand-receptor"]);
    }
    const fuse = new Fuse(Array.from(gene_and_conn_set), options);
    const result = fuse.search(e.target.value);
    for (let i in result) {
      let b = document.createElement("p");
      b.classList.add("text-base", "p-3", "result-child");
      b.innerHTML = result[i].item;
      b.addEventListener("click", function () {
        load3D(b.innerHTML);
        loadHistogram(b.innerHTML);
        //loadNetwork(b.innerHTML);
      });
      document.querySelector("#gene_or_connection_results").appendChild(b);
    }
  });
