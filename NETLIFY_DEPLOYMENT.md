# 🚀 KODESPACE - Netlify Deployment Rehberi

Bu rehber, KODESPACE projesini Netlify'da yayınlamak için adım adım talimatlar içerir.

---

## 📋 Ön Hazırlık

### 1. MongoDB Atlas Hesabı Oluşturun (ÜCRETSİZ)

**Neden:** Netlify statik hosting olduğu için, veritabanınızın cloud'da olması gerekiyor.

#### Adımlar:

1. **MongoDB Atlas'a gidin:** https://www.mongodb.com/cloud/atlas/register
2. **Ücretsiz hesap oluşturun:**
   - Email ile kayıt olun
   - "FREE" tier'ı seçin (512 MB ücretsiz)
3. **Cluster oluşturun:**
   - "Build a Database" butonuna tıklayın
   - "FREE" (M0) seçeneğini seçin
   - Region olarak size en yakın bölgeyi seçin (örn: Frankfurt, Ireland)
   - Cluster Name: `kodespace-cluster` (istediğiniz ismi verebilirsiniz)
   - "Create Cluster" butonuna tıklayın

4. **Database User oluşturun:**
   - Security > Database Access'e gidin
   - "Add New Database User" butonuna tıklayın
   - Username: `kodespace-user` (istediğiniz isim)
   - Password: Güçlü bir şifre oluşturun ve **kaydedin**
   - "Built-in Role": `Read and write to any database` seçin
   - "Add User" butonuna tıklayın

5. **IP Whitelist ayarlayın:**
   - Security > Network Access'e gidin
   - "Add IP Address" butonuna tıklayın
   - "Allow Access from Anywhere" seçin (0.0.0.0/0)
   - **Not:** Production'da daha spesifik IP'ler eklemek daha güvenlidir
   - "Confirm" butonuna tıklayın

6. **Connection String'i alın:**
   - "Database" sekmesine geri dönün
   - Cluster'ınızda "Connect" butonuna tıklayın
   - "Connect your application" seçin
   - "Driver" olarak "Node.js" seçin
   - Connection string'i kopyalayın, şuna benzer görünecek:
     ```
     mongodb+srv://kodespace-user:<password>@kodespace-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - `<password>` yerine oluşturduğunuz şifreyi yazın
   - Connection string'in sonuna veritabanı adını ekleyin: `/kodespace`
   - **Final string örneği:**
     ```
     mongodb+srv://kodespace-user:YourPassword123@kodespace-cluster.xxxxx.mongodb.net/kodespace?retryWrites=true&w=majority
     ```

---

### 2. NEXTAUTH_SECRET Oluşturun

Terminal'de şu komutu çalıştırın:

```bash
openssl rand -base64 32
```

Çıkan sonucu kopyalayın, örneğin:
```
Xm5FzK8NpQr3Wt9Ys2Vb7Hj4Gk1Lm6Nq8Pr5Ts0Uw==
```

---

### 3. GitHub Repository Oluşturun

#### Adımlar:

1. **GitHub'a gidin:** https://github.com/new
2. **Repository oluşturun:**
   - Repository name: `kodespace`
   - Visibility: `Public` veya `Private` (tercihiniz)
   - **ÖNEMLI:** "Add a README file", ".gitignore", "license" seçmeyin (zaten var)
   - "Create repository" butonuna tıklayın

3. **Local projenizi GitHub'a push edin:**

   Terminal'de projenizin klasöründe:

   ```bash
   # Git repository başlatın (eğer henüz başlatılmadıysa)
   git init

   # Tüm dosyaları ekleyin
   git add .

   # İlk commit'i yapın
   git commit -m "Initial commit - KODESPACE project ready for deployment"

   # GitHub repository'nizi remote olarak ekleyin
   # (YOUR_USERNAME yerine GitHub kullanıcı adınızı yazın)
   git remote add origin https://github.com/YOUR_USERNAME/kodespace.git

   # Main branch'e push edin
   git branch -M main
   git push -u origin main
   ```

   **Not:** GitHub kullanıcı adınızı ve repository adınızı doğru yazdığınızdan emin olun.

---

## 🌐 Netlify'da Deployment

### 1. Netlify Hesabı Oluşturun

1. **Netlify'a gidin:** https://www.netlify.com/
2. **"Sign up" butonuna tıklayın**
3. **GitHub ile giriş yapın** (en kolay yol)
4. Netlify'a GitHub hesabınıza erişim izni verin

---

### 2. Netlify'de Yeni Site Oluşturun

1. **Dashboard'da "Add new site" > "Import an existing project" seçin**

2. **"Connect to Git provider" bölümünde "GitHub" seçin**

3. **Repository'nizi seçin:**
   - `kodespace` repository'nizi bulun ve seçin
   - Eğer görmüyorsanız: "Configure Netlify on GitHub" ile erişim verin

4. **Build settings'i yapılandırın:**
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Advanced build settings:** Şimdilik boş bırakın

5. **"Deploy site" butonuna HENÜZ TIKLAMAYIN** - Önce environment variables'ları ekleyeceğiz

---

### 3. Environment Variables (Çevre Değişkenleri) Ekleyin

1. **"Site settings" > "Environment variables" > "Add a variable" butonuna tıklayın**

2. **Aşağıdaki değişkenleri TEK TEK ekleyin:**

#### Zorunlu Değişkenler:

| Key | Value | Açıklama |
|-----|-------|----------|
| `NODE_ENV` | `production` | Production ortamı |
| `NEXT_PUBLIC_APP_URL` | `https://your-site-name.netlify.app` | Netlify size otomatik URL verecek, sonra güncellersiniz |
| `MONGODB_URI` | MongoDB Atlas connection string'iniz | Yukarıda kopyaladığınız string |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` ile oluşturduğunuz | Yukarıda oluşturduğunuz secret |
| `NEXTAUTH_URL` | `https://your-site-name.netlify.app` | Site URL'iniz (sonra güncellersiniz) |

