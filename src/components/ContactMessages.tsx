import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Mail, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type ContactMessageType = Tables<"contact_messages">;

const ContactMessages = () => {
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ["contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as ContactMessageType[];
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      toast.success("Message deleted");
    },
    onError: () => {
      toast.error("Failed to delete message");
    },
  });

  const toggleReadMutation = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ read: !read })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
    onError: () => {
      toast.error("Failed to update message");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="py-4 border-b border-border">
            <Skeleton className="h-5 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5" />
        <h2 className="font-heading text-lg font-medium">
          Contact Messages ({messages?.length || 0})
        </h2>
      </div>

      {!messages || messages.length === 0 ? (
        <div className="text-center py-8 border border-border rounded-lg">
          <p className="text-muted-foreground font-body">No messages yet</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 border-b border-border last:border-b-0 ${
                msg.read ? "bg-background" : "bg-muted/30"
              } hover:bg-muted/50 transition-colors`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-body font-medium text-foreground">
                      {msg.name}
                    </h3>
                    {!msg.read && (
                      <Badge variant="secondary" className="text-xs font-body">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-body mb-2">
                    <a
                      href={`mailto:${msg.email}`}
                      className="hover:underline text-blue-600"
                    >
                      {msg.email}
                    </a>
                  </p>
                  <p className="text-sm text-foreground font-body break-words">
                    {msg.message}
                  </p>
                  <p className="text-xs text-muted-foreground font-body mt-2">
                    {format(new Date(msg.created_at), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      toggleReadMutation.mutate({ id: msg.id, read: msg.read })
                    }
                    title={msg.read ? "Mark as unread" : "Mark as read"}
                  >
                    {msg.read ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (
                        window.confirm(`Delete message from ${msg.name}?`)
                      ) {
                        deleteMessageMutation.mutate(msg.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
