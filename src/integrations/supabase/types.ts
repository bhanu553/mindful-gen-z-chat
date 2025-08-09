export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          mode: string | null
          role: string
          sentiment_score: number | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          mode?: string | null
          role: string
          sentiment_score?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          mode?: string | null
          role?: string
          sentiment_score?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          current_mode: string | null
          id: string
          is_complete: boolean | null
          message_count: number | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_mode?: string | null
          id?: string
          is_complete?: boolean | null
          message_count?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_mode?: string | null
          id?: string
          is_complete?: boolean | null
          message_count?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      mode_transitions: {
        Row: {
          id: string
          new_mode: string | null
          old_mode: string | null
          session_id: string | null
          switched_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          new_mode?: string | null
          old_mode?: string | null
          session_id?: string | null
          switched_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          new_mode?: string | null
          old_mode?: string | null
          session_id?: string | null
          switched_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mode_transitions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_premium: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_premium?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_premium?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      therapy_messages: {
        Row: {
          content: string
          id: string
          sender: Database["public"]["Enums"]["message_sender"]
          session_id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          content: string
          id?: string
          sender: Database["public"]["Enums"]["message_sender"]
          session_id: string
          timestamp?: string
          user_id: string
        }
        Update: {
          content?: string
          id?: string
          sender?: Database["public"]["Enums"]["message_sender"]
          session_id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapy_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapy_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      therapy_sessions: {
        Row: {
          created_at: string
          id: string
          mode: Database["public"]["Enums"]["therapy_mode"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mode: Database["public"]["Enums"]["therapy_mode"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["therapy_mode"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      uploads: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          created_at: string
          id: string
          note_date: string
          note_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note_date: string
          note_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note_date?: string
          note_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_onboarding: {
        Row: {
          age: number | null
          ai_substitute_consent: boolean | null
          calendar_reminders_consent: boolean | null
          completed: boolean | null
          country: string | null
          created_at: string
          current_crisis: boolean | null
          current_medication: boolean | null
          current_struggles: string[] | null
          data_processing_consent: boolean | null
          email: string | null
          emergency_responsibility_consent: boolean | null
          full_name: string | null
          gender: string | null
          id: string
          last_self_harm_occurrence: string | null
          mental_health_rating: number | null
          other_struggles: string | null
          phone_number: string | null
          previous_therapy: boolean | null
          self_harm_thoughts: boolean | null
          therapy_types: string[] | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          ai_substitute_consent?: boolean | null
          calendar_reminders_consent?: boolean | null
          completed?: boolean | null
          country?: string | null
          created_at?: string
          current_crisis?: boolean | null
          current_medication?: boolean | null
          current_struggles?: string[] | null
          data_processing_consent?: boolean | null
          email?: string | null
          emergency_responsibility_consent?: boolean | null
          full_name?: string | null
          gender?: string | null
          id?: string
          last_self_harm_occurrence?: string | null
          mental_health_rating?: number | null
          other_struggles?: string | null
          phone_number?: string | null
          previous_therapy?: boolean | null
          self_harm_thoughts?: boolean | null
          therapy_types?: string[] | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          ai_substitute_consent?: boolean | null
          calendar_reminders_consent?: boolean | null
          completed?: boolean | null
          country?: string | null
          created_at?: string
          current_crisis?: boolean | null
          current_medication?: boolean | null
          current_struggles?: string[] | null
          data_processing_consent?: boolean | null
          email?: string | null
          emergency_responsibility_consent?: boolean | null
          full_name?: string | null
          gender?: string | null
          id?: string
          last_self_harm_occurrence?: string | null
          mental_health_rating?: number | null
          other_struggles?: string | null
          phone_number?: string | null
          previous_therapy?: boolean | null
          self_harm_thoughts?: boolean | null
          therapy_types?: string[] | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      message_sender: "user" | "ai"
      therapy_mode: "Reflect" | "Recover" | "Rebuild" | "Evolve"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      message_sender: ["user", "ai"],
      therapy_mode: ["Reflect", "Recover", "Rebuild", "Evolve"],
    },
  },
} as const
