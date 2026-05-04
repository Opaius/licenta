# INTRODUCERE

Într-o lume în care inteligența artificială generativă a devenit un motor economic real, cu un potențial de adăugare anuală de 2,6 până la 4,4 trilioane de dolari la economia globală conform raportului McKinsey Global Institute din 2023 (valoare comparabilă cu PIB-ul Marii Britanii din 2021), un singur element decide dacă un model de limbaj mare (LLM) produce valoare autentică sau doar risipă de resurse: promptul.

Promptul reprezintă noua formă de programare a erei inteligenței artificiale. Nu se mai programează mașinile prin cod rigid, ci prin limbaj natural care le ghidează să producă rezultate la scară largă. Totuși, în anul 2025-2026, ingineria prompturilor rămâne o activitate individuală, empirică și ineficientă. Un inginer testează zeci de variante manual, compară rezultatele subiectiv, iar cunoștințele acumulate se risipesc în chat-uri Slack, documente Google sau notițe personale. Platformele care să transforme această practică artizanală într-un proces colaborativ, măsurabil și scalabil la nivel de comunitate lipsesc aproape complet.

Prezenta lucrare de licență propune o soluție concretă la această problemă: dezvoltarea unei platforme web colaborative de prompt engineering. Platforma permite utilizatorilor, de la dezvoltatori independenți la echipe enterprise, să realizeze următoarele operațiuni:
- testarea prompturilor în timp real pe multiple modele de limbaj mari (OpenAI, Anthropic, Google, modele open-source);
- votarea prompturilor și a variantelor acestora într-un sistem de tip „arenă" comunitar, inspirat de LMSYS Chatbot Arena, dar orientat exclusiv spre calitatea prompturilor;
- rularea de teste batch automate pe seturi de prompturi, seturi de date și parametri de generare (temperature, top-p, presence penalty), însoțite de metrici obiective de evaluare (coerență, factualitate, creativitate, cost în tokeni, latență);
- colaborarea în timp real: mai mulți utilizatori pot edita, comenta și rafina simultan același prompt, beneficiind de sincronizare instantanee a modificărilor și istoric complet al versiunilor;
- partajarea bibliotecilor publice sau private de prompturi optimizate, echipate cu etichetare semantică, căutare avansată și recomandări bazate pe performanța istorică.

Aplicația transformă ingineria prompturilor dintr-o activitate solitară și subiectivă într-un proces comunitar, în care varianta optimă de prompt nu mai depinde exclusiv de intuiția individuală, ci de validarea colectivă prin voturi și date.

Realizarea platformei a demonstrat practic cum arhitecturile web moderne (hibride SSR/SSG combinate cu componente reactive) pot accelera inovația în domeniul inteligenței artificiale. A fost utilizat stack-ul Next.js 15 (App Router, React Server Components, Streaming), TypeScript cu tipizare strictă, Tailwind CSS și Shadcn/UI pentru interfață și, central, baza de date reactivă Convex care asigură sincronizarea în timp real fără gestionarea manuală a conexiunilor WebSocket. Performanța rapidă de încărcare, indexarea SEO pentru prompturile publice și scalabilitatea cu costuri minime la început au reprezentat priorități arhitecturale de la concepție.

O îmbunătățire de 10-20% a calității prompturilor se traduce direct în reduceri ale costurilor cu tokenii, diminuarea iterațiilor manuale și rezultate de calitate superioară. Echipele care adoptă procese structurate de prompt engineering pot înregistra creșteri de productivitate cuprinse între 20% și 50% [NEEDS_CITATION]. Aplicația oferă startup-urilor mici și profesioniștilor independenți acces la instrumente care până recent erau rezervate marilor corporații (Maxim AI, PromptLayer).

---

# Capitolul 1. Analiza contextului tehnologic și economic al aplicațiilor web moderne

Analizăm World Wide Web-ul și evoluția sa de la pagini web statice la sistemele colaborative actuale, plus relația dintre performanța aplicațiilor și profitabilitatea afacerilor. Viteza aplicațiilor nu este doar o caracteristică tehnică: a devenit un predictor semnificativ al generării de venituri. Capitolul se încheie cu implicațiile inteligenței artificiale generative pentru noile arhitecturi software și creșterea productivității globale.

## Dinamica evolutivă a World Wide Web

