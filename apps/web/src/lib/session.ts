import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { PublicUser } from "@galaxy-pong/shared";
import { api } from "./api";
import { resetSocket } from "./realtime";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => api<{ user: PublicUser }>("/auth/session"),
    retry: false
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => api("/auth/logout", { method: "POST", body: "{}" }),
    onSettled: () => {
      resetSocket();
      queryClient.clear();
      navigate("/login");
    }
  });
}
