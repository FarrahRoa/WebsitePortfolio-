export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      site_content: {
        Row: {
          id: string;
          section_key: string;
          content_json: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_key: string;
          content_json: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section_key?: string;
          content_json?: Json;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          title: string;
          description: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      skills: {
        Row: {
          id: string;
          category: "video_editing" | "ai_creative" | "software_tools";
          skill_name: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          category: "video_editing" | "ai_creative" | "software_tools";
          skill_name: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          category?: "video_editing" | "ai_creative" | "software_tools";
          skill_name?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      tools: {
        Row: {
          id: string;
          name: string;
          icon_url: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon_url?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon_url?: string | null;
          display_order?: number;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          category: "ai_ugc" | "broll_vo" | "ai_creatives";
          tags: string[];
          video_url: string;
          thumbnail_url: string | null;
          is_featured: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category: "ai_ugc" | "broll_vo" | "ai_creatives";
          tags?: string[];
          video_url: string;
          thumbnail_url?: string | null;
          is_featured?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: "ai_ugc" | "broll_vo" | "ai_creatives";
          tags?: string[];
          video_url?: string;
          thumbnail_url?: string | null;
          is_featured?: boolean;
          display_order?: number;
          created_at?: string;
        };
      };
      portfolio_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      resume: {
        Row: {
          id: string;
          file_url: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          file_url: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          file_url?: string;
          updated_at?: string;
        };
      };
      contact_info: {
        Row: {
          id: string;
          email: string;
          phone: string;
          linkedin_url: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          phone: string;
          linkedin_url: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string;
          linkedin_url?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      skill_category: "video_editing" | "ai_creative" | "software_tools";
      portfolio_category: "ai_ugc" | "broll_vo" | "ai_creatives";
    };
  };
};
