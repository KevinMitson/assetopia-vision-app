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
      assets: {
        Row: {
          asset_no: string
          created_at: string | null
          department: string
          department_section: string
          designation: string | null
          equipment: string
          id: string
          last_maintenance: string | null
          location: string
          model: string
          next_maintenance: string | null
          oe_tag: string | null
          os: string | null
          pc_name: string | null
          purchase_date: string | null
          ram: string | null
          serial_no: string
          status: string
          storage: string | null
          updated_at: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          asset_no: string
          created_at?: string | null
          department: string
          department_section: string
          designation?: string | null
          equipment: string
          id?: string
          last_maintenance?: string | null
          location: string
          model: string
          next_maintenance?: string | null
          oe_tag?: string | null
          os?: string | null
          pc_name?: string | null
          purchase_date?: string | null
          ram?: string | null
          serial_no: string
          status: string
          storage?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          asset_no?: string
          created_at?: string | null
          department?: string
          department_section?: string
          designation?: string | null
          equipment?: string
          id?: string
          last_maintenance?: string | null
          location?: string
          model?: string
          next_maintenance?: string | null
          oe_tag?: string | null
          os?: string | null
          pc_name?: string | null
          purchase_date?: string | null
          ram?: string | null
          serial_no?: string
          status?: string
          storage?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      assignment_history: {
        Row: {
          asset_id: string
          created_at: string | null
          department: string | null
          from_date: string
          id: string
          reason: string | null
          to_date: string | null
          user_name: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          department?: string | null
          from_date: string
          id?: string
          reason?: string | null
          to_date?: string | null
          user_name?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          department?: string | null
          from_date?: string
          id?: string
          reason?: string | null
          to_date?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          designation: string | null
          email: string | null
          full_name: string | null
          id: string
          join_date: string | null
          phone: string | null
          station: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          designation?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          join_date?: string | null
          phone?: string | null
          station?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          designation?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          join_date?: string | null
          phone?: string | null
          station?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stations: {
        Row: {
          code: string
          created_at: string | null
          id: string
          location: string | null
          name: string
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          location?: string | null
          name: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          assetidentification: string
          assetnumber: string | null
          assignedto: string | null
          broadarea: string
          cause: string | null
          completedworksdatetime: string | null
          contact: string
          created_at: string
          designation: string
          details: string
          faulttype: string
          id: string
          initiatedworksdatetime: string | null
          loggeddatetime: string
          priority: string
          progressupdate: string
          referencenumber: string
          refinedarea: string | null
          reportedby: string
          resolution: string | null
          shiftallocation: string | null
          specificarea: string
          subassetnumber: string | null
          timeframedays: number | null
          toccoperatoronduty: string | null
          updated_at: string
        }
        Insert: {
          assetidentification: string
          assetnumber?: string | null
          assignedto?: string | null
          broadarea: string
          cause?: string | null
          completedworksdatetime?: string | null
          contact: string
          created_at?: string
          designation: string
          details: string
          faulttype: string
          id?: string
          initiatedworksdatetime?: string | null
          loggeddatetime?: string
          priority: string
          progressupdate: string
          referencenumber: string
          refinedarea?: string | null
          reportedby: string
          resolution?: string | null
          shiftallocation?: string | null
          specificarea: string
          subassetnumber?: string | null
          timeframedays?: number | null
          toccoperatoronduty?: string | null
          updated_at?: string
        }
        Update: {
          assetidentification?: string
          assetnumber?: string | null
          assignedto?: string | null
          broadarea?: string
          cause?: string | null
          completedworksdatetime?: string | null
          contact?: string
          created_at?: string
          designation?: string
          details?: string
          faulttype?: string
          id?: string
          initiatedworksdatetime?: string | null
          loggeddatetime?: string
          priority?: string
          progressupdate?: string
          referencenumber?: string
          refinedarea?: string | null
          reportedby?: string
          resolution?: string | null
          shiftallocation?: string | null
          specificarea?: string
          subassetnumber?: string | null
          timeframedays?: number | null
          toccoperatoronduty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
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

type PublicSchema = Database[Extract<keyof Database, "public">]

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
