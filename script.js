// ============================================================
// KIDEM VE İHBAR TAZMİNATI HESAPLAYICI — script.js
// ============================================================

// -------------------------------------------------------
// 1. KIDEM TAZMİNATI TAVAN TABLOSU
//    Her dönem: { baslangic, bitis (dahil), tavan (TL) }
// -------------------------------------------------------
const tavanTablosu = [
  { baslangic: new Date('2026-01-01'), bitis: new Date('2026-06-30'), tavan: 64948.77 },
  { baslangic: new Date('2025-07-01'), bitis: new Date('2025-12-31'), tavan: 53919.68 },
  { baslangic: new Date('2025-01-01'), bitis: new Date('2025-06-30'), tavan: 46655.43 },
  { baslangic: new Date('2024-07-01'), bitis: new Date('2024-12-31'), tavan: 41828.42 },
  { baslangic: new Date('2024-01-01'), bitis: new Date('2024-06-30'), tavan: 35058.58 },
  { baslangic: new Date('2023-07-01'), bitis: new Date('2023-12-31'), tavan: 23489.83 },
  { baslangic: new Date('2023-01-01'), bitis: new Date('2023-06-30'), tavan: 19982.83 },
  { baslangic: new Date('2022-07-01'), bitis: new Date('2022-12-31'), tavan: 15371.40 },
  { baslangic: new Date('2022-01-01'), bitis: new Date('2022-06-30'), tavan: 10848.59 },
  { baslangic: new Date('2021-07-01'), bitis: new Date('2021-12-31'), tavan: 8284.51 },
  { baslangic: new Date('2021-01-01'), bitis: new Date('2021-06-30'), tavan: 7638.96 },
  { baslangic: new Date('2020-07-01'), bitis: new Date('2020-12-31'), tavan: 7117.17 },
  { baslangic: new Date('2020-01-01'), bitis: new Date('2020-06-30'), tavan: 6730.15 },
  { baslangic: new Date('2019-07-01'), bitis: new Date('2019-12-31'), tavan: 6379.86 },
  { baslangic: new Date('2019-01-01'), bitis: new Date('2019-06-30'), tavan: 6017.60 },
  { baslangic: new Date('2018-07-01'), bitis: new Date('2018-12-31'), tavan: 5434.42 },
  { baslangic: new Date('2018-01-01'), bitis: new Date('2018-06-30'), tavan: 5001.76 },
  { baslangic: new Date('2017-07-01'), bitis: new Date('2017-12-31'), tavan: 4732.48 },
  { baslangic: new Date('2017-01-01'), bitis: new Date('2017-06-30'), tavan: 4426.16 },
];

// -------------------------------------------------------
// 2. YARDIMCI FONKSİYONLAR
// -------------------------------------------------------

/** Tarihi Türkçe formatta döndürür: "15 Mart 2024" */
function turkceFormat(tarih) {
  const aylar = [
    'Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
    'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'
  ];
  return `${tarih.getDate()} ${aylar[tarih.getMonth()]} ${tarih.getFullYear()}`;
}

/** Tarihi "GG.AA.YYYY" formatında döndürür */
function kisaFormat(tarih) {
  const g = String(tarih.getDate()).padStart(2,'0');
  const a = String(tarih.getMonth()+1).padStart(2,'0');
  return `${g}.${a}.${tarih.getFullYear()}`;
}

/** Para tutarını TL formatında döndürür: "12.345,67 TL" */
function tlFormat(sayi) {
  return sayi.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL';
}

/** İşten çıkış tarihine göre kıdem tazminatı tavanını döndürür */
function kidemTavanBul(cikisTarihi) {
  for (const donem of tavanTablosu) {
    if (cikisTarihi >= donem.baslangic && cikisTarihi <= donem.bitis) {
      return donem.tavan;
    }
  }
  return null; // Tablo dışı tarih
}

