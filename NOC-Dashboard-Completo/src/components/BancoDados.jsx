// src/components/BancoDados.jsx
import React, { useState, useEffect, useRef } from 'react';

const API_BASE = 'http://localhost:3001';
const ITENS_POR_PAGINA = 10;

const categorias = [
  { tipo: "Ônibus", emoji: "🚌" },
  { tipo: "Caminhão", emoji: "🚚" },
  { tipo: "Moto", emoji: "🏍" },
  { tipo: "Carro", emoji: "🚗" },
  { tipo: "Caminhonete", emoji: "🛻" },
  { tipo: "Van", emoji: "🚐" },
  { tipo: "SUV", emoji: "🚙" },
  { tipo: "Esportivo", emoji: "🏎" },
  { tipo: "Trator", emoji: "🚜" },
  { tipo: "Ambulância", emoji: "🚑" }
];

function emojiDoTipo(tipo) {
  return categorias.find(c => c.tipo === tipo)?.emoji || "🚗";
}

const formVazio = { id: '', tipo: categorias[0].tipo, vel: '', latitude: '', longitude: '' };

export function BancoDados() {
  const [veiculos, setVeiculos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState('');
  const [form, setForm] = useState(formVazio);
  const [editandoId, setEditandoId] = useState(null);
  const [valoresEdicao, setValoresEdicao] = useState({ vel: '', latitude: '', longitude: '' });
  const [logs, setLogs] = useState([]);
  const terminalRef = useRef(null);

  const registrarLog = (nivel, mensagem) => {
    const hora = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    setLogs(prev => [...prev.slice(-199), { hora, nivel, mensagem }]);
  };

  const carregarAmostra = () => {
    setCarregando(true);
    registrarLog('info', 'GET /api/frota?limite=100 — buscando amostra...');
    fetch(`${API_BASE}/api/frota?limite=100`)
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        setVeiculos(data);
        setPagina(1);
        setCarregando(false);
        registrarLog('success', `GET /api/frota → ${status} OK (${data.length} registros carregados)`);
      })
      .catch(err => {
        setCarregando(false);
        registrarLog('error', `Falha ao conectar na API: ${err.message}`);
      });
  };

  useEffect(() => {
    registrarLog('info', 'Terminal de eventos inicializado.');
    carregarAmostra();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [logs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id.trim() || !form.tipo) {
      registrarLog('error', 'Validação falhou: ID e Tipo são obrigatórios.');
      return;
    }
    const payload = {
      id: form.id.trim(),
      tipo: form.tipo,
      modelo: emojiDoTipo(form.tipo),
      vel: form.vel || '0',
      latitude: form.latitude || '0',
      longitude: form.longitude || '0'
    };
    registrarLog('info', `POST /api/frota — enviando ${payload.id}...`);
    fetch(`${API_BASE}/api/frota`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 201) {
          setVeiculos(prev => [data, ...prev]);
          setPagina(1);
          setForm(formVazio);
          registrarLog('success', `POST /api/frota/${data.id} → 201 Created`);
        } else {
          registrarLog('error', `POST /api/frota → ${status}: ${data.erro || 'erro desconhecido'}`);
        }
      })
      .catch(err => registrarLog('error', `Falha ao conectar na API: ${err.message}`));
  };

  const iniciarEdicao = (veiculo) => {
    setEditandoId(veiculo.id);
    setValoresEdicao({ vel: veiculo.vel, latitude: veiculo.latitude, longitude: veiculo.longitude });
  };

  const cancelarEdicao = () => setEditandoId(null);

  const salvarEdicao = (id) => {
    registrarLog('info', `PUT /api/frota/${id} — salvando telemetria...`);
    fetch(`${API_BASE}/api/frota/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(valoresEdicao)
    })
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          setVeiculos(prev => prev.map(v => v.id === id ? { ...v, ...valoresEdicao, ultima_atualizacao: new Date().toISOString() } : v));
          setEditandoId(null);
          registrarLog('success', `PUT /api/frota/${id} → 200 OK`);
        } else {
          registrarLog('error', `PUT /api/frota/${id} → ${status}: ${data.mensagem || data.erro || 'erro desconhecido'}`);
        }
      })
      .catch(err => registrarLog('error', `Falha ao conectar na API: ${err.message}`));
  };

  const deletarVeiculo = (id) => {
    if (!window.confirm(`Remover o veículo ${id} do banco de dados?`)) return;
    registrarLog('info', `DELETE /api/frota/${id} — removendo...`);
    fetch(`${API_BASE}/api/frota/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.status === 204) {
          setVeiculos(prev => prev.filter(v => v.id !== id));
          registrarLog('success', `DELETE /api/frota/${id} → 204 No Content`);
        } else {
          return res.json().then(data => registrarLog('error', `DELETE /api/frota/${id} → ${res.status}: ${data.mensagem || 'erro desconhecido'}`));
        }
      })
      .catch(err => registrarLog('error', `Falha ao conectar na API: ${err.message}`));
  };

  const buscarPorId = (e) => {
    e.preventDefault();
    const id = busca.trim();
    if (!id) return;
    registrarLog('info', `GET /api/frota/${id} — buscando veículo específico...`);
    fetch(`${API_BASE}/api/frota/${id}`)
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          setVeiculos(prev => [data, ...prev.filter(v => v.id !== data.id)]);
          setPagina(1);
          registrarLog('success', `GET /api/frota/${id} → 200 OK (localizado e adicionado ao topo da lista)`);
        } else {
          registrarLog('error', `GET /api/frota/${id} → 404: veículo não encontrado.`);
        }
      })
      .catch(err => registrarLog('error', `Falha ao conectar na API: ${err.message}`));
  };

  const totalPaginas = Math.max(1, Math.ceil(veiculos.length / ITENS_POR_PAGINA));
  const veiculosDaPagina = veiculos.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA);

  return (
    <div className="container-fluid px-4 mt-4">
      <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2 mb-4">
        <h4 className="fw-light text-info m-0">Banco de Dados <span className="fw-bold text-white">(CRUD)</span></h4>
        <span className="badge bg-transparent border border-warning text-warning px-3 py-2">
          Amostra protegida: {veiculos.length} de 100.000 registros
        </span>
      </div>

      <div className="row g-3">
        {/* Coluna 1: formulário de criação (POST) */}
        <div className="col-12 col-lg-3">
          <div className="card glass-card h-100">
            <div className="card-body">
              <h6 className="text-info fw-bold mb-3">➕ Novo veículo (POST)</h6>
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label className="form-label small text-secondary mb-1">ID</label>
                  <input type="text" className="form-control form-control-sm" placeholder="V-100001"
                    value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} />
                </div>
                <div className="mb-2">
                  <label className="form-label small text-secondary mb-1">Tipo</label>
                  <select className="form-select form-select-sm" value={form.tipo}
                    onChange={e => setForm({ ...form, tipo: e.target.value })}>
                    {categorias.map(c => <option key={c.tipo} value={c.tipo}>{c.emoji} {c.tipo}</option>)}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label small text-secondary mb-1">Velocidade (km/h)</label>
                  <input type="number" className="form-control form-control-sm" placeholder="0"
                    value={form.vel} onChange={e => setForm({ ...form, vel: e.target.value })} />
                </div>
                <div className="row">
                  <div className="col-6 mb-2">
                    <label className="form-label small text-secondary mb-1">Latitude</label>
                    <input type="text" className="form-control form-control-sm" placeholder="-23.5315"
                      value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} />
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label small text-secondary mb-1">Longitude</label>
                    <input type="text" className="form-control form-control-sm" placeholder="-46.7358"
                      value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-info btn-sm w-100 fw-bold text-dark mt-2">
                  Inserir no banco
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Coluna 2: lista de veículos com PUT e DELETE */}
        <div className="col-12 col-lg-6">
          <div className="card glass-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
                <h6 className="text-info fw-bold m-0">📋 Veículos cadastrados</h6>
                <div className="d-flex gap-2">
                  <form onSubmit={buscarPorId} className="d-flex gap-1">
                    <input type="text" className="form-control form-control-sm" placeholder="Buscar por ID..."
                      value={busca} onChange={e => setBusca(e.target.value)} style={{ width: '150px' }} />
                    <button className="btn btn-outline-info btn-sm" type="submit">🔎</button>
                  </form>
                  <button className="btn btn-outline-info btn-sm" onClick={carregarAmostra}>🔄 Nova amostra</button>
                </div>
              </div>

              {carregando ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-info" role="status"></div>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-dark table-sm align-middle mb-2">
                      <thead>
                        <tr className="text-secondary small">
                          <th>ID</th><th>Tipo</th><th>Vel.</th><th>Lat / Lng</th><th>Sync</th><th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {veiculosDaPagina.map(v => (
                          <tr key={v.id}>
                            <td className="font-monospace small">{v.id}</td>
                            <td>{v.modelo} <span className="small text-secondary">{v.tipo}</span></td>
                            {editandoId === v.id ? (
                              <>
                                <td>
                                  <input type="number" className="form-control form-control-sm" style={{ width: '70px' }}
                                    value={valoresEdicao.vel} onChange={e => setValoresEdicao({ ...valoresEdicao, vel: e.target.value })} />
                                </td>
                                <td>
                                  <input type="text" className="form-control form-control-sm mb-1" placeholder="lat"
                                    value={valoresEdicao.latitude} onChange={e => setValoresEdicao({ ...valoresEdicao, latitude: e.target.value })} />
                                  <input type="text" className="form-control form-control-sm" placeholder="lng"
                                    value={valoresEdicao.longitude} onChange={e => setValoresEdicao({ ...valoresEdicao, longitude: e.target.value })} />
                                </td>
                                <td className="small text-secondary">—</td>
                                <td className="text-nowrap">
                                  <button className="btn btn-success btn-sm me-1" onClick={() => salvarEdicao(v.id)}>💾</button>
                                  <button className="btn btn-outline-secondary btn-sm" onClick={cancelarEdicao}>✖</button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="small">{v.vel} km/h</td>
                                <td className="small font-monospace">{v.latitude}, {v.longitude}</td>
                                <td className="small text-secondary">{v.ultima_atualizacao ? new Date(v.ultima_atualizacao).toLocaleTimeString('pt-BR') : '--'}</td>
                                <td className="text-nowrap">
                                  <button className="btn btn-outline-warning btn-sm me-1" onClick={() => iniciarEdicao(v)}>✏️ PUT</button>
                                  <button className="btn btn-outline-danger btn-sm" onClick={() => deletarVeiculo(v.id)}>🗑️ DELETE</button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                        {veiculosDaPagina.length === 0 && (
                          <tr><td colSpan={6} className="text-center text-secondary py-3">Nenhum veículo na amostra atual.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <button className="btn btn-outline-light btn-sm" disabled={pagina <= 1} onClick={() => setPagina(p => p - 1)}>← Anterior</button>
                    <span className="small text-secondary">Página {pagina} de {totalPaginas}</span>
                    <button className="btn btn-outline-light btn-sm" disabled={pagina >= totalPaginas} onClick={() => setPagina(p => p + 1)}>Próxima →</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Coluna 3: terminal de log de eventos (canto da tela) */}
        <div className="col-12 col-lg-3">
          <div className="terminal-window sticky-top" style={{ top: '1rem' }}>
            <div className="terminal-header">
              <span className="terminal-dot" style={{ background: '#ff5f56' }}></span>
              <span className="terminal-dot" style={{ background: '#ffbd2e' }}></span>
              <span className="terminal-dot" style={{ background: '#27c93f' }}></span>
              <span className="small text-secondary ms-2 font-monospace">node --log frota-api</span>
            </div>
            <div className="terminal-log" ref={terminalRef}>
              {logs.map((l, i) => (
                <span key={i} className={`log-line log-${l.nivel}`}>
                  [{l.hora}] {l.nivel === 'error' ? '✗' : l.nivel === 'success' ? '✓' : '›'} {l.mensagem}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
