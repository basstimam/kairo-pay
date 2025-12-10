"use client";

import { useState, use, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Trash2, Copy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EditGigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Gig Data
  useEffect(() => {
    import("@/app/actions/gig").then((mod) => {
      mod.getGig(id).then((gig) => {
        if (gig) {
          setTitle(gig.title);
          setPrice(gig.price.toString());
          setDescription(gig.description);
        }
        setLoading(false);
      });
    });
  }, [id]);

  const [origin, setOrigin] = useState("https://kairo-pay.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const gigLink = `${origin}/pay/${id}`;

  const handleSave = async () => {
    setLoading(true);
    try {
      const { updateGig } = await import("@/app/actions/gig");
      await updateGig(id, {
        title,
        description,
        price: Number(price),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to update gig", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this gig? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const { deleteGig } = await import("@/app/actions/gig");
      await deleteGig(id);
      router.push("/app");
    } catch (error) {
      console.error("Failed to delete gig", error);
      setIsDeleting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(gigLink);
  };

  if (loading && !title) {
    return (
      <div className="max-w-2xl mx-auto py-12 flex justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-forest border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/app" className="flex items-center gap-2 text-forest/60 hover:text-forest transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-sm">Back to Dashboard</span>
        </Link>
        <Button 
          variant="ghost" 
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : <><Trash2 className="w-4 h-4 mr-2" /> Delete Gig</>}
        </Button>
      </div>

      <h1 className="text-3xl font-serif text-forest mb-8">Edit Gig</h1>

      {/* Form */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-mono text-forest/60 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-forest/20 rounded-lg focus:outline-none focus:border-emerald bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-mono text-forest/60 mb-2">Price (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40">$</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full pl-8 pr-4 py-3 border border-forest/20 rounded-lg focus:outline-none focus:border-emerald bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-mono text-forest/60 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-forest/20 rounded-lg focus:outline-none focus:border-emerald bg-white resize-none"
          />
        </div>

        {/* Gig Link */}
        <div className="bg-lime-50 border border-forest/10 rounded-lg p-4">
          <label className="block text-sm font-mono text-forest/60 mb-2">Gig Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={gigLink}
              readOnly
              className="flex-1 px-4 py-2 font-mono text-sm text-forest bg-white border border-forest/20 rounded focus:outline-none"
            />
            <Button variant="secondary" size="sm" onClick={copyLink}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button size="lg" className="flex-1 font-mono" onClick={handleSave} disabled={loading}>
            {saved ? (
              <>Saved!</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> {loading ? "Saving..." : "Save Changes"}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
