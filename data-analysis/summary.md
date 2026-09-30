# Summary: Mengisi Slide Appendix "Survey Profile" (adaptasi dari `data-slide.png`)

**Sumber data:** `dataset.csv` (Google Form merchant survey, **n = 53** UMKM, 27–28 Sep 2026)
**Rujukan analisis:** `livin-merchant-survey-analysis.ipynb` · `docs/analysis.md` · `figures/deck_headline_stats.csv`
**Definisi "setuju":** skor 4 atau 5 pada skala Likert 1–5 (Top-2-Box), sama dengan definisi di notebook.

> **Catatan:** `data-slide.png` masih template dari case lain (Garuda, "64 Young Travelers"). Struktur dan tata letaknya sudah bagus dan bisa dipakai apa adanya. Yang perlu diganti adalah **isinya**: judul, profil responden, angka besar, kotak "gap", dan dua kolom segmen. Dokumen ini menjelaskan pengganti untuk setiap teks template, disertai angka yang sudah dicek ulang langsung dari `dataset.csv`.

---

## 1. Keputusan utama: segmentasinya pakai apa?

Template membagi responden berdasarkan **frekuensi perilaku** (Occasional vs Frequent Flyers). Padanan yang paling tepat untuk merchant adalah **volume transaksi harian (Q3)**, dibagi menjadi dua kelompok yang hampir sama besar:

| Kolom | Segmen | Definisi (Q3) | n |
|---|---|---|---|
| Tengah | **Small-Volume Merchants** | ≤ 25 transaksi/hari (< 10: 3 orang; 10–25: 23 orang) | **26** |
| Kanan | **High-Volume Merchants** | > 25 transaksi/hari (26–50: 9; 51–100: 11; > 100: 7) | **27** |

**Alasan pembagian ini dipilih:**
1. Pembagiannya seimbang (26 vs 27), jadi perbandingan antarsegmen adil. Pembagian lain timpang: aware 36 vs unaware 17, jasa hanya 9 orang.
2. Perbedaan antarsegmen **bermakna dan langsung terhubung ke BEE**:
   - merchant kecil butuh **"tell me what to do"** (rekomendasi, kesederhanaan) → **BUILD: UNDERSTAND + Growth Mission**
   - merchant besar butuh **"help me scale and stay"** (customer & promo management, reward & progress, notifikasi, koneksi bank) → **BUILD: ACT/CONNECT + EARN**
3. Pembagian ini melengkapi `analysis.md`, bukan mengulanginya. Split aware/unaware sudah dipakai di Insight #8, dan di slide ini tetap muncul lewat kotak "Activation Gap".

> Pembagian ≤25 / >25 ini **tidak ada di notebook**. Saya menghitungnya dari `dataset.csv` dengan definisi yang sama (lihat Lampiran B untuk skripnya). Semua angka di bawah sudah diverifikasi.

---

## 2. Peta pengganti: teks template → teks baru

| # | Elemen di template | Teks template (lama) | **Ganti menjadi (baru)** |
|---|---|---|---|
| 1 | Nomor appendix | APPENDIX 11. | APPENDIX **[sesuaikan nomor]**. |
| 2 | Judul | Survey of 64 Young Travelers: Profile, Barriers, and What Keeps Them on Garuda | **Survey of 53 MSME Merchants: Profile, Needs, and What Would Make Them Choose Livin' Merchant** |
| 3 | Header kiri | Respondent Segmentation Profile (64) | **Respondent Merchant Profile (53)** |
| 4 | Box profil 1 | Age · 18–23 years old · N = 60 (94%) | **Business** · F&B & Grocery · N = 44 Respondents (83%) |
| 5 | Box profil 2 | Life Stage · Uni Student / First-Jobbers · N = 57 (89%) | **Years Running** · 1+ year in business · N = 42 Respondents (79%) |
| 6 | Box profil 3 | When Fly? · Leisure / holiday · N = 48 (75%) | **Accept QRIS?** · Yes, QRIS at the counter · N = 50 Respondents (94%) |
| 7 | Angka besar | 92% OTA-First Discovery | **89% Wallet-First Merchants** |
| 8 | Kotak gap | 50% → 16% Graduation Gap | **68% → 0% Activation Gap** |
| 9 | Header tengah | Occasional & Regular Flyers (n = 45) | **Small-Volume Merchants (n = 26)**, sub-label: *≤ 25 transactions/day* |
| 10 | Header kanan | Frequent Flyers (n = 19) | **High-Volume Merchants (n = 27)**, sub-label: *> 25 transactions/day* |
| 11 | Sub-judul blok 1 (dua kolom) | What Makes a Premium Fare Worth It | **What They Most Want to Know About Their Business** |
| 12 | Sub-judul blok 2 (dua kolom) | Would Still Choose a Pricier Garuda For… | **What Would Make Them Choose Livin' Merchant…** |
| 13 | Footnote | The survey was conducted independently by the team and distributed primarily to students. | **The survey was conducted independently by the team via Google Form (27–28 Sep 2026) among Indonesian MSME merchants (n = 53). Multi-select questions do not sum to 100%. Results are directional.** |

