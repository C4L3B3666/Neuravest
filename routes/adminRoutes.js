const express = require('express');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const User = require('../models/User');

const router = express.Router();

router.get('/admin', (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/adminLogin.html'));
});

// Login do admin
router.post('/admin/login', async (req, res) => {
  const { username, senha } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).send('Admin não encontrado.');

    const senhaCorreta = await bcrypt.compare(senha, admin.senha);
    if (!senhaCorreta) return res.status(401).send('Senha incorreta.');

    req.session.adminId = admin._id;
    res.redirect('/admin/painel');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro no login do admin.');
  }
});

// Painel do admin
router.get('/admin/painel', async (req, res) => {
  if (!req.session.adminId) return res.redirect('/admin');

  const usuarios = await User.find({ "investimentos.status": "pendente" });

  let html = `<h2>Investimentos Pendentes</h2>`;

  usuarios.forEach((user) => {
    user.investimentos.forEach((inv, index) => {
      if (inv.status === 'pendente') {
        html += `
          <div style="border: 1px solid #ccc; padding: 10px; margin: 10px;">
            <p><strong>Usuário:</strong> ${user.nomeFicticio}</p>
            <p><strong>Valor:</strong> ${inv.valor} KZ</p>
            <p><strong>Data:</strong> ${new Date(inv.data).toLocaleString()}</p>
            <p><strong>Comprovativo:</strong> <a href="/${inv.comprovativoURL}" target="_blank">Ver</a></p>
            <form action="/admin/aprovar" method="POST" style="display: inline;">
              <input type="hidden" name="userId" value="${user._id}" />
              <input type="hidden" name="index" value="${index}" />
              <button type="submit">Aprovar</button>
            </form>
            <form action="/admin/rejeitar" method="POST" style="display: inline;">
              <input type="hidden" name="userId" value="${user._id}" />
              <input type="hidden" name="index" value="${index}" />
              <button type="submit">Rejeitar</button>
            </form>
          </div>
        `;
      }
    });
  });
      // Saques pendentes
  html += `<h2>Pedidos de Saque Pendentes</h2>`;

  const saquesPendentes = await User.find({ "saques.status": "pendente" });

  saquesPendentes.forEach((user) => {
    user.saques.forEach((saque, index) => {
      if (saque.status === 'pendente') {
        html += `
          <div style="border: 1px solid #ccc; padding: 10px; margin: 10px;">
            <p><strong>Usuário:</strong> ${user.nomeFicticio}</p>
            <p><strong>Valor solicitado:</strong> ${saque.valor} KZ</p>
            <p><strong>Data:</strong> ${new Date(saque.data).toLocaleString()}</p>
            ${saque.motivo ? `<p><strong>Motivo:</strong> ${saque.motivo}</p>` : ""}
            <form action="/admin/aprovar-saque" method="POST" style="display:inline;">
              <input type="hidden" name="userId" value="${user._id}" />
              <input type="hidden" name="index" value="${index}" />
              <button type="submit">Aprovar</button>
            </form>
            <form action="/admin/rejeitar-saque" method="POST" style="display:inline;">
              <input type="hidden" name="userId" value="${user._id}" />
              <input type="hidden" name="index" value="${index}" />
              <button type="submit">Rejeitar</button>
            </form>
          </div>
        `;
      }
    });
  });

  res.send(html);
});

// Aprovar
router.post('/admin/aprovar', async (req, res) => {
  const { userId, index } = req.body;

  const usuario = await User.findById(userId);
  const investimento = usuario.investimentos[index];

  if (investimento && investimento.status === 'pendente') {
    investimento.status = 'confirmado';
    usuario.saldo += investimento.valor;
    await usuario.save();
  }

  res.redirect('/admin/painel');
});

// Rejeitar
router.post('/admin/rejeitar', async (req, res) => {
  const { userId, index } = req.body;

  const usuario = await User.findById(userId);
  const investimento = usuario.investimentos[index];

  if (investimento && investimento.status === 'pendente') {
    investimento.status = 'rejeitado';
    await usuario.save();
  }

  res.redirect('/admin/painel');
});

router.post('/admin/aprovar-saque', async (req, res) => {
  const { userId, index } = req.body;

  try {
    const usuario = await User.findById(userId);
    const saque = usuario.saques[index];

    if (saque && saque.status === 'pendente') {
      if (saque.valor > usuario.saldo) {
        return res.send("Saldo insuficiente para aprovar o saque.");
      }

      saque.status = 'aprovado';
      usuario.saldo -= saque.valor;
      await usuario.save();
    }

    res.redirect('/admin/painel');
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao aprovar saque.");
  }
});

router.post('/admin/rejeitar-saque', async (req, res) => {
  const { userId, index } = req.body;

  try {
    const usuario = await User.findById(userId);
    const saque = usuario.saques[index];

    if (saque && saque.status === 'pendente') {
      saque.status = 'rejeitado';
      await usuario.save();
    }

    res.redirect('/admin/painel');
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao rejeitar saque.");
  }
});

router.get('/admin/editar-taxa', async (req, res) => {
  if (!req.session.adminId) return res.redirect('/admin');

  const admin = await Admin.findById(req.session.adminId);
  res.send(`
    <h2>Editar Taxa de Crescimento</h2>
    <form action="/admin/editar-taxa" method="POST">
      <label for="taxa">Nova taxa de crescimento diária (%):</label>
      <input type="number" step="0.0001" name="taxa" value="${(admin.taxaCrescimento * 100).toFixed(4)}" required />
      <button type="submit">Salvar</button>
    </form>
    <br/>
    <a href="/admin/painel">Voltar ao Painel</a>
  `);
});

router.post('/admin/editar-taxa', async (req, res) => {
  if (!req.session.adminId) return res.redirect('/admin');

  const novaTaxa = parseFloat(req.body.taxa) / 100;

  try {
    const admin = await Admin.findById(req.session.adminId);
    admin.taxaCrescimento = novaTaxa;
    await admin.save();

    res.send(`
      <p>Taxa atualizada com sucesso para ${(novaTaxa * 100).toFixed(4)}%</p>
      <a href="/admin/painel">Voltar ao Painel</a>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar taxa.');
  }
});

module.exports = router;