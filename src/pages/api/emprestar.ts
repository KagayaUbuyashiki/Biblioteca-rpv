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

  const { usuarioId, livrosIds, dataEmprestimo } = req.body;

  if (!usuarioId || !livrosIds?.length || !dataEmprestimo) {
    return res.status(400).json({ message: "Campos obrigatórios: usuarioId, livrosIds e dataEmprestimo." });
  }

  const db = getDB();

  const usuario = db.usuarios.find((u: any) => u.id === usuarioId);
  if (!usuario) return res.status(404).json({ message: "Usuário não encontrado." });

  const solicitados = livrosIds.reduce((acc: any, id: string) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  for (const [livroId, qtd] of Object.entries(solicitados)) {
    const libro = db.livros.find((l: any) => l.id === livroId);
    if (!libro) return res.status(404).json({ message: `Livro com ID ${livroId} não encontrado.` });
    if (libro.quantidade < libro.qtdEmprestados + (qtd as number)) {
      return res.status(400).json({ message: `Livro "${libro.titulo}" não possui unidades suficientes disponíveis.` });
    }
  }

  // Incrementar qtdEmprestados
  for (const livroId of livrosIds) {
    const libro = db.livros.find((l: any) => l.id === livroId)!;
    libro.qtdEmprestados += 1;
  }

  const novoEmprestimo = {
    id: globalThis.crypto.randomUUID(),
    usuarioId,
    livrosIds,
    dataEmprestimo,
    status: "ativo",
  };

  db.emprestimos.push(novoEmprestimo);
  saveDB(db);

  return res.status(201).json(novoEmprestimo);
}
