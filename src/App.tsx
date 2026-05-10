import { useEffect, useState } from 'react';
import Header from './components/Header';

type Note = {
  id: number;
  title: string;
  author: string;
  imageUrl: string;
};

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/notes')
      .then((res) => res.json())
      .then((data) => setNotes(data));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <Header />

      <div className="flex flex-row my-6 space-y-4 space-x-4">
        {notes.map((note) => (
          <div key={note.id} className="rounded-xl bg-zinc-800 w-1/3 h-1/1 p-4">
            <img
              src={note.imageUrl}
              alt={note.title}
              className="mb-4 w-full rounded-lg"
            />

            <h2 className="text-xl font-semibold">{note.title}</h2>
            <p className="text-zinc-400">Uploaded by {note.author}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col">
        <button className="m-1 w-50 text-white px-4 py-2 rounded-md border-b-blue-900 bg-blue-600 hover:bg-blue-700 active:bg-blue-600 cursor-pointer">
          Upload Notes
        </button>
        <button className="m-1 w-50 text-white px-4 py-2 rounded-md border-2 border-blue-700 hover:bg-blue-600 active:bg-blue-700 cursor-pointer">
          Browse Library
        </button>
      </div>
    </div>
  );
}
