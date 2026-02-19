import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import DOMPurify from "dompurify";

const PostView = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 py-8 md:py-16 max-w-2xl">
          <Skeleton className="h-4 w-32 mb-6" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-3/4 mb-8" />
          <Skeleton className="aspect-[2/1] mb-10" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 py-16 md:py-24 text-center max-w-2xl">
          <p className="font-heading text-2xl md:text-3xl text-foreground mb-4">
            Article not found
          </p>
          <p className="text-muted-foreground font-body mb-8">
            This article may have been moved or deleted.
          </p>
          <Link 
            to="/" 
            className="text-foreground font-body text-sm underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            ← Back to all articles
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 py-8 md:py-16 max-w-2xl">
        <Link 
          to="/" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors font-body text-sm mb-8 md:mb-12 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          All articles
        </Link>

        <article className="opacity-0 animate-slide-up">
          {post.published_at && (
            <time className="text-sm text-muted-foreground font-body uppercase tracking-wide">
              {format(new Date(post.published_at), "MMMM d, yyyy")}
            </time>
          )}
          
          <h1 className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] font-medium text-foreground mt-3 mb-8 md:mb-10 leading-tight">
            {post.title}
          </h1>

          {post.cover_image && (
            <img 
              src={post.cover_image} 
              alt={post.title}
              className="w-full mb-10 md:mb-12"
              loading="lazy"
            />
          )}

          <div 
            className="prose-newsletter"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content || "") }}
          />

          <div className="h-px bg-border my-12 md:my-16" />
          
          <Link 
            to="/" 
            className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
          >
            ← Back to all articles
          </Link>
        </article>
      </main>

      <footer className="border-t border-border py-8 md:py-12 mt-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-heading text-lg text-foreground">
              CampusVoice Diaries
            </p>
            <p className="text-muted-foreground font-body text-sm">
              © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PostView;
