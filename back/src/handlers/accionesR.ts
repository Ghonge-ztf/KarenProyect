import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getArtisulosCollection, getHistorialCollection } from "../utils/mongo";
import { Artisulo, Historial } from "../utils/models/artisulo";


const collection = () => getArtisulosCollection();
const historial = () => getHistorialCollection();


//TODO: validar los datos que se envian a moverArticulo
const Validacion = () =>{

}


export const getArticulos = async (req: Request, res: Response) => {

    try {

        const query = req.query.contenedor;

        const datosC = await collection().find({ contenedor: query }).limit(25).toArray();

        console.log(`getArticulos | Datos encontrados:${datosC.length}`)
        return res.status(200).json({ contenido: datosC })

    } catch (error) {
        return res.status(500).json({ menssage: error.message })
    }

    

}


export const getContenedores = async (req: Request, res: Response) => {

    try {

        const datosC = await collection().distinct("contenedor");

        console.log(`getContenedores | Datos encontrados:${datosC.length}`)
        return res.status(200).json({contenido: datosC});

    } catch (error) {
        return res.status(500).json({ menssage: error.message })
    }



}

export const moveArticulo = async (req: Request, res: Response) => {

    try {
        const { articuloId, contenedorN } = req.body;

        if (!articuloId || typeof articuloId !== "string" || !contenedorN || typeof contenedorN !== "string" || !ObjectId.isValid(articuloId)) {
            return res.status(400).json({ message: "Faltan datos requeridos o ID inválido para mover el artículo" });
        }

        const articuloActual = await collection().findOne({ _id: new ObjectId(articuloId) });

        if (!articuloActual) {
            return res.status(404).json({ message: "Artículo no encontrado" });
        }

        if (articuloActual.contenedor === contenedorN) {
            return res.status(200).json({ message: "El artículo ya se encuentra en el contenedor destino" });
        }

        const updateResult = await collection().updateOne(
            { _id: articuloActual._id },
            { $set: { contenedor: contenedorN } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(400).json({ message: "No se pudo mover el artículo" });
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
                return res.status(500).json({ message: "Error al crear el historial de artículo" });
            }
        } else {
            const contenedoresHistorial = [...historialExistente.contenedor];
            if (contenedoresHistorial[contenedoresHistorial.length - 1] !== contenedorN) {
                contenedoresHistorial.push(contenedorN);
            }
            const result = await historial().updateOne(
                { codigo: articuloActual.codigo },
                { $set: { contenedor: contenedoresHistorial } }
            );
            if (result.matchedCount !== 1) {
                return res.status(500).json({ message: "Error al actualizar el historial de artículo" });
            }
        }

        return res.status(200).json({ message: "Artículo movido correctamente" });
    } catch (error) {
        return res.status(500).json({ menssage: error });
    }
}

