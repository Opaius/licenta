# Audit: Referințe și Humanizer — 1_2.md

## A. Verificarea companiilor și tool-urilor comparate

| Referință | Real? | Verdict |
|-----------|-------|---------|
| LMSYS Chatbot Arena (Chiang 2024, Zheng 2023) | Proiect academic UC Berkeley, publicat ICML 2024 și NeurIPS 2023 | ✅ Bun exemplu |
| PromptLayer (Lomas 2025) | Companie reală, promptlayer.com | ✅ Bun exemplu |
| LangSmith / LangChain (LangChain Inc 2025) | Produs real, langchain.com | ✅ Bun exemplu |
| Maxim AI (Maxim AI 2025) | Companie reală, maxim.ai | ✅ Bun exemplu |
| Yahoo 128B (Hall 2000) | Citează o sursă din 2000. Nu e academica, ci probabil un articol economic | ⚠️ Acceptabil pt context istoric, dar sursa exactă e neclară |
| Feiner 2021, Novet 2020 | CNBC, articole de presă | ⚠️ Nu sunt academice, dar OK pentru date de piață |
| Gartner 2019 | Raport industrie | ⚠️ Acceptabil pt date de piață |
| Stack Overflow 2025 | Sondaj anual | ⚠️ Acceptabil pt statistici |
| The Software House 2024 | Sondaj „State of Frontend" | ⚠️ Acceptabil |
| Amazon/Walmart/Google stats (L.275-284) | Fără citare explicită, doar `[5]`, `[6]`, `[7]` | ❌ NEEDS_CITATION |
| Severance 2012 (istoric JavaScript) | Nu am găsit un paper Severance din 2012. Eich 2005 (ICFP) e sursa corectă | ❌ Probabil greșit sau incomplet |
| Lilypad (L.106) | Menționat ca exemplu de „tool enterprise" | ⚠️ Există mai multe companii Lilypad, neclar care e referința |

**Gap analysis corectă?** Da. LMSYS nu oferă versionare, PromptLayer e închis, LangSmith e dependent de LangChain, Maxim e B2B exclusiv. Lipsa unei soluții unificate e reală. ✅

## B. Citări lipsă sau insuficiente

1. **Productivitatea 20-50%** (L.100-103) — „Studii și rapoarte recente indică" e vag. Fără citare concretă. ➜ `[NEEDS_CITATION]`
2. **Amazon 100ms → -1% vânzări** (L.275-276) — statistică des citată dar fără sursă verificată. ➜ `[NEEDS_CITATION]`
3. **Google 1s→3s → +32% abandon** (L.278-279) — aceeași problemă. ➜ `[NEEDS_CITATION]`
4. **Walmart +2% conversie/secundă** (L.282-284) — aceeași problemă. ➜ `[NEEDS_CITATION]`
5. **WCAG 2.1 compliance** (L.776-779) — se afirmă dar nu se citează standardul. ➜ citează ISO/IEC 40500 sau W3C
6. **Zero Trust, HttpOnly, Secure** (L.798-801) — termeni de securitate fără citare. ➜ `[NEEDS_CITATION]`

## C. Probleme Humanizer (1_2.md)

| Pattern | Severitate | Exemple |
|---------|-----------|---------|
| Em dash (---) peste 30x | 🔴 Critic | Aproape fiecare paragraf. L.32-37, L.170, L.210-216, L.300-301, L.557-565 etc. |
| Atribuiri vagi | 🟠 Mediu | „Studii și rapoarte recente", „liderii industriei", „industria a răspuns" |
| Limbaj promoțional | 🟠 Mediu | „dezlănțuie creativitatea", „ecosistem inteligent", „înțelepciunea colectivă" |
| Regula de trei | 🟡 Ușor | „performanță instantanee, indexabilitate și interactivitate", „randare hibridă... sincronizare... interfață accesibilă" |
| Anunțuri de conținut | 🟡 Ușor | L.112-122, L.493-508 — „Capitolul va oferi...", „Prezentul capitol se concentrează..." |
| Cuvinte „AI vocabulary" | 🟡 Ușor | „crucial", „landscape", „evolving", „key" (în engleză în text românesc) |
| Copula avoidance | 🟡 Ușor | „servește ca", „funcționează ca" în loc de „este" |

