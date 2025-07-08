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
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      event_purchases: {
        Row: {
          amount_paid: number
          created_at: string
          currency: string | null
          event_id: string
          id: string
          payment_status: string | null
          purchase_date: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          ticket_quantity: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string
          currency?: string | null
          event_id: string
          id?: string
          payment_status?: string | null
          purchase_date?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          ticket_quantity?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          currency?: string | null
          event_id?: string
          id?: string
          payment_status?: string | null
          purchase_date?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          ticket_quantity?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_purchases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          capacity: number | null
          category_id: string | null
          created_at: string
          description: string
          end_date: string | null
          event_date: string
          id: string
          image_url: string | null
          latitude: number | null
          location: string
          longitude: number | null
          organizer_id: string
          short_description: string | null
          status: Database["public"]["Enums"]["event_status"] | null
          tags: string[] | null
          ticket_price: number | null
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          category_id?: string | null
          created_at?: string
          description: string
          end_date?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          location: string
          longitude?: number | null
          organizer_id: string
          short_description?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          tags?: string[] | null
          ticket_price?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          capacity?: number | null
          category_id?: string | null
          created_at?: string
          description?: string
          end_date?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          organizer_id?: string
          short_description?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          tags?: string[] | null
          ticket_price?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email_notifications: boolean | null
          full_name: string | null
          id: string
          location: string | null
          preferred_categories: string[] | null
          push_notifications: boolean | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email_notifications?: boolean | null
          full_name?: string | null
          id: string
          location?: string | null
          preferred_categories?: string[] | null
          push_notifications?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          location?: string | null
          preferred_categories?: string[] | null
          push_notifications?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          id: string
          subscription: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subscription: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subscription?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      review_responses: {
        Row: {
          admin_user_id: string
          created_at: string
          id: string
          response_content: string
          review_id: string
          updated_at: string
        }
        Insert: {
          admin_user_id: string
          created_at?: string
          id?: string
          response_content: string
          review_id: string
          updated_at?: string
        }
        Update: {
          admin_user_id?: string
          created_at?: string
          id?: string
          response_content?: string
          review_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          created_at: string
          id: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_helpful?: boolean
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          ai_summary: string | null
          atmosphere_rating: number | null
          content: string
          created_at: string
          event_id: string
          helpful_count: number | null
          id: string
          images: string[] | null
          organization_rating: number | null
          rating: number
          sentiment: string | null
          sentiment_confidence: number | null
          sentiment_score: number | null
          status: Database["public"]["Enums"]["review_status"] | null
          title: string
          updated_at: string
          user_id: string
          value_rating: number | null
          verified_attendance: boolean | null
        }
        Insert: {
          ai_summary?: string | null
          atmosphere_rating?: number | null
          content: string
          created_at?: string
          event_id: string
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          organization_rating?: number | null
          rating: number
          sentiment?: string | null
          sentiment_confidence?: number | null
          sentiment_score?: number | null
          status?: Database["public"]["Enums"]["review_status"] | null
          title: string
          updated_at?: string
          user_id: string
          value_rating?: number | null
          verified_attendance?: boolean | null
        }
        Update: {
          ai_summary?: string | null
          atmosphere_rating?: number | null
          content?: string
          created_at?: string
          event_id?: string
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          organization_rating?: number | null
          rating?: number
          sentiment?: string | null
          sentiment_confidence?: number | null
          sentiment_score?: number | null
          status?: Database["public"]["Enums"]["review_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
          value_rating?: number | null
          verified_attendance?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          attendance_id: string | null
          created_at: string
          event_id: string
          generated_at: string
          id: string
          purchase_id: string | null
          qr_code_data: string
          ticket_number: string
          updated_at: string
          user_id: string
          validated_at: string | null
          validated_by: string | null
          validation_status: string | null
        }
        Insert: {
          attendance_id?: string | null
          created_at?: string
          event_id: string
          generated_at?: string
          id?: string
          purchase_id?: string | null
          qr_code_data: string
          ticket_number: string
          updated_at?: string
          user_id: string
          validated_at?: string | null
          validated_by?: string | null
          validation_status?: string | null
        }
        Update: {
          attendance_id?: string | null
          created_at?: string
          event_id?: string
          generated_at?: string
          id?: string
          purchase_id?: string | null
          qr_code_data?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "user_event_attendance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "event_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_name: string
          achievement_type: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          progress: number | null
          target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_name: string
          achievement_type: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number | null
          target: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_name?: string
          achievement_type?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number | null
          target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          page_url: string
          session_id: string
          timestamp: string
          user_agent: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json
          event_type: string
          id?: string
          page_url: string
          session_id: string
          timestamp: string
          user_agent: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          page_url?: string
          session_id?: string
          timestamp?: string
          user_agent?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_description: string | null
          badge_icon: string | null
          badge_name: string
          badge_type: string
          criteria_met: boolean
          earned_at: string
          id: string
          points_awarded: number | null
          user_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_icon?: string | null
          badge_name: string
          badge_type: string
          criteria_met?: boolean
          earned_at?: string
          id?: string
          points_awarded?: number | null
          user_id: string
        }
        Update: {
          badge_description?: string | null
          badge_icon?: string | null
          badge_name?: string
          badge_type?: string
          criteria_met?: boolean
          earned_at?: string
          id?: string
          points_awarded?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_event_attendance: {
        Row: {
          attendance_status: string | null
          created_at: string
          event_id: string
          id: string
          purchase_id: string | null
          user_id: string
        }
        Insert: {
          attendance_status?: string | null
          created_at?: string
          event_id: string
          id?: string
          purchase_id?: string | null
          user_id: string
        }
        Update: {
          attendance_status?: string | null
          created_at?: string
          event_id?: string
          id?: string
          purchase_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_event_attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_event_attendance_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "event_purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_event_attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          end_time: string | null
          events_count: number
          id: string
          page_views: number
          session_id: string
          start_time: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          events_count?: number
          id?: string
          page_views?: number
          session_id: string
          start_time: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          end_time?: string | null
          events_count?: number
          id?: string
          page_views?: number
          session_id?: string
          start_time?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_user_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_regular_user_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      event_status: "draft" | "published" | "cancelled" | "completed"
      notification_type:
        | "new_event"
        | "review_response"
        | "event_reminder"
        | "system"
        | "new_review"
      review_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "moderator", "user"],
      event_status: ["draft", "published", "cancelled", "completed"],
      notification_type: [
        "new_event",
        "review_response",
        "event_reminder",
        "system",
        "new_review",
      ],
      review_status: ["pending", "approved", "rejected"],
    },
  },
} as const
