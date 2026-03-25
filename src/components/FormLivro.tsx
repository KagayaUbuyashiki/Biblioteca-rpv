import { useState } from "react";
import { criarLivro } from "@/lib/biblioteca";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function FormLivro({ onSuccess }: { onSuccess: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [genero, setGenero] = useState("");
  const [autor, setAutor] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = criarLivro({ titulo, genero, autor, quantidade });
    if (result.success) {
      toast.success(result.message);
      setTitulo(""); setGenero(""); setAutor(""); setQuantidade(1);
      onSuccess();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="titulo">Título *</Label>
        <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título do livro" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="genero">Gênero *</Label>
        <Input id="genero" value={genero} onChange={(e) => setGenero(e.target.value)} placeholder="Ex: Ficção, Romance..." required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="autor">Autor *</Label>
        <Input id="autor" value={autor} onChange={(e) => setAutor(e.target.value)} placeholder="Nome do autor" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantidade">Quantidade *</Label>
        <Input id="quantidade" type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)} required />
      </div>
      <Button type="submit" className="w-full">Cadastrar Livro</Button>
    </form>
  );
}
