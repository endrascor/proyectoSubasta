/**
 * Header.jsx — RedCard Market Trading
 * SIN shadcn/Menubar — todo custom
 * Pokeball 3D girando CSS puro
 * Sin línea azul, tamaño correcto, dropdowns estables
 */

import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Zap, Layers, ChartArea, LogIn, UserPlus,
  LogOut, Menu, X, ShoppingBasket, CreditCard, CheckCircle,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";

// ─── Pokeball 3D ──────────────────────────────────────────────────────────────
function Pokeball3D() {
  return (
    <div style={{
      width: 46, height: 46, borderRadius: "50%",
      overflow: "hidden", position: "relative", flexShrink: 0,
      animation: "pokeRotate 4s linear infinite, pokeGlow 3s ease-in-out infinite",
      cursor: "pointer",
    }}>
      {/* Superior morado */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "50%",
        background: "linear-gradient(140deg,#1a0050 0%,#5b21b6 40%,#7c3aed 70%,#9333ea 100%)",
      }}>
        <div style={{ position:"absolute", top:4, left:6, width:13, height:8, borderRadius:"50%", background:"rgba(255,255,255,.28)", filter:"blur(3px)" }}/>
        <div style={{ position:"absolute", top:7, left:8, width:6, height:6, borderRadius:"50%", background:"rgba(255,140,255,.98)", boxShadow:"0 0 8px rgba(255,60,255,.9)" }}/>
        <div style={{ position:"absolute", top:7, right:8, width:6, height:6, borderRadius:"50%", background:"rgba(255,140,255,.98)", boxShadow:"0 0 8px rgba(255,60,255,.9)" }}/>
      </div>
      {/* Inferior gris */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
        background: "linear-gradient(135deg,#e4e4e7 0%,#a1a1aa 55%,#71717a 100%)",
      }}>
        <div style={{ position:"absolute", bottom:5, right:7, width:9, height:5, borderRadius:"50%", background:"rgba(255,255,255,.5)", filter:"blur(2px)" }}/>
      </div>
      {/* Línea central */}
      <div style={{ position:"absolute", top:"50%", left:0, right:0, height:3.5, background:"#06060f", transform:"translateY(-50%)", zIndex:3 }}/>
      {/* Botón central */}
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:4 }}>
        <div style={{
          width:15, height:15, borderRadius:"50%", border:"3px solid #06060f",
          background:"radial-gradient(circle at 35% 35%,#fff 0%,#e4e4e7 50%,#a1a1aa 100%)",
          boxShadow:"inset 0 2px 4px rgba(0,0,0,.3)",
        }}/>
      </div>
      {/* Reflejo */}
      <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"linear-gradient(140deg,rgba(255,255,255,.2) 0%,transparent 52%)", pointerEvents:"none", zIndex:5 }}/>
    </div>
  );
}

