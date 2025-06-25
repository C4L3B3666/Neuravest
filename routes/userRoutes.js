const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');

// Rota de cadastro
router.post('/registrar', async (req, res) => {
  const { nomeCompleto, nomeFicticio, telefone, senha } = req.body;

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = new User({
      nomeCompleto,
      nomeFicticio,
      telefone,
      senha: senhaHash
    });

    await novoUsuario.save();
    res.status(201).send('Cadastrado com Sucesso!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar conta.');
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  const { telefone, senha } = req.body;

  try {
    const usuario = await User.findOne({ telefone });

    if (!usuario) {
      return res.status(400).send('Usuário não encontrado.');
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(400).send('Palavra-passe incorreta.');
    }

    req.session.usuarioId = usuario._id;

    res.redirect('/painel'); 
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao fazer login.');
  }
});

router.get('/painel', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }

  try {
    const usuario = await User.findById(req.session.userId);

    if (!usuario) return res.redirect('/');

    res.send(`
      <h1>Bem-vindo, ${usuario.nomeFicticio}</h1>
      <p>Saldo atual: ${usuario.saldo.toFixed(2)} KZs</p>
      <a href="/logout">Terminar sessão</a>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar painel');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;