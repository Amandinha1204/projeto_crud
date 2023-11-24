// server.js

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const port = 3000;

const secretKey = 'seuSegredoSuperSecreto';
const pool = new Pool({
  user: 'aluno_20201214010021',              // Substitua pelo seu usuário
  host: '177.136.201.182',          // Substitua pelo seu host
  database: 'temp',                 // Substitua pelo seu nome de banco de dados
  password: '128407',            // Substitua pela sua senha
  port: 5439,                        // Substitua pela sua porta
});

app.use(bodyParser.json());
app.use(cors());

// Rota de registro de produto
app.post('/api/registerProduct', authenticateToken, async (req, res) => {
  const { productName, productPrice, productDescription } = req.body;
  const username = req.user.username;  // Obtém o username do token

  try {
    // Obtém o ID do usuário a partir do username
    const userIdResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);

    if (userIdResult.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'User not found.' });
    }

    const userId = userIdResult.rows[0].id;

    // Insere o produto no banco de dados associando-o ao usuário
    const result = await pool.query(
      'INSERT INTO products (user_id, name, price, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, productName, productPrice, productDescription]
    );

    if (result.rows.length > 0) {
      const product = result.rows[0];
      res.json({ success: true, product });
    } else {
      res.status(500).json({ success: false, error: 'Failed to register product. No product returned.' });
    }
  } catch (error) {
    console.error('Error during product registration:', error);
    res.status(500).json({ success: false, error: 'Failed to register product.' });
  }
});

// Rota de registro de usuário
app.post('/api/registerUser', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Verifique se o usuário já existe
    const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Username already exists.' });
    }

    // Hash da senha antes de armazenar no banco de dados
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [username, hashedPassword]);

    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.status(500).json({ success: false, error: 'Failed to register user. No user returned.' });
    }
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ success: false, error: 'Failed to register user.' });
  }
});

// Rota de login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Compare a senha fornecida com a senha armazenada no banco de dados
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
        res.json({ auth: true, token });
      } else {
        res.status(401).json({ auth: false, token: null });
      }
    } else {
      res.status(401).json({ auth: false, token: null });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ auth: false, token: null, error: 'An error occurred during login.' });
  }
});

app.post('/api/registerProduct', authenticateToken, async (req, res) => {
  const { productName, productPrice, productDescription } = req.body;
  const username = req.user.username;  // Obtém o username do token

  try {
    // Obtém o ID do usuário a partir do username
    const userIdResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);

    if (userIdResult.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'User not found.' });
    }

    const userId = userIdResult.rows[0].id;

    // Insere o produto no banco de dados associando-o ao usuário
    const result = await pool.query(
      'INSERT INTO products (user_id, name, price, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, productName, productPrice, productDescription]
    );

    if (result.rows.length > 0) {
      const product = result.rows[0];
      res.json({ success: true, product });
    } else {
      res.status(500).json({ success: false, error: 'Failed to register product. No product returned.' });
    }
  } catch (error) {
    console.error('Error during product registration:', error);
    res.status(500).json({ success: false, error: 'Failed to register product.' });
  }
});

// Middleware para autenticação do token
function authenticateToken(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token not provided.' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.error('Error during token verification:', err);
      return res.status(403).json({ success: false, error: 'Failed to authenticate token.' });
    }
    req.user = user;
    next();
  });
}




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


