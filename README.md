# Study Hub (MVP Phase)

A full-stack study sharing platform built with React, TypeScript, and Express.

Students can upload, browse, and share notes and study resources in one place.

(Readme created with Chatgpt cuz i'm a lazy bum)

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript
- Supabase

---

## Features

Planned features:

- Simple note sharing system, nothing extra
- Notes are categorized by school subject
- Sign-in/basic account system for privacy and security
- Basic search

To-do:

- [x] Upload files
- [x] Backend and database interaction
- [ ] Simple polished web frontend
- [ ] User authentication
- [ ] Mobile frontend

---

## Project Structure

```txt
study-hub/
├── server/          # Express backend
│   └── src/
│       └── index.ts
│
├── src/             # React frontend
│   ├── components/
│   ├── pages/
│   └── App.tsx
│
├── public/
└── package.json
```

---

## Getting Started

### Install dependencies

Frontend:

```bash
npm install
```

Backend:

```bash
cd server
npm install
```

---

## Running the Project

From the root folder:

```bash
npm run start
```

Frontend:

```txt
http://localhost:5173
```

Backend:

```txt
http://localhost:3000
```

---

## API Routes

### Get Notes

```txt
GET /api/notes
```

Example response:

```json
[
  {
    "id": 1,
    "title": "AP Chemistry Notes",
    "author": "Shaoyu",
    "imageUrl": "https://placehold.co/600x400"
  }
]
```

---

## Goals

This project is intended as:

- a learning experience for full-stack development
- a platform for collaborative studying
- a portfolio project

---

## Future Ideas

- Flashcard generation
- OCR for handwritten notes
- Real-time collaboration
- Personalized recommendations
- Comments and ratings
- Forums
- AI-generated summaries (probably not this)
