Proje Yapısı
Bu proje, bir haber akışı uygulaması geliştirmek için React Native ve Node.js tabanlı bir sistemdir. Proje iki ana bölüme ayrılmıştır: Frontend (mobil uygulama) ve Backend (API ve veri yönetimi). Kullanıcılar haber akışını görebilir, profillerine erişebilir ve giriş yapabilir. Ayrıca, admin kullanıcılar haber ekleyebilir.

Frontend: React Native kullanılarak mobil uygulama geliştirilmiştir. Redux Toolkit ile durum yönetimi yapılmakta ve React Navigation ile ekranlar arasında geçiş sağlanmaktadır. Backend: Node.js ve Express.js kullanılarak RESTful API geliştirilmiştir. Veriler MongoDB üzerinde saklanmakta olup Mongoose kullanılmaktadır. Kullanıcı kimlik doğrulama işlemleri JWT ile gerçekleştirilmektedir.




Tabii! İşte proje yapınızı tek bir yazı olarak düzenlenmiş şekilde sunuyorum:

Proje Yapısı
Bu proje, bir haber akışı uygulaması geliştirmek için React Native ve Node.js tabanlı bir sistemdir. Proje iki ana bölüme ayrılmıştır: Frontend (mobil uygulama) ve Backend (API ve veri yönetimi). Kullanıcılar haber akışını görebilir, profillerine erişebilir ve giriş yapabilir. Ayrıca, admin kullanıcılar haber ekleyebilir.

Frontend: React Native kullanılarak mobil uygulama geliştirilmiştir. Redux Toolkit ile durum yönetimi yapılmakta ve React Navigation ile ekranlar arasında geçiş sağlanmaktadır. Backend: Node.js ve Express.js kullanılarak RESTful API geliştirilmiştir. Veriler MongoDB üzerinde saklanmakta olup Mongoose kullanılmaktadır. Kullanıcı kimlik doğrulama işlemleri JWT ile gerçekleştirilmektedir.

Proje Klasör Yapısı
Frontend (Mobil Uygulama):
frontend/
├── app/
│   └── index.tsx              # Uygulamanın başlangıç noktası
├── src/
│   ├── components/            # Yeniden kullanılabilir bileşenler
│   ├── navigation/
│   │   └── AppNavigator.tsx   # Navigasyon yapılandırması
│   ├── redux/
│   │   ├── slices/            # Redux slice tanımları
│   │   └── store.ts           # Redux store yapılandırması
│   ├── screens/
│   │   ├── HomeScreen.tsx     # Haber akışı ekranı
│   │   ├── LoginScreen.tsx    # Giriş ekranı
│   │   └── ProfileScreen.tsx  # Profil ekranı
│   └── types/                 # Tip tanımları
├── assets/                    # Medya dosyaları (ikonlar, görseller)
├── package.json               # Bağımlılıklar ve npm betikleri
└── tsconfig.json              # TypeScript yapılandırması

Backend (API):

backend/
├── src/
│   ├── controllers/           # İş mantığı (CRUD işlemleri)
│   ├── routes/                # API endpoint tanımları
│   │   ├── authRoutes.ts      # Kimlik doğrulama endpoint'leri
│   │   ├── userRoutes.ts      # Kullanıcı endpoint'leri
│   │   └── postRoutes.ts      # Haber endpoint'leri
│   ├── models/                # MongoDB modelleri (Mongoose ile)
│   │   ├── User.ts            # Kullanıcı modeli
│   │   └── Post.ts            # Haber modeli
│   ├── middlewares/           # Kimlik doğrulama ve hata yakalama
│   ├── config/                # Çevre değişkenleri ve yapılandırma
│   └── server.ts              # Express.js uygulamasının başlangıç dosyası
├── package.json               # Bağımlılıklar ve npm betikleri
├── .env                       # Çevre değişkenleri
└── tsconfig.json              # TypeScript yapılandırması

Özellikler ve Sistemler
Frontend (Mobil Uygulama):

Login Ekranı: Kullanıcı giriş yapabilir.
Haber Akışı Ekranı: Kullanıcılar haberleri görüntüleyebilir.
Profil Ekranı: Kullanıcı bilgileri ve haber geçmişi görüntülenebilir.
Redux Durum Yönetimi: Kullanıcı ve haber akışı bilgilerini yönetir.
Navigasyon: Stack ve Tab navigasyonu ile çoklu ekran desteği.
TypeScript: Daha güvenli ve okunabilir kod.
Backend (API):

Kullanıcı Yönetimi: Kayıt ve giriş işlemleri (JWT ile kimlik doğrulama).
Haber Yönetimi: Admin kullanıcılar haber ekleyebilir, düzenleyebilir ve silebilir.
Veritabanı: MongoDB ile kullanıcı ve haber verileri saklanır.
RESTful API: CRUD işlemleri için Express.js tabanlı API.



