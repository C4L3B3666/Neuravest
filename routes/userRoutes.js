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
    if (!telefone || !senha) {
      return res.status(400).send('Telefone e senha são obrigatórios.');
    }

    const usuario = await User.findOne({ telefone });
    
    if (!usuario) {
      return res.status(400).send('Usuário não encontrado.');
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaCorreta) {
      return res.status(400).send('Palavra-passe incorreta.');
    }

    req.session.usuarioId = usuario._id;
    console.log("Login bem-sucedido para:", usuario.telefone);
    
    return res.redirect('/painel');
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).send('Erro interno ao processar login.');
  }
});

router.get('/painel', async (req, res) => {
  if (!req.session.usuarioId) return res.redirect('/');

  try {
    const usuario = await User.findById(req.session.usuarioId);

    let listaInvestimentos = '';

    if (usuario.investimentos.length > 0) {
      usuario.investimentos.forEach((inv, index) => {
        listaInvestimentos += `
          <li>
            #${index + 1} | Valor: <strong>${inv.valor} KZ</strong> |
            Status: <strong>${inv.status}</strong> |
            Data: ${new Date(inv.data).toLocaleString()}
          </li>
        `;
      });
    } else {
      listaInvestimentos = '<li>Nenhum investimento encontrado ainda.</li>';
    }

    res.send(`
      <h1>Olá, ${usuario.nomeFicticio || usuario.nomeCompleto}!</h1>
      <p>Seu saldo atual é: <strong>${usuario.saldo.toFixed(2)} KZs</strong></p>

      <h3>Seus Investimentos</h3>
      <ul>${listaInvestimentos}</ul>

      <br/>
      <a href="/investir">Fazer novo investimento</a><br/>
      <a href="/logout">Terminar Sessão</a>
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
  if (!req.session.usuarioId) {
    return res.redirect('/');
  }

  router.post('/investir', upload.single('comprovativo'), async (req, res) => {
  if (!req.session.usuarioId) {
    return res.redirect('/');
  }

  const { valor } = req.body;
  const comprovativo = req.file;

  if (!comprovativo) {
    return res.status(400).send("Comprovativo é obrigatório.");
  }

  try {
    const usuario = await User.findById(req.session.usuarioId);

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