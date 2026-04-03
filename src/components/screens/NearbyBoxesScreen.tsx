import { useCallback, useEffect, useMemo, useState } from "react";
import { Globe, Loader2, Mail, MapPin, PhoneCall, Search, MessageCircle, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnrollmentTokenDialog } from "@/components/EnrollmentTokenDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNearbyBoxes } from "@/hooks/use-nearby-boxes";
import { useCreateEnrollmentToken } from "@/hooks/use-create-enrollment-token";

function normalizePhoneLink(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeWebsiteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function NearbyBoxesScreen() {
  const { user, setSelectedBoxId } = useAuth();
  const { toast } = useToast();

  const [didSearchNearby, setDidSearchNearby] = useState(false);
  const [previewNearbyBoxId, setPreviewNearbyBoxId] = useState<string | null>(null);
  const [enrollingBoxId, setEnrollingBoxId] = useState<string | null>(null);
  const [nearbyPage, setNearbyPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [enrollmentTokenData, setEnrollmentTokenData] = useState<{
    token: string;
    boxName: string;
    expiresAt: string;
  } | null>(null);

  const hasAnyBox = (user?.boxIds.length ?? 0) > 0;

  const {
    mutate: findNearbyBoxes,
    data: nearbyBoxes,
    isPending: nearbyPending,
  } = useNearbyBoxes();

  const { mutateAsync: createEnrollmentToken, isPending: createTokenPending } =
    useCreateEnrollmentToken();

  const isRefreshingEnrollmentToken = createTokenPending && Boolean(enrollmentTokenData);

  const filteredNearbyBoxes = useMemo(() => {
    const all = nearbyBoxes ?? [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return all;

    return all.filter((box) => {
      return box.name.toLowerCase().includes(term) || box.address.toLowerCase().includes(term);
    });
  }, [nearbyBoxes, searchTerm]);

  const NEARBY_ITEMS_PER_PAGE = 3;
  const totalNearbyPages = Math.max(
    1,
    Math.ceil(filteredNearbyBoxes.length / NEARBY_ITEMS_PER_PAGE)
  );

  const paginatedNearbyBoxes = useMemo(() => {
    const start = (nearbyPage - 1) * NEARBY_ITEMS_PER_PAGE;
    const end = start + NEARBY_ITEMS_PER_PAGE;
    return filteredNearbyBoxes.slice(start, end);
  }, [filteredNearbyBoxes, nearbyPage]);

  useEffect(() => {
    setNearbyPage(1);
  }, [nearbyBoxes?.length, searchTerm]);

  const handleSearchNearby = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalização indisponível",
        description: "Não foi possível acessar sua localização neste dispositivo.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setDidSearchNearby(true);
        findNearbyBoxes(
          {
            latitude: parseFloat(coords.latitude.toFixed(6)),
            longitude: parseFloat(coords.longitude.toFixed(6)),
          },
          {
            onError: () => {
              toast({
                title: "Erro ao buscar boxes",
                description: "Tente novamente em alguns instantes.",
                variant: "destructive",
              });
            },
          }
        );
      },
      () => {
        toast({
          title: "Não foi possível obter localização",
          description: "Ative a permissão de localização e tente novamente.",
          variant: "destructive",
        });
      },
      { timeout: 10000 }
    );
  };

  const handleEnrollInBox = async (boxId: string, boxName: string) => {
    setEnrollingBoxId(boxId);
    try {
      const tokenData = await createEnrollmentToken();

      setEnrollmentTokenData({
        token: tokenData.token,
        boxName,
        expiresAt: tokenData.expiresAt,
      });
    } catch (err: unknown) {
      const message = (err as { message?: string | string[] })?.message;
      toast({
        title: "Falha ao gerar token",
        description:
          typeof message === "string"
            ? message
            : "Não foi possível gerar o token de matrícula.",
        variant: "destructive",
      });
    } finally {
      setEnrollingBoxId(null);
    }
  };

  const handleRefreshEnrollmentToken = useCallback(async () => {
    if (!enrollmentTokenData) return;

    try {
      const tokenData = await createEnrollmentToken();
      setEnrollmentTokenData((current) =>
        current
          ? {
              ...current,
              token: tokenData.token,
              expiresAt: tokenData.expiresAt,
            }
          : current
      );
    } catch (err: unknown) {
      const message = (err as { message?: string | string[] })?.message;
      toast({
        title: "Falha ao atualizar token",
        description:
          typeof message === "string"
            ? message
            : "Nao foi possivel atualizar o token automaticamente.",
        variant: "destructive",
      });
    }
  }, [createEnrollmentToken, enrollmentTokenData, toast]);

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descobrir boxes</p>
          <h1 className="text-2xl font-bold tracking-tight">Boxes próximos</h1>
          {!hasAnyBox && (
            <p className="mt-1 text-sm text-muted-foreground">
              Você ainda não tem vínculo com um box. Busque um box próximo para iniciar sua matrícula.
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSearchNearby}
          disabled={nearbyPending || createTokenPending || Boolean(enrollingBoxId)}
        >
          {nearbyPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              Buscar próximos
            </>
          )}
        </Button>
      </div>

      <div className="glass-card p-4 space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nome do box ou endereco"
            className="pl-9"
            disabled={!didSearchNearby || nearbyPending}
          />
        </div>

        {didSearchNearby && filteredNearbyBoxes.length === 0 && !nearbyPending && (
          <p className="text-sm text-muted-foreground">Nenhum box encontrado para sua busca.</p>
        )}

        <div className="space-y-2">
          {paginatedNearbyBoxes.map((box) => {
            const enrollingThisBox = enrollingBoxId === box.boxId;
            const isSelectedPreview = previewNearbyBoxId === box.boxId;
            const alreadyEnrolled = box.isStudentRegistered;

            return (
              <div
                key={box.boxId}
                className={`rounded-lg border px-3 py-3 ${
                  isSelectedPreview ? "border-primary bg-primary/5" : "border-border/60 bg-secondary/40"
                }`}
                onClick={() => setPreviewNearbyBoxId(box.boxId)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{box.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(box.distanceInMeters)}m de distância
                    </p>
                  </div>

                  {alreadyEnrolled ? (
                    <Button size="sm" variant="secondary" onClick={() => setSelectedBoxId(box.boxId)}>
                      Selecionar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled={createTokenPending || Boolean(enrollingBoxId)}
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleEnrollInBox(box.boxId, box.name);
                      }}
                    >
                      {enrollingThisBox ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Gerando token...
                        </>
                      ) : (
                        "Matricular"
                      )}
                    </Button>
                  )}
                </div>

                <div className="mt-2 rounded-md border border-border/40 bg-muted/30 px-2 py-1.5">
                  <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                    <MapPinned className="h-3.5 w-3.5 text-muted-foreground" />
                    Endereço
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{box.address}</p>
                </div>

                {isSelectedPreview && (
                  <div className="mt-2 space-y-2">
                    <div className="rounded-md border border-border/40 bg-muted/30 px-2 py-1.5">
                      <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                        <PhoneCall className="h-3.5 w-3.5 text-muted-foreground" />
                        Contato do box
                      </p>
                      <div className="mt-1 space-y-1 text-[11px] text-muted-foreground">
                        <p className="flex items-center gap-1.5">
                          <PhoneCall className="h-3.5 w-3.5 shrink-0" />
                          <a
                            href={`tel:${normalizePhoneLink(box.contactPhone)}`}
                            onClick={(event) => event.stopPropagation()}
                            className="underline-offset-2 hover:underline"
                          >
                            {box.contactPhone}
                          </a>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                          <a
                            href={`https://wa.me/${normalizePhoneLink(box.contactWhatsapp)}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="underline-offset-2 hover:underline"
                          >
                            {box.contactWhatsapp}
                          </a>
                        </p>
                        <p className="flex items-center gap-1.5 break-all">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <a
                            href={`mailto:${box.contactEmail}`}
                            onClick={(event) => event.stopPropagation()}
                            className="underline-offset-2 hover:underline"
                          >
                            {box.contactEmail}
                          </a>
                        </p>
                        <p className="flex items-center gap-1.5 break-all">
                          <Globe className="h-3.5 w-3.5 shrink-0" />
                          <a
                            href={normalizeWebsiteUrl(box.contactWebsite)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="underline-offset-2 hover:underline"
                          >
                            {box.contactWebsite}
                          </a>
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {alreadyEnrolled
                        ? "Você já está matriculado nesse box."
                        : "Use Matricular para gerar o token e compartilhar com o admin do box."}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredNearbyBoxes.length > NEARBY_ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setNearbyPage((current) => Math.max(1, current - 1))}
              disabled={nearbyPage === 1}
            >
              Anterior
            </Button>
            <p className="text-xs text-muted-foreground">
              Pagina {nearbyPage} de {totalNearbyPages}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setNearbyPage((current) => Math.min(totalNearbyPages, current + 1))}
              disabled={nearbyPage === totalNearbyPages}
            >
              Proxima
            </Button>
          </div>
        )}
      </div>

      <EnrollmentTokenDialog
        isOpen={Boolean(enrollmentTokenData)}
        onOpenChange={(open) => {
          if (!open) setEnrollmentTokenData(null);
        }}
        token={enrollmentTokenData?.token ?? ""}
        boxName={enrollmentTokenData?.boxName ?? ""}
        expiresAt={enrollmentTokenData?.expiresAt ?? ""}
        onTokenExpired={handleRefreshEnrollmentToken}
        isRefreshingToken={isRefreshingEnrollmentToken}
      />
    </div>
  );
}
