import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, MapPin, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLogin } from "@/hooks/use-login";
import { useRegisterBox } from "@/hooks/use-register-box";
import { useRegisterStudent } from "@/hooks/use-register-student";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LoginDto, RegisterUserDto } from "@/types/auth";
import { RegisterBoxDto } from "@/types/box";

// ─── Schemas ────────────────────────────────────────────────────────────────

function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 13);
}

function formatPhoneInput(value: string): string {
  const digits = normalizePhoneDigits(value);

  if (!digits) return "";

  if (digits.length > 11) {
    const country = digits.slice(0, 2);
    const areaCode = digits.slice(2, 4);
    const localNumber = digits.slice(4);

    if (localNumber.length <= 4) return `+${country} (${areaCode}) ${localNumber}`;
    if (localNumber.length <= 8) {
      return `+${country} (${areaCode}) ${localNumber.slice(0, 4)}-${localNumber.slice(4)}`;
    }

    return `+${country} (${areaCode}) ${localNumber.slice(0, 5)}-${localNumber.slice(5)}`;
  }

  const areaCode = digits.slice(0, 2);
  const localNumber = digits.slice(2);

  if (localNumber.length <= 4) return `(${areaCode}) ${localNumber}`;
  if (localNumber.length <= 8) {
    return `(${areaCode}) ${localNumber.slice(0, 4)}-${localNumber.slice(4)}`;
  }

  return `(${areaCode}) ${localNumber.slice(0, 5)}-${localNumber.slice(5)}`;
}

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

const phoneSchema = z.preprocess(
  (value) => (typeof value === "string" ? normalizePhoneDigits(value) : value),
  z.string().regex(/^\d{10,15}$/, "Use DDD + número ou inclua o código do país")
);

const optionalInstagramSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().regex(/^@?[a-zA-Z0-9._]{2,30}$/, "Instagram inválido").optional()
);

const optionalUrlSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().url("Informe uma URL válida").optional()
);

const registerStudentSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  contactPhone: phoneSchema,
  whatsapp: phoneSchema,
  address: z.string().min(10, "Mínimo 10 caracteres").max(240, "Máximo 240 caracteres"),
  socialInstagram: optionalInstagramSchema,
  socialFacebook: optionalUrlSchema,
});

