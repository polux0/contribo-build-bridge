export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      job_descriptions: {
        Row: {
          email: string | null
          file_path: string
          file_size: number | null
          filename: string
          id: string
          mime_type: string | null
          public_url: string | null
          uploaded_at: string
        }
        Insert: {
          email?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          mime_type?: string | null
          public_url?: string | null
          uploaded_at?: string
        }
        Update: {
          email?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          mime_type?: string | null
          public_url?: string | null
          uploaded_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          github_username: string | null
          google_profile: string | null
          id: string
          linkedin_profile: string | null
          name: string | null
          privy_user_id: string | null
          updated_at: string
          user_id: string | null
          wallet_address: string | null
          wallet_type: string | null
          auth_provider: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          github_username?: string | null
          google_profile?: string | null
          id: string
          linkedin_profile?: string | null
          name?: string | null
          privy_user_id?: string | null
          updated_at?: string
          user_id?: string | null
          wallet_address?: string | null
          wallet_type?: string | null
          auth_provider?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          github_username?: string | null
          google_profile?: string | null
          id?: string
          linkedin_profile?: string | null
          name?: string | null
          privy_user_id?: string | null
          updated_at?: string
          user_id?: string | null
          wallet_address?: string | null
          wallet_type?: string | null
          auth_provider?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          email: string | null
          file_path: string
          file_size: number | null
          filename: string
          id: string
          mime_type: string | null
          public_url: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          email?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          mime_type?: string | null
          public_url?: string | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          email?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          mime_type?: string | null
          public_url?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumes_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      opportunities: {
        Row: {
          chain_id: number
          company_name: string
          created_at: string
          deadline: string
          id: string
          issue_url: string
          payout_amount: number
          payout_token: string
          repo_url: string
          short_desc: string
          long_description_url: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          chain_id: number
          company_name: string
          created_at?: string
          deadline: string
          id?: string
          issue_url: string
          payout_amount: number
          payout_token: string
          repo_url: string
          short_desc: string
          long_description_url?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          chain_id?: number
          company_name?: string
          created_at?: string
          deadline?: string
          id?: string
          issue_url?: string
          payout_amount?: number
          payout_token?: string
          repo_url?: string
          short_desc?: string
          long_description_url?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          id: string
          opportunity_id: string
          user_id: string
          payload: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          opportunity_id: string
          user_id: string
          payload?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          opportunity_id?: string
          user_id?: string
          payload?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_fk"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      // NEW TABLES
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          total_budget: number
          total_timeline_days: number
          currency: string
          complexity: string
          repo_url: string | null
          design_link: string | null
          dependencies: string | null
          uploaded_files: Json
          status: string
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          total_budget: number
          total_timeline_days: number
          currency?: string
          complexity?: string
          repo_url?: string | null
          design_link?: string | null
          dependencies?: string | null
          uploaded_files?: Json
          status?: string
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          total_budget?: number
          total_timeline_days?: number
          currency?: string
          complexity?: string
          repo_url?: string | null
          design_link?: string | null
          dependencies?: string | null
          uploaded_files?: Json
          status?: string
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      milestones: {
        Row: {
          id: string
          project_id: string
          title: string
          outcome: string
          proof_requirements: string
          video_requirements: string
          timeline_days: number
          reward_amount: number
          currency: string
          payout_percentage: number
          start_date: string | null
          end_date: string | null
          order_index: number
          status: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          outcome: string
          proof_requirements: string
          video_requirements: string
          timeline_days: number
          reward_amount: number
          currency?: string
          payout_percentage: number
          start_date?: string | null
          end_date?: string | null
          order_index: number
          status?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          outcome?: string
          proof_requirements?: string
          video_requirements?: string
          timeline_days?: number
          reward_amount?: number
          currency?: string
          payout_percentage?: number
          start_date?: string | null
          end_date?: string | null
          order_index?: number
          status?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_fk"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_project_with_milestones: {
        Args: {
          p_user_id: string
          p_title: string
          p_description: string
          p_total_budget: number
          p_total_timeline_days: number
          p_currency: string
          p_complexity: string
          p_repo_url?: string
          p_design_link?: string
          p_dependencies?: string
          p_uploaded_files?: Json
          p_milestones?: Json
        }
        Returns: string
      }
      update_project_status: {
        Args: {
          p_project_id: string
          p_status: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
