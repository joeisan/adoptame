"use client";

import { useState } from "react";
import { Flag, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createReportAction } from "@/server/actions/reports";

export function ReportListingPopup({ listingId, listingName }: { listingId: string; listingName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createReportAction(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    }
    setIsPending(false);
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 h-8 px-2"
      >
        <Flag className="size-4" />
        <span className="text-xs">Reportar</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-xl border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Reportar publicación</h2>
                <p className="text-sm text-muted-foreground">¿Por qué reportas a {listingName}?</p>
              </div>
            </div>

            {success ? (
              <div className="py-8 text-center space-y-2">
                <div className="text-green-500 font-bold text-lg">¡Reporte enviado!</div>
                <p className="text-sm text-muted-foreground">Gracias por ayudarnos a mantener la comunidad segura.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="hidden" name="listingId" value={listingId} />
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo del reporte</Label>
                  <Select name="reason" id="reason" required>
                    <option value="">Selecciona un motivo</option>
                    <option value="Inapropiado">Contenido inapropiado</option>
                    <option value="Spam">Spam o publicidad</option>
                    <option value="Estafa">Posible estafa / fraude</option>
                    <option value="Maltrato">Sospecha de maltrato animal</option>
                    <option value="Duplicado">Publicación duplicada</option>
                    <option value="Otro">Otro motivo</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detalles adicionales (opcional)</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Cuéntanos más sobre el problema..."
                    className="min-h-[100px] resize-none"
                  />
                </div>

                {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isPending}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="destructive" disabled={isPending}>
                    {isPending ? "Enviando..." : "Enviar reporte"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
