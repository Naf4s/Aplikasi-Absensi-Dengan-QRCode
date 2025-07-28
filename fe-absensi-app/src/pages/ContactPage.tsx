import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Reset the form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-primary-800 py-16 md:py-24 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Hubungi Kami</h1>
            <p className="text-lg md:text-xl text-primary-100">
              Kami siap membantu Anda dengan segala pertanyaan seputar sekolah dan program pendidikan kami.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informasi Kontak</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 shadow-card mb-8">
                <div className="flex items-start mb-6">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary-700" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Alamat</h3>
                    <p className="text-gray-600">
                      Jl. Dieng Km 4, Bumirejo, Kec. Mojotengah, Kab. Wonosobo Prov. Jawa Tengah, 56351
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start mb-6">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary-700" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Telepon</h3>
                    <p className="text-gray-600">-</p>
                    <p className="text-gray-600">-</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-6">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary-700" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">sdn1.bumen@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary-700" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Jam Operasional</h3>
                    <p className="text-gray-600">Senin - Jumat: 07:00 - 15:00</p>
                    <p className="text-gray-600">Sabtu: 07:00 - 12:00</p>
                    <p className="text-gray-600">Minggu & Hari Libur: Tutup</p>
                  </div>
                </div>
              </div>
              
              <div className="h-64 md:h-80 lg:h-96 bg-gray-300 rounded-lg shadow-card overflow-hidden">
                {/* Embed a map here - this is a placeholder */}
                <div className="h-96 bg-gray-300 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.3758750471956!2d109.9152554!3d-7.317598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e700b395b6fb641%3A0x4ebd8ebbdc48fd60!2sSDN%201%20Bumirejo!5e0!3m2!1sid!2sid!4v1720267500000!5m2!1sid!2sid"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>

              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Kirim Pesan</h2>
              
              {submitSuccess ? (
                <div className="bg-success-50 text-success-700 p-6 rounded-lg border border-success-100 flex items-start">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 mr-3" />
                  <div>
                    <h3 className="font-medium text-lg">Pesan Terkirim!</h3>
                    <p>Terima kasih telah menghubungi kami. Kami akan merespons pesan Anda segera.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 shadow-card">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap <span className="text-error-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="form-input"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-error-600">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="form-input"
                        placeholder="Masukkan email"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subjek <span className="text-error-600">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="form-input"
                    >
                      <option value="" disabled>Pilih subjek</option>
                      <option value="pendaftaran">Informasi Pendaftaran</option>
                      <option value="program">Program Sekolah</option>
                      <option value="biaya">Informasi Biaya</option>
                      <option value="kerjasama">Kerjasama</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Pesan <span className="text-error-600">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Tulis pesan Anda"
                    ></textarea>
                  </div>
                  
                  {submitError && (
                    <div className="bg-error-50 text-error-700 p-3 rounded-md mb-6">
                      {submitError}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full flex justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Kirim Pesan
                      </>
                    )}
                  </button>
                </form>
              )}
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">FAQ</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg shadow-card">
                    <h4 className="font-medium text-gray-900 mb-2">Bagaimana cara mendaftarkan anak saya?</h4>
                    <p className="text-gray-600">
                      Pendaftaran dapat dilakukan langsung ke sekolah dengan membawa dokumen yang diperlukan seperti akta kelahiran, kartu keluarga, dan foto terbaru.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg shadow-card">
                    <h4 className="font-medium text-gray-900 mb-2">Apakah ada biaya pendaftaran?</h4>
                    <p className="text-gray-600">
                      Sebagai sekolah negeri, kami tidak memungut biaya pendaftaran. Namun ada biaya operasional untuk kegiatan tertentu yang akan diinformasikan secara transparan.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg shadow-card">
                    <h4 className="font-medium text-gray-900 mb-2">Bagaimana sistem absensi QR bekerja?</h4>
                    <p className="text-gray-600">
                      Setiap siswa memiliki kode QR unik yang dipindai saat masuk sekolah. Sistem secara otomatis mencatat kehadiran dan mengirimkan notifikasi kepada orang tua.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-2/3 mb-8 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Kunjungi Kami</h2>
              <p className="text-primary-100">
                Kami mengundang Anda untuk mengunjungi sekolah kami dan mengenal lebih dekat program dan fasilitas yang kami tawarkan.
              </p>
            </div>
            <div>
              <a href="#" className="btn bg-white text-primary-800 hover:bg-gray-100">
                Jadwalkan Kunjungan
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;