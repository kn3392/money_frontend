import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import * as tagService from '../services/tagService.js';
import TagManager from '../components/tags/TagManager.jsx';

export default function Tags() {
  const { t } = useLanguage();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await tagService.listTags();
      setTags(rows);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4">
          <Link to="/dashboard" className="rounded-lg p-2 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">{t('tags')}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        {error && (
          <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {loading ? (
          <Loader2 className="mx-auto block h-10 w-10 animate-spin text-slate-400" />
        ) : (
          <TagManager
            tags={tags}
            submitting={submitting}
            onCreate={async (payload) => {
              setSubmitting(true);
              try {
                await tagService.createTag(payload);
                await load();
              } catch (e) {
                setError(e.message || 'Failed');
              } finally {
                setSubmitting(false);
              }
            }}
            onUpdate={async (id, payload) => {
              await tagService.updateTag(id, payload);
              await load();
            }}
            onDelete={async (id) => {
              if (!window.confirm('Deactivate tag?')) return;
              await tagService.deleteTag(id);
              await load();
            }}
          />
        )}
      </main>
    </div>
  );
}
