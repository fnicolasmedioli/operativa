import { plan, IDMateria, Plan } from "./dataset";
import { Link } from "./link";
import { Nodo } from "./nodo";
import { Probabilidad, ProbabilidadCalcular } from "./probabilidad";
import { textoLinkAprobarMaterias } from "./util";


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
    if (partes[1] === "") return [];
    const aprobadas = partes[1].split(",").map(m => m.trim());
    return aprobadas;
}

function extraerCombinacion(idNodo) {
    const partes = idNodo.split("-");
    const combinacion = partes[0].split(",").map(m => m.trim());
    return combinacion;
}

function getColorParaIteracion(iteracion: number) {
    switch (iteracion) {
        case 1:
            return "#fb8500";
        case 2:
            return "#023047";
        case 3:
            return "#ffb703";
        case 4:
            return "green";
        default:
            return "#8ecae6";
    }
}

type Camino = string[];

type CaminoConProbabilidad = {
    camino: Camino;
    probabilidad: number;
};

const materiaFinal = "6212";

export class Grafo {

    grafo: GrafoInterno = {};

    iteracion = 0;

    constructor(plan: Plan) {

        // Generar nodo inicial

        this.grafo["0000-"] = new Nodo("0000-", "Inicio", "Inicio", false, [], "#219ebc");

        this.iterar();
        this.iterar();
        this.iterar();
        this.iterar();

        this.calcularProbabilidades();

        this.backtracking(["0000-"]);

        this.imprimirResultadosBacktracking();

        console.log(this.caminos6212.reduce((a, b) => a + b.probabilidad, 0));
    }

    caminos6212: CaminoConProbabilidad[] = [];

    backtracking(path: string[], probAcumulada: number = 1) {
        const nodoActual = path[path.length - 1];

        // Si llegamos a 6212, guardamos el camino con su probabilidad
        if (extraerCombinacion(nodoActual).includes(materiaFinal)) {
            this.caminos6212.push({
                camino: [...path],
                probabilidad: probAcumulada
            });
            return;
        }

        const nodo = this.grafo[nodoActual];

        for (const link of nodo.salientes) {
            const siguienteID = link.getTargetID();
            const prob = link.getProbabilidad();

            // Evitar caminos con probabilidad indefinida
            if (prob == null) continue;

            // Evitamos ciclos por seguridad
            if (path.includes(siguienteID)) continue;

            path.push(siguienteID);
            this.backtracking(path, probAcumulada * prob);
            path.pop(); // backtrack
        }
    }
    imprimirResultadosBacktracking() {
        for (const { camino, probabilidad } of this.caminos6212.slice(-5)) {
            const pathStr = camino
                .map((id, index) => {
                    const aprobadas = extraerAprobadas(id).join(",");
                    const indent = "  ".repeat(index); // Incremental indentation
                    return `${indent}[${id}] (${aprobadas})`;
                })
                .join("\n"); // New line for each state

            console.log(`${pathStr}\nProbabilidad total: ${(probabilidad * 100).toFixed(5)}%\n\n`);
        }
    }



    /**
     * Calcula la multiplicacion de las probabilidades de cada enlace
     */
    calcularProbabilidades() {
        for (const idNodo in this.grafo) {
            const nodo = this.grafo[idNodo];

            if (nodo.id === "0000-") {
                for (const link of nodo.salientes) {
                    link.setProbabilidad(1 / 7);
                }
                continue;
            }

            let sumatoriaLinks = 0;

            for (const link of nodo.salientes) {
                const aprobar = link.aprobar.map(m => plan[m]?.probAprobar).filter(m => m);
                const desaprobar = link.desaprobar.map(m => plan[m]?.probDesaprobar).filter(m => m);

                const probAprobar = aprobar.reduce((a, b) => a! * b!, 1);
                const probDesaprobar = desaprobar.reduce((a, b) => a! * b!, 1);

                const probabilidad = probAprobar! * probDesaprobar!;

                sumatoriaLinks += probabilidad;

                link.setProbabilidad(probabilidad);
            }

            // Agrupamos por probabilidad
            const grupos: Record<string, Link[]> = {};
            for (const link of nodo.salientes) {
                const key = link.getProbabilidad()?.toFixed(10); // Redondeo para evitar errores por punto flotante
                if (!grupos[key!]) grupos[key!] = [];
                grupos[key!].push(link);
            }

            // Ajustamos probabilidades dividiendo por el tamaño del grupo
            for (const key in grupos) {
                const grupo = grupos[key];
                if (grupo.length > 1) {
                    for (const link of grupo) {
                        const original = link.getProbabilidad();
                        link.setProbabilidad(original! / grupo.length);
                    }
                }
            }
        }
    }


    iterar() {

        this.iteracion++;

        // Tomar todos los nodos no expandidos

        const nodosNoExpandidos = Object.values(this.grafo).filter(nodo => !nodo.expandido).map(nodo => nodo.id);

        for (const idNodo of nodosNoExpandidos) {
            this.expandirNodo(idNodo);
        }

    }

