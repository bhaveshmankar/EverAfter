export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      venues: {
        Row: {
          id: string
          name: string
          description: string
          location: string
          capacity: Json
          amenities: string[]
          images: string[]
          price_per_hour: number
          base_price: number
          created_at: string
          tags: string[]
        }
        Insert: {
          id?: string
          name: string
          description: string
          location: string
          capacity: Json
          amenities: string[]
          images: string[]
          price_per_hour: number
          base_price: number
          created_at?: string
          tags?: string[]
        }
        Update: {
          id?: string
          name?: string
          description?: string
          location?: string
          capacity?: Json
          amenities?: string[]
          images?: string[]
          price_per_hour?: number
          base_price?: number
          created_at?: string
          tags?: string[]
        }
      }
      bookings: {
        Row: {
          id: string
          venue_id: string
          date: string
          end_date: string | null
          time_slot: string
          guest_count: number
          price: number
          contact_name: string
          contact_email: string
          contact_phone: string
          special_requests: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          venue_id: string
          date: string
          end_date?: string | null
          time_slot: string
          guest_count: number
          price: number
          contact_name: string
          contact_email: string
          contact_phone: string
          special_requests?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          venue_id?: string
          date?: string
          end_date?: string | null
          time_slot?: string
          guest_count?: number
          price?: number
          contact_name?: string
          contact_email?: string
          contact_phone?: string
          special_requests?: string | null
          status?: string
          created_at?: string
        }
      }
      venue_availability: {
        Row: {
          id: string
          venue_id: string
          date: string
          is_available: boolean
        }
        Insert: {
          id?: string
          venue_id: string
          date: string
          is_available: boolean
        }
        Update: {
          id?: string
          venue_id?: string
          date?: string
          is_available?: boolean
        }
      }
      venue_pricing_rules: {
        Row: {
          id: string
          venue_id: string
          rule_type: string
          adjustment_type: string
          adjustment_value: number
          condition: Json
        }
        Insert: {
          id?: string
          venue_id: string
          rule_type: string
          adjustment_type: string
          adjustment_value: number
          condition: Json
        }
        Update: {
          id?: string
          venue_id?: string
          rule_type?: string
          adjustment_type?: string
          adjustment_value?: number
          condition?: Json
        }
      }
      venue_visits: {
        Row: {
          id: string
          venue_id: string
          name: string
          email: string
          phone: string
          preferred_date: string
          preferred_time: string
          notes: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          venue_id: string
          name: string
          email: string
          phone: string
          preferred_date: string
          preferred_time: string
          notes?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          venue_id?: string
          name?: string
          email?: string
          phone?: string
          preferred_date?: string
          preferred_time?: string
          notes?: string | null
          status?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 