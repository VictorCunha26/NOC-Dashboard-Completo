// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import './App.css';
import { LinksComunicacao } from './components/LinksComunicacao';
import { FrotaCategoria } from './components/FrotaCategoria';

const categoriasVeiculos = ["Ônibus", "Caminhão", "Moto", "Carro", "Caminhonete", "Van", "SUV", "Esportivo", "Trator", "Ambulância"];
const rotasDisponiveis = ["/", ...categoriasVeiculos.map(c => `/frota/${c}`)];

// Componente Wrapper para controlar o Timer de Roteamento Dinâmico
function DashboardRouter() {
  const [dados, setDados] = useState({ infraestrutura: [], frota: [], noc: {} });
  const [carregando, setCarregando] = useState(true);

  const [statusLinks, setStatusLinks] = useState({ 1: true, 2: true, 3: true, 4: true, 5: true });
  const toggleLink = (id) => setStatusLinks(prev => ({ ...prev, [id]: !prev[id] }));

  const navigate = useNavigate();
  const location = useLocation();
  const [tempoRestante, setTempoRestante] = useState(5);

  // Ciclo de vida para consumir a API REST (SQLite)
  useEffect(() => {
    fetch('http://localhost:3000/api/dados')
      .then(response => response.json())
      .then(data => {
        setDados(data);
        setCarregando(false);
      })
      .catch(error => {
        console.error("Falha ao comunicar com o servidor de banco de dados:", error);
        setCarregando(false);
      });
  }, []);

  // Motor do Videowall: alterna as rotas a cada 5 segundos
  useEffect(() => {
    if (carregando) return;
    if (tempoRestante > 0) {
      const timer = setTimeout(() => setTempoRestante(tempoRestante - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const indiceAtual = rotasDisponiveis.indexOf(decodeURIComponent(location.pathname));
      const proximoIndice = (indiceAtual + 1) % rotasDisponiveis.length;
      navigate(rotasDisponiveis[proximoIndice]);
      setTempoRestante(5);
    }
  }, [tempoRestante, location.pathname, navigate, carregando]);

  // Tela de Loading enquanto o Back-End processa a resposta
  if (carregando) return (
    <div className="d-flex justify-content-center align-items-center vh-100 text-info bg-black">
      <div className="spinner-border" style={{ width: '4rem', height: '4rem' }}></div>
    </div>
  );

  return (
    <div>
      <nav className="navbar navbar-dark bg-black bg-opacity-75 shadow-lg border-bottom border-info sticky-top">
        <div className="container-fluid flex-column align-items-start px-3 py-2">
          <div className="d-flex w-100 justify-content-between align-items-center mb-3">
            <span className="navbar-brand fw-bold text-info m-0 d-flex align-items-center">
              {/* Globo apontando para a matriz do NOC, com coordenada vinda do SQLite */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${dados.noc.latitude},${dados.noc.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir Base NOC (SENAI Vila Leopoldina)"
                className="spinning-globe"
              ></a>
              NOC COMMAND CENTER
            </span>
            <span className="badge bg-transparent border border-info text-info px-3 py-2">
              AUTO-SWAP: 00:0{tempoRestante}
            </span>
          </div>

          <div className="nav-scroll w-100 gap-2">
            <Link to="/" onClick={() => setTempoRestante(5)} className={`btn btn-sm text-nowrap px-4 py-2 ${location.pathname === '/' ? 'btn-info text-dark fw-bold shadow' : 'btn-outline-info text-white'}`}>
              📡 Links Comunicação
            </Link>
            {categoriasVeiculos.map((cat) => {
              const rotaAtiva = decodeURIComponent(location.pathname) === `/frota/${cat}`;
              let iconeBotao = "🚚";
              if (cat === "Moto") iconeBotao = "🏍️";
              else if (cat === "Carro" || cat === "SUV" || cat === "Esportivo") iconeBotao = "🚗";
              else if (cat === "Ônibus" || cat === "Van") iconeBotao = "🚌";
              else if (cat === "Ambulância") iconeBotao = "🚑";
              else if (cat === "Trator") iconeBotao = "🚜";

              return (
                <Link key={cat} to={`/frota/${cat}`} onClick={() => setTempoRestante(5)} className={`btn btn-sm text-nowrap px-3 py-2 ${rotaAtiva ? 'btn-light text-dark fw-bold shadow' : 'btn-outline-light text-white'}`}>
                  {iconeBotao} {cat}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<LinksComunicacao dados={dados.infraestrutura} statusLinks={statusLinks} toggleLink={toggleLink} />} />
          <Route path="/frota/:categoria" element={<FrotaCategoria frota={dados.frota} statusLinks={statusLinks} />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DashboardRouter />
    </BrowserRouter>
  );
}
