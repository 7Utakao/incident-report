export const useApi = () => {
  const config = useRuntimeConfig();

  // APIベースURL
  const apiBase = config.public.apiBase;

  // 共通のHTTPクライアント
  const apiCall = async <T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      requireAuth?: boolean;
      query?: Record<string, string | number | boolean | undefined>;
    } = {},
  ): Promise<T> => {
    const { method = 'GET', body, requireAuth = true, query = {} } = options;

    // クエリパラメータを構築
    const queryString = Object.entries(query)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');

    const url = `${apiBase}${endpoint}${queryString ? `?${queryString}` : ''}`;

    // ヘッダーを構築
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 認証が必要な場合はJWTトークンを追加
    if (requireAuth) {
      const { getIdToken } = useAuth();
      const token = await getIdToken();
      if (!token) {
        throw new Error('認証が必要です');
      }
      headers.Authorization = `Bearer ${token}`;
    }

    // リクエストオプション
    const fetchOptions: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // レポート関連のAPI
  const reports = {
    // レポート一覧取得
    list: (
      filters: {
        category?: string;
        from?: string;
        to?: string;
        nextToken?: string;
        q?: string;
      } = {},
    ) => {
      return apiCall<{
        items: any[];
        nextToken?: string;
      }>('/reports', {
        method: 'GET',
        query: filters,
      });
    },

    // レポート詳細取得
    get: (id: string) => {
      return apiCall<any>(`/reports/${id}`, {
        method: 'GET',
      });
    },

    // レポート作成
    create: (data: {
      title?: string;
      body: string;
      category: string;
      tags?: string[];
      createdAt?: string;
    }) => {
      return apiCall<{ reportId: string }>('/reports', {
        method: 'POST',
        body: data,
      });
    },
  };

  // ダッシュボード関連のAPI（将来拡張用）
  const dashboard = {
    summary: () => {
      return apiCall<any>('/dashboard/summary', {
        method: 'GET',
      });
    },
  };

  // AI生成関連のAPI
  const ai = {
    // AI生成（連続送信防止付き）
    generate: (() => {
      let isGenerating = false;
      let lastRequestTime = 0;
      const MIN_INTERVAL = 2000; // 2秒間隔

      return async (originalText: string) => {
        // 連続送信防止
        if (isGenerating) {
          throw new Error('AI生成処理が実行中です。しばらくお待ちください。');
        }

        // 最小間隔チェック
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        if (timeSinceLastRequest < MIN_INTERVAL) {
          const waitTime = MIN_INTERVAL - timeSinceLastRequest;
          throw new Error(`前回のリクエストから${Math.ceil(waitTime / 1000)}秒お待ちください。`);
        }

        isGenerating = true;
        lastRequestTime = now;

        try {
          const url = `${apiBase}/ai/generate`;
          const { getIdToken } = useAuth();
          const token = await getIdToken();

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token || 'test-token'}`,
            },
            body: JSON.stringify({ content: originalText }),
          });

          // まずテキストで受ける（デバッグしやすい）
          const rawText = await response.text();

          if (!response.ok) {
            // 503 Service Unavailable の場合はRetry-Afterを処理
            if (response.status === 503) {
              const retryAfter = response.headers.get('Retry-After');
              const retrySeconds = retryAfter ? parseInt(retryAfter) : 2;

              let errorData: any = {};
              try {
                errorData = JSON.parse(rawText);
              } catch {}

              const error = new Error(
                errorData.message ||
                  `サービスが一時的に過負荷状態です。${retrySeconds}秒後に再試行してください。`,
              ) as any;
              error.statusCode = 503;
              error.retryAfter = retrySeconds;
              throw error;
            }

            throw new Error(`${response.status} ${rawText}`);
          }

          let json: any;
          try {
            json = JSON.parse(rawText);
          } catch (parseError) {
            throw new Error(`Invalid JSON: ${rawText.slice(0, 200)}`);
          }

          // 最低限の正規化（キーずれ吸収）
          return {
            title: json.title ?? '',
            category: json.category ?? 'その他',
            summary: json.summary ?? '',
            anonymizedText: json.anonymizedText ?? json.text ?? '',
            improvements: Array.isArray(json.improvements)
              ? json.improvements
              : json.improvements
              ? [json.improvements]
              : [],
            tags: json.tags ?? [],
            occurredAt: json.occurredAt ?? new Date().toISOString().slice(0, 10),
            suggestedReplacements: json.suggestedReplacements ?? [],
          };
        } catch (error) {
          console.error('AI generation failed:', error);
          throw error;
        } finally {
          isGenerating = false;
        }
      };
    })(),
  };

  // ヘルスチェック
  const health = () => {
    return apiCall<{ ok: boolean }>('/health', {
      method: 'GET',
      requireAuth: false,
    });
  };

  return {
    apiCall,
    reports,
    dashboard,
    ai,
    health,
  };
};
