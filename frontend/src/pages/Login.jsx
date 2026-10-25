import { useNavigate } from 'react-router-dom'

export default function Login() {
  const pindah = useNavigate()
  return (
    <div className="auth">
      <div className="kartu-auth">
        <div className="logo-besar">🐄</div>
        <h1>Masuk</h1>
        <p className="sub">Selamat datang kembali di TernakKu</p>
        <div className="field">
          <label>Email</label>
          <input type="email" placeholder="nama@email.com" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" placeholder="Password" />
        </div>
        <button className="btn btn-hijau btn-penuh" onClick={() => pindah('/dashboard')}>Masuk</button>
        <button className="tautan" onClick={() => pindah('/register')}>Belum punya akun? Daftar</button>
      </div>
    </div>
  )
}