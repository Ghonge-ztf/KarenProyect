import { Router } from "express";
import {
  crearArticulo,
  actualizarArticulo,
  eliminarArticulo,
} from "./handlers/registroR";
import {
  getArticuloDetalle,
  getArticulos,
  getContenedores,
  moveArticulo,
  registrarSalida,
  searchArticulos,
  searchContenedores,
} from "./handlers/accionesR";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).send("ete setch");
});

router.post("/articulos", crearArticulo);
router.post("/articulos/mover", moveArticulo);
router.post("/salidas", registrarSalida);
router.put("/articulos/:id", actualizarArticulo);
router.delete("/articulos/:id", eliminarArticulo);  
router.get("/contenedores/articulos", getArticulos);
router.get("/contenedores/todos", getContenedores);
router.get("/contenedores/buscar", searchContenedores);
router.get("/articulos/buscar", searchArticulos);
router.get("/articulos/detalle", getArticuloDetalle);


//(req, res) => { res.send("en trabajo")}

export default router;
