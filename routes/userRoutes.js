const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });
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
  if (!req.session.userId) return res.redirect('/');

  try {
    const usuario = await User.findById(req.session.userId);

    let listaInvestimentos = '';

    usuario.investimentos.forEach((inv, i) => {
      listaInvestimentos += `
        <li>
          #${i + 1} | Valor: ${inv.valor} KZ | Status: ${inv.status} | Enviado em: ${new Date(inv.data).toLocaleString()}
        </li>
      `;
    });

    res.send(`
      <h1>Bem-vindo, ${usuario.nomeFicticio}</h1>
      <p>Saldo atual: ${usuario.saldo.toFixed(2)} KZs</p>

      <h3>Seus Investimentos</h3>
      <ul>${listaInvestimentos || '<li>Nenhum investimento encontrado.</li>'}</ul>

      <br/>
      <a href="/investir">Fazer novo investimento</a><br/>
      <a href="/logout">Sair</a>
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

router.get('/investir', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }

  router.post('/investir', upload.single('comprovativo'), async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }

  const { valor } = req.body;
  const comprovativo = req.file;

  if (!comprovativo) {
    return res.status(400).send("Comprovativo é obrigatório.");
  }

  try {
    const usuario = await User.findById(req.session.userId);

    usuario.investimentos.push({
      valor: parseFloat(valor),
      data: new Date(),
      comprovativoURL: comprovativo.path,
      status: 'pendente'
    });

    await usuario.save();

    res.send(`
      <p>Investimento enviado com sucesso e está pendente de aprovação.</p>
      <a href="/painel">Voltar ao painel</a>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao processar investimento.");
  }
});


  res.send(`
    <h2>Fazer novo investimento</h2>
    <form action="/investir" method="POST" enctype="multipart/form-data">
      <label for="valor">Valor a investir (KZ):</label>
      <input type="number" name="valor" required />

      <br/><br/>
      <label for="comprovativo">Comprovativo (imagem ou PDF):</label>
      <input type="file" name="comprovativo" accept="image/*,.pdf" required />

      <br/><br/>
      <button type="submit">Enviar investimento</button>
    </form>

    <br/>
    <a href="/painel">Voltar ao painel</a>
  `);
});



module.exports = router;