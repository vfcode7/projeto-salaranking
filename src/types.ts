export type Evaluation = {
  id: string
  className: string
  score: number
  date: string
  description?: string
}

export type RankingRow = {
  className: string
  average: number
  evaluations: number
  lastScore: number
}
