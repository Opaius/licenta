# INTRODUCERE

Inteligența artificială generativă are un potențial de adăugare anuală de 2,6 până la 4,4 trilioane de dolari la economia globală (McKinsey Global Institute, 2023), sumă comparabilă cu PIB-ul Marii Britanii din 2021. În acest context, un singur element face diferența dintre valoare reală și risipă de resurse: promptul.

Promptul reprezintă o instrucțiune formulată în limbaj natural, nu cod rigid, ci un dialog cu o rețea neuronală. Problema fundamentală constă în faptul că, în perioada 2025-2026, ingineria prompturilor rămâne o activitate preponderent individuală și empirică. Un inginer testează zeci de variante manual, compară rezultatele în mod subiectiv, iar cunoștințele acumulate se pierd în chat-uri Slack, documente Google sau notițe personale. Platformele care să transforme această practică artizanală într-un proces colaborativ, măsurabil și scalabil la nivel de comunitate lipsesc aproape complet.

Prezenta lucrare de licență propune o soluție concretă la această problemă prin dezvoltarea unei platforme web colaborative de prompt engineering. Platforma permite utilizatorilor să realizeze o serie de operațiuni esențiale, incluzând testarea prompturilor pe mai multe LLM-uri simultan (OpenAI, Anthropic, Google, modele open-source), votarea prompturilor într-un sistem de tip arenă inspirat de LMSYS Chatbot Arena, teste batch automate pe seturi de prompturi cu metrici obiective (coerență, factualitate, cost în tokeni, latență), colaborare în timp real cu sincronizare a modificărilor și istoric complet al versiunilor, precum și biblioteci partajate de prompturi cu etichetare semantică și recomandări bazate pe performanță.

Platforma transformă prompt engineering-ul dintr-o activitate solitară și subiectivă într-un proces comunitar, în care varianta optimă de prompt nu mai depinde exclusiv de intuiția unui singur om, ci de validarea colectivă prin voturi și date concrete. Aplicația a fost construită utilizând Next.js 15 (App Router, React Server Components, streaming), TypeScript cu tipizare strictă, Tailwind CSS și Shadcn/UI pentru interfață și, în mod central, baza de date reactivă Convex, care asigură sincronizarea în timp real fără gestionarea manuală a conexiunilor WebSocket. Prioritățile arhitecturale principale au inclus încărcarea rapidă a paginilor, indexarea SEO a prompturilor publice și scalabilitatea cu costuri reduse în faza inițială de dezvoltare.

Din perspectivă economică, o îmbunătățire de 10-20% a calității prompturilor se traduce direct în reduceri semnificative ale costurilor cu tokenii și în diminuarea numărului de iterații manuale necesare. Echipele care adoptă procese structurate de prompt engineering pot înregistra creșteri de productivitate cuprinse între 20% și 50%, deși cifrele concrete variază în funcție de domeniul de aplicare și de contextul organizațional specific. Startup-urile mici și freelancerii capătă astfel acces la instrumente care până recent erau rezervate exclusiv marilor corporații din domeniu.

---

# Capitolul 1. Contextul tehnologic și economic al aplicațiilor web moderne

Tehnologia a schimbat fundamental mediul digital și economic în ultimele trei decenii, iar World Wide Web-ul a evoluat de la pagini statice la sisteme colaborative extrem de complexe. Viteza aplicațiilor a devenit un predictor direct al generării de venituri, nu doar o caracteristică tehnică izolată. Capitolul de față examinează implicațiile inteligenței artificiale generative asupra arhitecturilor software moderne și asupra productivității la nivel global.

## Evoluția World Wide Web

World Wide Web-ul a traversat patru epoci distincte în ultimele trei decenii, fiecare dintre acestea redefinind ceea ce poate realiza un utilizator și ce capacități de procesare poate oferi o aplicație web modernă.

