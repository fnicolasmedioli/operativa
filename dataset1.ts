export type IDMateria = 6111 | 6112 | 6113 | 6114 | 6121 | 6122 | 6123 | 6124 | 6125 | 6211 | 6212 | 6213 | 6214 | 6215 | 6221 | 6222 | 6223 | 6224 | 6311 | 6312 | 6313 | 6314 | 6321 | 6322 | 6323 | 6324 | 6325 | 6411 | 6412 | 6413 | 6414 | 6421 | 6422 | 6511;

export type Correlatividades = {
    [key in IDMateria]?: IDMateria[];
}

export type Dataset1 = {
    año: number,
    cuatrimestre: number,
    materias: {
        id: IDMateria,
        alumnos: {
            id: number,
            resultado: "aprobado" | "desaprobado"
        }[]
    }[]
}[];

export const dataset: Dataset1 = [
    {
        año: 2023,
        cuatrimestre: 1,
        materias: [
            {
                id: 6111,
                alumnos: [
                    { id: 1, resultado: "aprobado" },
                    { id: 2, resultado: "aprobado" },
                    { id: 3, resultado: "desaprobado" },
                    { id: 4, resultado: "aprobado" },
                    { id: 5, resultado: "desaprobado" },
                    { id: 6, resultado: "aprobado" },
                    { id: 7, resultado: "aprobado" },
                    { id: 8, resultado: "desaprobado" }
                ]
            },
            {
                id: 6112,
                alumnos: [
                    { id: 1, resultado: "aprobado" },
                    { id: 2, resultado: "desaprobado" },
                    { id: 3, resultado: "aprobado" },
                    { id: 4, resultado: "aprobado" },
                    { id: 5, resultado: "aprobado" },
                    { id: 6, resultado: "desaprobado" },
                    { id: 7, resultado: "aprobado" },
                    { id: 8, resultado: "aprobado" }
                ]
            },
            {
                id: 6113,
                alumnos: [
                    { id: 1, resultado: "desaprobado" },
                    { id: 2, resultado: "aprobado" },
                    { id: 3, resultado: "aprobado" },
                    { id: 4, resultado: "desaprobado" },
                    { id: 5, resultado: "aprobado" },
                    { id: 6, resultado: "aprobado" },
                    { id: 7, resultado: "aprobado" },
                    { id: 8, resultado: "desaprobado" }
                ]
            },
            {
                id: 6114,
                alumnos: [
                    { id: 1, resultado: "aprobado" },
                    { id: 2, resultado: "aprobado" },
                    { id: 3, resultado: "desaprobado" },
                    { id: 4, resultado: "aprobado" },
                    { id: 5, resultado: "aprobado" },
                    { id: 6, resultado: "desaprobado" },
                    { id: 7, resultado: "aprobado" },
                    { id: 8, resultado: "aprobado" }
                ]
            }
        ]
    },
    {
        año: 2023,
        cuatrimestre: 2,
        materias: [
            {
                id: 6121,
                alumnos: [
                    { id: 1, resultado: "aprobado" },
                    { id: 2, resultado: "aprobado" },
                    { id: 4, resultado: "aprobado" },
                    { id: 6, resultado: "aprobado" }
                ]
            },
            {
                id: 6122,
                alumnos: [
                    { id: 1, resultado: "aprobado" },
                    { id: 2, resultado: "desaprobado" },
                    { id: 4, resultado: "aprobado" },
                    { id: 6, resultado: "aprobado" }
                ]
            },
            {
                id: 6123,
                alumnos: [
                    { id: 3, resultado: "aprobado" },
                    { id: 5, resultado: "aprobado" }
                ]
            },
            {
                id: 6124,
                alumnos: [
                    { id: 1, resultado: "desaprobado" },
                    { id: 4, resultado: "aprobado" },
                    { id: 8, resultado: "aprobado" }
                ]
            },
            {
                id: 6125,
                alumnos: [
                    { id: 6, resultado: "aprobado" },
                    { id: 3, resultado: "desaprobado" },
                    { id: 7, resultado: "aprobado" }
                ]
            }
        ]
    },
    {
        año: 2024,
        cuatrimestre: 1,
        materias: [
            {
                id: 6211,
                alumnos: [
                    { id: 6, resultado: "desaprobado" }
                ]
            },
            {
                id: 6214,
                alumnos: [
                    { id: 3, resultado: "aprobado" }
                ]
            },
            {
                id: 6215,
                alumnos: [
                    { id: 4, resultado: "aprobado" }
                ]
            }
        ]
    },
    {
        año: 2024,
        cuatrimestre: 2,
        materias: [
            {
                id: 6224,
                alumnos: [
                    { id: 4, resultado: "aprobado" }
                ]
            }
        ]
    }
];


export const correlatividades: Correlatividades = {
    6111: [],
    6112: [],
    6113: [],
    6114: [],
    6121: [6111],
    6122: [6111],
    6123: [6113],
    6124: [6112],
    6125: [6113],
    6211: [6121, 6122, 6125],
    6212: [6121, 6122, 6125],
    6213: [6122],
    6214: [6112],
    6215: [6124],
    6221: [6211, 6212],
    6222: [6213],
    6223: [6214, 6123, 6125],
    6224: [6215],
    6311: [6221],
    6312: [6221, 6223],
    6313: [6221],
    6314: [6213, 6224],
    6321: [6221],
    6322: [6312, 6313],
    6323: [6311],
    6324: [6312, 6314],
    6325: [6214, 6223],
    6411: [6314],
    6412: [6212, 6222, 6223],
    6413: [6222, 6324],
    6414: [6214],
    6421: [6311, 6322, 6324],
    6422: [6323],
    6511: [6421]
};