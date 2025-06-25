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

module.exports = router;