import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Loader2, Newspaper, Plus, Send, SmilePlus, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckinsMe } from "@/hooks/use-checkins-me";
import { useCreateFeedPost } from "@/hooks/use-create-feed-post";
import { useFeedList } from "@/hooks/use-feed-list";
import { useFeedUpload } from "@/hooks/use-feed-upload";
import { useToast } from "@/hooks/use-toast";

type ReactionKey = "fire" | "muscle" | "clap" | "target" | "heart";

interface PostReactionState {
  selected?: ReactionKey;
  counts: Record<ReactionKey, number>;
}

const REACTIONS_STORAGE_KEY = "feed_post_reactions_v1";

const REACTIONS: Array<{ id: ReactionKey; emoji: string; label: string }> = [
  { id: "fire", emoji: "🔥", label: "Fogo" },
  { id: "muscle", emoji: "💪", label: "Força" },
  { id: "clap", emoji: "👏", label: "Aplausos" },
  { id: "target", emoji: "🎯", label: "Foco" },
  { id: "heart", emoji: "❤️", label: "Curti" },
];

function createEmptyReactionCounts(): Record<ReactionKey, number> {
  return {
    fire: 0,
    muscle: 0,
    clap: 0,
    target: 0,
    heart: 0,
  };
}

function formatDateTime(dateInput: string) {
  return new Date(dateInput).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(dateInput: string) {
  const now = Date.now();
  const target = new Date(dateInput).getTime();
  const diffMinutes = Math.max(1, Math.floor((now - target) / 60000));

  if (diffMinutes < 60) return `${diffMinutes}min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

function formatDistanceMeters(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }
  return value.toFixed(1);
}

export function FeedScreen() {
  const FEED_STEP = 20;
  const FEED_MAX = 200;

  const { user } = useAuth();
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [selectedCheckinId, setSelectedCheckinId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [feedLimit, setFeedLimit] = useState(FEED_STEP);
  const [reactionsByPost, setReactionsByPost] = useState<Record<string, PostReactionState>>({});
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data: checkins = [],
    isLoading,
    isError: checkinsError,
    refetch: refetchCheckins,
  } = useCheckinsMe(Boolean(user));
  const {
    data: feedPosts,
    isLoading: feedLoading,
    isError: feedError,
    refetch: refetchFeed,
  } = useFeedList(feedLimit, Boolean(user));
  const { mutateAsync: uploadImage, isPending: uploadPending } = useFeedUpload();
  const { mutateAsync: createPost, isPending: createPostPending } = useCreateFeedPost();

  const safeCheckins = useMemo(() => (Array.isArray(checkins) ? checkins : []), [checkins]);
  const safeFeedPosts = useMemo(() => (Array.isArray(feedPosts) ? feedPosts : []), [feedPosts]);
  const prAutoCount = useMemo(
    () => safeFeedPosts.filter((post) => post.source === "PR_AUTO").length,
    [safeFeedPosts]
  );
  const uniqueBoxesCount = useMemo(
    () => new Set(safeFeedPosts.map((post) => post.boxId)).size,
    [safeFeedPosts]
  );

  const sortedCheckins = useMemo(
    () => [...safeCheckins].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [safeCheckins]
  );

  const canSubmit = text.trim().length >= 2 && Boolean(selectedCheckinId);
  const isSubmitting = uploadPending || createPostPending;
  const canLoadMore = safeFeedPosts.length >= feedLimit && feedLimit < FEED_MAX;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(REACTIONS_STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored) as Record<string, PostReactionState>;
      if (!parsed || typeof parsed !== "object") return;
      setReactionsByPost(parsed);
    } catch {
      // Ignore malformed local reaction cache.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(reactionsByPost));
  }, [reactionsByPost]);

  useEffect(() => {
    setReactionsByPost((current) => {
      let changed = false;
      const next: Record<string, PostReactionState> = { ...current };

      for (const post of safeFeedPosts) {
        const postKey = post._id || `${post.userId}-${post.createdAt}`;
        if (next[postKey]) continue;

        next[postKey] = {
          selected: undefined,
          counts: createEmptyReactionCounts(),
        };
        changed = true;
      }

      return changed ? next : current;
    });
  }, [safeFeedPosts]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !canLoadMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (feedLoading) return;

        setFeedLimit((current) => Math.min(current + FEED_STEP, FEED_MAX));
      },
      { rootMargin: "200px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [canLoadMore, feedLoading, FEED_MAX, FEED_STEP]);

  const handleCreatePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      toast({
        title: "Dados incompletos",
        description: "Selecione um check-in e escreva pelo menos 2 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      let photoUrl: string | undefined;

      if (selectedFile) {
        const uploadResult = await uploadImage(selectedFile);
        photoUrl = uploadResult.url;
      }

      const result = await createPost({
        checkinId: selectedCheckinId,
        text: text.trim(),
        photoUrl,
      });

      await refetchFeed();

      setText("");
      setSelectedCheckinId("");
      setSelectedFile(null);
      setCreateDialogOpen(false);

      toast({
        title: "Post publicado",
        description: result.message || "Seu post foi criado com sucesso no feed do box.",
      });
    } catch (err: unknown) {
      const message = (err as { message?: string | string[] })?.message;
      toast({
        title: "Não foi possível publicar",
        description:
          typeof message === "string"
            ? message
            : "Verifique se o check-in já não possui post e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleReact = (postKey: string, reaction: ReactionKey) => {
    setReactionsByPost((current) => {
      const existing = current[postKey] ?? {
        selected: undefined,
        counts: createEmptyReactionCounts(),
      };
      const counts = { ...existing.counts };
      let selected = existing.selected;

      if (selected === reaction) {
        counts[reaction] = Math.max(0, counts[reaction] - 1);
        selected = undefined;
      } else {
        if (selected) {
          counts[selected] = Math.max(0, counts[selected] - 1);
        }
        counts[reaction] += 1;
        selected = reaction;
      }

      return {
        ...current,
        [postKey]: {
          selected,
          counts,
        },
      };
    });
  };

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Feed</h1>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" aria-label="Criar novo post">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo post</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="checkin-select">
                Check-in da aula
              </label>
              <select
                id="checkin-select"
                value={selectedCheckinId}
                onChange={(event) => setSelectedCheckinId(event.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isLoading || sortedCheckins.length === 0 || isSubmitting}
              >
                <option value="">Selecione um check-in</option>
                {sortedCheckins.map((checkin, index) => (
                  <option
                    key={`${checkin._id || "checkin"}-${checkin.createdAt || "no-date"}-${index}`}
                    value={checkin._id}
                  >
                    {`Check-in ${formatDateTime(checkin.createdAt)} (${formatDistanceMeters(checkin.distanceFromBoxInMeters)}m)`}
                  </option>
                ))}
              </select>

              {checkinsError && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive space-y-2">
                  <p>Falha ao carregar seus check-ins.</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => void refetchCheckins()}>
                    Tentar novamente
                  </Button>
                </div>
              )}

              {!isLoading && !checkinsError && sortedCheckins.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum check-in encontrado para publicar. Faça check-in em uma aula primeiro.
                </p>
              )}

              <Textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Compartilhe como foi seu treino de hoje..."
                className="min-h-[96px]"
                maxLength={1200}
                disabled={isSubmitting}
              />

              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <Camera className="h-4 w-4" />
                  <span>{selectedFile ? selectedFile.name : "Adicionar foto"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isSubmitting}
                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  />
                </label>

                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publicando
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publicar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            {safeFeedPosts.length} posts
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            <Trophy className="h-3.5 w-3.5" />
            {prAutoCount} PRs automáticos
          </span>
          <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            {uniqueBoxesCount} boxes ativos
          </span>
        </div>

        {feedLoading && (
          <div className="space-y-3">
            <div className="glass-card p-4 space-y-3 animate-pulse">
              <div className="h-4 w-1/3 rounded bg-secondary" />
              <div className="h-3 w-full rounded bg-secondary" />
              <div className="h-3 w-4/5 rounded bg-secondary" />
            </div>
            <div className="glass-card p-4 space-y-3 animate-pulse">
              <div className="h-4 w-1/4 rounded bg-secondary" />
              <div className="h-3 w-full rounded bg-secondary" />
              <div className="h-3 w-3/4 rounded bg-secondary" />
            </div>
          </div>
        )}

        {feedError && (
          <div className="glass-card p-4 space-y-2">
            <p className="text-sm text-destructive">Falha ao carregar o feed.</p>
            <Button variant="outline" size="sm" onClick={() => void refetchFeed()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!feedLoading && !feedError && safeFeedPosts.length === 0 && (
          <div className="glass-card p-6 text-center space-y-3 border-dashed">
            <div className="mx-auto h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
              <Newspaper className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold">O feed está vazio</h3>
            <p className="text-sm text-muted-foreground">
              Toque no botão + para criar seu primeiro post.
            </p>
            <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
              Criar primeiro post
            </Button>
          </div>
        )}

        {safeFeedPosts.map((post, index) => (
          <div key={`${post._id || "post"}-${post.createdAt || "no-date"}-${index}`} className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-xs font-bold text-secondary-foreground">
                  {(post.authorName ?? user?.email ?? "U").slice(0, 1).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{post.authorName ?? "Atleta"}</span>
                  {post.source === "PR_AUTO" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                      <Trophy className="h-3 w-3" />
                      PR Auto
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold">
                      Manual
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {post.boxName ?? "Box"} • {formatRelativeTime(post.createdAt)} atrás
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed">{post.text}</p>

            {post.photoUrl && (
              <img
                src={post.photoUrl}
                alt="Foto do post"
                className="w-full rounded-lg border border-border/50 object-cover max-h-72"
              />
            )}

            {(() => {
              const postKey = post._id || `${post.userId}-${post.createdAt}`;
              const reactionState = reactionsByPost[postKey] ?? {
                selected: undefined,
                counts: createEmptyReactionCounts(),
              };
              const selectedReaction = REACTIONS.find((item) => item.id === reactionState.selected);
              const totalReactions = Object.values(reactionState.counts).reduce(
                (acc, value) => acc + value,
                0
              );

              return (
                <div className="flex items-center justify-between pt-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-2.5 ${
                          selectedReaction ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {selectedReaction ? (
                          <>
                            <span className="mr-1">{selectedReaction.emoji}</span>
                            {selectedReaction.label}
                          </>
                        ) : (
                          <>
                            <SmilePlus className="h-4 w-4 mr-1" />
                            Reagir
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="p-2">
                      <div className="flex items-center gap-1">
                        {REACTIONS.map((item) => {
                          const active = reactionState.selected === item.id;

                          return (
                            <button
                              key={`${postKey}-${item.id}`}
                              type="button"
                              onClick={() => handleReact(postKey, item.id)}
                              className={`h-9 w-9 rounded-full text-lg transition-transform hover:scale-110 ${
                                active ? "bg-primary/15" : "bg-secondary/50"
                              }`}
                              aria-label={`Reagir com ${item.label}`}
                              title={item.label}
                            >
                              {item.emoji}
                            </button>
                          );
                        })}
                      </div>
                      {selectedReaction && (
                        <DropdownMenuItem
                          className="mt-2 cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => handleReact(postKey, selectedReaction.id)}
                        >
                          Remover reação
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <span className="text-xs text-muted-foreground">
                    {totalReactions > 0 ? `${totalReactions} reações` : "Sem reações"}
                  </span>
                </div>
              );
            })()}
          </div>
        ))}

        {!feedLoading && canLoadMore && (
          <div ref={loadMoreRef} className="py-3 text-center">
            <span className="text-xs text-muted-foreground">Carregando mais posts...</span>
          </div>
        )}

        {!canLoadMore && safeFeedPosts.length > 0 && (
          <p className="text-xs text-center text-muted-foreground">Você chegou ao fim do feed.</p>
        )}
      </div>
    </div>
  );
}
