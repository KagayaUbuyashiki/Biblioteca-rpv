import { useState } from "react";
import { listarUsuarios, listarLivros, realizarEmprestimo } from "@/lib/biblioteca";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function FormEmprestimo({ onSuccess }: { onSuccess: () => void }) {
  const [usuarioId, setUsuarioId] = useState("");
  const [livrosSelecionados, setLivrosSelecionados] = useState<string[]>([]);
  const [dataEmprestimo, setDataEmprestimo] = useState(new Date().toISOString().split("T")[0]);

  const usuarios = listarUsuarios();
  const livros = listarLivros();

  const toggleLivro = (id: string) => {
    setLivrosSelecionados((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = realizarEmprestimo({ usuarioId, livrosIds: livrosSelecionados, dataEmprestimo });
    if (result.success) {
      toast.success(result.message);
      setUsuarioId(""); setLivrosSelecionados([]);
      onSuccess();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Usuário *</Label>
        <Select value={usuarioId} onValueChange={setUsuarioId}>
          <SelectTrigger><SelectValue placeholder="Selecione um usuário" /></SelectTrigger>
          <SelectContent>
            {usuarios.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.nome} ({u.email})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Data do Empréstimo *</Label>
        <Input type="date" value={dataEmprestimo} onChange={(e) => setDataEmprestimo(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Livros Disponíveis *</Label>
        <div className="max-h-48 overflow-y-auto space-y-2 rounded-md border border-border p-3">
          {livros.length === 0 && <p className="text-sm text-muted-foreground">Nenhum livro cadastrado.</p>}
          {livros.map((l) => {
            const disponivel = l.quantidade > l.qtdEmprestados;
            return (
              <label key={l.id} className={`flex items-center gap-2 text-sm ${!disponivel ? "opacity-40" : ""}`}>
                <Checkbox
                  checked={livrosSelecionados.includes(l.id)}
                  onCheckedChange={() => toggleLivro(l.id)}
                  disabled={!disponivel && !livrosSelecionados.includes(l.id)}
                />
                {l.titulo} — {l.autor}
                <span className="ml-auto text-xs text-muted-foreground">
                  ({l.quantidade - l.qtdEmprestados} disp.)
                </span>
              </label>
            );
          })}
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={!usuarioId || livrosSelecionados.length === 0}>
        Realizar Empréstimo
      </Button>
    </form>
  );
}