> **Kesalahan kecil di template yang jangan ikut tersalin:** label "4+ flights/yr" diletakkan di atas kolom *Occasional*, dan "≤ 3 flights/yr" di atas kolom *Frequent*, jadi posisinya tertukar. Pastikan **"≤ 25 transactions/day" ada di kolom Small-Volume** dan **"> 25 transactions/day" ada di kolom High-Volume**.

---

## 3. Isi detail per bagian

### 3.1 Kolom kiri: Respondent Merchant Profile (53)

Tiga box profil. Formatnya mengikuti template: label di kiri, lalu nilai tebal dan "N = x Respondents (y%)".

| Label box | Baris tebal | Baris kecil | Sumber | Alternatif bila ingin lebih spesifik |
|---|---|---|---|---|
| **Business** | F&B & Grocery | N = 44 Respondents (83%) | Q1: F&B 28 (53%) + Grocery 16 (30%) | "Food & Beverage", N = 28 (53%) |
| **Years Running** | 1+ year in business | N = 42 Respondents (79%) | Q2: 1–2 thn 16 + 3–5 thn 24 + >5 thn 2 | "3+ years", N = 26 (49%). Ini cocok dengan persona Andi (3 tahun). |
| **Accept QRIS?** | Yes, QRIS at the counter | N = 50 Respondents (94%) | Q4 | Poin tambahan: sama persis dengan penerimaan tunai (94%) |

**Makna yang disampaikan box ini:** sampel sesuai dengan target utama BEE, yaitu *digitally active, consumer-facing micro & small merchants* yang sudah beroperasi dan sudah menerima QRIS.

---

### 3.2 Angka besar: **89% Wallet-First Merchants**

**Teks yang disarankan:**

> # 89% *Wallet-First* **Merchants**
> **respondents already receive payments through another app**: GoPay Merchant (64%) or DANA Bisnis (32%), and **chose it simply because it is easy to use (81%)**.

| Angka | Nilai | Sumber |
|---|---|---|
| Pakai aplikasi lain untuk terima pembayaran/kelola penjualan | 47/53 = **89%** | Q6 (semua selain "tidak menggunakan aplikasi khusus") |
| GoPay Merchant | 34/53 = **64%** | Q6 |
| DANA Bisnis | 17/53 = **32%** | Q6 |
| Alasan memilih: mudah digunakan | 43/53 = **81%** | Q7 |

**Makna:** posisinya sama dengan "92% OTA-first" di template, yaitu *kanal yang saat ini dikuasai pihak lain*. Merchant bukan belum digital. Mereka **sudah terikat pada aplikasi kompetitor**, dan alasannya hanya faktor higienis (mudah, cepat cair, mudah daftar), yang sebenarnya juga dimiliki Livin' Merchant. Jadi **bersaing di fitur pembayaran saja tidak akan membuat merchant pindah.** Ini mendukung **Growth Value Gap** dan reframing *Payment Tool → Merchant Growth Partner*.

> Hati-hati dengan kata "competitor": angka 89% juga mencakup 4 orang yang memakai QRIS bank/mobile banking lain dan 1 orang yang memakai BSI. Karena itu frasa yang aman adalah **"another app"**, bukan "a fintech wallet". Kalau ingin khusus fintech wallet, gunakan **GoPay atau DANA = 41/53 = 77%**.

---

### 3.3 Kotak gap (ikon lampu): **68% → 0% Activation Gap**

**Teks yang disarankan:**