---

# Audit: Project alignment — chapter3-draft.md

## A. Corespondență cu SPEC.md

| SPEC.md Feature | Acoperit în Ch3? | Notă |
|-----------------|------------------|------|
| 2.1 Prompt Editor | ✅ 3.4.2 | Editor colaborativ + versionare |
| 2.2 Real-time Presence | ❌ Lipsește | Nu se menționează cursor sharing, typing indicators |
| 2.3 Version Control | ✅ 3.4.2 | Branch, restore, istoric |
| 2.4 Comments | ✅ 3.4.5 | Niveluri: comentarii + chat |
| 2.5 Voting | ✅ 3.4.4 | Upvote/downvote |
| 2.6 Parallel Testing | ✅ 3.4.3 | Multi-provider |
| 2.7 Templates | ⚠️ Parțial | Menționat în 3.4.3 (template variables) dar nu ca secțiune separată |
| 2.8 Results Comparison | ✅ 3.4.3 | Latency, response |
| 2.9 BYOK | ✅ 3.4.3 | Chei API per furnizor |
| 2.10 Permissions | ✅ 3.4.1 | Owner/editor/viewer |
| 2.11 Notifications | ✅ 3.4.5 | 4 tipuri |
| 2.12 Import/Export | ❌ Lipsește | JSON, Markdown export neacoperit |

**Missing din chapter3:** Real-time presence (cursor), Import/Export. Adaugă-le.

## B. Referințe problematice

| Referință | Problemă |
|-----------|----------|
| `[APA:Convex2025]` | Convex e produs comercial, nu paper academic. ➜ `[NEEDS_CITATION]` |
| `[APA:OWASP2025]` | OWASP e organizație, nu paper. ➜ înlocuiește cu paper XSS real găsit |
| `[APA:Lomas2025]` | E URL docs.promptlayer.com, nu paper. Acceptabil ca referință tehnică, dar marchează |
| `[APA:Talakola2024]` | Paper real, dar jurnal obscur. Acceptabil. |

## C. Probleme Humanizer (chapter3-draft.md)

| Pattern | Count | Exemple |
|---------|-------|---------|
| Em dash (---) | ~15x | L.7 (2x), L.30, L.37, L.43, L.73, L.81, L.87, L.111, L.131, L.176, L.192 |
| "-ing" în RO | ~8x | „permițând" (L.73, L.83), „eliminând" (L.19), „asigurând" |
| Regula de trei | ~4x | L.29-31 (3 randări), L.131-133 (3 teste), L.184-186 (3 beneficii) |
| Filler | ~3x | „Impactul practic este semnificativ" (L.39), „Dezvoltarea aplicației nu a fost liniară" (L.99) |
| Limbaj promoțional | ~3x | „demonstrează că" (L.190), „semnificativ" excesiv |
| Signposting | ~2x | „Prezentul capitol descrie" (L.9), „Această secțiune documentează" (L.99) |

---

# Concluzii

1. **1_2.md** are nevoie de: secțiune Referințe, eliminat em dash-uri excesive, înlocuit `[5]` `[6]` `[7]` cu citări reale, adăugat citări pentru claimurile de productivitate și securitate.
2. **chapter3-draft.md** are nevoie de: adăugat Real-time Presence și Import/Export, înlocuit referințele false (Convex, OWASP) cu `[NEEDS_CITATION]`, redus em dash-urile, ton mai sobru.
3. Toate tool-urile comparate în 1_2 sunt reale și bine alese. Gap analysis e corectă.
