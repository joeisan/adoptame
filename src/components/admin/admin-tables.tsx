"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { 
  CheckCircle, 
  ExternalLink, 
  MoreHorizontal, 
  Dog, 
  UserPlus, 
  Search, 
  Check, 
  X,
  Key
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AdminDataTable } from "./admin-data-table";
import { 
  moderateListingAction, 
  changeUserRoleAction, 
  banUserAction, 
  unbanUserAction,
  setOrganizationVerificationAction,
  setOrganizationLimitAction,
  changeListingOwnerAction,
  adminResetPasswordAction
} from "@/server/actions/admin";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/pets/status-badge";
import type { PetStatus } from "@/types/app";

type AdminRow = Record<string, unknown>;

function text(val: any) {
  return String(val ?? "");
}

function formAction(action: (formData: FormData) => Promise<{ error?: string, ok?: boolean }>) {
  return async (formData: FormData) => {
    const res = await action(formData);
    if (res.error) toast.error(res.error);
    else toast.success("Operación exitosa");
  };
}

/**
 * Componente para buscar y seleccionar un dueño
 */
function OwnerSearchSelect({ users, onSelect, placeholder = "Buscar..." }: { users: any[], onSelect: (id: string) => void, placeholder?: string }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = users.filter(u => 
    (u.display_name || u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10);

  return (
    <div className="relative w-64 z-[100]">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
        <Input 
          className="h-8 pl-7 text-[10px] bg-background border-primary/30" 
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      
      {open && search.length > 0 && (
        <div className="absolute top-full left-0 z-[110] mt-1 w-full rounded-md border bg-popover p-1 shadow-xl animate-in fade-in zoom-in-95 max-h-[200px] overflow-y-auto">
          {filtered.map(u => (
            <button
              key={u.id}
              className="w-full rounded px-2 py-2 text-left text-[11px] hover:bg-accent transition-colors flex flex-col gap-0.5 border-b last:border-0 border-muted/20"
              onClick={() => {
                onSelect(u.id);
                setSearch("");
                setOpen(false);
              }}
            >
              <div className="font-bold truncate text-foreground">{u.display_name || u.full_name || "Sin nombre"}</div>
              <div className="text-[9px] opacity-60 truncate font-mono">{u.email || u.id}</div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-3 text-[10px] text-center text-muted-foreground italic">No se encontraron usuarios</div>
          )}
        </div>
      )}
    </div>
  );
}

export function ListingsTable({ data, users }: { data: AdminRow[], users: any[] }) {
  const [isPending, startTransition] = useTransition();

  const columns: ColumnDef<AdminRow>[] = [
    {
      header: "Mascota",
      cell: ({ row }) => {
        const images = (row.original as any).pet_images;
        const firstImage = Array.isArray(images) ? images[0] : null;
        const imageUrl = firstImage?.public_url;

        return (
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full overflow-hidden border-2 border-primary/20 bg-muted shrink-0 shadow-sm">
              {imageUrl ? (
                <img src={text(imageUrl)} alt="" className="size-full object-cover" />
              ) : (
                <div className="size-full flex items-center justify-center text-muted-foreground bg-muted">
                  <Dog className="size-5" />
                </div>
              )}
            </div>
            <div>
              <div className="font-bold text-sm leading-tight text-foreground">{text(row.original.name)}</div>
              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{text(row.original.category_name || (row.original as any).category?.name || "Mascota")}</div>
            </div>
          </div>
        );
      }
    },
    {
      header: "Dueño / Publicante",
      cell: ({ row }) => {
        const organization = (row.original as any).organizations;
        const currentOwner = (row.original as any).owner;
        const displayName = organization?.name || currentOwner?.display_name || currentOwner?.full_name || "Usuario Desconocido";
        const isOrg = !!organization?.name;

        return (
          <div className="flex flex-col gap-0.5">
            <div className={cn("font-bold text-sm flex items-center gap-1.5", isOrg ? "text-primary" : "text-foreground")}>
              {isOrg ? (
                <div className="px-1.5 py-0.5 rounded-sm bg-primary/10 text-[9px] font-black uppercase tracking-tighter">Org</div>
              ) : (
                <div className="size-2 rounded-full bg-muted-foreground/30" />
              )}
              {displayName}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground opacity-60">ID: {text(row.original.owner_id).substring(0, 8)}...</div>
          </div>
        );
      }
    },
    {
      header: "Estado",
      cell: ({ row }) => <StatusBadge status={text(row.original.status) as PetStatus} />
    },
    {
      header: "Provincia",
      accessorKey: "province",
      cell: ({ row }) => <span className="text-sm font-medium">{text(row.original.province)}</span>
    },
    {
      header: "Acciones",
      cell: ({ row }) => {
        const [showReassign, setShowReassign] = useState(false);
        const [selectedUserId, setSelectedUserId] = useState("");

        return (
          <div className="flex flex-col gap-2 relative">
            <div className="flex items-center gap-2">
              <form action={formAction(moderateListingAction)} className="flex items-center gap-1.5">
                <input name="listingId" type="hidden" value={text(row.original.id)} />
                <Select name="status" defaultValue={text(row.original.status)} className="h-8 w-32 text-xs font-bold">
                  <option value="published">Publicado</option>
                  <option value="suspended">Suspendido</option>
                  <option value="adopted">Adoptado</option>
                  <option value="deleted">Eliminado</option>
                </Select>
                <Button size="sm" type="submit" variant="secondary" className="h-8 font-bold px-3">
                  Actualizar
                </Button>
              </form>

              <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors">
                <Link href={`/pets/${row.original.slug}`} target="_blank">
                  <ExternalLink className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {showReassign ? (
                <div className="flex items-center gap-1.5 animate-in slide-in-from-right-2 duration-300 z-[100]">
                  <OwnerSearchSelect 
                    users={users} 
                    onSelect={setSelectedUserId}
                    placeholder="Buscar nuevo dueño..."
                  />
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="h-8 font-bold shadow-md"
                    onClick={() => {
                      if (!selectedUserId) return;
                      if (!confirm("¿Seguro que quieres cambiar el dueño de esta mascota?")) return;
                      
                      const formData = new FormData();
                      formData.append("listingId", text(row.original.id));
                      formData.append("ownerId", selectedUserId);
                      
                      startTransition(async () => {
                        const res = await changeListingOwnerAction(formData);
                        if (res.error) toast.error(res.error);
                        else {
                          toast.success("Dueño actualizado con éxito");
                          setShowReassign(false);
                        }
                      });
                    }}
                    disabled={isPending || !selectedUserId}
                  >
                    OK
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 px-2"
                    onClick={() => {
                      setShowReassign(false);
                      setSelectedUserId("");
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-[10px] font-bold uppercase tracking-wider gap-1.5 opacity-70 hover:opacity-100 hover:border-primary/50 transition-all"
                  onClick={() => setShowReassign(true)}
                >
                  <UserPlus className="size-3" />
                  Reasignar Dueño
                </Button>
              )}
            </div>
          </div>
        );
      }
    }
  ];

  return <AdminDataTable columns={columns} data={data} />;
}

export function UsersTable({ data }: { data: AdminRow[] }) {
  const columns: ColumnDef<AdminRow>[] = [
    {
      header: "Usuario",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold">{text(row.original.display_name || row.original.full_name)}</span>
          <span className="text-[10px] text-muted-foreground">{text(row.original.email)}</span>
        </div>
      )
    },
    {
      header: "Rol",
      cell: ({ row }) => (
        <form action={formAction(changeUserRoleAction)} className="flex items-center gap-2">
          <input name="userId" type="hidden" value={text(row.original.id)} />
          <Select name="role" defaultValue={text(row.original.role)} className="h-8 w-28 text-xs">
            <option value="user">Usuario</option>
            <option value="super_admin">Admin</option>
          </Select>
          <Button size="sm" type="submit" variant="outline" className="h-8">Cambiar</Button>
        </form>
      )
    },
    {
      header: "Estado",
      cell: ({ row }) => {
        const status = text(row.original.status);
        return (
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
            status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          )}>
            {status}
          </span>
        );
      }
    },
    {
      header: "Acciones",
      cell: ({ row }) => {
        const isSuperAdmin = text(row.original.role) === "super_admin";
        return (
          <div className="flex gap-2">
            {text(row.original.status) === "active" ? (
              <form action={formAction(banUserAction)}>
                <input name="userId" type="hidden" value={text(row.original.id)} />
                <Button size="sm" type="submit" variant="destructive" className="h-8" disabled={isSuperAdmin} title={isSuperAdmin ? "No se puede banear a un administrador" : ""}>Banear</Button>
              </form>
            ) : (
              <form action={formAction(unbanUserAction)}>
                <input name="userId" type="hidden" value={text(row.original.id)} />
                <Button size="sm" type="submit" variant="outline" className="h-8">Desbanear</Button>
              </form>
            )}
            <form action={async (fd) => {
              if(!confirm("¿Resetear contraseña a 'Adoptame123!'?")) return;
              const res = await adminResetPasswordAction(fd);
              if (res.error) toast.error(res.error);
              else toast.success(res.message || "Contraseña reseteada");
            }}>
              <input name="userId" type="hidden" value={text(row.original.id)} />
              <Button size="sm" type="submit" variant="ghost" className="h-8 w-8 p-0" title="Resetear contraseña">
                <Key className="size-4 text-orange-500" />
              </Button>
            </form>
          </div>
        );
      }
    }
  ];

  return <AdminDataTable columns={columns} data={data} />;
}

export function OrganizationsTable({ data }: { data: AdminRow[] }) {
  const columns: ColumnDef<AdminRow>[] = [
    {
      header: "Organización",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold">{text(row.original.name)}</span>
          <span className="text-[10px] text-muted-foreground">ID: {text(row.original.id).substring(0, 8)}...</span>
        </div>
      )
    },
    {
      header: "Verificación",
      cell: ({ row }) => (
        <form action={formAction(setOrganizationVerificationAction)} className="flex items-center gap-2">
          <input name="organizationId" type="hidden" value={text(row.original.id)} />
          <input name="isVerified" type="hidden" value={(!row.original.is_verified).toString()} />
          <Button size="sm" type="submit" variant={row.original.is_verified ? "outline" : "secondary"} className="h-8">
            {row.original.is_verified ? "Quitar Verificación" : "Verificar"}
          </Button>
        </form>
      )
    },
    {
      header: "Límite",
      cell: ({ row }) => (
        <form action={formAction(setOrganizationLimitAction)} className="flex items-center gap-2">
          <input name="organizationId" type="hidden" value={text(row.original.id)} />
          <Input 
            name="listingLimit" 
            type="number" 
            defaultValue={Number(row.original.listing_limit)} 
            className="h-8 w-20 text-xs" 
          />
          <Button size="sm" type="submit" variant="outline" className="h-8">Fijar</Button>
        </form>
      )
    }
  ];

  return <AdminDataTable columns={columns} data={data} />;
}

export function ReportsTable({ data }: { data: AdminRow[] }) {
  const columns: ColumnDef<AdminRow>[] = [
    { 
      header: "Mascota", 
      cell: ({ row }) => {
        const pet = (row.original.pet_listings as any);
        if (!pet) return "N/A";
        return (
          <Link href={`/pets/${pet.slug}`} target="_blank" className="text-blue-600 hover:underline font-bold flex items-center gap-1">
            {text(pet.name)}
            <ExternalLink className="size-3" />
          </Link>
        );
      }
    },
    { header: "Motivo", accessorKey: "reason" },
    { 
      header: "Fecha", 
      cell: ({ row }) => <span className="text-xs">{new Date(text(row.original.created_at)).toLocaleDateString()}</span> 
    }
  ];

  return <AdminDataTable columns={columns} data={data} />;
}