> # 68% → 0% *Activation* **Gap**
> **68% of merchants have heard of Livin' Merchant, but 0% have ever used it.** Awareness is not the bottleneck; conversion is. Aware merchants are warm leads: **89% of them want growth recommendations** (vs 65% of unaware) and **81% want to know their financing readiness** (vs 53%).

| Angka | Nilai | Sumber |
|---|---|---|
| Pernah mendengar Livin' Merchant | 36/53 = **68%** | Q10 |
| Pernah menggunakan Livin' Merchant | **0/53 = 0%** | Q10 (tidak ada satu pun yang memilih "pernah menggunakan") |
| Setuju rekomendasi membantu: aware vs unaware | 32/36 = **89%** vs 11/17 = **65%** | Q17 × Q10 |
| Ingin tahu kesiapan pembiayaan: aware vs unaware | 29/36 = **81%** vs 9/17 = **53%** | Q18 × Q10 |

**Makna:** kotak ini memakai pola yang sama dengan "50% → 16%" di template (angka yang turun tajam). Ini adalah **Merchant Paradox**, hook pembuka deck, sekaligus bukti **Market Activation Gap** → **ENGAGE** (Explore Mode, UMKM Growth Activation, *Discover → Check → Experience → Activate → First Transaction*).

**Alternatif kotak gap** (kalau 68%→0% sudah dipakai berulang di main deck):
> **77% vs 9% Progress-over-Promo:** 77% say levels/milestones would keep them using an app, yet only 9% pick an app for rewards & promos. (Q24, Q27) → **EARN**

---

### 3.4 Kolom tengah: **Small-Volume Merchants (n = 26)**, *≤ 25 transactions/day*

**Blok 1: What They Most Want to Know About Their Business** (Q13, boleh pilih lebih dari satu)

| Bar | % | n |
|---|---|---|
| Growth recommendations | **92%** | 24/26 |
| Sales growth | **85%** | 22/26 |
| Cash flow | **69%** | 18/26 |
| Best-selling products | **58%** | 15/26 |

**Blok 2: What Would Make Them Choose Livin' Merchant…** (Q29, maksimal 3 pilihan)

| Bar | % | n |
|---|---|---|
| Business analytics | **81%** | 21/26 |
| Personalized business recommendations | **46%** | 12/26 |
| Growth Score | **38%** | 10/26 |
| POS & payments | **27%** | 7/26 |

*(POS & payments seri dengan Inventory & operations di 27%. POS dipilih karena memperlihatkan bahwa pembayaran justru berada di **urutan bawah**.)*

**Pesan kolom ini: "Tell me what to do next."**
- Kebutuhan informasi **nomor 1** mereka adalah **rekomendasi** (92%), bahkan di atas pertumbuhan penjualan.
- Mereka **2,4× lebih mungkin** memilih *personalized recommendation* dibanding merchant besar (46% vs 19%).
- Mereka juga paling banyak menyebut **"too complicated"** sebagai hambatan (**46%** vs 30% di merchant besar, Q9).
- → Dukungan untuk **BUILD: UNDERSTAND + Growth Mission** (*one score, one next step*) dan *progressive disclosure* / Explore Mode.

---

### 3.5 Kolom kanan: **High-Volume Merchants (n = 27)**, *> 25 transactions/day*

**Blok 1: What They Most Want to Know About Their Business** (Q13)

| Bar | % | n |
|---|---|---|
| Sales growth | **81%** | 22/27 |
| Growth recommendations | **74%** | 20/27 |
| Cash flow | **63%** | 17/27 |
| Period-over-period performance | **44%** | 12/27 |

**Blok 2: What Would Make Them Choose Livin' Merchant…** (Q29)

| Bar | % | n |
|---|---|---|
| Business analytics | **59%** | 16/27 |
| Promotion & customer management | **41%** | 11/27 |
| Growth Score | **33%** | 9/27 |
| Reward & progress | **33%** | 9/27 |

*(Growth Score, Reward & progress, dan POS & payments sama-sama 33%. Reward & progress dipilih karena memperlihatkan kontras paling tajam dengan merchant kecil: **33% vs 8%**.)*

