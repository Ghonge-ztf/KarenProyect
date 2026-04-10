import { useEffect, useState, type ChangeEvent } from "react"
import { useParams } from "react-router-dom"
import type { IArticulo } from "../utils/models/articulo"
import axios from "axios";
import Modal from "../components/Modal";

interface IResultado {
    contenido: IArticulo[]
}

interface IMoveArticuloProp {
    articulo: IArticulo,
    contenedorNue: string
}

// interface IPayload {
//     codigo: string
//     de
// }

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

    const moveArticulo = async ({ articulo, contenedorNue }: IMoveArticuloProp) => {
        await axios.post("http://localhost:4567/articulos/mover",
            {
                data: articulo,
                contenedorN: contenedorNue
            }
        )
            .then((res) => { console.log(res.data) })
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

    const abrirModal = (articulo: IArticulo) => {
        setArticuloSeleccionado(articulo);
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
                            Crear artículo
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
                                        <tr key={articulo.codigo}
                                            onClick={() => { abrirModal(articulo) }}
                                            // onClick={() => { abrirModal(articulo) }}
                                            style={{ cursor: "pointer" }}

                                            draggable
                                            onDragStart={(event) => {
                                                event.dataTransfer.setData(
                                                    "application/json",
                                                    JSON.stringify({ articulo })
                                                )
                                                setDragOver(true);
                                            }}

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
                            <button type="button" className="btn btn-create" onClick={cerrarModal}>
                                Guardar
                            </button>
                        }
                    >
                        {articuloSeleccionado && (
                            <div>
                                <p><strong>Codigo:</strong> <input id="codigo" type="text" placeholder={articuloSeleccionado.codigo}></input> </p> 
                                <p><strong>Cantidad:</strong> <input id="cantidad" type="number" placeholder={articuloSeleccionado.cantidad.toString()}></input></p>
                                <p><strong>Descripcion:</strong> <textarea id="descripcion" placeholder={articuloSeleccionado.descripcion}></textarea></p>
                                <p><strong>Contenedor:</strong> {articuloSeleccionado.contenedor}</p>
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
                                        console.log(data);
                                        setDragOver(false);

                                        const props: IMoveArticuloProp = {
                                            articulo: data,
                                            contenedorNue: contenedor
                                        }
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
