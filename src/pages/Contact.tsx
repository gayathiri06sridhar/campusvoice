import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import ContactForm from "@/components/ContactForm";
import { ArrowLeft } from "lucide-react";

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-4xl">
        <Link 
          to="/" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors font-body text-sm mb-8 md:mb-12 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="font-heading text-3xl md:text-4xl font-medium text-foreground">
                Get in Touch
              </h1>
              <p className="text-muted-foreground font-body text-lg leading-relaxed">
                Have something to share? Found an issue? Want to collaborate? We'd love to hear from you.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="font-heading text-xl font-medium text-foreground mb-6">
              Send us a message
            </h2>
            <ContactForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
