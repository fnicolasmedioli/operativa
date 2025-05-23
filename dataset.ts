export type IDMateria = "6111" | "6112" | "6113" | "6114" | "6121" | "6122" | "6123" | "6124" | "6125" | "6211" | "6212" | "6213" | "6214" | "6215" | "6221" | "6222" | "6223" | "6224" | "6311" | "6312" | "6313" | "6314" | "6321" | "6322" | "6323" | "6324" | "6325" | "6411" | "6412" | "6413" | "6414" | "6421" | "6422" | "6511";

export type Plan = {
    [key in IDMateria]?: {
        correlativasDirectas: IDMateria[];
        nombre: string;
        nombreCorto: string;
        correlativasTotales?: string[];
        esInicial: boolean;
        probAprobar?: number;
        probDesaprobar?: number;
    }
};

export const plan: Plan = {
    "6111": {
        correlativasDirectas: [],
        nombre: "Introducción a la Programación 1",
        nombreCorto: "prog_1",
        esInicial: true,
        probAprobar: 0.3593185338151781,
        probDesaprobar: 0.43133711925658236
    },
    "6113": {
        correlativasDirectas: [],
        nombre: "Álgebra 1",
        nombreCorto: "algebra_1",
        esInicial: true,
        probAprobar: 0.490547263681592,
        probDesaprobar: 0.26533996683250416
    },
    "6121": {
        correlativasDirectas: [],
        nombre: "Ciencias de la Computación 1",
        nombreCorto: "cs_compu_1",
        esInicial: true,
        probAprobar: 0.4509283819628647,
        probDesaprobar: 0.3209549071618037
    },
    "6122": {
        correlativasDirectas: ["6111"],
        nombre: "Introducción a la Programación 2",
        nombreCorto: "prog_2",
        esInicial: false,
        probAprobar: 0.5452222789984671,
        probDesaprobar: 0.21870209504343383
    },
    "6125": {
        correlativasDirectas: ["6113"],
        nombre: "Matemática Discreta",
        nombreCorto: "discreta",
        esInicial: false,
        probAprobar: 0.595822454308094,
        probDesaprobar: 0.1300261096605744
    },
    "6212": {
        correlativasDirectas: ["6121", "6122", "6125"],
        nombre: "Análisis y Diseño de Algoritmos I",
        nombreCorto: "ayda_1",
        esInicial: false,
        probAprobar: 0.5836273817925194,
        probDesaprobar: 0.29428369795342274
    },
    /*
    "6211": {
        correlativasDirectas: ["6121", "6122", "6125"],
        nombre: "Ciencias de la Computación 2",
        nombreCorto: "cs_compu_2",
        esInicial: false
    },
    "6213": {
        correlativasDirectas: ["6211", "6212"],
        nombre: "Análisis y Diseño de Algoritmos II",
        nombreCorto: "ayda_2",
        esInicial: false
    }
    */
};

const memo: { [codigo: string]: Set<string> } = {};

const calcularTotales = (codigo: string, visitados: Set<string> = new Set()): Set<string> => {
    if (memo[codigo]) return memo[codigo];

    const materia = plan[codigo];
    const resultado = new Set<string>();

    for (const directa of materia.correlativasDirectas) {
        if (visitados.has(directa)) continue;
        resultado.add(directa);
        visitados.add(directa);

        const indirectas = calcularTotales(directa, new Set(visitados));
        for (const i of indirectas) {
            resultado.add(i);
        }
    }

    memo[codigo] = resultado;
    return resultado;
};

for (const codigo in plan) {
    plan[codigo].correlativasTotales = Array.from(calcularTotales(codigo));
}

