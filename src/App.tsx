import { useState, useEffect } from 'react';
import { usePersistentState } from './hooks/usePersistentState';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { Window } from './components/Window';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import type { Provider } from './types';
import './App.css';

const PROVIDER_CONFIG = {
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { label: 'Google', placeholder: 'AIza...' },
} as const;

function App() {
  const [apiKey, setApiKey] = usePersistentState('rcg:apiKey', '');
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = usePersistentState<Provider>('rcg:provider', 'google');
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({
    anthropic: false,
    google: false,
  });
  const { components, history, isLoading, error, generate, removeComponent, clearAll } =
    useComponentGenerator();

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setEnvKeys(data.envKeys))
      .catch(() => {});
  }, []);

  const hasEnvKey = envKeys[provider];

  const handleGenerate = (prompt: string) => {
    if (!apiKey.trim() && !hasEnvKey) {
      alert(`${PROVIDER_CONFIG[provider].label} API 키를 입력하거나 .env에 설정해주세요.`);
      return;
    }
    generate(prompt, apiKey || undefined, provider);
  };

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    setApiKey('');
  };

  const activeProvider = PROVIDER_CONFIG[provider].label;

  return (
    <div className="app">
      <header className="menubar">
        <span className="menubar-brand">
          <span className="brand-mark" aria-hidden="true">RC</span>
          컴포넌트 작업대
        </span>
        <dl className="menubar-status" aria-label="현재 작업 상태">
          <div>
            <dt>AI</dt>
            <dd>{activeProvider}</dd>
          </div>
          <div>
            <dt>컴포넌트</dt>
            <dd>{components.length}개</dd>
          </div>
        </dl>
      </header>

      <div className="desk-intro">
        <h1>말로 설명하면, 컴포넌트가 열립니다.</h1>
        <p>요청을 적으면 React 컴포넌트가 만들어지고, 바로 미리보기와 코드로 확인할 수 있어요.</p>
      </div>

      <main className="workspace">
        <Window title="무엇을 만들까요?" className="composer-panel">
          <PromptInput onGenerate={handleGenerate} isLoading={isLoading} history={history} />
        </Window>

        <Window title="실행 설정" className="settings-panel">
          <div className="provider-select">
            <label htmlFor="provider">사용할 AI</label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as Provider)}
            >
              {Object.entries(PROVIDER_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="api-key-input">
            <label htmlFor="api-key">API 키</label>
            <div className="api-key-field">
              <input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  hasEnvKey
                    ? '서버 키 사용 중 (직접 입력으로 덮어쓰기 가능)'
                    : PROVIDER_CONFIG[provider].placeholder
                }
              />
              <button
                className="btn-toggle-key"
                onClick={() => setShowKey(!showKey)}
                type="button"
              >
                {showKey ? '숨기기' : '보기'}
              </button>
            </div>
            <p className={`key-status ${hasEnvKey ? 'key-status--ready' : ''}`}>
              {hasEnvKey ? '.env 키가 연결되어 있습니다.' : '직접 입력하거나 서버 환경변수를 설정하세요.'}
            </p>
          </div>
        </Window>
      </main>

      {error && (
        <div className="error-banner" role="alert">
          <p>{error}</p>
        </div>
      )}

      <section className="results-section" aria-label="생성된 컴포넌트">
        {components.length > 0 && (
          <div className="results-header">
            <h2>생성된 컴포넌트</h2>
            <button className="btn-clear" onClick={clearAll} type="button">
              전체 삭제
            </button>
          </div>
        )}

        {components.length === 0 && !isLoading && (
          <Window title="작업대가 비어 있어요" className="empty-state">
            <p className="empty-copy">
              위에 요청을 적고 <strong>컴포넌트 생성</strong>을 누르면 이곳에 창이 하나 열립니다.
              <span className="cursor" aria-hidden="true" />
            </p>
          </Window>
        )}

        {isLoading && (
          <Window title="생성 중" className="loading-card">
            <p role="status">컴포넌트를 만들고 있어요. 잠시만 기다려주세요.</p>
            <div className="loading-bar" aria-hidden="true" />
          </Window>
        )}

        <div className="results-grid">
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onRemove={removeComponent}
              onRegenerate={handleGenerate}
              isLoading={isLoading}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
