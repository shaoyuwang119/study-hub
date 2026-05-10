import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Study Hub backend is running');
});

app.get('/api/notes', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'Chemistry Notes',
      author: 'Shaoyu W',
      imageUrl: 'https://placehold.co/600x400',
    },
    {
      id: 2,
      title: 'World History',
      author: 'Shaoyu W',
      imageUrl: 'https://placehold.co/600x400',
    },
    {
      id: 3,
      title: 'Calc',
      author: 'Shaoyu W',
      imageUrl: 'https://placehold.co/600x400',
    },
  ]);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
