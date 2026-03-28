// ==========================================
// HASHGATE - HASHGATE.JS V1 - discord.gg/mailsense | t.me/mailsense - t.me/TraceOnView
// ==========================================

console.log("log - hashgate.js caricato correttamente");

document.addEventListener("DOMContentLoaded", () => {

    const API_BASE_URL = "https://api.hashgate.net"; 
    const MIN_ENTROPY = 5; 

    
    const container = document.getElementById('hashgate-container');
    if (!container) {
        console.error("System Crash: Impossibile montare HashGate. Manca <div id='hashgate-container'>.");
        return;
    }

    const hgMode = container.getAttribute('data-mode') || 'form'; 
    const hgRedirectUrl = container.getAttribute('data-url') || '/';
    
    const stili = `
        /* Contenitore Principale (Layout Orizzontale) */
        #hashgate-widget { display: flex; align-items: center; width: 100%; max-width: 340px; background: #141417; border: 1px solid #2a2a30; border-radius: 6px; padding: 12px 16px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: all 0.3s ease; margin-bottom: 20px; }
        
        /* Area Checkbox */
        .hg-checkbox-area { margin-right: 15px; display: flex; align-items: center; }
        #hg-verify-btn { width: 28px; height: 28px; background: #0a0a0c; border: 2px solid #4a4a50; border-radius: 4px; cursor: pointer; transition: all 0.3s; position: relative; color: transparent !important; font-size: 0 !important; overflow: hidden; padding: 0; }
        #hg-verify-btn:hover { border-color: #888; }

        /* Area Testi Centrali */
        .hg-text-area { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
        #hg-status { font-size: 0.9rem; font-weight: 500; color: #fff; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
        #hg-log { font-size: 0.7rem; color: #90909a; margin-top: 3px; font-family: monospace; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }

        /* Area Brand e Link (Destra) */
        .hg-brand-area { display: flex; flex-direction: column; align-items: flex-end; margin-left: 10px; }
        .hg-logo { font-size: 0.85rem; font-weight: 800; color: #fff; letter-spacing: 0.5px; }
        .hg-logo span { color: #00ff88; }
        .hg-links { font-size: 0.55rem; color: #666; margin-top: 4px; display: flex; gap: 6px; }
        .hg-links a { color: #666; text-decoration: none; transition: 0.2s; }
        .hg-links a:hover { color: #aaa; text-decoration: underline; }

        /* ANIMAZIONE: MINING (Spinner) */
        @keyframes hg-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        #hg-verify-btn.mining { border-radius: 50%; border-color: #2a2a30; border-top-color: #00ff88; animation: hg-spin 1s linear infinite; background: transparent; cursor: wait; }

        /* STATO: PASSED (Spunta verde) */
        #hashgate-widget.passed { border-color: #00ff88; background: rgba(0, 255, 136, 0.03); }
        #hashgate-widget.passed #hg-verify-btn { border-color: #00ff88; background: #00ff88; cursor: default; }
        #hashgate-widget.passed #hg-verify-btn::after { content: ''; position: absolute; left: 8px; top: 4px; width: 5px; height: 10px; border: solid #141417; border-width: 0 2px 2px 0; transform: rotate(45deg); }

        /* STATO: POISONED (Croce rossa) */
        #hashgate-widget.poisoned { border-color: #ff4444; background: rgba(255, 68, 68, 0.03); }
        #hashgate-widget.poisoned #hg-verify-btn { border-color: #ff4444; background: #ff4444; cursor: not-allowed; }
        #hashgate-widget.poisoned #hg-verify-btn::after { content: '×'; position: absolute; left: 6px; top: -3px; font-size: 24px; color: #141417; font-weight: bold; font-family: sans-serif; }
    `;
    document.head.insertAdjacentHTML('beforeend', `<style>${stili}</style>`);

   
    container.innerHTML = `
        <div id="hashgate-widget">
            <div class="hg-checkbox-area">
                <button type="button" id="hg-verify-btn" title="Clicca per verificare l'integrità"></button>
            </div>
            
            <div class="hg-text-area">
                <div id="hg-status">Verifica se sei umano</div>
                <div id="hg-log">Protetto da HashGate</div>
            </div>
            
            <div class="hg-brand-area">
                <div class="hg-logo"><span>H</span>G</div>
                <div class="hg-links">
                    <a href="https://hashgate.net/security/privacy" target="_blank">Privacy</a>
                    <a href="https://hashgate.net/security/info" target="_blank">Info</a>
                </div>
            </div>
            
            <input type="hidden" id="hg-token" name="hg-token" required>
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
                
                if (hgMode === 'form') {
                    if (submitBtn) submitBtn.disabled = false;
                } else if (hgMode === 'redirect') {
                    document.cookie = `hg_session=${data.jwt_token}; path=/; max-age=3600; Secure; SameSite=Strict`;
                    logEl.innerText = "Reindirizzamento in corso...";
                    setTimeout(() => { window.location.href = hgRedirectUrl; }, 1000);
                }
        } catch (error) {
            statusEl.innerText = "Accesso Negato";
            statusEl.style.color = "red";
        }
    }

})();
