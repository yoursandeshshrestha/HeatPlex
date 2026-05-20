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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          member_id: string | null
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action_type: string
          after: Json | null
          before: Json | null
          created_at: string
          id: string
          ip: string | null
          staff_id: string
          summary: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action_type: string
          after?: Json | null
          before?: Json | null
          created_at?: string
          id?: string
          ip?: string | null
          staff_id: string
          summary?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action_type?: string
          after?: Json | null
          before?: Json | null
          created_at?: string
          id?: string
          ip?: string | null
          staff_id?: string
          summary?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_tokens: {
        Row: {
          attempt_count: number | null
          consumed_at: string | null
          created_at: string | null
          expires_at: string
          id: string
          owner_email: string
          owner_id: string | null
          owner_type: string
          requested_ip: string | null
          requested_user_agent: string | null
          token_hash: string
        }
        Insert: {
          attempt_count?: number | null
          consumed_at?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          owner_email: string
          owner_id?: string | null
          owner_type: string
          requested_ip?: string | null
          requested_user_agent?: string | null
          token_hash: string
        }
        Update: {
          attempt_count?: number | null
          consumed_at?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          owner_email?: string
          owner_id?: string | null
          owner_type?: string
          requested_ip?: string | null
          requested_user_agent?: string | null
          token_hash?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          commusoft_job_id: string | null
          completed_at: string | null
          created_at: string | null
          engineer_id: string | null
          id: string
          member_id: string
          notes: string | null
          scheduled_date: string
          slot: string
          status: string
          updated_at: string | null
        }
        Insert: {
          commusoft_job_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          engineer_id?: string | null
          id?: string
          member_id: string
          notes?: string | null
          scheduled_date: string
          slot: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          commusoft_job_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          engineer_id?: string | null
          id?: string
          member_id?: string
          notes?: string | null
          scheduled_date?: string
          slot?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "engineers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      commusoft_outbox: {
        Row: {
          attempts: number | null
          completed_at: string | null
          created_at: string | null
          id: string
          last_attempted_at: string | null
          last_error: string | null
          operation: string
          payload: Json
          scheduled_for: string | null
          status: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_attempted_at?: string | null
          last_error?: string | null
          operation: string
          payload: Json
          scheduled_for?: string | null
          status?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_attempted_at?: string | null
          last_error?: string | null
          operation?: string
          payload?: Json
          scheduled_for?: string | null
          status?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      email_validation_cache: {
        Row: {
          email: string
          mx_record_found: boolean | null
          valid: boolean | null
          validated_at: string | null
        }
        Insert: {
          email: string
          mx_record_found?: boolean | null
          valid?: boolean | null
          validated_at?: string | null
        }
        Update: {
          email?: string
          mx_record_found?: boolean | null
          valid?: boolean | null
          validated_at?: string | null
        }
        Relationships: []
      }
      engineer_commissions: {
        Row: {
          amount_pence: number
          attributed_at: string
          created_at: string | null
          engineer_id: string
          id: string
          member_id: string
          notes: string | null
          paid_at: string | null
          paid_batch_id: string | null
          status: string
        }
        Insert: {
          amount_pence?: number
          attributed_at?: string
          created_at?: string | null
          engineer_id: string
          id?: string
          member_id: string
          notes?: string | null
          paid_at?: string | null
          paid_batch_id?: string | null
          status?: string
        }
        Update: {
          amount_pence?: number
          attributed_at?: string
          created_at?: string | null
          engineer_id?: string
          id?: string
          member_id?: string
          notes?: string | null
          paid_at?: string | null
          paid_batch_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "engineer_commissions_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "engineers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineer_commissions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      engineers: {
        Row: {
          active: boolean | null
          commusoft_engineer_id: string
          created_at: string | null
          email: string | null
          id: string
          name: string
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          commusoft_engineer_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          commusoft_engineer_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gas_certificates: {
        Row: {
          cache_expires_at: string | null
          cached_file_path: string | null
          commusoft_certificate_id: string
          created_at: string | null
          engineer_id: string | null
          expires_at: string | null
          id: string
          issued_at: string
          member_id: string
          updated_at: string | null
        }
        Insert: {
          cache_expires_at?: string | null
          cached_file_path?: string | null
          commusoft_certificate_id: string
          created_at?: string | null
          engineer_id?: string | null
          expires_at?: string | null
          id?: string
          issued_at: string
          member_id: string
          updated_at?: string | null
        }
        Update: {
          cache_expires_at?: string | null
          cached_file_path?: string | null
          commusoft_certificate_id?: string
          created_at?: string | null
          engineer_id?: string | null
          expires_at?: string | null
          id?: string
          issued_at?: string
          member_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gas_certificates_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "engineers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gas_certificates_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_notes: {
        Row: {
          body: string
          created_at: string | null
          id: string
          member_id: string
          staff_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          member_id: string
          staff_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          member_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_notes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_notes_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      job_completions: {
        Row: {
          commusoft_job_id: string
          completed_at: string
          created_at: string | null
          customer_commusoft_id: string | null
          decline_reason: string | null
          engineer_id: string | null
          id: string
          member_id: string | null
          membership_offered: boolean | null
          offer_outcome: string | null
          raw_form_data: Json | null
          was_member_at_completion: boolean | null
        }
        Insert: {
          commusoft_job_id: string
          completed_at: string
          created_at?: string | null
          customer_commusoft_id?: string | null
          decline_reason?: string | null
          engineer_id?: string | null
          id?: string
          member_id?: string | null
          membership_offered?: boolean | null
          offer_outcome?: string | null
          raw_form_data?: Json | null
          was_member_at_completion?: boolean | null
        }
        Update: {
          commusoft_job_id?: string
          completed_at?: string
          created_at?: string | null
          customer_commusoft_id?: string | null
          decline_reason?: string | null
          engineer_id?: string | null
          id?: string
          member_id?: string | null
          membership_offered?: boolean | null
          offer_outcome?: string | null
          raw_form_data?: Json | null
          was_member_at_completion?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "job_completions_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "engineers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_completions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      mandates: {
        Row: {
          cancelled_at: string | null
          created_at: string | null
          gocardless_mandate_id: string
          id: string
          member_id: string
          reference: string | null
          scheme: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string | null
          gocardless_mandate_id: string
          id?: string
          member_id: string
          reference?: string | null
          scheme?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string | null
          gocardless_mandate_id?: string
          id?: string
          member_id?: string
          reference?: string | null
          scheme?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mandates_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_jobs: {
        Row: {
          commusoft_job_id: string
          completed_at: string | null
          created_at: string | null
          engineer_id: string | null
          id: string
          job_type: string | null
          member_discount_pence: number | null
          member_id: string
          raw_commusoft_data: Json | null
          scheduled_date: string | null
          status: string | null
          synced_at: string | null
          total_invoiced_pence: number | null
          updated_at: string | null
        }
        Insert: {
          commusoft_job_id: string
          completed_at?: string | null
          created_at?: string | null
          engineer_id?: string | null
          id?: string
          job_type?: string | null
          member_discount_pence?: number | null
          member_id: string
          raw_commusoft_data?: Json | null
          scheduled_date?: string | null
          status?: string | null
          synced_at?: string | null
          total_invoiced_pence?: number | null
          updated_at?: string | null
        }
        Update: {
          commusoft_job_id?: string
          completed_at?: string | null
          created_at?: string | null
          engineer_id?: string | null
          id?: string
          job_type?: string | null
          member_discount_pence?: number | null
          member_id?: string
          raw_commusoft_data?: Json | null
          scheduled_date?: string | null
          status?: string | null
          synced_at?: string | null
          total_invoiced_pence?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_jobs_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "engineers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_jobs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          address_postcode: string
          address_town: string
          auto_renewal: boolean | null
          cancellation_reason: string | null
          cancellation_requested_at: string | null
          commusoft_customer_id: string | null
          commusoft_link_severed_at: string | null
          created_at: string | null
          effective_end_date: string | null
          email: string
          engineer_credit_id: string | null
          first_name: string
          id: string
          last_name: string
          marketing_consent_at: string | null
          marketing_email_opt_in: boolean | null
          phone: string
          plan: string
          promo_code: string | null
          renewal_date: string | null
          savings_total_pence: number | null
          signup_ip: string | null
          signup_user_agent: string | null
          started_at: string | null
          status: string
          terms_accepted_at: string
          updated_at: string | null
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          address_postcode: string
          address_town: string
          auto_renewal?: boolean | null
          cancellation_reason?: string | null
          cancellation_requested_at?: string | null
          commusoft_customer_id?: string | null
          commusoft_link_severed_at?: string | null
          created_at?: string | null
          effective_end_date?: string | null
          email: string
          engineer_credit_id?: string | null
          first_name: string
          id?: string
          last_name: string
          marketing_consent_at?: string | null
          marketing_email_opt_in?: boolean | null
          phone: string
          plan: string
          promo_code?: string | null
          renewal_date?: string | null
          savings_total_pence?: number | null
          signup_ip?: string | null
          signup_user_agent?: string | null
          started_at?: string | null
          status?: string
          terms_accepted_at: string
          updated_at?: string | null
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          address_postcode?: string
          address_town?: string
          auto_renewal?: boolean | null
          cancellation_reason?: string | null
          cancellation_requested_at?: string | null
          commusoft_customer_id?: string | null
          commusoft_link_severed_at?: string | null
          created_at?: string | null
          effective_end_date?: string | null
          email?: string
          engineer_credit_id?: string | null
          first_name?: string
          id?: string
          last_name?: string
          marketing_consent_at?: string | null
          marketing_email_opt_in?: boolean | null
          phone?: string
          plan?: string
          promo_code?: string | null
          renewal_date?: string | null
          savings_total_pence?: number | null
          signup_ip?: string | null
          signup_user_agent?: string | null
          started_at?: string | null
          status?: string
          terms_accepted_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_pence: number
          charge_date: string | null
          confirmed_at: string | null
          created_at: string | null
          failure_reason: string | null
          gocardless_payment_id: string | null
          id: string
          mandate_id: string | null
          member_id: string
          metadata: Json | null
          refund_of: string | null
          status: string
          subscription_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          amount_pence: number
          charge_date?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          failure_reason?: string | null
          gocardless_payment_id?: string | null
          id?: string
          mandate_id?: string | null
          member_id: string
          metadata?: Json | null
          refund_of?: string | null
          status: string
          subscription_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          amount_pence?: number
          charge_date?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          failure_reason?: string | null
          gocardless_payment_id?: string | null
          id?: string
          mandate_id?: string | null
          member_id?: string
          metadata?: Json | null
          refund_of?: string | null
          status?: string
          subscription_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "mandates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_refund_of_fkey"
            columns: ["refund_of"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_webhook_events: {
        Row: {
          external_event_id: string
          id: string
          processed_at: string | null
          source: string
        }
        Insert: {
          external_event_id: string
          id?: string
          processed_at?: string | null
          source: string
        }
        Update: {
          external_event_id?: string
          id?: string
          processed_at?: string | null
          source?: string
        }
        Relationships: []
      }
      savings_events: {
        Row: {
          amount_pence: number
          applied_at: string
          created_at: string | null
          id: string
          member_id: string
          notes: string | null
          source: string
          source_ref: string | null
        }
        Insert: {
          amount_pence: number
          applied_at?: string
          created_at?: string | null
          id?: string
          member_id: string
          notes?: string | null
          source: string
          source_ref?: string | null
        }
        Update: {
          amount_pence?: number
          applied_at?: string
          created_at?: string | null
          id?: string
          member_id?: string
          notes?: string | null
          source?: string
          source_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "savings_events_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_steps: {
        Row: {
          channel: string
          created_at: string | null
          enrollment_id: string
          error: string | null
          id: string
          provider_message_id: string | null
          retry_count: number | null
          scheduled_for: string
          sent_at: string | null
          status: string
          step_index: number
          template_key: string
          updated_at: string | null
        }
        Insert: {
          channel?: string
          created_at?: string | null
          enrollment_id: string
          error?: string | null
          id?: string
          provider_message_id?: string | null
          retry_count?: number | null
          scheduled_for: string
          sent_at?: string | null
          status?: string
          step_index: number
          template_key: string
          updated_at?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          enrollment_id?: string
          error?: string | null
          id?: string
          provider_message_id?: string | null
          retry_count?: number | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          step_index?: number
          template_key?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_steps_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "sequence_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      send_log: {
        Row: {
          bounced_at: string | null
          channel: string
          clicked_at: string | null
          complained_at: string | null
          created_at: string | null
          id: string
          member_id: string | null
          opened_at: string | null
          provider_message_id: string | null
          sent_at: string
          status: string | null
          template_key: string | null
        }
        Insert: {
          bounced_at?: string | null
          channel?: string
          clicked_at?: string | null
          complained_at?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          opened_at?: string | null
          provider_message_id?: string | null
          sent_at?: string
          status?: string | null
          template_key?: string | null
        }
        Update: {
          bounced_at?: string | null
          channel?: string
          clicked_at?: string | null
          complained_at?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          opened_at?: string | null
          provider_message_id?: string | null
          sent_at?: string
          status?: string | null
          template_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "send_log_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_enrollments: {
        Row: {
          created_at: string | null
          current_step: number | null
          id: string
          member_id: string
          payload: Json | null
          sequence_key: string
          started_at: string
          stop_reason: string | null
          stopped_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_step?: number | null
          id?: string
          member_id: string
          payload?: Json | null
          sequence_key: string
          started_at?: string
          stop_reason?: string | null
          stopped_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_step?: number | null
          id?: string
          member_id?: string
          payload?: Json | null
          sequence_key?: string
          started_at?: string
          stop_reason?: string | null
          stopped_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sequence_enrollments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip: string | null
          last_active_at: string | null
          owner_id: string
          owner_type: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip?: string | null
          last_active_at?: string | null
          owner_id: string
          owner_type: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip?: string | null
          last_active_at?: string | null
          owner_id?: string
          owner_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string | null
          deactivated_at: string | null
          email: string
          id: string
          last_login_at: string | null
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deactivated_at?: string | null
          email: string
          id?: string
          last_login_at?: string | null
          name: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deactivated_at?: string | null
          email?: string
          id?: string
          last_login_at?: string | null
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_pence: number
          cancelled_at: string | null
          commitment_end_date: string | null
          created_at: string | null
          gocardless_subscription_id: string
          id: string
          interval_unit: string
          mandate_id: string
          member_id: string
          metadata: Json | null
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount_pence: number
          cancelled_at?: string | null
          commitment_end_date?: string | null
          created_at?: string | null
          gocardless_subscription_id: string
          id?: string
          interval_unit: string
          mandate_id: string
          member_id: string
          metadata?: Json | null
          start_date: string
          status: string
          updated_at?: string | null
        }
        Update: {
          amount_pence?: number
          cancelled_at?: string | null
          commitment_end_date?: string | null
          created_at?: string | null
          gocardless_subscription_id?: string
          id?: string
          interval_unit?: string
          mandate_id?: string
          member_id?: string
          metadata?: Json | null
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "mandates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_drift_alerts: {
        Row: {
          details: Json | null
          detected_at: string
          id: string
          member_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          type: string
        }
        Insert: {
          details?: Json | null
          detected_at?: string
          id?: string
          member_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          type: string
        }
        Update: {
          details?: Json | null
          detected_at?: string
          id?: string
          member_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_drift_alerts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_drift_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          commission_amount_pence: number | null
          created_at: string | null
          default_plan: string | null
          id: number
          maintenance_message: string | null
          maintenance_mode: boolean | null
          pause_commusoft_outbound: boolean | null
          pause_new_signups: boolean | null
          pause_sequences: boolean | null
          twelve_month_minimum_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          commission_amount_pence?: number | null
          created_at?: string | null
          default_plan?: string | null
          id?: number
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          pause_commusoft_outbound?: boolean | null
          pause_new_signups?: boolean | null
          pause_sequences?: boolean | null
          twelve_month_minimum_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          commission_amount_pence?: number | null
          created_at?: string | null
          default_plan?: string | null
          id?: number
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          pause_commusoft_outbound?: boolean | null
          pause_new_signups?: boolean | null
          pause_sequences?: boolean | null
          twelve_month_minimum_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          active: boolean | null
          channel: string | null
          created_at: string | null
          html_body: string | null
          key: string
          subject: string
          text_body: string | null
          version: number
        }
        Insert: {
          active?: boolean | null
          channel?: string | null
          created_at?: string | null
          html_body?: string | null
          key: string
          subject: string
          text_body?: string | null
          version: number
        }
        Update: {
          active?: boolean | null
          channel?: string | null
          created_at?: string | null
          html_body?: string | null
          key?: string
          subject?: string
          text_body?: string | null
          version?: number
        }
        Relationships: []
      }
      unsubscribes: {
        Row: {
          created_at: string | null
          email: string
          id: string
          member_id: string | null
          reason: string | null
          scope: string
          sequence_key: string | null
          source: string
          unsubscribed_at: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          member_id?: string | null
          reason?: string | null
          scope: string
          sequence_key?: string | null
          source: string
          unsubscribed_at?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          member_id?: string | null
          reason?: string | null
          scope?: string
          sequence_key?: string | null
          source?: string
          unsubscribed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unsubscribes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_entries: {
        Row: {
          contacted_at: string | null
          created_at: string | null
          id: string
          member_id: string
          requested_period: string | null
          resolution: string | null
          resolved_at: string | null
        }
        Insert: {
          contacted_at?: string | null
          created_at?: string | null
          id?: string
          member_id: string
          requested_period?: string | null
          resolution?: string | null
          resolved_at?: string | null
        }
        Update: {
          contacted_at?: string | null
          created_at?: string | null
          id?: string
          member_id?: string
          requested_period?: string | null
          resolution?: string | null
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_entries_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
