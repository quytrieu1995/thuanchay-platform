import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Package, Lock, User, ArrowRight, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const result = login(username, password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[320px] bg-gradient-to-b from-sky-400/30 via-sky-300/20 to-transparent blur-3xl dark:from-sky-600/25 dark:via-sky-500/15" />
      <div className="pointer-events-none absolute right-[10%] top-[20%] h-72 w-72 rounded-full bg-sky-400/30 blur-3xl dark:bg-sky-600/30" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-16 lg:flex-row lg:justify-between lg:px-10">
        <div className="hidden w-full max-w-xl space-y-10 pr-10 lg:block">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-200"
          >
            <ArrowLeft size={16} />
            Quay lại trang giới thiệu
          </Link>
          <div className="inline-flex items-center gap-3 rounded-full border border-primary-200 bg-primary-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-600 dark:border-primary-500 dark:bg-primary-700 dark:text-primary-200">
            <Sparkles size={14} />
            Commerce OS
          </div>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 dark:text-slate-100">
            Tăng tốc vận hành, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">bắt đầu ngay hôm nay.</span>
          </h1>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Đăng nhập để quản lý đơn hàng, tồn kho và khách hàng trên một nền tảng thống nhất.
            Những cập nhật realtime giúp ra quyết định nhanh hơn, chính xác hơn.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-lg shadow-slate-900/5 dark:border-slate-800/60 dark:bg-slate-900/60">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <ShieldCheck size={18} className="text-primary-500" />
                Bảo mật đa lớp
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Xác thực phân quyền và nhật ký hoạt động cho từng nhân sự.
              </p>
            </div>
            <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-lg shadow-slate-900/5 dark:border-slate-800/60 dark:bg-slate-900/60">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <Package size={18} className="text-primary-500" />
                Đồng bộ thời gian thực
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Chia sẻ dữ liệu tức thời giữa kho, bán hàng và kế toán.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel w-full max-w-md border border-slate-200/80 p-10 shadow-card-hover dark:border-slate-800/70">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-soft-glow">
              <Package size={30} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Đăng nhập Thuần Chay VN</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sử dụng tài khoản được cấp để tiếp tục quản lý hệ thống.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-600 shadow-sm dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-12"
                  placeholder="Nhập tên đăng nhập"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full text-base">
              Đăng nhập
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white/70 px-5 py-4 text-xs text-slate-500 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-400">
            <p className="text-center font-semibold text-slate-600 dark:text-slate-300">Tài khoản dùng thử</p>
            <div className="mt-2 space-y-2 font-mono">
              <p>admin / admin123</p>
              <p>staff / staff123</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <Link
              to="/"
              className="inline-flex items-center gap-1 font-semibold text-primary-600 transition hover:text-primary-500 dark:text-primary-200 dark:hover:text-primary-100"
            >
              <ArrowLeft size={14} />
              Về trang chủ
            </Link>
            <a
              href="mailto:support@Thuần Chay VN.vn"
              className="font-semibold hover:text-primary-600 dark:hover:text-primary-200"
            >
              Cần hỗ trợ? support@Thuần Chay VN.vn
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
