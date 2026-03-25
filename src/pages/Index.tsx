import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FormUsuario } from "@/components/FormUsuario";
import { FormLivro } from "@/components/FormLivro";
import { FormEmprestimo } from "@/components/FormEmprestimo";
import { FormDevolucao } from "@/components/FormDevolucao";
import { listarUsuarios, listarLivros, listarEmprestimos } from "@/lib/biblioteca";

const Index = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const usuarios = listarUsuarios();
  const livros = listarLivros();
  const emprestimos = listarEmprestimos();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-5">
        <div className="mx-auto max-w-6xl">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Biblioteca</h1>
            <p className="text-sm text-muted-foreground">Gerencie usuários, livros, empréstimos e devoluções</p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="mx-auto max-w-6xl px-6 py-6" key={refreshKey}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-2xl font-bold text-foreground">{usuarios.length}</p>
                <p className="text-xs text-muted-foreground">Usuários</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-2xl font-bold text-foreground">{livros.length}</p>
                <p className="text-xs text-muted-foreground">Livros</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-2xl font-bold text-foreground">{emprestimos.filter((e) => e.status === "ativo").length}</p>
                <p className="text-xs text-muted-foreground">Empréstimos Ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-2xl font-bold text-foreground">{emprestimos.filter((e) => e.status === "concluído").length}</p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="usuarios" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="livros">Livros</TabsTrigger>
            <TabsTrigger value="emprestimos">Empréstimos</TabsTrigger>
            <TabsTrigger value="devolucoes">Devoluções</TabsTrigger>
          </TabsList>

          {/* USUÁRIOS */}
          <TabsContent value="usuarios">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">Novo Usuário</CardTitle></CardHeader>
                <CardContent><FormUsuario onSuccess={refresh} /></CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-lg">Usuários Cadastrados</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.length === 0 && (
                        <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Nenhum usuário cadastrado.</TableCell></TableRow>
                      )}
                      {usuarios.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.nome}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u.telefone}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* LIVROS */}
          <TabsContent value="livros">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">Novo Livro</CardTitle></CardHeader>
                <CardContent><FormLivro onSuccess={refresh} /></CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-lg">Livros Cadastrados</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Gênero</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Emprestados</TableHead>
                        <TableHead>Disponível</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {livros.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum livro cadastrado.</TableCell></TableRow>
                      )}
                      {livros.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="font-medium">{l.titulo}</TableCell>
                          <TableCell>{l.autor}</TableCell>
                          <TableCell>{l.genero}</TableCell>
                          <TableCell>{l.quantidade}</TableCell>
                          <TableCell>{l.qtdEmprestados}</TableCell>
                          <TableCell>
                            <Badge variant={l.quantidade > l.qtdEmprestados ? "default" : "destructive"}>
                              {l.quantidade - l.qtdEmprestados}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* EMPRÉSTIMOS */}
          <TabsContent value="emprestimos">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">Novo Empréstimo</CardTitle></CardHeader>
                <CardContent><FormEmprestimo onSuccess={refresh} /></CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-lg">Empréstimos</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Livros</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emprestimos.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum empréstimo registrado.</TableCell></TableRow>
                      )}
                      {emprestimos.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>{usuarios.find((u) => u.id === e.usuarioId)?.nome || "—"}</TableCell>
                          <TableCell className="text-sm">
                            {e.livrosIds.map((id) => livros.find((l) => l.id === id)?.titulo || id).join(", ")}
                          </TableCell>
                          <TableCell>{e.dataEmprestimo}</TableCell>
                          <TableCell>
                            <Badge variant={e.status === "ativo" ? "default" : "secondary"}>
                              {e.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DEVOLUÇÕES */}
          <TabsContent value="devolucoes">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">Registrar Devolução</CardTitle></CardHeader>
                <CardContent><FormDevolucao onSuccess={refresh} /></CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-lg">Empréstimos Ativos</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Livros</TableHead>
                        <TableHead>Data Empréstimo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emprestimos.filter((e) => e.status === "ativo").length === 0 && (
                        <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Nenhum empréstimo ativo.</TableCell></TableRow>
                      )}
                      {emprestimos.filter((e) => e.status === "ativo").map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>{usuarios.find((u) => u.id === e.usuarioId)?.nome || "—"}</TableCell>
                          <TableCell className="text-sm">
                            {e.livrosIds.map((id) => livros.find((l) => l.id === id)?.titulo || id).join(", ")}
                          </TableCell>
                          <TableCell>{e.dataEmprestimo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
