import React, { useState } from 'react';

interface Sala {
  id: number;
  nome: string;
  nota: number;
}

export default function App() {
  const [salas, setSalas] = useState<Sala[]>([
    { id: 1, nome: 'Sala 1', nota: 0 },
    { id: 2, nome: 'Sala 2', nota: 0 },
    { id: 3, nome: 'Sala 3', nota: 0 },
    { id: 4, nome: 'Sala 4', nota: 0 },
    { id: 5, nome: 'Sala 5', nota: 0 },
  ]);

  const [salaSelecionada, setSalaSelecionada] = useState<number>(1);
  const [notaDada, setNotaDada] = useState<number>(0);

  const handleAvaliar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSalas((prevSalas) =>
      prevSalas.map((sala) =>
        sala.id === salaSelecionada ? { ...sala, nota: notaDada } : sala
      )
    );
  };

  const ranking = [...salas].sort((a, b) => b.nota - a.nota);

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2>Avaliação de Salas (0 a 5)</h2>

      <form onSubmit={handleAvaliar} style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center' }}>
        <select
          value={salaSelecionada}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSalaSelecionada(Number(e.target.value))}
          style={{ padding: '8px', flex: 1 }}
        >
          {salas.map((sala) => (
            <option key={sala.id} value={sala.id}>
              {sala.nome}
            </option>
          ))}
        </select>

        <select
          value={notaDada}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNotaDada(Number(e.target.value))}
          style={{ padding: '8px' }}
        >
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>

        <button type="submit" style={{ padding: '8px 16px' }}>Dar Nota</button>
      </form>

      <h3>🏆 Ranking Atual</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {ranking.map((sala, index) => (
          <li
            key={sala.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px',
              borderBottom: '1px solid #eee',
              backgroundColor: index === 0 && sala.nota > 0 ? '#fffbea' : 'transparent',
            }}
          >
            <span>
              <strong>{index + 1}º</strong> {sala.nome}
            </span>
            <span style={{ fontWeight: 'bold', color: '#0056b3' }}>
              {sala.nota} / 5
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}