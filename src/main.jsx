import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import SuperTrivia from './SuperTrivia.jsx'
import MaquinaBoxeo from './MaquinaBoxeo.jsx'
import Martillo from './Martillo.jsx'
import Vencidas from './Vencidas.jsx'
import MaquinaToques from './Toques.jsx'
import Configuracion from './Configuracion.jsx'
import CienMexicanos from './CienMexicanos.jsx'
import PreguntasPrimaria from './PreguntasPrimaria.jsx'
import ModeradorPrimaria from './ModeradorPrimaria.jsx'
import ModeradorAdivina from './ModeradorAdivina.jsx'
import AdivinaCancion from './AdivinaCancion.jsx'
import Karaoke from './Karaoke.jsx'
import Moderador from './Moderador.jsx'
import Pruebas from './Pruebas.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';
import './index.css'
import VideoPromocional from "./VideoPromocional";
import JuegosFuerza from "./JuegosFuerza";



createRoot(document.getElementById('root')).render(
  <AnimatePresence>
    <BrowserRouter>
      <Routes>
        <Route path="/configuracion" element={<Configuracion />} />
        {import.meta.env.VITE_APP_MODO === "full" ? (
          <>
            <Route path="/" element={<App />} />
            <Route path="/super-trivia" element={<SuperTrivia />} />
            <Route path="/juegos-fuerza" element={<JuegosFuerza />} />
          </>
        ) : import.meta.env.VITE_APP_MODO === "fuerza" ? (
            <Route path="/" element={<JuegosFuerza />} />
        ) : (
            <Route path="/" element={<SuperTrivia />} />
        )}
        <Route path="/maquina-boxeo" element={<MaquinaBoxeo />} />
        <Route path="/maquina-toques" element={<MaquinaToques />} />
        <Route path="/maquina-martillo" element={<Martillo />} />
        <Route path="/maquina-vencidas" element={<Vencidas />} />
        <Route path="/100-mexicanos" element={<CienMexicanos />} />
        <Route path="/moderador" element={<Moderador />} />
        <Route path="/preguntas-primaria" element={<PreguntasPrimaria />} />
        <Route path="/moderador-primaria" element={<ModeradorPrimaria />} />
        <Route path="/adivina-cancion" element={<AdivinaCancion />} />
        <Route path="/karaoke" element={<Karaoke />} />
        <Route path="/moderador-adivina" element={<ModeradorAdivina />} />
        <Route path="/pruebas" element={<Pruebas />} />
        <Route path="/video-promocional" element={<VideoPromocional />} />
      </Routes>
    </BrowserRouter>
  </AnimatePresence>
)
