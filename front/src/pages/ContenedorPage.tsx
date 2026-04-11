import { useEffect, useState, type ChangeEvent } from "react"
import { useParams } from "react-router-dom"
import type { IArticulo } from "../utils/models/articulo"
import axios from "axios";
import Modal from "../components/Modal";

interface IResultado {
    contenido: IArticulo[]
}

interface IMoveArticuloProp {
    articuloId: string;
    codigo: string;
    contenedorActual: string;
    contenedorNue: string;
}

interface IEditArticulo {
    codigo: string;
    cantidad: number;
    descripcion: string;
}

export default function ContenedorPage() {
    const [modal, setModal] = useState<boolean>(false);
    const [dragOver, setDragOver] = useState<boolean>(false);
    const [articuloSeleccionado, setArticuloSeleccionado] = useState<IArticulo | null>(null);
    const [articulos, setArticulos] = useState<IArticulo[]>([
        {
            codigo: "no hay",
            cantidad: 0,
            descripcion: "no hay",
            contenedor: "no hay"
        }
    ]);
    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
    const [formError, setFormError] = useState<string>("");
    const [newArticulo, setNewArticulo] = useState({
        codigo: "",
        cantidad: 0,
        descripcion: "",
    });
    const [editArticulo, setEditArticulo] = useState<IEditArticulo>({
        codigo: "",
        cantidad: 0,
        descripcion: "",
    });
    const { id } = useParams()

    const getArticulos = async () => {
        await axios.get<IResultado>("http://localhost:4567/contenedores/articulos", {
            params: {
                contenedor: id
            }
        })
            .then((res) => { setArticulos(res.data.contenido) })
            .catch(console.error);
    }

    const [contenedores, setContenedores] = useState<string[]>(['']);

    const getContenedores = async () => {
        await axios.get("http://localhost:4567/contenedores/todos")
            .then((res) => {
                setContenedores(res.data.contenido)
            })
            .catch(console.error);

    }

    const moveArticulo = async ({ articuloId, contenedorNue }: IMoveArticuloProp) => {
        await axios.post("http://localhost:4567/articulos/mover", {
            articuloId,
            contenedorN: contenedorNue,
        })
            .then(() => {
                getArticulos();
                getContenedores();
            })
            .catch(console.error);
    }




    const handleNewArticuloChange = (
        field: "codigo" | "cantidad" | "descripcion"
    ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = field === "cantidad"
            ? Number(event.target.value)
            : event.target.value;

        setNewArticulo((prev) => ({ ...prev, [field]: value }));
    }

    const closeCreateModal = () => {
        setCreateModalOpen(false);
        setNewArticulo({ codigo: "", cantidad: 0, descripcion: "" });
        setFormError("");
    }

    const crearArticulo = async () => {
        if (!id) return;

        const codigo = newArticulo.codigo.trim();
        const descripcion = newArticulo.descripcion.trim();
        const cantidad = Number(newArticulo.cantidad);

        if (!codigo || !descripcion || cantidad <= 0) {
            setFormError("Completa el código, la cantidad mayor a 0 y la descripción.");
            return;
        }

        const existeArticulo = articulos.find(
            (item) => item.codigo.toLowerCase() === codigo.toLowerCase()
        );

        if (existeArticulo) {
            setFormError(
                "Artículo existente encontrado. Se sumará la cantidad al artículo actual."
            );
        }

        await axios.post("http://localhost:4567/articulos", {
            contenedor: id,
            codigo,
            cantidad,
            descripcion,
        })
            .then(() => {
                getArticulos();
                closeCreateModal();
            })
            .catch((error) => {
                console.error(error);
                setFormError("Error al crear el artículo. Revisa los datos e intenta de nuevo.");
            });
    }

    const handleEditArticuloChange = (
        field: "codigo" | "cantidad" | "descripcion"
    ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = field === "cantidad"
            ? Number(event.target.value)
            : event.target.value;

        setEditArticulo((prev) => ({ ...prev, [field]: value }));
    }

    const guardarArticulo = async () => {
        if (!articuloSeleccionado) return;

        const codigo = editArticulo.codigo.trim();
        const descripcion = editArticulo.descripcion.trim();
        const cantidad = Number(editArticulo.cantidad);
        const articuloId = String(articuloSeleccionado._id ?? "");

        if (!codigo || !descripcion || cantidad <= 0) {
            setFormError("Completa el código, la cantidad mayor a 0 y la descripción.");
            return;
        }

        if (!articuloId) {
            setFormError("No se encontró el identificador del artículo.");
            return;
        }

        await axios.put(`http://localhost:4567/articulos/${articuloId}`, {
            id: articuloId,
            codigo,
            cantidad,
            descripcion,
        })
            .then(() => {
                getArticulos();
                cerrarModal();
            })
            .catch((error) => {
                console.error(error);
                setFormError("Error al actualizar el artículo. Revisa los datos e intenta de nuevo.");
            });
    }

    const abrirModal = (articulo: IArticulo) => {
        setArticuloSeleccionado(articulo);
        setEditArticulo({
            codigo: articulo.codigo,
            cantidad: articulo.cantidad,
            descripcion: articulo.descripcion,
        });
        setFormError("");
        setModal(true);
    }

    const cerrarModal = () => {
        setModal(false);
        setArticuloSeleccionado(null);
    }





    useEffect(() => { getArticulos(); getContenedores(); }, [])


    return (
        <main className='page-shell'>
            <div className='page-container'>
                <section className='panel panel-muted'>
                    <h2>Contenedor: {id}</h2>
                </section>

                <section className="panel">
                    <div className="panel-header">
                        <h3>Articulos</h3>
                        <button
                            type="button"
                            className="btn btn-create"
                            onClick={() => setCreateModalOpen(true)}
                        >
                            Agregar Articulo
                        </button>
                    </div>
                    <div className="table-card">
                        <table className="soft-table">
                            <thead>
                                <tr>
                                    <th>Codigo</th>
                                    <th>Cantidad</th>
                                    <th>Descripcion</th>
                                    <th>Contenedor</th>
                                </tr>
                            </thead>

                            <tbody>
                                {articulos.length > 0 &&
                                    articulos.map((articulo) => (
                                        <tr key={String(articulo._id ?? articulo.codigo)}
                                            onClick={() => { abrirModal(articulo) }}
                                            style={{ cursor: "pointer" }}
                                            draggable
                                            onDragStart={(event) => {
                                                const payload = {
                                                    articuloId: String(articulo._id ?? ""),
                                                    codigo: articulo.codigo,
                                                    contenedorActual: articulo.contenedor,
                                                };

                                                event.dataTransfer.setData(
                                                    "application/json",
                                                    JSON.stringify(payload)
                                                );
                                                setDragOver(true);
                                            }}
                                            onDragEnd={() => setDragOver(false)}
                                        >
                                            <td>{articulo.codigo}</td>
                                            <td>{articulo.cantidad}</td>
                                            <td>{articulo.descripcion}</td>
                                            <td>{articulo.contenedor}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>


                    



                    <Modal
                        isOpen={createModalOpen}
                        onClose={closeCreateModal}
                        title="Crear artículo"
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
                                    Código:
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
                                    Descripción:
                                    <textarea
                                        id="new-descripcion"
                                        value={newArticulo.descripcion}
                                        onChange={handleNewArticuloChange("descripcion")}
                                    />
                                </label>
                            </p>
                            {formError ? <p className="form-error">{formError}</p> : null}
                        </div>
                    </Modal>

                    <Modal
                        isOpen={modal}
                        onClose={cerrarModal}
                        title={articuloSeleccionado ? `Articulo: ${articuloSeleccionado.codigo}` : "Articulo"}
                        actions={
                            <>
                                <button type="button" className="btn btn-create" onClick={guardarArticulo}>
                                    Guardar
                                </button>
                                <button type="button" className="btn" onClick={cerrarModal}>
                                    Cancelar
                                </button>
                            </>
                        }
                    >
                        {articuloSeleccionado && (
                            <div className="modal-form">
                                <p>
                                    <label htmlFor="edit-codigo">
                                        <strong>Código:</strong>
                                        <input
                                            id="edit-codigo"
                                            type="text"
                                            value={editArticulo.codigo}
                                            onChange={handleEditArticuloChange("codigo")}
                                        />
                                    </label>
                                </p>
                                <p>
                                    <label htmlFor="edit-cantidad">
                                        <strong>Cantidad:</strong>
                                        <input
                                            id="edit-cantidad"
                                            type="number"
                                            min="1"
                                            value={editArticulo.cantidad || ""}
                                            onChange={handleEditArticuloChange("cantidad")}
                                        />
                                    </label>
                                </p>
                                <p>
                                    <label htmlFor="edit-descripcion">
                                        <strong>Descripción:</strong>
                                        <textarea
                                            id="edit-descripcion"
                                            value={editArticulo.descripcion}
                                            onChange={handleEditArticuloChange("descripcion")}
                                        />
                                    </label>
                                </p>
                                <p><strong>Contenedor:</strong> {articuloSeleccionado.contenedor}</p>
                                {formError ? <p className="form-error">{formError}</p> : null}
                            </div>
                        )}
                    </Modal>

                </section>
                {dragOver && <section className="panel contenedores-panel" style={{ marginTop: "10px" }}>


                        {
                            contenedores.map((contenedor) => (
                                contenedor == id ? <p></p> : <div
                                    key={contenedor}
                                    onDragOver={(event) => { event.preventDefault() }}
                                    className="panel contenedores-wrapper"
                                    onDrop={(event) => {
                                        event.preventDefault();

                                                const raw = event.dataTransfer.getData("application/json");
                                        const data = JSON.parse(raw);
                                        setDragOver(false);

                                        const props: IMoveArticuloProp = {
                                            articuloId: data.articuloId,
                                            codigo: data.codigo,
                                            contenedorActual: data.contenedorActual,
                                            contenedorNue: contenedor,
                                        };
                                        moveArticulo(props);

                                    }}
                                >
                                    <h3>{contenedor}</h3>
                                </div>
                            ))
                        }
                    </section>}


            </div>
        </main>
    )
}
