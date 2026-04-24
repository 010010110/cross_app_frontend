import { useEffect, useMemo, useState } from "react";
import { Building2, UsersRound, Search, Mail, MessageCircle, RefreshCw, UserPlus, Newspaper, Settings } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeedScreen } from "@/components/screens/FeedScreen";
import { AdminReportsPanel } from "@/components/reports/AdminReportsPanel";
import { AdminClassForm } from "@/components/AdminClassForm";
import { AdminExerciseForm } from "@/components/AdminExerciseForm";
import { AdminWodForm } from "@/components/AdminWodForm";
import { AdminCoachAssignmentsPanel } from "@/components/AdminCoachAssignmentsPanel";
import { useBoxesMine } from "@/hooks/use-boxes-mine";
import { useBoxCoaches } from "@/hooks/use-box-coaches";
import { useBoxStudents } from "@/hooks/use-box-students";
import { useEnrollStudent } from "@/hooks/use-enroll-student";
import { useRegisterCoach } from "@/hooks/use-register-coach";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminTab = "boxes" | "users" | "feed" | "operacoes";

const tabs: Array<{ id: AdminTab; label: string; icon: typeof Building2 }> = [
  { id: "boxes", label: "Boxes", icon: Building2 },
  { id: "users", label: "Pessoas", icon: UsersRound },
  { id: "operacoes", label: "Operações", icon: Settings },
  { id: "feed", label: "Feed", icon: Newspaper },
];

