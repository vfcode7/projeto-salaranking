import React, { useState } from 'react';
// IMPORTANTE: Importando o CSS
import './App.css'; 

interface Avaliacao {
  id: number;
  nota: number;
  descricao: string;
}

interface Sala {
  id: number;
  nome: string;
  avaliacoes: Avaliacao[];
}

export default function App() {
  const [salas, setSalas] = useState<Sala[]>([
    { id: 1, nome: 'Sala 1', avaliacoes: [] },
    { id: 2, nome: 'Sala 2', avaliacoes: [] },
    { id: 3, nome: 'Sala 3', avaliacoes: [] },
  ]);

  const [salaSelecionada, setSalaSelecionada] = useState<number | null>(null);
  const [notaSelecionada, setNotaSelecionada] = useState<number | null>(null);
  const [descricao, setDescricao] = useState<string>('');
  const [salaExpandida, setSalaExpandida] = useState<number | null>(null);

  const calcularMedia = (avaliacoes: Avaliacao[]): number => {
    if (avaliacoes.length === 0) return 0;
    const soma = avaliacoes.reduce((total, av) => total + av.nota, 0);
    return soma / avaliacoes.length;
  };

  const handleSalvarAvaliacao = () => {
    if (salaSelecionada === null || notaSelecionada === null) return;

    const novaAvaliacao: Avaliacao = {
      id: Date.now(),
      nota: notaSelecionada,
      descricao: descricao,
    };

    setSalas((prevSalas) =>
      prevSalas.map((sala) =>
        sala.id === salaSelecionada
          ? { ...sala, avaliacoes: [...sala.avaliacoes, novaAvaliacao] }
          : sala
      )
    );

    setSalaSelecionada(null);
    setNotaSelecionada(null);
    setDescricao('');
  };

  const ranking = [...salas].sort(
    (a, b) => calcularMedia(b.avaliacoes) - calcularMedia(a.avaliacoes)
  );

  return (
    <div className="container">
      <h2>Avaliação de Salas</h2>

      <div className="secao">
        <h4>1. Escolha a Sala:</h4>
        <div className="grupo-botoes">
          {salas.map((sala) => (
            <button
              key={sala.id}
              onClick={() => setSalaSelecionada(sala.id)}
              /* AQUI ESTÁ O SEGREDO DAS CLASSES CONDICIONAIS */
              className={`botao ${salaSelecionada === sala.id ? 'botao-sala-ativo' : ''}`}
            >
              {sala.nome}
            </button>
          ))}
        </div>
      </div>

      {salaSelecionada !== null && (
        <div className="secao">
          <h4>2. Dê a Nota:</h4>
          <div className="grupo-botoes">
            {[1, 2, 3, 4, 5].map((nota) => (
              <button
                key={nota}
                onClick={() => setNotaSelecionada(nota)}
                className={`botao ${notaSelecionada === nota ? 'botao-nota-ativo' : ''}`}
              >
                {nota} ⭐
              </button>
            ))}
          </div>
        </div>
      )}

      {notaSelecionada !== null && (
        <div className="secao">
          <h4>3. Por que essa nota?</h4>
          <textarea
            value={descricao}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescricao(e.target.value)}
            placeholder="Ex: Chão limpo, mas lousa suja..."
            className="campo-texto"
          />
          <button onClick={handleSalvarAvaliacao} className="botao-salvar">
            Salvar Avaliação
          </button>
        </div>
      )}

      <h3>🏆 Ranking (Média)</h3>
      <ul className="lista-ranking">
        {ranking.map((sala, index) => (
          <li key={sala.id} className="item-ranking">
            
            <div 
              className="cabecalho-sala"
              onClick={() => setSalaExpandida(salaExpandida === sala.id ? null : sala.id)}
            >
              <span>
                <strong>{index + 1}º {sala.nome}</strong> 
                <span style={{ color: '#666', marginLeft: '8px', fontSize: '14px' }}>
                  ({sala.avaliacoes.length} avaliações)
                </span>
              </span>
              <strong>Média: {calcularMedia(sala.avaliacoes).toFixed(1)}</strong>
            </div>

            {salaExpandida === sala.id && (
              <div className="historico-avaliacoes">
                {sala.avaliacoes.length === 0 ? (
                  <p style={{ color: '#999', margin: 0 }}>Nenhuma avaliação ainda.</p>
                ) : (
                  sala.avaliacoes.map((av) => (
                    <div key={av.id} className="avaliacao-item">
                      <strong>Nota {av.nota}:</strong> {av.descricao || <em>Sem descrição</em>}
                    </div>
                  ))
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
