import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main style={{ padding: '1.5rem', maxWidth: 640, margin: '0 auto' }}>
      <h1>About</h1>
      <p>SmartKhata Phase 1 — MERN foundation.</p>
      <Link to="/">← Home</Link>
    </main>
  );
}
