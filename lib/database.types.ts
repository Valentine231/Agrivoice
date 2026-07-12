/**
 * Hand-written to match supabase/migrations/0001_init.sql.
 *
 * Once your project is linked to Supabase, regenerate this properly with:
 *   npx supabase gen types typescript --project-id <your-project-ref> > lib/database.types.ts
 * so it can never silently drift from the real schema.
 */

export type UserRole = "farmer" | "buyer" | "transporter" | "admin";
export type ProductCategoryDb = "cashCrop" | "perishable" | "grain" | "livestock" | "tuber";
export type ProductStatus = "active" | "sold" | "archived";
export type OrderStatusDb = "pending" | "in_escrow" | "shipped" | "completed" | "disputed" | "cancelled";;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string | null;
          state: string | null;
          preferred_language: string;
          paystack_recipient_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          farmer_id: string;
          category: ProductCategoryDb;
          crop_name: string;
          quantity_label: string;
          unit: string;
          price_per_unit: number;
          state: string;
          image_url: string | null;
          status: ProductStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at" | "status"> & {
          id?: string;
          status?: ProductStatus;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          product_id: string;
          buyer_id: string;
          farmer_id: string;
          crop_name: string;
          quantity_label: string;
          goods_total: number;
          transport_option_id: string | null;
          transport_name: string | null;
          transport_cost: number;
          grand_total: number;
          buyer_email: string;
          status: OrderStatusDb;
          paystack_reference: string | null;
          paid_at: string | null;
          delivered_confirmed_at: string | null;
          shipped_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["orders"]["Row"],
          "id" | "created_at" | "updated_at" | "status" | "paid_at" | "delivered_confirmed_at" | "shipped_at"
        > & {
          id?: string;
          status?: OrderStatusDb;
          shipped_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          product_id: string | null;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at" | "read"> & {
          id?: string;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      product_category: ProductCategoryDb;
      product_status: ProductStatus;
      order_status: OrderStatusDb;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

