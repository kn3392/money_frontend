import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function TagManager({ tags, onCreate, onUpdate, onDelete, submitting }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [editing, setEditing] = useState(null);

  async function handleCreate(e) {
    e.preventDefault();
    await onCreate({ name: name.trim(), color: color.trim() || undefined });
    setName('');
    setColor('');
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="min-w-[10rem] flex-1">
          <label className="text-xs font-medium text-slate-600">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="ટૅગ / tag"
          />
        </div>
        <div className="w-28">
          <label className="text-xs font-medium text-slate-600">Color</label>
          <input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="#hex"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {t('save')}
        </button>
      </form>

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
        {tags.map((tag) => (
          <li key={tag._id} className="flex items-center justify-between gap-2 px-4 py-3">
            {editing === tag._id ? (
              <form
                className="flex flex-1 flex-wrap items-center gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  await onUpdate(tag._id, {
                    name: fd.get('name'),
                    color: fd.get('color') || '',
                  });
                  setEditing(null);
                }}
              >
                <input
                  name="name"
                  defaultValue={tag.name}
                  className="rounded border px-2 py-1 text-sm"
                />
                <input
                  name="color"
                  defaultValue={tag.color}
                  className="w-24 rounded border px-2 py-1 text-sm"
                />
                <button type="submit" className="text-xs font-medium text-emerald-700">
                  OK
                </button>
                <button type="button" onClick={() => setEditing(null)} className="text-xs">
                  {t('cancel')}
                </button>
              </form>
            ) : (
              <>
                <span className="font-medium text-slate-900">{tag.name}</span>
                <span className="text-xs text-slate-500">{tag.color}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(tag._id)}
                    className="rounded-lg p-2 hover:bg-slate-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(tag._id)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
