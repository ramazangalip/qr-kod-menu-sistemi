# QR Kod Menü Sistemi

**Lezzet Durağı** için geliştirilmiş, mobil öncelikli dijital menü, sipariş takip ve menü yönetim arayüzü. Müşteriler QR kod ile masalarını seçip menüyü inceleyebilir, sepet oluşturup sipariş verebilir ve garson çağırabilir. İşletme tarafı ise `/panel` ekranından gelen siparişleri takip edebilir ve **menüdeki tüm ürün bilgilerini (fiyat, açıklama, stok/tükendi durumu, görsel, rozetler, alerjenler vb.) anlık olarak güncelleyebilir.**

## Öne çıkanlar

- **Dinamik Masa Seçimi**: 20 masalık hızlı seçim tablosu veya özel masa adı/numarası girilerek açılan menü deneyimi.
- **Masa Numaralı Garson Çağırma**: Masaya özel servis personeli çağırma modalı ve geri sayımlı bilgilendirme bildirimi.
- **Kategori, Arama ve Rozet Filtreleri**: Gerçek zamanlı arama, yatay kategori çubuğu ve gurme rozet (Şefin Önerisi, Popüler, Organik, Glutensiz vb.) filtreleri.
- **Zengin Ürün Detayları**: Kalori, hazırlama süresi, alerjen uyarıları, opsiyonel pişme/içecek seçenekleri ve şefe özel sipariş notu.
- **Adisyon & Sepet Yönetimi**: Masa adisyon toplamı, adet artırma/azaltma, anlık tutar hesaplama ve sipariş iletme.
- **Sipariş Takip Paneli (`/panel`)**:
  - Gelen siparişleri masa numarası, sipariş kodu ve zaman damgasıyla listeleme.
  - Sipariş durumunu anlık olarak güncelleme (*Hazırlanıyor*, *Hazır*, *Teslim Edildi*).
  - Sipariş arama, durum filtreleme ve toplam ciro / aktif sipariş istatistikleri.
  - 5 saniyede bir otomatik veri yenileme.
- **Ürün & Menü Yönetimi Paneli (`/panel` - Ürün & Menü Sekmesi)**:
  - **Ürün Bilgilerini Güncelleme**: Ürün adı, fiyatı (₺), kategorisi, açıklaması, görsel bağlantısı, hazırlama süresi, kalori, puan ve seçenek gruplarını düzenleme.
  - **Tek Tıkla Stok / Satış Durumu**: Ürünü tek tıkla *Satışta* veya *Tükendi* yapabilme. Tükendi işaretlenen ürünler müşteri menüsünde otomatik olarak "Tükendi" etiketiyle listelenir ve sepete eklenmesi engellenir.
  - **Popülerlik / Öne Çıkarma**: Ürünleri tek tıkla popüler listeye ekleme ve çıkarma.
  - **Yeni Ürün Ekleme & Silme**: Menüye yeni ürün ekleyebilme veya menüden ürün çıkarabilme.
  - **Varsayılana Sıfırlama**: İstenildiğinde menüyü orijinal başlangıç lezzetlerine geri döndürebilme.
- **Wi-Fi Bilgilendirme**: Şifreyi tek dokunuşla panoya kopyalama modalı.

## Ekran fotoğrafları

| Masa seçimi | Ana menü |
| --- | --- |
| ![Masa seçim ekranı](public/screenshots/masa-secimi.png) | ![Ana menü ekranı](public/screenshots/ana-menu.png) |

| Garson çağırma | Wi-Fi bilgileri |
| --- | --- |
| ![Garson çağırma penceresi](public/screenshots/garson-cagir.png) | ![Wi-Fi bilgileri penceresi](public/screenshots/wifi-bilgileri.png) |

| Adisyon özeti | Sipariş onayı |
| --- | --- |
| ![Adisyon özeti](public/screenshots/adisyon-ozeti.png) | ![Sipariş onay ekranı](public/screenshots/siparis-onayi.png) |

![Sipariş yönetim paneli](public/screenshots/siparis-paneli.png)

## Teknolojiler

