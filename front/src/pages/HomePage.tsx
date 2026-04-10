import { useEffect, useState, type ChangeEvent } from "react"
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "../components/Modal";

export default function HomePage() {
  const [contenedores, setContenedores] = useState<string[]>(['']);
  const [showCreateContainerModal, setShowCreateContainerModal] = useState<boolean>(false);
  const [newContenedor, setNewContenedor] = useState({
    contenedor: "",
    codigo: "",
    cantidad: 0,
    descripcion: "",
  });
  const [formError, setFormError] = useState<string>("");
  const navigate = useNavigate();

  const getContenedores = async () => {
    await axios.get("http://localhost:4567/contenedores/todos")
      .then((res) => { 
        setContenedores(res.data.contenido) 
      })
      .catch(console.error);

  }

  const handleNewContenedorChange = (
    field: "contenedor" | "codigo" | "cantidad" | "descripcion"
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === "cantidad" ? Number(event.target.value) : event.target.value;

    setNewContenedor((prev) => ({ ...prev, [field]: value }));
  }

  const closeCreateContainerModal = () => {
    setShowCreateContainerModal(false);
    setNewContenedor({ contenedor: "", codigo: "", cantidad: 0, descripcion: "" });
    setFormError("");
  }

  const crearContenedor = async () => {
    const nombre = newContenedor.contenedor.trim();
    const codigo = newContenedor.codigo.trim();
    const descripcion = newContenedor.descripcion.trim();
    const cantidad = Number(newContenedor.cantidad);

    if (!nombre || !codigo || !descripcion || cantidad <= 0) {
      setFormError("Completa el nombre del contenedor y los datos del producto.");
      return;
    }

    await axios
      .post("http://localhost:4567/articulos", {
        contenedor: nombre,
        codigo,
        cantidad,
        descripcion,
      })
      .then(() => {
        getContenedores();
        closeCreateContainerModal();
      })
      .catch((error) => {
        console.error(error);
        setFormError("Error al crear el contenedor. Revisa los datos e intenta de nuevo.");
      });
  }


  useEffect(() => {
    getContenedores()
  }, [])



  return (
    <main className="page-shell">
      <div className="page-container">
        <section className="panel panel-muted">
          <h2>Panel principal</h2>
          <p className="lead-text">
            Base visual general para la pagina con tonos claros, superficies suaves
            y componentes reutilizables para tus siguientes vistas.
          </p>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Contenedores</h2>
            <button
              type="button"
              className="btn btn-create"
              onClick={() => setShowCreateContainerModal(true)}
            >
              Crear contenedor
            </button>
          </div>

          {contenedores.length > 0 && (
            <div className="button-grid">
              {contenedores.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="btn"
                  onClick={() => {
                    navigate(`/contenedor/${item}`)
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </section>

        <Modal
          isOpen={showCreateContainerModal}
          onClose={closeCreateContainerModal}
          title="Crear contenedor"
          actions={
            <>
              <button type="button" className="btn btn-create" onClick={crearContenedor}>
                Crear
              </button>
              <button type="button" className="btn" onClick={closeCreateContainerModal}>
                Cancelar
              </button>
            </>
          }
        >
          <div className="modal-form">
            <p>
              <label htmlFor="contenedor-name">
                Contenedor:
                <input
                  id="contenedor-name"
                  type="text"
                  value={newContenedor.contenedor}
                  onChange={handleNewContenedorChange("contenedor")}
                />
              </label>
            </p>
            <p>
              <strong>Producto:</strong>
            </p>
            <p>
              <label htmlFor="producto-codigo">
                Código:
                <input
                  id="producto-codigo"
                  type="text"
                  value={newContenedor.codigo}
                  onChange={handleNewContenedorChange("codigo")}
                />
              </label>
            </p>
            <p>
              <label htmlFor="producto-cantidad">
                Cantidad:
                <input
                  id="producto-cantidad"
                  type="number"
                  min="1"
                  value={newContenedor.cantidad || ""}
                  onChange={handleNewContenedorChange("cantidad")}
                />
              </label>
            </p>
            <p>
              <label htmlFor="producto-descripcion">
                Descripción:
                <input
                  id="producto-descripcion"
                  type="text"
                  value={newContenedor.descripcion}
                  onChange={handleNewContenedorChange("descripcion")}
                />
              </label>
            </p>
            {formError ? <p className="form-error">{formError}</p> : null}
          </div>
        </Modal>

      </div>
    </main>
  )
}
