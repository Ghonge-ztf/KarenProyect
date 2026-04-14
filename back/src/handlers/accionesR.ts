import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import {
  getArtisulosCollection,
  getHistorialCollection,
  getSalidasCollection,
} from "../utils/mongo";
import { Historial, Salida } from "../utils/models/artisulo";

const collection = () => getArtisulosCollection();
const historial = () => getHistorialCollection();
const salidas = () => getSalidasCollection();
const CONTENEDOR_MARKER = "__CONTENEDOR__";

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

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const articuloVisibleFilter = {
  descripcion: { $ne: CONTENEDOR_MARKER },
  codigo: { $not: new RegExp(`^${escapeRegex(CONTENEDOR_MARKER)}_`) },
};

export const getArticulos = async (req: Request, res: Response) => {
  try {
    const query = normalizeString(req.query.contenedor);

    const datosC = await collection()
      .find({ contenedor: query })
      .limit(25)
      .toArray();

    console.log(`getArticulos | Datos encontrados:${datosC.length}`);
    return res.status(200).json({ contenido: datosC });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    return res.status(500).json({ menssage: mensaje });
  }
};

export const getContenedores = async (_req: Request, res: Response) => {
  try {
    const datosC = await collection().distinct("contenedor");

    console.log(`getContenedores | Datos encontrados:${datosC.length}`);
    return res.status(200).json({ contenido: datosC });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    return res.status(500).json({ menssage: mensaje });
  }
};

export const searchContenedores = async (req: Request, res: Response) => {
  try {
    const query = normalizeString(req.query.q).replace(/\s+/g, " ");

    const contenedores = await collection().distinct("contenedor");
    const resultados = contenedores
      .filter((contenedor) =>
        query
          ? contenedor.toLowerCase().includes(query.toLowerCase())
          : true,
      )
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 25);

    return res.status(200).json({ contenido: resultados });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    return res.status(500).json({ menssage: mensaje });
  }
};

export const searchArticulos = async (req: Request, res: Response) => {
  try {
    const query = normalizeString(req.query.q).replace(/\s+/g, " ");

    const filtro = query
      ? {
          ...articuloVisibleFilter,
          $or: [
            { codigo: { $regex: escapeRegex(query), $options: "i" } },
            { descripcion: { $regex: escapeRegex(query), $options: "i" } },
            { contenedor: { $regex: escapeRegex(query), $options: "i" } },
          ],
        }
      : articuloVisibleFilter;

    const datos = await collection().find(filtro).limit(20).toArray();
    return res.status(200).json({ contenido: datos });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    return res.status(500).json({ menssage: mensaje });
  }
};

export const getArticuloDetalle = async (req: Request, res: Response) => {
  try {
    const codigo = normalizeString(req.query.codigo);

    if (!codigo) {
      return res.status(400).json({ message: "El codigo es obligatorio" });
    }

    const coincidencias = await collection()
      .find({ codigo, ...articuloVisibleFilter })
      .toArray();

    if (coincidencias.length === 0) {
      return res.status(404).json({ message: "Articulo no encontrado" });
    }

    const total = coincidencias.reduce((sum, item) => sum + item.cantidad, 0);

    return res.status(200).json({
      contenido: {
        codigo,
        descripcion: coincidencias[0].descripcion,
        observacion: coincidencias[0].observacion,
        totalCantidad: total,
        contenedores: coincidencias.map((item) => ({
          _id: item._id.toString(),
          contenedor: item.contenedor,
          cantidad: item.cantidad,
          observacion: item.observacion,
          descripcion: item.descripcion,
        })),
      },
    });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    return res.status(500).json({ menssage: mensaje });
  }
};

