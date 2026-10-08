# CleanClass

Sistema web de gamificação da limpeza das salas de aula, desenvolvido com **React + TypeScript + Vite + CSS puro**.

## Funcionalidades

- Cadastro de avaliação por turma.
- Nota de limpeza de 0 a 5.
- Ranking automático pela média das avaliações.
- Desempate pela última nota.
- Histórico das avaliações.
- Estatísticas gerais.
- Persistência no `localStorage`.
- Layout responsivo para celular e desktop.

## Rodar localmente

```bash
npm install
npm run dev
```

Para validar a build de produção:

```bash
npm run build
```

## Publicar no GitHub

Depois de criar o repositório no GitHub:

```bash
git remote add origin https://github.com/SEU-USUARIO/cleanclass.git
git branch -M main
git push -u origin main
```

O projeto foi pensado para ser apresentado como um MVP acadêmico: sem backend, sem autenticação e sem banco externo. O `localStorage` mantém os dados no navegador.
