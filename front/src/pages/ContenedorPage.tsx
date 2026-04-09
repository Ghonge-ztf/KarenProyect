import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import type { IArticulo } from "../utils/models/articulo"
import axios from "axios";
import Modal from "../components/Modal";

interface IResultado {
    contenido: IArticulo[]
}

// interface IPayload {
//     codigo: string
//     de
// }

export default function ContenedorPage() {
    const [modal, setModal] = useState<boolean>(false);
    const [dragOver, setDragOver] = useState<boolean>(false);
    const [articuloSeleccionado, setArticuloSeleccionado] = useState<IArticulo | null>(null);
    const [articulos, setArticulos] = useState<IArticulo[]>(
        [
            {
                codigo: "no hay",
                cantidad: 0,
                descripcion: "no hay",
                contenedor: "no hay"
            }
        ]
    );
    const { id } = useParams()

    const getArticulos = async () => {
        await axios.get<IResultado>("http://localhost:4567/contenedor/articulos", {
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
                    <h3>Articulos</h3>
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
                                            style={{ cursor: "pointer" }}

                                            draggable
                                            onDragStart={(event) => {
                                                event.dataTransfer.setData(
                                                    "application/json",
                                                    JSON.stringify({
                                                        codigo: articulo.codigo
                                                    })
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

                    {dragOver && <section className="panel" style={{ marginTop: "10px" }}>


                        {
                            contenedores.map((contenedor) => (
                                <div
                                    key={contenedor}
                                    onDragOver={(event) => { event.preventDefault() }}
                                    onDrop={(event) => {
                                        event.preventDefault();

                                        const raw = event.dataTransfer.getData("application/json");
                                        const data = JSON.stringify(raw);
                                        console.log(data);
                                        setDragOver(false);

                                    }}
                                >
                                    {contenedor}
                                </div>
                            ))
                        }
                    </section>}



                    <Modal
                        isOpen={modal}
                        onClose={cerrarModal}
                        title={articuloSeleccionado ? `Articulo: ${articuloSeleccionado.codigo}` : "Articulo"}
                        actions={
                            <button type="button" className="btn btn-move" onClick={cerrarModal}>
                                Cerrar
                            </button>
                        }
                    >
                        {articuloSeleccionado && (
                            <div>
                                <p><strong>Codigo:</strong> {articuloSeleccionado.codigo}</p>
                                <p><strong>Cantidad:</strong> {articuloSeleccionado.cantidad}</p>
                                <p><strong>Descripcion:</strong> {articuloSeleccionado.descripcion}</p>
                                <p><strong>Contenedor:</strong> {articuloSeleccionado.contenedor}</p>
                            </div>
                        )}
                    </Modal>

                </section>


            </div>
        </main>
    )
}
