import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["published-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 py-8 md:py-16 max-w-3xl">
        {/* Hero Section */}
        <section className="mb-12 md:mb-16 opacity-0 animate-slide-up">
          <p className="text-muted-foreground font-body text-sm uppercase tracking-wide mb-3">
            Newsletter
          </p>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-medium text-foreground mb-4 leading-tight">
            CampusVoice Diaries
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-body leading-relaxed max-w-xl">
            Stories, updates and moments from Kingston Engineering College
          </p>
          <div className="h-px bg-border mt-8 md:mt-12" />
        </section>

        {/* Posts List */}
        <section>
          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-6 border-b border-border">
                  <Skeleton className="h-4 w-32 mb-3" />
                  <Skeleton className="h-7 w-full mb-2" />
                  <Skeleton className="h-7 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div>
              {posts.map((post, index) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt}
                  coverImage={post.cover_image}
                  publishedAt={post.published_at}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 md:py-24 opacity-0 animate-fade-in">
              <p className="text-muted-foreground font-heading text-xl md:text-2xl italic">
                No stories published yet.
              </p>
              <p className="text-muted-foreground/70 font-body text-sm mt-2">
                Check back soon for new content.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border py-8 md:py-12 mt-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
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

export default Index;