**WEB 1.0 (aprox. 1990-2004).** Prima fază a web-ului s-a bazat pe un model de comunicare unidirecțională, în care site-urile funcționau preponderent ca broșuri digitale destinate afișării de informații. Principala valoare economică a acestei etape a constat în reducerea semnificativă a costurilor de distribuție a informațiilor și în amplificarea vizibilității mărcilor la nivel global, fără costuri logistice suplimentare. Companiile dominante ale perioadei, Yahoo fiind exemplul cel mai reprezentativ, au atins capitalizări de piață de peste 128 de miliarde de dolari, consacrând internetul ca mediu global de furnizare a informațiilor. Cu toate acestea, utilizatorul rămânea limitat la consumul pasiv de conținut, fără posibilitatea reală de a crea materiale proprii sau de a interacționa bidirecțional cu platformele disponibile.

**WEB 2.0 (aprox. 2004-2010).** Trecerea la web-ul social a transformat fundamental rolul utilizatorului, mutându-l din poziția de spectator pasiv în cea de creator activ de conținut și participant direct la ecosistemul informațional. Comunitățile online au cunoscut o creștere exponențială atât ca număr de membri, cât și ca influență asupra dinamicii sociale și economice globale. Modelul de afaceri s-a mutat de la vânzarea directă de produse către comercializarea de date, trafic și informații detaliate despre comportamentul și preferințele consumatorilor. Efectul de rețea a devenit principalul motor de generare a valorii economice, propulsând companii precum Facebook la o capitalizare de piață de peste 1 trilion de dolari, similar cu performanța înregistrată de Alphabet în aceeași perioadă.

**WEB 3.0 (aprox. 2010-2020).** Explozia rețelelor sociale a generat volume fără precedent de date și a accelerat tranziția către un web semantic, în care aplicațiile au început să interpreteze contextul utilizatorilor și să ia decizii autonome pe baza acestor interpretări. Din perspectivă economică, modelul SaaS (Software as a Service) s-a consolidat semnificativ și a devenit cel mai mare segment al pieței globale de servicii cloud publice (Gartner, Inc., 2019). Organizațiile au externalizat masiv infrastructura către cloud, iar sistemele de recomandare bazate pe tehnologii Big Data au devenit instrumentul principal de fidelizare a clienților și de maximizare a veniturilor.

**WEB 4.0 (aprox. 2020-prezent).** Inteligența artificială generativă a depășit statutul de simplu strat funcțional adăugat platformelor existente și a început să influențeze direct arhitectura fundamentală a acestora, redefinind modul în care sunt concepute și construite aplicațiile. McKinsey Global Institute (2023) estimează un impact economic al GenAI de 4,4 trilioane de dolari pe an până în 2026, cifră care depășește produsul intern brut al majorității țărilor lumii. Relația dintre utilizator și mașinărie devine tot mai colaborativă, iar granița dintre interfață și operator se subțiază pe măsură ce instrumentele AI adoptă un rol activ în procesele de lucru. Noul ecosistem impune cerințe arhitecturale specifice, incluzând performanță instantanee la încărcare, indexabilitate optimă și interactivitate simultană.

## De la MPA la SPA și modelul hibrid

Primele aplicații web erau multi-page (MPA), iar la fiecare clic întreaga pagină se reîncărca complet. Deși această abordare era excelentă pentru indexarea de către motoarele de căutare, experiența utilizatorului era fragmentată, iar timpii de reîncărcare întrerupeau constant fluxul de navigare.

Aplicațiile single-page (SPA) au rezolvat această problemă prin încărcarea scheletului o singură dată, interacțiunile ulterioare actualizând dinamic doar fragmentele de ecran necesare. Experiența devine fluidă, apropiată de o aplicație nativă. Totuși, SPA-urile prezintă o problemă semnificativă cu motoarele de căutare: serverul livrează o pagină aproape goală la prima accesare, iar conținutul generat dinamic de JavaScript nu este indexat corect, ceea ce duce la un trafic organic redus sau chiar inexistent.