// ─── Dropdown estable (sin flicker) ──────────────────────────────────────────
function NavDropdown({ trigger, items, align = "left" }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const onEnter = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const onLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div style={{ position: "relative" }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {/* Trigger */}
      <button style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "8px 16px", borderRadius: 10,
        background: open ? "rgba(255,204,0,.08)" : "transparent",
        border: "none", cursor: "pointer",
        color: open ? "#fff" : "rgba(255,255,255,.65)",
        fontSize: 14, fontWeight: 600,
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        letterSpacing: ".02em", transition: "all .15s",
        whiteSpace: "nowrap",
      }}>
        {trigger}
        <span style={{
          display: "inline-block",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform .2s", opacity: .5, fontSize: 10,
        }}>▾</span>
      </button>

      {/* Menú */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          [align === "right" ? "right" : "left"]: 0,
          minWidth: 220, zIndex: 9999,
          background: "rgba(6,4,18,.98)",
          border: "1px solid rgba(255,204,0,.2)",
          borderRadius: 14, overflow: "hidden",
          backdropFilter: "blur(36px)",
          boxShadow: "0 28px 64px rgba(0,0,0,.8), inset 0 0 0 1px rgba(255,255,255,.04)",
          animation: "dropIn .18s ease-out",
        }}>
          {/* Acento top */}
          <div style={{ height: 2, background: "linear-gradient(90deg,transparent,rgba(255,204,0,.7),rgba(180,100,255,.5),transparent)" }}/>
          <div style={{ padding: "6px" }}>
            {items.filter(i => i.show).map((item, idx) => (
              <Link
                key={item.href + idx}
                to={item.href}
                onClick={() => { item.action?.(); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius: 9,
                  fontSize: 13.5, fontFamily: "'DM Sans',sans-serif",
                  color: item.danger ? "rgba(239,68,68,.8)" : "rgba(255,255,255,.68)",
                  textDecoration: "none", transition: "all .13s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = item.danger ? "rgba(239,68,68,.1)" : "rgba(255,204,0,.1)";
                  e.currentTarget.style.color = item.danger ? "#f87171" : "#fff";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = item.danger ? "rgba(239,68,68,.8)" : "rgba(255,255,255,.68)";
                }}
              >
                <span style={{ color: item.danger ? "rgba(239,68,68,.7)" : "rgba(255,204,0,.65)", display: "flex" }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.title}</span>
                {item.badge && (
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 20,
                    background: "rgba(255,204,0,.15)", color: "#ffcc00",
                    fontWeight: 700, letterSpacing: ".05em",
                  }}>{item.badge}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Estrellas canvas ─────────────────────────────────────────────────────────
function StarCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    const ctx = c.getContext("2d");
    const stars = Array.from({ length: 42 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * .8 + .1, a: Math.random() * .45,
      sp: Math.random() * .18 + .04, da: (Math.random() - .5) * .012,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      stars.forEach(s => {
        s.a = Math.max(.02, Math.min(.5, s.a + s.da));
        if (Math.random() < .008) s.da *= -1;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,204,0,${s.a})`; ctx.fill();
        s.x -= s.sp * .07;
        if (s.x < 0) { s.x = c.width; s.y = Math.random() * c.height; }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:.5, zIndex:0 }}/>;
}

// ─── HEADER ──────────────────────────────────────────────────────────────────
export default function Header() {
  const { user, isAuthenticated, clearUser, authorize } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const email = user?.email || "Invitado";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const S = { width: 14, height: 14 };
  const ic = I => <I style={S} />;

  const navItems = [
    { title: "Subastas Activas", href: "/subasta/SubastasActivas", icon: ic(Zap), show: true, badge: "LIVE" },
  ];
  const mantItems = [
    { title: "Subastas Activas",     href: "/subasta/SubastasActivas",    icon: ic(Zap),           show: true },
    { title: "Subastas Finalizadas", href: "/subasta/SubastasFinalizadas", icon: ic(CheckCircle),   show: true },
    { title: "Cartas",               href: "/carta",                      icon: ic(ShoppingBasket), show: authorize(["Administrador","Vendedor"]) },
    { title: "Usuarios",             href: "/usuario/table",              icon: ic(ChartArea),      show: authorize(["Administrador"]) },
    { title: "Pagos",                href: "/facturacion",                icon: ic(CreditCard),     show: authorize(["Administrador","Comprador"]) },
  ];
  const userItems = [
    { title: "Iniciar Sesión",    href: "/usuario/login",  icon: ic(LogIn),    show: !isAuthenticated },
    { title: "Registrarse",       href: "/usuario/create", icon: ic(UserPlus), show: !isAuthenticated },
    { title: "Registrar Usuario", href: "/usuario/create", icon: ic(UserPlus), show: authorize(["Administrador"]) },
    { title: "Cerrar Sesión",     href: "#login",          icon: ic(LogOut),   show: isAuthenticated, action: clearUser, danger: true },
  ];

  return (
    <>
      {/* ── Estilos globales del header ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=DM+Sans:wght@400;500;600&display=swap');

        /* Pokeball rotando */
        @keyframes pokeRotate {
          from { transform: rotateY(0deg) rotateX(10deg); }
          to   { transform: rotateY(360deg) rotateX(10deg); }
        }
        @keyframes pokeGlow {
          0%,100% { box-shadow: 0 0 0 2px rgba(255,204,0,.3), 0 0 22px rgba(255,204,0,.25), 0 6px 18px rgba(0,0,0,.85); }
          50%     { box-shadow: 0 0 0 3px rgba(255,204,0,.7), 0 0 40px rgba(255,204,0,.6),  0 6px 18px rgba(0,0,0,.85); }
        }

        /* Dropdown aparece */
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);   }
        }

        /* Scan line */
        @keyframes scanLine {
          0%   { transform: translateX(-100%); opacity:0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateX(420%); opacity:0; }
        }
        .hdr-scan { animation: scanLine 4s ease-in-out infinite; animation-delay: 2s; }

        /* Quitar TODO outline azul del header */
        #rct-hdr, #rct-hdr * {
          outline: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        #rct-hdr *:focus-visible {
          outline: 1.5px solid rgba(255,204,0,.5) !important;
          outline-offset: 2px !important;
        }

        /* Responsive */
        @media (max-width: 767px) {
          .hdr-nav  { display: none  !important; }
          .hdr-mob  { display: flex  !important; }
        }
        @media (min-width: 768px) {
          .hdr-nav  { display: flex  !important; }
          .hdr-mob  { display: none  !important; }
        }
      `}</style>

      <header id="rct-hdr" style={{
        position: "fixed", top: 0, left: 0, width: "100%", zIndex: 50,
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
      }}>

        {/* ── Barra ── */}
        <div style={{
          position: "relative", overflow: "visible",
          height: 80,
          background: scrolled ? "rgba(3,2,12,.96)" : "rgba(3,2,12,.82)",
          backdropFilter: "blur(36px) saturate(1.6)",
          transition: "background .4s, box-shadow .4s",
          borderBottom: `1px solid ${scrolled ? "rgba(255,204,0,.18)" : "rgba(255,204,0,.08)"}`,
          boxShadow: scrolled ? "0 6px 48px rgba(0,0,0,.7)" : "none",
        }}>

          <StarCanvas />

          {/* Línea dorada top */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2.5, zIndex: 2, pointerEvents: "none",
            background: "linear-gradient(90deg,transparent 0%,rgba(255,204,0,.8) 25%,rgba(200,120,255,.6) 65%,transparent 100%)",
          }}/>

          {/* Scan Pokédex */}
          <div className="hdr-scan" style={{
            position: "absolute", top: 0, left: 0, width: "22%", height: "100%",
            background: "linear-gradient(90deg,transparent,rgba(255,204,0,.06),transparent)",
            pointerEvents: "none", zIndex: 1,
          }}/>

          {/* Inner */}
          <div style={{
            position: "relative", zIndex: 3,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 32px", height: "100%",
            maxWidth: 1360, margin: "0 auto",
          }}>

            {/* LOGO */}
            <Link to="/" style={{ display:"flex", alignItems:"center", gap:13, textDecoration:"none", flexShrink:0 }}>
              <Pokeball3D />
              <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
                <span style={{
                  fontFamily: "'Rajdhani','Segoe UI',sans-serif",
                  fontWeight: 700, fontSize: 18, letterSpacing: ".08em", textTransform: "uppercase",
                  background: "linear-gradient(90deg,#ffcc00 0%,#ffe566 30%,#fff 58%,#c084fc 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap",
                  lineHeight: 1,
                }}>
                  REDCARD MARKET
                </span>
                <span style={{
                  fontSize: 8.5, letterSpacing: ".26em", textTransform: "uppercase",
                  color: "rgba(255,204,0,.45)", fontWeight: 600, lineHeight: 1,
                }}>
                  TRADING CARDS
                </span>
              </div>
            </Link>

            {/* NAV DESKTOP */}
            <nav className="hdr-nav" style={{ alignItems: "center", gap: 4 }}>

              <div style={{ width: 1, height: 24, background: "rgba(255,204,0,.14)", margin: "0 8px" }}/>

              <NavDropdown
                trigger={
                  <><Zap style={{ width:14, height:14, color:"rgba(255,204,0,.8)" }}/> Subastas</>
                }
                items={navItems}
              />

              <NavDropdown
                trigger={
                  <><Layers style={{ width:14, height:14, color:"rgba(255,204,0,.8)" }}/> Gestión</>
                }
                items={mantItems}
              />

              <div style={{ width: 1, height: 24, background: "rgba(255,204,0,.14)", margin: "0 8px" }}/>

              {/* Avatar + usuario */}
              <NavDropdown
                align="right"
                trigger={
                  <span style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <span style={{
                      width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg,#7c3aed,#ffcc00)",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, color: "#09090f",
                      boxShadow: "0 0 0 2px rgba(255,204,0,.35)",
                    }}>
                      {email.charAt(0).toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 500,
                      maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {email}
                    </span>
                  </span>
                }
                items={userItems}
              />
            </nav>

            {/* MOBILE TOGGLE */}
            <button
              className="hdr-mob"
              onClick={() => setMobileOpen(v => !v)}
              style={{
                display: "none", padding: "8px 10px", borderRadius: 9,
                border: "1px solid rgba(255,204,0,.25)", background: "rgba(255,204,0,.06)",
                color: "rgba(255,255,255,.75)", cursor: "pointer", transition: "all .18s",
                alignItems: "center", justifyContent: "center",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(255,204,0,.55)"; e.currentTarget.style.background="rgba(255,204,0,.13)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,204,0,.25)"; e.currentTarget.style.background="rgba(255,204,0,.06)"; }}
            >
              {mobileOpen ? <X style={S}/> : <Menu style={S}/>}
            </button>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        {mobileOpen && (
          <div style={{
            background: "rgba(3,2,12,.98)", backdropFilter: "blur(36px)",
            borderTop: "1px solid rgba(255,204,0,.12)",
            padding: "8px 18px 24px", zIndex: 48,
            maxHeight: "80vh", overflowY: "auto",
          }}>
            {[
              { label:"Subastas", items: navItems },
              { label:"Gestión",  items: mantItems },
              { label:"Cuenta",   items: userItems },
            ].map(({ label, items }) => (
              <div key={label}>
                <p style={{
                  fontSize: 9.5, letterSpacing: ".18em", textTransform: "uppercase",
                  color: "rgba(255,204,0,.38)", padding: "14px 8px 5px",
                  fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
                }}>
                  {label}
                </p>
                {items.filter(i => i.show).map(item => (
                  <Link
                    key={item.href} to={item.href}
                    onClick={() => { item.action?.(); setMobileOpen(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 11,
                      padding: "10px 8px", borderRadius: 9,
                      fontSize: 14, color: item.danger ? "rgba(239,68,68,.8)" : "rgba(255,255,255,.68)",
                      textDecoration: "none", transition: "all .13s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(255,204,0,.08)"; e.currentTarget.style.color="#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=item.danger?"rgba(239,68,68,.8)":"rgba(255,255,255,.68)"; }}
                  >
                    <span style={{ color: item.danger?"rgba(239,68,68,.65)":"rgba(255,204,0,.75)", display:"flex" }}>{item.icon}</span>
                    {item.title}
                    {item.badge && (
                      <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, background:"rgba(255,204,0,.15)", color:"#ffcc00", fontWeight:700 }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
