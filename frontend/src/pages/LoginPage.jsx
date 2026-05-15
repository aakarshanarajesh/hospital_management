import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/Alert';
import {
  Activity,
  ArrowRight,
  Building2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  Users,
} from 'lucide-react';

const emptyLogin = {
  email: '',
  password: '',
};

const emptyRegister = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'staff',
  department: '',
};

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState(emptyLogin);
  const [registerData, setRegisterData] = useState(emptyRegister);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginData.email, loginData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...registerData,
        department:
          registerData.role === 'doctor' ? registerData.department : undefined,
      };
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden px-6 py-8 sm:px-10 lg:block lg:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.28),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(20,184,166,0.2),transparent_28%),linear-gradient(135deg,#0f172a_0%,#111827_48%,#0b1120_100%)]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:42px_42px]" />

          <div className="relative z-10 flex min-h-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-blue-700 shadow-xl">
                <Building2 size={26} />
              </div>
              <div>
                <p className="text-xl font-bold tracking-wide">HMS</p>
                <p className="text-sm text-blue-100">Hospital Resource Suite</p>
              </div>
            </div>

            <div className="max-w-2xl py-14">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-blue-50 backdrop-blur">
                <Sparkles size={16} />
                AI-assisted hospital operations
              </div>
              <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Coordinate care with clarity.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
                Track patients, beds, resources, schedules, risk predictions,
                and hospital questions from one calm control center.
              </p>

              <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <Activity className="mb-3 text-cyan-200" size={24} />
                  <p className="text-sm font-semibold">Live Risk</p>
                  <p className="mt-1 text-xs text-slate-300">Low, medium, high</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <Stethoscope className="mb-3 text-emerald-200" size={24} />
                  <p className="text-sm font-semibold">Care Teams</p>
                  <p className="mt-1 text-xs text-slate-300">Doctors and staff</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <ShieldCheck className="mb-3 text-blue-200" size={24} />
                  <p className="text-sm font-semibold">Secure Access</p>
                  <p className="mt-1 text-xs text-slate-300">Role based routes</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-400">
              Built for fast decisions during busy hospital shifts.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
          <div className="w-full max-w-[520px]">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Welcome
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
                Access your workspace
              </h2>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-200/70">
              <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => changeTab('login')}
                  className={`rounded-md px-4 py-3 text-sm font-semibold transition ${
                    activeTab === 'login'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => changeTab('register')}
                  className={`rounded-md px-4 py-3 text-sm font-semibold transition ${
                    activeTab === 'register'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Register
                </button>
              </div>

              <div className="p-5 sm:p-6">
                {error && (
                  <Alert
                    message={error}
                    type="error"
                    onClose={() => setError('')}
                  />
                )}

                {activeTab === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <Field
                      label="Email address"
                      type="email"
                      value={loginData.email}
                      onChange={(value) =>
                        setLoginData({...loginData, email: value})
                      }
                      icon={Mail}
                      placeholder="you@hospital.com"
                    />
                    <Field
                      label="Password"
                      type="password"
                      value={loginData.password}
                      onChange={(value) =>
                        setLoginData({...loginData, password: value})
                      }
                      icon={Lock}
                      placeholder="Enter your password"
                    />
                    <SubmitButton loading={loading} label="Login" />
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-5">
                    <Field
                      label="Full name"
                      value={registerData.name}
                      onChange={(value) =>
                        setRegisterData({...registerData, name: value})
                      }
                      icon={User}
                      placeholder="Your name"
                    />
                    <Field
                      label="Email address"
                      type="email"
                      value={registerData.email}
                      onChange={(value) =>
                        setRegisterData({...registerData, email: value})
                      }
                      icon={Mail}
                      placeholder="you@hospital.com"
                    />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field
                        label="Password"
                        type="password"
                        value={registerData.password}
                        onChange={(value) =>
                          setRegisterData({...registerData, password: value})
                        }
                        icon={Lock}
                        placeholder="6+ characters"
                      />
                      <Field
                        label="Phone"
                        value={registerData.phone}
                        onChange={(value) =>
                          setRegisterData({...registerData, phone: value})
                        }
                        icon={Phone}
                        placeholder="10 digit number"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Role
                        </label>
                        <div className="relative">
                          <Users
                            className="absolute left-3 top-3 text-slate-400"
                            size={20}
                          />
                          <select
                            value={registerData.role}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                role: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          >
                            <option value="staff">Staff</option>
                            <option value="doctor">Doctor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                      {registerData.role === 'doctor' && (
                        <Field
                          label="Department"
                          value={registerData.department}
                          onChange={(value) =>
                            setRegisterData({
                              ...registerData,
                              department: value,
                            })
                          }
                          icon={Stethoscope}
                          placeholder="Cardiology"
                        />
                      )}
                    </div>
                    <SubmitButton loading={loading} label="Create account" />
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  icon: Icon,
  type = 'text',
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-3 text-slate-400" size={20} />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          placeholder={placeholder}
          required
        />
      </div>
    </div>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
    >
      <span>{loading ? 'Please wait...' : label}</span>
      {!loading && <ArrowRight size={18} />}
    </button>
  );
}