Google a recunoscut această realitate și a introdus Core Web Vitals în 2021 ca factor oficial de clasare în algoritmii de căutare (Google Search Central, 2021). Indicatorii principali sunt LCP (cât de repede devine vizibil conținutul principal), CLS (stabilitatea vizuală pe parcursul încărcării) și INP (latența la interacțiunile utilizatorului, introdus oficial în martie 2024).

Există studii de caz devenite canonice în industrie, deși sursele originale sunt rapoarte interne corporative și nu articole academice: Amazon a raportat că 100ms de latență suplimentară cauzează o scădere de 1% a vânzărilor, Google a constatat că pe dispozitivele mobile creșterea timpului de încărcare de la o secundă la trei secunde triplează rata de abandon, iar Walmart a măsurat o creștere de 2% a ratei de conversie pentru fiecare secundă câștigată la încărcare.

Pentru un business online, fiecare secundă de încărcare suplimentară se traduce direct în pierderi de venituri și în pierderea încrederii clienților. SPA-ul pur se dovedește insuficient pentru aplicațiile moderne, iar răspunsul industriei a venit prin arhitecturi hibride care combină randarea pe server cu interactivitatea pe client. Framework-uri precum Next.js, tehnologia selectată pentru această lucrare și detaliată în Capitolul 2, se bazează pe această paradigmă.

Convergența dintre frontend și backend a schimbat și profilul profesional al dezvoltatorului modern. Node.js și framework-urile hibride au făcut posibilă abordarea full stack, în care un singur dezvoltator poate gestiona o funcționalitate de la interogarea bazei de date până la interfața cu utilizatorul. Validările logice nu se mai scriu de două ori, codul este unificat, iar fricțiunile de comunicare între straturi scad semnificativ. Aplicația din această lucrare a fost construită pe această paradigmă.

## Inteligența artificială generativă și economia prompturilor

Adoptarea pe scară largă a modelelor de limbaj mari (LLM) a deschis o nouă etapă a productivității digitale, iar GenAI a creat un nou strat de abstractizare în arhitecturile software moderne. McKinsey (2023) estimează un impact anual de 2,6-4,4 trilioane de dolari, acoperind industrii diverse, de la dezvoltare software la relații cu clienții.

Cu toate acestea, capabilitățile teoretice ale unui LLM nu se transformă automat în valoare economică, deoarece interfața dintre intenția umană și rețeaua neuronală rămâne limbajul natural. Modul în care sunt formulate instrucțiunile, cunoscut sub denumirea de prompt engineering, a devenit principalul punct de blocaj în adoptarea eficientă a inteligenței artificiale la scară largă.

Calitatea promptului dictează direct rentabilitatea investiției în tehnologiile AI. Un prompt bine structurat minimizează halucinațiile modelului, reduce consumul de tokeni și, implicit, costurile operaționale, eliminând totodată necesitatea intervenției umane repetate. În contrast, un prompt ambiguu sau slab optimizat produce rezultate generice, erori logice și cicluri inutile de procesare. Claritatea instrucțiunii a devenit astfel resursa fundamentală a acestei economii emergente.

Natura preponderent individuală și neorganizată a prompt engineering-ului constituie problema centrală a acestui domeniu. În majoritatea echipelor de dezvoltare, crearea prompturilor se bazează pe o metodă de trial-and-error izolat, iar variantele sunt salvate în documente personale sau fragmente de cod hardcodate. Nu există o vizibilitate clară asupra istoricului modificărilor și nici metrici obiective care să ateste că o versiune este superioară alteia. Mai mult, lipsește validarea încrucișată a rezultatelor obținute pe LLM-uri diferite. Această fragmentare forțează dezvoltatorii să rezolve individual probleme care au fost deja soluționate de alți membri ai comunității.

Depășirea blocajului necesită o schimbare de paradigmă: de la efortul solitar la inteligența colectivă, similar cu modul în care GitHub a revoluționat scrierea codului sursă prin transformarea programării dintr-o activitate izolată într-un proces colaborativ bazat pe versionare și peer-review.

