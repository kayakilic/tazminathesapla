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

  // --- Kıdem tazminatı tavanı ---
  const kTavan = kidemTavanBul(cikisTarihi);
  if (kTavan === null) {
    errorDiv.textContent = '⚠️ İşten çıkış tarihi, desteklenen tavan dönemi dışındadır (Ocak 2017 - Haziran 2026).';
    errorDiv.style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';
    return;
  }

  // Tavan kontrolü: brüt ücret tavanı aşıyorsa tavan esas alınır
  const tavanUygulandiMi = salaryVal > kTavan;
  const esasAylikUcret   = tavanUygulandiMi ? kTavan : salaryVal;
  const esasGunlukUcret  = esasAylikUcret / 30;

  // --- Kıdem tazminatı hesabı ---
  // Formül: günlük ücret × toplam gün × (30/365)
  const kidemTazminati = esasGunlukUcret * toplamGun * (30 / 365);

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
  document.getElementById('kidemTavan').textContent   = tlFormat(kTavan);
  document.getElementById('esasAylik').textContent    = tlFormat(esasAylikUcret);
  document.getElementById('esasGunluk').textContent   = tlFormat(esasGunlukUcret);
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

  // Kıdem tazminatı
  document.getElementById('kidemTutar').textContent = tlFormat(kidemTazminati);
  document.getElementById('kidemCumle').textContent =
    `${turkceFormat(girisTarihi)} - ${turkceFormat(cikisTarihi)} tarihleri arasında en son ` +
    `${tlFormat(salaryVal)} brüt ücret ile çalışan kişinin hak kazandığı kıdem tazminatı ` +
    `${tlFormat(kidemTazminati)} Türk Lirası'dır.`;

  // İhbar tazminatı
  document.getElementById('ihbarTutar').textContent = tlFormat(ihbarTazminati);
  document.getElementById('ihbarCumle').textContent =
    `${turkceFormat(girisTarihi)} - ${turkceFormat(cikisTarihi)} tarihleri arasında en son ` +
    `${tlFormat(salaryVal)} brüt ücret ile çalışan kişinin hak kazandığı ihbar tazminatı ` +
    `${tlFormat(ihbarTazminati)} Türk Lirası'dır.`;

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
    tavanUygulandiMi
  };
}