**Pesan kolom ini: "Help me scale, and reward my progress."**
- Ketertarikan pada **promotion & customer management 2,7× lebih tinggi** (41% vs 15%) dan pada **reward & progress 4× lebih tinggi** (33% vs 8%) dibanding merchant kecil.
- Mereka lebih ingin **membandingkan performa antarperiode** (44% vs 31%) dan **kesiapan pembiayaan** sebagai informasi utama (30% vs 12%).
- Pada pernyataan Likert (Top-2-Box), merchant besar juga lebih tinggi di: **notifikasi 81%** (vs 69%), **aplikasi terhubung rekening bank 74%** (vs 58%), **pengaruh sesama merchant 67%** (vs 50%), **minat komunitas 67%** (vs 50%), **motivasi milestone 81%** (vs 73%).
- → Dukungan untuk **BUILD: ACT (Next Best Action) + CONNECT** dan **EARN: Business Growth Stage → Merchant Champion + Community**. Segmen ini adalah *pipeline* Merchant Champion.

---

### 3.6 Benang merah kedua kolom (untuk speaker note atau caption kecil)

- **Business analytics menjadi alasan nomor 1 memilih Livin' Merchant di kedua segmen** (81% dan 59%; total 70%). POS & payments hanya 30% secara total. → *From Processing Payments to Progressing Businesses.*
- **"I need ONE app for transactions & operations" = 85% di kedua segmen**, dengan **0% yang tidak setuju** (Q15).
- **Pertumbuhan penjualan dan rekomendasi selalu masuk dua besar** kebutuhan informasi. Keduanya persis sesuai dengan **Growth Score** (*where am I?*) dan **Growth Mission** (*what next?*).

**Kalimat penutup yang disarankan (opsional, di bawah kolom atau sebagai speaker line):**
> *"Every merchant wants to understand their business. Small merchants need to be told what to do next; high-volume merchants want to grow customers and see their progress rewarded. BEE serves both on one platform."*

---

## 4. Speaker notes (±20 detik bila slide ini diangkat saat Q&A)

> "We surveyed 53 merchants, mostly F&B and grocery, most running for over a year, and 94% already accept QRIS. 89% already use another app, mostly GoPay, and they chose it simply because it's easy. Two-thirds know Livin' Merchant, but not one has used it. That's the Activation Gap. When we split by volume, both groups pick business analytics first. Smaller merchants want recommendations on what to do next, and bigger merchants want customer tools and visible progress. That is exactly why BEE has a Growth Mission for the first group and Growth Stage and Champion for the second."

---

## 5. Hal yang WAJIB dijaga agar slide akurat

