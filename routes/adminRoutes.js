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

module.exports = router;