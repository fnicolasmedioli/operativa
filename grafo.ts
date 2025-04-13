import { plan, IDMateria, Plan } from "./dataset";
import { ProbabilidadCalcular } from "./probabilidad";

const intermedios = {};

function generarCombinacionesN(...materias: IDMateria[]): string[] {
    const keys: string[] = [];

    const combinaciones: string[][] = [];

    // Función recursiva para generar combinaciones de signos
    function generar(idx: number, actual: string[]) {
        if (idx === materias.length) {
            combinaciones.push([...actual]);
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

    getName(id: string) {

        if (intermedios[id]) {
            const sep = intermedios[id].split(',');
            return sep.map(id => {
                if (id[0] === '-')
                    return `NOT ${plan[id.slice(1)].nombreCorto}`;
                return plan[id].nombreCorto;
            }).join(' AND ');
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

        for (const hasta in plan) {

            let intermedios: null | string[] = null;

            if (plan[hasta].correlativasDirectas.length >= 2)
                intermedios = generarCombinacionesN(...plan[hasta].correlativasDirectas);

            if (intermedios) {
                for (const intermedio of intermedios) {

                    if (!this.grafo[intermedio]) this.grafo[intermedio] = {};
                    if (!this.grafo[hasta]) this.grafo[hasta] = {};

                    const faltan = this.getIntermedio(intermedio).split(',').filter(m => m[0] === '-').map(m => m.slice(1));

                    this.grafo[intermedio][hasta] = new ProbabilidadCalcular(
                        this,
                        faltan as IDMateria[],
                        []
                    );
                }
                for (const correlativa of plan[hasta]['correlativasDirectas']) {
                    for (const intermedio of intermedios) {
                        if (!this.grafo[correlativa]) this.grafo[correlativa] = {};

                        const aprobaron = this.getIntermedio(intermedio).split(',').filter(m => m[0] !== '-');
                        const desaprobaron = this.getIntermedio(intermedio).split(',').filter(m => m[0] === '-').map(m => m.slice(1));

                        this.grafo[correlativa][intermedio] = new ProbabilidadCalcular(
                            this,
                            aprobaron as IDMateria[],
                            desaprobaron as IDMateria[]
                        );
                    }
                }

                // Agregar caminos entre intermedios

                for (let i = 0; i < intermedios.length; i++) {
                    for (let j = 0; j < intermedios.length; j++) {
                        if (i === j) continue;

                        // comprobar si hay materias aprobadas en j pero no en i
                        const aprobaronJ = this.getIntermedio(intermedios[j]).split(',').filter(m => m[0] !== '-');
                        const aprobaronI = this.getIntermedio(intermedios[i]).split(',').filter(m => m[0] !== '-');

                        let no_sirve = false;
                        for (const t of aprobaronJ)
                            if (!aprobaronI.includes(t)) {
                                no_sirve = true;
                                break;
                            }

                        if (no_sirve)
                            continue;

                        // calcular las materias aprobadas en i pero no en j

                        const filtradas = aprobaronI.filter(m => !aprobaronJ.includes(m));

                        if (filtradas.length === 0)
                            continue;

                        // entonces agregar un camino entre i y j, aprobando las filtradas

                        if (!this.grafo[intermedios[i]]) this.grafo[intermedios[i]] = {};
                        if (!this.grafo[intermedios[j]]) this.grafo[intermedios[j]] = {};

                        this.grafo[intermedios[i]][intermedios[j]] = new ProbabilidadCalcular(
                            this,
                            filtradas as IDMateria[],
                            []
                        );

                    }
                }

                // Agregar caminos directos cuando se hagan todas las materias juntas

                const todas = this.getIntermedio(intermedios[0]).split(',').map(t => t[0] === '-' ? t.slice(1) : t);

                for (const correlativa of plan[hasta]["correlativasDirectas"]) {
                    this.grafo[correlativa][hasta] = new ProbabilidadCalcular(
                        this,
                        todas as IDMateria[],
                        []
                    );
                }

            }
            else {
                for (const desde of plan[hasta]["correlativasDirectas"]) {
                    if (!this.grafo[desde]) this.grafo[desde] = {};
                    if (!this.grafo[hasta]) this.grafo[hasta] = {};

                    this.grafo[desde][hasta] = new ProbabilidadCalcular(
                        this,
                        [desde] as IDMateria[],
                        []
                    )
                }
            }
        }

        // Agregar autoenlaces

        for (const materia in plan) {
            if (!this.grafo[materia]) this.grafo[materia] = {};

            this.grafo[materia][materia] = new ProbabilidadCalcular(
                this,
                [],
                [materia] as IDMateria[]
            );
        }

    }
}