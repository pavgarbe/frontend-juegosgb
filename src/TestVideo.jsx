import React, { useEffect, useRef } from "react";

const TestVideo = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("⏰ Inactividad activada");

      const video = videoRef.current;
      if (video) {
        video.play()
          .then(() => console.log("✅ Video se está reproduciendo"))
          .catch((err) => console.warn("❌ No se pudo reproducir:", err));
      }
    }, 2000); // Esperamos 2 segundos

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-screen bg-black text-white flex items-center justify-center">
      <video
        ref={videoRef}
        src="/video/boxeopromocion1.mp4"
        autoPlay
        muted
        playsInline
        controls={false}
        className="w-full h-full object-cover"
      />
      <button
          onClick={() => videoRef.current?.play()}
            className="absolute bottom-5 left-5 bg-green-500 px-4 py-2 rounded text-black font-bold"
            >
            Reproducir Manual
    </button>

    </div>
  );
};

export default TestVideo;
