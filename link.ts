import { IDMateria } from "./dataset";


export class Link {

    targetID: string;
    probText: string | null = null;
    
    aprobar: IDMateria[] = [];
    desaprobar: IDMateria[] = [];

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
}