- [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- React 19 ve TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide React ikonları
- Canvas Confetti

## Başlangıç

### Gereksinimler

- Node.js 20 veya daha güncel bir LTS sürümü
- npm

### Kurulum

```bash
git clone <depo-adresi>
cd qr-kod-menu-sistemi
npm install
```

### Geliştirme sunucusu

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

| Sayfa | Amaç |
| --- | --- |
| `/` | Müşteri QR menüsü, masa seçimi ve sipariş verme |
| `/panel` | Sipariş izleme, durum güncelleme ve ürün/menü yönetimi |

## Komutlar

```bash
npm run dev    # Geliştirme sunucusunu başlatır
npm run lint   # ESLint denetimini çalıştırır
npm run build  # Üretim derlemesi oluşturur
npm run start  # Üretim sunucusunu başlatır
```

## Panel Üzerinden Ürün Yönetimi

Yönetim paneline (`/panel`) gidip üst kısımdaki **"Ürün & Menü"** sekmesine geçerek:

1. **Fiyat, İçerik ve Görsel Düzenleme**: Herhangi bir ürün kartındaki **"Düzenle"** butonuna basarak ürünün adını, fiyatını, açıklamasını, görselini, hazırlama süresini, kalori miktarını, rozetlerini ve alerjenlerini güncelleyebilirsiniz.
   - **Cihazdan Görsel Yükleme**: Bilgisayar veya mobil cihazınızdan fotoğraf seçebilir ya da sürükleyip bırakabilirsiniz. Yüklenen fotoğraflar tarayıcı belleğini şişirmemesi için otomatik olarak optimize edilip sıkıştırılarak saklanır.
   - **Web URL ile Görsel Tanımlama**: İstenirse doğrudan internet üzerindeki bir görsel bağlantısı da girilebilir.
2. **Anlık Stok / Tükendi Durumu**: Ürün kartının sağ üstündeki **"Satışta / Tükendi"** butonuna basarak ürünü hemen tükendi olarak işaretleyebilirsiniz. Değişiklik kaydedildiği anda müşteri arayüzünde buton devre dışı kalır ve "Tükendi" rozeti gösterilir.
3. **Yeni Ürün Ekleme**: **"+ Yeni Ürün Ekle"** butonunu kullanarak menünüze yeni gurme lezzetler tanımlayabilirsiniz.
4. **Varsayılan Menüye Sıfırlama**: İhtiyaç duyduğunuzda **"Varsayılana Sıfırla"** butonu ile menüyü orijinal `src/data/menu.ts` içeriğine geri döndürebilirsiniz.

## Veri Depolama (LocalDB / localStorage)

Uygulama istemci taraflı LocalDB mekanizması olarak tarayıcının `localStorage` alanını kullanır:

- **Siparişler**: `lezzet-duragi-orders` anahtarıyla kaydedilir. Verilen siparişler masa numarası, ürünler, toplam tutar ve zaman damgasıyla saklanır.
- **Ürünler & Menü**: `lezzet-duragi-menu-items` anahtarıyla saklanır. Panelden yapılan fiyat, açıklama ve stok güncellemeleri anlık olarak müşteri arayüzüne senkronize edilir.

> **Not**: Müşteri menüsü (`/`) ile yönetim paneli (`/panel`) aynı tarayıcıda çalıştırıldığında tüm siparişler ve menü güncellemeleri eşzamanlı olarak birbirine yansır. Üretim ortamında birden fazla bağımsız cihaz arasında veri paylaşımı için bir veritabanı (PostgreSQL, Supabase vb.) ve API katmanı bağlanabilir.

## Proje yapısı

```text
src/
├── app/
│   ├── page.tsx                           # Müşteri QR menü sayfası
│   └── panel/page.tsx                     # Sipariş & Ürün yönetim paneli
├── components/
│   ├── panel/
│   │   └── ProductEditModal.tsx          # Ürün düzenleme ve ekleme modalı
│   ├── AdisyonDrawer.tsx                  # Sepet ve adisyon özeti
│   ├── CallWaiterModal.tsx                # Masa numaralı garson çağırma modalı
│   ├── CallWaiterToast.tsx                # Garson çağrıldı bildirimi
│   ├── CategoryNav.tsx                    # Kategori gezinme çubuğu
│   ├── ItemDetailModal.tsx                # Ürün detay modalı
│   ├── MenuHeader.tsx                     # Restoran başlığı ve kapak görseli
│   ├── MenuItemCard.tsx                   # Menü ürün kartı
│   ├── MobileFrame.tsx                    # Mobil ve masaüstü duyarlı taşıyıcı
│   ├── OrderSuccessModal.tsx              # Sipariş tamamlandı modalı
│   ├── SearchBar.tsx                      # Arama ve filtreleme çubuğu
│   ├── TableSelectModal.tsx               # Masa seçim modalı
│   └── WifiModal.tsx                      # Wi-Fi bağlantı modalı
├── data/
│   └── menu.ts                            # Varsayılan restoran ve menü verileri
├── lib/
│   ├── menuStorage.ts                     # Menü ürünleri LocalDB yönetimi
│   └── orderStorage.ts                    # Masa siparişleri LocalDB yönetimi
└── types/
    └── menu.ts                            # TypeScript arayüz ve veri tipleri
```

## Lisans

Bu proje özel kullanım amacıyla hazırlanmıştır.