const registerSchema = z.object({
  parentBoxId: z
    .string()
    .trim()
    .refine((value) => !value || /^[a-fA-F0-9]{24}$/.test(value), {
      message: "ID do box pai inválido",
    })
    .optional(),
  name: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120 caracteres"),
  cnpj: z
    .string()
    .regex(/^\d{14}$/, "CNPJ deve conter 14 dígitos numéricos"),
  geofenceRadius: z.coerce
    .number({ invalid_type_error: "Informe um número" })
    .min(1, "Mínimo 1m")
    .max(5000, "Máximo 5000m"),
  contactPhone: phoneSchema,
  contactEmail: z.string().email("E-mail inválido"),
  contactWhatsapp: phoneSchema,
  contactInstagram: z.string().regex(/^@?[a-zA-Z0-9._]{2,30}$/, "Instagram inválido"),
  contactWebsite: z.string().url("Informe uma URL válida"),
  address: z.string().min(10, "Mínimo 10 caracteres").max(240, "Máximo 240 caracteres"),
  latitude: z.coerce
    .number({ invalid_type_error: "Informe a latitude" })
    .min(-90)
    .max(90),
  longitude: z.coerce
    .number({ invalid_type_error: "Informe a longitude" })
    .min(-180)
    .max(180),
  adminName: z.string().min(2, "Mínimo 2 caracteres").max(120),
  adminEmail: z.string().email("E-mail inválido"),
  adminPassword: z.string().min(8, "Mínimo 8 caracteres"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterStudentValues = z.infer<typeof registerStudentSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

// ─── Component ───────────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "register-student" | "register-box">("login");
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [boxStep, setBoxStep] = useState<1 | 2>(1);
  const [geoLoading, setGeoLoading] = useState(false);

  const { mutate: doLogin, isPending: loginPending } = useLogin();
  const { mutate: doStudentRegister, isPending: studentRegisterPending } = useRegisterStudent();
  const { mutate: doRegister, isPending: registerPending } = useRegisterBox();

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const registerStudentForm = useForm<RegisterStudentValues>({
    resolver: zodResolver(registerStudentSchema),
  });
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      geofenceRadius: 100,
      parentBoxId: "",
      contactPhone: "",
      contactEmail: "",
      contactWhatsapp: "",
      contactInstagram: "",
      contactWebsite: "",
      address: "",
    },
  });

  useEffect(() => {
    if (token) navigate("/", { replace: true });
  }, [token, navigate]);

  // ── Login submit ──
  const onLogin = (values: LoginValues) => {
    const payload: LoginDto = {
      email: values.email!,
      password: values.password!,
    };

    doLogin(payload, {
      onSuccess: () => navigate("/", { replace: true }),
      onError: (err: unknown) => {
        const status = (err as { status?: number })?.status;
        toast({
          title: status === 401 ? "Credenciais inválidas" : "Erro ao fazer login",
          description:
            status === 401
              ? "Verifique seu e-mail e senha."
              : "Tente novamente em alguns instantes.",
          variant: "destructive",
        });
      },
    });
  };

  // ── Student register submit ──
  const onStudentRegister = (values: RegisterStudentValues) => {
    const payload: RegisterUserDto = {
      name: values.name!,
      email: values.email!,
      password: values.password!,
      contactPhone: normalizePhoneDigits(values.contactPhone!),
      whatsapp: normalizePhoneDigits(values.whatsapp!),
      address: values.address!,
      socialInstagram: values.socialInstagram,
      socialFacebook: values.socialFacebook,
    };

    doStudentRegister(payload, {
      onSuccess: () => navigate("/", { replace: true }),
      onError: (err: unknown) => {
        const status = (err as { status?: number })?.status;
        const message = (err as { message?: string | string[] })?.message;
        toast({
          title: status === 409 ? "E-mail já cadastrado" : "Erro ao criar conta",
          description:
            typeof message === "string"
              ? message
              : "Verifique os dados e tente novamente.",
          variant: "destructive",
        });
      },
    });
  };

  // ── Register submit ──
  const onRegister = (values: RegisterValues) => {
    const payload: RegisterBoxDto = {
      name: values.name!,
      cnpj: values.cnpj!,
      geofenceRadius: values.geofenceRadius!,
      contactPhone: normalizePhoneDigits(values.contactPhone!),
      contactEmail: values.contactEmail!,
      contactWhatsapp: normalizePhoneDigits(values.contactWhatsapp!),
      contactInstagram: values.contactInstagram!,
      contactWebsite: values.contactWebsite!,
      address: values.address!,
      latitude: values.latitude!,
      longitude: values.longitude!,
      adminName: values.adminName!,
      adminEmail: values.adminEmail!,
      adminPassword: values.adminPassword!,
      parentBoxId: values.parentBoxId?.trim() || undefined,
    };

    doRegister(payload, {
      onSuccess: () => navigate("/", { replace: true }),
      onError: (err: unknown) => {
        const status = (err as { status?: number })?.status;
        const message = (err as { message?: string })?.message;
        toast({
          title: status === 400 ? "Dados inválidos" : "Erro no cadastro",
          description:
            typeof message === "string"
              ? message
              : "Verifique os dados e tente novamente.",
          variant: "destructive",
        });
      },
    });
  };

  const goToLogin = () => {
    setMode("login");
    setBoxStep(1);
  };

  const openRegisterStudent = () => {
    setRegisterModalOpen(false);
    setMode("register-student");
  };

  const openRegisterBox = () => {
    setRegisterModalOpen(false);
    setBoxStep(1);
    setMode("register-box");
  };

  const goToBoxStepTwo = async () => {
    const valid = await registerForm.trigger([
      "parentBoxId",
      "name",
      "cnpj",
      "geofenceRadius",
      "contactPhone",
      "contactEmail",
      "contactWhatsapp",
      "contactInstagram",
      "contactWebsite",
      "address",
      "latitude",
      "longitude",
    ]);
    if (!valid) return;
    setBoxStep(2);
  };

  // ── Geolocation ──
  const fillLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalização indisponível",
        description: "Informe latitude e longitude manualmente.",
        variant: "destructive",
      });
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        registerForm.setValue("latitude", parseFloat(coords.latitude.toFixed(6)));
        registerForm.setValue("longitude", parseFloat(coords.longitude.toFixed(6)));
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
        toast({
          title: "Não foi possível obter localização",
          description: "Informe latitude e longitude manualmente.",
          variant: "destructive",
        });
      },
      { timeout: 10000 }
    );
  };

  const isPending = loginPending || studentRegisterPending || registerPending;

  // ── Field error helper ──
  const Err = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs text-destructive mt-1">{msg}</p> : null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
            <Zap className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Cross App</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login"
              ? "Entre para acompanhar sua evolução"
              : mode === "register-student"
                ? "Crie sua conta de aluno"
                : "Cadastre seu box e comece agora"}
          </p>
        </div>

        {/* ── LOGIN FORM ── */}
        {mode === "login" && (
          <form
            onSubmit={loginForm.handleSubmit(onLogin)}
            className="glass-card p-6 space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                {...loginForm.register("email")}
              />
              <Err msg={loginForm.formState.errors.email?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...loginForm.register("password")}
              />
              <Err msg={loginForm.formState.errors.password?.message} />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 font-bold text-base rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loginPending ? "Entrando..." : "Entrar"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={() => setRegisterModalOpen(true)}
            >
              Criar conta
            </Button>
          </form>
        )}

        {/* ── STUDENT REGISTER FORM ── */}
        {mode === "register-student" && (
          <form onSubmit={registerStudentForm.handleSubmit(onStudentRegister)} className="glass-card p-6 space-y-4">
            <button
              type="button"
              onClick={goToLogin}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>

            <div className="space-y-1.5">
              <Label htmlFor="studentName">Nome</Label>
              <Input
                id="studentName"
                autoComplete="name"
                placeholder="João Aluno"
                {...registerStudentForm.register("name")}
              />
              <Err msg={registerStudentForm.formState.errors.name?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studentEmail">E-mail</Label>
              <Input
                id="studentEmail"
                type="email"
                autoComplete="email"
                placeholder="voce@email.com"
                {...registerStudentForm.register("email")}
              />
              <Err msg={registerStudentForm.formState.errors.email?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studentPassword">Senha</Label>
              <Input
                id="studentPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...registerStudentForm.register("password")}
              />
              <Err msg={registerStudentForm.formState.errors.password?.message} />
            </div>

            <Separator />
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contato</p>

            <div className="space-y-1.5">
              <Label htmlFor="studentContactPhone">Telefone de contato</Label>
              <Input
                id="studentContactPhone"
                type="tel"
                inputMode="tel"
                placeholder="+5543999998888"
                {...registerStudentForm.register("contactPhone", {
                  onChange: (event) => {
                    event.target.value = formatPhoneInput(event.target.value);
                  },
                })}
              />
              <Err msg={registerStudentForm.formState.errors.contactPhone?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studentWhatsapp">WhatsApp</Label>
              <Input
                id="studentWhatsapp"
                type="tel"
                inputMode="tel"
                placeholder="+5543988887777"
                {...registerStudentForm.register("whatsapp", {
                  onChange: (event) => {
                    event.target.value = formatPhoneInput(event.target.value);
                  },
                })}
              />
              <Err msg={registerStudentForm.formState.errors.whatsapp?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studentAddress">Endereço</Label>
              <Textarea
                id="studentAddress"
                placeholder="Rua, número, bairro, cidade e estado"
                {...registerStudentForm.register("address")}
              />
              <Err msg={registerStudentForm.formState.errors.address?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studentInstagram">Instagram (opcional)</Label>
              <Input
                id="studentInstagram"
                placeholder="@joaoatleta"
                {...registerStudentForm.register("socialInstagram")}
              />
              <Err msg={registerStudentForm.formState.errors.socialInstagram?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studentFacebook">Facebook ou link social (opcional)</Label>
              <Input
                id="studentFacebook"
                type="url"
                placeholder="https://facebook.com/joao.aluno"
                {...registerStudentForm.register("socialFacebook")}
              />
              <Err msg={registerStudentForm.formState.errors.socialFacebook?.message} />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 font-bold text-base rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {studentRegisterPending ? "Criando conta..." : "Cadastrar Aluno"}
            </Button>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {mode === "register-box" && (
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (boxStep === 2) {
                    setBoxStep(1);
                    return;
                  }
                  goToLogin();
                }}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
              <span className="text-xs font-semibold text-muted-foreground">Etapa {boxStep} de 2</span>
            </div>

            {boxStep === 1 && (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dados do Box</p>

                <div className="space-y-1.5">
                  <Label htmlFor="parentBoxId">ID do box pai (opcional)</Label>
                  <Input
                    id="parentBoxId"
                    placeholder="67ea76a5ac5d89c8bb9d2111"
                    {...registerForm.register("parentBoxId")}
                  />
                  <Err msg={registerForm.formState.errors.parentBoxId?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="name">Nome do box</Label>
                  <Input id="name" placeholder="Cross Box Alpha" {...registerForm.register("name")} />
                  <Err msg={registerForm.formState.errors.name?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cnpj">CNPJ (somente números)</Label>
                  <Input
                    id="cnpj"
                    placeholder="12345678000199"
                    maxLength={14}
                    inputMode="numeric"
                    {...registerForm.register("cnpj")}
                  />
                  <Err msg={registerForm.formState.errors.cnpj?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="geofenceRadius">Raio do geofence (metros)</Label>
                  <Input
                    id="geofenceRadius"
                    inputMode="numeric"
                    placeholder="100"
                    {...registerForm.register("geofenceRadius")}
                  />
                  <Err msg={registerForm.formState.errors.geofenceRadius?.message} />
                </div>

                <Separator />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contato do Box</p>

                <div className="space-y-1.5">
                  <Label htmlFor="contactPhone">Telefone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    inputMode="tel"
                    placeholder="+5543999998888"
                    {...registerForm.register("contactPhone", {
                      onChange: (event) => {
                        event.target.value = formatPhoneInput(event.target.value);
                      },
                    })}
                  />
                  <Err msg={registerForm.formState.errors.contactPhone?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contactEmail">E-mail de contato</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="contato@crossboxalpha.com.br"
                    {...registerForm.register("contactEmail")}
                  />
                  <Err msg={registerForm.formState.errors.contactEmail?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contactWhatsapp">WhatsApp</Label>
                  <Input
                    id="contactWhatsapp"
                    type="tel"
                    inputMode="tel"
                    placeholder="+5543988887777"
                    {...registerForm.register("contactWhatsapp", {
                      onChange: (event) => {
                        event.target.value = formatPhoneInput(event.target.value);
                      },
                    })}
                  />
                  <Err msg={registerForm.formState.errors.contactWhatsapp?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contactInstagram">Instagram</Label>
                  <Input
                    id="contactInstagram"
                    placeholder="@crossboxalpha"
                    {...registerForm.register("contactInstagram")}
                  />
                  <Err msg={registerForm.formState.errors.contactInstagram?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contactWebsite">Website</Label>
                  <Input
                    id="contactWebsite"
                    type="url"
                    placeholder="https://crossboxalpha.com.br"
                    {...registerForm.register("contactWebsite")}
                  />
                  <Err msg={registerForm.formState.errors.contactWebsite?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea
                    id="address"
                    placeholder="Rua, número, bairro, cidade e estado"
                    {...registerForm.register("address")}
                  />
                  <Err msg={registerForm.formState.errors.address?.message} />
                </div>

                <Separator />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Localização do Box
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={geoLoading}
                  onClick={fillLocation}
                  className="w-full"
                >
                  {geoLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2" />
                  )}
                  {geoLoading ? "Obtendo localização..." : "Usar minha localização atual"}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      inputMode="decimal"
                      placeholder="-23.5645"
                      {...registerForm.register("latitude")}
                    />
                    <Err msg={registerForm.formState.errors.latitude?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      inputMode="decimal"
                      placeholder="-46.6528"
                      {...registerForm.register("longitude")}
                    />
                    <Err msg={registerForm.formState.errors.longitude?.message} />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={goToBoxStepTwo}
                  disabled={isPending}
                  className="w-full h-12 font-bold text-base rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Continuar
                </Button>
              </>
            )}

            {boxStep === 2 && (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Dados do Administrador
                </p>

                <div className="space-y-1.5">
                  <Label htmlFor="adminName">Seu nome</Label>
                  <Input id="adminName" placeholder="Ana Admin" {...registerForm.register("adminName")} />
                  <Err msg={registerForm.formState.errors.adminName?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="adminEmail">Seu e-mail</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@box.com"
                    {...registerForm.register("adminEmail")}
                  />
                  <Err msg={registerForm.formState.errors.adminEmail?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="adminPassword">Senha</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...registerForm.register("adminPassword")}
                  />
                  <Err msg={registerForm.formState.errors.adminPassword?.message} />
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-12 font-bold text-base rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {registerPending ? "Cadastrando..." : "Cadastrar Box"}
                </Button>
              </>
            )}
          </form>
        )}

        <Dialog open={registerModalOpen} onOpenChange={setRegisterModalOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Escolha o tipo de cadastro</DialogTitle>
              <DialogDescription>
                Selecione como você quer usar o Cross App.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Button type="button" onClick={openRegisterStudent} className="w-full h-12 font-semibold">
                Cadastrar Aluno
              </Button>

              <Button type="button" variant="outline" onClick={openRegisterBox} className="w-full h-12 font-semibold">
                Cadastrar Box
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
