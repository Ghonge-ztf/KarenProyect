import { ObjectId } from "mongodb";

export interface Artisulo {
  contenedor: string,
  cantidad: number;
  codigo: string;
  descripcion: string;
}

export interface ArtisuloDocument extends Artisulo {
  _id: ObjectId;
}

export interface Historial {

}