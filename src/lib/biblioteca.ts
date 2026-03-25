// Simula o bd.json usando localStorage

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
}

export interface Livro {
  id: string;
  titulo: string;
  genero: string;
  autor: string;
  quantidade: number;
  qtdEmprestados: number;
}

export interface Emprestimo {
  id: string;
  usuarioId: string;
  livrosIds: string[];
  dataEmprestimo: string;
  dataDevolucao?: string;
  status: "ativo" | "concluído";
}

export interface BancoDeDados {
  usuarios: Usuario[];
  livros: Livro[];
  emprestimos: Emprestimo[];
}

const STORAGE_KEY = "bd_biblioteca";

function generateUUID(): string {
  return crypto.randomUUID();
}

function loadDB(): BancoDeDados {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  const initial: BancoDeDados = { usuarios: [], livros: [], emprestimos: [] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveDB(db: BancoDeDados) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// ========== USUÁRIOS ==========

export function criarUsuario(dados: { nome: string; email: string; telefone: string }): { success: boolean; message: string; usuario?: Usuario } {
  const { nome, email, telefone } = dados;

  if (!nome?.trim() || !email?.trim() || !telefone?.trim()) {
    return { success: false, message: "Campos obrigatórios: nome, email e telefone." };
  }

  const db = loadDB();

  if (db.usuarios.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return { success: false, message: "Já existe um usuário com este email." };
  }

  const usuario: Usuario = {
    id: generateUUID(),
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    telefone: telefone.trim(),
  };

  db.usuarios.push(usuario);
  saveDB(db);
  return { success: true, message: "Usuário cadastrado com sucesso!", usuario };
}

export function listarUsuarios(): Usuario[] {
  return loadDB().usuarios;
}

// ========== LIVROS ==========

export function criarLivro(dados: { titulo: string; genero: string; autor: string; quantidade: number }): { success: boolean; message: string; livro?: Livro } {
  const { titulo, genero, autor, quantidade } = dados;

  if (!titulo?.trim() || !genero?.trim() || !autor?.trim()) {
    return { success: false, message: "Campos obrigatórios: titulo, genero, autor e quantidade." };
  }

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return { success: false, message: "Quantidade deve ser um número inteiro positivo." };
  }

  const db = loadDB();

  const duplicado = db.livros.some(
    (l) => l.titulo.toLowerCase() === titulo.trim().toLowerCase() && l.autor.toLowerCase() === autor.trim().toLowerCase()
  );

  if (duplicado) {
    return { success: false, message: "Já existe um livro com este título e autor." };
  }

  const livro: Livro = {
    id: generateUUID(),
    titulo: titulo.trim(),
    genero: genero.trim(),
    autor: autor.trim(),
    quantidade,
    qtdEmprestados: 0,
  };

  db.livros.push(livro);
  saveDB(db);
  return { success: true, message: "Livro cadastrado com sucesso!", livro };
}

export function listarLivros(): Livro[] {
  return loadDB().livros;
}

// ========== EMPRÉSTIMOS ==========

export function realizarEmprestimo(dados: { usuarioId: string; livrosIds: string[]; dataEmprestimo: string }): { success: boolean; message: string } {
  const { usuarioId, livrosIds, dataEmprestimo } = dados;

  if (!usuarioId || !livrosIds?.length || !dataEmprestimo) {
    return { success: false, message: "Campos obrigatórios: usuarioId, livrosIds e dataEmprestimo." };
  }

  const db = loadDB();

  const usuario = db.usuarios.find((u) => u.id === usuarioId);
  if (!usuario) return { success: false, message: "Usuário não encontrado." };

  // Contar quantas unidades de cada livro estão sendo solicitadas
  const solicitados = livrosIds.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  for (const [livroId, qtd] of Object.entries(solicitados)) {
    const livro = db.livros.find((l) => l.id === livroId);
    if (!livro) return { success: false, message: `Livro com ID ${livroId} não encontrado.` };
    if (livro.quantidade < livro.qtdEmprestados + qtd) {
      return { success: false, message: `Livro "${livro.titulo}" não possui unidades suficientes disponíveis.` };
    }
  }

  // Incrementar qtdEmprestados
  for (const livroId of livrosIds) {
    const livro = db.livros.find((l) => l.id === livroId)!;
    livro.qtdEmprestados += 1;
  }

  const emprestimo: Emprestimo = {
    id: generateUUID(),
    usuarioId,
    livrosIds,
    dataEmprestimo,
    status: "ativo",
  };

  db.emprestimos.push(emprestimo);
  saveDB(db);
  return { success: true, message: "Empréstimo realizado com sucesso!" };
}

export function realizarDevolucao(dados: { emprestimoId: string; livrosIds: string[] }): { success: boolean; message: string } {
  const { emprestimoId, livrosIds } = dados;

  if (!emprestimoId || !livrosIds?.length) {
    return { success: false, message: "Campos obrigatórios: emprestimoId e livrosIds." };
  }

  const db = loadDB();

  const emprestimo = db.emprestimos.find((e) => e.id === emprestimoId);
  if (!emprestimo) return { success: false, message: "Empréstimo não encontrado." };
  if (emprestimo.status !== "ativo") return { success: false, message: "Este empréstimo já foi concluído." };

  // Copia dos livrosIds para manipular
  let livrosRestantes = [...emprestimo.livrosIds];
  const livrosDevolvidosSucesso: string[] = [];

  for (const livroId of livrosIds) {
    const index = livrosRestantes.indexOf(livroId);
    if (index === -1) {
      return { success: false, message: `O livro com ID ${livroId} não consta (ou já foi devolvido) neste empréstimo.` };
    }
    
    // Decrementar no banco global
    const livro = db.livros.find((l) => l.id === livroId);
    if (livro && livro.qtdEmprestados > 0) {
      livro.qtdEmprestados -= 1;
    }

    // Remover uma unidade deste livro da lista do empréstimo
    livrosRestantes.splice(index, 1);
    livrosDevolvidosSucesso.push(livroId);
  }

  // Atualizar a lista de livros que ainda estão com o usuário neste empréstimo
  emprestimo.livrosIds = livrosRestantes;

  if (emprestimo.livrosIds.length === 0) {
    emprestimo.status = "concluído";
    emprestimo.dataDevolucao = new Date().toISOString().split("T")[0];
  }

  saveDB(db);
  return { 
    success: true, 
    message: emprestimo.status === "concluído" 
      ? "Devolução completa! Empréstimo concluído." 
      : "Livros devolvidos parcialmente. Empréstimo ainda ativo." 
  };
}

export function listarEmprestimos(): Emprestimo[] {
  return loadDB().emprestimos;
}

export function getDB(): BancoDeDados {
  return loadDB();
}

export function resetDB() {
  localStorage.removeItem(STORAGE_KEY);
}