Tabii! İşte proje yapınızı tek bir yazı olarak düzenlenmiş şekilde sunuyorum:

Proje Yapısı
Bu proje, bir haber akışı uygulaması geliştirmek için React Native ve Node.js tabanlı bir sistemdir. Proje iki ana bölüme ayrılmıştır: Frontend (mobil uygulama) ve Backend (API ve veri yönetimi). Kullanıcılar haber akışını görebilir, profillerine erişebilir ve giriş yapabilir. Ayrıca, admin kullanıcılar haber ekleyebilir.

Frontend: React Native kullanılarak mobil uygulama geliştirilmiştir. Redux Toolkit ile durum yönetimi yapılmakta ve React Navigation ile ekranlar arasında geçiş sağlanmaktadır. Backend: Node.js ve Express.js kullanılarak RESTful API geliştirilmiştir. Veriler MongoDB üzerinde saklanmakta olup Mongoose kullanılmaktadır. Kullanıcı kimlik doğrulama işlemleri JWT ile gerçekleştirilmektedir.

Proje Klasör Yapısı
Frontend (Mobil Uygulama):

frontend/
├── app/
│   └── index.tsx              # Uygulamanın başlangıç noktası
├── src/
│   ├── components/            # Yeniden kullanılabilir bileşenler
│   ├── navigation/
│   │   └── AppNavigator.tsx   # Navigasyon yapılandırması
│   ├── redux/
│   │   ├── slices/            # Redux slice tanımları
│   │   └── store.ts           # Redux store yapılandırması
│   ├── screens/
│   │   ├── HomeScreen.tsx     # Haber akışı ekranı
│   │   ├── LoginScreen.tsx    # Giriş ekranı
│   │   └── ProfileScreen.tsx  # Profil ekranı
│   └── types/                 # Tip tanımları
├── assets/                    # Medya dosyaları (ikonlar, görseller)
├── package.json               # Bağımlılıklar ve npm betikleri
└── tsconfig.json              # TypeScript yapılandırması
Backend (API):

bash
Kopyala
Düzenle
backend/
├── src/
│   ├── controllers/           # İş mantığı (CRUD işlemleri)
│   ├── routes/                # API endpoint tanımları
│   │   ├── authRoutes.ts      # Kimlik doğrulama endpoint'leri
│   │   ├── userRoutes.ts      # Kullanıcı endpoint'leri
│   │   └── postRoutes.ts      # Haber endpoint'leri
│   ├── models/                # MongoDB modelleri (Mongoose ile)
│   │   ├── User.ts            # Kullanıcı modeli
│   │   └── Post.ts            # Haber modeli
│   ├── middlewares/           # Kimlik doğrulama ve hata yakalama
│   ├── config/                # Çevre değişkenleri ve yapılandırma
│   └── server.ts              # Express.js uygulamasının başlangıç dosyası
├── package.json               # Bağımlılıklar ve npm betikleri
├── .env                       # Çevre değişkenleri
└── tsconfig.json              # TypeScript yapılandırması
Özellikler ve Sistemler
Frontend (Mobil Uygulama):

Login Ekranı: Kullanıcı giriş yapabilir.
Haber Akışı Ekranı: Kullanıcılar haberleri görüntüleyebilir.
Profil Ekranı: Kullanıcı bilgileri ve haber geçmişi görüntülenebilir.
Redux Durum Yönetimi: Kullanıcı ve haber akışı bilgilerini yönetir.
Navigasyon: Stack ve Tab navigasyonu ile çoklu ekran desteği.
TypeScript: Daha güvenli ve okunabilir kod.
Backend (API):

Kullanıcı Yönetimi: Kayıt ve giriş işlemleri (JWT ile kimlik doğrulama).
Haber Yönetimi: Admin kullanıcılar haber ekleyebilir, düzenleyebilir ve silebilir.
Veritabanı: MongoDB ile kullanıcı ve haber verileri saklanır.
RESTful API: CRUD işlemleri için Express.js tabanlı API.
API Endpointleri
Endpoint	Metod	Açıklama
/api/auth/login	POST	Kullanıcı giriş
/api/auth/register	POST	Kullanıcı kayıt
/api/posts	GET	Haber akışı verileri
/api/posts	POST	Yeni haber ekleme (admin)
/api/posts/:id	PUT	Haber güncelleme (admin)
/api/posts/:id	DELETE	Haber silme (admin)



Bağımlılıklar
Frontend:

react-native
redux-toolkit
react-navigation
@react-navigation/native
react-redux
typescript
Backend:

express
mongoose
jsonwebtoken
bcrypt
dotenv
typescript