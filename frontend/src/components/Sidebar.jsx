import { NavLink, useNavigate } from 'react-router-dom'

export default function Sidebar() {
  const pindah = useNavigate()
  return (
    <aside className="sidebar">
      <div className="logo">🐄 TernakKu</div>
      <nav>
        <NavLink to="/dashboard">📊 <span>Dashboard</span></NavLink>
        <NavLink to="/ternak">🐄 <span>Daftar Ternak</span></NavLink>
      </nav>
      <button className="keluar" onClick={() => pindah('/login')}>Keluar</button>
    </aside>
  )
}