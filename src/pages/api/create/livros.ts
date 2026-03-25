import fs from "fs";
import path from "path";
import { crypto } from "crypto";

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

  const { titulo, genero, autor, quantidade } = req.body;

  if (!titulo || !genero || !autor || quantidade === undefined) {
    return res.status(400).json({ message: "Campos obrigatórios: titulo, genero, autor e quantidade." });
  }

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return res.status(400).json({ message: "Quantidade deve ser um número inteiro positivo." });
  }

  const db = getDB();

  const duplicado = db.livros.some(
    (l: any) => l.titulo.toLowerCase() === titulo.toLowerCase() && l.autor.toLowerCase() === autor.toLowerCase()
  );

  if (duplicado) {
    return res.status(400).json({ message: "Já existe um livro com este título e autor." });
  }

  const novoLivro = {
    id: globalThis.crypto.randomUUID(),
    titulo,
    genero,
    autor,
    quantidade,
    qtdEmprestados: 0,
  };

  db.livros.push(novoLivro);
  saveDB(db);

  return res.status(201).json(novoLivro);
}