function normalizePhoneLink(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 15);
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("boxes");
  const [enrollmentToken, setEnrollmentToken] = useState("");
  const [coachForm, setCoachForm] = useState({
    name: "",
    email: "",
    password: "",
    contactPhone: "",
    whatsapp: "",
    address: "",
    socialInstagram: "",
    socialFacebook: "",
  });
  const [showCoachForm, setShowCoachForm] = useState(false);
  const [coachSuccessName, setCoachSuccessName] = useState<string | null>(null);
  const [coachSearchTerm, setCoachSearchTerm] = useState("");
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const { toast } = useToast();
  const { selectedBoxId, setSelectedBoxId } = useAuth();

  const {
    data: boxes = [],
    isLoading: boxesLoading,
    isError: boxesError,
  } = useBoxesMine(true);

  const effectiveBoxId = selectedBoxId ?? boxes[0]?._id ?? null;

  useEffect(() => {
    if (selectedBoxId || boxes.length === 0) return;
    setSelectedBoxId(boxes[0]._id);
  }, [selectedBoxId, boxes, setSelectedBoxId]);

  const {
    data: students = [],
    isLoading: studentsLoading,
    isError: studentsError,
    refetch: refetchStudents,
  } = useBoxStudents(effectiveBoxId, activeTab === "users");

  const {
    data: coaches = [],
    isLoading: coachesLoading,
    isError: coachesError,
    refetch: refetchCoaches,
  } = useBoxCoaches(effectiveBoxId, activeTab === "users");

  const { mutateAsync: enrollStudent, isPending: enrollPending } = useEnrollStudent();
  const { mutateAsync: registerCoach, isPending: coachRegisterPending } = useRegisterCoach();

  const activeBox = boxes.find((box) => box._id === effectiveBoxId) ?? null;

  const filteredStudents = useMemo(() => {
    const term = studentSearchTerm.trim().toLowerCase();
    if (!term) return students;

    return students.filter((student) => {
      const nameMatch = student.name.toLowerCase().includes(term);
      const emailMatch = student.email.toLowerCase().includes(term);
      const phoneMatch = (student.contactPhone ?? "").toLowerCase().includes(term);
      return nameMatch || emailMatch || phoneMatch;
    });
  }, [students, studentSearchTerm]);

  const selectedStudent = useMemo(
    () => filteredStudents.find((student) => student._id === selectedStudentId) ?? null,
    [filteredStudents, selectedStudentId]
  );

  const filteredCoaches = useMemo(() => {
    const term = coachSearchTerm.trim().toLowerCase();
    if (!term) return coaches;

    return coaches.filter((coach) => {
      const nameMatch = coach.name.toLowerCase().includes(term);
      const emailMatch = coach.email.toLowerCase().includes(term);
      const phoneMatch = (coach.contactPhone ?? "").toLowerCase().includes(term);
      return nameMatch || emailMatch || phoneMatch;
    });
  }, [coaches, coachSearchTerm]);

  const selectedCoach = useMemo(
    () => filteredCoaches.find((coach) => coach._id === selectedCoachId) ?? null,
    [filteredCoaches, selectedCoachId]
  );

  const handleEnrollByToken = async () => {
    const token = enrollmentToken.trim();

    if (!effectiveBoxId) {
      toast({
        title: "Selecione um box",
        description: "Escolha um box em foco antes de matricular um aluno.",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Token obrigatorio",
        description: "Informe o token de matricula gerado pelo aluno.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await enrollStudent({ boxId: effectiveBoxId, token });
      setEnrollmentToken("");
      await refetchStudents();
      toast({
        title: "Aluno matriculado",
        description: `${response.name} foi vinculado ao box com sucesso.`,
      });
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const message = (err as { message?: string | string[] })?.message;
      const description =
        typeof message === "string"
          ? message
          : status === 409
            ? "Aluno ja matriculado neste box."
            : status === 400
              ? "Token invalido, expirado ou ja utilizado."
              : "Nao foi possivel concluir a matricula agora.";

      toast({
        title: "Falha na matricula",
        description,
        variant: "destructive",
      });
    }
  };

  const handleCoachField = (field: keyof typeof coachForm, value: string) => {
    if (coachSuccessName) setCoachSuccessName(null);
    setCoachForm((current) => ({ ...current, [field]: value }));
  };

  const resetCoachForm = () => {
    setCoachForm({
      name: "",
      email: "",
      password: "",
      contactPhone: "",
      whatsapp: "",
      address: "",
      socialInstagram: "",
      socialFacebook: "",
    });
  };

  const handleRegisterCoach = async () => {
    if (!effectiveBoxId) {
      toast({
        title: "Selecione um box",
        description: "Escolha um box em foco antes de cadastrar um coach.",
        variant: "destructive",
      });
      return;
    }

    if (
      !coachForm.name.trim() ||
      !coachForm.email.trim() ||
      !coachForm.password.trim() ||
      !coachForm.contactPhone.trim() ||
      !coachForm.whatsapp.trim() ||
      !coachForm.address.trim()
    ) {
      toast({
        title: "Campos obrigatorios",
        description: "Preencha nome, email, senha, telefone, WhatsApp e endereco.",
        variant: "destructive",
      });
      return;
    }

    if (coachForm.password.trim().length < 8) {
      toast({
        title: "Senha invalida",
        description: "A senha do coach precisa ter no minimo 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      await registerCoach({
        name: coachForm.name.trim(),
        email: coachForm.email.trim(),
        password: coachForm.password,
        contactPhone: normalizePhoneDigits(coachForm.contactPhone),
        whatsapp: normalizePhoneDigits(coachForm.whatsapp),
        address: coachForm.address.trim(),
        socialInstagram: coachForm.socialInstagram.trim() || undefined,
        socialFacebook: coachForm.socialFacebook.trim() || undefined,
      });

      setCoachSuccessName(coachForm.name.trim());
      resetCoachForm();
      setShowCoachForm(false);
      await refetchCoaches();
      toast({
        title: "Coach cadastrado",
        description:
          "Cadastro enviado com sucesso. Se o backend nao aceitar role COACH neste endpoint, ajuste da API sera necessario.",
      });
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const message = (err as { message?: string | string[] })?.message;

      toast({
        title: "Falha ao cadastrar coach",
        description:
          typeof message === "string"
            ? message
            : status === 409
              ? "Ja existe usuario com este e-mail."
              : "Nao foi possivel cadastrar o coach neste momento.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5 animate-fade-in">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Painel administrativo</p>
            <h1 className="text-2xl font-bold tracking-tight">Cross App ADM</h1>
          </div>
          <UserMenu />
        </header>

        <Card className="glass-card border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Box em Foco</CardTitle>
          </CardHeader>
          <CardContent>
            {boxesLoading && (
              <p className="text-xs text-muted-foreground">Carregando...</p>
            )}

            {boxesError && (
              <p className="text-xs text-destructive">Erro ao carregar boxes</p>
            )}

            {!boxesLoading && !boxesError && boxes.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhum box disponível</p>
            )}

            {!boxesLoading && !boxesError && boxes.length > 0 && (
              <div className="space-y-1.5">
                {boxes.map((box) => (
                  <button
                    key={box._id}
                    type="button"
                    onClick={() => setSelectedBoxId(box._id)}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                      effectiveBoxId === box._id
                        ? "bg-primary text-primary-foreground font-medium"
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    )}
                  >
                    {box.name}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {activeTab === "boxes" && (
          <div className="space-y-3">
            {/* Admin Reports Panel */}
            <AdminReportsPanel selectedBoxId={effectiveBoxId} />
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-3">
            <Card className="glass-card border-border/60">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">Gestao de Coaches e Alunos</CardTitle>
                  <Badge variant="secondary">/users/coaches + /users/students</Badge>
                </div>
                <CardDescription>
                  Controle de vinculo com boxes, permissao de acesso e acompanhamento basico.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border/60 bg-secondary/40 px-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Coaches por box</p>
                    <Button
                      type="button"
                      size="icon"
                      variant={showCoachForm ? "default" : "outline"}
                      aria-label="Adicionar coach"
                      disabled={!effectiveBoxId || coachRegisterPending}
                      onClick={() => {
                        setCoachSuccessName(null);
                        setShowCoachForm((current) => !current);
                      }}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Cadastro e listagem de coaches do box selecionado.
                  </p>

                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full">
                      <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={coachSearchTerm}
                        onChange={(event) => setCoachSearchTerm(event.target.value)}
                        placeholder="Buscar coach por nome, email ou telefone"
                        className="pl-9"
                        disabled={!effectiveBoxId || coachesLoading}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!effectiveBoxId || coachesLoading}
                      onClick={() => void refetchCoaches()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar
                    </Button>
                  </div>

                  {coachesLoading && (
                    <p className="mt-2 text-sm text-muted-foreground">Carregando coaches do box...</p>
                  )}
                  {coachesError && (
                    <p className="mt-2 text-sm text-destructive">Nao foi possivel carregar os coaches.</p>
                  )}
                  {!coachesLoading && !coachesError && coaches.length === 0 && (
                    <p className="mt-2 text-sm text-muted-foreground">Nenhum coach cadastrado neste box.</p>
                  )}
                  {!coachesLoading && !coachesError && coaches.length > 0 && filteredCoaches.length === 0 && (
                    <p className="mt-2 text-sm text-muted-foreground">Nenhum coach corresponde ao filtro informado.</p>
                  )}
                  {!coachesLoading && !coachesError && filteredCoaches.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Exibindo {filteredCoaches.length} de {coaches.length} coaches
                      </p>
                      <div className="max-h-44 overflow-auto space-y-1.5 pr-1">
                        {filteredCoaches.map((coach) => (
                          <div
                            key={coach._id}
                            className={cn(
                              "cursor-pointer rounded-md border px-2 py-1.5 transition-colors",
                              selectedCoachId === coach._id
                                ? "border-primary bg-primary/10"
                                : "border-border/50 bg-background/60 hover:bg-secondary/30"
                            )}
                            onClick={() => setSelectedCoachId(coach._id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium">{coach.name}</p>
                                <p className="text-xs text-muted-foreground">{coach.email}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {coach.whatsapp && (
                                  <Button type="button" size="icon" variant="ghost" asChild className="h-7 w-7">
                                    <a
                                      href={`https://wa.me/${normalizePhoneLink(coach.whatsapp)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      aria-label={`WhatsApp de ${coach.name}`}
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                                <Button type="button" size="icon" variant="ghost" asChild className="h-7 w-7">
                                  <a href={`mailto:${coach.email}`} aria-label={`Email de ${coach.name}`}>
                                    <Mail className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCoach && (
                    <div className="mt-2 rounded-md border border-border/60 bg-secondary/30 p-3 space-y-2">
                      <p className="text-sm font-semibold">Coach selecionado</p>
                      <p className="text-sm text-muted-foreground">{selectedCoach.name}</p>

                      <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                        <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5">
                          <p className="font-medium text-foreground">E-mail</p>
                          <p>{selectedCoach.email}</p>
                        </div>
                        <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5">
                          <p className="font-medium text-foreground">Telefone</p>
                          <p>{selectedCoach.contactPhone ?? "Nao informado"}</p>
                        </div>
                        <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5">
                          <p className="font-medium text-foreground">WhatsApp</p>
                          <p>{selectedCoach.whatsapp ?? "Nao informado"}</p>
                        </div>
                        <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5">
                          <p className="font-medium text-foreground">Role</p>
                          <p>{selectedCoach.role}</p>
                        </div>
                      </div>

                      <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">Endereco</p>
                        <p>{selectedCoach.address ?? "Nao informado"}</p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                        <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5">
                          <p className="font-medium text-foreground">Instagram</p>
                          <p>{selectedCoach.socialInstagram ?? "Nao informado"}</p>
                        </div>
                        <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5">
                          <p className="font-medium text-foreground">Facebook</p>
                          <p className="break-all">{selectedCoach.socialFacebook ?? "Nao informado"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                        <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5">
                          <p className="font-medium text-foreground">Criado em</p>
                          <p>{new Date(selectedCoach.createdAt).toLocaleString("pt-BR")}</p>
                        </div>
                        <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5">
                          <p className="font-medium text-foreground">Boxes vinculados</p>
                          <p>{selectedCoach.boxIds.length}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!showCoachForm && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Clique no icone para abrir o formulario de cadastro de coach.
                      </p>
                      {coachSuccessName && (
                        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5">
                          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                            Coach {coachSuccessName} cadastrado com sucesso.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {showCoachForm && (
                    <>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Input
                          value={coachForm.name}
                          onChange={(event) => handleCoachField("name", event.target.value)}
                          placeholder="Nome do coach"
                          disabled={!effectiveBoxId || coachRegisterPending}
                        />
                        <Input
                          value={coachForm.email}
                          onChange={(event) => handleCoachField("email", event.target.value)}
                          placeholder="Email do coach"
                          type="email"
                          disabled={!effectiveBoxId || coachRegisterPending}
                        />
                        <Input
                          value={coachForm.password}
                          onChange={(event) => handleCoachField("password", event.target.value)}
                          placeholder="Senha inicial (min. 8)"
                          type="password"
                          disabled={!effectiveBoxId || coachRegisterPending}
                        />
                        <Input
                          value={coachForm.contactPhone}
                          onChange={(event) => handleCoachField("contactPhone", event.target.value)}
                          placeholder="Telefone"
                          disabled={!effectiveBoxId || coachRegisterPending}
                        />
                        <Input
                          value={coachForm.whatsapp}
                          onChange={(event) => handleCoachField("whatsapp", event.target.value)}
                          placeholder="WhatsApp"
                          disabled={!effectiveBoxId || coachRegisterPending}
                        />
                        <Input
                          value={coachForm.socialInstagram}
                          onChange={(event) => handleCoachField("socialInstagram", event.target.value)}
                          placeholder="Instagram (opcional)"
                          disabled={!effectiveBoxId || coachRegisterPending}
                        />
                      </div>

                      <div className="mt-2 grid grid-cols-1 gap-2">
                        <Input
                          value={coachForm.socialFacebook}
                          onChange={(event) => handleCoachField("socialFacebook", event.target.value)}
                          placeholder="Facebook/URL (opcional)"
                          disabled={!effectiveBoxId || coachRegisterPending}
                        />
                        <Input
                          value={coachForm.address}
                          onChange={(event) => handleCoachField("address", event.target.value)}
                          placeholder="Endereco completo"
                          disabled={!effectiveBoxId || coachRegisterPending}
                        />
                      </div>

                      <Button
                        type="button"
                        className="mt-2"
                        disabled={!effectiveBoxId || coachRegisterPending}
                        onClick={() => void handleRegisterCoach()}
                      >
                        {coachRegisterPending ? "Cadastrando coach..." : "Cadastrar coach"}
                      </Button>
                    </>
                  )}
                </div>
                <div className="rounded-lg border border-border/60 bg-secondary/40 px-3 py-3">
                  <p className="text-sm font-semibold">Alunos e matriculas</p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={enrollmentToken}
                      onChange={(event) => setEnrollmentToken(event.target.value)}
                      placeholder="Cole o token de matricula do aluno"
                      disabled={!effectiveBoxId || enrollPending}
                    />
                    <Button
                      type="button"
                      onClick={() => void handleEnrollByToken()}
                      disabled={!effectiveBoxId || enrollPending}
                      className="sm:w-auto"
                    >
                      {enrollPending ? "Matriculando..." : "Matricular por token"}
                    </Button>
                  </div>

                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full">
                      <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={studentSearchTerm}
                        onChange={(event) => setStudentSearchTerm(event.target.value)}
                        placeholder="Buscar aluno por nome, email ou telefone"
                        className="pl-9"
                        disabled={!effectiveBoxId || studentsLoading}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!effectiveBoxId || studentsLoading}
                      onClick={() => void refetchStudents()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar
                    </Button>
                  </div>

                  {studentsLoading && (
                    <p className="text-sm text-muted-foreground">Carregando alunos do box...</p>
                  )}
                  {studentsError && (
                    <p className="text-sm text-destructive">Nao foi possivel carregar os alunos.</p>
                  )}
                  {!studentsLoading && !studentsError && students.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum aluno cadastrado neste box.</p>
                  )}
                  {!studentsLoading && !studentsError && students.length > 0 && filteredStudents.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum aluno corresponde ao filtro informado.</p>
                  )}
                  {!studentsLoading && !studentsError && filteredStudents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Exibindo {filteredStudents.length} de {students.length} alunos
                      </p>
                      <div className="max-h-52 overflow-auto space-y-1.5 pr-1">
                        {filteredStudents.map((student) => (
                          <div
                            key={student._id}
                            className={cn(
                              "cursor-pointer rounded-md border px-2 py-1.5 transition-colors",
                              selectedStudentId === student._id
                                ? "border-primary bg-primary/10"
                                : "border-border/50 bg-background/60 hover:bg-secondary/30"
                            )}
                            onClick={() => setSelectedStudentId(student._id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.email}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {student.whatsapp && (
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    asChild
                                    className="h-7 w-7"
                                  >
                                    <a
                                      href={`https://wa.me/${normalizePhoneLink(student.whatsapp)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      aria-label={`WhatsApp de ${student.name}`}
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                                <Button type="button" size="icon" variant="ghost" asChild className="h-7 w-7">
                                  <a href={`mailto:${student.email}`} aria-label={`Email de ${student.name}`}>
                                    <Mail className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedStudent && (
                        <div className="rounded-md border border-border/60 bg-secondary/30 p-3 space-y-2">
                          <p className="text-sm font-semibold">Aluno selecionado</p>
                          <p className="text-sm text-muted-foreground">{selectedStudent.name}</p>

                          <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                            <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5">
                              <p className="font-medium text-foreground">E-mail</p>
                              <p>{selectedStudent.email}</p>
                            </div>
                            <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5">
                              <p className="font-medium text-foreground">Telefone</p>
                              <p>{selectedStudent.contactPhone ?? "Nao informado"}</p>
                            </div>
                            <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5">
                              <p className="font-medium text-foreground">WhatsApp</p>
                              <p>{selectedStudent.whatsapp ?? "Nao informado"}</p>
                            </div>
                            <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5">
                              <p className="font-medium text-foreground">Role</p>
                              <p>{selectedStudent.role}</p>
                            </div>
                          </div>

                          <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5 text-xs text-muted-foreground">
                            <p className="font-medium text-foreground">Endereco</p>
                            <p>{selectedStudent.address ?? "Nao informado"}</p>
                          </div>

                          <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                            <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5">
                              <p className="font-medium text-foreground">Instagram</p>
                              <p>{selectedStudent.socialInstagram ?? "Nao informado"}</p>
                            </div>
                            <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5">
                              <p className="font-medium text-foreground">Facebook</p>
                              <p className="break-all">{selectedStudent.socialFacebook ?? "Nao informado"}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                            <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5">
                              <p className="font-medium text-foreground">Criado em</p>
                              <p>{new Date(selectedStudent.createdAt).toLocaleString("pt-BR")}</p>
                            </div>
                            <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5">
                              <p className="font-medium text-foreground">Boxes vinculados</p>
                              <p>{selectedStudent.boxIds.length}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "operacoes" && (
          <div className="space-y-3">
            <AdminClassForm />
            <AdminExerciseForm />
            <AdminWodForm />
            <AdminCoachAssignmentsPanel selectedBoxId={effectiveBoxId} />
          </div>
        )}

        {activeTab === "feed" && (
          <div className="-mx-4 sm:mx-0">
            <FeedScreen />
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur safe-area-bottom">
        <div className="max-w-lg mx-auto grid grid-cols-4 px-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