Colaborarea prin crowdsourcing în domeniul inteligenței artificiale a fost deja validată cu succes de LMSYS Chatbot Arena, o platformă de cercetare care utilizează blind voting pentru a clasifica și evalua performanța LLM-urilor (Chiang et al., 2024; Zheng et al., 2023). Aceasta a demonstrat că evaluarea calitativă a output-ului generat de AI nu poate fi lăsată exclusiv în seama benchmark-urilor sintetice, fiind necesar un consens uman distribuit pentru o evaluare obiectivă și relevantă.

Aplicând această logică, platforma dezvoltată în cadrul acestei lucrări transformă prompt engineering-ul dintr-un experiment izolat într-un proces ingineresc colaborativ, integrând un sistem de versionare a prompturilor și un mecanism de votare crowdsourced.

## Analiza platformelor existente

Piața actuală dispune de instrumente de prompt engineering, însă acestea sunt fragmentate și niciuna nu oferă o soluție complet integrată pentru fluxul de lucru al unui inginer de prompturi.

**LMSYS Chatbot Arena.** Inițiativă academică de la UC Berkeley care folosește blind voting pentru evaluarea modelelor AI (Chiang et al., 2024; Zheng et al., 2023). Platforma servește ca instrument de clasificare a modelelor, nu ca mediu de lucru cu prompturi, și nu oferă funcționalități de salvare, versionare sau optimizare iterativă. Utilitatea sa este semnificativă pentru cercetarea academică, însă rămâne limitată pentru dezvoltarea practică și iterativă de prompturi.

**PromptLayer.** Un registru de prompturi care funcționează ca middleware pentru aplicațiile AI, excelând la capitolul versionare și tracking de metrici de performanță (Lomas, 2025; PromptLayer, 2025). Totuși, platforma este concepută pentru echipe închise, fără componentă comunitară, iar utilizatorii independenți nu pot descoperi sau valida public prompturile create de alți dezvoltatori.

**LangSmith.** Platforma de observabilitate dezvoltată de echipa LangChain, care include un Prompt Hub pentru stocarea și gestionarea instrucțiunilor (LangChain, Inc, 2025). Principalul dezavantaj constă în cuplarea strânsă de ecosistemul LangChain, ceea ce impune o curbă de învățare suplimentară și limitează libertatea dezvoltatorilor care doresc o soluție tehnologic agnostică. Platforma nu oferă un sistem de votare crowdsourced.

**Maxim AI.** Platformă enterprise end-to-end pentru gestionarea ciclului de viață al aplicațiilor AI, care oferă testare automatizată și evaluare de calitate pe seturi de date proprii (Maxim AI, 2025). Fiind strict orientată business-to-business, platforma rămâne inaccesibilă pentru comunitatea largă de dezvoltatori și pune accent pe testarea privată, neglijând conceptul de colaborare deschisă.

**Lacuna identificată.** Există platforme specializate pentru votarea descentralizată a modelelor (LMSYS) și instrumente eficiente pentru versionarea privată a prompturilor (PromptLayer, Maxim AI), însă nu există o soluție unificată care să îmbine aceste două concepte fundamentale. Nicio platformă nu tratează promptul simultan ca pe o componentă software supusă versionării stricte și ca pe un bun comun validat prin vot public. Mai mult, lipsește posibilitatea de a colabora direct pe același prompt și de a testa eficiența acestuia pe mai multe LLM-uri într-o singură interfață unificată.

Aplicația dezvoltată în această lucrare umple golul respectiv, oferind cinci funcționalități esențiale: managementul și versionarea prompturilor, testarea și execuția multi-LLM, colaborarea comunitară deschisă, un sistem de votare hibrid și independența totală față de framework-uri externe.

---

# Capitolul 2. Stiva tehnologică

Capitolul anterior a evidențiat fragmentarea existentă în piața de prompt engineering și impactul direct al performanței asupra veniturilor comerciale. Capitolul de față analizează deciziile tehnice care stau la baza transformării acestei viziuni arhitecturale într-o implementare funcțională.

