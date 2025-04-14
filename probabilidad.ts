import { IDMateria } from "./dataset";


export class Probabilidad {

}

export class ProbabilidadCalcular extends Probabilidad {

    _grafo: any;
    _aprobar: IDMateria[];
    _desaprobar: IDMateria[];

    constructor(grafo, aprobar: IDMateria[], desaprobar: IDMateria[]) {
        super();
        this._grafo = grafo;
        this._aprobar = aprobar;
        this._desaprobar = desaprobar;
    }

    toString() {
        let s = "";

        if (this._aprobar.length > 0)
            s += `${this._aprobar.map(m => `P(${this._grafo.getName(m)})`).join(' AND ')}`;

        if (this._desaprobar.length > 0) {
            if (s != "")
                s += " AND ";

            s += `${this._desaprobar.map(m => `Pd(${this._grafo.getName(m)})`).join(' AND ')}`;
        }

        if (s == "")
            s = "1";

        return s;
    }
}