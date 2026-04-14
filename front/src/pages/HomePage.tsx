import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "../components/Modal";
import type { IArticulo, IArticuloDetalle } from "../utils/models/articulo";

interface IContenedoresResponse {
  contenido: string[];
}

interface IArticulosResponse {
  contenido: IArticulo[];
}

interface IArticuloDetalleResponse {
  contenido: IArticuloDetalle;
}

interface ISalidaForm {
  articuloQuery: string;
  articuloId: string;
  codigo: string;
  cantidad: number;
  numeroDocumento: string;
  observacion: string;
  contenedorSeleccionado: string;
}

const CONTENEDOR_MARKER = "__CONTENEDOR__";

export default function HomePage() {
  const [contenedores, setContenedores] = useState<string[]>([]);
  const [showCreateContainerModal, setShowCreateContainerModal] = useState<boolean>(false);
  const [newContenedor, setNewContenedor] = useState({
    contenedor: "",
  });
  const [formError, setFormError] = useState<string>("");
  const [showContenedorSearch, setShowContenedorSearch] = useState<boolean>(false);
  const [showArticuloSearch, setShowArticuloSearch] = useState<boolean>(false);
  const [contenedorQuery, setContenedorQuery] = useState<string>("");
  const [articuloQuery, setArticuloQuery] = useState<string>("");
  const [filteredContenedores, setFilteredContenedores] = useState<string[]>([]);
  const [articuloResultados, setArticuloResultados] = useState<IArticulo[]>([]);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<IArticuloDetalle | null>(null);
  const [articuloModalOpen, setArticuloModalOpen] = useState<boolean>(false);
  const [salidaModalOpen, setSalidaModalOpen] = useState<boolean>(false);
  const [articuloSearchError, setArticuloSearchError] = useState<string>("");
  const [salidaError, setSalidaError] = useState<string>("");
  const [highlightedArticuloIndex, setHighlightedArticuloIndex] = useState<number>(0);
  const [salidaResultados, setSalidaResultados] = useState<IArticulo[]>([]);
  const [detalleSalidaSeleccionado, setDetalleSalidaSeleccionado] = useState<IArticuloDetalle | null>(
    null,
  );
  const [salidaForm, setSalidaForm] = useState<ISalidaForm>({
    articuloQuery: "",
    articuloId: "",
    codigo: "",
    cantidad: 0,
    numeroDocumento: "",
    observacion: "",
    contenedorSeleccionado: "",
  });
  const navigate = useNavigate();

  const getContenedores = async () => {
    await axios
      .get<IContenedoresResponse>("http://localhost:4567/contenedores/todos")
      .then((res) => {
        setContenedores(res.data.contenido);
      })
      .catch(console.error);
  };

  const handleNewContenedorChange =
    (field: "contenedor") =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setNewContenedor((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const closeCreateContainerModal = () => {
    setShowCreateContainerModal(false);
    setNewContenedor({ contenedor: "" });
    setFormError("");
  };

  const closeArticuloModal = () => {
    setArticuloModalOpen(false);
    setArticuloSeleccionado(null);
  };

  const resetSalidaForm = () => {
    setSalidaForm({
      articuloQuery: "",
      articuloId: "",
      codigo: "",
      cantidad: 0,
      numeroDocumento: "",
      observacion: "",
      contenedorSeleccionado: "",
    });
    setSalidaResultados([]);
    setDetalleSalidaSeleccionado(null);
    setSalidaError("");
  };

  const closeSalidaModal = () => {
    setSalidaModalOpen(false);
    resetSalidaForm();
  };

  const crearContenedor = async () => {
    const nombre = newContenedor.contenedor.trim();

    if (!nombre) {
      setFormError("Completa el nombre del contenedor.");
      return;
    }

    await axios
      .post("http://localhost:4567/articulos", {
        contenedor: nombre,
        codigo: `${CONTENEDOR_MARKER}_${nombre}`,
        cantidad: 0,
        descripcion: CONTENEDOR_MARKER,
        observacion: "Registro interno para crear contenedor",
      })
      .then(() => {
        getContenedores();
        closeCreateContainerModal();
      })
      .catch((error) => {
        console.error(error);
        setFormError("Error al crear el contenedor. Revisa los datos e intenta de nuevo.");
      });
  };

  const cargarDetalleArticulo = async (codigo: string) => {
    await axios
      .get<IArticuloDetalleResponse>("http://localhost:4567/articulos/detalle", {
        params: { codigo },
      })
      .then((res) => {
        setArticuloSeleccionado(res.data.contenido);
        setArticuloModalOpen(true);
        setArticuloSearchError("");
      })
      .catch((error) => {
        console.error(error);
        setArticuloSearchError("No fue posible cargar el detalle del articulo.");
      });
  };

  const cargarDetalleSalida = async (codigo: string) => {
    await axios
      .get<IArticuloDetalleResponse>("http://localhost:4567/articulos/detalle", {
        params: { codigo },
      })
      .then((res) => {
        const detalle = res.data.contenido;
        const contenedorInicial = detalle.contenedores[0]?.contenedor ?? "";
        const articuloInicial = detalle.contenedores[0]?._id ?? "";

        setDetalleSalidaSeleccionado(detalle);
        setSalidaForm((prev) => ({
          ...prev,
          codigo,
          contenedorSeleccionado: contenedorInicial,
          articuloId: articuloInicial,
        }));
        setSalidaError("");
      })
      .catch((error) => {
        console.error(error);
        setSalidaError("No fue posible cargar la informacion del articulo.");
      });
  };

  const handleArticuloSelection = (articulo: IArticulo) => {
    setArticuloQuery(`${articulo.codigo} - ${articulo.descripcion}`);
    setArticuloResultados([]);
    setHighlightedArticuloIndex(0);
    cargarDetalleArticulo(articulo.codigo);
  };

  const handleSalidaFormChange =
    (field: keyof ISalidaForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = field === "cantidad" ? Number(event.target.value) : event.target.value;
      setSalidaForm((prev) => ({ ...prev, [field]: value }));
    };

  const seleccionarArticuloSalida = (articulo: IArticulo) => {
    setSalidaForm((prev) => ({
      ...prev,
      articuloQuery: `${articulo.codigo} - ${articulo.descripcion}`,
      codigo: articulo.codigo,
    }));
    setSalidaResultados([]);
    cargarDetalleSalida(articulo.codigo);
  };

  const registrarSalida = async () => {
    if (!salidaForm.articuloId) {
      setSalidaError("Selecciona un articulo valido para registrar la salida.");
      return;
    }

    if (
      salidaForm.cantidad <= 0 ||
      !salidaForm.numeroDocumento.trim() ||
      !salidaForm.observacion.trim()
    ) {
      setSalidaError("Completa articulo, cantidad, numero de documento y observacion.");
      return;
    }

    await axios
      .post("http://localhost:4567/salidas", {
        articuloId: salidaForm.articuloId,
        cantidad: salidaForm.cantidad,
        numeroDocumento: salidaForm.numeroDocumento,
        observacion: salidaForm.observacion,
      })
      .then(() => {
        closeSalidaModal();
      })
      .catch((error) => {
        console.error(error);
        setSalidaError(
          error.response?.data?.message ?? "No se pudo registrar la salida del articulo.",
        );
      });
  };

  const handleArticuloKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (articuloResultados.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedArticuloIndex((prev) =>
        prev >= articuloResultados.length - 1 ? 0 : prev + 1,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedArticuloIndex((prev) =>
        prev <= 0 ? articuloResultados.length - 1 : prev - 1,
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleArticuloSelection(articuloResultados[highlightedArticuloIndex]);
    }
  };

  useEffect(() => {
    getContenedores();
  }, []);

  useEffect(() => {
    const query = contenedorQuery.trim().toLowerCase();
    setFilteredContenedores(
      contenedores.filter((item) => item.toLowerCase().includes(query)),
    );
  }, [contenedorQuery, contenedores]);

  useEffect(() => {
    const query = articuloQuery.trim();

    if (!showArticuloSearch || !query) {
      setArticuloResultados([]);
      setArticuloSearchError("");
      setHighlightedArticuloIndex(0);
      return;
    }

    const timeout = window.setTimeout(() => {
      axios
        .get<IArticulosResponse>("http://localhost:4567/articulos/buscar", {
          params: { q: query },
        })
        .then((res) => {
          setArticuloResultados(res.data.contenido);
          setHighlightedArticuloIndex(0);
          setArticuloSearchError("");
        })
        .catch((error) => {
          console.error(error);
          setArticuloSearchError("No se pudieron buscar articulos.");
        });
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [articuloQuery, showArticuloSearch]);

  useEffect(() => {
    const query = salidaForm.articuloQuery.trim();

    if (!salidaModalOpen || !query) {
      setSalidaResultados([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      axios
        .get<IArticulosResponse>("http://localhost:4567/articulos/buscar", {
          params: { q: query },
        })
        .then((res) => {
          setSalidaResultados(res.data.contenido);
          setSalidaError("");
        })
        .catch((error) => {
          console.error(error);
          setSalidaError("No se pudo buscar el articulo.");
        });
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [salidaForm.articuloQuery, salidaModalOpen]);

  useEffect(() => {
    if (!detalleSalidaSeleccionado || !salidaForm.contenedorSeleccionado) {
      return;
    }

    const articuloSeleccionado = detalleSalidaSeleccionado.contenedores.find(
      (item) => item.contenedor === salidaForm.contenedorSeleccionado,
    );

    if (!articuloSeleccionado) return;

    setSalidaForm((prev) => ({
      ...prev,
      articuloId: articuloSeleccionado._id,
    }));
  }, [detalleSalidaSeleccionado, salidaForm.contenedorSeleccionado]);

  return (
    <main className="page-shell">
      <div className="page-container">
        <section className="panel panel-muted">
          <h2>Panel principal</h2>
          <p className="lead-text">
            Crea contenedores, explora el inventario y usa las busquedas rapidas para
            encontrar contenedores o articulos sin salir de esta vista.
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

          <div className="toolbar">
            <button
              type="button"
              className="btn btn-move"
              onClick={() => {
                setShowContenedorSearch((prev) => !prev);
                setShowArticuloSearch(false);
              }}
            >
              Buscar contenedor
            </button>
            <button
              type="button"
              className="btn btn-create"
              onClick={() => {
                setShowArticuloSearch((prev) => !prev);
                setShowContenedorSearch(false);
              }}
            >
              Buscar articulo
            </button>
            <button
              type="button"
              className="btn btn-delete"
              onClick={() => {
                setSalidaModalOpen(true);
                setShowArticuloSearch(false);
                setShowContenedorSearch(false);
              }}
            >
              Salida de articulo
            </button>
          </div>

          {showContenedorSearch ? (
            <div className="search-panel">
              <label className="field-block" htmlFor="contenedor-search">
                Buscar contenedor
                <input
                  id="contenedor-search"
                  type="text"
                  value={contenedorQuery}
                  onChange={(event) => setContenedorQuery(event.target.value)}
                  placeholder="Escribe el nombre del contenedor"
                />
              </label>

              <div className="search-results">
                {filteredContenedores.length > 0 ? (
                  filteredContenedores.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="search-result-item"
                      onClick={() => navigate(`/contenedor/${item}`)}
                    >
                      {item}
                    </button>
                  ))
                ) : (
                  <p className="empty-state">No se encontraron contenedores.</p>
                )}
              </div>
            </div>
          ) : null}

          {showArticuloSearch ? (
            <div className="search-panel">
              <label className="field-block" htmlFor="articulo-search">
                Buscar articulo
                <input
                  id="articulo-search"
                  type="text"
                  value={articuloQuery}
                  onChange={(event) => setArticuloQuery(event.target.value)}
                  onKeyDown={handleArticuloKeyDown}
                  placeholder="Busca por codigo, descripcion o contenedor"
                />
              </label>

              <div className="search-results">
                {articuloResultados.length > 0 ? (
                  articuloResultados.map((item, index) => (
                    <button
                      key={`${item.codigo}-${item.contenedor}-${item._id ?? index}`}
                      type="button"
                      className={`search-result-item ${index === highlightedArticuloIndex ? "is-active" : ""}`}
                      onClick={() => handleArticuloSelection(item)}
                    >
                      <span>{item.codigo}</span>
                      <span>
                        {item.descripcion} | {item.contenedor} | stock: {item.cantidad}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="empty-state">
                    {articuloQuery.trim()
                      ? "No se encontraron articulos."
                      : "Empieza a escribir para ver resultados."}
                  </p>
                )}
                {articuloSearchError ? (
                  <p className="form-error">{articuloSearchError}</p>
                ) : null}
              </div>
            </div>
          ) : null}

          {contenedores.length > 0 && (
            <div className="button-grid">
              {contenedores.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="btn"
                  onClick={() => {
                    navigate(`/contenedor/${item}`);
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
            {formError ? <p className="form-error">{formError}</p> : null}
          </div>
        </Modal>

        <Modal
          isOpen={articuloModalOpen}
          onClose={closeArticuloModal}
          title={articuloSeleccionado ? `Articulo ${articuloSeleccionado.codigo}` : "Articulo"}
          actions={
            <button type="button" className="btn" onClick={closeArticuloModal}>
              Cerrar
            </button>
          }
        >
          {articuloSeleccionado ? (
            <div className="detail-stack">
              <p>
                <strong>Descripcion:</strong> {articuloSeleccionado.descripcion}
              </p>
              <p>
                <strong>Observacion:</strong> {articuloSeleccionado.observacion}
              </p>
              <p>
                <strong>Total disponible:</strong> {articuloSeleccionado.totalCantidad}
              </p>
              <div className="table-card compact-table">
                <table className="soft-table">
                  <thead>
                    <tr>
                      <th>Contenedor</th>
                      <th>Cantidad</th>
                      <th>Observacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articuloSeleccionado.contenedores.map((item) => (
                      <tr key={item._id}>
                        <td>{item.contenedor}</td>
                        <td>{item.cantidad}</td>
                        <td>{item.observacion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </Modal>

        <Modal
          isOpen={salidaModalOpen}
          onClose={closeSalidaModal}
          title="Registrar salida"
          actions={
            <>
              <button type="button" className="btn btn-delete" onClick={registrarSalida}>
                Registrar
              </button>
              <button type="button" className="btn" onClick={closeSalidaModal}>
                Cancelar
              </button>
            </>
          }
        >
          <div className="modal-form">
            <label className="field-block" htmlFor="salida-articulo-home">
              Articulo
              <input
                id="salida-articulo-home"
                type="text"
                value={salidaForm.articuloQuery}
                onChange={handleSalidaFormChange("articuloQuery")}
                placeholder="Busca por codigo o descripcion"
              />
            </label>

            {salidaResultados.length > 0 ? (
              <div className="search-results">
                {salidaResultados.map((articulo) => (
                  <button
                    key={`${articulo.codigo}-${articulo.contenedor}-${articulo._id ?? articulo.descripcion}`}
                    type="button"
                    className="search-result-item"
                    onClick={() => seleccionarArticuloSalida(articulo)}
                  >
                    <span>{articulo.codigo}</span>
                    <span>
                      {articulo.descripcion} | {articulo.contenedor} | stock: {articulo.cantidad}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            {detalleSalidaSeleccionado ? (
              <div className="detail-stack">
                <p>
                  <strong>Codigo:</strong> {detalleSalidaSeleccionado.codigo}
                </p>
                <p>
                  <strong>Descripcion:</strong> {detalleSalidaSeleccionado.descripcion}
                </p>
                <p>
                  <strong>Total disponible:</strong> {detalleSalidaSeleccionado.totalCantidad}
                </p>
              </div>
            ) : null}

            {detalleSalidaSeleccionado && detalleSalidaSeleccionado.contenedores.length > 1 ? (
              <label className="field-block" htmlFor="salida-contenedor-home">
                Contenedor
                <select
                  id="salida-contenedor-home"
                  value={salidaForm.contenedorSeleccionado}
                  onChange={handleSalidaFormChange("contenedorSeleccionado")}
                >
                  {detalleSalidaSeleccionado.contenedores.map((item) => (
                    <option key={item._id} value={item.contenedor}>
                      {item.contenedor} | stock: {item.cantidad}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {detalleSalidaSeleccionado &&
            salidaForm.contenedorSeleccionado &&
            detalleSalidaSeleccionado.contenedores.some(
              (item) => item.contenedor === salidaForm.contenedorSeleccionado,
            ) ? (
              <p className="status-pill">
                Stock en {salidaForm.contenedorSeleccionado}:{" "}
                {
                  detalleSalidaSeleccionado.contenedores.find(
                    (item) => item.contenedor === salidaForm.contenedorSeleccionado,
                  )?.cantidad
                }
              </p>
            ) : null}

            <label className="field-block" htmlFor="salida-cantidad-home">
              Cantidad
              <input
                id="salida-cantidad-home"
                type="number"
                min="1"
                value={salidaForm.cantidad || ""}
                onChange={handleSalidaFormChange("cantidad")}
              />
            </label>

            <label className="field-block" htmlFor="salida-documento-home">
              Numero de documento
              <input
                id="salida-documento-home"
                type="text"
                value={salidaForm.numeroDocumento}
                onChange={handleSalidaFormChange("numeroDocumento")}
              />
            </label>

            <label className="field-block" htmlFor="salida-observacion-home">
              Observacion
              <textarea
                id="salida-observacion-home"
                value={salidaForm.observacion}
                onChange={handleSalidaFormChange("observacion")}
              />
            </label>

            {salidaError ? <p className="form-error">{salidaError}</p> : null}
          </div>
        </Modal>
      </div>
    </main>
  );
}
