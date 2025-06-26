const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://127.0.0.1:27017/neuravestDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const crescimentoDiario = async () => {
  const Admin = require('../models/Admin');
  const admin = await Admin.findOne();
  const taxa = admin?.taxaCrescimento || 0.00077;

  try {
    const usuarios = await User.find();

    for (let user of usuarios) {
      if (user.saldo > 0) {
        const rendimento = user.saldo * taxa;
        user.saldo += rendimento;
        await user.save();

        console.log(`Crescimento: ${user.nomeFicticio || user.nomeCompleto} ganhou ${rendimento.toFixed(2)} KZ`);
      }
    }

    console.log('Crescimento diário aplicado com sucesso!');
  } catch (err) {
    console.error('Erro ao aplicar crescimento diário:', err);
  }
};

cron.schedule('0 3 * * *', () => {
  console.log('Executando crescimento diário...');
  crescimentoDiario();
});
crescimentoDiario(); // <-- Remove depois de testar
