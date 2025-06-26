const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');

mongoose.connect('mongodb://127.0.0.1:27017/neuravestDB');

async function criarAdmin() {
  const senhaHash = await bcrypt.hash('admin123', 10);

  const novoAdmin = new Admin({
    username: 'admin',
    senha: senhaHash
  });

  await novoAdmin.save();
  console.log('Admin criado com sucesso!');
  mongoose.disconnect();
}

criarAdmin();