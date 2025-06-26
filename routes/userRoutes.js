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
    
    const hoje = new Date();
    const ultima = new Date(usuario.ultimoCrescimento);
    const diffDias = Math.floor((hoje - ultima) / (1000 * 60 * 60 * 24));

    if (diffDias >= 1) {
      const taxa = 0.00077;
      const novoSaldo = usuario.saldo * Math.pow((1 + taxa), diffDias);

      usuario.saldo = parseFloat(novoSaldo.toFixed(2));
      usuario.ultimoCrescimento = hoje;

      await usuario.save();
    }

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

    const totalInvestido = usuario.investimentos
    .filter(inv => inv.status === 'confirmado')
    .reduce((acc, inv) => acc + inv.valor, 0);

    const lucro = usuario.saldo - totalInvestido;

    res.send(`
      <div style="font-family: Arial; max-width: 600px; margin: auto; padding: 20px;">
      <h1>Bem-vindo, ${usuario.nomeFicticio || usuario.nomeCompleto}</h1>
    
      <hr/>
      <h2 style="color: green;">Saldo atual: ${usuario.saldo.toFixed(2)} KZs</h2>
      <p><strong>Lucro gerado:</strong> ${lucro.toFixed(2)} KZs</p>
      <p><strong>Total investido:</strong> ${totalInvestido.toFixed(2)} KZs</p>

      <hr/>
      <h3>Investimentos</h3>
      <ul>
        ${usuario.investimentos.map((inv, i) => `
          <li>
            #${i + 1} | ${inv.valor} KZ | ${inv.status.toUpperCase()} | ${new Date(inv.data).toLocaleDateString()}
          </li>
        `).join('')}
      </ul>

      <h3>Saques Solicitados</h3>
      <ul>
          ${usuario.saques.map((saque, i) => `
          <li>
            #${i + 1} | ${saque.valor} KZ | ${saque.status.toUpperCase()} | ${new Date(saque.data).toLocaleDateString()}
              ${saque.motivo ? `<br/><em>Motivo:</em> ${saque.motivo}` : ""}
          </li>
      `).join('')}
      </ul>


      <hr/>
      <div style="margin-top: 20px;">
        <a href="/investir"><button style="padding: 10px;">Novo Investimento</button></a>
        <a href="/sacar"><button style="padding: 10px;">Solicitar Saque</button></a>
        <form action="/logout" method="POST" style="display:inline;">
        <button type="submit" style="padding: 10px;"> Terminar Sessão</button>
      < /form>
      </div>
      </div>
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


router.get('/investir', async (req, res) => {
  if (!req.session.usuarioId) return res.redirect('/');

  try {
    const usuario = await User.findById(req.session.usuarioId);

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
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar a página de investimento.");
  }
});

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

router.get('/sacar', (req, res) => {
  if (!req.session.usuarioId) return res.redirect('/');

  res.send(`
    <h2>Solicitar Saque</h2>
    <form action="/sacar" method="POST">
      <label>Valor a sacar (KZ):</label><br/>
      <input type="number" name="valor" required/><br/><br/>

      <label>Motivo (opcional):</label><br/>
      <textarea name="motivo" rows="3"></textarea><br/><br/>

      <button type="submit">Enviar Solicitação</button>
    </form>
    <br/>
    <a href="/painel">Voltar ao painel</a>
  `);
});

router.post('/sacar', async (req, res) => {
  if (!req.session.usuarioId) return res.redirect('/');

  const { valor, motivo } = req.body;

  try {
    const usuario = await User.findById(req.session.usuarioId);

    // Verifica se o valor solicitado é menor ou igual ao saldo
    if (valor > usuario.saldo) {
      return res.send("Saldo insuficiente para saque.");
    }

    usuario.saques.push({
      valor: parseFloat(valor),
      motivo,
      status: 'pendente'
    });

    await usuario.save();

    res.send(`
      <p>Pedido de saque enviado com sucesso e está pendente de aprovação.</p>
      <a href="/painel">Voltar ao painel</a>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao solicitar saque.");
  }
});


module.exports = router;