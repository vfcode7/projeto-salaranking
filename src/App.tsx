import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Award,
  BarChart3,
  ClipboardCheck,
  LockKeyhole,
  LogIn,
  Medal,
  Plus,
  Sparkles,
  Trash2,
  Trophy,
  UserPlus,
} from 'lucide-react'

import type { Evaluation, RankingRow } from './types'
import './styles.css'

const STORAGE_KEY = 'cleanclass-evaluations'
const LOGIN_KEY = 'cleanclass-logged-in'

const DEFAULT_USER = 'tia123'
const DEFAULT_PASSWORD = 'tia123'

const CLASSES = [
  '1 ADM',
  '1 DS',
  '1 INF',
  '2 ADM',
  '2 DS',
  '2 INF',
  '3 ADM',
  '3 DS',
  '3 INF',
]

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
}

function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => sessionStorage.getItem(LOGIN_KEY) === 'true',
  )

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [showAccessMessage, setShowAccessMessage] = useState(false)

  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => {
    const savedEvaluations = localStorage.getItem(STORAGE_KEY)

    if (!savedEvaluations) {
      return []
    }

    try {
      return JSON.parse(savedEvaluations) as Evaluation[]
    } catch {
      return []
    }
  })

  const [selectedClass, setSelectedClass] = useState('')
  const [score, setScore] = useState(5)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [formMessage, setFormMessage] = useState('')

  const [viewedClass, setViewedClass] = useState('')
  const [showEvaluations, setShowEvaluations] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluations))
  }, [evaluations])

  const ranking = useMemo<RankingRow[]>(() => {
    const evaluationsByClass = new Map<string, Evaluation[]>()

    evaluations.forEach((evaluation) => {
      const classEvaluations = evaluationsByClass.get(evaluation.className) ?? []
      classEvaluations.push(evaluation)
      evaluationsByClass.set(evaluation.className, classEvaluations)
    })

    return Array.from(evaluationsByClass.entries())
      .map(([className, classEvaluations]) => {
        const totalScore = classEvaluations.reduce(
          (total, evaluation) => total + evaluation.score,
          0,
        )

        const average = totalScore / classEvaluations.length
        const latestEvaluation = [...classEvaluations].sort((a, b) =>
          b.date.localeCompare(a.date),
        )[0]

        return {
          className,
          average,
          evaluations: classEvaluations.length,
          lastScore: latestEvaluation.score,
        }
      })
      .sort((a, b) => b.average - a.average || b.lastScore - a.lastScore)
  }, [evaluations])

  const overallAverage =
    evaluations.length > 0
      ? evaluations.reduce((total, evaluation) => total + evaluation.score, 0) /
          evaluations.length
      : 0

  const viewedClassEvaluations = evaluations
    .filter((evaluation) => evaluation.className === viewedClass)
    .sort((a, b) => b.date.localeCompare(a.date))

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginError('')
    setShowAccessMessage(false)

    if (username === DEFAULT_USER && password === DEFAULT_PASSWORD) {
      sessionStorage.setItem(LOGIN_KEY, 'true')
      setLoggedIn(true)
    } else {
      setLoginError(
        'Usuário ou senha incorretos. Peça acesso ao seu diretor escolar.',
      )
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(LOGIN_KEY)
    setLoggedIn(false)
    setUsername('')
    setPassword('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedClass) {
      setFormMessage('Selecione uma turma antes de registrar a avaliação.')
      return
    }

    const newEvaluation: Evaluation = {
      id: crypto.randomUUID(),
      className: selectedClass,
      score,
      date,
      description: description.trim() || undefined,
    }

    setEvaluations((currentEvaluations) => [newEvaluation, ...currentEvaluations])
    setSelectedClass('')
    setScore(5)
    setDescription('')
    setFormMessage(`Avaliação registrada: ${newEvaluation.className} recebeu nota ${score}.`)
  }

  function handleDeleteEvaluation(id: string) {
    const confirmed = window.confirm('Tem certeza de que deseja apagar esta avaliação?')

    if (!confirmed) {
      return
    }

    setEvaluations((currentEvaluations) =>
      currentEvaluations.filter((evaluation) => evaluation.id !== id),
    )

    setFormMessage('Avaliação apagada com sucesso.')
  }

  function handleClearAll() {
    if (evaluations.length === 0) {
      return
    }

    const confirmed = window.confirm(
      'Tem certeza de que deseja apagar TODAS as avaliações? O ranking também será apagado.',
    )

    if (!confirmed) {
      return
    }

    setEvaluations([])
    setViewedClass('')
    setFormMessage('Todas as avaliações e o ranking foram apagados.')
  }

  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <Sparkles size={25} />
          </div>

          <p className="section-kicker">CLEANCLASS</p>
          <h1>Acesso ao sistema</h1>

          <p className="login-copy">
            Entre com sua conta para registrar e acompanhar as avaliações das salas.
          </p>

          <form onSubmit={handleLogin} className="login-form">
            <label>
              Usuário
              <div className="input-with-icon">
                <LogIn size={17} />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Digite seu usuário"
                  autoComplete="username"
                  required
                />
              </div>
            </label>

            <label>
              Senha
              <div className="input-with-icon">
                <LockKeyhole size={17} />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>

            {loginError && <p className="login-error">{loginError}</p>}

            <button className="primary-button" type="submit">
              <LogIn size={18} />
              Entrar
            </button>
          </form>

          <div className="login-divider">
            <span>ou</span>
          </div>

          <button
            className="access-button"
            type="button"
            onClick={() => setShowAccessMessage(true)}
          >
            <UserPlus size={17} />
            Criar conta
          </button>

          {showAccessMessage && (
            <div className="access-message">Peça acesso ao seu diretor escolar.</div>
          )}

          <p className="demo-hint">
            Acesso de demonstração: <strong>tia123</strong> / <strong>tia123</strong>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={20} />
          </div>

          <div>
            <strong>CleanClass</strong>
            <span>Gamificação da limpeza</span>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Sair
        </button>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">DESAFIO DA SEMANA</p>
            <h1>
              Uma sala limpa vira <span>pontos.</span>
            </h1>
            <p className="hero-copy">
              Registre a avaliação da responsável pela limpeza e descubra quais turmas
              estão fazendo a diferença.
            </p>
          </div>

          <div className="hero-trophy">
            <Trophy size={62} strokeWidth={1.5} />
          </div>
        </section>

        <section className="stats-grid">
          <button
            className="stat-card evaluations-toggle"
            type="button"
            onClick={() => setShowEvaluations((isVisible) => !isVisible)}
          >
            <ClipboardCheck size={22} />
            <span>{showEvaluations ? 'Ocultar avaliações' : 'Ver avaliações'}</span>
            <strong>{evaluations.length}</strong>
          </button>

          <div className="stat-card">
            <BarChart3 size={22} />
            <span>Média geral</span>
            <strong>
              {overallAverage.toFixed(1)} <small>/ 5</small>
            </strong>
          </div>

          <div className="stat-card">
            <Award size={22} />
            <span>Turmas no ranking</span>
            <strong>{ranking.length}</strong>
          </div>

          <div className="stat-card">
            <Medal size={22} />
            <span>Líder atual</span>
            <strong className="leader-name">{ranking[0]?.className ?? '—'}</strong>
          </div>
        </section>

        <div className="content-grid">
          <section className="card form-card">
            <div className="card-heading">
              <div>
                <p className="section-kicker">NOVA AVALIAÇÃO</p>
                <h2>Classificar sala</h2>
              </div>

              <div className="icon-box">
                <Plus size={20} />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Escolha a turma</label>

              <div className="class-grid">
                {CLASSES.map((className) => (
                  <button
                    key={className}
                    type="button"
                    className={
                      selectedClass === className ? 'class-button selected' : 'class-button'
                    }
                    onClick={() => setSelectedClass(className)}
                  >
                    {className}
                  </button>
                ))}
              </div>

              <label>
                Data da avaliação
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                />
              </label>

              <div className="score-label">
                <span>Nota de limpeza</span>
                <strong>{score}/5</strong>
              </div>

              <div className="score-buttons" aria-label="Nota de 0 a 5">
                {[0, 1, 2, 3, 4, 5].map((value) => (
                  <button
                    type="button"
                    className={score === value ? 'score active' : 'score'}
                    key={value}
                    onClick={() => setScore(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>

              <div className="scale">
                <span>Precisa melhorar</span>
                <span>Excelente</span>
              </div>

              <label>
                Descrição <span className="optional">(opcional)</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Explique o motivo da nota..."
                  maxLength={250}
                />
              </label>

              <button className="primary-button" type="submit">
                <Plus size={19} />
                Registrar avaliação
              </button>

              {formMessage && <p className="success-message">{formMessage}</p>}
            </form>
          </section>

          <section className="card ranking-card">
            <div className="card-heading">
              <div>
                <p className="section-kicker">PLACAR</p>
                <h2>Ranking das turmas</h2>
              </div>

              <Trophy className="heading-trophy" size={25} />
            </div>

            {ranking.length === 0 ? (
              <div className="empty-state">
                <Trophy size={34} />
                <p>Nenhuma turma avaliada ainda.</p>
              </div>
            ) : (
              <div className="ranking-list">
                {ranking.map((row, index) => (
                  <div
                    className={index === 0 ? 'ranking-row first' : 'ranking-row'}
                    key={row.className}
                  >
                    <div className={`position pos-${index + 1}`}>{index + 1}</div>

                    <div className="class-info">
                      <strong>{row.className}</strong>
                      <span>
                        {row.evaluations} {row.evaluations === 1 ? 'avaliação' : 'avaliações'}
                      </span>
                    </div>

                    <div className="progress">
                      <div style={{ width: `${Math.min(row.average * 20, 100)}%` }} />
                    </div>

                    <div className="score-value">{row.average.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            )}

            <p className="ranking-note">
              As turmas são organizadas pela média e, em caso de empate, pela última
              avaliação registrada.
            </p>

            {showEvaluations && (
              <div className="history-card">
                <div className="history-heading">
                  <p className="section-kicker">HISTÓRICO</p>
                  <span>Selecione uma turma para ver o histórico completo</span>
                </div>

                <div className="history-table">
                  <div className="history-header">
                    <span>Turma</span>
                    <span>Data</span>
                    <span>Nota</span>
                    <span> </span>
                  </div>

                  {evaluations.length === 0 ? (
                    <div className="empty-history">Ainda não há avaliações registradas.</div>
                  ) : (
                    evaluations.map((evaluation) => (
                      <div key={evaluation.id} className="history-row">
                        <span>{evaluation.className}</span>
                        <span>{formatDate(evaluation.date)}</span>
                        <span className="history-score">{evaluation.score}/5</span>
                        <button
                          type="button"
                          className="delete-evaluation-button"
                          onClick={() => handleDeleteEvaluation(evaluation.id)}
                          aria-label={`Excluir avaliação de ${evaluation.className}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="danger-actions">
                  <button type="button" onClick={handleClearAll} disabled={evaluations.length === 0}>
                    <Trash2 size={12} />
                    Limpar tudo
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
