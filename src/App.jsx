import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import "./index.css";
import { useStoreCreditos } from "./utils/useStore";
import io from "socket.io-client";
import API from "./utils/API";

const URL = import.meta.env.VITE_APP_SOCKET_URL;
const socket = io(URL);

const MenuLink = ({ refProp, to, iconClass, label }) => (
  <Link
    ref={refProp}
    to={to}
    className="bg-red-500 text-white px-16 py-2 rounded mt-4 text-3xl font-bold w-full text-center hover:transform hover:scale-110 transition duration-300"
  >
    <i className={iconClass}></i>
    <h1>{label}</h1>
  </Link>
);

export default function App() {
  const navigate = useNavigate();
  const { creditos } = useStoreCreditos();

  const refs = Array.from({ length: 6 }, () => useRef(null));

  useEffect(() => {
    window.scrollTo(0, 0);

    socket.on("creditos", (response) => {
      useStoreCreditos.setState({ creditos: response.data.total });
      console.log("Crédito actualizado");
    });

    socket.on("keypress", (response) => {
      const actions = {
        up: simulateArrowUp,
        down: simulateArrowDown,
        enter: simulateEnter,
      };
      actions[response.data.key]?.();
    });

    API.get("/juegosfuerza/creditos/")
      .then((response) => {
        useStoreCreditos.setState({ creditos: response.data.total });
      })
      .catch((error) => {
        console.error("Error fetching credits:", error);
      });

    refs[0].current?.focus();

    return () => {
      socket.off("creditos");
      socket.off("keypress");
    };
  }, []);

  const simulateArrowUp = () => {
    const currentIndex = refs.findIndex((ref) => document.activeElement === ref?.current);
    const prevIndex = (currentIndex - 1 + refs.length) % refs.length;
    refs[prevIndex].current?.focus();
  };

  const simulateArrowDown = () => {
    const currentIndex = refs.findIndex((ref) => document.activeElement === ref?.current);
    const nextIndex = (currentIndex + 1) % refs.length;
    refs[nextIndex].current?.focus();
  };

  const simulateEnter = () => {
    const currentIndex = refs.findIndex((ref) => document.activeElement === ref?.current);
    const link = refs[currentIndex]?.current?.getAttribute("href");

    if (link) {
      navigate(link);
    }
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex flex-col items-center justify-center w-full h-screen">
              <img src="/images/logo.png" alt="logo" className="object-cover w-72" />
              <div className="flex flex-col items-center justify-center">
                {[
                  { to: "/juegos-fuerza", iconClass: "fas fa-dumbbell", label: "Juegos de Fuerza" },
                  { to: "/super-trivia", iconClass: "fas fa-question-circle", label: "Super Trivia" },
                  { to: "/juegos", iconClass: "fas fa-gamepad", label: "Juegos" },
                  { to: "/karaoke", iconClass: "fas fa-microphone-alt", label: "Karaoke" },
                  { to: "/configuracion", iconClass: "fas fa-cogs", label: "Configuración" },
                  { to: "#", iconClass: "fas fa-sign-out-alt", label: "Salir" },
                ].map((link, index) => (
                  <MenuLink
                    key={index}
                    refProp={refs[index]}
                    to={link.to}
                    iconClass={link.iconClass}
                    label={link.label}
                  />
                ))}
              </div>
            </div>
          }
        />
      </Routes>
      <div className="absolute bottom-4 left-4 text-white text-2xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded">
        💰 Créditos: {creditos} pesos
      </div>
    </>
  );
}
