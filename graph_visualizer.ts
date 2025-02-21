import { instance } from "@viz-js/viz";
import { IDMateria } from './dataset';

export class GraphVisualizer {

    private static generateDOT(grafoObj: any): string {

        const grafo = grafoObj.grafo;

        let dotStr = 'digraph G {\n';
        dotStr += '  rankdir=LR;\n';  // Left to right layout
        dotStr += '  node [shape=box, style=rounded];\n';  // Node styling

        // Add edges (which implicitly adds all nodes)
        for (const source in grafo) {
            for (const target in grafo[source]) {
                dotStr += `  "${grafoObj.getName(source)}" -> "${grafoObj.getName(target)}" [label="${grafo[source][target].toString()}"];\n`;
            }
        }

        dotStr += '}';
        return dotStr;
    }

    static async visualize(grafo: any): Promise<string> {

        const dotString = this.generateDOT(grafo);

        try {
            const viz = await instance();

            const svg = viz.renderString(dotString, {
                engine: 'dot',
                format: 'svg'
            });

            return svg;
        } catch (error) {
            console.error('Error generating graph visualization:', error);
            throw error;
        }
    }
}
