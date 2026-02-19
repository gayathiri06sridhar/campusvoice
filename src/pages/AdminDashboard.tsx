import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminHeader from "@/components/AdminHeader";
import ContactMessages from "@/components/ContactMessages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Edit, Trash2, Eye, EyeOff, Tabs } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"articles" | "messages">("articles");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    }
  }, [user, loading, navigate]);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Article deleted");
    },
    onError: () => {
      toast.error("Failed to delete article");
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase
        .from("posts")
        .update({ 
          published, 
          published_at: published ? new Date().toISOString() : null 
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success(variables.published ? "Article published" : "Article unpublished");
    },
    onError: () => {
      toast.error("Failed to update article");
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="container mx-auto px-4 sm:px-6 py-8 md:py-12 max-w-4xl">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("articles")}
            className={`px-4 py-2 font-body text-sm font-medium transition-colors ${
              activeTab === "articles"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Articles
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 font-body text-sm font-medium transition-colors ${
              activeTab === "messages"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Messages
          </button>
        </div>

        {/* Articles Tab */}
        {activeTab === "articles" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-heading text-2xl md:text-3xl font-medium text-foreground">
                  Articles
                </h1>
                <p className="text-muted-foreground font-body text-sm mt-1">
                  {posts?.length || 0} total
                </p>
              </div>
              <Button asChild className="font-body">
                <Link to="/admin/new">New article</Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="py-4 border-b border-border">
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                {posts.map((post, index) => (
                  <div 
                    key={post.id} 
                    className="flex items-center justify-between p-4 md:p-5 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="min-w-0 flex-1 mr-4">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-body font-medium text-foreground truncate">
                          {post.title}
                        </h3>
                        {post.published ? (
                          <Badge variant="secondary" className="text-xs font-body bg-foreground/5">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs font-body">
                            Draft
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground font-body text-sm">
                        {format(new Date(post.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => togglePublishMutation.mutate({ 
                          id: post.id, 
                          published: !post.published 
                        })}
                        title={post.published ? "Unpublish" : "Publish"}
                      >
                        {post.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link to={`/admin/edit/${post.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(post.id, post.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-border rounded-lg opacity-0 animate-fade-in">
                <p className="font-heading text-xl text-foreground mb-2">
                  No articles yet
                </p>
                <p className="text-muted-foreground font-body text-sm mb-6">
                  Create your first article to get started.
                </p>
                <Button asChild className="font-body">
                  <Link to="/admin/new">New article</Link>
                </Button>
              </div>
            )}
          </>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && <ContactMessages />}
      </main>
    </div>
  );
};

export default AdminDashboard;
