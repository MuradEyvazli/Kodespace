# 🚀 Quick Start Guide - Kodespace Docker

## Tek Komutla Başlat

```bash
./docker-start.sh
```

## Manuel Başlatma

### 1. Environment Ayarları

```bash
# .env.production dosyasını düzenle
cp .env.docker .env.production
nano .env.production
```

Gerekli değerleri girin:
- `NEXTAUTH_SECRET`: Güçlü bir secret key (min 32 karakter)
- `MONGODB_URI`: MongoDB bağlantı URL'niz

### 2. Build ve Çalıştır

```bash
# Build
docker-compose build

# Başlat
docker-compose up -d

# Log'ları izle
docker-compose logs -f
```

###  3. Erişim

Tarayıcınızda açın: **http://localhost:3000**

## Temel Komutlar

```bash
# Durdur
docker-compose down

# Yeniden başlat
docker-compose restart

# Logları göster
docker-compose logs -f app

# Container'a bağlan
docker exec -it kodespace-app sh

# Temizle (tüm verileri sil)
docker-compose down -v
```

## Sorun Giderme

### Port 3000 kullanımda?

```bash
# docker-compose.yml'de portu değiştir
ports:
  - "3001:3000"  # 3001 kullan
```

### Build hatası?

```bash
# Cache'i temizle
docker-compose build --no-cache
```

### Container başlamıyor?

```bash
# Logları kontrol et
docker-compose logs app

# Health check
docker inspect kodespace-app | grep Health -A 10
```

## Production'a Alırken

1. ✅ `.env.production` dosyasındaki tüm değerleri güncelle
2. ✅ `NEXTAUTH_SECRET` için güçlü bir key oluştur
3. ✅ `NEXTAUTH_URL` production domain'ine çevir
4. ✅ HTTPS/SSL kurulumu yap
5. ✅ Nginx reverse proxy ekle (isteğe bağlı)

## Daha Fazla Bilgi

- Detaylı dokümantasyon: `DOCKER_README.md`
- Docker files: `Dockerfile`, `docker-compose.yml`
- Nginx config: `nginx.conf`
