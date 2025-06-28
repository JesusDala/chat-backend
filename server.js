// Parte 3 – BACKEND CHATGPT-LIKE COMPLETO

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const modelo = genAI.getGenerativeModel({ model: "gemini-pro" });
const historicoPath = "./backend/historico.json";

// PERFIL PERSONALIZADO
const perfilUsuario = {
  nome: "Dala",
  estiloConversa: "engraçado, directo e com swag",
  objetivos: ["conquistar a miúda", "manter o interesse dela"],
  expressoesAngolanas: ["ya", "bué", "maninha", "tamos juntos", "tê bué de style"]
};

const lerHistorico = () => {
  try {
    return JSON.parse(fs.readFileSync(historicoPath));
  } catch {
    return [];
  }
};

const guardarHistorico = (mensagem) => {
  const historico = lerHistorico();
  historico.push(mensagem);
  fs.writeFileSync(historicoPath, JSON.stringify(historico.slice(-6), null, 2));
};

app.post("/responder", async (req, res) => {
  const input = req.body.mensagem;
  guardarHistorico({ de: "utilizador", texto: input });

  const prompt = `Tu és o ${perfilUsuario.nome}, um jovem angolano com estilo ${perfilUsuario.estiloConversa}. Usa expressões como: ${perfilUsuario.expressoesAngolanas.join(", ")}. Estás a conversar com uma miúda. Ela disse: "${input}". Responde de forma natural, espontânea e fluente.`;

  try {
    const result = await modelo.generateContent(prompt);
    const resposta = result.response.text().trim();
    guardarHistorico({ de: "ia", texto: resposta });
    res.json({ resposta });
  } catch (erro) {
    console.error("Erro ao responder:", erro);
    res.json({ resposta: "Desculpa maninha, deu bug aqui. Tenta outra vez 😓" });
  }
});

app.listen(5000, () => {
  console.log("✅ Servidor está rodando na porta 5000");
});
