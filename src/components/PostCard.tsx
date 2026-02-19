import { Link } from "react-router-dom";
import { format } from "date-fns";

interface PostCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  index?: number;
}

const PostCard = ({ title, slug, excerpt, coverImage, publishedAt, index = 0 }: PostCardProps) => {
  return (
    <Link 
      to={`/post/${slug}`}
      className="group block opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <article className="py-6 md:py-8 border-b border-border last:border-b-0 hover:bg-muted/30 -mx-4 px-4 transition-colors">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
          <div className="flex-1 min-w-0">
            {publishedAt && (
              <time className="text-xs md:text-sm text-muted-foreground font-body uppercase tracking-wide">
                {format(new Date(publishedAt), "MMMM d, yyyy")}
              </time>
            )}
            <h2 className="font-heading text-xl md:text-2xl lg:text-[1.75rem] font-medium mt-2 mb-2 text-foreground group-hover:text-foreground/80 transition-colors leading-tight">
              {title}
            </h2>
            {excerpt && (
              <p className="text-muted-foreground font-body line-clamp-2 text-sm md:text-base leading-relaxed">
                {excerpt}
              </p>
            )}
            <span className="inline-block mt-3 text-sm text-muted-foreground font-body group-hover:text-foreground transition-colors">
              Read more →
            </span>
          </div>
          {coverImage && (
            <div className="w-full md:w-40 lg:w-48 flex-shrink-0 order-first md:order-last">
              <div className="aspect-[16/10] md:aspect-square overflow-hidden bg-muted">
                <img 
                  src={coverImage} 
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};

export default PostCard;
