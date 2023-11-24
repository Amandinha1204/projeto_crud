const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const jwt = require('jsonwebtoken');
const secretKey = 'seuSegredoSuperSecreto';

// Middleware para verificar o token JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Falha na autenticação do token' });
    }
    req.user = user;
    next();
  });
}

// Rota para criar um usuário
router.post('/users', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userController.createUser(username, password);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar o usuário' });
  }
});

// Rota para autenticar um usuário e gerar um token JWT
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userController.authenticateUser(username, password);

    if (user) {
      const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
      res.json({ auth: true, token });
    } else {
      res.json({ auth: false, token: null });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao autenticar o usuário' });
  }
});

module.exports = router;