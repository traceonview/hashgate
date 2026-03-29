/**
 * ============================================================================
 * HashGate security - HASHGATE.JS V1
 * ============================================================================
 * @version 1.0.0
 * @author Trace Wilson | HashGate Security
 * @copyright 2026 HashGate. All rights reserved.
 * * Stop automated threats. Protect your APIs and Forms organically.
 * 🌐 Web: https://hashgate.net
 * 💬 Community & Support: https://discord.gg/hashgate
 * 📚 Docs: https://hashgate.net/docs/javascript/hashgate
 * * WARNING: Reverse engineering or tampering with this payload may 
 * trigger an automatic IP Strict-Lock. 
 * ============================================================================
 */

console.log("log - hashgate.js caricato correttamente");

document.addEventListener("DOMContentLoaded", () => {
    // Pulizia sessione
    localStorage.removeItem('hashgate_verified');
    document.cookie = "hg_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    console.log("log - sessione pulita");

    const API_BASE_URL = "https://api.hashgate.net"; 
    
    const container = document.getElementById('hashgate-container');
    if (!container) {
        console.error("System Crash: Impossibile montare HashGate. Manca <div id='hashgate-container'>.");
        return;
    }

    const hgMode = container.getAttribute('data-mode') || 'form'; 
    const hgRedirectUrl = container.getAttribute('data-url') || '/';
    const siteKey = container.getAttribute('data-sitekey');
    
    if (!siteKey) {
        console.error("System Crash: API Key mancante (data-sitekey).");
    }

    const hgTheme = container.getAttribute('data-theme') || 'modern-dark';
    
    // --- CONFIGURAZIONE TEMI ---
    const themes = {
        'modern-dark':    { bg: '#141417', border: '#2a2a30', text: '#ffffff', accent: '#00ff88', radius: '12px', shadow: '0 8px 24px rgba(0,0,0,0.12)' },
        'modern-light':   { bg: '#ffffff', border: '#e0e0e0', text: '#1a1a1a', accent: '#00ff88', radius: '12px', shadow: '0 4px 12px rgba(0,0,0,0.05)' },
        'modern-orange':  { bg: '#141417', border: '#2a2a30', text: '#ffffff', accent: '#ff8800', radius: '12px', shadow: '0 8px 24px rgba(0,0,0,0.12)' },
        'modern-blue':    { bg: '#141417', border: '#2a2a30', text: '#ffffff', accent: '#0088ff', radius: '12px', shadow: '0 8px 24px rgba(0,0,0,0.12)' },
        'old':            { bg: '#f9f9f9', border: '#d1d1d1', text: '#222222', accent: '#0547ad', radius: '2px',  shadow: 'none' },
        'old-orange':     { bg: '#f9f9f9', border: '#d1d1d1', text: '#222222', accent: '#f68b1f', radius: '2px',  shadow: 'none' },
        'old-blue':       { bg: '#f9f9f9', border: '#d1d1d1', text: '#222222', accent: '#0070f3', radius: '2px',  shadow: 'none' }
    };

    const t = themes[hgTheme] || themes['modern-dark'];

    const stili = `
        :root {
            --hg-bg: ${t.bg};
            --hg-border: ${t.border};
            --hg-text: ${t.text};
            --hg-text-dim: ${hgTheme.includes('dark') ? '#90909a' : '#666666'};
            --hg-accent: ${t.accent};
            --hg-radius: ${t.radius};
            --hg-shadow: ${t.shadow};
            --hg-btn-bg: ${hgTheme.includes('dark') ? '#0a0a0c' : '#ffffff'};
        }

        #hashgate-widget { 
            display: flex !important; 
            align-items: center !important; 
            justify-content: space-between !important;
            
            width: 360px !important; 
            height: 65px !important; 
            
            background: var(--hg-bg) !important; 
            border: 1px solid var(--hg-border) !important; 
            border-radius: var(--hg-radius) !important; 
            padding: 0 15px !important; 
            box-sizing: border-box !important; 
            font-family: 'Inter', system-ui, sans-serif !important; 
            box-shadow: var(--hg-shadow) !important; 
            position: relative !important; 
            overflow: hidden !important;
        }

        /* Area Checkbox */
        .hg-checkbox-area { width: 35px !important; display: flex !important; align-items: center !important; }

        #hg-verify-btn { 
            width: 28px !important; height: 28px !important; 
            background: var(--hg-btn-bg) !important; 
            border: 2px solid var(--hg-border) !important; 
            border-radius: ${hgTheme.includes('modern') ? '6px' : '0px'} !important; 
            cursor: pointer !important;
            background-size: 0; background-position: center; background-repeat: no-repeat;
        }

        /* Area Testi */
        .hg-text-area { 
            flex-grow: 1 !important; 
            display: flex !important; 
            flex-direction: column !important; 
            margin-left: 10px !important;
            justify-content: center !important;
            overflow: hidden !important; /* Taglia se troppo lungo */
        }

        #hg-status { 
            font-size: 14px !important; 
            font-weight: 600 !important; 
            color: var(--hg-text) !important; 
            margin: 0 !important;
            line-height: 1.2 !important;
            white-space: nowrap !important; /* Impedisce a capo */
        }

        #hg-log { 
            font-size: 11px !important; 
            color: var(--hg-text-dim) !important; 
            margin: 2px 0 0 0 !important;
            line-height: 1.1 !important;
            white-space: nowrap !important;
        }

        /* Area Brand & Links */
        .hg-brand-area { 
            display: flex !important; 
            flex-direction: column !important; 
            align-items: flex-end !important; 
            width: 80px !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
        }

        .hg-brand-logo { 
            width: 22px !important; /* Dimensioni FISSE bloccate */
            height: 22px !important; 
            margin-bottom: 4px !important;
            object-fit: contain !important; /* Evita stretching */
            filter: ${hgTheme.includes('light') || hgTheme.includes('old') ? 'grayscale(1) brightness(0.5)' : 'none'};
        }

        .hg-links { display: flex !important; gap: 8px !important; }
        .hg-links a { font-size: 10px !important; color: var(--hg-text-dim) !important; text-decoration: none !important; }
        .hg-links a:hover { color: var(--hg-accent) !important; }
    `;
    container.innerHTML = `
        <div id="hashgate-widget" class="hg-theme-${hgTheme}">
            <div class="hg-checkbox-area">
                <button type="button" id="hg-verify-btn"></button>
            </div>
            
            <div class="hg-text-area">
                <div id="hg-status">Security Check</div>
                <div id="hg-log">Verify your identity</div>
            </div>
            
            <div class="hg-brand-area">
                <img src="https://api.hashgate.net/cdn/static/logo.webp" class="hg-brand-logo" alt="HG">
                <div class="hg-links">
                    <a href="https://hashgate.net/privacy" target="_blank">Privacy</a>
                    <a href="https://hashgate.net/terms" target="_blank">Terms</a>
                </div>
            </div>
            
            <input type="hidden" id="hg-token" name="hg-token">
        </div>
    `;

    const widget = container.querySelector('#hashgate-widget');
    const btn = container.querySelector('#hg-verify-btn');
    const statusEl = container.querySelector('#hg-status');
    const logEl = container.querySelector('#hg-log');
    const tokenInput = container.querySelector('#hg-token');
    
    const form = container.closest('form');
    const submitBtn = form ? form.querySelector('button[type="submit"], input[type="submit"]') : document.getElementById('submit-btn');
    if (submitBtn && hgMode === 'form') submitBtn.disabled = true;

    // --- CONTROLLO PERSISTENZA ---
    const hgState = localStorage.getItem('hashgate_verified');

    if (hgState === 'true') {
        widget.classList.add('passed');
        btn.innerText = "";
        btn.disabled = true;
        statusEl.innerText = "Verifica completata";
        logEl.innerText = "Sicurezza fornita da HashGate.net";
        tokenInput.value = "token_locale_valido"; 
        if (hgMode === 'form' && submitBtn) submitBtn.disabled = false;
        else if (hgMode === 'redirect') {
            logEl.innerText = "Sessione valida. Reindirizzamento...";
            setTimeout(() => { window.location.href = hgRedirectUrl; }, 1000);
        }
    } else if (hgState === 'false') {
        widget.classList.add('poisoned');
        btn.innerText = "pois";
        btn.disabled = true;
        statusEl.innerText = "Accesso Negato";
        statusEl.style.color = "red";
        function poisoningCore() {
            const garbage = [];
            for (let i = 0; i < 5000; i++) garbage.push(btoa(Math.random().toString(36).substring(2)));
            logEl.innerText = garbage.join(' :: ');
            requestAnimationFrame(poisoningCore); 
        }
        setTimeout(poisoningCore, 500);
    } else {
        inizializzaSensori();
    }

    // --- MODULI AVANZATI ---
    function ottieniWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return "no_webgl";
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            return `${gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)}::${gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)}`;
        } catch (e) {
            return "error_webgl";
        }
    }

    function inviaTelemetria(esito, dettaglio) {
        if (!siteKey) return;
        fetch(`${API_BASE_URL}/telemetry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-hashgate-key': siteKey },
            body: JSON.stringify({ esito: esito, dettaglio: dettaglio })
        }).catch(() => {});
    }

    // --- LOGICA CORE ---
    function inizializzaSensori() {
        let entropyScore = 0;
        let lastX = 0, lastY = 0;
        let isMining = false;
        const sessionStartTime = Date.now();

        function analizzaMovimento(e) {
            if (isMining) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const distance = Math.sqrt(Math.pow(clientX - lastX, 2) + Math.pow(clientY - lastY, 2));
            if (distance > 0 && distance < 150) entropyScore += 1;
            lastX = clientX; lastY = clientY;
        }

        function analizzaTap(e) { if (!isMining && e.isTrusted) entropyScore += 2; }
        function analizzaTastiera(e) { if (!isMining && e.isTrusted) entropyScore += 1; }
        
        document.addEventListener('mousemove', analizzaMovimento);
        document.addEventListener('touchmove', analizzaMovimento);
        document.addEventListener('touchstart', analizzaTap); 
        document.addEventListener('keydown', analizzaTastiera); 

        btn.addEventListener('click', async (e) => {
            const timeToClick = Date.now() - sessionStartTime;

            if (!e.isTrusted || timeToClick < 300) {
                localStorage.setItem('hashgate_verified', 'false');
                inviaTelemetria('blocked', 'fast_click_or_untrusted'); 
                setTimeout(() => { window.location.reload(); }, 1500); 
                return; 
            }

            statusEl.innerText = "Analisi in corso...";
            statusEl.style.color = "#fff";
            btn.classList.add('mining');
            btn.innerText = ""; 
            btn.disabled = true;
            isMining = true;
            
            document.removeEventListener('mousemove', analizzaMovimento); 
            document.removeEventListener('touchmove', analizzaMovimento);
            document.removeEventListener('touchstart', analizzaTap);
            document.removeEventListener('keydown', analizzaTastiera);
            
            avviaAutenticazione(entropyScore);
        });
    }

    async function avviaAutenticazione(entropySignature) {
        statusEl.innerText = "Connessione al nodo...";
        try {
            if (!siteKey) throw new Error("Nessuna API Key fornita.");

            const gpuData = ottieniWebGLFingerprint();
            const payload = { 
                entropy_signature: entropySignature,
                hardware_fp: gpuData 
            };

            const response = await fetch(`${API_BASE_URL}/challenge`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-hashgate-key': siteKey
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.log("LOG DI SISTEMA CHALLENGE:", errorData);
                throw new Error("API Rifiutata o Key non valida");
            }
            
            const data = await response.json();
            statusEl.innerText = "Calcolo in corso. . .";
            lanciaWorker(data.salt, data.difficulty);
            
        } catch (error) {
            statusEl.innerText = "Accesso Negato";
            logEl.innerText = "Connessione al nodo fallita.";
            console.error("HashGate Crash:", error.message); 
        }
    }

    function lanciaWorker(salt, difficulty) {
        const workerCode = `
            importScripts('https://cdnjs.cloudflare.com/ajax/libs/js-sha256/0.9.0/sha256.min.js');
            self.onmessage = function(e) {
                const { salt, difficulty } = e.data;
                const target = "0".repeat(difficulty);
                let nonce = 0;
                while(true) {
                    const hash = sha256(salt + nonce);
                    if (hash.startsWith(target)) {
                        self.postMessage({ status: 'success', nonce: String(nonce), hash: hash });
                        break;
                    }
                    nonce++;
                    if (nonce % 20000 === 0) self.postMessage({ status: 'mining', hashes: nonce });
                }
            };
        `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));

        worker.postMessage({ salt: salt, difficulty: difficulty });
        worker.onmessage = async function(e) {
            const result = e.data;
            if (result.status === 'mining') logEl.innerText = `Calcolati ${result.hashes} hash...`;
            if (result.status === 'success') {
                worker.terminate();
                validaRisultato(salt, result.nonce);
            }
        };
    }

    async function validaRisultato(salt, nonce) {
        try {
            if (!siteKey) throw new Error("API Key mancante.");
            
            const response = await fetch(`${API_BASE_URL}/verify`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-hashgate-key': siteKey
                },
                body: JSON.stringify({ salt: salt, nonce: nonce })
            });
            
            const data = await response.json();
            console.log("LOG DI SISTEMA - Risposta Server:", data); 
            
            if (data.status === "success") {
                localStorage.setItem('hashgate_verified', 'true'); 
                widget.classList.add('passed');
                setTimeout(() => widget.classList.add('frozen'), 1200); 
                statusEl.innerText = "Accesso Consentito";
                statusEl.style.color = "#00ff00";
                btn.classList.remove('mining');
                btn.innerText = ""; 
                logEl.innerText = "Identità confermata.";
                tokenInput.value = data.jwt_token; 
                
                if (hgMode === 'form') {
                    if (submitBtn) submitBtn.disabled = false;
                } else if (hgMode === 'redirect') {
                    document.cookie = `hg_session=${data.jwt_token}; path=/; max-age=3600; Secure; SameSite=Strict`;
                    logEl.innerText = "Reindirizzamento in corso...";
                    setTimeout(() => { window.location.href = hgRedirectUrl; }, 1000);
                }
            } else {
                throw new Error(data.message || "Hash Rifiutato dal Server");
            }
        } catch (error) {
            statusEl.innerText = "Accesso Negato";
            statusEl.style.color = "red";
            console.error("HashGate Log:", error.message);
        }
    }
});
