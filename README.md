# Study Hub (MVP Phase)

A full-stack study sharing platform built with React, TypeScript, and Express.

Students can upload, browse, and share notes and study resources in one place.

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

- [x] Upload notes
- [x] Backend and database interaction
- [x] Individual note pages
- [x] Upload and host files
- [ ] Search function
- [x] User authentication
- [ ] Polished web frontend (Don't forget CSS variables)
- [ ] Mobile frontend
- [ ] Moderation

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

Because this project runs on React, it uses the Vite development tool to build and bundle files.

### Clone the repo

```bash
git clone https://github.com/shaoyuwang119/study-hub
```

Or use the VSC git GUI.

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

This will get Vite to build the project and host the client at port `5173` by default.

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

API Location:

```txt
http://localhost:3000/api/notes
```

Get Notes:

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
    "url": "https://placehold.co/600x400"
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
- Personalized recommendations
- Comments and ratings
