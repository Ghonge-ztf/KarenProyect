import { useEffect, useState, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import type { IArticulo } from "../utils/models/articulo";
import axios from "axios";
import Modal from "../components/Modal";

interface IResultado {
  contenido: IArticulo[];
}

const CONTENEDOR_MARKER = "__CONTENEDOR__";

export default function ContenedorPage() {
  const [articulos, setArticulos] = useState<IArticulo[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [newArticulo, setNewArticulo] = useState<IArticulo>({
    contenedor: "",
    codigo: "",
    cantidad: 0,
    descripcion: "",
    observacion: "",
  });
  const { id } = useParams();

  const articulosVisibles = articulos.filter(
    (articulo) =>
      articulo.descripcion !== CONTENEDOR_MARKER &&
      articulo.codigo !== `${CONTENEDOR_MARKER}_${id ?? ""}`,
  );

  const getArticulos = async () => {
    await axios
      .get<IResultado>("http://localhost:4567/contenedores/articulos", {
        params: {
          contenedor: id,
        },
      })
      .then((res) => {
        setArticulos(res.data.contenido);
      })
      .catch(console.error);
  };

  const handleNewArticuloChange =
    (field: "codigo" | "cantidad" | "descripcion" | "observacion") =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = field === "cantidad" ? Number(event.target.value) : event.target.value;

      setNewArticulo((prev) => ({ ...prev, [field]: value }));
    };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setNewArticulo({ contenedor: "", codigo: "", cantidad: 0, descripcion: "", observacion: "" });
    setFormError("");
  };

  const crearArticulo = async () => {
    if (!id) return;

    const codigo = newArticulo.codigo.trim();
    const descripcion = newArticulo.descripcion.trim();
    const cantidad = Number(newArticulo.cantidad);
    const observacion = newArticulo.observacion.trim();

    if (!codigo || !descripcion || !observacion || cantidad <= 0) {
      setFormError("Completa el codigo, la cantidad mayor a 0 y la descripcion.");
      return;
    }

    const existeArticulo = articulos.find(
      (item) => item.codigo.toLowerCase() === codigo.toLowerCase(),
    );

    if (existeArticulo) {
      setFormError("Articulo existente encontrado. Se sumara la cantidad al articulo actual.");
    }

    await axios
      .post("http://localhost:4567/articulos", {
        contenedor: id,
        codigo,
        cantidad,
        descripcion,
        observacion,
      })
      .then(() => {
        getArticulos();
        closeCreateModal();
      })
      .catch((error) => {
        console.error(error);
        setFormError("Error al crear el articulo. Revisa los datos e intenta de nuevo.");
      });
  };

  useEffect(() => {
    getArticulos();
  }, [id]);

  return (
    <main className="page-shell">
      <div className="page-container">
        <section className="panel panel-muted">
          <h2>Contenedor: {id}</h2>
        </section>

        <section className="panel panel-muted">
          <div className="panel-header">
            <h3>Articulos</h3>
            <div className="toolbar">
              <button
                type="button"
                className="btn btn-create"
                onClick={() => setCreateModalOpen(true)}
              >
                Agregar articulo
              </button>
            </div>
          </div>

          <div className="table-card">
            <table className="soft-table">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Cantidad</th>
                  <th>Descripcion</th>
                  <th>Contenedor</th>
                  <th>Observacion</th>
                </tr>
              </thead>

              <tbody>
                {articulosVisibles.length > 0 &&
                  articulosVisibles.map((articulo) => (
                    <tr
                      key={String(articulo._id ?? articulo.codigo)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{articulo.codigo}</td>
                      <td>{articulo.cantidad}</td>
                      <td>{articulo.descripcion}</td>
                      <td>{articulo.contenedor}</td>
                      <td>{articulo.observacion}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <Modal
            isOpen={createModalOpen}
            onClose={closeCreateModal}
            title="Crear articulo"
            actions={
              <>
                <button type="button" className="btn btn-create" onClick={crearArticulo}>
                  Crear
                </button>
                <button type="button" className="btn" onClick={closeCreateModal}>
                  Cancelar
                </button>
              </>
            }
          >
            <div className="modal-form">
              <p>
                <strong>Contenedor:</strong> {id}
              </p>
              <p>
                <label htmlFor="new-codigo">
                  Codigo:
                  <input
                    id="new-codigo"
                    type="text"
                    value={newArticulo.codigo}
                    onChange={handleNewArticuloChange("codigo")}
                  />
                </label>
              </p>
              <p>
                <label htmlFor="new-cantidad">
                  Cantidad:
                  <input
                    id="new-cantidad"
                    type="number"
                    min="1"
                    value={newArticulo.cantidad || ""}
                    onChange={handleNewArticuloChange("cantidad")}
                  />
                </label>
              </p>
              <p>
                <label htmlFor="new-descripcion">
                  Descripcion:
                  <textarea
                    id="new-descripcion"
                    value={newArticulo.descripcion}
                    onChange={handleNewArticuloChange("descripcion")}
                  />
                </label>
              </p>
              <p>
                <label htmlFor="new-observacion">
                  Observacion:
                  <textarea
                    id="new-observacion"
                    value={newArticulo.observacion}
                    onChange={handleNewArticuloChange("observacion")}
                  />
                </label>
              </p>
              {formError ? <p className="form-error">{formError}</p> : null}
            </div>
          </Modal>
        </section>
      </div>
    </main>
  );
}
