const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nomeCompleto: { type: String, required: true },
  nomeFicticio: { type: String, required: true },
  telefone: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  saldo: { type: Number, default: 0 },
  ultimoCrescimento: { type: Date, default: Date.now },
  investimentos: [
    {
      valor: Number,
      data: Date,
      comprovativoURL: String,
      status: { type: String, enum: ['pendente', 'confirmado', 'rejeitado'], default: 'pendente' }
    }
  ],

  saques: [
  {
    valor: Number,
    data: { type: Date, default: Date.now },
    motivo: String,
    status: { type: String, enum: ['pendente', 'aprovado', 'rejeitado'], default: 'pendente' }
  }
],

  dataCriacao: { type: Date, default: Date.now }
});


module.exports = mongoose.model('User', userSchema);