import { useNavigate } from 'react-router-dom'

export default function Register() {
  const pindah = useNavigate()
  return (
    <div className="auth">
      <div className="kartu-auth">
        <div className="logo-besar">🐄</div>
        <h1>Daftar</h1>
        <p className="sub">Buat akun TernakKu</p>
        <div className="field">
          <label>Nama</label>
          <input placeholder="Nama lengkap" />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" placeholder="nama@email.com" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" placeholder="Password" />
        </div>
        <div className="field">
          <label>Konfirmasi Password</label>
          <input type="password" placeholder="Ulangi password" />
        </div>
        <button className="btn btn-hijau btn-penuh" onClick={() => pindah('/login')}>Daftar</button>
        <button className="tautan" onClick={() => pindah('/login')}>Sudah punya akun? Masuk</button>
      </div>
    </div>
  )
}