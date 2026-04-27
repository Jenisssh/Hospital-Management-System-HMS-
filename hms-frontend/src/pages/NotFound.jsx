import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

export default function NotFound() {
  return (
    <div className="min-h-full flex items-center justify-center p-12 aurora-radial">
      <div className="text-center">
        <div className="text-7xl font-bold tracking-tight bg-aurora bg-clip-text text-transparent">404</div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-ink-muted">The page you're looking for doesn't exist.</p>
        <Link to="/" className="inline-block mt-6">
          <Button variant="gradient">Go home</Button>
        </Link>
      </div>
    </div>
  );
}
