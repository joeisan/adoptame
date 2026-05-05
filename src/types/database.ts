export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Enums: {
      user_role: "user" | "organization" | "moderator" | "super_admin";
      user_status: "active" | "banned" | "deleted";
      pet_status:
        | "draft"
        | "pending_review"
        | "published"
        | "in_process"
        | "adopted"
        | "suspended"
        | "deleted";
      pet_sex: "male" | "female" | "unknown";
      pet_size: "small" | "medium" | "large" | "unknown";
      report_status: "open" | "reviewing" | "resolved" | "rejected";
      report_type: "user" | "listing";
    };
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          role: Database["public"]["Enums"]["user_role"];
          status: Database["public"]["Enums"]["user_status"];
          phone: string | null;
          whatsapp: string | null;
          province: string | null;
          district: string | null;
          created_at: string;
          updated_at: string;
          banned_until: string | null;
          ban_reason: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          description: string | null;
          website_url: string | null;
          instagram_url: string | null;
          facebook_url: string | null;
          logo_url: string | null;
          is_verified: boolean;
          listing_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["organizations"]["Row"]> & {
          owner_id: string;
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [];
      };
      pet_listings: {
        Row: {
          id: string;
          owner_id: string;
          organization_id: string | null;
          category_id: string | null;
          name: string;
          slug: string;
          species: string | null;
          breed: string | null;
          age_value: number | null;
          age_unit: string | null;
          sex: Database["public"]["Enums"]["pet_sex"];
          size: Database["public"]["Enums"]["pet_size"];
          province: string;
          district: string | null;
          sector: string | null;
          latitude: number | null;
          longitude: number | null;
          description: string;
          story: string | null;
          health_notes: string | null;
          adoption_requirements: string | null;
          status: Database["public"]["Enums"]["pet_status"];
          contact_name: string | null;
          contact_phone: string | null;
          contact_whatsapp: string | null;
          contact_email: string | null;
          view_count: number;
          published_at: string | null;
          adopted_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["pet_listings"]["Row"]> & {
          owner_id: string;
          name: string;
          slug: string;
          province: string;
          description: string;
        };
        Update: Partial<Database["public"]["Tables"]["pet_listings"]["Row"]>;
        Relationships: [];
      };
      pet_images: {
        Row: {
          id: string;
          listing_id: string;
          storage_path: string;
          public_url: string | null;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["pet_images"]["Row"]> & {
          listing_id: string;
          storage_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["pet_images"]["Row"]>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          report_type: Database["public"]["Enums"]["report_type"];
          reported_user_id: string | null;
          reported_listing_id: string | null;
          reason: string;
          description: string | null;
          status: Database["public"]["Enums"]["report_status"];
          admin_notes: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reports"]["Row"]> & {
          reporter_id: string;
          report_type: Database["public"]["Enums"]["report_type"];
          reason: string;
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Row"]>;
        Relationships: [];
      };
      admin_actions: {
        Row: {
          id: string;
          admin_id: string;
          target_user_id: string | null;
          target_listing_id: string | null;
          action: string;
          metadata: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["admin_actions"]["Row"]> & {
          admin_id: string;
          action: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_actions"]["Row"]>;
        Relationships: [];
      };
      app_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Database["public"]["Tables"]["app_settings"]["Row"];
        Update: Partial<Database["public"]["Tables"]["app_settings"]["Row"]>;
        Relationships: [];
      };
      user_favorites: {
        Row: {
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_favorites"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
