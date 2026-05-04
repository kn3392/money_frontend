import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IndianRupee,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function About() {
  const { t } = useLanguage();

  const features = [
    t('aboutF1'), t('aboutF2'), t('aboutF3'), t('aboutF4'),
    t('aboutF5'), t('aboutF6'), t('aboutF7'), t('aboutF8'),
    t('aboutF9'), t('aboutF10'),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link
            to="/"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <IndianRupee className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-900">SmartKhata</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('aboutTitle')}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            {t('aboutDesc')}
          </p>

          <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-5">
              {t('aboutFeatures')}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-sm text-slate-700">{f}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('backToHome')}
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm"
            >
              Get started free
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
