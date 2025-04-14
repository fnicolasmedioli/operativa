import { plan, IDMateria, Plan } from "./dataset";
import { ProbabilidadCalcular } from "./probabilidad";

const intermedios = {};

function generarCombinacionesN(...materias: IDMateria[]): string[] {
    const keys: string[] = [];

    const combinaciones: string[][] = [];

    function generar(idx: number, actual: string[]) {
        if (idx === materias.length) {
            // Verificar si al menos uno no es negativo y si hay solo un positivo
            const tienePositiva = actual.some(id => id[0] !== '-');
            const tieneSoloUnPositivo = actual.filter(id => id[0] !== '-').length === 1;

            // Solo agregar si hay al menos una positiva y no es un único positivo
            if (tienePositiva && !tieneSoloUnPositivo) {
                combinaciones.push([...actual]);
            }
            return;
        }

        // Versión positiva
        actual.push(materias[idx]);
        generar(idx + 1, actual);
        actual.pop();

        // Versión negativa
        actual.push(`-${materias[idx]}`);
        generar(idx + 1, actual);
        actual.pop();
    }


    generar(0, []);

    for (const combo of combinaciones) {
        const random = Math.floor(Math.random() * 3000);

        intermedios[random] = combo.join(',');
        keys.push(random.toString());
    }

    return keys;
}

export class Grafo {

    grafo = {};
    nodoMateriasAprobadas: Record<string, string[]> = {};
    yaAprobadasPorNodo: { [id: string]: IDMateria[] } = {};


    getForceGraph() {
        const nodes: any[] = [];
        const links: any[] = [];

        for (const source in this.grafo)
            nodes.push({ id: source, text: this.getName(source), esIntermedio: Number(source) < 3000 });

        for (const source in this.grafo) {
            for (const target in this.grafo[source]) {

                if (!nodes.find(n => n.id === target))
                    console.log('No se encontró', target);

                if (!nodes.find(n => n.id === source))
                    console.log('No se encontró', source);

                if (source !== target)
                    links.push({ source, target, value: this.grafo[source][target].toString() });
                else
                    links.push({ source, target, curvature: 1 });
            }
        }

        return { nodes, links };
    }

    getYaAprobado(id: string): IDMateria[] {
        if (!this.yaAprobadasPorNodo[id]) {
            this.yaAprobadasPorNodo[id] = [];
        }
        return this.yaAprobadasPorNodo[id];
    }

    getName(id: string) {

        if (intermedios[id]) {
            const sep = intermedios[id].split(',');

            return sep
                .filter(id => id[0] !== '-') // solo los válidos
                .map(id => plan[id].nombreCorto)
                .join(' AND ');

        }
        return plan[id].nombreCorto;
    }

    getIntermedio(id: string) {
        return intermedios[id];
    }

    getEnlaces(desde: string): string[] {
        return Object.keys(this.grafo[desde]);
    }

    getIDbyName(name: string) {

        for (const id in plan) {
            if (plan[id].nombreCorto === name || plan[id].nombre === name)
                return id;
        }

        return null;
    }

    getProbabilidad(desde: string, hasta: string) {
        return this.grafo[desde][hasta];
    }

    constructor(plan: Plan) {

        const obtenerMateriasHabilitadas = (plan: Plan, materiasAprobadas: string[]): string[] => {
            return Object.entries(plan)
                .filter(([codigo, materia]) =>
                    codigo !== "0000" &&
                    materia.correlativasDirectas.every(correlativa => materiasAprobadas.includes(correlativa)) &&
                    !materiasAprobadas.includes(codigo)
                )
                .map(([codigo]) => codigo);
        };

        const obtenerCombinaciones = (materias: string[]): string[][] => {
            const resultado: string[][] = [];
            const n = materias.length;

            for (let i = 1; i < (1 << n); i++) { // 1 a 2^n - 1
                const combinacion: string[] = [];
                for (let j = 0; j < n; j++) {
                    if (i & (1 << j)) {
                        combinacion.push(materias[j]);
                    }
                }
                if (combinacion.length > 1) {
                    resultado.push(combinacion);
                }
            }

            return resultado;
        };

        const procesarNodoRecursivo = (idNodo: string, materiasAprobadas: string[]) => {
            const nuevasHabilitadas = obtenerMateriasHabilitadas(plan, materiasAprobadas);
            const nuevasCombinaciones = obtenerCombinaciones(nuevasHabilitadas);

            for (const combinacion of nuevasCombinaciones) {
                const nuevoIdIntermedio = Math.floor(Math.random() * 3000).toString();
                intermedios[nuevoIdIntermedio] = combinacion.join(',');

                if (!this.grafo[idNodo]) this.grafo[idNodo] = {};
                this.grafo[idNodo][nuevoIdIntermedio] = new ProbabilidadCalcular(this, materiasAprobadas as IDMateria[], []);

                if (!this.grafo[nuevoIdIntermedio]) this.grafo[nuevoIdIntermedio] = {};

                for (const materia of combinacion) {
                    if (!this.grafo[materia]) this.grafo[materia] = {};

                    this.grafo[nuevoIdIntermedio][materia] = new ProbabilidadCalcular(this, [materia as IDMateria], []);

                    const acumulado = [
                        ...(this.getYaAprobado(nuevoIdIntermedio) ?? []),
                        ...(this.getYaAprobado(idNodo) ?? []),
                        materia as IDMateria
                    ];

                    this.yaAprobadasPorNodo[materia] = Array.from(new Set(acumulado));
                }

                this.yaAprobadasPorNodo[nuevoIdIntermedio] = Array.from(new Set([
                    ...materiasAprobadas,
                    ...combinacion
                ])) as IDMateria[];

                procesarNodoRecursivo(nuevoIdIntermedio, this.yaAprobadasPorNodo[nuevoIdIntermedio]);
            }
        };

        // Inicializar el grafo con self-loops
        for (const id in this.grafo) {
            if (!this.grafo[id]) this.grafo[id] = {};
            if (!this.grafo[id][id]) {
                this.grafo[id][id] = new ProbabilidadCalcular(this, [id] as IDMateria[], []);
            }
        }

        // Conectar el nodo inicial "0000" a todas las materias sin correlativas directas
        for (const id in plan) {
            if (plan[id].correlativasDirectas.length === 0 && id !== "0000") {
                if (!this.grafo["0000"]) this.grafo["0000"] = {};
                if (!this.grafo[id]) this.grafo[id] = {};

                this.grafo["0000"][id] = new ProbabilidadCalcular(this, [<IDMateria>"0000"], []);
            }
        }

        // Procesar recursivamente desde el nodo inicial
        procesarNodoRecursivo("0000", []);
    }
}
