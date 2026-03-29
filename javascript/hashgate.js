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

    const siteKey = container.getAttribute('data-sitekey');
    const hgMode = container.getAttribute('data-mode') || 'form'; 
    const hgRedirectUrl = container.getAttribute('data-url') || '/';
    const hgTheme = container.getAttribute('data-theme') || 'modern-dark';

    // 1. Motore dei Temi e Asset Mapping
    const themes = {
        // --- MODERN THEMES (Sfondi sfumati, ombre colorate) ---
        'modern-dark': { 
            bg: '#141417', border: '#2a2a30', text: '#ffffff', accent: '#00ff88', radius: '12px', shadow: '0 8px 24px rgba(0,0,0,0.2)',
            gifLoad: 'loading-green.gif', gifPass: 'success-green.gif', imgFail: 'error-red.png' 
        },
        'modern-orange': { 
            bg: '#1a1614', border: '#33241c', text: '#ffffff', accent: '#ff8800', radius: '12px', shadow: '0 8px 24px rgba(255,136,0,0.08)',
            gifLoad: 'loading-orange.gif', gifPass: 'success-orange.gif', imgFail: 'error-red.png' 
        },
        'modern-blue': { 
            bg: '#12161a', border: '#1c2633', text: '#ffffff', accent: '#0088ff', radius: '12px', shadow: '0 8px 24px rgba(0,136,255,0.08)',
            gifLoad: 'loading-blue.gif', gifPass: 'success-blue.gif', imgFail: 'error-red.png' 
        },
        
        // --- OLD THEMES (Stile Cloudflare, grigi tattici, ombre interne) ---
        'old': { 
            bg: '#fcfcfc', border: '#d4d4d4', text: '#222222', accent: '#0547ad', radius: '2px', shadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
            gifLoad: 'loading-old.gif', gifPass: 'success-old.gif', imgFail: 'error-old.png' 
        },
        'old-orange': { 
            bg: '#fffbf7', border: '#e6d3c3', text: '#2d2218', accent: '#f68b1f', radius: '2px', shadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
            gifLoad: 'loading-old-orange.gif', gifPass: 'success-old-orange.gif', imgFail: 'error-old.png' 
        },
        'old-blue': { 
            bg: '#f7fbff', border: '#c3d8e6', text: '#18242d', accent: '#0070f3', radius: '2px', shadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
            gifLoad: 'loading-old-blue.gif', gifPass: 'success-old-blue.gif', imgFail: 'error-old.png' 
        }
    };
    const t = themes[hgTheme] || themes['modern-dark'];
    const cdn = 'https://api.hashgate.net/cdn/static/'; // Base URL per gli asset
    const shadow = container.attachShadow({mode: 'open'});

    // 2. CSS Interno con Iniezione Dinamica
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        :host { display: block; width: 360px; height: 65px; margin: 10px 0; font-family: 'Inter', system-ui, sans-serif; }
        .hg-wrapper {
            display: flex; align-items: center; justify-content: space-between;
            width: 360px; height: 65px; padding: 0 15px; box-sizing: border-box;
            background: ${t.bg}; border: 1px solid ${t.border}; border-radius: ${t.radius};
            box-shadow: ${t.shadow}; position: relative; overflow: hidden; color: ${t.text};
            transition: all 0.3s ease;
        }
        .hg-checkbox-area { width: 35px; display: flex; align-items: center; }
        
        #hg-verify-btn {
            width: 28px; height: 28px; background: ${hgTheme.includes('dark') || hgTheme.includes('modern') ? '#0a0a0c' : '#ffffff'};
            border: 2px solid ${t.border}; border-radius: ${hgTheme.includes('modern') ? '6px' : '0px'};
            cursor: pointer; transition: 0.2s; background-size: 0; background-position: center; background-repeat: no-repeat;
        }
        #hg-verify-btn:hover { border-color: ${t.accent}; }
        
        /* --- ASSET DINAMICI DAL CDN --- */
        #hg-verify-btn.mining { 
            background-image: url('${cdn}${t.gifLoad}'); 
            background-size: cover; border-color: transparent; border-radius: 50%; 
        }
        .passed #hg-verify-btn { 
            background-image: url('${cdn}${t.gifPass}'); 
            background-size: 100%; border-color: ${t.accent}; background-color: transparent; 
        }
        .frozen #hg-verify-btn { 
            background-image: url('${cdn}${t.gifPass.replace('.gif', '.png')}'); 
        }
        
        .hg-text-area { flex-grow: 1; display: flex; flex-direction: column; margin-left: 12px; overflow: hidden; }
        .hg-status { font-size: 14px; font-weight: 600; margin: 0; line-height: 1.2; white-space: nowrap; }
        .hg-log { font-size: 11px; color: ${hgTheme.includes('old') ? '#666666' : '#90909a'}; margin-top: 2px; white-space: nowrap; }
        .hg-brand-area { display: flex; flex-direction: column; align-items: flex-end; width: 80px; flex-shrink: 0; }
        
        /* Filtro dinamico per il logo: lo scuriamo sui temi bianchi */
        .hg-logo { width: 22px; height: 22px; margin-bottom: 4px; object-fit: contain; filter: ${hgTheme.includes('old') ? 'brightness(0.2)' : 'none'}; }
        
        .hg-links { display: flex; gap: 8px; font-size: 9px; opacity: 0.7; }
        .hg-links a { color: inherit; text-decoration: none; }
        .hg-links a:hover { color: ${t.accent}; opacity: 1; }
        
        /* Poisoning Mode */
        .poisoned { border-color: #ff4444 !important; }
        .poisoned #hg-verify-btn { 
            border-color: #ff4444; background-image: url('${cdn}${t.imgFail}'); 
            background-size: 70%; background-color: transparent; cursor: not-allowed; 
        }
    `;

    const widget = document.createElement('div');
    widget.className = 'hg-wrapper';
    widget.innerHTML = `
        <div class="hg-checkbox-area"><button type="button" id="hg-verify-btn"></button></div>
        <div class="hg-text-area">
            <div class="hg-status" id="hg-status">Security Check</div>
            <div class="hg-log" id="hg-log">Verify your identity</div>
        </div>
        <div class="hg-brand-area">
            <img src="https://api.hashgate.net/cdn/static/logo.webp" class="hg-logo" alt="HG">
            <div class="hg-links"><a href="#">Privacy</a><a href="#">Terms</a></div>
        </div>
        <input type="hidden" id="hg-token">
    `;

    shadow.appendChild(styleTag);
    shadow.appendChild(widget);

    const btn = shadow.querySelector('#hg-verify-btn');
    const statusEl = shadow.querySelector('#hg-status');
    const logEl = shadow.querySelector('#hg-log');
    const tokenInput = shadow.querySelector('#hg-token');
    
    const form = container.closest('form');
    const submitBtn = form ? form.querySelector('button[type="submit"], input[type="submit"]') : document.getElementById('submit-btn');
    if (submitBtn && hgMode === 'form') submitBtn.disabled = true;
    
    // --- CONTROLLO PERSISTENZA ---
    const hgState = localStorage.getItem('hashgate_verified');

    if (hgState === 'true') {
        widget.classList.add('passed', 'frozen');
        statusEl.innerText = "Verifica completata";
        logEl.innerText = "Sicurezza fornita da HashGate.net";
        tokenInput.value = "token_locale_valido"; 

        if (hgMode === 'form' && submitBtn) {
            submitBtn.disabled = false;
        } else if (hgMode === 'redirect') {
            setTimeout(() => { window.location.href = hgRedirectUrl; }, 1000);
        }

    }   else if (hgState === 'false') {
        widget.classList.add('poisoned');
        btn.innerText = "pois";
        btn.disabled = true;
        statusEl.innerText = "Accesso Negato";
        statusEl.style.color = "red";

        const poisoningCore = () => {
            const garbage = [];
            for (let i = 0; i < 5000; i++) {
                garbage.push(btoa(Math.random().toString(36).substring(2)));
            }
            logEl.innerText = garbage.join(' :: ');
            requestAnimationFrame(poisoningCore); 
        };
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
