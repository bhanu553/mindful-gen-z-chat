export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
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
          session_first_message: string | null
          title: string | null
          user_id: string | null
          ended_at: string | null
          cooldown_until: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_mode?: string | null
          id?: string
          is_complete?: boolean | null
          message_count?: number | null
          session_first_message?: string | null
          title?: string | null
          user_id?: string | null
          ended_at?: string | null
          cooldown_until?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_mode?: string | null
          id?: string
          is_complete?: boolean | null
          message_count?: number | null
          session_first_message?: string | null
          title?: string | null
          user_id?: string | null
          ended_at?: string | null
          cooldown_until?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_premium: boolean | null
          payment_status: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_premium?: boolean | null
          payment_status?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_premium?: boolean | null
          payment_status?: string | null
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
          ai_analysis: string | null
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
          primary_focus: string | null
          self_harm_thoughts: boolean | null
          therapy_types: string[] | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          ai_analysis?: string | null
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
          primary_focus?: string | null
          self_harm_thoughts?: boolean | null
          therapy_types?: string[] | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          ai_analysis?: string | null
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
          primary_focus?: string | null
          self_harm_thoughts?: boolean | null
          therapy_types?: string[] | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          user_id: string
          paypal_order_id: string
          paypal_payment_id: string | null
          amount: number
          currency: string
          status: string
          payment_method: string
          created_at: string
          updated_at: string
          completed_at: string | null
          webhook_data: Json | null
          verification_hash: string | null
        }
        Insert: {
          id?: string
          user_id: string
          paypal_order_id: string
          paypal_payment_id?: string | null
          amount: number
          currency?: string
          status: string
          payment_method?: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          webhook_data?: Json | null
          verification_hash?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          paypal_order_id?: string
          paypal_payment_id?: string | null
          amount?: number
          currency?: string
          status?: string
          payment_method?: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          webhook_data?: Json | null
          verification_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_credits: {
        Row: {
          id: string
          user_id: string
          payment_id: string | null
          credit_type: string
          sessions_granted: number
          sessions_used: number
          sessions_remaining: number
          expires_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          used_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          payment_id?: string | null
          credit_type: string
          sessions_granted?: number
          sessions_used?: number
          sessions_remaining?: number
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          used_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          payment_id?: string | null
          credit_type?: string
          sessions_granted?: number
          sessions_used?: number
          sessions_remaining?: number
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_credits_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          }
        ]
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
