// src/components/FrotaCategoria.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export function FrotaCategoria({ frota, statusLinks }) {
  // A categoria é capturada dinamicamente pela URL (Rota)
  const { categoria } = useParams();
  const veiculosExibidos = frota.filter(v => v.tipo === categoria);

  // WEB AUDIO API - Sintetizador Eletrônico de Sirene (só para Ambulância)
  useEffect(() => {
    let audioCtx = null;
    let osc = null;
    let intervalId = null;
    if (categoria === "Ambulância") {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') { audioCtx.resume(); }

        osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        gainNode.gain.value = 0.2;
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();

        let isHigh = false;
        osc.frequency.setValueAtTime(700, audioCtx.currentTime);
        intervalId = setInterval(() => {
          isHigh = !isHigh;
          if (osc) osc.frequency.setValueAtTime(isHigh ? 960 : 700, audioCtx.currentTime);
        }, 500);
      } catch (e) {
        console.warn("Áudio bloqueado. Interaja com a página primeiro.");
      }
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (osc) { try { osc.stop(); osc.disconnect(); } catch (e) {} }
      if (audioCtx && audioCtx.state !== 'closed') { audioCtx.close(); }
    };
  }, [categoria]);

  // Roteamento de Falha em Cascata (OSPF como Fallback)
  let dependeciaId = 3;
  let nomeLink = "Roteamento OSPF";
  if (categoria === "Caminhão") { dependeciaId = 2; nomeLink = "Link VSAT BGAN"; }
  else if (categoria === "Ônibus") { dependeciaId = 4; nomeLink = "Sessão BGP"; }
  else if (categoria === "Moto") { dependeciaId = 5; nomeLink = "LTE-Móvel"; }
  else if (categoria === "Carro" || categoria === "Caminhonete") { dependeciaId = 1; nomeLink = "Link VSAT Principal"; }

  const linkCategoriaOnline = statusLinks[dependeciaId];

  return (
    <div className="container-fluid px-4 mt-4">
      <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2 mb-4">
        <h4 className="fw-light text-info m-0">Telemetria Tática: <span className="fw-bold text-white">{categoria}</span></h4>
        {!linkCategoriaOnline && <span className="badge bg-danger fs-6 p-2">⚠ COMUNICAÇÃO PERDIDA ({nomeLink})</span>}
      </div>

      <div className="row">
        {veiculosExibidos.length === 0 ? <p className="text-secondary">Nenhum ativo operando nesta categoria.</p> :
          veiculosExibidos.map((veiculo, index) => {
            // MOTOR DE REGRAS: cada categoria depende de um link específico; o resto cai no fallback OSPF
            let veiculoAtivo = true;
            if (veiculo.tipo === "Carro" || veiculo.tipo === "Caminhonete") { veiculoAtivo = statusLinks[1]; }
            else if (veiculo.tipo === "Caminhão") { veiculoAtivo = statusLinks[2]; }
            else if (veiculo.tipo === "Ônibus") { veiculoAtivo = statusLinks[4]; }
            else if (veiculo.tipo === "Moto") { veiculoAtivo = statusLinks[5]; }
            else { veiculoAtivo = statusLinks[3]; }
            const combustivel = 100 - (index * 15);

            // Montagem dinâmica da URL do Google Maps a partir de latitude/longitude do SQLite
            const urlMapa = `https://www.google.com/maps/search/?api=1&query=${veiculo.latitude},${veiculo.longitude}`;
            const textoGPS = `${veiculo.latitude}, ${veiculo.longitude}`;

            return (
              <div key={veiculo.id} className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4">
                <div className={`card glass-card h-100 ${!veiculoAtivo ? 'offline-mode border-danger' : ''}`}>
                  <div className="cenario">
                    <div className="grid-overlay"></div>
                    <div className="parallax-bg" style={{ animationPlayState: veiculoAtivo ? 'running' : 'paused' }}></div>
                    <div className="estrada">
                      <div className="linhas-estrada" style={{ animationPlayState: veiculoAtivo ? 'running' : 'paused' }}></div>
                    </div>
                    {veiculoAtivo && (
                      <div className="vento">
                        <div className="linha-vento" style={{ top: '15px', width: '50px', animationDuration: '0.4s' }}></div>
                        <div className="linha-vento" style={{ top: '35px', width: '30px', animationDuration: '0.6s', animationDelay: '0.2s' }}></div>
                      </div>
                    )}

                    {/* Veículo transformado em Link (Tag <a>) apontando para o Google Maps */}
                    <a
                      
                      href={veiculoAtivo ? urlMapa : "#"}
                      target={veiculoAtivo ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      title={veiculoAtivo ? "Rastrear no Google Maps" : "Veículo Offline"}
                      className="veiculo-container text-decoration-none"
                      style={{ animationPlayState: veiculoAtivo ? 'running' : 'paused' }}
                    >
                      <span style={{ display: 'inline-block', transform: veiculo.tipo === "Esportivo" ? 'scaleX(-1)' : 'none' }}>
                        {veiculo.modelo}
                      </span>
                    </a>
                  </div>

                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-3 align-items-center">
                      <h5 className="fw-bold text-info m-0">{veiculo.id}</h5>
                      <span className={`badge ${veiculoAtivo ? 'bg-success' : 'bg-danger'}`}>{veiculoAtivo ? 'SINAL OK' : 'LINK PERDIDO'}</span>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between small text-white">
                        <span>Bateria / Combustível</span><span>{combustivel}%</span>
                      </div>
                      <div className="progress-tech">
                        <div className="progress-tech-bar" style={{ width: `${combustivel}%`, background: combustivel < 30 ? '#dc3545' : '#0dcaf0' }}></div>
                      </div>
                    </div>
                    <div className="row text-secondary small">
                      <div className="col-6 mb-2">
                        <strong className="text-white">Velocidade:</strong><br/>
                        <span className={veiculoAtivo ? "text-info fw-bold" : ""}>{veiculoAtivo ? `${veiculo.vel} km/h` : '0 km/h'}</span>
                      </div>
                      <div className="col-6 mb-2 text-end">
                        <strong className="text-white">Posição SQL:</strong><br/>

                        {/* Texto da coordenada também clicável, apontando para o Maps */}
                        <a
                          href={veiculoAtivo ? urlMapa : "#"}
                          target={veiculoAtivo ? "_blank" : "_self"}
                          className={`font-monospace text-decoration-none ${veiculoAtivo ? 'text-warning' : 'text-secondary'}`}
                        >
                          {veiculoAtivo ? textoGPS : 'OFFLINE'}
                        </a>

                        {/* Timestamp vindo do SQLite, comprovando atualização em tempo real */}
                        <div style={{ fontSize: '0.65rem', marginTop: '4px' }}>
                          Sync: {veiculoAtivo ? new Date(veiculo.ultima_atualizacao).toLocaleTimeString() : '--:--:--'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
