import { Correlatividades, getNombreMateria, IDMateria, subjectMap } from "./dataset";
import { ProbabilidadCalcular } from "./probabilidad";


const intermedios = {};

function generarCombinaciones2(a: IDMateria, b: IDMateria) {

    const keys: string[] = [];

    let random = Math.floor(Math.random() * 3000);
    intermedios[random] = `${a},-${b}`;
    keys.push(random.toString());

    random = Math.floor(Math.random() * 3000);
    intermedios[random] = `-${a},${b}`;
    keys.push(random.toString());

    random = Math.floor(Math.random() * 3000);
    intermedios[random] = `-${a},-${b}`;
    keys.push(random.toString());

    return keys;
}

function generarCombinaciones3(a: IDMateria, b: IDMateria, c: IDMateria) {

    const keys: string[] = [];

    let random = Math.floor(Math.random() * 3000);
    intermedios[random] = `${a},${b},-${c}`;
    keys.push(random.toString());

    random = Math.floor(Math.random() * 3000);
    intermedios[random] = `${a},-${b},${c}`;
    keys.push(random.toString());

    random = Math.floor(Math.random() * 3000);
    intermedios[random] = `${a},-${b},-${c}`;
    keys.push(random.toString());

    random = Math.floor(Math.random() * 3000);
    intermedios[random] = `-${a},${b},${c}`;
    keys.push(random.toString());

    random = Math.floor(Math.random() * 3000);
    intermedios[random] = `-${a},${b},-${c}`;
    keys.push(random.toString());

    random = Math.floor(Math.random() * 3000);
    intermedios[random] = `-${a},-${b},${c}`;
    keys.push(random.toString());

    random = Math.floor(Math.random() * 3000);
    intermedios[random] = `-${a},-${b},-${c}`;
    keys.push(random.toString());

    return keys;
}

export class Grafo {

    grafo = {};

    getName(id: string) {

        if (intermedios[id]) {
            const sep = intermedios[id].split(',');
            return sep.map(id => {
                if (id[0] === '-')
                    return `NOT ${getNombreMateria(id.slice(1))}`;
                return getNombreMateria(id);
            }).join(' AND ');
        }
        return getNombreMateria(id);
    }

    getIntermedio(id: string) {
        return intermedios[id];
    }

    getEnlaces(desde: string): string[] {
        return Object.keys(this.grafo[desde]);
    }

    getIDbyName(name: string) {

        for (const id in subjectMap) {
            if (subjectMap[id] === name)
                return id;
        }

        return null;
    }

    getProbabilidad(desde: string, hasta: string) {
        return this.grafo[desde][hasta];
    }

    constructor(correlatividades: Correlatividades) {

        for (const hasta in correlatividades) {

            let intermedios: null | string[] = null;

            if (correlatividades[hasta].length === 2)
                intermedios = generarCombinaciones2(correlatividades[hasta][0], correlatividades[hasta][1]);
            else if (correlatividades[hasta].length === 3)
                intermedios = generarCombinaciones3(correlatividades[hasta][0], correlatividades[hasta][1], correlatividades[hasta][2]);

            if (intermedios) {
                for (const intermedio of intermedios) {
                    if (!this.grafo[intermedio])
                        this.grafo[intermedio] = {};

                    const faltan = this.getIntermedio(intermedio).split(',').filter(m => m[0] === '-').map(m => m.slice(1));

                    this.grafo[intermedio][hasta] = new ProbabilidadCalcular(
                        this,
                        faltan as IDMateria[],
                        []
                    );
                }
                for (const correlativa of correlatividades[hasta]) {
                    for (const intermedio of intermedios) {
                        if (!this.grafo[correlativa])
                            this.grafo[correlativa] = {};

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

                        if (!this.grafo[intermedios[i]])
                            this.grafo[intermedios[i]] = {};

                        this.grafo[intermedios[i]][intermedios[j]] = new ProbabilidadCalcular(
                            this,
                            filtradas as IDMateria[],
                            []
                        );

                    }
                }

                // Agregar caminos directos cuando se hagan todas las materias juntas

                const todas = this.getIntermedio(intermedios[0]).split(',').map(t => t[0] === '-' ? t.slice(1) : t);

                for (const correlativa of correlatividades[hasta]) {
                    this.grafo[correlativa][hasta] = new ProbabilidadCalcular(
                        this,
                        todas as IDMateria[],
                        []
                    );
                }

            }
            else {
                for (const desde of correlatividades[hasta]) {
                    if (!this.grafo[desde])
                        this.grafo[desde] = {};
                    this.grafo[desde][hasta] = new ProbabilidadCalcular(
                        this,
                        [desde] as IDMateria[],
                        []
                    )
                }
            }
        }
    }
}