import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { motion } from "motion/react";
import { Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"login" | "register" | "verify">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signIn, signUp, verifyOtp } = useStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("请输入正确的邮箱地址");
      return;
    }
    if (!password || password.length < 6) {
      setError("密码长度至少为6位");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "登录失败，请检查邮箱和密码");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("请输入正确的邮箱地址");
      return;
    }
    if (!password || password.length < 6) {
      setError("密码长度至少为6位");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signUp(email, password);
      setMode("verify");
      setError("注册成功！验证码已发送至您的邮箱，请查收。");
    } catch (err: any) {
      setError(err.message || "注册失败");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError("请输入6位验证码");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await verifyOtp(email, code);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "验证失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {mode === "login" ? "欢迎回来" : mode === "register" ? "加入青夜云" : "验证邮箱"}
          </h1>
          <p className="text-slate-500">
            {mode === "login" ? "登录账号，开启你的AI应用之旅" : mode === "register" ? "创建账号，开启你的AI应用之旅" : "请输入发送至您邮箱的验证码"}
          </p>
        </div>

        {error && (
          <div className={`mb-6 p-4 border text-sm rounded-xl ${error.includes("成功") ? "bg-green-50 border-green-100 text-green-600" : "bg-red-50 border-red-100 text-red-600"}`}>
            {error}
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "登录中..." : "立即登录"}
              <ArrowRight className="h-5 w-5" />
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setMode("register"); setError(""); }}
                className="text-sm text-indigo-600 hover:underline"
              >
                没有账号？立即注册
              </button>
            </div>
          </form>
        ) : mode === "register" ? (
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                设置密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入至少6位密码"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "注册中..." : "立即注册"}
              <ArrowRight className="h-5 w-5" />
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className="text-sm text-indigo-600 hover:underline"
              >
                已有账号？返回登录
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                验证码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="请输入6位验证码"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                验证码已发送至 {email}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "验证中..." : "完成注册"}
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              返回修改注册信息
            </button>
          </form>
        )}

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            登录即代表您同意 <a href="#" className="text-indigo-600 hover:underline">服务协议</a> 和 <a href="#" className="text-indigo-600 hover:underline">隐私政策</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
