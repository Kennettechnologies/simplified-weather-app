// Browser-compatible authentication client
// Note: This is a client-side implementation that will make API calls to your backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  created_at: Date;
}

interface Session {
  access_token: string;
  user: User;
  expires_at: number;
}

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

class DatabaseClient {
  private currentUser: User | null = null;
  private currentSession: Session | null = null;
  private authListeners: ((event: string, session: Session | null) => void)[] = [];

  constructor() {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const storedSession = localStorage.getItem('auth_session');
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          if (session.expires_at > Date.now()) {
            this.currentSession = session;
            this.currentUser = session.user;
          } else {
            localStorage.removeItem('auth_session');
          }
        } catch (e) {
          localStorage.removeItem('auth_session');
        }
      }
    }
  }

  // Auth methods
  auth = {
    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
      this.authListeners.push(callback);
      // Immediately call with current state
      callback('INITIAL_SESSION', this.currentSession);
      
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const index = this.authListeners.indexOf(callback);
              if (index > -1) {
                this.authListeners.splice(index, 1);
              }
            }
          }
        }
      };
    },

    getSession: async () => {
      return { data: { session: this.currentSession }, error: null };
    },

    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            full_name: options?.data?.full_name || email.split('@')[0],
            phone: options?.data?.phone
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new AuthError(data.error || 'Signup failed');
        }

        return { data: { user: null }, error: null };
      } catch (error: any) {
        return { data: { user: null }, error: new AuthError(error.message) };
      }
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new AuthError(data.error || 'Invalid credentials');
        }

        const { user, session } = data;
        
        this.currentUser = user;
        this.currentSession = session;
        
        // Store in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_session', JSON.stringify(session));
        }

        // Notify listeners
        this.authListeners.forEach(listener => listener('SIGNED_IN', session));

        return { data: { user, session }, error: null };
      } catch (error: any) {
        return { data: { user: null, session: null }, error: new AuthError(error.message) };
      }
    },

    signInWithOAuth: async ({ provider, options }: { provider: string; options?: any }) => {
      // For now, return error as OAuth needs server-side implementation
      return { data: { user: null, session: null }, error: new AuthError('OAuth not implemented yet') };
    },

    signOut: async () => {
      this.currentUser = null;
      this.currentSession = null;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_session');
      }

      this.authListeners.forEach(listener => listener('SIGNED_OUT', null));
      return { error: null };
    },

    resetPasswordForEmail: async (email: string, options?: any) => {
      // This would need server-side implementation
      return { data: null, error: new AuthError('Password reset not implemented yet') };
    },

    updateUser: async (updates: any) => {
      try {
        if (!this.currentUser) {
          throw new AuthError('Not authenticated');
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.currentSession?.access_token}`
          },
          body: JSON.stringify(updates.data)
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new AuthError(data.error || 'Update failed');
        }

        this.currentUser = data.user;
        if (this.currentSession) {
          this.currentSession.user = this.currentUser;
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_session', JSON.stringify(this.currentSession));
          }
        }

        return { data: { user: this.currentUser }, error: null };
      } catch (error: any) {
        return { data: { user: null }, error: new AuthError(error.message) };
      }
    }
  };

  // Database methods
  from = (table: string) => {
    return new TableQuery(table, this.currentUser);
  };

  // Functions (for API calls)
  functions = {
    invoke: async (functionName: string, options?: any) => {
      // This would need to be implemented as API calls to your backend
      try {
        const response = await fetch(`${API_BASE_URL}/api/${functionName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.currentSession ? `Bearer ${this.currentSession.access_token}` : ''
          },
          body: JSON.stringify(options?.body || {})
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'API call failed');
        }

        return { data, error: null };
      } catch (error: any) {
        return { data: null, error: new Error(error.message) };
      }
    }
  };
}

class TableQuery {
  private table: string;
  private currentUser: User | null;
  private selectFields: string = '*';
  private whereConditions: any[] = [];
  private limitValue?: number;
  private orderByField?: { field: string; ascending: boolean };

  constructor(table: string, currentUser: User | null) {
    this.table = table;
    this.currentUser = currentUser;
  }

  select(fields: string) {
    this.selectFields = fields;
    return this;
  }

  eq(field: string, value: any) {
    this.whereConditions.push({ [field]: value });
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderByField = { field, ascending: options?.ascending !== false };
    return this;
  }

  single() {
    this.limitValue = 1;
    return this;
  }

  async execute() {
    try {
      const params = new URLSearchParams();
      
      // Add where conditions
      this.whereConditions.forEach(condition => {
        Object.entries(condition).forEach(([key, value]) => {
          params.append(key, String(value));
        });
      });
      
      // Add ordering
      if (this.orderByField) {
        params.append('orderBy', this.orderByField.field);
        params.append('order', this.orderByField.ascending ? 'asc' : 'desc');
      }
      
      // Add limit
      if (this.limitValue) {
        params.append('limit', String(this.limitValue));
      }
      
      const response = await fetch(`${API_BASE_URL}/api/db/${this.table}?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Database query failed');
      }
      
      if (this.limitValue === 1) {
        return { data: data[0] || null, error: null };
      }
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: new Error(error.message) };
    }
  }

  // For compatibility with existing code
  then(callback: (result: any) => void) {
    return this.execute().then(callback);
  }

  async insert(data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/db/${this.table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Insert failed');
      }
      
      return { data: result, error: null };
    } catch (error: any) {
      return { data: null, error: new Error(error.message) };
    }
  }

  async upsert(data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/db/${this.table}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upsert failed');
      }
      
      return { data: result, error: null };
    } catch (error: any) {
      return { data: null, error: new Error(error.message) };
    }
  }
}

// Create and export the client instance
export const supabase = new DatabaseClient();