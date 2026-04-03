import { Copy, Check, Lightbulb, Clock3, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface EnrollmentTokenDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
  boxName: string;
  expiresAt: string;
  onTokenExpired: () => void | Promise<void>;
  isRefreshingToken?: boolean;
}

export function EnrollmentTokenDialog({
  isOpen,
  onOpenChange,
  token,
  boxName,
  expiresAt,
  onTokenExpired,
  isRefreshingToken = false,
}: EnrollmentTokenDialogProps) {
  const [copied, setCopied] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const lastExpiredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen || !expiresAt) return;

    const calculateRemaining = () => {
      const expiresAtMs = new Date(expiresAt).getTime();
      return Math.max(0, expiresAtMs - Date.now());
    };

    setRemainingMs(calculateRemaining());

    const intervalId = window.setInterval(() => {
      setRemainingMs(calculateRemaining());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isOpen, expiresAt]);

  useEffect(() => {
    if (!isOpen) return;
    if (remainingMs > 0) {
      lastExpiredTokenRef.current = null;
      return;
    }

    if (!expiresAt || lastExpiredTokenRef.current === expiresAt) return;
    lastExpiredTokenRef.current = expiresAt;
    void onTokenExpired();
  }, [isOpen, remainingMs, expiresAt, onTokenExpired]);

  const countdownLabel = useMemo(() => {
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [remainingMs]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Token de Matrícula</DialogTitle>
          <DialogDescription>
            Compartilhe este token com o administrador do box {boxName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold text-foreground">Tempo restante do token</p>
              </div>
              <div className="flex items-center gap-2">
                {isRefreshingToken && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                <span className="text-sm font-bold text-primary">{countdownLabel}</span>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Ao expirar, um novo token sera gerado automaticamente.
            </p>
          </div>

          {/* Token Display */}
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground mb-2 font-semibold">Seu Token</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono font-bold text-primary break-all">
                {token}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyToken}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Expiration */}
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Válido até:</p>
            <p>{new Date(expiresAt).toLocaleString("pt-BR")}</p>
          </div>

          {/* Instructions */}
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 space-y-2">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-foreground">Como usar:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  {/* <li>Copie o token acima</li> */}
                  <li>Compartilhe com o administrador do box</li>
                  <li>O admin usará o token para fazer seu vínculo como aluno</li>
                  <li>Após o vínculo, você poderá acessar as aulas do box</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold block mb-1">ℹ️ Informação</span>
              Este token é válido por um tempo limitado. Se expirar, você poderá solicitar um novo.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Fechar
          </Button>
          <Button
            type="button"
            onClick={handleCopyToken}
            className="flex-1"
          >
            {copied ? "Copiado!" : "Copiar Token"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
