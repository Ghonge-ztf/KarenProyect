import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import type { IArticulo } from "../utils/models/articulo"
import axios from "axios";

interface IResultado {
    contenido: IArticulo[]
}

export default function ContenedorPage() {
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


    useEffect(() => { getArticulos() }, [])


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
                                        <tr key={articulo.codigo}>
                                            <td>{articulo.codigo}</td>
                                            <td>{articulo.cantidad}</td>
                                            <td>{articulo.codigo}</td>
                                            <td>{articulo.contenedor}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </section>


            </div>
        </main>
    )
}
