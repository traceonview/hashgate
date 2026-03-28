"""
=========================================================
HashGate.net/python-sdk
=========================================================
Author: Trace Wilson | HashGate Security
Copyright (c) 2026 HashGate.
License: GNU GPL V3

Link Utili:
- Documentazione: https://hashgate.net/docs/python/sdk
- Supporto Diretto (Discord): https://discord.gg/hashgate
=========================================================
"""

# GUIDA VELOCE
"""
crea il file hashgate_sdk.py nella stessa directory del tuo server.py e in cima al file digita 'from hashgate_sdk import is_human
per includerla nel tuo server python inserisci questa funzione nella route desiderata (quella di destinazione dopo un click o la verifica, non metterla in '/' se l'utente prima non ha eseguito la verifica)

hg_token = request.form.get('hg-token')

    if not is_human(hg_token):
        # blocchiamo i bot
        return "<h1>Accesso Negato</h1><p>Verifica di sicurezza HashGate fallita. Sei un bot?</p>", 403

    # se l'utente è umano, il restante codice verrà eseguito

assicurati di importare la libreria re e request da flask se il tuo server di produzione utilizza flask. 
"""

import jwt
import time



# DEVE combaciare ESATTAMENTE con la SECRET_KEY del tuo server python
HASHGATE_SECRET = "prod-secret-key"

def is_human(token: str) -> bool:
    """
    Decodifica il token di HashGate.
    Ritorna True se l'utente è organico, False se è un Bot o il token è manomesso.
    """
    if not token:
        print("HashGate Log: Token mancante.")
        return False

    try:
        # Il motore SDK tenta di aprire il lucchetto
        payload = jwt.decode(token, HASHGATE_SECRET, algorithms=["HS256"])

        # Ulteriore controllo di sicurezza manuale sulla scadenza
        if payload.get("exp") and time.time() > payload.get("exp"):
            print("HashGate Log: Token scaduto.")
            return False

        return True

    except jwt.ExpiredSignatureError:
        print("HashGate Log: Token scaduto (PyJWT).")
        return False
    except jwt.InvalidTokenError:
        print("HashGate Log: Firma manomessa")
        return False
    except Exception as e:
        print(f"HashGate Log: Errore sconosciuto - {str(e)}")
        return False