#### Opsiyonel (Şimdilik eklemeyebilirsiniz):

| Key | Value | Açıklama |
|-----|-------|----------|
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limiting penceresi |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Maksimum istek sayısı |
| `LOG_LEVEL` | `info` | Log seviyesi |
| `FEATURE_COMMENTS` | `true` | Yorum özelliği aktif |

**ÖNEMLI:** İlk deployment'tan sonra Netlify size otomatik bir URL verecek (örn: `https://kodespace-abc123.netlify.app`). Bu URL'i aldıktan sonra:
- `NEXT_PUBLIC_APP_URL` değişkenini güncelleyin
- `NEXTAUTH_URL` değişkenini güncelleyin

---

### 4. İlk Deployment'ı Başlatın

1. **"Deploys" sekmesine gidin**
2. **"Trigger deploy" > "Deploy site" butonuna tıklayın**
3. **Deploy loglarını izleyin:**
   - Build süreci 3-5 dakika sürebilir
   - Hataları kontrol edin
   - "Site is live" mesajını görünce deployment tamamlanmıştır

---

### 5. Site URL'inizi Alın ve Environment Variables Güncelleyin

1. **Site URL'inizi kopyalayın:**
   - Üstte `https://kodespace-abc123.netlify.app` gibi bir URL göreceksiniz
   - Bu URL'i kopyalayın

2. **Environment variables'ları güncelleyin:**
   - "Site settings" > "Environment variables"
   - `NEXT_PUBLIC_APP_URL` değişkenini bulun ve "Edit" butonuna tıklayın
   - Yeni URL'inizi yapıştırın
   - `NEXTAUTH_URL` için de aynı işlemi yapın

3. **Yeniden deploy edin:**
   - "Deploys" sekmesine gidin
   - "Trigger deploy" > "Clear cache and deploy site" seçin

---

### 6. Custom Domain Ekleyin (Opsiyonel)

Eğer kendi domain'iniz varsa (örn: `kodespace.com`):

1. **"Domain settings" sekmesine gidin**
2. **"Add custom domain" butonuna tıklayın**
3. **Domain'inizi girin** (örn: `kodespace.com`)
4. **DNS kayıtlarını güncelleyin:**
   - Netlify size DNS talimatları verecek
   - Domain sağlayıcınızda (GoDaddy, Namecheap, etc.) bu kayıtları ekleyin
   - A Record veya CNAME eklemek gerekebilir

