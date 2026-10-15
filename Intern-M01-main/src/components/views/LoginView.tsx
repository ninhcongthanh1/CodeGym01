import React, { useState } from 'react';
import { 
  GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, 
  Sparkles, AlertCircle, Eye, EyeOff, CheckCircle2, UserCheck, Key
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Vui lòng điền đầy đủ Email và Mật khẩu!');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Email hoặc mật khẩu không chính xác!');
    }
  };

  const handleQuickFill = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25 mb-4">
          <GraduationCap className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          IMS Enterprise
        </h2>
        <p className="mt-2 text-sm text-slate-400 font-medium">
          Hệ Thống Quản Lý Thực Tập Sinh Toàn Diện
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 sm:px-8 shadow-2xl rounded-3xl border border-slate-700/80">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              Đăng Nhập Hệ Thống
            </h3>
            
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Đăng Nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@ims.corp / intern.tuan@student.hust.edu.vn"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Mật Khẩu
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Đang xác thực tài khoản...</span>
                ) : (
                  <>
                    <span>Đăng Nhập Vào Hệ Thống</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          
        </div>

        {/* Database Status Footer */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xác thực trực tiếp cơ sở dữ liệu SQLite: <code className="text-slate-300 font-mono">data/ims.db</code></span>
          </div>
        </div>
      </div>
    </div>
  );
};
