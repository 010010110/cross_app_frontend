import { useState } from "react";
import { Heart, Trophy, MessageCircle } from "lucide-react";
import { mockFeedPosts } from "@/lib/mock-data";

export function FeedScreen() {
  const [filter, setFilter] = useState<"all" | "mine">("all");

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">Feed</h1>

      {/* Filter chips */}
      <div className="flex gap-2">
        {(["all", "mine"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {f === "all" ? "Geral" : "Meus Treinos"}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {mockFeedPosts.map((post) => (
          <div key={post.id} className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-xs font-bold text-secondary-foreground">
                  {post.avatarInitial}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{post.userName}</span>
                  {post.isNewPR && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                      <Trophy className="h-3 w-3" />
                      NOVO PR
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
              </div>
            </div>

            <p className="text-sm leading-relaxed">{post.text}</p>

            {post.isNewPR && post.exercise && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/10">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {post.exercise}: {post.score}
                </span>
              </div>
            )}

            <div className="flex items-center gap-4 pt-1">
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                <Heart className="h-4 w-4" />
                <span className="text-xs">{post.likes}</span>
              </button>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">Comentar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