/** İki tarih arasındaki gün sayısını hesaplar */
function gunFarki(t1, t2) {
  const ms = t2 - t1;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/** Toplam günü yıl/ay/gün olarak parçalar */
function gunuParca(toplamGun) {
  const yil  = Math.floor(toplamGun / 365);
  const kalan = toplamGun % 365;
  const ay   = Math.floor(kalan / 30);
  const gun  = kalan % 30;
  return { yil, ay, gun };
}

/** İhbar süresini (gün) döndürür */
function ihbarSuresiBul(toplamGun) {
  const altiAy    = 6  * 30;   // ~180 gün
  const birBucuk  = 18 * 30;   // ~540 gün
  const ucYil     = 36 * 30;   // ~1080 gün
  if (toplamGun < altiAy)     return 14;
  if (toplamGun < birBucuk)   return 28;
  if (toplamGun < ucYil)      return 42;
  return 56;
}

// -------------------------------------------------------
// 3. ANA HESAPLAMA FONKSİYONU
// -------------------------------------------------------
function hesapla() {
  // Hata alanını temizle
  const errorDiv = document.getElementById('errorMsg');
  errorDiv.style.display = 'none';

  // Kullanıcı girdileri
  const startVal  = document.getElementById('startDate').value;
  const endVal    = document.getElementById('endDate').value;
  const salaryVal = parseFloat(document.getElementById('salary').value);

  // Doğrulama
  if (!startVal || !endVal || isNaN(salaryVal) || salaryVal <= 0) {
    errorDiv.textContent = '⚠️ Lütfen tüm alanları eksiksiz ve doğru doldurun.';
    errorDiv.style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';
    return;
  }

  const girisTarihi = new Date(startVal);
  const cikisTarihi = new Date(endVal);

  if (cikisTarihi <= girisTarihi) {
    errorDiv.textContent = '⚠️ İşten çıkış tarihi, işe giriş tarihinden sonra olmalıdır.';
    errorDiv.style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';
    return;
  }

  // --- Çalışma süresi ---
  const toplamGun = gunFarki(girisTarihi, cikisTarihi);
  const { yil, ay, gun } = gunuParca(toplamGun);

  // 1475 sayılı İş Kanunu md.14: 1 yıldan az çalışmada kıdem tazminatı doğmaz.
  // 365 gün tam bir yılı temsil eder; 365 günden az ise kıdem hesaplanmaz.
  const kidemHakkazinandiMi = toplamGun >= 365;

  // --- Kıdem tazminatı tavanı ---
  const kTavan = kidemTavanBul(cikisTarihi);
  if (kTavan === null) {
    errorDiv.textContent = '⚠️ İşten çıkış tarihi, desteklenen tavan dönemi dışındadır (Ocak 2017 - Haziran 2026).';
    errorDiv.style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';
    return;
  }

  // Tavan kontrolü: brüt ücret tavanı aşıyorsa tavan esas alınır
  // (Kıdem hakkı doğmamışsa bu değerler ekranda "—" olarak gösterilir)
  const tavanUygulandiMi = kidemHakkazinandiMi && (salaryVal > kTavan);
  const esasAylikUcret   = tavanUygulandiMi ? kTavan : salaryVal;
  const esasGunlukUcret  = esasAylikUcret / 30;

  // --- Kıdem tazminatı hesabı ---
  // Formül: günlük ücret × toplam gün × (30/365)
  // Kıdem hakkı yoksa tutar 0 olarak işaretlenir (gösterilmez)
  const kidemTazminati = kidemHakkazinandiMi
    ? esasGunlukUcret * toplamGun * (30 / 365)
    : 0;

  // --- İhbar tazminatı hesabı ---
  // İhbar tazminatında tavan uygulanmaz; kullanıcının kendi ücreti esas alınır
  const ihbarGun         = ihbarSuresiBul(toplamGun);
  const ihbarGunlukUcret = salaryVal / 30;
  const ihbarTazminati   = ihbarGunlukUcret * ihbarGun;

  // -------------------------------------------------------
  // 4. SONUÇLARI EKRANA YAZ
  // -------------------------------------------------------

  // Çalışma süresi
  document.getElementById('sureTam').textContent =
    `${yil} Yıl / ${ay} Ay / ${gun} Gün`;
  document.getElementById('toplamGun').textContent = `${toplamGun} Gün`;

  // Ücret bilgileri
  // Kıdem hakkı yoksa tavan ve esas ücret satırları "—" gösterilir
  document.getElementById('kidemTavan').textContent   = kidemHakkazinandiMi ? tlFormat(kTavan) : '—';
  document.getElementById('esasAylik').textContent    = kidemHakkazinandiMi ? tlFormat(esasAylikUcret) : '—';
  document.getElementById('esasGunluk').textContent   = kidemHakkazinandiMi ? tlFormat(esasGunlukUcret) : '—';
  document.getElementById('ihbarSure').textContent    = `${ihbarGun} Gün`;

  // Tavan açıklaması
  const tavanDiv  = document.getElementById('tavanAciklama');
  const tavanText = document.getElementById('tavanAciklamaText');
  if (tavanUygulandiMi) {
    tavanText.textContent =
      `İşin bitiş tarihi ${turkceFormat(cikisTarihi)} itibariyle kıdem tazminatı tavanı brüt ${tlFormat(kTavan)} olarak tespit edilmiştir. ` +
      `Brüt ücretiniz tavan tutarı aştığından hesaplama ilgili dönem için belirlenmiş tavan ${tlFormat(kTavan)} esas alınarak yapılmıştır.`;
    tavanDiv.style.display = 'flex';
  } else {
    tavanDiv.style.display = 'none';
  }

  // Kıdem tazminatı — 1 yıldan az çalışma kontrolü
  const kidemYasalUyari  = document.getElementById('kidemYasalUyari');
  const kidemSonucAlani  = document.getElementById('kidemSonucAlani');
  if (!kidemHakkazinandiMi) {
    // Yasal uyarıyı göster, tutar alanını gizle
    document.getElementById('kidemYasalUyariText').textContent =
      'Yürürlükteki 1475 sayılı iş kanunu 14. maddesi uyarınca 1 yıldan daha az süreli çalışmalarda ' +
      'kıdem tazminatına hak kazanılmaz, bu sebeple kıdem tazminatı hesaplanamamıştır.';
    kidemYasalUyari.style.display = 'flex';
    kidemSonucAlani.style.display = 'none';
  } else {
    // Normal sonucu göster
    kidemYasalUyari.style.display = 'none';
    kidemSonucAlani.style.display = 'block';
    document.getElementById('kidemTutar').textContent = tlFormat(kidemTazminati);
    document.getElementById('kidemCumle').textContent =
      `İş akdinin kıdem tazminatına hak kazanacak şekilde sona ermesi halinde, ` +
      `${turkceFormat(girisTarihi)} - ${turkceFormat(cikisTarihi)} tarihleri arasında en son ` +
      `${tlFormat(salaryVal)} giydirilmiş brüt ücret ile çalışan işçiye ödenmesi gereken ` +
      `kıdem tazminatı ${tlFormat(kidemTazminati)} Türk Lirası'dır.`;
  }

  // İhbar tazminatı
  document.getElementById('ihbarTutar').textContent = tlFormat(ihbarTazminati);
  document.getElementById('ihbarCumle').textContent =
    `İş akdinin ihbar tazminatına hak kazanacak şekilde sona ermesi halinde, ` +
    `${turkceFormat(girisTarihi)} - ${turkceFormat(cikisTarihi)} tarihleri arasında en son ` +
    `${tlFormat(salaryVal)} giydirilmiş brüt ücret ile çalışan işçiye ödenmesi gereken ` +
    `ihbar tazminatı ${tlFormat(ihbarTazminati)} Türk Lirası'dır.`;

  // Sonuç alanını göster
  document.getElementById('resultSection').style.display = 'block';

  // Sonuçlara kaydır (mobil uyumluluk için)
  setTimeout(() => {
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
  }, 100);

  // Hesaplama verilerini global değişkene kaydet (PDF'de kullanmak için)
  window._hesapSonucu = {
    girisTarihi, cikisTarihi, salaryVal,
    toplamGun, yil, ay, gun,
    kTavan, esasAylikUcret, esasGunlukUcret,
    kidemTazminati, ihbarGun, ihbarTazminati,
    tavanUygulandiMi, kidemHakkazinandiMi
  };
}

// -------------------------------------------------------
// 5. PDF OLUŞTURMA
// -------------------------------------------------------
function pdfIndir() {
  const s = window._hesapSonucu;
  if (!s) return;

  // jsPDF'i başlat
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const PW = 595;  // A4 genişliği (pt)
  const PH = 842;  // A4 yüksekliği (pt)
  const M  = 50;   // sol/sağ kenar boşluğu

  let y = 0;

  // -------------------------------------------------------
  // Türkçe karakter desteği:
  // jsPDF'in built-in fontları (Helvetica, Times, Courier)
  // Latin-1 (ISO-8859-1) kodlamasını kullanır. Bu kodlamada
  // İ, ı, Ğ, ğ, Ş, ş, Ö, ö, Ü, ü, Ç, ç karakterleri mevcuttur
  // ancak doğrudan string içinde JavaScript Unicode olarak
  // gönderilince bozulur. Çözüm: doc.setLanguage kullanmak
  // yerine, metni encodeURIComponent/decodeURIComponent üzerinden
  // Latin-1 dizisine çevirmek yerine — her karakteri PDF için
  // doğru glyph kod noktasına manuel map ederek gönderiyoruz.
  // Bu yöntem ek font dosyası gerektirmez.
  // -------------------------------------------------------
  function pdfYaz(metin) {
    // Türkçe özgün karakterleri Latin Extended-A karşılıklarına
    // map ederek jsPDF'in WinAnsi kod sayfasında doğru glyph'i
    // kullanmasını sağlıyoruz.
    return metin
      .replace(/İ/g, '\u0130')  // İ (büyük, noktalı)
      .replace(/ı/g, '\u0131')  // ı (küçük, noktasız)
      .replace(/Ğ/g, '\u011E')  // Ğ
      .replace(/ğ/g, '\u011F')  // ğ
      .replace(/Ş/g, '\u015E')  // Ş
      .replace(/ş/g, '\u015F')  // ş
      .replace(/Ö/g, '\u00D6')  // Ö
      .replace(/ö/g, '\u00F6')  // ö
      .replace(/Ü/g, '\u00DC')  // Ü
      .replace(/ü/g, '\u00FC')  // ü
      .replace(/Ç/g, '\u00C7')  // Ç
      .replace(/ç/g, '\u00E7'); // ç
  }

  // PDF'e metin yazan kısayol: önce pdfYaz() uygular
  function yaz(metin, x, yPos, opts) {
    doc.text(pdfYaz(metin), x, yPos, opts || {});
  }

  // Çok satırlı metin bölme — pdfYaz dönüşümü ile
  function satirBol(metin, genislik) {
    return doc.splitTextToSize(pdfYaz(metin), genislik);
  }

  // --- Başlık bloğu ---
  doc.setFillColor(15, 23, 42);   // #0F172A
  doc.rect(0, 0, PW, 96, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  yaz('Kıdem ve İhbar Tazminatı Hesap Raporu', PW / 2, 44, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);  // slate-400
  yaz('Türk İş Hukuku\'na göre hazırlanmıştır', PW / 2, 64, { align: 'center' });
  yaz('Rapor tarihi: ' + turkceFormat(new Date()), PW / 2, 80, { align: 'center' });

  y = 116;

  // --- Yardımcı: ince çizgi ---
  function cizgi() {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(M, y, PW - M, y);
    y += 12;
  }

  // --- Yardımcı: bölüm başlığı ---
  function bolumBaslik(metin) {
    if (y > PH - 150) { doc.addPage(); y = 50; }
    doc.setFillColor(241, 245, 249);   // slate-100
    doc.rect(M, y - 12, PW - 2 * M, 24, 'F');
    doc.setTextColor(37, 99, 235);     // #2563EB
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    yaz(metin, M + 8, y + 5);
    y += 24;
    cizgi();
  }

  // --- Yardımcı: iki sütunlu satır ---
  function satirYaz(etiket, deger, yesilDeger) {
    if (y > PH - 60) { doc.addPage(); y = 50; }
    doc.setTextColor(100, 116, 139);   // slate-500
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    yaz(etiket, M + 4, y);
    if (yesilDeger) {
      doc.setTextColor(22, 163, 74);   // #16a34a
    } else {
      doc.setTextColor(30, 41, 59);    // slate-800
    }
    doc.setFont('helvetica', 'bold');
    yaz(deger, PW - M - 4, y, { align: 'right' });
    y += 20;
  }

  // --- Yardımcı: tam genişlik metin kutusu ---
  function kutuyaYaz(metin, dolguRenk, yaziRenk) {
    if (y > PH - 100) { doc.addPage(); y = 50; }
    const satirlar = satirBol(metin, PW - 2 * M - 24);
    const yukseklik = satirlar.length * 15 + 20;
    doc.setFillColor(...dolguRenk);
    doc.roundedRect(M, y, PW - 2 * M, yukseklik, 5, 5, 'F');
    doc.setTextColor(...yaziRenk);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(satirlar, M + 12, y + 15);
    y += yukseklik + 12;
  }

  // --- Büyük tutar kutusu ---
  function tutarKutu(baslik, tutar, dolguRenk, tutarRenk) {
    if (y > PH - 80) { doc.addPage(); y = 50; }
    doc.setFillColor(...dolguRenk);
    doc.roundedRect(M, y, PW - 2 * M, 58, 7, 7, 'F');
    doc.setTextColor(71, 85, 105);    // slate-600
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    yaz(baslik, M + 14, y + 19);
    doc.setTextColor(...tutarRenk);
    doc.setFontSize(19);
    yaz(tutar, PW - M - 14, y + 38, { align: 'right' });
    y += 68;
  }

  // ===================== PDF İÇERİĞİ =====================

  // Çalışan Bilgileri
  bolumBaslik('Çalışan Bilgileri');
  satirYaz('İşe Giriş Tarihi',       turkceFormat(s.girisTarihi));
  satirYaz('İşten Çıkış Tarihi',     turkceFormat(s.cikisTarihi));
  satirYaz('Aylık Giydirilmiş Brüt Ücret', tlFormat(s.salaryVal));

  y += 8;

  // Çalışma Süresi
  bolumBaslik('Çalışma Süresi');
  satirYaz('Süre (Yıl / Ay / Gün)', `${s.yil} Yıl / ${s.ay} Ay / ${s.gun} Gün`);
  satirYaz('Toplam Gün Sayısı',     `${s.toplamGun} Gün`);

  y += 8;

  // Hesaplama Parametreleri
  bolumBaslik('Hesaplama Parametreleri');
  satirYaz('İş Akdinin Sona Erdiği Tarihteki Kıdem Tazminatı Tavanı',
    s.kidemHakkazinandiMi ? tlFormat(s.kTavan) : '—');
  satirYaz('Esas Alınan Aylık Brüt Ücret',
    s.kidemHakkazinandiMi ? tlFormat(s.esasAylikUcret) : '—');
  satirYaz('Esas Alınan Günlük Brüt Ücret',
    s.kidemHakkazinandiMi ? tlFormat(s.esasGunlukUcret) : '—');
  satirYaz('İhbar Süresi', `${s.ihbarGun} Gün`);

  y += 8;

  // Tavan açıklaması (sadece tavan uygulanmışsa)
  if (s.tavanUygulandiMi) {
    bolumBaslik('Tavan Uygulaması Açıklaması');
    kutuyaYaz(
      `İşin bitiş tarihi ${turkceFormat(s.cikisTarihi)} itibarıyla kıdem tazminatı tavanı brüt ` +
      `${tlFormat(s.kTavan)} olarak tespit edilmiştir. Giydirilmiş brüt ücretiniz tavan tutarını ` +
      `aştığından hesaplama ilgili dönem için belirlenmiş tavan ${tlFormat(s.kTavan)} esas alınarak yapılmıştır.`,
      [239, 246, 255],   // mavi açık arka plan
      [30, 64, 175]      // mavi yazı
    );
  }

  y += 4;

  // Kıdem Tazminatı Sonucu
  bolumBaslik('Kıdem Tazminatı Sonucu');
  if (!s.kidemHakkazinandiMi) {
    kutuyaYaz(
      'Yürürlükteki 1475 sayılı İş Kanunu 14. maddesi uyarınca 1 yıldan daha az süreli çalışmalarda ' +
      'kıdem tazminatına hak kazanılmaz, bu sebeple kıdem tazminatı hesaplanamamıştır.',
      [255, 251, 235],   // amber açık arka plan
      [120, 53, 15]      // amber koyu yazı
    );
  } else {
    tutarKutu('Kıdem Tazminatı', tlFormat(s.kidemTazminati), [240, 253, 244], [22, 163, 74]);
    kutuyaYaz(
      `İş akdinin kıdem tazminatına hak kazanacak şekilde sona ermesi halinde, ` +
      `${turkceFormat(s.girisTarihi)} - ${turkceFormat(s.cikisTarihi)} tarihleri arasında en son ` +
      `${tlFormat(s.salaryVal)} giydirilmiş brüt ücret ile çalışan işçiye ödenmesi gereken ` +
      `kıdem tazminatı ${tlFormat(s.kidemTazminati)} Türk Lirası'dır.`,
      [248, 250, 252],   // slate-50
      [51, 65, 85]       // slate-700
    );
  }

  y += 4;

  // İhbar Tazminatı Sonucu
  bolumBaslik('İhbar Tazminatı Sonucu');
  tutarKutu('İhbar Tazminatı', tlFormat(s.ihbarTazminati), [255, 251, 235], [217, 119, 6]);
  kutuyaYaz(
    `İş akdinin ihbar tazminatına hak kazanacak şekilde sona ermesi halinde, ` +
    `${turkceFormat(s.girisTarihi)} - ${turkceFormat(s.cikisTarihi)} tarihleri arasında en son ` +
    `${tlFormat(s.salaryVal)} giydirilmiş brüt ücret ile çalışan işçiye ödenmesi gereken ` +
    `ihbar tazminatı ${tlFormat(s.ihbarTazminati)} Türk Lirası'dır.`,
    [248, 250, 252],
    [51, 65, 85]
  );

  // Alt bilgi — tüm sayfalar
  const toplamSayfa = doc.internal.getNumberOfPages();
  for (let i = 1; i <= toplamSayfa; i++) {
    doc.setPage(i);
    doc.setFillColor(241, 245, 249);
    doc.rect(0, PH - 28, PW, 28, 'F');
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    yaz('Bu rapor bilgilendirme amaçlıdır. Kesin hesaplama için uzman görüşü alınız.',
      PW / 2, PH - 10, { align: 'center' });
    yaz(`Sayfa ${i} / ${toplamSayfa}`, PW - M, PH - 10, { align: 'right' });
  }

  // PDF'yi indir
  doc.save(`Tazminat_Hesaplama_Raporu_${kisaFormat(new Date()).replace(/\./g,'_')}.pdf`);
}
