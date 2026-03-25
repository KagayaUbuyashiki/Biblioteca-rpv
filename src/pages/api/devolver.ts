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

  const { emprestimoId, livrosIds } = req.body;

  if (!emprestimoId || !livrosIds?.length) {
    return res.status(400).json({ message: "Campos obrigatórios: emprestimoId e livrosIds." });
  }

  const db = getDB();

  const emprestimo = db.emprestimos.find((e: any) => e.id === emprestimoId);
  if (!emprestimo) return res.status(404).json({ message: "Empréstimo não encontrado." });
  if (emprestimo.status !== "ativo") return res.status(400).json({ message: "Este empréstimo já foi concluído." });

  // Copia dos livrosIds para manipular
  let livrosRestantes = [...emprestimo.livrosIds];

  for (const livroId of livrosIds) {
    const index = livrosRestantes.indexOf(livroId);
    if (index === -1) {
      return res.status(400).json({ message: `O livro com ID ${livroId} não consta (ou já foi devolvido) neste empréstimo.` });
    }
    
    // Decrementar no banco global
    const livro = db.livros.find((l: any) => l.id === livroId);
    if (livro && livro.qtdEmprestados > 0) {
      livro.qtdEmprestados -= 1;
    }

    // Remover uma unidade deste livro da lista do empréstimo
    livrosRestantes.splice(index, 1);
  }

  // Atualizar a lista de livros que ainda estão com o usuário neste empréstimo
  emprestimo.livrosIds = livrosRestantes;

  if (emprestimo.livrosIds.length === 0) {
    emprestimo.status = "concluído";
    emprestimo.dataDevolucao = new Date().toISOString().split("T")[0];
  }

  saveDB(db);

  return res.status(200).json({ 
    message: emprestimo.status === "concluído" 
      ? "Devolução completa! Empréstimo concluído." 
      : "Livros devolvidos parcialmente. Empréstimo ainda ativo.",
    emprestimo
  });
}
