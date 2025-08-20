import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStoreCreditos } from "./utils/useStore";
import API from "./utils/API";


const Configuracion = () => {
  const [nuevoCredito, setNuevoCredito] = useState("");
  const [password, setPassword] = useState("");
  const [motivo, setMotivo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [historialMonedas, setHistorialMonedas] = useState([]);
  const [historialAjustes, setHistorialAjustes] = useState([]);
  const [creditosActuales, setCreditosActuales] = useState(0);
  const { setCreditos } = useStoreCreditos();
  const [pestanaActiva, setPestanaActiva] = useState("monedas");
  const [sumaMonedas, setSumaMonedas] = useState(0);

  const ajustarCreditos = async () => {
    try {
      const response = await API.post(`/juegosfuerza/ajustar-creditos/`, {
        nuevo_valor: parseInt(nuevoCredito),
        password,
        motivo,
      });

      setMensaje(response.data.mensaje);
      setNuevoCredito("");
      setPassword("");
      setMotivo("");
      obtenerCreditos();
      cargarHistorial();
    } catch (error) {
      if (error.response) {
        setMensaje(`❌ Error: ${error.response.data.error}`);
      } else {
        setMensaje("❌ Error desconocido al conectar");
      }
    }
  };

  const cargarHistorialMonedas = async (rango = "dia") => {
    try {
      const response = await API.get(`/juegosfuerza/historial-monedas/?tipo=${rango}`);
      const registros = response.data.registros || [];
      setHistorialMonedas(registros);

      const total = registros.reduce((acum, item) => acum + (item.moneda || 0), 0);
      setSumaMonedas(total);
    } catch (error) {
      console.error("Error al cargar historial de monedas", error);
    }
  };

  const cargarHistorialAjustes = async (rango = "dia") => {
    try {
      const response = await API.get(`/juegosfuerza/historial-ajustes/?tipo=${rango}`);
      setHistorialAjustes(response.data || []);
    } catch (error) {
      console.error("Error al cargar historial de ajustes", error);
    }
  };


  const obtenerCreditos = async () => {
    try {
      const response = await API.get(`/juegosfuerza/creditos/`);
      const total = response.data.total;
      console.log("Respuesta créditos:", total);
      setCreditosActuales(total);
      setCreditos(total);
    } catch (error) {
      console.error("Error al obtener créditos:", error);
    }
  };

  const cargarHistorial = async () => {
    try {
      const [resMonedas, resAjustes] = await Promise.all([
        API.get(`/juegosfuerza/historial-monedas/`),
        API.get(`/juegosfuerza/historial-ajustes/`),
      ]);

      setHistorialMonedas(resMonedas.data.registros || []);
      setHistorialAjustes(resAjustes.data || []);
      console.log("📜 Ajustes recibidos:", resAjustes.data);

    } catch (error) {
      console.error("Error al cargar historial", error);
    }
  };


  useEffect(() => {
    obtenerCreditos();
    cargarHistorialMonedas("dia");
    cargarHistorialAjustes("dia");
  }, []);

  return (
    <div className="p-6 text-white">
        <h1 className="text-4xl font-bold mb-4">
            ⚙️ Configuración de Créditos
        </h1>
      <div className="bg-gray-800 p-4 rounded mb-6">
        <label className="block mb-2">Contraseña:</label>
        <input
          type="password"
          className="p-2 rounded w-full text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="block mt-4 mb-2">Nuevo valor de créditos:</label>
        <input
          type="number"
          className="p-2 rounded w-full text-black"
          value={nuevoCredito}
          onChange={(e) => setNuevoCredito(e.target.value)}
        />

        <label className="block mt-4 mb-2">Motivo del ajuste:</label>
        <input
          type="text"
          className="p-2 rounded w-full text-black"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />

        <button
          className="bg-blue-500 mt-4 px-4 py-2 rounded font-bold text-white hover:bg-blue-600"
          onClick={ajustarCreditos}
        >
          Ajustar Créditos
        </button>

        {mensaje && <p className="mt-4 font-bold text-yellow-400">{mensaje}</p>}
      </div>

      <div className="flex mb-4 space-x-4">
            <button
                onClick={() => setPestanaActiva("monedas")}
                className={`px-4 py-2 rounded font-bold ${pestanaActiva === "monedas" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}>
                📜 Monedas
            </button>
            <button
                onClick={() => setPestanaActiva("ajustes")}
                className={`px-4 py-2 rounded font-bold ${pestanaActiva === "ajustes" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}>
                🛠️ Ajustes
            </button>
     </div>

        {pestanaActiva === "monedas" && (
            <div className="bg-gray-900 p-4 rounded mb-6">
                <div className="flex items-center justify-between mb-4">
                <div>
                    <label className="mr-2 font-bold">Rango:</label>
                    <select
                    className="text-black p-2 rounded"
                    onChange={(e) => cargarHistorialMonedas(e.target.value)}
                    >
                    <option value="dia">Hoy</option>
                    <option value="ayer">Ayer</option>
                    <option value="semana">Última semana</option>
                    <option value="mes">Último mes</option>
                    <option value="todos">Todos</option>
                    </select>
                </div>
                <div className="text-right">
                    <p>Total de registros: {historialMonedas.length}</p>
                    <p>Monto Ingresado: {sumaMonedas} pesos</p>
                </div>
                </div>

                <h2 className="text-2xl font-bold mb-2">📜 Historial de Monedas</h2>
                <table className="w-full text-left">
                <thead>
                    <tr>
                    <th className="border-b p-2">Fecha</th>
                    <th className="border-b p-2">Hora</th>
                    <th className="border-b p-2">Moneda</th>
                    <th className="border-b p-2">Pulsos</th>
                    </tr>
                </thead>
                <tbody>
                    {historialMonedas.map((m, index) => (
                    <tr key={index}>
                        <td className="border-b p-2">{m.fecha}</td>
                        <td className="border-b p-2">{m.hora}</td>
                        <td className="border-b p-2">{m.moneda || "❓"}</td>
                        <td className="border-b p-2">{m.pulsos}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}

        {pestanaActiva === "ajustes" && (
            <div className="bg-gray-900 p-4 rounded mb-20">

                <div className="flex items-center justify-between mb-4">
                <div>
                    <label className="mr-2 font-bold">Rango:</label>
                    <select
                    className="text-black p-2 rounded"
                    onChange={(e) => cargarHistorialAjustes(e.target.value)}
                    >
                    <option value="dia">Hoy</option>
                    <option value="ayer">Ayer</option>
                    <option value="semana">Última semana</option>
                    <option value="mes">Último mes</option>
                    <option value="todos">Todos</option>
                    </select>
                </div>
                <div className="text-right">
                    <p>Total de registros: {historialAjustes.length}</p>
                </div>
                </div>

                <table className="w-full text-left">
                <thead>
                    <tr>
                    <th className="border-b p-2">Fecha</th>
                    <th className="border-b p-2">Anterior</th>
                    <th className="border-b p-2">Nuevo</th>
                    <th className="border-b p-2">Motivo</th>
                    </tr>
                </thead>
                <tbody>
                    {historialAjustes.map((a, index) => (
                    <tr key={index}>
                        <td className="border-b p-2">{a.fecha}</td>
                        <td className="border-b p-2">{a.valor_anterior}</td>
                        <td className="border-b p-2">{a.nuevo_valor}</td>
                        <td className="border-b p-2">{a.motivo || "Sin motivo"}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}

      <Link
            to="/"
            className="fixed bottom-4 right-4 bg-red-600 px-4 py-2 rounded shadow font-bold hover:bg-red-700 z-50"
            >
            ⬅️ Regresar al Menú
       </Link>

    </div>
  );
};

export default Configuracion;