O platformă colaborativă de prompt engineering impune un set de cerințe arhitecturale bine definite: randare hibridă pentru performanță la încărcare și indexare SEO, sincronizare în timp real fără latență perceptibilă, interfață accesibilă și consistentă vizual, precum și autentificare securizată conform principiilor moderne de protecție a datelor.

## JavaScript modern și alegerea framework-ului

Brendan Eich a creat JavaScript în 1995, în doar zece zile, cu scopul inițial de a aduce interactivități elementare paginilor web (Severance, 2012). În prezent, conform sondajului Stack Overflow Developer Survey 2025, 66% dintre dezvoltatori îl folosesc la nivel mondial, păstrându-și statutul de cel mai popular limbaj de programare din 2011.

Lansarea Node.js în 2009 a constituit un moment de cotitură, eliminând bariera tradițională dintre client și server și permițând rularea aceluiași limbaj de programare în ambele medii. Node.js a atins o cotă de utilizare de 48,7% (Stack Overflow; Statista, 2025), iar consecința directă a fost consolidarea abordării full-stack.

Pe măsură ce aplicațiile au devenit mai complexe, industria a adoptat componentizarea, o abordare care presupune împărțirea interfeței în unități logice independente și reutilizabile.

În 2026, piața frontend este dominată de trei soluții majore: Angular (18,2% conform Stack Overflow 2025) oferă un framework complet și rigid, Vue (17,6%) reprezintă o alternativă progresivă creată de Evan You în 2014, iar React (44,7% conform Stack Overflow 2025, respectiv 69,9% conform State of Frontend 2024, The Software House) domină detașat piața ca bibliotecă pentru stratul de vizualizare.

După alegerea React, limitările SPA-urilor au impus trecerea la meta-framework-uri full-stack. Remix (Shopify) adoptă server-first dar nu oferă SSG nativ, TanStack Start este încă în fază de stabilizare fără suport pentru React Server Components, iar Next.js (Vercel) a devenit standardul industriei cu o adopție de 52,9% (The Software House, 2024) și suport complet pentru toate modelele de randare.

## Arhitecturi de randare

React folosește implicit CSR. Serverul trimite un HTML aproape gol și un fișier JavaScript mare, iar browserul trebuie să descarce și să execute codul înainte de afișare, ceea ce penalizează SEO-ul și FCP-ul. SSR rezolvă această problemă prin generarea HTML-ului complet pe server la fiecare cerere, iar SSG construiește paginile o singură dată la compilare.

Modelul hibrid, maturizat de Next.js prin React Server Components, permite alegerea strategiei de randare la nivel de componentă. Platforma din această lucrare folosește SSG pentru pagina de prezentare, SSR cu streaming pentru testarea modelelor AI și CSR pentru componenta de votare.

## Colaborare în timp real și Convex

Modelul clasic cerere-răspuns al web-ului este inadecvat pentru interfețe colaborative. Short polling-ul simulează interacțiunea live dar consumă resurse inutil, iar WebSocket-ul rezolvă latența dar introduce complexitate de infrastructură.

Arhitectura reactivă inversează rolurile: baza de date împinge modificările către clienți. Convex implementează acest model, combinând stocarea, logica de server și sincronizarea în timp real într-un singur sistem. Funcțiile backend sunt scrise în TypeScript și validate cu scheme Zod, asigurând type-safety end-to-end.

## Interfață, accesibilitate, securitate

Tailwind CSS (utility-first) produce un bundle CSS minimal, iar Shadcn/UI oferă componente headless cu accesibilitate WCAG 2.1 nativă. Autentificarea este gestionată de BetterAuth cu type-safety end-to-end, sesiuni prin cookie-uri HttpOnly și Secure după principiul Zero Trust. Token-urile nu sunt stocate în localStorage, iar autentificarea prin Google și GitHub elimină necesitatea parolelor stocate pe server.
