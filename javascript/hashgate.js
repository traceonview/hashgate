// ==========================================
// HASHGATE - HASHGATE.JS V1 - discord.gg/mailsense | t.me/mailsense - t.me/TraceOnView
// ==========================================

console.log("log - hashgate.js caricato correttamente");

document.addEventListener("DOMContentLoaded", () => {
    // eliminiamo il coockie così da evitare falsi positivi
    localStorage.removeItem('hashgate_verified');
    document.cookie = "hg_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    console.log("log - sessione pulita");

    const API_BASE_URL = "https://api.hashgate.net"; 
    const MIN_ENTROPY = 5; 

    
    const container = document.getElementById('hashgate-container');
    if (!container) {
        console.error("System Crash: Impossibile montare HashGate. Manca <div id='hashgate-container'>.");
        return;
    }

    const hgMode = container.getAttribute('data-mode') || 'form'; 
    const hgRedirectUrl = container.getAttribute('data-url') || '/';
    
    const hgTheme = container.getAttribute('data-theme') || 'dark';
    const stili = `
        :root {
            --hg-bg: ${hgTheme === 'dark' ? '#141417' : '#ffffff'};
            --hg-border: ${hgTheme === 'dark' ? '#2a2a30' : '#e0e0e0'};
            --hg-text: ${hgTheme === 'dark' ? '#ffffff' : '#1a1a1a'};
            --hg-text-dim: ${hgTheme === 'dark' ? '#90909a' : '#666666'};
            --hg-accent: #00ff88;
            --hg-error: #ff4444;
            --hg-btn-bg: ${hgTheme === 'dark' ? '#0a0a0c' : '#f5f5f7'};
        }

        #hashgate-widget { 
            display: flex; align-items: center; width: 100%; max-width: 360px; 
            background: var(--hg-bg); border: 1px solid var(--hg-border); 
            border-radius: 12px; padding: 12px 18px; box-sizing: border-box; 
            font-family: 'Inter', system-ui, sans-serif; 
            box-shadow: 0 8px 24px rgba(0,0,0,0.12); 
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
            position: relative; overflow: hidden;
        }

        /* Area Checkbox con Immagini */
        .hg-checkbox-area { margin-right: 15px; display: flex; align-items: center; position: relative; }
        
        #hg-verify-btn { 
            width: 32px; height: 32px; background: var(--hg-btn-bg); 
            border: 2px solid var(--hg-border); border-radius: 8px; 
            cursor: pointer; transition: all 0.3s; position: relative;
            background-size: 60%; background-position: center; background-repeat: no-repeat;
        }

        #hg-verify-btn:hover { border-color: var(--hg-accent); transform: scale(1.05); }

        /* Stati Animati con GIF/PNG */
        #hg-verify-btn.mining { 
            border-radius: 50%; border-color: transparent;
            background-image: url('https://api.hashgate.net/cdn/assets/loading.gif'); 
            background-size: cover; cursor: wait; 
        }

        #hashgate-widget.passed #hg-verify-btn { 
            background-color: var(--hg-accent); border-color: var(--hg-accent);
            background-image: url('https://api.hashgate.net/cdn/assets/success.png');
            background-size: 55%;
        }

        #hashgate-widget.poisoned #hg-verify-btn { 
            background-color: var(--hg-error); border-color: var(--hg-error);
            background-image: url('https://api.hashgate.net/cdn/assets/error.png');
            background-size: 50%;
        }

        /* Testi e Brand */
        .hg-text-area { flex-grow: 1; display: flex; flex-direction: column; }
        #hg-status { font-size: 0.95rem; font-weight: 600; color: var(--hg-text); }
        #hg-log { font-size: 0.75rem; color: var(--hg-text-dim); margin-top: 2px; }

        .hg-brand-area { display: flex; flex-direction: column; align-items: flex-end; opacity: 0.8; }
        .hg-brand-logo { width: 22px; height: 22px; margin-bottom: 4px; }
    `;
    document.head.insertAdjacentHTML('beforeend', `<style>${stili}</style>`);

   
    container.innerHTML = `
        <div id="hashgate-widget" class="hg-${hgTheme}">
            <div class="hg-checkbox-area">
                <button type="button" id="hg-verify-btn"></button>
            </div>
            
            <div class="hg-text-area">
                <div id="hg-status">Security Check</div>
                <div id="hg-log">Verify your identity</div>
            </div>
            
            <div class="hg-brand-area">
                <img src="https://api.hashgate.net/cdn/assets/logo.png" class="hg-brand-logo" alt="HG">
                <div class="hg-links" style="font-size: 0.6rem; color: var(--hg-text-dim); display: flex; gap: 8px;">
                    <a href="#" style="color: inherit; text-decoration: none;">Privacy</a>
                    <a href="#" style="color: inherit; text-decoration: none;">Terms</a>
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
    
    // cerca il btn di submit
    const form = container.closest('form');
    const submitBtn = form ? form.querySelector('button[type="submit"], input[type="submit"]') : document.getElementById('submit-btn');
    if (submitBtn && hgMode === 'form') submitBtn.disabled = true;

    // --- CONTROLLO PERSISTENZA E POISONING ---
    const hgState = localStorage.getItem('hashgate_verified');

    if (hgState === 'true') {
        // profilo Umano
        widget.classList.add('passed');
        btn.innerText = "Integrità verificata";
        btn.disabled = true;
        statusEl.innerText = "Connessione Consentita";
        logEl.innerText = "profilo caricato";
        tokenInput.value = "token_locale_valido"; 
        if (hgMode === 'form' && submitBtn) {
            submitBtn.disabled = false;
        } else if (hgMode === 'redirect') {
            logEl.innerText = "Sessione valida. Reindirizzamento...";
            setTimeout(() => { window.location.href = hgRedirectUrl; }, 1000);
        }
        
    } else if (hgState === 'false') {
        // bot bannato
        widget.classList.add('poisoned');
        btn.innerText = "pois";
        btn.disabled = true;
        statusEl.innerText = "Accesso Negato";
        statusEl.style.color = "red";
        
        function poisoningCore() {
            const garbage = [];
            for (let i = 0; i < 5000; i++) {
                garbage.push(btoa(Math.random().toString(36).substring(2)));
            }
            logEl.innerText = garbage.join(' :: ');
            requestAnimationFrame(poisoningCore); 
        }
        setTimeout(poisoningCore, 500);

    } else {
        // ---  LOGICA STANDARD (Se è un nuovo utente) ---
        inizializzaSensori();
    }

    // --- logica e sensori con supporto mobile ---
    // --- logica e sensori con supporto mobile avanzato ---
    function inizializzaSensori() {
        let entropyScore = 0;
        let lastX = 0, lastY = 0;
        let isMining = false;
        const sessionStartTime = Date.now();
        let firstTapTime = 0;

        function analizzaMovimento(e) {
            if (isMining) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const distance = Math.sqrt(Math.pow(clientX - lastX, 2) + Math.pow(clientY - lastY, 2));
            if (distance > 0 && distance < 150) { entropyScore += 1; }
            lastX = clientX;
            lastY = clientY;
        }

        function analizzaTap(e) { if (!isMining && e.isTrusted) entropyScore += 2; }
        function analizzaTastiera(e) { if (!isMining && e.isTrusted) entropyScore += 1; }
        function analizzaGiroscopio(e) {
            if (!isMining && e.beta && e.gamma && (Math.abs(e.beta) > 1 || Math.abs(e.gamma) > 1)) {
                entropyScore += 2;
                window.removeEventListener('deviceorientation', analizzaGiroscopio);
            }
        }
        
        document.addEventListener('mousemove', analizzaMovimento);
        document.addEventListener('touchmove', analizzaMovimento);
        document.addEventListener('touchstart', analizzaTap); 
        document.addEventListener('keydown', analizzaTastiera); 
        if (window.DeviceOrientationEvent) window.addEventListener('deviceorientation', analizzaGiroscopio);

        btn.addEventListener('click', async (e) => {
            const timeToClick = Date.now() - sessionStartTime;

            if (!e.isTrusted || timeToClick < 300) {
                localStorage.setItem('hashgate_verified', 'false');
                setTimeout(() => { window.location.reload(); }, 1500); 
                return; 
            }

            if (entropyScore < MIN_ENTROPY) {
                if (firstTapTime === 0) {
                    firstTapTime = Date.now();
                    statusEl.innerText = "Conferma tocco";
                    statusEl.style.color = "#ffcc00"; 
                    return; 
                } else {
                    const timeBetweenTaps = Date.now() - firstTapTime;
                    if (timeBetweenTaps < 100 || timeBetweenTaps > 5000) return;
                    entropyScore = MIN_ENTROPY; 
                }
            }

            statusEl.style.color = "#fff";
            btn.classList.add('mining');
            btn.innerText = "Analisi Traiettorie..."; 
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
            const response = await fetch(`${API_BASE_URL}/challenge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entropy_signature: entropySignature })
            });
            
            if (!response.ok) throw new Error("API Rifiutata");
            
            const data = await response.json();
            statusEl.innerText = "Calcolo in corso. . .";
            lanciaWorker(data.salt, data.difficulty);
        } catch (error) {
            statusEl.innerText = "Errore";
            logEl.innerText = "/il firewall del server ha bloccato la richiesta.";
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
            const response = await fetch(`${API_BASE_URL}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ salt: salt, nonce: nonce })
            });
            const data = await response.json();

            if (data.status === "success") {
                localStorage.setItem('hashgate_verified', 'true'); 
                widget.classList.add('passed');
                statusEl.innerText = "Accesso Consentito";
                statusEl.style.color = "#00ff00";
                btn.classList.remove('mining');
                btn.innerText = "Integrità verificata (Persistente)";
                logEl.innerText = `JWT Generato. Sicurezza: Massima.`;
                tokenInput.value = data.jwt_token;
                
                // Il nostro Camaleonte
                if (hgMode === 'form') {
                    if (submitBtn) submitBtn.disabled = false;
                } else if (hgMode === 'redirect') {
                    document.cookie = `hg_session=${data.jwt_token}; path=/; max-age=3600; Secure; SameSite=Strict`;
                    logEl.innerText = "Reindirizzamento in corso...";
                    setTimeout(() => { window.location.href = hgRedirectUrl; }, 1000);
                }
            } else {
                // Questo è il pezzo che avevi cancellato!
                throw new Error("Hash Rifiutato");
            }
        } catch (error) {
            statusEl.innerText = "Accesso Negato";
            statusEl.style.color = "red";
        }
    }
})();
