const mongoose = require('mongoose');
const express = require('express');
const path = require('path');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/neuravestDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Conectado ao MongoDB"))
.catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const session = require('express-session');

app.use(session({
  secret: 'segredoUltraSecreto123', 
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } 
}));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

const userRoutes = require('./routes/userRoutes');
app.use(userRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'form.html'));
});

const PORT = 3000;

app.get('/painel', async (req, res) => {
  if (!req.session.usuarioId) {
    return res.redirect('/');
  }

  const User = require('./models/User');
  const usuario = await User.findById(req.session.usuarioId);

  res.send(`
    <h1>Olá, ${usuario.nomeFicticio}!</h1>
    <p>Seu saldo atual é: <strong>${usuario.saldo.toFixed(2)} KZs</strong></p>
    <form method="POST" action="/logout">
      <button type="submit">Terminar Sessão</button>
    </form>
  `);
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send('Erro ao terminar sessão.');
    }
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});