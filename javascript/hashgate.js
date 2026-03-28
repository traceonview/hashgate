// ==========================================
// HASHGATE - HASHGATE.JS V1 - discord.gg/mailsense | t.me/mailsense - t.me/TraceOnView
// ==========================================

const API_BASE_URL = "http://85.93.9.51:8000"; 
const MIN_ENTROPY = 5; 

// Elementi
const widget = document.getElementById('hashgate-widget');
const btn = document.getElementById('hg-verify-btn');
const statusEl = document.getElementById('hg-status');
const logEl = document.getElementById('hg-log');
const tokenInput = document.getElementById('hg-token');
const submitBtn = document.getElementById('submit-btn');

// --- CONTROLLO PERSISTENZA E POISONING ---
const hgState = localStorage.getItem('hashgate_verified');

if (hgState === 'true') {
    // profilo Umano
    widget.classList.add('passed');
    btn.innerText = "Integrità verificata";
    btn.disabled = true;
    statusEl.innerText = "Connessione Consentita";
    logEl.innerText = "profilo caricato";
    submitBtn.disabled = false;
    
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

// --- LOGICA ---
function inizializzaSensori() {
    let entropyScore = 0;
    let lastX = 0, lastY = 0;
    let isMining = false;

    function analizzaMovimento(e) {
        if (isMining) return;
        const deltaX = Math.abs(e.clientX - lastX);
        const deltaY = Math.abs(e.clientY - lastY);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance > 0 && distance < 150) { entropyScore += 1; }
        lastX = e.clientX;
        lastY = e.clientY;
    }
    document.addEventListener('mousemove', analizzaMovimento);

    btn.addEventListener('click', async (e) => {
        // /RIilevamento Bot
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
            statusEl.innerText = "Accesso Consentito";
            statusEl.style.color = "#00ff00";
            btn.classList.remove('mining');
            btn.innerText = "Integrità verificata (Persistente)";
            logEl.innerText = `JWT Generato. Sicurezza: Massima.`;
            tokenInput.value = data.jwt_token;
            submitBtn.disabled = false;
        } else {
            throw new Error("Hash Rifiutato");
        }
    } catch (error) {
        statusEl.innerText = "Accesso Negato";
        statusEl.style.color = "red";
    }
}
