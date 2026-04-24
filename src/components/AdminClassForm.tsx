import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateClass } from "@/hooks/use-create-class";
import { useToast } from "@/hooks/use-toast";
import { CreateClassDto, ClassWeekday } from "@/types/class";

const weekdayOptions: { value: ClassWeekday; label: string }[] = [
  { value: "MONDAY", label: "Segunda" },
  { value: "TUESDAY", label: "Terça" },
  { value: "WEDNESDAY", label: "Quarta" },
  { value: "THURSDAY", label: "Quinta" },
  { value: "FRIDAY", label: "Sexta" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];

export function AdminClassForm() {
  const [formData, setFormData] = useState<CreateClassDto>({
    name: "",
    weekDays: [],
    startTime: "07:00",
    endTime: "08:00",
    checkinLimit: undefined,
  });
  const { mutateAsync: createClass, isPending } = useCreateClass();
  const { toast } = useToast();

  const handleToggleWeekday = (weekday: ClassWeekday) => {
    setFormData((prev) => ({
      ...prev,
      weekDays: prev.weekDays.includes(weekday)
        ? prev.weekDays.filter((d) => d !== weekday)
        : [...prev.weekDays, weekday],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome da aula.",
        variant: "destructive",
      });
      return;
    }

    if (formData.weekDays.length === 0) {
      toast({
        title: "Dias obrigatórios",
        description: "Selecione pelo menos um dia da semana.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createClass(formData);
      toast({
        title: "Sucesso",
        description: "Aula cadastrada com sucesso!",
      });
      setFormData({
        name: "",
        weekDays: [],
        startTime: "07:00",
        endTime: "08:00",
        checkinLimit: undefined,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao cadastrar aula";
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
          Nova Aula
        </CardTitle>
        <CardDescription>Cadastre uma aula recorrente no seu box</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="class-name">Nome da Aula *</Label>
            <Input
              id="class-name"
              placeholder="Ex: Turma das 7h"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div>
            <Label>Dias da Semana *</Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {weekdayOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggleWeekday(option.value)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    formData.weekDays.includes(option.value)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-accent"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Horário de Início *</Label>
              <Input
                id="start-time"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="end-time">Horário de Término *</Label>
              <Input
                id="end-time"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="checkin-limit">
              Limite de Check-ins (opcional)
            </Label>
            <Input
              id="checkin-limit"
              type="number"
              min="1"
              placeholder="Ex: 20"
              value={formData.checkinLimit || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  checkinLimit: e.target.value ? parseInt(e.target.value) : undefined,
                }))
              }
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Deixe vazio para ilimitado
            </p>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Cadastrando..." : "Cadastrar Aula"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
