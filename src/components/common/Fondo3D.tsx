import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import "./Fondo3D.css";

// 🌐 Fondo animado en 3D para las pantallas de Login y Registro.
// Hoy dibuja un globo genérico (mismo estilo que el Globo 3D de Mapa 2D) a modo de
// placeholder. Cuando llegue el modelo 3D propio (.glb/.gltf) alcanza con reemplazar
// el SphereGeometry de abajo por un GLTFLoader que cargue ese archivo en la escena.
const Fondo3D: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const contenedor = containerRef.current;
        if (!contenedor) return;

        const escena = new THREE.Scene();
        const camara = new THREE.PerspectiveCamera(45, contenedor.clientWidth / contenedor.clientHeight, 0.1, 1000);
        camara.position.z = 2.6;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(contenedor.clientWidth, contenedor.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        contenedor.appendChild(renderer.domElement);

        const cargadorTexturas = new THREE.TextureLoader();
        const texturaTierra = cargadorTexturas.load("https://unpkg.com/three-globe/example/img/earth-night.jpg");

        const globo = new THREE.Mesh(
            new THREE.SphereGeometry(1, 64, 64),
            new THREE.MeshPhongMaterial({ map: texturaTierra, emissive: 0x10b981, emissiveIntensity: 0.06 })
        );
        escena.add(globo);

        // Estrellas de fondo
        const posicionesEstrellas = new Float32Array(1200 * 3);
        for (let i = 0; i < posicionesEstrellas.length; i++) {
            posicionesEstrellas[i] = (Math.random() - 0.5) * 60;
        }
        const geometriaEstrellas = new THREE.BufferGeometry();
        geometriaEstrellas.setAttribute("position", new THREE.BufferAttribute(posicionesEstrellas, 3));
        const estrellas = new THREE.Points(geometriaEstrellas, new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.02 }));
        escena.add(estrellas);

        escena.add(new THREE.AmbientLight(0x64748b, 1.2));
        const luzPuntual = new THREE.PointLight(0x10b981, 2, 100);
        luzPuntual.position.set(5, 3, 5);
        escena.add(luzPuntual);

        let animacionId: number;
        const animar = () => {
            globo.rotation.y += 0.0009;
            estrellas.rotation.y += 0.0001;
            renderer.render(escena, camara);
            animacionId = requestAnimationFrame(animar);
        };
        animar();

        const manejarResize = () => {
            if (!contenedor) return;
            camara.aspect = contenedor.clientWidth / contenedor.clientHeight;
            camara.updateProjectionMatrix();
            renderer.setSize(contenedor.clientWidth, contenedor.clientHeight);
        };
        window.addEventListener("resize", manejarResize);

        return () => {
            cancelAnimationFrame(animacionId);
            window.removeEventListener("resize", manejarResize);
            geometriaEstrellas.dispose();
            (globo.geometry as THREE.BufferGeometry).dispose();
            (globo.material as THREE.Material).dispose();
            texturaTierra.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode === contenedor) {
                contenedor.removeChild(renderer.domElement);
            }
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
