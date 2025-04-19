import { IDMateria } from "./dataset";
import { Link } from "./link";

export class Nodo {

    id: string;
    nombre: string;
    nombreCorto: string;
    salientes: Link[];
    expandido: boolean = false;
    color?: string;

    constructor(id: string, nombre: string, nombreCorto: string, expandido: boolean, salientes: Link[] = [], color?: string) {

        this.id = id;
        this.nombre = nombre;
        this.nombreCorto = nombreCorto;
        this.expandido = expandido;
        this.salientes = salientes;
        this.color = color;
    }
}
