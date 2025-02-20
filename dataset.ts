import fs from "fs";

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

export const getRandomDataset = (): Dataset1 => {
    const dataset: Dataset1 = [];
    const studentCount = 100;
    const students = Array.from({ length: studentCount }, (_, i) => i + 1);

    // Helper function to get random outcome
    const getRandomOutcome = (): "aprobado" | "desaprobado" =>
        Math.random() > 0.3 ? "aprobado" : "desaprobado";

    // Define available subjects in sequential order as they might be completed
    const availableSubjects: IDMateria[] = [
        6111, 6112, 6113, 6114,
        6121, 6122, 6123, 6124, 6125,
        6211, 6212, 6213, 6214, 6215,
        6221, 6222, 6223, 6224,
        6311, 6312, 6313, 6314,
        6321, 6322, 6323, 6324, 6325,
        6411, 6412, 6413, 6414,
        6421, 6422, 6511
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
        materiaId: number;
        alumnoId: number;
        missingPrerequisites: number[];
    }[];
} {
    const studentApprovals: Map<number, Set<number>> = new Map();
    const invalidEnrollments: {
        año: number;
        cuatrimestre: number;
        materiaId: number;
        alumnoId: number;
        missingPrerequisites: number[];
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