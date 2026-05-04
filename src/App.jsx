import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Categories from './pages/Categories';
import DailyLedger from './pages/DailyLedger';
import PersonLedger from './pages/PersonLedger';
import RecurringTransactions from './pages/RecurringTransactions.jsx';
import ExportBackup from './pages/ExportBackup.jsx';
import Search from './pages/Search.jsx';
import Budget from './pages/Budget.jsx';
import SavingsGoals from './pages/SavingsGoals.jsx';
import Loans from './pages/Loans.jsx';
import InterestBook from './pages/InterestBook.jsx';
import Tags from './pages/Tags.jsx';
import Notifications from './pages/Notifications.jsx';
import AdvancedReports from './pages/AdvancedReports.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import { istTodayDateKey } from './utils/istDate.js';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts"
        element={
          <ProtectedRoute>
            <Accounts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ledger"
        element={
          <ProtectedRoute>
            <Navigate to={`/ledger/${istTodayDateKey()}`} replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ledger/:date"
        element={
          <ProtectedRoute>
            <DailyLedger />
          </ProtectedRoute>
        }
      />
      <Route
        path="/persons"
        element={
          <ProtectedRoute>
            <PersonLedger />
          </ProtectedRoute>
        }
      />
      <Route
        path="/persons/:id"
        element={
          <ProtectedRoute>
            <PersonLedger />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recurring"
        element={
          <ProtectedRoute>
            <RecurringTransactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/export-backup"
        element={
          <ProtectedRoute>
            <ExportBackup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>
        }
      />
      <Route
        path="/budgets"
        element={
          <ProtectedRoute>
            <Budget />
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <ProtectedRoute>
            <SavingsGoals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loans"
        element={
          <ProtectedRoute>
            <Loans />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interest-book"
        element={
          <ProtectedRoute>
            <InterestBook />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tags"
        element={
          <ProtectedRoute>
            <Tags />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/advanced-reports"
        element={
          <ProtectedRoute>
            <AdvancedReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute>
            <AuditLogs />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
