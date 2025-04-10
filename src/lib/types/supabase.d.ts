declare module '@supabase/supabase-js' {
  export interface User {
    id: string;
    app_metadata: {
      provider?: string;
      [key: string]: any;
    };
    user_metadata: {
      [key: string]: any;
    };
    aud: string;
    created_at: string;
    email?: string;
    phone?: string;
    role?: string;
  }

  export interface Session {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    user: User;
  }

  export type AuthChangeEvent =
    | 'SIGNED_IN'
    | 'SIGNED_OUT'
    | 'USER_UPDATED'
    | 'USER_DELETED'
    | 'PASSWORD_RECOVERY';
} 