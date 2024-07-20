import express from 'express';
import pg from 'pg';

const { Pool } = pg;

const app = express();
const port = 3000;

// Configuración del pool de conexión de PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'repertorio',
  password: 'postgres',
  port: 5432,
});

// Middleware JSON
app.use(express.json());

//Ruta Publica
app.use(express.static("public"))

app.get("/", (req, res) => {
  res.sendFile("./public/index.html");
})

// Crear una canción
app.post('/cancion', async (req, res) => {
  const { titulo, artista, tono } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO canciones (titulo, artista, tono) VALUES ($1, $2, $3) RETURNING *',
      [titulo, artista, tono]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener canciones
app.get('/canciones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM canciones');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar una canción
app.put('/cancion/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, artista, tono } = req.body;
  try {
    const result = await pool.query(
      'UPDATE canciones SET titulo = $1, artista = $2, tono = $3 WHERE id = $4 RETURNING *',
      [titulo, artista, tono, id]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Canción no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar una canción
app.delete('/cancion/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM canciones WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length > 0) {
      res.status(200).json({ message: 'Canción eliminada' });
    } else {
      res.status(404).json({ error: 'Canción no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:3000`);
});