export const moveArticulo = async (req: Request, res: Response) => {
  try {
    const { articuloId, contenedorN } = req.body;

    if (
      !articuloId ||
      typeof articuloId !== "string" ||
      !contenedorN ||
      typeof contenedorN !== "string" ||
      !ObjectId.isValid(articuloId)
    ) {
      return res
        .status(400)
        .json({ message: "Faltan datos requeridos o ID invalido para mover el articulo" });
    }

    const articuloActual = await collection().findOne({ _id: new ObjectId(articuloId) });

    if (!articuloActual) {
      return res.status(404).json({ message: "Articulo no encontrado" });
    }

    if (articuloActual.contenedor === contenedorN) {
      return res
        .status(200)
        .json({ message: "El articulo ya se encuentra en el contenedor destino" });
    }

    const updateResult = await collection().updateOne(
      { _id: articuloActual._id },
      { $set: { contenedor: contenedorN } },
    );

    if (updateResult.matchedCount === 0) {
      return res.status(400).json({ message: "No se pudo mover el articulo" });
    }

    const historialExistente = await historial().findOne({ codigo: articuloActual.codigo });

    if (!historialExistente) {
      const nuevoHistorial: Historial = {
        codigo: articuloActual.codigo,
        cantidad: articuloActual.cantidad,
        contenedor: [articuloActual.contenedor, contenedorN],
      };

      const result = await historial().insertOne(nuevoHistorial);
      if (!result.acknowledged) {
        return res.status(500).json({ message: "Error al crear el historial de articulo" });
      }
    } else {
      const contenedoresHistorial = [...historialExistente.contenedor];
      if (contenedoresHistorial[contenedoresHistorial.length - 1] !== contenedorN) {
        contenedoresHistorial.push(contenedorN);
      }

      const result = await historial().updateOne(
        { codigo: articuloActual.codigo },
        { $set: { contenedor: contenedoresHistorial } },
      );

      if (result.matchedCount !== 1) {
        return res.status(500).json({ message: "Error al actualizar el historial de articulo" });
      }
    }

    return res.status(200).json({ message: "Articulo movido correctamente" });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    return res.status(500).json({ menssage: mensaje });
  }
};

export const registrarSalida = async (req: Request, res: Response) => {
  try {
    const articuloId = normalizeString(req.body.articuloId);
    const numeroDocumento = normalizeString(req.body.numeroDocumento);
    const observacion = normalizeString(req.body.observacion);
    const cantidad = parseCantidad(req.body.cantidad);

    if (!articuloId || !ObjectId.isValid(articuloId)) {
      return res.status(400).json({ message: "Debes seleccionar un articulo valido" });
    }

    if (!numeroDocumento || !observacion || cantidad === null || cantidad <= 0) {
      return res.status(400).json({
        message:
          "La cantidad debe ser mayor a 0 y los campos numero de documento y observacion son obligatorios",
      });
    }

    const articuloActual = await collection().findOne({ _id: new ObjectId(articuloId) });

    if (!articuloActual) {
      return res.status(404).json({ message: "Articulo no encontrado" });
    }

    if (articuloActual.cantidad < cantidad) {
      return res.status(400).json({
        message: `No hay stock suficiente. Disponible: ${articuloActual.cantidad}`,
      });
    }

    const cantidadRestante = articuloActual.cantidad - cantidad;

    if (cantidadRestante === 0) {
      await collection().deleteOne({ _id: articuloActual._id });
    } else {
      await collection().updateOne(
        { _id: articuloActual._id },
        { $set: { cantidad: cantidadRestante } },
      );
    }

    const nuevaSalida: Salida = {
      articuloId,
      codigo: articuloActual.codigo,
      descripcion: articuloActual.descripcion,
      contenedor: articuloActual.contenedor,
      cantidad,
      numeroDocumento,
      observacion,
      fecha: new Date(),
    };

    await salidas().insertOne(nuevaSalida);

    return res.status(201).json({
      message: "Salida registrada correctamente",
      restante: cantidadRestante,
    });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    return res.status(500).json({ menssage: mensaje });
  }
};
