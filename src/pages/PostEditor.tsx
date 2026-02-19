import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminHeader from "@/components/AdminHeader";
import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Upload, Loader2, X } from "lucide-react";
import { uploadImage } from "@/lib/storage";

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 100);
};

const PostEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const isEditing = !!id;
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    const imageUrl = await uploadImage(file);
    setIsUploadingCover(false);

    if (imageUrl) {
      setCoverImage(imageUrl);
      toast.success("Cover image uploaded");
    }

    // Reset input
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = "";
    }
  };

  const handleRemoveCoverImage = () => {
    setCoverImage("");
  };
  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!isEditing && title) {
      setSlug(generateSlug(title));
    }
  }, [title, isEditing]);

  useQuery({
    queryKey: ["post-edit", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setExcerpt(data.excerpt || "");
        setCoverImage(data.cover_image || "");
        setContent(data.content || "");
      }
      
      return data;
    },
    enabled: !!id && !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ publish }: { publish: boolean }) => {
      const postData = {
        title,
        slug,
        excerpt: excerpt || null,
        cover_image: coverImage || null,
        content,
        published: publish,
        published_at: publish ? new Date().toISOString() : null,
        author_id: user?.id,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("posts")
          .insert(postData);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast.success(variables.publish ? "Published" : "Draft saved");
      navigate("/admin");
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate key")) {
        toast.error("An article with this URL already exists");
      } else {
        toast.error("Failed to save");
      }
    },
  });

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!slug.trim()) {
      toast.error("Please enter a URL slug");
      return;
    }
    setIsSaving(true);
    await saveMutation.mutateAsync({ publish });
    setIsSaving(false);
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

      <main className="container mx-auto px-4 sm:px-6 py-6 md:py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <Link 
            to="/admin" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors font-body text-sm group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="font-body"
            >
              Save draft
            </Button>
            <Button 
              size="sm"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="font-body"
            >
              Publish
            </Button>
          </div>
        </div>

        <div className="space-y-6 opacity-0 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-body text-sm">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              className="font-heading text-xl md:text-2xl h-auto py-3 border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug" className="font-body text-sm">URL</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="article-url"
                className="font-body h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm">Cover image</Label>
              <div className="space-y-2">
                {coverImage ? (
                  <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden border border-border">
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => coverImageInputRef.current?.click()}
                        disabled={isUploadingCover}
                      >
                        {isUploadingCover ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Change
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={handleRemoveCoverImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverImageInputRef.current?.click()}
                    disabled={isUploadingCover}
                    className="w-full h-40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-foreground hover:bg-muted/30 transition-colors disabled:opacity-50"
                  >
                    {isUploadingCover ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="text-sm font-body text-muted-foreground">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <p className="text-sm font-body text-muted-foreground">Click to upload image</p>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={coverImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                  aria-label="Upload cover image"
                />
                <p className="text-xs text-muted-foreground font-body">
                  Or paste a URL below
                </p>
                <Input
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="font-body h-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt" className="font-body text-sm">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description..."
              className="font-body resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm">Content</Label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write your article..."
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostEditor;
