import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateExercise } from "@/hooks/use-create-exercise";
import { useToast } from "@/hooks/use-toast";
import { CreateExerciseDto, ExerciseCategory } from "@/types/result";

const categoryOptions: { value: ExerciseCategory; label: string }[] = [
  { value: "WEIGHTLIFTING", label: "Levantamento de Peso" },
  { value: "GYMNASTICS", label: "Ginástica" },
  { value: "MONOSTRUCTURAL", label: "Cardio" },
  { value: "ACCESSORY", label: "Acessório" },
];

export function AdminExerciseForm() {
  const [formData, setFormData] = useState<CreateExerciseDto>({
    name: "",
    category: "WEIGHTLIFTING",
  });
  const { mutateAsync: createExercise, isPending } = useCreateExercise();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome do exercício.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createExercise(formData);
      toast({
        title: "Sucesso",
        description: "Exercício criado com sucesso!",
      });
      setFormData({
        name: "",
        category: "WEIGHTLIFTING",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao criar exercício";
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
          Novo Exercício
        </CardTitle>
        <CardDescription>Adicione um exercício customizado ao seu box</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="exercise-name">Nome do Exercício *</Label>
            <Input
              id="exercise-name"
              placeholder="Ex: Snatch, Front Squat, Burpee"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="exercise-category">Categoria *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  category: value as ExerciseCategory,
                }))
              }
            >
              <SelectTrigger id="exercise-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Criando..." : "Criar Exercício"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
