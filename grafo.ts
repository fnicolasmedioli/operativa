import { Correlatividades, getNombreMateria, IDMateria } from "./dataset";


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

    grafo = {};

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
                    this.grafo[intermedio][hasta] = Math.random();
                }
                for (const correlativa of correlatividades[hasta]) {
                    for (const intermedio of intermedios) {
                        if (!this.grafo[correlativa])
                            this.grafo[correlativa] = {};
                        this.grafo[correlativa][intermedio] = Math.random();
                    }
                }
            }
            for (const desde of correlatividades[hasta]) {
                if (!this.grafo[desde])
                    this.grafo[desde] = {};
                this.grafo[desde][hasta] = Math.random();
            }

        }
    }
}