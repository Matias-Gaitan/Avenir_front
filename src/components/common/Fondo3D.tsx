import React, { useEffect, useRef } from "react";
import Globe from "globe.gl";
import "./Fondo3D.css";

// 🌐 Fondo en 3D para las pantallas de Login y Registro.
// Es el mismo Globo 3D (globe.gl) que se usaba en Mapa 2D, pero limpio:
// sin datos de empresas/empleados y sin arcos/anillos animados, solo el
// globo girando lentamente. Cuando llegue el modelo 3D propio, este es el
// lugar para reemplazar globeImageUrl/bumpImageUrl por ese asset.
const Fondo3D: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const contenedor = containerRef.current;
        if (!contenedor) return;

        const world = Globe()(contenedor)
            .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
            .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
            .backgroundColor("rgba(0,0,0,0)")
            .width(contenedor.clientWidth)
            .height(contenedor.clientHeight);

        world.controls().autoRotate = true;
        world.controls().autoRotateSpeed = 0.5;
        world.controls().enableZoom = false;
        world.pointOfView({ lat: -31.4167, lng: -64.1833, altitude: 2.1 });

        const manejarResize = () => {
            if (!contenedor) return;
            world.width(contenedor.clientWidth);
            world.height(contenedor.clientHeight);
        };
        window.addEventListener("resize", manejarResize);

        return () => {
            window.removeEventListener("resize", manejarResize);
            if (contenedor) contenedor.innerHTML = "";
        };
    }, []);

    return (
        <div className="fondo3d-wrapper">
            <div ref={containerRef} className="fondo3d-canvas" />
            <div className="fondo3d-overlay" />
        </div>
    );
};

export default Fondo3D;
