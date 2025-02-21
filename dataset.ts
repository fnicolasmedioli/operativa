import fs from "fs";

export type IDMateria = "6111" | "6112" | "6113" | "6114" | "6121" | "6122" | "6123" | "6124" | "6125" | "6211" | "6212" | "6213" | "6214" | "6215" | "6221" | "6222" | "6223" | "6224" | "6311" | "6312" | "6313" | "6314" | "6321" | "6322" | "6323" | "6324" | "6325" | "6411" | "6412" | "6413" | "6414" | "6421" | "6422" | "6511";

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


export const correlatividades: Correlatividades = {
    "6111": [],
    "6112": [],
    "6113": [],
    "6114": [],
    "6121": ["6111"],
    "6122": ["6111"],
    "6123": ["6113"],
    "6124": ["6112"],
    "6125": ["6113"],
    "6211": ["6121", "6122", "6125"],
    "6212": ["6121", "6122", "6125"],
    "6213": ["6122"],
    "6214": ["6112"],
    "6215": ["6124"],
    "6221": ["6211", "6212"],
    "6222": ["6213"],
    "6223": ["6214", "6123", "6125"],
    "6224": ["6215"],
    "6311": ["6221"],
    "6312": ["6221", "6223"],
    "6313": ["6221"],
    "6314": ["6213", "6224"],
    "6321": ["6221"],
    "6322": ["6312", "6313"],
    "6323": ["6311"],
    "6324": ["6312", "6314"],
    "6325": ["6214", "6223"],
    "6411": ["6314"],
    "6412": ["6212", "6222", "6223"],
    "6413": ["6222", "6324"],
    "6414": ["6214"],
    "6421": ["6311", "6322", "6324"],
    "6422": ["6323"],
    "6511": ["6421"]
};

const subjectMap = new Map([
    ["6111", "Introducción a la Programación I"],
    ["6112", "Análisis Matemático I"],
    ["6113", "Álgebra I"],
    ["6114", "Química"],
    ["6121", "Ciencias de la Computación I"],
    ["6122", "Introducción a la Programación II"],
    ["6123", "Álgebra Lineal"],
    ["6124", "Física General"],
    ["6125", "Matemática Discreta"],
    ["6211", "Ciencias de la Computación II"],
    ["6212", "Análisis y Diseño de Algoritmos I"],
    ["6213", "Introducción a la Arquitectura de Sistemas"],
    ["6214", "Análisis Matemático II"],
    ["6215", "Electricidad y Magnetismo"],
    ["6221", "Análisis y Diseño de Algoritmos II"],
    ["6222", "Comunicación de Datos I"],
    ["6223", "Probabilidades y Estadística"],
    ["6224", "Electrónica Digital"],
    ["6311", "Programación Orientada a Objetos"],
    ["6312", "Estructuras de Almacenamiento de Datos"],
    ["6313", "Metodologías de Desarrollo de Software"],
    ["6314", "Arquitectura de Computadoras I"],
    ["6321", "Programación Exploratoria"],
    ["6322", "Base de Datos I"],
    ["6323", "Lenguajes de Programación I"],
    ["6324", "Sistemas Operativos I"],
    ["6325", "Investigación Operativa I"],
    ["6411", "Arq. de Computadoras y Técnicas Digitales"],
    ["6412", "Teoría de la Información"],
    ["6413", "Comunicación de Datos II"],
    ["6414", "Introducción al Cálculo Diferencial e Integral"],
    ["6421", "Diseño de Sistemas de Software"],
    ["6422", "Diseño de Compiladores I"],
    ["6511", "Ingeniería de Software"]
]);

// Función para obtener el nombre de la asignatura
export function getNombreMateria(code: string): string {
    return subjectMap.get(code) || "[error xd]";
}

