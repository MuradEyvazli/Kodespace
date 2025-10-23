# ✅ KODESPACE Deployment Checklist

Netlify'da deploy etmeden önce bu kontrol listesini takip edin.

---

## 📝 Ön Hazırlık

### MongoDB Atlas (5-10 dakika)

- [ ] MongoDB Atlas hesabı oluştur (https://www.mongodb.com/cloud/atlas/register)
- [ ] FREE cluster oluştur (M0 - 512 MB ücretsiz)
- [ ] Database user oluştur (username + password kaydet)
- [ ] IP Whitelist ekle (0.0.0.0/0 - tüm IP'ler)
- [ ] Connection string al ve kaydet
  - Format: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/kodespace?retryWrites=true&w=majority`

### NEXTAUTH_SECRET Oluştur (1 dakika)

- [ ] Terminal'de çalıştır: `openssl rand -base64 32`
- [ ] Çıkan sonucu kaydet (örn: `Xm5FzK8NpQr3Wt9Ys2Vb7Hj4Gk1Lm6Nq8Pr5Ts0Uw==`)

### GitHub Repository (5 dakika)

- [ ] GitHub'da yeni repository oluştur: https://github.com/new
- [ ] Repository adı: `kodespace` (veya istediğin isim)
- [ ] Visibility: Public veya Private seç
- [ ] "Create repository" butonuna tıkla

### Local'den GitHub'a Push (2 dakika)

Terminal'de projenin klasöründe:

```bash
# 1. Git başlat
git init

# 2. Tüm dosyaları ekle
git add .

# 3. İlk commit
git commit -m "Initial commit - Ready for deployment"

# 4. GitHub repository'ni ekle (YOUR_USERNAME yerine kullanıcı adınızı yazın)
git remote add origin https://github.com/YOUR_USERNAME/kodespace.git

# 5. Push et
git branch -M main
git push -u origin main
```

- [ ] Yukarıdaki komutları çalıştır
- [ ] GitHub'da repository'nin güncellendiğini kontrol et

---

## 🌐 Netlify Deployment

### 1. Netlify Hesabı (2 dakika)

- [ ] Netlify'a git: https://www.netlify.com/
- [ ] "Sign up" butonuna tıkla
- [ ] GitHub ile giriş yap
- [ ] Netlify'a GitHub erişim izni ver

### 2. Site Oluştur (3 dakika)

- [ ] Dashboard'da "Add new site" > "Import an existing project" seç
- [ ] "GitHub" seç
- [ ] `kodespace` repository'ni bul ve seç
- [ ] Build settings:
  - Branch: `main`
  - Build command: `npm run build`
  - Publish directory: `.next`

**HENÜZ "Deploy site" BUTONA TIKLAMAYIN!**

### 3. Environment Variables Ekle (5 dakika)

"Site settings" > "Environment variables" > "Add a variable"

**Zorunlu değişkenler:**

- [ ] `NODE_ENV` = `production`
- [ ] `NEXT_PUBLIC_APP_URL` = `https://your-site-name.netlify.app` (geçici, sonra güncellenecek)
- [ ] `MONGODB_URI` = MongoDB Atlas connection string'iniz
- [ ] `NEXTAUTH_SECRET` = openssl ile oluşturduğunuz secret
- [ ] `NEXTAUTH_URL` = `https://your-site-name.netlify.app` (geçici, sonra güncellenecek)

**Opsiyonel değişkenler (şimdilik eklemeyebilirsiniz):**

- [ ] `RATE_LIMIT_WINDOW_MS` = `900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS` = `100`
- [ ] `LOG_LEVEL` = `info`
- [ ] `FEATURE_COMMENTS` = `true`

### 4. İlk Deploy (5 dakika)

- [ ] "Deploys" sekmesine git
- [ ] "Trigger deploy" > "Deploy site" butonuna tıkla
- [ ] Deploy loglarını izle (3-5 dakika sürebilir)
- [ ] "Site is live" mesajını gör

### 5. URL Güncelle (2 dakika)

- [ ] Site URL'ini kopyala (örn: `https://kodespace-abc123.netlify.app`)
- [ ] "Site settings" > "Environment variables" git
- [ ] `NEXT_PUBLIC_APP_URL` değişkenini gerçek URL ile güncelle
- [ ] `NEXTAUTH_URL` değişkenini gerçek URL ile güncelle
- [ ] "Deploys" > "Trigger deploy" > "Clear cache and deploy site" seç

---

## 🧪 Test Et

### Site Testleri

- [ ] Site URL'ini tarayıcıda aç
- [ ] Ana sayfa yükleniyor mu?
- [ ] Kayıt ol sayfası çalışıyor mu?
  - [ ] Yeni hesap oluştur
  - [ ] Email ve şifre gir
  - [ ] "Sign Up" butonuna tıkla
- [ ] Giriş yap
  - [ ] Oluşturduğun hesapla giriş yap
- [ ] Dashboard açılıyor mu?
- [ ] Snippet oluştur
  - [ ] "New Snippet" butonuna tıkla
  - [ ] Kod snippet'i ekle
  - [ ] Kaydet
- [ ] Profil sayfası çalışıyor mu?
  - [ ] Navbar'da profile tıkla
  - [ ] İstatistikler görünüyor mu?
  - [ ] Gerçek veriler (snippet sayıları) gösteriliyor mu?

---

## 🐛 Sorun Varsa

### Build Failed Hatası

- [ ] Netlify deploy loglarını kontrol et
- [ ] Environment variables'ların doğru olduğundan emin ol
- [ ] `netlify.toml` dosyasının root klasörde olduğunu kontrol et

### Database Connection Failed

- [ ] MongoDB Atlas'ta IP Whitelist'te `0.0.0.0/0` olduğundan emin ol
- [ ] `MONGODB_URI` değişkenini kontrol et
- [ ] MongoDB user şifresinin doğru olduğunu kontrol et

### NextAuth Error

- [ ] `NEXTAUTH_URL` değişkeninin site URL'iniz ile aynı olduğundan emin ol
- [ ] `NEXTAUTH_SECRET` değişkeninin en az 32 karakter olduğundan emin ol
- [ ] Yeniden deploy et

---

## 🎉 Tamamlandı!

Site canlıda! Şimdi:

- [ ] Arkadaşlarınla paylaş
- [ ] Feedback topla
- [ ] Yeni özellikler ekle

---

## 📊 İstatistikler

- **Toplam süre:** ~30-40 dakika
- **Maliyet:** ₺0 (Tamamen ücretsiz)
- **Otomatik deployment:** Evet (GitHub push ile otomatik)
- **SSL/HTTPS:** Evet (Otomatik)

---

**ÖNEMLI NOTLAR:**

1. ⚠️ `.env` dosyasını GitHub'a push etmeyin (zaten `.gitignore`'da)
2. ⚠️ Environment variables'ı kimseyle paylaşmayın
3. ✅ Her kod değişikliğinde `git push` yapın, Netlify otomatik deploy edecek
4. ✅ MongoDB Atlas ücretsiz tier 512 MB - küçük projeler için yeterli

---

**Detaylı rehber için:** `NETLIFY_DEPLOYMENT.md` dosyasına bakın