    /**
     * Expande un nodo, para esto lo primero es generar las combinaciones de resultados de las cursadas actuales.
     * Por ejemplo, si se esta cursando A y B, el resultado del cuatrimestre puede ser:
     * A y B aprobadas, A aprobada, B aprobada, Ninguna aprobada
     * 
     * Nota: No se incluye loops por lo q en el ejemplo no iria "Ninguna aprobada"
     */
    expandirNodo(idNodo: string) {

        const cursadasActuales = extraerCombinacion(idNodo);

        const combinacionesCursadasActuales: IDMateria[][] = [];

        for (let k = 1; k <= cursadasActuales.length; k++) {
            const combinacionesK = calcCombinaciones(cursadasActuales, k) as IDMateria[][];
            combinacionesCursadasActuales.push(...combinacionesK);
        }

        for (const combinacionActuales of combinacionesCursadasActuales) {
            this.expandirNodoAprobando(idNodo, combinacionActuales);
        }

    }

    /**
     * Construye los nodos adyacentes asumiendo que en el nodo actual se aprueban
     * las materias de la lista.
     */
    expandirNodoAprobando(idNodo: string, aprobando: IDMateria[]) {

        const nodo = this.grafo[idNodo];

        // Calcular estados a los que se puede pasar desde el nodo actual

        const cursables = this.getCursables([...extraerAprobadas(idNodo), ...aprobando] as any);

        const combinaciones: IDMateria[][] = [];

        for (let k = 1; k <= cursables.length; k++) {
            const combinacionesK = calcCombinaciones(cursables, k);
            combinaciones.push(...combinacionesK);
        }

        // Agregar los nuevos estados al grafo

        for (const combinacion of combinaciones) {

            const idCombinacion = combinacionToID(combinacion, [...extraerAprobadas(idNodo), ...aprobando] as any);

            const nombreNodo = combinacion.map(m => this.getNombre(m)).join(", ");

            if (!this.grafo[idCombinacion]) {
                this.grafo[idCombinacion] = new Nodo(
                    idCombinacion,
                    nombreNodo,
                    nombreNodo,
                    false,
                    [],
                    getColorParaIteracion(this.iteracion)
                );
            }
        }

        const cursandoActualemente = extraerCombinacion(idNodo);

        this.grafo[idNodo].salientes.push(...combinaciones.map(

            combinacion => {

                const desaprobadas: IDMateria[] = [];

                combinacion.map(asignatura => {
                    if (cursandoActualemente.includes(asignatura)) {
                        desaprobadas.push(asignatura);
                        return null;
                    }
                });

                return new Link(
                    combinacionToID(
                        combinacion,
                        [...extraerAprobadas(idNodo), ...aprobando] as any
                    ),
                    textoLinkAprobarMaterias(
                        aprobando.map(m => {
                            return {
                                nombreCortoMateria: this.getNombreCorto(m),
                                prob: plan[m]?.probAprobar!
                            };
                        }),
                        desaprobadas.map(m => {
                            return {
                                nombreCortoMateria: this.getNombreCorto(m),
                                prob: plan[m]?.probDesaprobar!
                            };
                        })
                    ),
                    aprobando,
                    desaprobadas
                );
            }
        ));

        this.grafo[idNodo].expandido = true;
    }

    /**
     * Obtiene una lista de las asignaturas que se pueden cursar teniendo aprobadas las de la lista
     */
    getCursables(aprobadas: IDMateria[]): IDMateria[] {

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

        return cursables;
    }

    getNombre(id: string) {
        if (id === "0000") return "Inicio";
        return plan[id].nombre;
    }

    getNombreCorto(id: string) {
        if (id === "0000") return "Inicio";
        return plan[id].nombreCorto;
    }

    getForceGraph() {

        const nodes: any[] = [];
        const links: any[] = [];

        for (const source in this.grafo) {

            const aprobadas = extraerAprobadas(source).map(m => this.getNombreCorto(m)).filter(m => m != "Inicio");

            nodes.push({
                id: source,
                text: extraerCombinacion(source).map(m => this.getNombreCorto(m)),
                color: this.grafo[source].color,
                aprobadas: (aprobadas.length > 0) ? aprobadas : ["Ninguna"],
            });
        }

        for (const source in this.grafo) {

            for (const target of this.grafo[source].salientes) {

                if (!nodes.find(n => n.id === target.getTargetID()))
                    console.log('No se encontró', target);

                if (!nodes.find(n => n.id === source))
                    console.log('No se encontró', source);

                /*
                if (source !== target)
                    links.push({ source, target, value: "" });
                else
                    links.push({ source, target, curvature: 1 });
                */

                links.push({
                    source,
                    target: target.getTargetID(),
                    value: target.getProbText() + " -> " + (target.getProbabilidad()?.toFixed(2) ?? ""),
                });
            }
        }

        return { nodes, links };
    }
}
