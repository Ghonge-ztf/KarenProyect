import { Request, Response } from "express";
import { getArtisulosCollection } from "../utils/mongo";


const collection = () => getArtisulosCollection();


export const getArticulos = async (req: Request, res: Response) => {

    try {

        const query = req.query.contenedor;

        const datosC = await collection().find({ contenedor: query }).limit(25).toArray();

        if (datosC.length < 1) {
            console.log("no se esta recibiendo ningun dato de la base de datos")
            return res.status(404).json({ menssage: "request errorneo" })

        }
        
        console.log(`getArticulos | Datos encontrados:${datosC.length}`)
        return res.status(200).json({ contenido: datosC })
        

    } catch (error) {
        return res.status(500).json({ menssage: error.message })
    }

    

}


export const getContenedores = async (req: Request, res: Response) => {

    try {

        const datosC = await collection().distinct("contenedor");


        if (datosC.length < 1) {
            console.log("no se esta recibiendo ningun dato de la base de datos")
            return res.status(404).json({ menssage: "request errorneo" })
        }

        console.log(`getContenedores | Datos encontrados:${datosC.length}`)
        return res.status(200).json({contenido: datosC});

    } catch (error) {
        return res.status(500).json({ menssage: error.message })
    }



}
