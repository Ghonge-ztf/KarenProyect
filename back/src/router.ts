import { Router } from "express";
import {
  crearArticulo,
  actualizarArticulo,
  eliminarArticulo,
} from "./handlers/registroR";
import { getArticulos, getContenedores, moveArticulo } from "./handlers/accionesR";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).send("ete setch");
});

router.post("/articulos", crearArticulo);
router.post("/articulos/mover", moveArticulo);
router.put("/articulos/:id", actualizarArticulo);
router.delete("/articulos/:id", eliminarArticulo);  
router.get("/contenedores/articulos", getArticulos);
router.get("/contenedores/todos", getContenedores)


//(req, res) => { res.send("en trabajo")}

export default router;