// -------------------------------------------------------
// 5. PDF OLUŞTURMA
// -------------------------------------------------------
function pdfIndir() {
  const s = window._hesapSonucu;
  if (!s) return;

  // jsPDF kütüphanesini başlat
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  // Türkçe karakter için özel font gerektiğinde fallback:
  // jsPDF varsayılan Helvetica Türkçe karakterleri tam desteklemez.
  // Bu nedenle özel karakterler Latin eşdeğerleriyle gösterilir.
  // Gerçek Türkçe font isterseniz ek bir .ttf embed edilmesi gerekir.

  const PW = 595;  // A4 genişliği (pt)
  const PH = 842;  // A4 yüksekliği (pt)
  const M  = 50;   // sol/sağ kenar boşluğu

  let y = 0; // dikey konum izleyici

  // Türkçe karakterleri PDF-safe hale getiren yardımcı fonksiyon
  function tr(s) {
    return s
      .replace(/ğ/g,'g').replace(/Ğ/g,'G')
      .replace(/ü/g,'u').replace(/Ü/g,'U')
      .replace(/ş/g,'s').replace(/Ş/g,'S')
      .replace(/ı/g,'i').replace(/İ/g,'I')
      .replace(/ö/g,'o').replace(/Ö/g,'O')
      .replace(/ç/g,'c').replace(/Ç/g,'C');
  }

  // --- Arka plan başlık bloğu ---
  doc.setFillColor(15, 52, 96);
  doc.rect(0, 0, PW, 100, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(tr('Kidem ve Ihbar Tazminati Hesaplama Raporu'), PW / 2, 45, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(tr('Turk Is Hukuku\'na gore hazirlanan resmi hesaplama raporu'), PW / 2, 68, { align: 'center' });
  doc.text(tr('Rapor tarihi: ') + turkceFormat(new Date()), PW / 2, 85, { align: 'center' });

  y = 120;

  // --- Yardımcı: satır çizgisi ---
  function cizgi() {
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(M, y, PW - M, y);
    y += 12;
  }

  // --- Yardımcı: bölüm başlığı ---
  function bolumBaslik(metin) {
    if (y > PH - 150) { doc.addPage(); y = 50; }
    doc.setFillColor(240, 244, 248);
    doc.rect(M, y - 12, PW - 2 * M, 24, 'F');
    doc.setTextColor(15, 52, 96);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(tr(metin), M + 8, y + 5);
    y += 24;
    cizgi();
  }

  // --- Yardımcı: iki sütun satır ---
  function satirYaz(etiket, deger, renkDeger) {
    if (y > PH - 60) { doc.addPage(); y = 50; }
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(tr(etiket), M + 4, y);
    if (renkDeger) {
      doc.setTextColor(39, 174, 96);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(26, 26, 46);
      doc.setFont('helvetica', 'bold');
    }
    doc.text(tr(deger), PW - M - 4, y, { align: 'right' });
    y += 20;
  }

  // --- Yardımcı: tam genişlik metin kutusu ---
  function kutuyaYaz(metin, renkKod) {
    if (y > PH - 100) { doc.addPage(); y = 50; }
    const temizMetin = tr(metin);
    const satirlar = doc.splitTextToSize(temizMetin, PW - 2 * M - 20);
    const yukseklik = satirlar.length * 16 + 16;
    doc.setFillColor(...renkKod);
    doc.roundedRect(M, y, PW - 2 * M, yukseklik, 6, 6, 'F');
    doc.setTextColor(26, 26, 46);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(satirlar, M + 10, y + 16);
    y += yukseklik + 14;
  }

  // --- Büyük tutar kutusu ---
  function tutarKutu(baslik, tutar, renkDolgu, renkYazi) {
    if (y > PH - 80) { doc.addPage(); y = 50; }
    doc.setFillColor(...renkDolgu);
    doc.roundedRect(M, y, PW - 2 * M, 60, 8, 8, 'F');
    doc.setTextColor(...renkYazi);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(tr(baslik), M + 16, y + 20);
    doc.setFontSize(20);
    doc.text(tr(tutar), PW - M - 16, y + 38, { align: 'right' });
    y += 72;
  }

  // ===================== İÇERİK =====================

  // Giriş Bilgileri
  bolumBaslik('Calisan Bilgileri');
  satirYaz('Ise Giris Tarihi',     turkceFormat(s.girisTarihi));
  satirYaz('Isten Cikis Tarihi',   turkceFormat(s.cikisTarihi));
  satirYaz('Aylik Brut Ucret',     tlFormat(s.salaryVal));

  y += 8;

  // Çalışma Süresi
  bolumBaslik('Calisma Suresi');
  satirYaz('Sure (Yil / Ay / Gun)', `${s.yil} Yil / ${s.ay} Ay / ${s.gun} Gun`);
  satirYaz('Toplam Gun Sayisi',     `${s.toplamGun} Gun`);

  y += 8;

  // Hesaplama Parametreleri
  bolumBaslik('Hesaplama Parametreleri');
  satirYaz('Uygulanan Kidem Tavani',      tlFormat(s.kTavan));
  satirYaz('Esas Alinan Aylik Ucret',     tlFormat(s.esasAylikUcret));
  satirYaz('Esas Alinan Gunluk Ucret',    tlFormat(s.esasGunlukUcret));
  satirYaz('Ihbar Suresi',                `${s.ihbarGun} Gun`);

  y += 8;

  // Tavan açıklaması
  if (s.tavanUygulandiMi) {
    bolumBaslik('Tavan Uygulamasi Aciklamasi');
    const aciklama =
      `Isin bitis tarihi ${turkceFormat(s.cikisTarihi)} itibarive kidem tazminati tavani brut ` +
      `${tlFormat(s.kTavan)} olarak tespit edilmistir. Brut ucretiniz tavan tutari astigindan ` +
      `hesaplama ilgili donem icin belirlenmis tavan ${tlFormat(s.kTavan)} esas alinarak yapilmistir.`;
    kutuyaYaz(aciklama, [255, 243, 205]);
  }

  y += 4;

  // Kıdem Tazminatı Sonucu
  bolumBaslik('Kidem Tazminati Sonucu');
  tutarKutu('Kidem Tazminati', tlFormat(s.kidemTazminati), [232, 245, 233], [39, 174, 96]);
  const kidemCumle =
    `${turkceFormat(s.girisTarihi)} - ${turkceFormat(s.cikisTarihi)} tarihleri arasinda ` +
    `en son ${tlFormat(s.salaryVal)} brut ucret ile calisan kisinin hak kazandigi kidem tazminati ` +
    `${tlFormat(s.kidemTazminati)} Turk Lirasi'dir.`;
  kutuyaYaz(kidemCumle, [248, 249, 250]);

  y += 4;

  // İhbar Tazminatı Sonucu
  bolumBaslik('Ihbar Tazminati Sonucu');
  tutarKutu('Ihbar Tazminati', tlFormat(s.ihbarTazminati), [255, 243, 224], [230, 126, 34]);
  const ihbarCumle =
    `${turkceFormat(s.girisTarihi)} - ${turkceFormat(s.cikisTarihi)} tarihleri arasinda ` +
    `en son ${tlFormat(s.salaryVal)} brut ucret ile calisan kisinin hak kazandigi ihbar tazminati ` +
    `${tlFormat(s.ihbarTazminati)} Turk Lirasi'dir.`;
  kutuyaYaz(ihbarCumle, [248, 249, 250]);

  // Alt bilgi
  const toplamSayfa = doc.internal.getNumberOfPages();
  for (let i = 1; i <= toplamSayfa; i++) {
    doc.setPage(i);
    doc.setFillColor(240, 244, 248);
    doc.rect(0, PH - 30, PW, 30, 'F');
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(
      tr('Bu rapor bilgilendirme amaclidir. Kesin hesaplama icin uzman gorusu aliniz.'),
      PW / 2, PH - 12, { align: 'center' }
    );
    doc.text(`Sayfa ${i} / ${toplamSayfa}`, PW - M, PH - 12, { align: 'right' });
  }

  // PDF'yi indir
  doc.save(tr(`Tazminat_Hesaplama_Raporu_${kisaFormat(new Date()).replace(/\./g,'_')}.pdf`));
}
