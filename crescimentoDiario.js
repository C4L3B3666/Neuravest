const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/neuravestDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Conectado ao MongoDB para crescimento diário"))
.catch(err => {
  console.error("Erro ao conectar ao MongoDB:", err);
  process.exit(1);
});

// Configuração da taxa de crescimento diário (%)
const taxaCrescimento = 0.077 / 100; // 0.077%

async function aplicarCrescimento() {
  try {
    const usuarios = await User.find({});

    for (const usuario of usuarios) {
      if (usuario.saldo > 0) {
        const rendimento = usuario.saldo * taxaCrescimento;
        usuario.saldo += rendimento;
        await usuario.save();
        console.log(`${usuario.nomeFicticio || usuario.nomeCompleto} teve crescimento de ${rendimento.toFixed(2)} KZ`);
      }
    }

    console.log("Crescimento diário aplicado com sucesso.");
  } catch (err) {
    console.error("Erro ao aplicar crescimento:", err);
  } finally {
    mongoose.connection.close();
  }
}

aplicarCrescimento();
