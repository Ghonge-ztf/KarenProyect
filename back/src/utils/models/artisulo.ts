import { ObjectId } from "mongodb";

export interface Artisulo {
  contenedor: string,
  cantidad: number;
  codigo: string;
  descripcion: string;
  observacion: string;
}

export interface ArtisuloDocument extends Artisulo {
  _id: ObjectId;
}

export interface Historial {
  codigo: string
  cantidad: number
  contenedor: string[]
}

export interface HistorialDocument extends Historial {
  _id: ObjectId;
}

export interface Salida {
  articuloId: string;
  codigo: string;
  descripcion: string;
  contenedor: string;
  cantidad: number;
  numeroDocumento: string;
  observacion: string;
  fecha: Date;
}

export interface SalidaDocument extends Salida {
  _id: ObjectId;
}
