import { useState } from "react";
import { Plus, Loader2, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateWod } from "@/hooks/use-create-wod";
import { useToast } from "@/hooks/use-toast";
import { CreateWodDto, WodBlockType, WodModel } from "@/types/wod";

const blockTypeOptions: { value: WodBlockType; label: string }[] = [
  { value: "WARMUP", label: "Aquecimento" },
  { value: "SKILL", label: "Técnica" },
  { value: "WOD", label: "WOD" },
  { value: "COOLDOWN", label: "Volta à Calma" },
];

const wodModelOptions: { value: WodModel; label: string }[] = [
  { value: "AMRAP", label: "AMRAP (As Many Rounds As Possible)" },
  { value: "EMOM", label: "EMOM (Every Minute on the Minute)" },
  { value: "FOR_TIME", label: "For Time" },
  { value: "TABATA", label: "Tabata" },
  { value: "RFT", label: "RFT (Rounds For Time)" },
  { value: "CHIPPER", label: "Chipper" },
  { value: "LADDER", label: "Ladder" },
  { value: "INTERVALS", label: "Intervals" },
  { value: "CUSTOM", label: "Customizado" },
];

interface WodBlock {
  id: string;
  type: WodBlockType;
  title: string;
  content: string;
}

export function AdminWodForm() {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [model, setModel] = useState<WodModel>("AMRAP");
  const [blocks, setBlocks] = useState<WodBlock[]>([]);
  const { mutateAsync: createWod, isPending } = useCreateWod();
  const { toast } = useToast();

  const addBlock = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "WARMUP",
        title: "",
        content: "",
      },
    ]);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const updateBlock = (id: string, field: string, value: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, [field]: value } : block
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast({
        title: "Data obrigatória",
        description: "Informe a data do WOD.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Informe o título do WOD.",
        variant: "destructive",
      });
      return;
    }

    if (blocks.length === 0) {
      toast({
        title: "Blocos obrigatórios",
        description: "Adicione pelo menos um bloco ao WOD.",
        variant: "destructive",
      });
      return;
    }

    const invalidBlock = blocks.find(
      (block) =>
        !block.title.trim() || !block.content.trim()
    );

    if (invalidBlock) {
      toast({
        title: "Bloco incompleto",
        description: "Todos os blocos devem ter título e conteúdo.",
        variant: "destructive",
      });
      return;
    }

    try {
      const wodData: CreateWodDto = {
        date,
        title,
        model,
        blocks: blocks.map(({ id, ...block }) => block),
      };

      await createWod(wodData);
      toast({
        title: "Sucesso",
        description: "WOD cadastrado com sucesso!",
      });
      
      setDate("");
      setTitle("");
      setModel("AMRAP");
      setBlocks([]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao cadastrar WOD";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Novo WOD
        </CardTitle>
        <CardDescription>Crie o WOD do dia para seu box</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="wod-date">Data *</Label>
              <Input
                id="wod-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="wod-model">Modelo *</Label>
              <Select value={model} onValueChange={(value) => setModel(value as WodModel)}>
                <SelectTrigger id="wod-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {wodModelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="wod-title">Título do WOD *</Label>
            <Input
              id="wod-title"
              placeholder="Ex: WOD de Quarta"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <Label>Blocos do WOD *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBlock}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Bloco
              </Button>
            </div>

            <div className="space-y-4">
              {blocks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhum bloco adicionado. Clique em "Adicionar Bloco" para começar.
                  </p>
                </div>
              ) : (
                blocks.map((block, index) => (
                  <Card key={block.id} className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">
                            Bloco {index + 1}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor={`block-type-${block.id}`}>Tipo</Label>
                            <Select
                              value={block.type}
                              onValueChange={(value) =>
                                updateBlock(block.id, "type", value)
                              }
                            >
                              <SelectTrigger id={`block-type-${block.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {blockTypeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor={`block-title-${block.id}`}>Título</Label>
                            <Input
                              id={`block-title-${block.id}`}
                              placeholder="Ex: Warm-up geral"
                              value={block.title}
                              onChange={(e) =>
                                updateBlock(block.id, "title", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`block-content-${block.id}`}>Conteúdo</Label>
                          <Textarea
                            id={`block-content-${block.id}`}
                            placeholder="Ex: 3 rounds: 20 air squats, 10 inchworms, 200m run"
                            value={block.content}
                            onChange={(e) =>
                              updateBlock(block.id, "content", e.target.value)
                            }
                            rows={4}
                          />
                        </div>

                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeBlock(block.id)}
                          className="w-full"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remover Bloco
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Cadastrando..." : "Cadastrar WOD"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
