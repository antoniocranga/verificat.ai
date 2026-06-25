export default defineContentScript({
  matches: ["*://*.youtube.com/*", "*://*.twitch.tv/*", "*://*.vimeo.com/*"],
  main() {
    const OVERLAY_ID = 'verificat-verdict-overlay';

    function createOverlay(): HTMLDivElement {
      const existing = document.getElementById(OVERLAY_ID);
      if (existing) return existing as HTMLDivElement;

      const host = document.createElement('div');
      host.id = OVERLAY_ID;
      host.style.cssText = `
        all: initial;
        position: fixed;
        bottom: 80px;
        right: 16px;
        z-index: 2147483647;
        font-family: 'Geist Sans', Inter, Arial, sans-serif;
        max-width: 280px;
        min-width: 200px;
        pointer-events: none;
      `;

      const shadow = host.attachShadow({ mode: 'closed' });
      shadow.innerHTML = `
        <style>
          :host { all: initial; display: block; }
          .card {
            background: #ffffff;
            border: 1px solid #ebebeb;
            border-radius: 12px;
            padding: 12px;
            font-size: 13px;
            line-height: 1.5;
            color: #4d4d4d;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            transition: opacity 0.3s ease;
          }
          .ink { color: #171717; }
          .mute { color: #8f8f8f; }
          .verdict-label {
            font-size: 14px;
            font-weight: 600;
            color: #171717;
            letter-spacing: -0.28px;
          }
          .confidence-bar {
            height: 3px;
            border-radius: 2px;
            margin-top: 8px;
            background: #ebebeb;
          }
          .confidence-fill {
            height: 100%;
            border-radius: 2px;
            transition: width 0.3s ease;
            background: #171717;
          }
          .status-text {
            font-size: 12px;
            color: #8f8f8f;
            text-align: center;
            padding: 4px 0;
          }
        </style>
        <div class="card" id="card">
          <div class="status-text" id="status">Pregătit</div>
        </div>
      `;

      document.body.appendChild(host);
      return host;
    }

    function showStatus(text: string) {
      const host = document.getElementById(OVERLAY_ID);
      if (!host) return;
      const shadow = host.shadowRoot;
      if (!shadow) return;
      const el = shadow.getElementById('status');
      if (el) el.textContent = text;
    }

    function showCapturing() {
      const host = document.getElementById(OVERLAY_ID);
      if (!host) return;
      const shadow = host.shadowRoot;
      if (!shadow) return;
      const card = shadow.getElementById('card');
      if (!card) return;
      card.innerHTML = `<div class="status-text">Se ascultă...</div>`;
    }

    function showProgress(stage: string) {
      const host = document.getElementById(OVERLAY_ID);
      if (!host) return;
      const shadow = host.shadowRoot;
      if (!shadow) return;
      const card = shadow.getElementById('card');
      if (!card) return;
      const labels: Record<string, string> = {
        speech: 'Transcriere audio...',
        claim_detection: 'Detectare afirmații...',
        evidence_retrieval: 'Căutare dovezi...',
        verdict_generation: 'Generare verdict...',
      };
      card.innerHTML = `<div class="status-text">${labels[stage] || 'Procesare...'}</div>`;
    }

    function showVerdict(verdict: string, explanation: string, confidence: number) {
      const host = document.getElementById(OVERLAY_ID);
      if (!host) return;
      const shadow = host.shadowRoot;
      if (!shadow) return;
      const card = shadow.getElementById('card');
      if (!card) return;
      card.innerHTML = `
        <div class="verdict-label">${verdict}</div>
        <div class="status-text" style="margin:2px 0;">${confidence} / 100</div>
        <div style="margin:4px 0;">${explanation}</div>
        <div class="confidence-bar">
          <div class="confidence-fill" style="width: ${confidence}%;"></div>
        </div>
      `;
    }

    function showError(reason: string) {
      const host = document.getElementById(OVERLAY_ID);
      if (!host) return;
      const shadow = host.shadowRoot;
      if (!shadow) return;
      const card = shadow.getElementById('card');
      if (!card) return;
      card.innerHTML = `<div class="status-text" style="color:#ef4444;">Eroare: ${reason}</div>`;
    }

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'CAPTURE_STARTED') {
        createOverlay();
        showCapturing();
      }
      if (msg.type === 'VERIFICATION_STARTED') {
        createOverlay();
        showStatus('Încărcare audio...');
      }
      if (msg.type === 'VERIFICATION_PROGRESS') {
        createOverlay();
        showProgress(msg.stage);
      }
      if (msg.type === 'VERIFICATION_COMPLETED' && msg.result?.claims?.[0]) {
        const c = msg.result.claims[0];
        showVerdict(c.verdict, c.explanation, c.confidenceScore);
      }
      if (msg.type === 'VERIFICATION_FAILED') {
        showError(msg.reason);
      }
      if (msg.type === 'VERIFICATION_RESUMING') {
        createOverlay();
        showStatus('Se reia sesiunea...');
      }
    });
  },
});
