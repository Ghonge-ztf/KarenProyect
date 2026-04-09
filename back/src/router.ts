import { Router } from "express";
import {
  crearArticulo,
  actualizarArticulo,
  eliminarArticulo,
} from "./handlers/registroR";
import { getArticulos, getContenedores } from "./handlers/accionesR";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).send("ete setch");
});

router.post("/articulos", crearArticulo);
router.put("/articulos/:id", actualizarArticulo);
router.delete("/articulos/:id", eliminarArticulo);  
router.get("/contenedor/articulos", getArticulos);
router.get("/contenedores/todos", getContenedores)


//(req, res) => { res.send("en trabajo")}

export default router;
