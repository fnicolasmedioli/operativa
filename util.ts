import { Plan } from "./dataset";

type DataLink = {
    nombreCortoMateria: string;
    prob: number;
}

export function textoLinkAprobarMaterias(aprobadas: DataLink[], desaprobadas: DataLink[]): string {
    const aprobadasText = aprobadas.length
        ? `Pa(${aprobadas.map(d => d.nombreCortoMateria + ` [${d.prob?.toFixed(2) || "?"}]`).join(", ")})`
        : "";
    const desaprobadasText = desaprobadas.length
        ? `Pd(${desaprobadas.map(d => d.nombreCortoMateria + ` [${d.prob?.toFixed(2) || "?"}]`).join(", ")})`
        : "";

    return [aprobadasText, desaprobadasText].filter(Boolean).join(" & ") || "?";
}
