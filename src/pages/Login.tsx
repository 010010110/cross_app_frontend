import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLogin } from "@/hooks/use-login";
import { useRegisterBox } from "@/hooks/use-register-box";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ─── Schemas ────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120 caracteres"),
  cnpj: z
    .string()
    .regex(/^\d{14}$/, "CNPJ deve conter 14 dígitos numéricos"),
  geofenceRadius: z.coerce
    .number({ invalid_type_error: "Informe um número" })
    .min(1, "Mínimo 1m")
    .max(5000, "Máximo 5000m"),
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
type RegisterValues = z.infer<typeof registerSchema>;

// ─── Component ───────────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [geoLoading, setGeoLoading] = useState(false);

  const { mutate: doLogin, isPending: loginPending } = useLogin();
  const { mutate: doRegister, isPending: registerPending } = useRegisterBox();

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { geofenceRadius: 100 },
  });

  useEffect(() => {
    if (token) navigate("/", { replace: true });
  }, [token, navigate]);

  // ── Login submit ──
  const onLogin = (values: LoginValues) => {
    doLogin(values, {
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

  // ── Register submit ──
  const onRegister = (values: RegisterValues) => {
    doRegister(values, {
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

  const isPending = loginPending || registerPending;

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
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {mode === "register" && (
          <form
            onSubmit={registerForm.handleSubmit(onRegister)}
            className="glass-card p-6 space-y-4"
          >
            {/* Dados do Box */}
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Dados do Box
            </p>

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

            {/* Localização */}
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

            {/* Dados do Admin */}
            <Separator />
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
          </form>
        )}

        {/* Toggle */}
        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              Não tem conta?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-primary font-semibold hover:underline"
              >
                Cadastrar box
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-primary font-semibold hover:underline"
              >
                Fazer login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