5. **SSL/HTTPS otomatik aktif edilecek** (Let's Encrypt ücretsiz)

6. **Environment variables'ı tekrar güncelleyin:**
   - `NEXT_PUBLIC_APP_URL`: `https://kodespace.com`
   - `NEXTAUTH_URL`: `https://kodespace.com`
   - Yeniden deploy edin

---

## 🧪 Test Edin

### 1. Site'yi Ziyaret Edin

1. **Netlify URL'inizi tarayıcıda açın**
2. **Ana sayfanın yüklendiğini kontrol edin**
3. **Kayıt olmayı deneyin:**
   - Yeni hesap oluşturun
   - Email ve şifre girin
   - "Sign Up" butonuna tıklayın

4. **Giriş yapın:**
   - Oluşturduğunuz hesapla giriş yapın

5. **Snippet oluşturun:**
   - "New Snippet" butonuna tıklayın
   - Kod snippet'i ekleyin
   - Kaydedin

6. **Profil sayfasını kontrol edin:**
   - Navbar'da profilinize tıklayın
   - İstatistiklerin güncellendiğini görün

---

## 🐛 Sorun Giderme

### Problem: "Build failed" hatası

**Çözüm:**
1. Netlify deploy loglarını kontrol edin
2. `next.config.mjs` dosyasında `output: 'standalone'` yerine `output: process.env.NETLIFY ? 'export' : 'standalone'` kullanın (zaten yaptık)
3. Environment variables'ların doğru olduğundan emin olun

### Problem: "Database connection failed" hatası

**Çözüm:**
1. MongoDB Atlas'ta IP Whitelist'te `0.0.0.0/0` olduğundan emin olun
2. `MONGODB_URI` değişkeninin doğru olduğunu kontrol edin
3. MongoDB Atlas'ta database user'ın şifresinin doğru olduğunu kontrol edin

### Problem: "NextAuth configuration error" hatası

**Çözüm:**
1. `NEXTAUTH_URL` değişkeninin site URL'iniz ile aynı olduğundan emin olun
2. `NEXTAUTH_SECRET` değişkeninin en az 32 karakter olduğundan emin olun
3. Environment variables'ları kaydettikten sonra yeniden deploy ettiğinizden emin olun

### Problem: "API routes not working" hatası

**Çözüm:**
1. `netlify.toml` dosyasının root klasörde olduğundan emin olun
2. Netlify Functions ayarlarını kontrol edin
3. Server-side rendering için Next.js plugin'ini ekleyin (zaten `netlify.toml`'da var)

---

## 🔄 Güncelleme ve Yeni Deployment

### Kod Değişikliği Yaptığınızda:

1. **Değişiklikleri commit edin:**
   ```bash
   git add .
   git commit -m "Feature: Yeni özellik eklendi"
   git push origin main
   ```

2. **Netlify otomatik olarak deploy edecek:**
   - GitHub'a push ettiğiniz anda Netlify bunu algılar
   - Otomatik olarak yeni bir build başlatır
   - Deploy tamamlandığında site güncellenir

3. **Deploy durumunu kontrol edin:**
   - Netlify dashboard'da "Deploys" sekmesine gidin
   - Son deploy'un durumunu görün

---

## 📊 Monitoring ve Analytics

### Netlify Analytics (Ücretli)

1. **"Analytics" sekmesine gidin**
2. **"Enable Analytics" seçin**
3. **Aylık $9 (opsiyonel)**

### Ücretsiz Alternatifler:

1. **Google Analytics:**
   - Google Analytics hesabı oluşturun
   - Tracking ID alın (G-XXXXXXXXXX)
   - Environment variables'a `GOOGLE_ANALYTICS_ID` ekleyin
   - `app/layout.js` dosyasına Google Analytics script'i ekleyin

2. **Netlify'de built-in monitoring:**
   - "Functions" sekmesinden API route'larını izleyin
   - "Deploys" sekmesinden deploy geçmişini görün
   - "Build & Deploy" sekmesinden build süresini takip edin

---

## 🔒 Güvenlik Önlemleri

### Production için öneriler:

1. **Environment Variables'ı kimseyle paylaşmayın**
2. **MongoDB Atlas'ta IP Whitelist'i daraltın:**
   - `0.0.0.0/0` yerine sadece Netlify'ın IP'lerini ekleyin
   - Netlify IP listesi: https://docs.netlify.com/configure-builds/environment-variables/#netlify-configuration-variables

3. **Rate Limiting aktif edin:**
   - Environment variables'da `RATE_LIMIT_WINDOW_MS` ve `RATE_LIMIT_MAX_REQUESTS` ekleyin

4. **HTTPS kullanın:**
   - Netlify otomatik HTTPS sağlar (Let's Encrypt)
   - Custom domain eklerseniz SSL otomatik aktif olur

5. **Düzenli olarak dependency'leri güncelleyin:**
   ```bash
   npm audit
   npm update
   ```

---

## 🎉 Tebrikler!

KODESPACE projeniz artık canlıda! 🚀

### Sonraki Adımlar:

1. ✅ Site'yi test edin
2. ✅ Arkadaşlarınızla paylaşın
3. ✅ Feedback toplayın
4. ✅ Yeni özellikler ekleyin

### Sorularınız için:

- **Netlify Docs:** https://docs.netlify.com/
- **Next.js Docs:** https://nextjs.org/docs
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com/

---

**NOT:** Bu rehber 2025 için hazırlanmıştır. Netlify veya MongoDB Atlas UI'ı değişmiş olabilir ama genel adımlar aynıdır.
