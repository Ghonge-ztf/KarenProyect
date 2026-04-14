export interface IArticulo {
  _id?: string,
  contenedor: string,
  cantidad: number,
  codigo: string,
  descripcion: string,
  observacion: string,
}

export interface IArticuloDetalleContenedor {
  _id: string;
  contenedor: string;
  cantidad: number;
  descripcion: string;
  observacion: string;
}

export interface IArticuloDetalle {
  codigo: string;
  descripcion: string;
  observacion: string;
  totalCantidad: number;
  contenedores: IArticuloDetalleContenedor[];
}