Evoluția sistemelor informatice bazate pe web din ultimele trei decenii urmează o traiectorie de complexitate crescătoare. Tranziția poate fi împărțită în patru epoci.

**WEB 1.0 | Web static (aprox. 1990-2004).** Prima fază s-a bazat pe un model simplu de comunicare unidirecțională. Site-urile afișau informații despre companii, funcționând ca broșuri digitale. Principala valoare adăugată a fost reducerea costurilor de distribuție a informațiilor și amplificarea vizibilității mărcii la scară globală. Companiile care dominau acea epocă, Yahoo! fiind cel mai evident caz, au atins valori record de piață (peste 128 de miliarde de dolari americani) [NEEDS_CITATION]. Puterea utilizatorului era limitată la consumul pasiv de informații.

**WEB 2.0 | Web-ul social (aprox. 2004-2010).** Trecerea la web-ul centrat pe oameni a făcut comunicarea bidirecțională, iar utilizatorul s-a transformat din spectator în creator de conținut. Modelul de afaceri s-a schimbat: nu mai era vorba de vânzarea de produse, ci de vânzarea de date, trafic și informații despre clienți. Principalul creator de valoare a fost efectul de rețea, care a adus companii precum Facebook la o capitalizare de peste 1 trilion de dolari [NEEDS_CITATION], la fel ca Alphabet [NEEDS_CITATION].

**WEB 3.0 | Web-ul semantic (aprox. 2010-2020).** Explozia rețelelor sociale a generat cantități uriașe de date și a accelerat tranziția către un web semantic. Aplicațiile au început să interpreteze contextul utilizatorilor și să ia decizii în numele acestora. WEB 3.0 a consolidat modelul de afaceri SaaS (Software as a Service), segmentul SaaS devenind cel mai mare segment al pieței de servicii cloud publice [NEEDS_CITATION].

**WEB 4.0 | Web-ul inteligent (aprox. 2020-prezent).** Inteligența artificială generativă a încetat să mai fie un strat funcțional adăugat platformelor existente și a început să le dicteze arhitectura. McKinsey Global Institute [APA:McKinsey2023] estimează un impact economic al GenAI de 4,4 trilioane de dolari pe an până în 2026. Acest ecosistem impune cerințe arhitecturale noi: performanță instantanee, indexabilitate și interactivitate simultană.

## Arhitecturi software moderne: de la MPA la SPA și modelul hibrid

Aplicațiile multi-page (MPA) au fost prima inovație web. În acest model, cu fiecare clic întreaga pagină se reîncărca. Deși potrivite pentru site-uri de conținut static, experiența utilizatorului era fragmentată, iar timpii de reîncărcare întrerupeau fluxul de navigare.

Aplicațiile single-page (SPA) au răspuns acestor nevoi: scheletul aplicației se încarcă o singură dată, iar interacțiunile ulterioare actualizează dinamic doar fragmentele de ecran necesare. Acestea oferă timpi de răspuns reduși și experiențe de utilizator integrate. SPA-urile aveau însă o problemă fundamentală cu motoarele de căutare: serverul livra o pagină aproape goală la prima accesare, iar conținutul generat dinamic de JavaScript nu era indexat corect.

Google a formalizat această realitate prin Core Web Vitals, un set de metrici standardizate introduse ca factor oficial de clasare în 2021 [NEEDS_CITATION]. Cei trei indicatori sunt: LCP (Largest Contentful Paint), care măsoară momentul în care conținutul principal devine vizibil; CLS (Cumulative Layout Shift), care cuantifică stabilitatea vizuală; INP (Interaction to Next Paint), introdus în 2024, care măsoară latența la interacțiuni.

Studiile privind comportamentul consumatorilor arată că toleranța față de timpii de așteptare a scăzut, iar performanța web a devenit un indicator direct al veniturilor:
- Amazon: fiecare întârziere de 100ms cauzează o scădere de aproximativ 1% din vânzări [NEEDS_CITATION].
- Google: pe dispozitivele mobile, trecerea timpului de încărcare de la 1s la 3s crește probabilitatea de abandon cu 32% [NEEDS_CITATION].
- Walmart: creștere a ratei de conversie cu 2% pentru fiecare secundă câștigată la încărcare [NEEDS_CITATION].

