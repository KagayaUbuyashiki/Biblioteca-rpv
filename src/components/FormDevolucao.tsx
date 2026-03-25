import { useState } from "react";
import { listarEmprestimos, listarLivros, realizarDevolucao } from "@/lib/biblioteca";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { listarUsuarios } from "@/lib/biblioteca";

export function FormDevolucao({ onSuccess }: { onSuccess: () => void }) {
  const [emprestimoId, setEmprestimoId] = useState("");
  const [indicesSelecionados, setIndicesSelecionados] = useState<number[]>([]);

  const emprestimos = listarEmprestimos().filter((e) => e.status === "ativo");
  const livros = listarLivros();
  const usuarios = listarUsuarios();

  const emprestimoSelecionado = emprestimos.find((e) => e.id === emprestimoId);

  const toggleIndice = (index: number) => {
    setIndicesSelecionados((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const getNomeLivro = (id: string) => livros.find((l) => l.id === id)?.titulo || id;
  const getNomeUsuario = (id: string) => usuarios.find((u) => u.id === id)?.nome || id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emprestimoSelecionado) return;

    const livrosIds = indicesSelecionados.map(idx => emprestimoSelecionado.livrosIds[idx]);
    
    const result = realizarDevolucao({ emprestimoId, livrosIds });
    if (result.success) {
      toast.success(result.message);
      setEmprestimoId(""); setIndicesSelecionados([]);
      onSuccess();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Empréstimo Ativo *</Label>
        <Select value={emprestimoId} onValueChange={(v) => { setEmprestimoId(v); setIndicesSelecionados([]); }}>
          <SelectTrigger><SelectValue placeholder="Selecione um empréstimo" /></SelectTrigger>
          <SelectContent>
            {emprestimos.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {getNomeUsuario(e.usuarioId)} — {e.dataEmprestimo} ({e.livrosIds.length} livro(s))
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {emprestimoSelecionado && (
        <div className="space-y-2">
          <Label>Livros para Devolver *</Label>
          <div className="space-y-2 rounded-md border border-border p-3">
            {emprestimoSelecionado.livrosIds.map((id, index) => (
              <label key={`${id}-${index}`} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={indicesSelecionados.includes(index)}
                  onCheckedChange={() => toggleIndice(index)}
                />
                {getNomeLivro(id)}
              </label>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={!emprestimoId || indicesSelecionados.length === 0}>
        Realizar Devolução
      </Button>
    </form>
  );
}
