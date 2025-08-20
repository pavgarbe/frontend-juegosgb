import React from 'react'
import API from "./utils/API";

export const Pruebas = () => {


  return (
    <div className="flex flex-col items-center w-full h-screen bg-[#4d4e4f] text-white overflow-y-auto">
        <div className="flex flex-col items-center w-full p-8">
          <h2 className="text-3xl font-bold">Pruebas Botones</h2>
          <div className="flex flex-col w-full mt-2">
              <button
                className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold p-4 rounded mt-4 w-full"
                onClick={() => {
                  API.post("/cienmexicanos/key-press/", {
                    key: "up",
                  })
                    .then((res) => {
                      console.log(res);
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                }}
              >
                <i className="fas fa-arrow-up text-2xl text-center"></i>
              </button>
          </div>
          <div className="flex flex-row w-full mt-2">
            <button
              className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold p-4 rounded mt-4 w-full mr-2 text-center"
              onClick={() => {
                API.post("/cienmexicanos/key-press/", {
                  key: "enter",
                })
                  .then((res) => {
                    console.log(res);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
              }
            >
              Enter
            </button>
          </div>
          <div className="flex flex-col w-full mt-2">
            <button
              className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold p-4 rounded mt-4 w-full"
              onClick={() => {
                API.post("/cienmexicanos/key-press/", {
                  key: "down",
                })
                  .then((res) => {
                    console.log(res);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }}
            >
              <i className="fas fa-arrow-down text-2xl text-center"></i>
            </button>
          </div>
        </div>
    </div>
  );
}

export default Pruebas;