Răspunsul industriei a fost adoptarea arhitecturilor hibride (SSR + SSG + CSR), care combină randarea pe server cu interactivitatea pe client. Această abordare stă la baza framework-urilor moderne precum Next.js. Node.js și framework-urile hibride au făcut posibilă abordarea full stack: un singur dezvoltator poate gestiona întregul ciclu de viață al unei funcționalități, eliminând duplicarea efortului între frontend și backend.

## Inteligența artificială generativă și economia prompturilor

Adoptarea la scară largă a modelelor de limbaj mari (LLM) a deschis o nouă etapă a productivității digitale. Interfața principală de comunicare dintre intenția umană și rețeaua neuronală este limbajul natural, iar procesul de formulare a instrucțiunilor (prompt engineering, PE) a devenit principalul blocaj în adoptarea eficientă a AI.

Calitatea unui prompt dictează rentabilitatea investiției în AI: un prompt bine structurat minimizează halucinațiile, reduce consumul de tokeni și scade nevoia de intervenții umane repetate [APA:Ekin2023]. Natura individuală și neorganizată a PE rămâne o problemă majoră: utilizatorii experimentează izolat, nu există metrici obiective și lipsește validarea pe diferite LLM-uri.

Depășirea acestui blocaj necesită trecerea de la efortul solitar la inteligență colectivă, similar cu modul în care GitHub a revoluționat scrierea codului prin versionare și peer-review. Eficiența colaborării în domeniul AI a fost demonstrată de LMSYS Chatbot Arena, o platformă care utilizează crowdsourcing și blind voting pentru a clasifica LLM-urile [APA:Chiang2024] [APA:Zheng2023]. Aplicând aceeași logică, platforma propusă transformă PE dintr-un experiment izolat într-un proces ingineresc colaborativ.

## Analiza platformelor existente

**LMSYS Chatbot Arena.** Inițiativă academică de la UC Berkeley care folosește votare oarbă pentru evaluarea modelelor AI [APA:Chiang2024] [APA:Zheng2023]. Nu oferă salvare, versionare sau optimizare iterativă a prompturilor.

**PromptLayer.** Registru de prompturi și middleware pentru aplicații AI. Oferă versionare și metrici de performanță, dar este un instrument închis, fără componentă comunitară [NEEDS_CITATION].

**LangSmith.** Platformă de observabilitate care include un Prompt Hub. Este strâns cuplată de ecosistemul LangChain, ceea ce limitează libertatea dezvoltatorilor [NEEDS_CITATION]. Nu are sistem de votare crowdsourced.

**Maxim AI.** Platformă enterprise end-to-end pentru ciclul de viață al aplicațiilor AI. Este inaccesibilă comunității largi de dezvoltatori, punând accent pe testarea privată [NEEDS_CITATION].

**Concluzia analizei:** nu există o soluție care să combine managementul versionat al prompturilor cu testarea multi-LLM, colaborarea în timp real și validarea prin vot crowdsourced. Aplicația dezvoltată în această lucrare umple acest gol, oferind cinci funcționalități: (1) management și versionare, (2) testare multi-LLM, (3) colaborare comunitară deschisă, (4) sistem de votare hibrid, (5) independență față de framework-uri externe de tip LangChain.

---

# Capitolul 2. Stiva tehnologică: analiză comparativă și justificarea alegerilor arhitecturale

Deciziile tehnice au fost luate pornind de la cerințele arhitecturale identificate în capitolul anterior: randare hibridă, sincronizare în timp real, interfață accesibilă și securizată.

## Ecosistemul JavaScript modern și alegerea framework-ului

JavaScript a fost creat în 1995 de Brendan Eich în zece zile, cu scopul de a aduce interactivități elementare paginilor web [APA:Eich2005]. Conform Stack Overflow Developer Survey 2025, 66% dintre dezvoltatori folosesc JavaScript la nivel mondial [NEEDS_CITATION]. Lansarea Node.js în 2009 a eliminat bariera dintre client și server, Node.js atingând o cotă de 48,7% în rândul framework-urilor web [NEEDS_CITATION].

Complexitatea crescândă a aplicațiilor a condus la adoptarea componentizării. În 2026, piața frontend e dominată de trei soluții: Angular (18,2%), Vue (17,6%) și React (44,7%) [NEEDS_CITATION].

