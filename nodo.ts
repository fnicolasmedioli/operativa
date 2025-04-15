import { IDMateria } from "./dataset";

export class Nodo {

    id: string;
    nombre: string;
    nombreCorto: string;
    salientes: string[];
    expandido: boolean = false;
    color?: string;

    constructor(id: string, nombre: string, nombreCorto: string, expandido: boolean, salientes: string[] = [], color?: string) {

        this.id = id;
        this.nombre = nombre;
        this.nombreCorto = nombreCorto;
        this.expandido = expandido;
        this.salientes = salientes;
        this.color = color;
    }
}
