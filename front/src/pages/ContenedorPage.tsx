import { useParams } from "react-router-dom"

export default function ContenedorPage() {
    const { id } = useParams()

  return (
    <main className='page-shell'>
        <div className='page-container'>
        <section className='panel panel-muted'>
            <h2>Contenedor: {id}</h2>
        </section>

        

        </div>
    </main>
  )
}
