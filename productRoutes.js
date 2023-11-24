const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
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

// Rota para criar um produto
router.post('/products', verifyToken, async (req, res) => {
  const { name, description, price, category } = req.body;

  try {
    const product = await productController.createProduct(name, description, price, category);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar o produto' });
  }
});

module.exports = router;