import { Request, Response } from "express";
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

export const moveArticulo = async (req: Request, res: Response) => {

    try{
        const { data, contenedorN } = req.body;
        const articulo: Artisulo = data.articulo;
        
        const datosC: Historial = await historial().findOne({codigo: articulo.codigo});

        if( data.articulo.codigo == undefined || contenedorN == undefined){
            res.status(200).json({message: "error move articulo"});
        }

        if(datosC == null){

            const productoHistorial: Historial = {
                codigo: articulo.codigo,
                cantidad: articulo.cantidad,
                contenedor: []
            } 

            console.log("producto ",productoHistorial);

            productoHistorial.contenedor.push(articulo.contenedor);
            productoHistorial.contenedor.push(contenedorN);
            const result = await historial().insertOne(productoHistorial);

            result.acknowledged ? res.status(201).json({message: "historial registrado"}) : res.status(400).json({message: "Error al crear el historial de articulo"});

        }else{
            
            datosC.contenedor.push(contenedorN)
            const result = await historial().updateOne({codigo: articulo.codigo}, {$set: datosC});


            result.matchedCount === 1 ? res.status(200).json({message: "historial registrado"}) : res.status(400).json({message: "Error al registrar el historial de articulo"});
        }


    }catch(error){
        return res.status(500).json({ menssage: error })
    }

} 