1. **Selalu tulis n.** Header segmen memakai "(n = 26)" dan "(n = 27)". Angka persen di kolom segmen adalah **persen dari segmen**, bukan dari 53.
2. **Pertanyaan multi-select tidak berjumlah 100%.** Q13 tidak ada batas pilihan, sedangkan Q29 maksimal 3 pilihan. Karena itu bar blok 1 cenderung tinggi (sampai 92%) dan bar blok 2 lebih rendah. Ini wajar, dan footnote sudah menjelaskannya.
3. **Jangan bilang "0% users of Livin' Merchant" sebagai kelemahan sampel.** Itu adalah **temuan** (Activation Gap). Survei mengukur *prospective demand* dari merchant yang perlu dimenangkan Mandiri.
4. **Jangan mengklaim representatif nasional.** Gunakan kata *directional* atau *indicative*. Semua 14 pernyataan Likert memang signifikan di atas netral (Wilcoxon, Holm-corrected, p < 0,05; lihat notebook), dan itu bisa menjadi amunisi Q&A. Namun perbedaan antarsegmen (n = 26 vs 27) adalah **sinyal eksploratif**, bukan hasil uji statistik.
5. **Nomor soal:** dataset langsung melompat dari Q10 ke Q12 (tidak ada Q11 di export). Jangan mengutip "Q11".
6. **Konsistensi dengan main deck:** angka total (68%, 0%, 89%, 70%, 85%) sama dengan `deck_headline_stats.csv` dan `analysis.md`. Jangan dibulatkan secara berbeda di slide lain.
7. **Warna dan logo:** ganti biru Garuda dengan palet Mandiri (**Navy #003A70** untuk struktur/bar, **Yellow #FFB600** untuk highlight angka besar dan kotak gap). Ganti juga logo pojok kanan atas (Garuda/MSS/JEC) dengan logo yang relevan untuk SMBCC/Mandiri sesuai ketentuan panitia.

---

## 6. Alternatif segmentasi (cadangan)

Kalau tim lebih ingin menonjolkan **Market Activation Gap**, dua kolom bisa diganti menjadi **Aware Non-Users (n = 36)** vs **Unaware (n = 17)**. Angka Top-2-Box yang paling kontras:

| Pernyataan | Aware (n=36) | Unaware (n=17) |
|---|---|---|
| Rekomendasi dari aplikasi membantu (Q17) | **89%** | 65% |
| Ingin tahu kesiapan pembiayaan (Q18) | **81%** | 53% |
| Butuh ringkasan kondisi bisnis (Q16) | **78%** | 65% |
| Minat komunitas merchant (Q26) | **64%** | 47% |
| Hambatan utama "too complicated" (Q9) | 31% | **53%** |

**Kelemahan opsi ini:** segmennya timpang (17 orang), dan kotak "68% → 0%" di kiri jadi berulang. Karena itu **pembagian berdasarkan volume transaksi tetap direkomendasikan**.

---

## 7. Checklist sebelum finalisasi slide

- [ ] Judul menyebut **53 MSME Merchants** dan **Livin' Merchant**, tidak ada lagi sisa "Garuda", "Travelers", "flights".
- [ ] 3 box profil: Business 83% · Years Running 79% · QRIS 94%.
- [ ] Angka besar **89%** dengan rincian GoPay 64% / DANA 32% / easy to use 81%.
- [ ] Kotak gap **68% → 0%** dengan rincian aware 89% vs 65% (rekomendasi) dan 81% vs 53% (financing).
- [ ] Kolom tengah Small-Volume (n = 26): 92 / 85 / 69 / 58 dan 81 / 46 / 38 / 27.
- [ ] Kolom kanan High-Volume (n = 27): 81 / 74 / 63 / 44 dan 59 / 41 / 33 / 33.
- [ ] Label "≤ 25" / "> 25 transactions/day" berada di kolom yang benar.
- [ ] Panjang bar proporsional dengan persennya (template lama memakai bar penuh = 100%).
- [ ] Footnote diganti: Google Form, tanggal, n = 53, multi-select, directional.

---

## Lampiran A. Ringkasan angka total (n = 53) yang bisa dikutip di mana saja

| Temuan | Nilai | Soal |
|---|---|---|
| Menerima QRIS / tunai | 94% / 94% | Q4 |
| Mencatat dengan 2+ metode | 45% (24/53) | Q5 |
| Tidak memakai POS app untuk mencatat | 87% | Q5 |
| Hambatan utama: "too complicated" | 38% | Q9 |
| Tertarik dengan info "kesehatan usaha" (Growth Score) | 75% | Q12 |
| Akan lebih rutin mencatat bila membantu kelayakan pembiayaan | 66% | Q14 |
| Butuh satu aplikasi terintegrasi | 85% (0% tidak setuju) | Q15 |
| Rekomendasi membantu | 81% | Q17 |
| Ingin tahu kesiapan pembiayaan | 72% | Q18 |
| Notifikasi membantu keputusan | 75% | Q21 |
| Motivasi dari level/milestone | 77% | Q24 |
| Lebih suka reward pertumbuhan dibanding promo sementara | 74% | Q25 |
| Faktor pilih aplikasi: mudah digunakan / reward & promo | 91% / 9% | Q27 |
| Kanal: Instagram / TikTok / komunitas merchant | 72% / 62% / 55% | Q28 |
| Alasan memilih Livin' Merchant: analytics vs POS | 70% vs 30% | Q29 |

## Lampiran B. Skrip verifikasi angka segmen

```python
import pandas as pd
df = pd.read_csv("dataset.csv", encoding="utf-8-sig"); C = df.columns
high = df[C[3]].str.contains("26|51|100")          # Q3 > 25 transaksi/hari
for name, m in [("Small ≤25", ~high), ("High >25", high)]:
    n = m.sum()
    for q, item in [(12, "Rekomendasi pengembangan"), (12, "Pertumbuhan penjualan"),
                    (12, "Arus kas"), (12, "Produk yang paling laku"), (12, "Perbandingan"),
                    (28, "Business analytics"), (28, "Personalized"), (28, "Growth Score"),
                    (28, "POS"), (28, "Promosi"), (28, "Reward")]:
        k = df[m][C[q]].str.contains(item, regex=False).sum()
        print(f"{name} (n={n}) | {item}: {k}/{n} = {k/n:.0%}")
```
