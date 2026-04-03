import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreateFeedPostDto, CreateFeedPostResponse } from "@/types/feed";

export function useCreateFeedPost() {
  return useMutation({
    mutationFn: (dto: CreateFeedPostDto) => api.post<CreateFeedPostResponse>("/feed/post", dto),
  });
}
