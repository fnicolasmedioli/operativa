import { Correlatividades, correlatividades, Dataset1, getRandomDataset, guardarDataset, IDMateria, validateDataset } from "./dataset";


type ProbabilityStats = {
    neverTaken: number;
    takenOnce: number;
    takenTwice: number;
    takenThreeOrMore: number;
};

export function calculatePassingProbability(
    dataset: Dataset1,
    materiaId: IDMateria
): ProbabilityStats {
    // Estructura para mantener el historial de intentos y resultados por alumno
    type StudentHistory = {
        attempts: number;
        successesByAttempt: { [attempt: number]: number };
        totalByAttempt: { [attempt: number]: number };
    };

    const studentHistories: { [studentId: number]: StudentHistory } = {};

    // Procesar el dataset cronológicamente
    const sortedDataset = [...dataset].sort((a, b) => {
        if (a.año !== b.año) return a.año - b.año;
        return a.cuatrimestre - b.cuatrimestre;
    });

    // Analizar cada período
    for (const period of sortedDataset) {
        const materia = period.materias.find(m => m.id === materiaId);
        if (!materia) continue;

        // Analizar cada alumno en la materia
        for (const alumno of materia.alumnos) {
            if (!studentHistories[alumno.id]) {
                studentHistories[alumno.id] = {
                    attempts: 0,
                    successesByAttempt: {},
                    totalByAttempt: {}
                };
            }

            const history = studentHistories[alumno.id];
            const currentAttempt = history.attempts + 1;
            history.attempts = currentAttempt;

            // Inicializar contadores si no existen
            if (!history.successesByAttempt[currentAttempt]) {
                history.successesByAttempt[currentAttempt] = 0;
                history.totalByAttempt[currentAttempt] = 0;
            }

            // Incrementar contadores
            history.totalByAttempt[currentAttempt]++;
            if (alumno.resultado === "aprobado") {
                history.successesByAttempt[currentAttempt]++;
            }
        }
    }

    // Calcular probabilidades por número de intento
    let stats = {
        neverTaken: 0,    // Primera vez
        takenOnce: 0,     // Segunda vez
        takenTwice: 0,    // Tercera vez
        takenThreeOrMore: 0  // Cuarta vez o más
    };

    let totals = {
        neverTaken: 0,
        takenOnce: 0,
        takenTwice: 0,
        takenThreeOrMore: 0
    };

    // Sumar todos los resultados por número de intento
    Object.values(studentHistories).forEach(history => {
        Object.entries(history.successesByAttempt).forEach(([attempt, successes]) => {
            const attemptNum = parseInt(attempt);
            const total = history.totalByAttempt[attemptNum];

            if (attemptNum === 1) {
                stats.neverTaken += successes;
                totals.neverTaken += total;
            } else if (attemptNum === 2) {
                stats.takenOnce += successes;
                totals.takenOnce += total;
            } else if (attemptNum === 3) {
                stats.takenTwice += successes;
                totals.takenTwice += total;
            } else {
                stats.takenThreeOrMore += successes;
                totals.takenThreeOrMore += total;
            }
        });
    });

    // Calcular probabilidades finales
    return {
        neverTaken: totals.neverTaken > 0 ? stats.neverTaken / totals.neverTaken : 0,
        takenOnce: totals.takenOnce > 0 ? stats.takenOnce / totals.takenOnce : 0,
        takenTwice: totals.takenTwice > 0 ? stats.takenTwice / totals.takenTwice : 0,
        takenThreeOrMore: totals.takenThreeOrMore > 0 ? stats.takenThreeOrMore / totals.takenThreeOrMore : 0
    };
}

// Función auxiliar para usar el calculador
export function analyzeMateriaPassingProbabilities(
    dataset: Dataset1,
    materiaId: IDMateria
): void {
    const probabilities = calculatePassingProbability(dataset, materiaId);

    console.log(`Probabilidades de aprobación para la materia ${materiaId}:`);
    console.log(`- Primera vez: ${(probabilities.neverTaken * 100).toFixed(2)}%`);
    console.log(`- Segunda vez: ${(probabilities.takenOnce * 100).toFixed(2)}%`);
    console.log(`- Tercera vez: ${(probabilities.takenTwice * 100).toFixed(2)}%`);
    console.log(`- Cuarta vez o más: ${(probabilities.takenThreeOrMore * 100).toFixed(2)}%`);
}





const dataset = getRandomDataset();
const validationResult = validateDataset(dataset);
console.log("Invalid enrollments found:", (validationResult.invalidEnrollments.length) ? validationResult.invalidEnrollments : "No invalid enrollments found");

guardarDataset(dataset, "dataset.json");


analyzeMateriaPassingProbabilities(dataset, 6112);