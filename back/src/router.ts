import { Router } from "express";
import {
  crearArticulo,
  actualizarArticulo,
  eliminarArticulo,
} from "./handlers/registroR";
import { getArticulos } from "./handlers/accionesR";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).send("ete setch");
});

router.post("/articulos", crearArticulo);
router.put("/articulos/:id", actualizarArticulo);
router.delete("/articulos/:id", eliminarArticulo);  
router.get("/articulos/todos", getArticulos);

export default router;
