import { IDMateria } from "./dataset";


export class Link {

    targetID: string;
    probText: string | null = null;
    
    aprobar: IDMateria[] = [];
    desaprobar: IDMateria[] = [];

    probabilidad?: number;

    constructor(targetID: string, probText: string | null = null, aprobar: IDMateria[] = [], desaprobar: IDMateria[] = []) {
        this.targetID = targetID;
        this.probText = probText;
        this.aprobar = aprobar;
        this.desaprobar = desaprobar;
    }

    getProbText(): string {
        return this.probText || "?";
    }

    getTargetID(): string {
        return this.targetID;
    }

    setProbabilidad(probabilidad: number) {
        this.probabilidad = probabilidad;
    }

    getProbabilidad(): number | null {
        return this.probabilidad || null;
    }
}
