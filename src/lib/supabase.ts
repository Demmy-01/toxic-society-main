const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

type QueryResult = { data: any; error: { message: string } | null };

class QueryBuilder {
  private table: string;
  private filters: Array<{ field: string; value: any }> = [];
  private notFilters: Array<{ field: string; operator: string; value: any }> = [];
  private gteFilters: Array<{ field: string; value: any }> = [];
  private inFilters: Array<{ field: string; values: any[] }> = [];
  private orderCol: string | null = null;
  private orderAsc: boolean = true;
  private _isSingle: boolean = false;
  private _isMaybeSingle: boolean = false;
  private method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET';
  private payload: any = null;

  constructor(table: string) {
    this.table = table;
  }

  select(_columns: string = '*') {
    // Only set GET if no write method was already set (insert/upsert/update/delete)
    // In Supabase, .select() after .upsert() means "return the result", not "do a GET"
    if (this.method === 'GET') {
      this.method = 'GET';
    }
    return this;
  }

  insert(data: any) {
    this.method = 'POST';
    this.payload = data;
    return this;
  }

  upsert(data: any, _options?: any) {
    this.method = 'POST';
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.method = 'PATCH';
    this.payload = data;
    return this;
  }

  delete() {
    this.method = 'DELETE';
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, value });
    return this;
  }

  not(field: string, operator: string, value: any) {
    this.notFilters.push({ field, operator, value });
    return this;
  }

  in(field: string, values: any[]) {
    this.inFilters.push({ field, values });
    return this;
  }

  gte(field: string, value: any) {
    this.gteFilters.push({ field, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderCol = column;
    this.orderAsc = options?.ascending ?? true;
    return this;
  }

  /** Terminal: mark as single and execute immediately → Promise */
  single(): Promise<QueryResult> {
    this._isSingle = true;
    return this._execute();
  }

  /** Terminal: mark as maybe-single and execute immediately → Promise */
  maybeSingle(): Promise<QueryResult> {
    this._isMaybeSingle = true;
    return this._execute();
  }

  limit(_num: number) {
    return this;
  }

  /**
   * Execute the query and return a real Promise.
   * All `await supabase.from(...).select(...).eq(...)` calls resolve here.
   */
  private async _execute(): Promise<QueryResult> {
    if (this.table === 'drop_signups') {
      return { data: this.payload, error: null };
    }

    let url = `${API_URL}/api/v1/${this.table}`;

    // Extract ID filter if any
    let id: string | null = null;
    const idFilter = this.filters.find(f => f.field === 'id');
    if (idFilter) {
      id = idFilter.value;
    }

    // Special routing mappings
    if (this.table === 'customers') {
      const userIdFilter = this.filters.find(f => f.field === 'user_id');
      if (userIdFilter && this.method === 'GET') {
        url = `${API_URL}/api/v1/customers/user/${userIdFilter.value}`;
      } else if (this.method === 'POST' || this.method === 'PATCH') {
        url = `${API_URL}/api/v1/customers/upsert`;
        this.method = 'POST';
      }
    } else if (this.table === 'orders') {
      const customerIdFilter = this.filters.find(f => f.field === 'customer_id');
      if (customerIdFilter && this.method === 'GET') {
        // Use the customer-facing order history endpoint (requires user auth, not admin)
        url = `${API_URL}/api/v1/orders/history`;
      } else if (id && (this.method === 'PATCH' || this.method === 'DELETE' || this._isSingle)) {
        url = `${API_URL}/api/v1/${this.table}/${id}`;
      }
    } else if (id && (this.method === 'PATCH' || this.method === 'DELETE' || this._isSingle)) {
      url = `${API_URL}/api/v1/${this.table}/${id}`;
    }

    // Add query params for GET
    if (this.method === 'GET') {
      const params = new URLSearchParams();
      if (this.table === 'products') {
        params.append("limit", "100");
        const categoryFilter = this.filters.find(f => f.field === 'category');
        if (categoryFilter) params.append("category", categoryFilter.value);
        const activeFilter = this.filters.find(f => f.field === 'is_active');
        if (activeFilter) params.append("is_active", activeFilter.value.toString());
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }

    // Add JWT Token if present
    const token = localStorage.getItem('ts_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method: this.method,
      headers,
    };

    if (this.method !== 'GET' && this.payload) {
      options.body = JSON.stringify(this.payload);
    }

    try {
      const response = await fetch(url, options);

      if (response.status === 204) {
        return { data: null, error: null };
      }

      const text = await response.text();
      if (!response.ok) {
        let msg = text || 'Request failed';
        try {
          const json = JSON.parse(text);
          msg = json.detail || msg;
        } catch { /* ignore */ }
        return { data: null, error: { message: msg } };
      }

      let data = text ? JSON.parse(text) : null;

      // Extract from paginated wrapper
      if (data && typeof data === 'object' && 'items' in data && Array.isArray(data.items)) {
        data = data.items;
      }

      // Apply client-side filters on array responses (if any)
      if (Array.isArray(data)) {
        let items = data as any[];
        for (const filter of this.filters) {
          if (filter.field !== 'id' && filter.field !== 'user_id') {
            items = items.filter(item => item[filter.field] === filter.value);
          }
        }

        // Apply client-side not filters
        for (const filter of this.notFilters) {
          if (filter.operator === 'is' && filter.value === null) {
            items = items.filter(item => item[filter.field] !== null && item[filter.field] !== undefined);
          } else {
            items = items.filter(item => item[filter.field] !== filter.value);
          }
        }

        // Apply client-side in filters
        for (const filter of this.inFilters) {
          items = items.filter(item => filter.values.includes(item[filter.field]));
        }

        // Apply client-side gte filters
        for (const filter of this.gteFilters) {
          items = items.filter(item => {
            const val = item[filter.field];
            if (val === null || val === undefined) return false;
            if (typeof val === 'string' && typeof filter.value === 'string' &&
                !isNaN(Date.parse(val)) && !isNaN(Date.parse(filter.value))) {
              return new Date(val).getTime() >= new Date(filter.value).getTime();
            }
            return val >= filter.value;
          });
        }

        // Apply ordering
        if (this.orderCol) {
          const col = this.orderCol;
          const asc = this.orderAsc;
          items.sort((a, b) => {
            if (a[col] < b[col]) return asc ? -1 : 1;
            if (a[col] > b[col]) return asc ? 1 : -1;
            return 0;
          });
        }

        if (this._isSingle || this._isMaybeSingle) {
          data = items.length > 0 ? items[0] : null;
        } else {
          data = items;
        }
      }

      return { data, error: null };
    } catch (err: any) {
      console.error(`Mock Supabase Client Error [${this.table}]:`, err);
      return { data: null, error: { message: err.message || 'Network error' } };
    }
  }


  execute(): Promise<QueryResult> {
    return this._execute();
  }
}

// We use a subclass trick: AwaitableQueryBuilder wraps QueryBuilder and is also a Promise
class AwaitableQueryBuilder extends QueryBuilder implements PromiseLike<QueryResult> {
  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

class SupabaseAuth {
  private listeners: Array<(event: string, session: any) => void> = [];

  constructor() {
    // Listen to storage events to support multi-tab auth updates
    window.addEventListener('storage', (e) => {
      if (e.key === 'ts_token') {
        this.getSession().then(({ data: { session } }) => {
          this.notifyListeners(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
        });
      }
    });
  }

  private notifyListeners(event: string, session: any) {
    this.listeners.forEach(cb => cb(event, session));
  }

  async getSession(): Promise<{ data: { session: any }; error: null }> {
    const token = localStorage.getItem('ts_token');
    const userStr = localStorage.getItem('ts_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        return { data: { session: { access_token: token, user } }, error: null };
      } catch { /* ignore */ }
    }
    return { data: { session: null }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    this.getSession().then(({ data: { session } }) => {
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
    });
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
          }
        }
      }
    };
  }

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      const res = await fetch(`${API_URL}/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        return { data: null, error: { message: data.detail || 'Login failed' } };
      }
      localStorage.setItem('ts_token', data.access_token);
      localStorage.setItem('ts_user', JSON.stringify(data.user));
      const session = { access_token: data.access_token, user: data.user };
      this.notifyListeners('SIGNED_IN', session);
      return { data: session, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  /**
   * Register a new customer account.
   * If the email already exists, returns an error telling them to login instead.
   */
  async signUp({ name, email, phone, password }: { name: string; email: string; phone: string; password: string }) {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: name,
        })
      });
      const data = await res.json();

      if (res.status === 409) {
        return { data: null, error: { message: 'An account with this email already exists. Please login instead.' } };
      }
      if (!res.ok) {
        return { data: null, error: { message: data.detail || 'Registration failed' } };
      }

      if (data.access_token) {
        const userWithPhone = { ...data.user, phone };
        localStorage.setItem('ts_token', data.access_token);
        localStorage.setItem('ts_user', JSON.stringify(userWithPhone));

        const session = { access_token: data.access_token, user: userWithPhone };
        this.notifyListeners('SIGNED_IN', session);
        return { data: { session, user: userWithPhone }, error: null };
      }

      return { data: null, error: { message: 'Unexpected response from server' } };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  async signOut() {
    localStorage.removeItem('ts_token');
    localStorage.removeItem('ts_user');
    this.notifyListeners('SIGNED_OUT', null);
    return { error: null };
  }

  async getUser() {
    const { data: { session } } = await this.getSession();
    return { data: { user: session?.user ?? null }, error: null };
  }
}

class SupabaseStorage {
  from(bucket: string) {
    return {
      upload: async (path: string, file: File, _options?: any) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', `${bucket}/${path}`);

        const token = localStorage.getItem('ts_token');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        try {
          const res = await fetch(`${API_URL}/api/v1/storage/upload`, {
            method: "POST",
            headers,
            body: formData
          });
          const data = await res.json();
          if (res.ok && data.success) {
            return { data: { path: `${bucket}/${path}` }, error: null };
          }
          return { data: null, error: { message: data.detail || "Upload failed" } };
        } catch (err: any) {
          return { data: null, error: { message: err.message } };
        }
      },
      getPublicUrl: (path: string) => {
        return {
          data: {
            publicUrl: `${API_URL}/uploads/${bucket}/${path}`
          }
        };
      }
    };
  }
}

class MockSupabaseClient {
  auth = new SupabaseAuth();
  storage = new SupabaseStorage();

  from(table: string): AwaitableQueryBuilder {
    return new AwaitableQueryBuilder(table);
  }
}

export const supabase = new MockSupabaseClient();