export const getRandomDataset = (): Dataset1 => {
    const dataset: Dataset1 = [];
    const studentCount = 100;
    const students = Array.from({ length: studentCount }, (_, i) => i + 1);

    // Helper function to get random outcome
    const getRandomOutcome = (): "aprobado" | "desaprobado" =>
        Math.random() > 0.3 ? "aprobado" : "desaprobado";

    // Define available subjects in sequential order as they might be completed
    const availableSubjects: IDMateria[] = [
        "6111", "6112", "6113", "6114",
        "6121", "6122", "6123", "6124", "6125",
        "6211", "6212", "6213", "6214", "6215",
        "6221", "6222", "6223", "6224",
        "6311", "6312", "6313", "6314",
        "6321", "6322", "6323", "6324", "6325",
        "6411", "6412", "6413", "6414",
        "6421", "6422", "6511"
    ];

    const passedSubjects: { [studentId: number]: Set<IDMateria> } = {};

    for (let year = 1; year <= 3; year++) {
        for (let cuatrimester = 1; cuatrimester <= 2; cuatrimester++) {
            const materias = availableSubjects.map(materia => {
                const alumnos = students.map(student => {
                    if (!passedSubjects[student]) {
                        passedSubjects[student] = new Set();
                    }

                    // Check if student has completed prerequisites
                    const prerequisites = correlatividades[materia] || [];
                    const hasPrerequisites = prerequisites.every(pr => passedSubjects[student].has(pr));

                    // Only try to take the class if prerequisites are met
                    let outcome: "aprobado" | "desaprobado";
                    if (hasPrerequisites) {
                        outcome = getRandomOutcome();
                    } else {
                        outcome = "desaprobado";
                    }

                    if (outcome === "aprobado") {
                        passedSubjects[student].add(materia);
                    }

                    return { id: student, resultado: outcome };
                }).filter(alumno => {
                    // Remove entries where students weren't eligible to take the class
                    return correlatividades[materia]?.every(pr => passedSubjects[alumno.id].has(pr));
                });

                return { id: materia, alumnos };
            });

            dataset.push({ año: year, cuatrimestre: cuatrimester, materias });
        }
    }

    return dataset;
};


export const guardarDataset = (dataset: Dataset1, filename: string) => {
    fs.writeFileSync(filename, JSON.stringify(dataset, null, 2));
};



export function validateDataset(dataset: Dataset1): {
    invalidEnrollments: {
        año: number;
        cuatrimestre: number;
        materiaId: string;
        alumnoId: number;
        missingPrerequisites: string[];
    }[];
} {
    const studentApprovals: Map<number, Set<string>> = new Map();
    const invalidEnrollments: {
        año: number;
        cuatrimestre: number;
        materiaId: string;
        alumnoId: number;
        missingPrerequisites: string[];
    }[] = [];

    // Sort dataset by year and quarter to process chronologically
    const sortedDataset = [...dataset].sort((a, b) => {
        if (a.año !== b.año) return a.año - b.año;
        return a.cuatrimestre - b.cuatrimestre;
    });

    // Process each period
    for (const period of sortedDataset) {
        // Process each subject in the period
        for (const materia of period.materias) {
            const requiredCorrelatives = correlatividades[materia.id] || [];

            // Check each student in the subject
            for (const alumno of materia.alumnos) {
                // Get or initialize student's approved subjects
                if (!studentApprovals.has(alumno.id)) {
                    studentApprovals.set(alumno.id, new Set());
                }
                const studentApprovedSubjects = studentApprovals.get(alumno.id)!;

                // Check if student meets prerequisites
                const missingPrerequisites = requiredCorrelatives.filter(
                    prerequisite => !studentApprovedSubjects.has(prerequisite)
                );

                // If missing prerequisites, add to invalid enrollments
                if (missingPrerequisites.length > 0) {
                    invalidEnrollments.push({
                        año: period.año,
                        cuatrimestre: period.cuatrimestre,
                        materiaId: materia.id,
                        alumnoId: alumno.id,
                        missingPrerequisites
                    });
                }

                // If student passed, add to their approved subjects
                if (alumno.resultado === "aprobado") {
                    studentApprovedSubjects.add(materia.id);
                }
            }
        }
    }

    return { invalidEnrollments };
}






