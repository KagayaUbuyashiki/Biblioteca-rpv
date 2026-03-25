import fs from "fs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "bd.json");

function getDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ usuarios: [], livros: [], emprestimos: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

function saveDB(db: any) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { nome, email, telefone } = req.body;

  if (!nome || !email || !telefone) {
    return res.status(400).json({ message: "Campos obrigatórios: nome, email e telefone." });
  }

  const db = getDB();

  if (db.usuarios.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ message: "Já existe um usuário com este email." });
  }

  const novoUsuario = {
    id: globalThis.crypto.randomUUID(),
    nome,
    email: email.toLowerCase(),
    telefone,
  };

  db.usuarios.push(novoUsuario);
  saveDB(db);

  return res.status(201).json(novoUsuario);
}
