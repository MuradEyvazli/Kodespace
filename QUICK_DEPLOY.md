# ⚡ KODESPACE - 5 Dakikada Hızlı Deploy

En kısa yol ile Netlify'da deploy etmek için bu rehberi takip edin.

---

## 🚀 Hızlı Adımlar (30-40 dakika)

### 1️⃣ MongoDB Atlas (10 dakika)

```
1. https://www.mongodb.com/cloud/atlas/register → Kayıt ol
2. FREE cluster oluştur (M0)
3. Database user oluştur → username + password kaydet
4. Network Access → "0.0.0.0/0" ekle (Allow from anywhere)
5. Connect → Connection string kopyala
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/kodespace?retryWrites=true&w=majority
```

---

### 2️⃣ GitHub'a Push (5 dakika)

Terminal'de:

```bash
# NEXTAUTH_SECRET oluştur
openssl rand -base64 32
# Çıkan sonucu bir yere kaydet!

# GitHub'a push (zaten git init yapılmış)
git add .
git commit -m "Ready for Netlify deployment"
git remote add origin https://github.com/YOUR_USERNAME/kodespace.git
git branch -M main
git push -u origin main
```

**Not:** `YOUR_USERNAME` yerine GitHub kullanıcı adınızı yazın.
**Not:** GitHub'da önceden `kodespace` repository'si oluşturmuş olmalısınız.

---

### 3️⃣ Netlify Deploy (15 dakika)

```
1. https://www.netlify.com → GitHub ile giriş yap

2. "Add new site" > "Import an existing project"

3. GitHub > "kodespace" repository'ni seç

4. Build settings:
   - Branch: main
   - Build command: npm run build
   - Publish directory: .next

5. **ZORUNLU:** Environment Variables ekle (Bu adımı atlarsan build FAIL olur!)

   "Site configuration" > "Environment variables" > "Add a variable"

   **Her birini teker teker ekle:**

   ```
   Key: NODE_ENV
   Value: production
   ───────────────────────────────────

   Key: MONGODB_URI
   Value: mongodb+srv://murad:Wattson5484@nodeexpressprojects.csweoyl.mongodb.net/kodespace
   ───────────────────────────────────

   Key: NEXTAUTH_SECRET
   Value: [openssl rand -base64 32 ile oluşturduğun - 32+ karakter ZORUNLU!]
   ───────────────────────────────────

   Key: NEXT_PUBLIC_APP_URL
   Value: https://your-site-name.netlify.app
   ───────────────────────────────────

   Key: NEXTAUTH_URL
   Value: https://your-site-name.netlify.app
   ```

   **UYARI:** Her değişkeni ekledikten sonra "Same value for all deploy contexts" seçili olmalı!

6. "Deploys" > "Trigger deploy" > "Deploy site"

7. Deploy tamamlandıktan sonra:
   - Site URL'ini kopyala (örn: https://kodespace-abc123.netlify.app)
   - NEXT_PUBLIC_APP_URL ve NEXTAUTH_URL değişkenlerini bu URL ile güncelle
   - Yeniden deploy et: "Clear cache and deploy site"
```

---

## ✅ Kontrol Listesi

- [ ] MongoDB Atlas cluster oluşturuldu
- [ ] Connection string kaydedildi
- [ ] NEXTAUTH_SECRET oluşturuldu
- [ ] GitHub'a push edildi
- [ ] Netlify'da site oluşturuldu
- [ ] Environment variables eklendi
- [ ] İlk deploy tamamlandı
- [ ] URL'ler güncellendi
- [ ] İkinci deploy tamamlandı
- [ ] Site test edildi

---

## 🧪 Hızlı Test

```
1. Site URL'ini aç
2. "Sign Up" ile kayıt ol
3. Giriş yap
4. "New Snippet" ile snippet oluştur
5. Profil sayfasını kontrol et
```

Hepsi çalışıyorsa → **BAŞARILI!** 🎉

---

## 🐛 Hata Alıyorsan

### "Build failed" veya "exit code 1"
**ÇÖZÜM:** `NETLIFY_FIX.md` dosyasını aç ve adım adım takip et!

En yaygın sebep: **NEXTAUTH_SECRET** environment variable eksik
→ Netlify'da mutlaka `NEXTAUTH_SECRET` ekle (32+ karakter)

### "Database connection failed"
→ MONGODB_URI'ı kontrol et, MongoDB Atlas'ta IP whitelist'e 0.0.0.0/0 eklendiğinden emin ol

### "NextAuth error"
→ NEXTAUTH_URL'in site URL'inle aynı olduğundan emin ol

### Detaylı çözüm için:
📖 **NETLIFY_FIX.md** - Adım adım troubleshooting rehberi

---

## 📚 Detaylı Rehber

Daha fazla bilgi için:
- **Detaylı adımlar:** `NETLIFY_DEPLOYMENT.md`
- **Checklist:** `DEPLOYMENT_CHECKLIST.md`

---

**Toplam Süre:** 30-40 dakika
**Maliyet:** ₺0 (Tamamen ücretsiz)
**Sonuç:** Canlı, çalışan bir Next.js uygulaması! 🚀
