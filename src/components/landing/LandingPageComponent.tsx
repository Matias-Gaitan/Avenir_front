import React from "react";
import { useNavigate } from "react-router-dom";
import {
    ShieldCheck, ClipboardList, GraduationCap, FileSearch, HardHat, Building2,
    Mail, Phone, MapPin, ArrowRight, CheckCircle2
} from "lucide-react";
import logoAvenir from "../../assets/avenir-logo.png";
import "./landing.css";

const servicios = [
    {
        icono: <FileSearch size={22} />,
        titulo: "Relevamiento e IPER",
        texto: "Identificación de peligros y evaluación de riesgos (IPER) en cada puesto de trabajo, con matriz de probabilidad e impacto documentada."
    },
    {
        icono: <ClipboardList size={22} />,
        titulo: "Análisis de Trabajo Seguro (ATS)",
        texto: "Procedimientos de trabajo seguro a medida de cada tarea crítica, con pasos, riesgos asociados y medidas de control."
    },
    {
        icono: <GraduationCap size={22} />,
        titulo: "Capacitación en H&S",
        texto: "Formación al personal en uso de EPP, procedimientos de emergencia y cultura de prevención, adaptada a cada industria."
    },
    {
        icono: <ShieldCheck size={22} />,
        titulo: "Auditorías y Cumplimiento",
        texto: "Auditorías periódicas de cumplimiento normativo (Ley 19.587, Res. SRT) y seguimiento de acciones correctivas."
    },
    {
        icono: <HardHat size={22} />,
        titulo: "Gestión de EPP e Insumos",
        texto: "Control de stock, entrega y trazabilidad de elementos de protección personal y equipamiento de seguridad."
    },
    {
        icono: <Building2 size={22} />,
        titulo: "Gestión Documental",
        texto: "Organización centralizada de certificados, pólizas, planes de emergencia y toda la documentación legal vigente."
    }
];

const proceso = [
    { titulo: "Diagnóstico inicial", texto: "Visitamos tu empresa y relevamos los riesgos existentes en cada sector y puesto." },
    { titulo: "Plan de acción", texto: "Armamos un plan de trabajo priorizado, con plazos y responsables definidos." },
    { titulo: "Implementación", texto: "Ejecutamos capacitaciones, entregamos EPP y documentamos cada procedimiento." },
    { titulo: "Seguimiento continuo", texto: "Auditamos periódicamente y ajustamos el plan según los resultados obtenidos." }
];

