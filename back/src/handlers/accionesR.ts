import { Request, Response } from "express";
import { getArtisulosCollection } from "../utils/mongo";


const collection = () => getArtisulosCollection();


export const getArticulos = async (req: Request, res: Response) => {

    try {

        const query = req.query.contenedor;

        const datosC = await collection().find({ contenedor: query }).limit(25).toArray();

        console.log(datosC);

        if (datosC.length < 1) {
            console.log("no se esta recibiendo ningun dato de la base de datos")
            return res.status(404).json({ menssage: "request errorneo" })

        }
    } catch (error) {
        return res.status(500).json({ menssage: error.message })
    }

    return res.status(200).json({ message: "datos encontrados" });

}


export const getContenedores = async (req: Request, res: Response) => {

    try {

        const datosC = await collection().distinct("contenedor");


        if (datosC.length < 1) {
            console.log("no se esta recibiendo ningun dato de la base de datos")
            return res.status(404).json({ menssage: "request errorneo" })
        }

        return res.status(200).json({contenedores: datosC});

    } catch (error) {
        return res.status(500).json({ menssage: error.message })
    }



}
