import { plan, IDMateria } from "./dataset";
import { readFileSync, write, writeFileSync } from "fs";
import { Grafo } from "./grafo";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const grafo = new Grafo(plan);
const graphData = JSON.stringify(grafo.getForceGraph());

const templatePath = join(__dirname, "template.txt");
const template = readFileSync(templatePath, "utf-8");
const finalHtml = template.replace("{{GRAPH_DATA}}", graphData);
const outputPath = join(__dirname, "index.html");
writeFileSync(outputPath, finalHtml);

console.log("✅ Archivo index.html generado con éxito.");
