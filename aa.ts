import { correlatividades, IDMateria } from "./dataset";
import { write, writeFileSync } from "fs";
import { instance } from "@viz-js/viz";
import { GraphVisualizer } from "./graph_visualizer";
import { Grafo } from "./grafo";



const grafo = new Grafo(correlatividades);

const svg = await GraphVisualizer.visualize(grafo);

writeFileSync('grafo.svg', svg);