Odată selectat React, s-au analizat meta-framework-urile full-stack. Remix (Shopify) adoptă o abordare server-first dar nu oferă SSG nativ. TanStack Start este în fază RC și nu suportă React Server Components. Next.js (Vercel) a devenit standardul industriei, cu suport complet pentru SSR, SSG, ISR și CSR [NEEDS_CITATION] și compatibilitate nativă cu Convex și Shadcn/UI.

## Arhitecturi de randare: de la CSR la modelul hibrid Next.js

În CSR, serverul trimite un HTML aproape gol plus un fișier JavaScript mare. Browserul trebuie să descarce, să analizeze și să execute codul înainte de a afișa interfața, ceea ce penalizează SEO și FCP. În SSR, serverul generează HTML complet la fiecare cerere, rezolvând SEO dar crescând costurile operaționale. SSG construiește paginile o dată la compilare, garantând performanță maximă, dar fiind limitat la conținut static.

Modelul hibrid, maturizat de Next.js prin React Server Components, permite alegerea strategiei de randare la nivel de componentă [APA:Thakkar2020]. Platforma folosește toate cele trei modele: SSG pentru pagina de prezentare, SSR cu streaming pentru testarea modelelor AI (răspunsul ajunge token cu token), CSR pentru componenta de votare.

## Colaborare în timp real: de la REST la arhitectura reactivă Convex

Short polling-ul și WebSocket-ul rezolvă problema sincronizării dar introduc complexitate de infrastructură. Arhitectura reactivă inversează rolurile: baza de date împinge modificările către clienți, nu clienții interoghează baza.

Convex funcționează pe un model reactiv, combinând stocarea, logica de server și sincronizarea în timp real. Dacă un utilizator votează un prompt, toți clienții conectați primesc actualizarea instantaneu, fără cod de transport scris manual [NEEDS_CITATION]. Convex folosește un model pay-per-use, eliminând costurile fixe și permițând scalarea odată cu traficul.

## Interfață, accesibilitate și securitate: Tailwind, Shadcn/UI și BetterAuth

Tailwind CSS (utility-first) produce un bundle CSS compact, cu zero clase nefolosite. Shadcn/UI oferă componente headless construite peste Radix UI, cu accesibilitate WCAG 2.1 nativă [NEEDS_CITATION]. BetterAuth [NEEDS_CITATION], o bibliotecă TypeScript, gestionează autentificarea cu type-safety end-to-end, sesiuni prin cookie-uri HttpOnly și Secure după principiul Zero Trust. Autentificarea a fost implementată cu OAuth 2.0 [APA:Hardt2012] prin Google și GitHub, eliminând necesitatea parolelor locale și a stocării acestora pe server.

---

## Referințe

Chiang, W.-L., Zheng, L., Sheng, Y., Angelopoulos, A. N., Li, T., Li, D., Zhang, H., Zhu, B., Jordan, M., Gonzalez, J. E., & Stoica, I. (2024). Chatbot Arena: An open platform for evaluating LLMs by human preference. *Proceedings of the 41st International Conference on Machine Learning*, 235, 8356-8374. https://doi.org/10.48550/arXiv.2403.04132

Eich, B. (2005). JavaScript at ten years. *Proceedings of the Tenth ACM SIGPLAN International Conference on Functional Programming*, 129-130. https://doi.org/10.1145/1086365.1086382

Ekin, S. (2023). Prompt engineering for ChatGPT: A quick guide to techniques, tips, and best practices. *TechRxiv*. https://doi.org/10.36227/techrxiv.22683919.v2

Hardt, D. (Ed.). (2012). The OAuth 2.0 authorization framework (RFC 6749). *Internet Engineering Task Force*. https://doi.org/10.17487/rfc6749

McKinsey Global Institute. (2023). *The economic potential of generative AI: The next productivity frontier*. McKinsey & Company. https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier

Thakkar, M. (2020). *Building React apps with server-side rendering*. Apress. https://doi.org/10.1007/978-1-4842-5869-9

Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z., Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E., & Stoica, I. (2023). Judging LLM-as-a-judge with MT-Bench and chatbot arena. *Advances in Neural Information Processing Systems*, 36, 46595-46623. https://doi.org/10.48550/arXiv.2306.05685
