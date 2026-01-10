import React from 'react';
import { Camera, Upload, CreditCard, Star, ArrowRight, LogOut } from 'lucide-react';
import { User } from '../types/User';
import { useNavigate } from 'react-router-dom';

interface HomePageProps {
  user: User | null;
  onLogout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Camera className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">PrintPro</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700">Welcome, {user.name}</span>
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Keluar</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate(user ? '/mode' : '/auth')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mulai Cetak
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Cetak Kenangan Anda dengan
              <span className="text-blue-600 block">Kualitas Professional</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Unggah foto Anda dan siapkan cetakan foto A5 dengan kualitas tinggi.
              Cocok untuk kenangan pribadi, hadiah, dan kebutuhan profesional.
            </p>
            <button
              onClick={() => navigate(user ? '/mode' : '/auth')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 inline-flex items-center space-x-2"
            >
              <span>Mulai Cetak A5</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cara Kerja</h2>
            <p className="text-gray-600 text-lg">Sederhana, cepat, dan pencetakan foto profesional hanya dalam beberapa langkah</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Unggah Foto</h3>
              <p className="text-gray-600">Unggah foto langsung dari perangkat Anda</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200 transition-colors">
                <Star className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Preview Cetak A5</h3>
              <p className="text-gray-600"> Foto akan disesuaikan otomatis untuk ukuran A5</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors">
                <CreditCard className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pembayaran Aman</h3>
              <p className="text-gray-600">Lakukan pembayaran sebelum proses cetak</p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* Pricing Section */}
<section className="py-20 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Harga Cetak
      </h2>
      <p className="text-gray-600 text-lg">
        Saat ini kami melayani cetak ukuran A5
      </p>
    </div>

    <div className="flex justify-center">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow max-w-sm w-full">
        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm mb-4 inline-block">
          Promo Launching
        </div>

        <h3 className="text-2xl font-bold mb-2">Cetak Foto A5</h3>
        <p className="text-gray-600 mb-6">
          Kualitas tinggi untuk foto dan dokumen
        </p>

        <div className="mb-2">
          <span className="text-gray-400 line-through text-lg">
            Rp 25.000
          </span>
        </div>

        <div className="text-4xl font-bold text-blue-600 mb-4">
          Rp 15.000
        </div>

        <p className="text-sm text-gray-500">
          Resolusi minimum: 1748 × 2480 px
        </p>

        <p className="text-xs text-gray-400 mt-2">
          *Harga promo untuk periode terbatas
        </p>
      </div>
    </div>
  </div>
</section>



      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Siap Mencetak Foto Anda?</h2>
          <p className="text-blue-100 text-lg mb-8">Bergabunglah dengan ribuan pelanggan puas yang mempercayai PrintPro</p>
          <button
            onClick={() => navigate(user ? '/mode' : '/auth')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 inline-flex items-center space-x-2"
          >
            <span>Cobain Hari ini</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Camera className="h-6 w-6" />
                <span className="text-xl font-bold">PrintPro</span>
              </div>
              <p className="text-gray-400">Layanan cetak foto berkualitas tinggi untuk kebutuhan pribadi dan profesional.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Layanan</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Cetak Foto A5</li>
                <li>Kualitas Tinggi</li>
                <li>Proses Aman</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Bantuan</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Pusat Bantuan</li>
                <li>Hubungi Kami</li>
                <li>Lacak Pesanan</li>
                <li>Pengembalian</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Grup Kami</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tentang Kami</li>
                <li>Kebijakan Privasi</li>
                <li>Syarat Layanan</li>
                <li>Karir</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 PrintPro.  Hak cipta dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;