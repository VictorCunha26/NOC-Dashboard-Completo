const { useState, useEffect } = React;

// ==========================================================
// 1. TELA DE LINKS DE COMUNICAÇÃO (5 links, LEDs, tráfego)
// ==========================================================
function LinksComunicacao({ dados, statusLinks, toggleLink }) {
  return (
    <div className="container-fluid px-4 mt-4">
      <h4 className="fw-light text-info border-bottom border-secondary pb-2 mb-4">Monitoramento de Conectividade</h4>
      <div className="row">
        {dados.map(item => {
          const isOnline = statusLinks[item.id];
          const latenciaAtual = isOnline ? item.latencia : 'TIMEOUT';
          const usoBanda = isOnline ? Math.floor(Math.random() * 40) + 40 : 0;
          return (
            <div key={item.id} className="col-12 col-md-6 col-xl-3 mb-4">
              <div className={`card glass-card h-100 ${!isOnline ? 'border-danger' : 'border-info'}`}>
                <div className="card-body d-flex flex-column justify-content-between">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-0 fw-bold d-flex align-items-center">
                        <span className={`led-indicator ${isOnline ? 'led-up' : 'led-down'}`}></span>
                        {item.tipo}
                      </h6>
                      <small className="text-secondary d-block mt-1">Alvo: {item.target}</small>
                    </div>
                    <div className="text-end">
                      <small className="text-secondary d-block">Latência</small>
                      <strong className={latenciaAtual === 'TIMEOUT' ? "text-danger" : "text-success"}>{latenciaAtual}</strong>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between small text-secondary">
                      <span>Tráfego de Dados</span><span>{usoBanda}%</span>
                    </div>
                    <div className="progress-tech">
                      <div className="progress-tech-bar bg-info" style={{ width: `${usoBanda}%` }}></div>
                    </div>
                  </div>
                  <button onClick={() => toggleLink(item.id)} className={`btn btn-sm w-100 fw-bold shadow-sm ${isOnline ? 'btn-outline-danger' : 'btn-success'}`}>
                    {isOnline ? '⚠ Simular Queda' : '🔄 Restaurar Conexão'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================================
// 2. TELA DE TELEMETRIA (Falha em Cascata granular + Sirene)
// ==========================================================
function FrotaCategoria({ frota, categoria, statusLinks }) {
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

  // REGRA VISUAL DE DEPENDÊNCIA (para o badge do título)
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
                    <div className="veiculo-container" style={{ animationPlayState: veiculoAtivo ? 'running' : 'paused' }}>{veiculo.modelo}</div>
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
                        <strong className="text-white">GPS Atual:</strong><br/>
                        <span className="font-monospace text-warning">{veiculoAtivo ? veiculo.gps : 'OFFLINE'}</span>
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

// ==========================================================
// 3. MOTOR PRINCIPAL (fetch do JSON + estado global dos 5 links)
// ==========================================================
function App() {
  const [infra, setInfra] = useState([]);
  const [frota, setFrota] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [statusLinks, setStatusLinks] = useState({ 1: true, 2: true, 3: true, 4: true, 5: true });
  const toggleLink = (id) => { setStatusLinks(prev => ({ ...prev, [id]: !prev[id] })); };

  const categoriasVeiculos = ["Ônibus", "Caminhão", "Moto", "Carro", "Caminhonete", "Van", "SUV", "Esportivo", "Trator", "Ambulância"];
  const ordemTelas = ["links", ...categoriasVeiculos];

  const [indiceTela, setIndiceTela] = useState(0);
  const [tempoRestante, setTempoRestante] = useState(5);

  // Busca os dados apenas uma vez ao montar o painel
  useEffect(() => {
    fetch('./dados.json')
      .then(resposta => resposta.json())
      .then(dados => {
        setInfra(dados.infraestrutura);
        setFrota(dados.frota);
        setCarregando(false);
      })
      .catch(erro => console.error("Falha ao consultar banco de dados: ", erro));
  }, []);

  // Motor do Videowall: alterna as telas a cada 5 segundos
  useEffect(() => {
    if (!carregando) {
      if (tempoRestante > 0) {
        const timer = setTimeout(() => setTempoRestante(tempoRestante - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setIndiceTela((prev) => (prev + 1) % ordemTelas.length);
        setTempoRestante(5);
      }
    }
  }, [tempoRestante, carregando]);

  if (carregando) return (
    <div className="d-flex justify-content-center align-items-center vh-100 text-info">
      <div className="spinner-border" style={{ width: '3rem', height: '3rem' }}></div>
    </div>
  );

  const telaAtual = ordemTelas[indiceTela];
  return (
    <div>
      <nav className="navbar navbar-dark bg-black bg-opacity-75 shadow-lg border-bottom border-info sticky-top">
        <div className="container-fluid flex-column align-items-start px-3 py-2">
          <div className="d-flex w-100 justify-content-between align-items-center mb-3">
            <span className="navbar-brand fw-bold text-info m-0 d-flex align-items-center">
              <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" title="Abrir Google Maps" className="spinning-globe"></a>
              NOC COMMAND CENTER
            </span>
            <span className="badge bg-transparent border border-info text-info px-3 py-2">
              AUTO-SWAP: 00:0{tempoRestante}
            </span>
          </div>

          <div className="nav-scroll w-100 gap-2">
            <button
              onClick={() => { setIndiceTela(0); setTempoRestante(5); }}
              className={`btn btn-sm text-nowrap px-4 py-2 ${telaAtual === 'links' ? 'btn-info text-dark fw-bold shadow' : 'btn-outline-info text-white'}`}>
              📡 Links Comunicação
            </button>
            {categoriasVeiculos.map((cat, idx) => {
              let iconeBotao = "🚚";
              if (cat === "Moto") iconeBotao = "🏍️";
              else if (cat === "Carro") iconeBotao = "🚗";
              else if (cat === "SUV") iconeBotao = "🚙";
              else if (cat === "Esportivo") iconeBotao = "🏎️";
              else if (cat === "Ônibus" || cat === "Van") iconeBotao = "🚌";
              else if (cat === "Ambulância") iconeBotao = "🚑";
              else if (cat === "Trator") iconeBotao = "🚜";

              return (
                <button
                  key={cat}
                  onClick={() => { setIndiceTela(idx + 1); setTempoRestante(5); }}
                  className={`btn btn-sm text-nowrap px-3 py-2 ${telaAtual === cat ? 'btn-light text-dark fw-bold shadow' : 'btn-outline-light text-white'}`}>
                  {iconeBotao} {cat}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main>
        {telaAtual === 'links'
          ? <LinksComunicacao dados={infra} statusLinks={statusLinks} toggleLink={toggleLink} />
          : <FrotaCategoria frota={frota} categoria={telaAtual} statusLinks={statusLinks} />
        }
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
