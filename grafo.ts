import { Correlatividades, getNombreMateria, IDMateria } from "./dataset";
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
                // Agregar caminos entre intermedios ( no anda )

                /*
                for (let i = 0; i < intermedios.length; i++) {
                    for (let j = 0; j < intermedios.length; j++) {
                        if (i === j) continue;

                        // Encontrar las materias que se aprobaron en i pero no en j, y comprobar que no haya materias que se hayan aprobado en j pero no en i
                        const materiasAprobadasEnI = intermedios[i].split(',').filter(m => m[0] !== '-');
                        const materiasAprobadasEnJ = intermedios[j].split(',').filter(m => m[0] !== '-');
                        const materiasNoAprobadasEnJ = intermedios[j].split(',').filter(m => m[0] === '-');
                        const materiasNoAprobadasEnI = intermedios[i].split(',').filter(m => m[0] === '-');

                        const materiasAprobadasSoloEnI = materiasAprobadasEnI.filter(m => !materiasAprobadasEnJ.includes(m));
                        const materiasAprobadasSoloEnJ = materiasAprobadasEnJ.filter(m => !materiasAprobadasEnI.includes(m));

                        const materiasNoAprobadasSoloEnI = materiasNoAprobadasEnI.filter(m => !materiasNoAprobadasEnJ.includes(m)).map(m => m.slice(1));

                        if (materiasAprobadasSoloEnJ.length > 0)
                            continue;

                        if (materiasAprobadasSoloEnI.length == 0)
                            continue;

                        console.log("noAprobadasSOloEnI", materiasNoAprobadasSoloEnI);

                        if (!this.grafo[intermedios[i]]) this.grafo[intermedios[i]] = {};
                        this.grafo[intermedios[i]][intermedios[j]] = new ProbabilidadCalcular(
                            this,
                            materiasAprobadasSoloEnI as IDMateria[],
                            materiasNoAprobadasSoloEnI as IDMateria[]
                        );
                    }
                        
                }
                    */
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