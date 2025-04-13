import { plan, IDMateria } from "./dataset";
import { write, writeFileSync } from "fs";
import { instance } from "@viz-js/viz";
import { GraphVisualizer } from "./graph_visualizer";
import { Grafo } from "./grafo";



const grafo = new Grafo(plan);


console.log("force graph");
console.log(JSON.stringify(grafo.getForceGraph()));


//const svg = await GraphVisualizer.visualize(grafo);

//writeFileSync('grafo.svg', svg);

/*
const enlaces = grafo.getEnlaces("6421");

console.log("enlaces: ",enlaces);

console.log("------");
for (const enlace of enlaces) {
    const nombre = grafo.getName(enlace);
    console.log("nombre: ",nombre);
    const probabilidad = grafo.getProbabilidad("6421", enlace);

    console.log(`"${nombre}" con probabilidad ${probabilidad.toString()}`);
}
console.log("------");
*/