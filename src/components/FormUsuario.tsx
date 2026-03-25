import { useState } from "react";
import { criarUsuario } from "@/lib/biblioteca";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function FormUsuario({ onSuccess }: { onSuccess: () => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = criarUsuario({ nome, email, telefone });
    if (result.success) {
      toast.success(result.message);
      setNome(""); setEmail(""); setTelefone("");
      onSuccess();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone *</Label>
        <Input id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" required />
      </div>
      <Button type="submit" className="w-full">Cadastrar Usuário</Button>
    </form>
  );
}
