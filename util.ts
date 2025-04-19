import { Plan } from "./dataset";

type DataLink = {
    nombreCortoMateria: string;
    prob: number;
}

export function textoLinkAprobarMaterias(aprobadas: DataLink[], desaprobadas: DataLink[]): string {
    return `Pa(${aprobadas.map(d => d.nombreCortoMateria + ` [${d.prob?.toFixed(2)}]`).join(", ")}) | Pd(${desaprobadas.map(d => d.nombreCortoMateria + ` [${d.prob?.toFixed(2)}]`).join(", ")})` || "?";
}
