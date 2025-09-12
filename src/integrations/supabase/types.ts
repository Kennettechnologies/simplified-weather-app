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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          created_at: string
          credit_limit: number | null
          current_balance: number | null
          customer_name: string
          customer_type: string
          email: string | null
          id: string
          is_active: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          credit_limit?: number | null
          current_balance?: number | null
          customer_name: string
          customer_type?: string
          email?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          credit_limit?: number | null
          current_balance?: number | null
          customer_name?: string
          customer_type?: string
          email?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      egg_production: {
        Row: {
          avg_egg_weight: number | null
          created_at: string
          eggs_collected: number
          eggs_cracked: number | null
          eggs_good: number | null
          eggs_spoiled: number | null
          flock_id: string | null
          id: string
          notes: string | null
          production_date: string
          recorded_by: string | null
        }
        Insert: {
          avg_egg_weight?: number | null
          created_at?: string
          eggs_collected?: number
          eggs_cracked?: number | null
          eggs_good?: number | null
          eggs_spoiled?: number | null
          flock_id?: string | null
          id?: string
          notes?: string | null
          production_date?: string
          recorded_by?: string | null
        }
        Update: {
          avg_egg_weight?: number | null
          created_at?: string
          eggs_collected?: number
          eggs_cracked?: number | null
          eggs_good?: number | null
          eggs_spoiled?: number | null
          flock_id?: string | null
          id?: string
          notes?: string | null
          production_date?: string
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "egg_production_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "egg_production_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_by: string | null
          created_at: string
          description: string
          expense_category: string
          expense_date: string
          id: string
          payment_method: string | null
          receipt_number: string | null
          vendor: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          created_at?: string
          description: string
          expense_category: string
          expense_date?: string
          id?: string
          payment_method?: string | null
          receipt_number?: string | null
          vendor?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          created_at?: string
          description?: string
          expense_category?: string
          expense_date?: string
          id?: string
          payment_method?: string | null
          receipt_number?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_logs: {
        Row: {
          created_at: string
          date_fed: string
          fed_by: string | null
          feed_id: string | null
          feeding_time: string
          flock_id: string | null
          id: string
          notes: string | null
          quantity_kg: number
        }
        Insert: {
          created_at?: string
          date_fed?: string
          fed_by?: string | null
          feed_id?: string | null
          feeding_time: string
          flock_id?: string | null
          id?: string
          notes?: string | null
          quantity_kg: number
        }
        Update: {
          created_at?: string
          date_fed?: string
          fed_by?: string | null
          feed_id?: string | null
          feeding_time?: string
          flock_id?: string | null
          id?: string
          notes?: string | null
          quantity_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "feed_logs_fed_by_fkey"
            columns: ["fed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_logs_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "feeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_logs_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
        ]
      }
      feeds: {
        Row: {
          cost_per_kg: number
          created_at: string
          expiry_date: string | null
          feed_name: string
          feed_type: string
          id: string
          minimum_stock_alert: number | null
          stock_quantity_kg: number
          supplier: string | null
          updated_at: string
        }
        Insert: {
          cost_per_kg: number
          created_at?: string
          expiry_date?: string | null
          feed_name: string
          feed_type: string
          id?: string
          minimum_stock_alert?: number | null
          stock_quantity_kg?: number
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          cost_per_kg?: number
          created_at?: string
          expiry_date?: string | null
          feed_name?: string
          feed_type?: string
          id?: string
          minimum_stock_alert?: number | null
          stock_quantity_kg?: number
          supplier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      flocks: {
        Row: {
          age_weeks: number
          breed: string
          cost_per_bird: number | null
          created_at: string
          created_by: string | null
          current_quantity: number
          date_acquired: string
          flock_id: string
          flock_type: string
          id: string
          initial_quantity: number
          notes: string | null
          pen_location: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          age_weeks?: number
          breed: string
          cost_per_bird?: number | null
          created_at?: string
          created_by?: string | null
          current_quantity: number
          date_acquired: string
          flock_id: string
          flock_type: string
          id?: string
          initial_quantity: number
          notes?: string | null
          pen_location?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          age_weeks?: number
          breed?: string
          cost_per_bird?: number | null
          created_at?: string
          created_by?: string | null
          current_quantity?: number
          date_acquired?: string
          flock_id?: string
          flock_type?: string
          id?: string
          initial_quantity?: number
          notes?: string | null
          pen_location?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          created_at: string
          date_recorded: string
          flock_id: string | null
          id: string
          medication_used: string | null
          mortality_cause: string | null
          mortality_count: number | null
          notes: string | null
          record_type: string
          treatment_description: string | null
          vaccination_id: string | null
          vet_id: string | null
        }
        Insert: {
          created_at?: string
          date_recorded?: string
          flock_id?: string | null
          id?: string
          medication_used?: string | null
          mortality_cause?: string | null
          mortality_count?: number | null
          notes?: string | null
          record_type: string
          treatment_description?: string | null
          vaccination_id?: string | null
          vet_id?: string | null
        }
        Update: {
          created_at?: string
          date_recorded?: string
          flock_id?: string | null
          id?: string
          medication_used?: string | null
          mortality_cause?: string | null
          mortality_count?: number | null
          notes?: string | null
          record_type?: string
          treatment_description?: string | null
          vaccination_id?: string | null
          vet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_records_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_vaccination_id_fkey"
            columns: ["vaccination_id"]
            isOneToOne: false
            referencedRelation: "vaccinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_vet_id_fkey"
            columns: ["vet_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          cost_per_unit: number | null
          created_at: string
          current_stock: number
          id: string
          item_category: string
          item_name: string
          last_restocked: string | null
          minimum_stock_level: number | null
          supplier: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string
          current_stock?: number
          id?: string
          item_category: string
          item_name: string
          last_restocked?: string | null
          minimum_stock_level?: number | null
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string
          current_stock?: number
          id?: string
          item_category?: string
          item_name?: string
          last_restocked?: string | null
          minimum_stock_level?: number | null
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      meat_production: {
        Row: {
          average_weight_kg: number | null
          birds_processed: number
          created_at: string
          flock_id: string | null
          grade: string | null
          id: string
          notes: string | null
          processed_by: string | null
          processing_date: string
          total_weight_kg: number
        }
        Insert: {
          average_weight_kg?: number | null
          birds_processed: number
          created_at?: string
          flock_id?: string | null
          grade?: string | null
          id?: string
          notes?: string | null
          processed_by?: string | null
          processing_date: string
          total_weight_kg: number
        }
        Update: {
          average_weight_kg?: number | null
          birds_processed?: number
          created_at?: string
          flock_id?: string | null
          grade?: string | null
          id?: string
          notes?: string | null
          processed_by?: string | null
          processing_date?: string
          total_weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "meat_production_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meat_production_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permissions: string[]
          resource: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          permissions?: string[]
          resource: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          permissions?: string[]
          resource?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      sales: {
        Row: {
          created_at: string
          customer_id: string | null
          flock_id: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string
          product_type: string
          quantity: number
          sale_date: string
          sold_by: string | null
          total_amount: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          flock_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          product_type: string
          quantity: number
          sale_date?: string
          sold_by?: string | null
          total_amount?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          flock_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          product_type?: string
          quantity?: number
          sale_date?: string
          sold_by?: string | null
          total_amount?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_sold_by_fkey"
            columns: ["sold_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_cities: {
        Row: {
          city_name: string
          country_code: string
          created_at: string
          id: string
          is_default: boolean
          latitude: number
          longitude: number
          state_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city_name: string
          country_code: string
          created_at?: string
          id?: string
          is_default?: boolean
          latitude: number
          longitude: number
          state_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city_name?: string
          country_code?: string
          created_at?: string
          id?: string
          is_default?: boolean
          latitude?: number
          longitude?: number
          state_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          bank_details: string | null
          created_at: string
          department: string
          emergency_contact: string | null
          employee_id: string
          hire_date: string
          id: string
          is_active: boolean
          position: string
          profile_id: string | null
          salary: number | null
          updated_at: string
        }
        Insert: {
          bank_details?: string | null
          created_at?: string
          department: string
          emergency_contact?: string | null
          employee_id: string
          hire_date: string
          id?: string
          is_active?: boolean
          position: string
          profile_id?: string | null
          salary?: number | null
          updated_at?: string
        }
        Update: {
          bank_details?: string | null
          created_at?: string
          department?: string
          emergency_contact?: string | null
          employee_id?: string
          hire_date?: string
          id?: string
          is_active?: boolean
          position?: string
          profile_id?: string | null
          salary?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_access_audit: {
        Row: {
          accessed_at: string
          accessed_by: string | null
          id: string
          ip_address: unknown | null
          operation: string
          sensitive_data_accessed: boolean | null
          staff_record_id: string | null
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string
          accessed_by?: string | null
          id?: string
          ip_address?: unknown | null
          operation: string
          sensitive_data_accessed?: boolean | null
          staff_record_id?: string | null
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string
          accessed_by?: string | null
          id?: string
          ip_address?: unknown | null
          operation?: string
          sensitive_data_accessed?: boolean | null
          staff_record_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_date: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          flock_id: string | null
          id: string
          priority: string
          status: string
          task_description: string | null
          task_title: string
          task_type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          flock_id?: string | null
          id?: string
          priority?: string
          status?: string
          task_description?: string | null
          task_title: string
          task_type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          flock_id?: string | null
          id?: string
          priority?: string
          status?: string
          task_description?: string | null
          task_title?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          daily_forecast_push: boolean
          default_city_id: string | null
          id: string
          language: string
          notifications_enabled: boolean
          severe_weather_alerts: boolean
          temperature_unit: string
          theme: string
          updated_at: string
          user_id: string
          wind_speed_unit: string
        }
        Insert: {
          created_at?: string
          daily_forecast_push?: boolean
          default_city_id?: string | null
          id?: string
          language?: string
          notifications_enabled?: boolean
          severe_weather_alerts?: boolean
          temperature_unit?: string
          theme?: string
          updated_at?: string
          user_id: string
          wind_speed_unit?: string
        }
        Update: {
          created_at?: string
          daily_forecast_push?: boolean
          default_city_id?: string | null
          id?: string
          language?: string
          notifications_enabled?: boolean
          severe_weather_alerts?: boolean
          temperature_unit?: string
          theme?: string
          updated_at?: string
          user_id?: string
          wind_speed_unit?: string
        }
        Relationships: []
      }
      vaccinations: {
        Row: {
          batch_number: string | null
          cost_per_dose: number | null
          created_at: string
          doses_available: number | null
          expiry_date: string | null
          id: string
          storage_requirements: string | null
          supplier: string | null
          vaccine_name: string
          vaccine_type: string
        }
        Insert: {
          batch_number?: string | null
          cost_per_dose?: number | null
          created_at?: string
          doses_available?: number | null
          expiry_date?: string | null
          id?: string
          storage_requirements?: string | null
          supplier?: string | null
          vaccine_name: string
          vaccine_type: string
        }
        Update: {
          batch_number?: string | null
          cost_per_dose?: number | null
          created_at?: string
          doses_available?: number | null
          expiry_date?: string | null
          id?: string
          storage_requirements?: string | null
          supplier?: string | null
          vaccine_name?: string
          vaccine_type?: string
        }
        Relationships: []
      }
      weather_alerts: {
        Row: {
          alert_type: string
          city_id: string
          created_at: string
          description: string
          end_time: string | null
          id: string
          is_read: boolean
          severity: string
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          city_id: string
          created_at?: string
          description: string
          end_time?: string | null
          id?: string
          is_read?: boolean
          severity: string
          start_time: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          city_id?: string
          created_at?: string
          description?: string
          end_time?: string | null
          id?: string
          is_read?: boolean
          severity?: string
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      weather_cache: {
        Row: {
          cache_type: string
          city_id: string
          created_at: string
          expires_at: string
          forecast_data: Json | null
          id: string
          weather_data: Json
        }
        Insert: {
          cache_type: string
          city_id: string
          created_at?: string
          expires_at: string
          forecast_data?: Json | null
          id?: string
          weather_data: Json
        }
        Update: {
          cache_type?: string
          city_id?: string
          created_at?: string
          expires_at?: string
          forecast_data?: Json | null
          id?: string
          weather_data?: Json
        }
        Relationships: []
      }
    }
    Views: {
      staff_summary: {
        Row: {
          bank_details: string | null
          created_at: string | null
          department: string | null
          emergency_contact: string | null
          employee_id: string | null
          hire_date: string | null
          id: string | null
          is_active: boolean | null
          position: string | null
          salary: number | null
          updated_at: string | null
        }
        Insert: {
          bank_details?: never
          created_at?: string | null
          department?: string | null
          emergency_contact?: string | null
          employee_id?: string | null
          hire_date?: string | null
          id?: string | null
          is_active?: boolean | null
          position?: string | null
          salary?: never
          updated_at?: string | null
        }
        Update: {
          bank_details?: never
          created_at?: string | null
          department?: string | null
          emergency_contact?: string | null
          employee_id?: string | null
          hire_date?: string | null
          id?: string | null
          is_active?: boolean | null
          position?: string | null
          salary?: never
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      enable_emergency_staff_access: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_permission: {
        Args: { permission: string; resource: string }
        Returns: boolean
      }
      is_business_hours: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_staff_access: {
        Args: { access_type?: string; staff_id: string }
        Returns: undefined
      }
    }
    Enums: {
      user_role:
        | "farm_owner"
        | "farm_manager"
        | "veterinarian"
        | "worker"
        | "accountant"
        | "customer"
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
      user_role: [
        "farm_owner",
        "farm_manager",
        "veterinarian",
        "worker",
        "accountant",
        "customer",
      ],
    },
  },
} as const
