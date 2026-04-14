import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { Artisulo } from "../utils/models/artisulo";
import { getArtisulosCollection } from "../utils/mongo";

const collection = () => getArtisulosCollection();

const normalizeString = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const parseCantidad = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed)) return parsed;
  }
  return null;
};

// const validacion = ({ contenedor, cantidad, codigo, descripcion}: Artisulo),  =>{
//   if(){

//   }
// }

export const crearArticulo = async (req: Request, res: Response) => {
  try {
    const { contenedor ,cantidad, codigo, descripcion, observacion } = req.body;
    const parsedCantidad = parseCantidad(cantidad);
    const codigoLimpio = normalizeString(codigo);
    const descripcionLimpia = normalizeString(descripcion);
    const contenedorLimpio = normalizeString(contenedor);
    const observacionLimpio = normalizeString(observacion);

    if (
      parsedCantidad === null ||
      !codigoLimpio ||
      !descripcionLimpia ||
      !contenedorLimpio ||
      !observacionLimpio
    ) {
      return res.status(400).json({
        message:
          "Los campos cantidad, codigo y descripcion son obligatorios y deben tener formato correcto",
      });
    }

    const articuloExistente = await collection().findOne({
      contenedor: contenedorLimpio,
      codigo: codigoLimpio,
    });

    if (articuloExistente) {
      const cantidadActualizada = articuloExistente.cantidad + parsedCantidad;
      const result = await collection().updateOne(
        { _id: articuloExistente._id },
        {
          $set: {
            cantidad: cantidadActualizada,
            descripcion: descripcionLimpia || articuloExistente.descripcion,
            observacion: observacionLimpio || articuloExistente.observacion,
          },
        }
      );

      if (result.modifiedCount === 0) {
        return res.status(500).json({ message: "Error al actualizar artículo existente" });
      }

      return res.status(200).json({
        message: "Artículo existente actualizado con nueva cantidad",
        codigo: codigoLimpio,
        contenedor: contenedorLimpio,
        cantidad: cantidadActualizada,
        observacion: observacionLimpio,
      });
    }

    const nuevoArticulo: Artisulo = {
      contenedor: contenedorLimpio,
      cantidad: parsedCantidad,
      codigo: codigoLimpio,
      descripcion: descripcionLimpia,
      observacion: observacionLimpio
    };

    const result = await collection().insertOne(nuevoArticulo);
    return res.status(201).json({
      id: result.insertedId.toString(),
      message: "Articulo creado correctamente",
    });
  } catch (error) {
    console.error("Error al crear articulo", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const actualizarArticulo = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const updates: Partial<Artisulo> = {};

    if (typeof req.body.cantidad !== "undefined") {
      const parsedCantidad = parseCantidad(req.body.cantidad);
      if (parsedCantidad === null) {
        return res
          .status(400)
          .json({ message: "Cantidad debe ser un entero válido" });
      }
      updates.cantidad = parsedCantidad;
    }

    if (typeof req.body.codigo !== "undefined") {
      const codigoLimpio = normalizeString(req.body.codigo);
      if (!codigoLimpio) {
        return res
          .status(400)
          .json({ message: "Codigo no puede quedar vacío" });
      }
      updates.codigo = codigoLimpio;
    }

    if (typeof req.body.descripcion !== "undefined") {
      const descripcionLimpia = normalizeString(req.body.descripcion);
      if (!descripcionLimpia) {
        return res
          .status(400)
          .json({ message: "Descripcion no puede quedar vacía" });
      }
      updates.descripcion = descripcionLimpia;
    }

    if (typeof req.body.observacion !== "undefined") {
      const observacionLimpio = normalizeString(req.body.observacion);
      if (!observacionLimpio) {
        return res
          .status(400)
          .json({ message: "Descripcion no puede quedar vacía" });
      }
      updates.observacion = observacionLimpio;
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ message: "Debes enviar al menos un campo para actualizar" });
    }

    const result = await collection().updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Articulo no encontrado" });
    }

    return res
      .status(200)
      .json({ message: "Articulo actualizado", modified: result.modifiedCount });
  } catch (error) {
    console.error("Error al actualizar articulo", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const eliminarArticulo = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const result = await collection().deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Articulo no encontrado" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar articulo", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
