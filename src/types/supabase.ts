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
      assets: {
        Row: {
          created_at: string
          description: string
          estimated_value: number
          id: string
          image_url: string
          loan_id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          estimated_value: number
          id?: string
          image_url?: string
          loan_id: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          estimated_value?: number
          id?: string
          image_url?: string
          loan_id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_loan_id_fkey"
            columns: ["loan_id"]
            referencedRelation: "loans"
            referencedColumns: ["id"]
          }
        ]
      }
      loans: {
        Row: {
          amount: number
          borrower_id: string
          created_at: string
          description: string
          id: string
          lender_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          borrower_id: string
          created_at?: string
          description: string
          id?: string
          lender_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          borrower_id?: string
          created_at?: string
          description?: string
          id?: string
          lender_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_borrower_id_fkey"
            columns: ["borrower_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_lender_id_fkey"
            columns: ["lender_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          balance: number
          created_at: string
          email: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          balance?: number
          created_at?: string
          email: string
          id: string
          name: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          balance?: number
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      offers: {
        Row: {
          amount: number
          borrower_id: string
          created_at: string
          description: string
          id: string
          loan_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          borrower_id: string
          created_at?: string
          description: string
          id?: string
          loan_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          borrower_id?: string
          created_at?: string
          description?: string
          id?: string
          loan_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_borrower_id_fkey"
            columns: ["borrower_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_loan_id_fkey"
            columns: ["loan_id"]
            referencedRelation: "loans"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          loan_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          loan_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          loan_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_loan_id_fkey"
            columns: ["loan_id"]
            referencedRelation: "loans"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          created_at: string
          id: string
          loan_id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          loan_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          loan_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_loan_id_fkey"
            columns: ["loan_id"]
            referencedRelation: "loans"
            referencedColumns: ["id"]
          }
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_offers: {
        Row: {
          age: string
          amount: number
          borrower_id: string
          category_id: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          loan_id: string
          specifications: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          age: string
          amount: number
          borrower_id: string
          category_id: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          loan_id: string
          specifications: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          age?: string
          amount?: number
          borrower_id?: string
          category_id?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          loan_id?: string
          specifications?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_offers_borrower_id_fkey"
            columns: ["borrower_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_offers_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_offers_loan_id_fkey"
            columns: ["loan_id"]
            referencedRelation: "loans"
            referencedColumns: ["id"]
          }
        ]
      }
      counter_offers: {
        Row: {
          id: string
          product_offer_id: string
          user_id: string
          amount: number
          message: string | null
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_offer_id: string
          user_id: string
          amount: number
          message?: string | null
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_offer_id?: string
          user_id?: string
          amount?: number
          message?: string | null
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "counter_offers_product_offer_id_fkey"
            columns: ["product_offer_id"]
            referencedRelation: "product_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counter_offers_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 