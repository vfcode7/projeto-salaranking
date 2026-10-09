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
const CLASSES_STORAGE_KEY = 'cleanclass-classes'

const DEFAULT_USER = 'tia123'
const DEFAULT_PASSWORD = 'tia123'

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

  const [classes, setClasses] = useState<string[]>(() => {
    const savedClasses = localStorage.getItem(CLASSES_STORAGE_KEY)
    if (savedClasses) {
      try {
        return JSON.parse(savedClasses)
      } catch {
        return []
      }
    }
    return [
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
  })

  const [isAddingClass, setIsAddingClass] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [isRemovingClass, setIsRemovingClass] = useState(false)
  const [classToRemove, setClassToRemove] = useState('')

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

  useEffect(() => {
    localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes))
  }, [classes])

  const ranking = useMemo<RankingRow[]>(() => {
    const evaluationsByClass = new Map<string, Evaluation[]>()

    evaluations.forEach((evaluation) => {
      const classEvaluations =
        evaluationsByClass.get(evaluation.className) ?? []

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
      .sort(
        (a, b) =>
          b.average - a.average || b.lastScore - a.lastScore,
      )
  }, [evaluations])

  const overallAverage =
    evaluations.length > 0
      ? evaluations.reduce(
          (total, evaluation) => total + evaluation.score,
          0,
        ) / evaluations.length
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

    setEvaluations((currentEvaluations) => [
      newEvaluation,
      ...currentEvaluations,
    ])

    setSelectedClass('')
    setScore(5)
    setDescription('')

    setFormMessage(
      `Avaliação registrada: ${newEvaluation.className} recebeu nota ${score}.`,
    )
  }

  function handleDeleteEvaluation(id: string) {
    const confirmed = window.confirm(
      'Tem certeza de que deseja apagar esta avaliação?',
    )

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

  function handleAddClass() {
    if (!newClassName.trim() || classes.includes(newClassName.trim())) return
    setClasses([...classes, newClassName.trim()])
    setNewClassName('')
    setIsAddingClass(false)
  }

  function handleDeleteClass() {
    if (!classToRemove) return
    setClasses(classes.filter((c) => c !== classToRemove))
    setClassToRemove('')
    setIsRemovingClass(false)
    if (selectedClass === classToRemove) setSelectedClass('')
    if (viewedClass === classToRemove) setViewedClass('')
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
            Entre com sua conta para registrar e acompanhar as avaliações
            das salas.
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

            {loginError && (
              <p className="login-error">{loginError}</p>
            )}

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
            <div className="access-message">
              Peça acesso ao seu diretor escolar.
            </div>
          )}

          <p className="demo-hint">
            Acesso de demonstração: <strong>tia123</strong> /{' '}
            <strong>tia123</strong>
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
              Registre a avaliação da responsável pela limpeza e descubra
              quais turmas estão fazendo a diferença.
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

            <span>
              {showEvaluations
                ? 'Ocultar avaliações'
                : 'Ver avaliações'}
            </span>

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

            <strong className="leader-name">
              {ranking[0]?.className ?? '—'}
            </strong>
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
                {classes.map((className) => (
                  <button
                    key={className}
                    type="button"
                    className={
                      selectedClass === className
                        ? 'class-button selected'
                        : 'class-button'
                    }
                    onClick={() => setSelectedClass(className)}
                  >
                    {className}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', marginBottom: '24px' }}>
                <button
                  type="button"
                  className="class-button"
                  style={{ flex: 1, padding: '8px', fontSize: '14px' }}
                  onClick={() => {
                    setIsAddingClass(!isAddingClass)
                    setIsRemovingClass(false)
                  }}
                >
                  Adicionar sala
                </button>
                <button
                  type="button"
                  className="class-button"
                  style={{ flex: 1, padding: '8px', fontSize: '14px' }}
                  onClick={() => {
                    setIsRemovingClass(!isRemovingClass)
                    setIsAddingClass(false)
                  }}
                >
                  Remover sala
                </button>
              </div>

              {isAddingClass && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexDirection: 'column', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label>Nome da nova sala</label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(event) => setNewClassName(event.target.value)}
                    placeholder="Ex: 4 INF"
                  />
                  <button type="button" className="primary-button" onClick={handleAddClass}>
                    <Plus size={19} />
                    Salvar
                  </button>
                </div>
              )}

              {isRemovingClass && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexDirection: 'column', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label>Selecione a sala para remover</label>
                  <div className="class-grid">
                    {classes.map((className) => (
                      <button
                        key={className}
                        type="button"
                        className={
                          classToRemove === className
                            ? 'class-button selected'
                            : 'class-button'
                        }
                        onClick={() => setClassToRemove(className)}
                      >
                        {className}
                      </button>
                    ))}
                  </div>
                  {classToRemove && (
                    <button type="button" className="primary-button" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }} onClick={handleDeleteClass}>
                      <Trash2 size={19} />
                      Deletar
                    </button>
                  )}
                </div>
              )}

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

              {formMessage && (
                <p className="success-message">{formMessage}</p>
              )}
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
                    className={
                      index === 0 ? 'ranking-row first' : 'ranking-row'
                    }
                    key={row.className}
                  >
                    <div className={`position pos-${index + 1}`}>
                      {index + 1}
                    </div>

                    <div className="class-info">
                      <strong>{row.className}</strong>

                      <span>
                        {row.evaluations}{' '}
                        {row.evaluations === 1
                          ? 'avaliação'
                          : 'avaliações'}
                      </span>
                    </div>

                    <div className="progress">
                      <div
                        style={{
                          width: `${(row.average / 5) * 100}%`,
                        }}
                      />
                    </div>

                    <strong className="score-value">
                      {row.average.toFixed(1)}
                    </strong>
                  </div>
                ))}
              </div>
            )}

            <p className="ranking-note">
              O ranking usa a média das avaliações. Em caso de empate, a
              última nota maior fica na frente.
            </p>
          </section>
        </div>

        {showEvaluations && (
          <>
            <section className="card class-history-card">
              <div className="card-heading">
                <div>
                  <p className="section-kicker">CONSULTA POR TURMA</p>
                  <h2>Ver avaliações de cada sala</h2>
                </div>
              </div>

              <p>
                Selecione uma turma para ver suas notas e descrições.
              </p>

              <div className="class-grid">
                {classes.map((className) => (
                  <button
                    key={className}
                    type="button"
                    className={
                      viewedClass === className
                        ? 'class-button selected'
                        : 'class-button'
                    }
                    onClick={() => setViewedClass(className)}
                  >
                    {className}
                  </button>
                ))}
              </div>

              {viewedClass && (
                <div className="historico-turma">
                  <h3>Histórico — {viewedClass}</h3>

                  {viewedClassEvaluations.length === 0 ? (
                    <p>Essa turma ainda não possui avaliações.</p>
                  ) : (
                    viewedClassEvaluations.map((evaluation) => (
                      <article
                        className="avaliacao-card"
                        key={evaluation.id}
                      >
                        <div>
                          <strong>
                            Nota: {evaluation.score}/5
                          </strong>

                          <p>
                            Data: {formatDate(evaluation.date)}
                          </p>

                          <p>
                            <strong>Descrição:</strong>{' '}
                            {evaluation.description ||
                              'Nenhuma descrição informada.'}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="delete-evaluation-button"
                          onClick={() =>
                            handleDeleteEvaluation(evaluation.id)
                          }
                          title="Apagar avaliação"
                        >
                          <Trash2 size={16} />
                        </button>
                      </article>
                    ))
                  )}
                </div>
              )}
            </section>

            <section className="card history-card">
              <div className="card-heading history-heading">
                <div>
                  <p className="section-kicker">HISTÓRICO GERAL</p>
                  <h2>Últimas avaliações</h2>
                </div>

                <span>{evaluations.length} registros</span>
              </div>

              <div className="history-table">
                <div className="history-header">
                  <span>Turma</span>
                  <span>Data</span>
                  <span>Nota</span>
                  <span>Ações</span>
                </div>

                {evaluations.slice(0, 8).map((evaluation) => (
                  <div className="history-row" key={evaluation.id}>
                    <div>
                      <strong>{evaluation.className}</strong>

                      {evaluation.description && (
                        <p className="history-description">
                          {evaluation.description}
                        </p>
                      )}
                    </div>

                    <span>{formatDate(evaluation.date)}</span>

                    <span className="history-score">
                      {evaluation.score}/5
                    </span>

                    <button
                      type="button"
                      className="delete-evaluation-button"
                      onClick={() =>
                        handleDeleteEvaluation(evaluation.id)
                      }
                      title="Apagar avaliação"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {evaluations.length === 0 && (
                  <div className="empty-history">
                    Sem avaliações.
                  </div>
                )}
              </div>

              <div className="danger-actions">
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={evaluations.length === 0}
                >
                  <Trash2 size={15} />
                  Apagar todas as avaliações
                </button>
              </div>
            </section>
          </>
        )}
      </main>

      <footer>
        CleanClass • Projeto acadêmico • Dados salvos localmente no navegador
      </footer>
    </div>
  )
}

export default App
