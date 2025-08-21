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
      try {
        const { getIdToken } = useAuth();
        const token = await getIdToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
          console.log('JWT token added to request headers');
        } else {
          console.error('認証トークンが取得できませんでした。ログインが必要です。');
          throw new Error('認証が必要です。ログインしてください。');
        }
      } catch (authError) {
        console.error('認証エラー:', authError);
        throw new Error('認証が必要です。ログインしてください。');
      }
    }

    // リクエストオプション
    const fetchOptions: RequestInit = {
      method,
      headers,
      // credentials: 'include', // CORSエラーを回避するため一時的に削除
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
    // AI生成（連続送信防止付き、自動リトライ機能付き）
    generate: (() => {
      let isGenerating = false;
      let lastRequestTime = 0;
      const MIN_INTERVAL = 1500; // 1.5秒間隔に短縮

      return async (originalText: string, retryCount = 0): Promise<any> => {
        const MAX_RETRIES = 3;

        // 連続送信防止
        if (isGenerating) {
          throw new Error('AI生成処理が実行中です。しばらくお待ちください。');
        }

        // 最小間隔チェック（リトライ時は緩和）
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        const requiredInterval = retryCount > 0 ? MIN_INTERVAL / 2 : MIN_INTERVAL;

        if (timeSinceLastRequest < requiredInterval) {
          const waitTime = requiredInterval - timeSinceLastRequest;
          throw new Error(`前回のリクエストから${Math.ceil(waitTime / 1000)}秒お待ちください。`);
        }

        isGenerating = true;
        lastRequestTime = now;

        try {
          const url = `${apiBase}/ai/generate`;
          const { getIdToken } = useAuth();
          const token = await getIdToken();

          if (!token) {
            throw new Error('認証が必要です。ログインしてください。');
          }

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: originalText }),
          });

          // まずテキストで受ける（デバッグしやすい）
          const rawText = await response.text();

          if (!response.ok) {
            // 503 Service Unavailable の場合は自動リトライ
            if (response.status === 503 && retryCount < MAX_RETRIES) {
              const retryAfter = response.headers.get('Retry-After');
              const retrySeconds = retryAfter ? parseInt(retryAfter) : 2;

              console.log(
                `503エラー: ${retrySeconds}秒後にリトライします (${retryCount + 1}/${MAX_RETRIES})`,
              );

              // 指定された時間待機してリトライ
              await new Promise((resolve) => setTimeout(resolve, retrySeconds * 1000));
              isGenerating = false; // リトライのためにフラグをリセット
              return ai.generate(originalText, retryCount + 1);
            }

            // 500エラーでもリトライを試行
            if (response.status === 500 && retryCount < MAX_RETRIES) {
              let errorData: any = {};
              try {
                errorData = JSON.parse(rawText);
              } catch {}

              // "Too many requests" エラーの場合はリトライ
              if (
                errorData.message?.includes('Too many requests') ||
                errorData.message?.includes('overload')
              ) {
                console.log(
                  `500エラー（過負荷）: 3秒後にリトライします (${retryCount + 1}/${MAX_RETRIES})`,
                );
                await new Promise((resolve) => setTimeout(resolve, 3000));
                isGenerating = false;
                return ai.generate(originalText, retryCount + 1);
              }
            }

            // リトライ不可能なエラーまたは最大リトライ回数に達した場合
            let errorData: any = {};
            try {
              errorData = JSON.parse(rawText);
            } catch {}

            if (response.status === 503) {
              const error = new Error(
                `サービスが一時的に過負荷状態です。しばらく時間をおいて再試行してください。`,
              ) as any;
              error.statusCode = 503;
              throw error;
            }

            throw new Error(errorData.message || `AI生成に失敗しました (${response.status})`);
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
