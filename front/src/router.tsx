import { Route, Routes, BrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ContenedorPage from "./pages/ContenedorPage";


export default function AppRouter() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/contenedor/:id" element={<ContenedorPage/>}/>

        </Routes>
    </BrowserRouter>
  )
}
