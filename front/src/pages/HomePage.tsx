import { useEffect, useState } from "react"
import axios from "axios";

export default function HomePage() {
  const [contenedores, setContenedores] = useState<string[]>([''])


  const getContenedores = async () => {
    await axios.get("http://localhost:4567/contenedores/todos")
      .then((res) => { setContenedores(res.data.contenedores) })
      .catch(console.error);

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
          <h2>Contenedores</h2>
          {contenedores.length > 0 && (
            <div className="button-grid">
              {contenedores.map((item) => (
                <button type="button" className="btn">{item}</button>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}
