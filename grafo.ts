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

        for (const hasta in plan) {

            let intermedios: null | string[] = null;

            if (plan[hasta].correlativasDirectas.length >= 2)
                intermedios = generarCombinacionesN(...plan[hasta].correlativasDirectas);

                

            if (intermedios) {
                for (const intermedio of intermedios) {
            
                    if (!this.grafo[intermedio]) this.grafo[intermedio] = {};
                    if (!this.grafo[hasta]) this.grafo[hasta] = {};
            
                    //hay negativos
                    let negativos = false;
                    for (const mat of intermedio) {
                        if (mat[0] === '-') {
                            negativos = true;
                            break;
                        }
                    }

                    // Nuevo: conectar las materias individuales al intermedio
                    const materias = this.getIntermedio(intermedio).split(',');
                    for (const mat of materias) {
                        const matID = mat.startsWith('-') ? mat.slice(1) : mat;

                        if (mat[0] === '-'){
                            //transicion al nodo faltante
                            this.grafo[intermedio][matID] = new ProbabilidadCalcular(
                                this,
                                [],
                                [matID] as IDMateria[]
                            );

                        }
                        if (!negativos) {
                            
                        
                        if (!this.grafo[matID]) this.grafo[matID] = {};
                        this.grafo[matID][intermedio] = new ProbabilidadCalcular(
                            this,
                            [matID] as IDMateria[],
                            []
                        );
                    }
                    }

                    // 🔒 Si alguna materia es negativa (empieza con "-"), no generamos ninguna transición
                    if (materias.some(m => m.startsWith('-'))) continue;
                    
                    for (const mat of materias) {
                        const matID = mat;
                    
                        if (!this.grafo[matID]) this.grafo[matID] = {};
                        this.grafo[matID][intermedio] = new ProbabilidadCalcular(
                            this,
                            [matID] as IDMateria[],
                            []
                        );
                    }



            
                    // Luego conectar el intermedio al "hasta" como hacías antes
                    const faltan = this.getIntermedio(intermedio).split(',').filter(m => m[0] === '-').map(m => m.slice(1));
            
                    this.grafo[intermedio][hasta] = new ProbabilidadCalcular(
                        this,
                        faltan as IDMateria[],
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
        // Al final del constructor del Grafo
        for (const id in this.grafo) {
            if (!this.grafo[id]) this.grafo[id] = {};

            // Si no existe un loop todavía
            if (!this.grafo[id][id]) {
                this.grafo[id][id] = new ProbabilidadCalcular(
                    this,
                    [id] as IDMateria[],
                    []
                );
            }
        }

        // Conectar el nodo inicial "0000" a todas las materias sin correlativas directas
        for (const id in plan) {
            if (plan[id].correlativasDirectas.length === 0 && id !== "0000") {
                if (!this.grafo["0000"]) this.grafo["0000"] = {};
                if (!this.grafo[id]) this.grafo[id] = {};

                this.grafo["0000"][id] = new ProbabilidadCalcular(
                    this,
                    [<IDMateria>"0000"],
                    []
                );
            }
        }

        // Agregar self-loop al nodo 0000 por consistencia
        if (!this.grafo["0000"]["0000"]) {
            this.grafo["0000"]["0000"] = new ProbabilidadCalcular(
                this,
                [<IDMateria>"0000"],
                []
            );
        }

        const materiasSinCorrelativas = Object.entries(plan)
        .filter(([id, mat]) => mat.correlativasDirectas.length === 0 && id !== "0000")
        .map(([id]) => id);
    



        function obtenerMateriasHabilitadas(plan: Plan, materiasAprobadas: string[]): string[] {
            return Object.entries(plan)
                .filter(([codigo, materia]) => 
                    codigo !== "0000" && // 👈 Ignorar el nodo inicial
                    materia.correlativasDirectas.every(correlativa => materiasAprobadas.includes(correlativa)) &&
                    !materiasAprobadas.includes(codigo)
                )
                .map(([codigo]) => codigo);
        }
        
        
        function obtenerCombinaciones(materias: string[]): string[][] {
            const resultado: string[][] = [];
            const n = materias.length;
        
            for (let i = 1; i < (1 << n); i++) { // 1 a 2^n - 1
                const combinacion: string[] = [];
                for (let j = 0; j < n; j++) {
                    if (i & (1 << j)) {
                        combinacion.push(materias[j]);
                    }
                }
    
                if (combinacion.length <= 1) continue; // Evitar combinaciones vacías
    
                resultado.push(combinacion);
            }
        
            return resultado;
        }
    
        const materiasAprobadas = []; // al inicio
        const materiasHabilitadas = obtenerMateriasHabilitadas(plan, materiasAprobadas);
        const combinaciones_iniciales = obtenerCombinaciones(materiasHabilitadas);
        
        console.log("Combinaciones posibles al inicio:");
        console.log(combinaciones_iniciales);



        // Generar combinaciones válidas de esas materias (sin la vacía)
        const combinacionesIniciales = obtenerCombinaciones(materiasSinCorrelativas);
        
        for (const combinacion of combinacionesIniciales) {
            // Crear un nodo intermedio único
            const random = Math.floor(Math.random() * 3000);
            const idIntermedio = random.toString();
            intermedios[idIntermedio] = combinacion.join(',');
        
            this.grafo["0000"][idIntermedio] = new ProbabilidadCalcular(
                this,
                ["0000"],
                []
            );
        
            this.grafo[idIntermedio] = {};
        
            for (const materia of combinacion) {
                if (!this.grafo[materia]) this.grafo[materia] = {};
                this.grafo[idIntermedio][materia] = new ProbabilidadCalcular(
                    this,
                    [],
                    [materia]
                );
            }
        
            // También agregar self-loop para consistencia
            this.grafo[idIntermedio][idIntermedio] = new ProbabilidadCalcular(
                this,
                combinacion as IDMateria[],
                []
            );
        }


    }
}