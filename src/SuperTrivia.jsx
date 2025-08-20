import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import io from "socket.io-client";

const URL = import.meta.env.VITE_APP_SOCKET_URL;

const socket = io(URL);

const SuperTrivia = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        refs[0].current?.focus();
    }
    , []);

    useEffect(() => {
        socket.on("keypress", (response) => {
            if (response.data.key === "up") {
              simulateArrowUp();
            } else if (response.data.key === "down") {
              simulateArrowDown();
            } else if (response.data.key === "enter") {
              simulateEnter();
            }
          });
    }
    , []);

    let refs = [];

    if (import.meta.env.VITE_APP_MODO === "full") {
        refs = [
            useRef(null),
            useRef(null),
            useRef(null),
            useRef(null),
            useRef(null)
        ];
    } else {
        refs = [
            useRef(null),
            useRef(null),
            useRef(null),
            useRef(null)
        ];
    }

    const simulateArrowUp = () => {
        const currentIndex = refs.findIndex(ref => document.activeElement === ref?.current);
        const prevIndex = (currentIndex - 1 + refs.length) % refs.length;
        refs[prevIndex].current?.focus();
    };

    const simulateArrowDown = () => {
        const currentIndex = refs.findIndex(ref => document.activeElement === ref?.current);
        const nextIndex = (currentIndex + 1) % refs.length;
        refs[nextIndex].current?.focus();
    };

    const simulateEnter = () => {
        const currentIndex = refs.findIndex(ref => document.activeElement === ref?.current);
        const link = refs[currentIndex]?.current?.getAttribute("href");

        if (link) {
          navigate(link);
        }
    };


  return (
        <>
          <div className="flex flex-col items-center justify-center w-full h-screen">
            <img src="/images/supertrivia.png" alt="logo" className="object-cover w-72" />
            <div className="flex flex-col items-center justify-center">
                <Link
                    ref={refs[0]}
                    to="/100-mexicanos"
                    className="bg-red-500 text-white px-8 py-2 rounded mt-4 text-3xl font-bold w-full text-center hover:transform hover:scale-110 transition duration-300"
                >
                   <i className="fas fa-landmark"></i> <h1>100 Mexicanos Dijeron</h1>
                </Link>
                <Link
                    ref={refs[1]}
                    to="/preguntas-primaria"
                    className="bg-red-500 text-white px-8 py-2 rounded mt-4 text-3xl font-bold w-full text-center hover:transform hover:scale-110 transition duration-300"
                >
                    <i className="fas fa-book"></i> <h1>Preguntas de Primaria</h1>
                </Link>
                <Link
                    ref={refs[2]}
                    to="/adivina-cancion"
                    className="bg-red-500 text-white px-8 py-2 rounded mt-4 text-3xl font-bold w-full text-center hover:transform hover:scale-110 transition duration-300"
                >
                    <i className="fas fa-music"></i> <h1>Adivina la Canción</h1>
                </Link>
                <Link
                    ref={refs[3]}
                    to="/4-fotos-1-palabra"
                    className="bg-red-500 text-white px-8 py-2 rounded mt-4 text-3xl font-bold w-full text-center hover:transform hover:scale-110 transition duration-300"
                >
                    <i className="fas fa-camera"></i> <h1>4 Fotos 1 Palabra</h1>
                </Link>
                {import.meta.env.VITE_APP_MODO === "full" && (
                <Link
                    ref={refs[4]}
                    to="/"
                    className="bg-gray-500 text-white px-8 py-2 rounded mt-4 text-3xl font-bold w-full text-center hover:transform hover:scale-110 transition duration-300"
                >
                    <i className="fas fa-arrow-left"></i> <h1>Regresar</h1>
                </Link>
                )}
            </div>
          </div>
          <div className="animation-box">
          <div className="floating-shape" style={{top: "5%", left: "70%", animationDuration: "10s"}}></div>
          <div className="floating-shape" style={{top: "20%", left: "80%", animationDuration: "9s"}}></div>
          <div className="floating-shape" style={{top: "40%", left: "90%", animationDuration: "8s"}}></div>
          <div className="floating-shape" style={{top: "60%", left: "80%", animationDuration: "7s"}}></div>
          <div className="floating-shape" style={{top: "80%", left: "90%", animationDuration: "6s"}}></div>
          <div className="floating-shape" style={{top: "90%", right: "70%", animationDuration: "6s"}}></div>
          <div className="floating-shape" style={{top: "70%", right: "80%", animationDuration: "7s"}}></div>
          <div className="floating-shape" style={{top: "50%", right: "90%", animationDuration: "8s"}}></div>
          <div className="floating-shape" style={{top: "30%", right: "80%", animationDuration: "9s"}}></div>
          <div className="floating-shape" style={{top: "10%", right: "90%", animationDuration: "10s"}}></div>
      </div>
        </>
    )
}

export default SuperTrivia