// ==========================================
// HASHGATE - HASHGATE.JS V1 - discord.gg/mailsense | t.me/mailsense - t.me/TraceOnView
// ==========================================

console.log("log - hashgate.js caricato correttamente");

(() => {

    const API_BASE_URL = "https://api.hashgate.net"; 
    const MIN_ENTROPY = 5; 

    
    const container = document.getElementById('hashgate-container');
    if (!container) {
        console.error("System Crash: Impossibile montare HashGate. Manca <div id='hashgate-container'>.");
        return;
    }

    
    const stili = `
        #hashgate-widget { border: 1px solid #2a2a30; padding: 15px; border-radius: 8px; background: #141417; color: #e0e0e6; font-family: sans-serif; margin-bottom: 20px; box-sizing: border-box; }
        .hg-header { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.75rem; color: #90909a; font-weight: bold; }
        #hg-verify-btn { width: 100%; padding: 12px; background: #0a0a0c; border: 1px solid #2a2a30; border-radius: 6px; color: #e0e0e6; cursor: pointer; transition: 0.3s; font-size: 0.9rem; }
        #hashgate-widget.passed { border-color: #00ff88; background: rgba(0,255,136,0.03); }
        #hashgate-widget.passed #hg-verify-btn { border-color: #00ff88; color: #00ff88; cursor: default; }
        #hashgate-widget.poisoned { border-color: #ff4444; background: rgba(255,68,68,0.03); }
        #hashgate-widget.poisoned #hg-verify-btn { border-color: #ffcc00; color: #ffcc00; cursor: not-allowed; }
        .hg-meta-area { margin-top: 10px; font-size: 0.8rem; }
        #hg-log { font-family: monospace; color: #90909a; font-size: 0.7rem; margin-top: 4px; word-wrap: break-word; }
    `;
    document.head.insertAdjacentHTML('beforeend', `<style>${stili}</style>`);

   
    container.innerHTML = `
        <div id="hashgate-widget">
            <div class="hg-header"><span>HASHGATE Security</span><span>v1</span></div>
            <button type="button" id="hg-verify-btn">Verifica con HASHGATE</button>
            <div class="hg-meta-area">
                <div id="hg-status" style="font-weight:bold;">In attesa di interazione...</div>
                <div id="hg-log"></div>
            </div>
            <input type="hidden" id="hg-token" name="hg-token" required>
        </div>
    `;

    document.addEventListener("DOMContentLoaded", () => {
    const widget = document.getElementById('hashgate-widget');
    const btn = document.getElementById('hg-verify-btn');
    const statusEl = document.getElementById('hg-status');
    const logEl = document.getElementById('hg-log');
    const tokenInput = document.getElementById('hg-token');
    
    // Trova il bottone di submit
    const form = container.closest('form');
    const submitBtn = form ? form.querySelector('button[type="submit"], input[type="submit"]') : document.getElementById('submit-btn');
        if (!widget) {
        console.error("'hashgate-widget' non trovato nell'html.");
        return;
    }
    if (submitBtn) submitBtn.disabled = true;

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
        if (submitBtn) submitBtn.disabled = false;
        
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
    function inizializzaSensori() {
        let entropyScore = 0;
        let lastX = 0, lastY = 0;
        let isMining = false;

        function analizzaMovimento(e) {
            if (isMining) return;
            
            // supporto per touch e mouse
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            const deltaX = Math.abs(clientX - lastX);
            const deltaY = Math.abs(clientY - lastY);
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (distance > 0 && distance < 150) { entropyScore += 1; }
            lastX = clientX;
            lastY = clientY;
        }
        
        document.addEventListener('mousemove', analizzaMovimento);
        document.addEventListener('touchmove', analizzaMovimento); // <-- Sensore Smartphone

        btn.addEventListener('click', async (e) => {
            // RIlevamento Bot
            if (!e.isTrusted || entropyScore < MIN_ENTROPY) {
                localStorage.setItem('hashgate_verified', 'false');
                statusEl.innerText = "Errore di traiettoria";
                logEl.innerText = "Traiettoria non organica";
                btn.disabled = true;
                btn.innerText = "Bot Rilevato";
                setTimeout(() => { window.location.reload(); }, 1500); 
                return; 
            }

            // uente Legittimo
            btn.classList.add('mining');
            btn.innerText = "Analisi Traiettorie..."; 
            btn.disabled = true;
            isMining = true;
            document.removeEventListener('mousemove', analizzaMovimento); 
            document.removeEventListener('touchmove', analizzaMovimento); // <-- Stop Sensore
            
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
                
                if (submitBtn) submitBtn.disabled = false;
            } else {
                throw new Error("Hash Rifiutato");
            }
        } catch (error) {
            statusEl.innerText = "Accesso Negato";
            statusEl.style.color = "red";
        }
    }

})(); 
