import { plan, IDMateria, Plan } from "./dataset";
import { Nodo } from "./nodo";
import { Probabilidad, ProbabilidadCalcular } from "./probabilidad";


type GrafoInterno = {
    [key: string]: Nodo;
}

/**
 * Retorna todas las combinaciones posibles de tamaño k de un array
 */
function calcCombinaciones<T>(arr: T[], k: number): T[][] {
    const result: T[][] = [];

    function backtrack(start: number, path: T[]) {
        if (path.length === k) {
            result.push([...path]);
            return;
        }

        for (let i = start; i < arr.length; i++) {
            path.push(arr[i]);
            backtrack(i + 1, path);
            path.pop();
        }
    }

    backtrack(0, []);
    return result;
}

function esCombinacionDirecta(correlativas: IDMateria[], combinacion: IDMateria[]): boolean {
    const correlativasSet = new Set(correlativas);
    return combinacion.every(item => correlativasSet.has(item));
}

function combinacionToID(combinacion: IDMateria[], aprobadas: IDMateria[]): string {

    function ordenar(combinacion: IDMateria[]): IDMateria[] {
        return combinacion.sort((a, b) => {
            return (a < b) ? -1 : (a > b) ? 1 : 0;
        });
    }

    return ordenar(combinacion).filter(t => t).join(",") + "-" + ordenar(aprobadas).filter(t => t).join(",");
}


function extraerAprobadas(idNodo) {
    const partes = idNodo.split("-");
    const aprobadas = partes[1].split(",").map(m => m.trim());
    return aprobadas;
}

function extraerCombinacion(idNodo) {
    const partes = idNodo.split("-");
    const combinacion = partes[0].split(",").map(m => m.trim());
    return combinacion;
}


export class Grafo {

    grafo: GrafoInterno = {};

    constructor(plan: Plan) {

        // Generar nodo inicial

        this.grafo["0000-"] = new Nodo("0000-", "Inicio", "Inicio", false, [], "9cd141");

        this.iteracion();
        this.iteracion();
        this.iteracion();
        this.iteracion();
    }

    iteracion() {

        // Tomar todos los nodos no expandidos

        const nodosNoExpandidos = Object.values(this.grafo).filter(nodo => !nodo.expandido).map(nodo => nodo.id);

        for (const idNodo of nodosNoExpandidos) {
            this.expandirNodo(idNodo);
        }

    }

    expandirNodo(idNodo: string) {

        console.log("Expandiendo nodo", idNodo);

        const nodo = this.grafo[idNodo];

        // Calcular estados a los que se puede pasar desde el nodo actual

        const cursables = this.getCursables([...extraerAprobadas(idNodo), ...extraerCombinacion(idNodo)] as any);
        console.log(cursables)

        const combinaciones: IDMateria[][] = [];

        for (let k = 1; k <= cursables.length; k++) {
            const combinacionesK = calcCombinaciones(cursables, k);
            combinaciones.push(...combinacionesK);
        }

        // Agregar los nuevos estados al grafo

        for (const combinacion of combinaciones) {

            //console.log("idNodo:", idNodo);

            //console.log("lleva aprobadas: ", extraerAprobadas(idNodo));


            const idCombinacion = combinacionToID(combinacion, [...extraerAprobadas(idNodo), ...extraerCombinacion(idNodo)] as any);

            const nombreNodo = combinacion.map(m => this.getNombre(m)).join(", ");

            if (!this.grafo[idCombinacion]) {
                this.grafo[idCombinacion] = new Nodo(
                    idCombinacion,
                    nombreNodo,
                    nombreNodo,
                    false,
                    []
                );
            }
        }


        this.grafo[idNodo].salientes = combinaciones.map(
            combinacion => combinacionToID(
                combinacion,
                [...extraerAprobadas(idNodo), ...extraerCombinacion(idNodo)] as any
            )
        );

        this.grafo[idNodo].expandido = true;


    }

    /**
     * Obtiene una lista de las asignaturas que se pueden cursar teniendo aprobadas las de la lista
     */
    getCursables(aprobadas: IDMateria[]): IDMateria[] {

        console.log("aprobadas:", aprobadas);

        const cursables: IDMateria[] = [];

        for (const idMateria in plan) {

            if (aprobadas.includes(idMateria as IDMateria)) continue;

            let puedeCursar = true;
            for (const correlativa of plan[idMateria].correlativasDirectas)
                if (!aprobadas.includes(correlativa))
                    puedeCursar = false;

            if (puedeCursar)
                cursables.push(idMateria as IDMateria);
        }

        console.log("cursables:", cursables);

        return cursables;
    }

    getNombre(id: string) {
        if (id === "0000") return "Inicio";
        console.log("id al q se busca nombre ", id);
        return plan[id].nombre;
    }

    getNombreCorto(id: string) {
        if (id === "0000") return "Inicio";
        console.log("id al q se busca nombre corto", id);

        return plan[id].nombreCorto;
    }

    getForceGraph() {

        const nodes: any[] = [];
        const links: any[] = [];

        for (const source in this.grafo)
            nodes.push({ id: source, text: extraerCombinacion(source).map(m => this.getNombreCorto(m)), esIntermedio: Number(source) < 3000 });

        for (const source in this.grafo) {

            for (const target of this.grafo[source].salientes) {

                if (!nodes.find(n => n.id === target))
                    console.log('No se encontró', target);

                if (!nodes.find(n => n.id === source))
                    console.log('No se encontró', source);

                if (source !== target)
                    links.push({ source, target, value: "" });
                else
                    links.push({ source, target, curvature: 1 });
            }
        }

        return { nodes, links };
    }
}
