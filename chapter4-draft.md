# Capitolul 4. Concluzii

## 4.1. Atingerea scopului lucrării

Această lucrare și-a propus să construiască o platformă web colaborativă de prompt engineering care să rezolve fragmentarea din piața instrumentelor existente. Analiza din Capitolul 1 a arătat că piața e împărțită între platforme de evaluare a modelelor (LMSYS Chatbot Arena), instrumente de versionare privată (PromptLayer, Maxim AI) și soluții de observabilitate dependente de framework-uri specifice (LangSmith). Niciuna nu oferă o experiență unificată.

Scopul a fost atins. Stratum Live e o aplicație web full-stack funcțională, cu cinci componente integrate: management versionat al prompturilor, testare simultană pe LLM-uri multiple, colaborare în timp real cu prezență, validare prin vot distribuit și independență față de framework-uri externe. Stack-ul tehnic (Next.js 16, Convex, TypeScript, Tailwind CSS, Shadcn/UI) a fost justificat în Capitolul 2, iar implementarea a fost documentată în Capitolul 3.

Artefactul rezultat urmează principiile științei proiectării sistemelor informaționale (Hevner et al., 2004): rezolvă o problemă reală, a fost evaluat prin testare automată și manuală, iar contribuțiile sunt verificabile. Poate fi comunicat atât unui public tehnic, cât și unuia managerial.

## 4.2. Sinteza contribuțiilor proprii

Contribuțiile se grupează pe patru planuri.

**Contribuția aplicativă.** Stratum Live combină, într-o singură interfață, managementul versionat al prompturilor cu testarea multi-LLM și validarea prin vot. Aplicația include un editor colaborativ pe Monaco Editor și Yjs (CRDT), testare multi-provider cu model BYOK (OpenAI, Anthropic, Ollama, LiteLLM), un mecanism de vot care cere existența testelor înainte de a permite evaluarea, notificări în timp real și permisiuni pe trei niveluri. Modulele sunt funcționale și au fost validate prin teste end-to-end cu Playwright.

**Contribuția arhitecturală.** Proiectul a dovedit că arhitecturile hibride (SSG, SSR, CSR la nivel de componentă) sunt viabile pe Next.js 16 și React 19 pentru aplicații colaborative. Externalizarea backend-ului pe Convex a eliminat nevoia de endpoint-uri REST, servere WebSocket și logică de sincronizare. Problemele întâlnite și rezolvate (params Promise în Next.js 16, setTimeout în Convex, integrarea Better-Auth) sunt lecții refolosibile.

**Contribuția analitică.** Lucrarea conține o analiză comparativă a patru platforme de prompt engineering și o comparație a stivei frontend (Angular, Vue, React) și a meta-framework-urilor (Remix, TanStack Start, Next.js). Această analiză poate ghida decizii tehnice și în afara contextului proiectului.

**Contribuția didactică.** Secțiunea 3.7 enumeră concret competențele care depășesc programa de licență: meta-framework-uri full-stack, backend-as-a-service, tipizare end-to-end, testare automată și colaborare în timp real cu CRDT.

## 4.3. Limitări și direcții viitoare

Platforma e funcțională, dar are limite care deschid direcții de continuare.

**Securitatea cheilor API.** Cheile sunt momentan codificate base64. Pentru producție, e nevoie de criptare AES-256 cu o cheie externă.

**Acoperirea testelor.** Suita E2E are 8 scenarii pe fluxul principal. Lipsesc testele de eroare, cazurile limită și testarea cross-browser. Ar fi utilă și o suită de teste de integrare pentru modulele Convex și teste de performanță la sincronizare sub încărcare.

**Apeluri reale către LLM-uri.** Testarea multi-provider a folosit un server mock. Mutațiile Convex sunt scrise pentru apeluri reale (prin *actions*), dar testarea cu chei valide și modele reale ar valida întregul pipeline.

**Colaborare avansată.** Editorul oferă editare simultană și prezență. Se pot adăuga: diff vizual între versiuni, sugestii automate de prompt bazate pe istoric, export Git și un marketplace public de prompturi.

**Analiza datelor.** Platforma colectează versiuni, voturi, rezultate și latențe. Analiza statistică a acestor date poate scoate la iveală corelații între structura prompturilor și performanță.

**Fluxuri enterprise.** Extinderea către organizații mari ar necesita SSO, spații de lucru ierarhice, analytics la nivel de organizație și politici de retenție conforme cu GDPR.

**Integrare cu tooling de dezvoltare.** Conectarea Stratum Live cu IDE-uri (VS Code) și pipeline-uri CI/CD ar permite testarea automată a prompturilor la fiecare commit, similar cu testele unitare.

## 4.4. Impact

Impactul poate fi privit pe trei axe.

Economic, platforma aduce beneficii măsurabile pentru trei categorii: companii software (ex. UiPath) pot reduce costurile cu token-ii API cu 20-30% și timpul de iterație de la 30 la 10 minute; universități (UAIC, UPB) capătă un instrument didactic și de cercetare; freelancerii pot economisi 250-500 USD pe săptămână.

Tehnologic, proiectul arată că arhitecturile hibride Next.js + platforme reactive sunt o alternativă serioasă la stack-urile tradiționale pentru aplicații colaborative.

Academic, lucrarea contribuie prin demonstrarea științei proiectării aplicate, prin analiza pieței de prompt engineering și prin deschiderea unei direcții de cercetare care îmbină AI, ingineria software și colaborarea în timp real.

---

## Referințe

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly*, 28(1), 75-105. https://doi.org/10.2307/25148625
