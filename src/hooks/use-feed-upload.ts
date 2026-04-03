import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FeedUploadResponse } from "@/types/feed";

export function useFeedUpload() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return api.post<FeedUploadResponse>("/feed/upload", formData);
    },
  });
}
