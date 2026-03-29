Come installare e configurare HshGate sul tuo server o sulla tua pagina web:

# HashGate.js
Per configurare hashgate.js nel tuo file html basterà piazzare il widget dove meglio preferisci, quindi, incolla questa stringa:
<div class="widget-area">
            <div id="hashgate-container" data-mode="redirect" data-sitekey="la tua api key qui" data-theme="light/dark"></div>
        </div>

**Come customizzarlo**
**Il widget ha 2 temi:**
light e dark, per modificarlo di basterà andare nel metadato 'data-theme' e scrivere dark o light in base alle tue esigenze
**Il widget ha 3 modalità:**
redirect --> per pagine di verifica che non hanno form o bottoni da cliccare, quindi una verifica automatica con un solo click
form --> per pagine di login, di acquisto o comunque con un contenitore da riempire
passive --> verifica passiva, l'utente non vedrà una pagina di caricamento ma il nostro sistema analizzerà i suoi comportamenti per definire se è un'umano o meno
**data-sitekey**
In questo metadato va messa la tua apikey, ne puoi ottenere una andando su https://hashgate.net/licenses e ottenere la tua gratuitamente con fino a 5000 richieste gratuite al mese.

Se vuoi un livello più alto di protezione, puoi utilizzare il nostro **Python SDK**.
**Come installarlo**
Scarica il file "hashgate_sdk.py" da github o da https://api.hashgate.net/cdn/python/hashgate_sdk.py, assicurati che sia nella stess directory del tuo server python.
Per ora è compatibile solo con python flask come webserver. Assicurati di importare re, flask requests e is_human da hashgate_sdk (from hashgate_sdk import is_human) prima di procedere.

**Come funziona**
Puoi proteggere un route di destinazione, per esempio, se gestisci una pagina di verifica per un bot Discord, avrai la route '/verifica' dove avviene la verifica con hashgate.js, e '/redirect' per dire che sei stato verificato e puoi continuare sul server Discord.
Noi andremo a proteggere la rotta '/redirect' con il nostro script. L'utente potrà accedervi solo se ha eseguito la verifica nella rotta '/verifica'

Quindi, **ecco come integrarlo**

Seguendo l'esempio, la route '/redirect' sarà quella da proteggere.

@app.route('/redirect')
def redirect():
hg_token = request.form.get('hg-token')
    if not is_human(hg_token):
        # blocchiamo i bot
        return "<h1>Accesso Negato</h1><p>Verifica di sicurezza HashGate fallita. Sei un bot?</p>", 403
    # tutto il resto verrà eseguito se l'utente è umano e ha superato la verifica

in questa maniera abbiamo bloccato l'accesso alla route ai non verificati.








