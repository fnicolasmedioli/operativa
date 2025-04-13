import fs from "fs";

export type IDMateria = "0000" | "6111" | "6112" | "6113" | "6114" | "6121" | "6122" | "6123" | "6124" | "6125" | "6211" | "6212" | "6213" | "6214" | "6215" | "6221" | "6222" | "6223" | "6224" | "6311" | "6312" | "6313" | "6314" | "6321" | "6322" | "6323" | "6324" | "6325" | "6411" | "6412" | "6413" | "6414" | "6421" | "6422" | "6511";

export type Plan = {
    [key in IDMateria]?: {
        correlativasDirectas: IDMateria[];
        nombre: string;
        nombreCorto: string;
    }
};

/*
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
*/

export const plan: Plan = {
    "0000": {
        correlativasDirectas: [],
        nombre: "Inicio del Plan",
        nombreCorto: "inicio"
    },

    "6111": {
        correlativasDirectas: [],
        nombre: "Introducción a la Programación 1",
        nombreCorto: "prog_1"
    },
    "6113": {
        correlativasDirectas: [],
        nombre: "Álgebra 1",
        nombreCorto: "algebra_1"
    },
    "6121": {
        correlativasDirectas: [],
        nombre: "Ciencias de la Computación 1",
        nombreCorto: "cs_compu_1"
    },
    "6122": {
        correlativasDirectas: ["6111"],
        nombre: "Introducción a la Programación 2",
        nombreCorto: "prog_2"
    },
    "6125": {
        correlativasDirectas: ["6113"],
        nombre: "Matemática Discreta",
        nombreCorto: "discreta"
    },
    "6212": {
        correlativasDirectas: ["6121", "6122", "6125"],
        nombre: "Análisis y Diseño de Algoritmos I",
        nombreCorto: "ayda_1"
    }
};

/*
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
*/
