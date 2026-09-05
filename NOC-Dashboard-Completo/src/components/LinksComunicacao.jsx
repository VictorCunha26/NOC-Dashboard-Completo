// src/components/LinksComunicacao.jsx
import React from 'react';

export function LinksComunicacao({ dados, statusLinks, toggleLink }) {
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