const LandingPageComponent: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-root">
            <nav className="landing-nav">
                <div className="landing-nav-brand">
                    <img src={logoAvenir} alt="Avenir" style={{ height: "34px" }} />
                    Avenir
                </div>
                <div className="landing-nav-links">
                    <a href="#servicios">Servicios</a>
                    <a href="#proceso">Cómo trabajamos</a>
                    <a href="#contacto">Contacto</a>
                </div>
                <button className="landing-btn-ingresar" onClick={() => navigate("/login")}>
                    Ingresar al sistema
                </button>
            </nav>

            <header className="landing-hero">
                <div>
                    <span className="landing-eyebrow"><ShieldCheck size={14} /> Consultora de Higiene y Seguridad</span>
                    <h1>Prevención real para <span>cada puesto de trabajo</span> de tu empresa</h1>
                    <p className="lead">
                        Acompañamos a empresas de todos los rubros en el cumplimiento de la normativa de
                        higiene y seguridad laboral: relevamiento de riesgos, capacitaciones, auditorías
                        y gestión documental, con seguimiento cercano y continuo.
                    </p>
                    <div className="landing-hero-actions">
                        <a href="#contacto" className="landing-btn-ingresar">Solicitar una consulta <ArrowRight size={15} style={{ verticalAlign: "middle", marginLeft: "4px" }} /></a>
                        <a href="#servicios" className="landing-btn-secundario">Ver servicios</a>
                    </div>
                </div>

                <div className="landing-hero-visual">
                    <div className="logo-badge"><img src={logoAvenir} alt="" /></div>
                    <h3 style={{ margin: "0 0 10px 0", fontSize: "1.3rem" }}>Gestión integral de H&S</h3>
                    <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9, lineHeight: 1.6 }}>
                        Del diagnóstico a la mejora continua: un solo equipo acompañando la seguridad
                        de tu operación, con procesos documentados de punta a punta.
                    </p>
                    <div className="landing-hero-stat-grid">
                        <div className="landing-hero-stat"><b>IPER</b><span>Identificación de peligros por puesto</span></div>
                        <div className="landing-hero-stat"><b>ATS</b><span>Procedimientos de trabajo seguro</span></div>
                        <div className="landing-hero-stat"><b>EPP</b><span>Control y entrega de insumos</span></div>
                        <div className="landing-hero-stat"><b>Auditorías</b><span>Seguimiento normativo continuo</span></div>
                    </div>
                </div>
            </header>

            <section className="landing-section" id="servicios">
                <div className="landing-section-head">
                    <h2>Qué hacemos</h2>
                    <p>Un servicio de higiene y seguridad pensado para acompañar toda la operación, no solo para cumplir un trámite.</p>
                </div>
                <div className="landing-servicios-grid">
                    {servicios.map((s) => (
                        <div className="landing-servicio-card" key={s.titulo}>
                            <div className="landing-servicio-icon">{s.icono}</div>
                            <h3>{s.titulo}</h3>
                            <p>{s.texto}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="landing-section landing-proceso" id="proceso">
                <div className="landing-section-head">
                    <h2>Cómo trabajamos</h2>
                    <p>Un proceso simple y ordenado, pensado para no interrumpir tu operación diaria.</p>
                </div>
                <div className="landing-proceso-grid">
                    {proceso.map((p, idx) => (
                        <div className="landing-proceso-step" key={p.titulo}>
                            <span className="num">PASO {idx + 1}</span>
                            <h4>{p.titulo}</h4>
                            <p>{p.texto}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="landing-section landing-contacto" id="contacto">
                <div className="landing-contacto-grid">
                    <div>
                        <div className="landing-section-head" style={{ textAlign: "left", margin: "0 0 28px 0" }}>
                            <h2>Hablemos de tu empresa</h2>
                            <p>Contanos el rubro y el tamaño de tu equipo y armamos una propuesta a medida.</p>
                        </div>

                        <div className="landing-contacto-item">
                            <div className="icon-wrap"><Mail size={18} /></div>
                            <div>
                                <b>Email</b>
                                <span>contacto@avenir-hys.com.ar</span>
                            </div>
                        </div>
                        <div className="landing-contacto-item">
                            <div className="icon-wrap"><Phone size={18} /></div>
                            <div>
                                <b>Teléfono / WhatsApp</b>
                                <span>+54 9 351 000-0000</span>
                            </div>
                        </div>
                        <div className="landing-contacto-item">
                            <div className="icon-wrap"><MapPin size={18} /></div>
                            <div>
                                <b>Zona de cobertura</b>
                                <span>Córdoba Capital y alrededores</span>
                            </div>
                        </div>
                        <p className="landing-nota-editable">
                            * Datos de contacto de ejemplo — reemplazar por los reales de Avenir antes de publicar.
                        </p>
                    </div>

                    <div className="landing-form-card">
                        <h3>Escribinos directamente</h3>
                        <p style={{ fontSize: "0.88rem", color: "#3F5449", marginTop: 0 }}>
                            Este botón abre tu cliente de correo con el mensaje ya armado, listo para enviar.
                        </p>
                        <ul style={{ paddingLeft: "18px", margin: "0 0 20px 0", fontSize: "0.88rem", color: "#3F5449", lineHeight: 1.8 }}>
                            <li><CheckCircle2 size={13} style={{ verticalAlign: "middle", marginRight: "4px", color: "#0F6B45" }} />Respuesta dentro de las 24-48hs hábiles</li>
                            <li><CheckCircle2 size={13} style={{ verticalAlign: "middle", marginRight: "4px", color: "#0F6B45" }} />Primera consulta sin cargo</li>
                        </ul>
                        <a
                            href="mailto:contacto@avenir-hys.com.ar?subject=Consulta%20desde%20la%20web&body=Hola%2C%20quiero%20recibir%20informaci%C3%B3n%20sobre%20sus%20servicios%20de%20Higiene%20y%20Seguridad."
                            className="landing-btn-ingresar"
                            style={{ width: "100%", textAlign: "center" }}
                        >
                            Enviar consulta por email
                        </a>
                    </div>
                </div>
            </section>

            <footer className="landing-footer">
                <span>© {new Date().getFullYear()} Avenir — Consultora de Higiene y Seguridad</span>
                <a href="/login">Acceso para empleados</a>
            </footer>
        </div>
    );
};

export default LandingPageComponent;
