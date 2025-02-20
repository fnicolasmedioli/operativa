import { correlatividades, dataset, Dataset1, IDMateria } from "./dataset1";


function calcularProbabilidadAprobacion(dataset: Dataset1): Record<number, number> {
    const probabilidades: Record<number, number> = {};
    const conteo: Record<number, { aprobados: number; total: number }> = {};

    for (const periodo of dataset) {
        for (const materia of periodo.materias) {
            if (!conteo[materia.id]) {
                conteo[materia.id] = { aprobados: 0, total: 0 };
            }
            for (const alumno of materia.alumnos) {
                if (alumno.resultado === "aprobado") {
                    conteo[materia.id].aprobados++;
                }
                conteo[materia.id].total++;
            }
        }
    }

    for (const id in conteo) {
        probabilidades[parseInt(id)] = (conteo[id].aprobados / conteo[id].total) * 100;
    }

    return probabilidades;
}


//console.log(calcularProbabilidadAprobacion(dataset));

function validateCorrelatives(dataset: Dataset1): {
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

// Run the validation
// const validationResult = validateCorrelatives(dataset);

// Log results
// console.log("Invalid enrollments found:", validationResult.invalidEnrollments);






// Probabilidades de transición para cada materia (probabilidad de aprobar, reprobar o abandonar)
type Probabilidades = {
    aprobado: number;
    desaprobado: number;
    abandono: number;
};

// Definimos el espacio de estados extendido para correlativas
type EstadoMateria = {
    materia: IDMateria;
    estadoCorrelativas: string; // Estado de las correlativas (Aprobado/Reprobado)
}


// Función para calcular las probabilidades de aprobar, reprobar o abandonar una asignatura
const calcularProbabilidadesMateria = (materiaId: IDMateria, cuatrimestreData: Dataset1): Probabilidades => {
    let aprobados = 0;
    let desaprobados = 0;
    let abandonos = 0;

    // Filtramos los datos para la materia actual
    const materia = cuatrimestreData.find(m => m.materias.some(mat => mat.id === materiaId))?.materias.find(mat => mat.id === materiaId);

    if (materia) {
        // Contamos los resultados de los alumnos
        materia.alumnos.forEach(alumno => {
            if (alumno.resultado === "aprobado") {
                aprobados++;
            } else if (alumno.resultado === "desaprobado") {
                desaprobados++;
            }
            // Consideramos abandono si el alumno no está en la lista de la materia
            else {
                abandonos++;
            }
        });

        const total = aprobados + desaprobados + abandonos;

        return {
            aprobado: total > 0 ? aprobados / total : 0,
            desaprobado: total > 0 ? desaprobados / total : 0,
            abandono: total > 0 ? abandonos / total : 0
        };
    }

    return { aprobado: 0, desaprobado: 0, abandono: 0 };
};


// Generar las probabilidades de transición para todas las materias
const generarTransiciones = (dataset: Dataset1, correlatividades: Correlatividades): Record<string, Record<string, Probabilidades>> => {
    const transiciones: Record<string, Record<string, Probabilidades>> = {};

    dataset.forEach(cuatrimestreData => {
        cuatrimestreData.materias.forEach(materia => {
            const materiaId = materia.id;
            const probabilidad = calcularProbabilidadesMateria(materiaId, [cuatrimestreData]);
            const estadoCorrelativas = correlatividades[materiaId]?.map(cor => `Materia ${cor}`).join(", ") || "Sin correlativas";

            // Agregar transiciones en función del estado de correlativas
            if (!transiciones[materiaId]) {
                transiciones[materiaId] = {};
            }

            transiciones[materiaId][estadoCorrelativas] = probabilidad;
        });
    });

    return transiciones;
};

// Ejecutar la función de generación de transiciones
const transiciones = generarTransiciones(dataset, correlatividades);

// Imprimir las transiciones
console.log(transiciones);