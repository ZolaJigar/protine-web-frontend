import { AdminProvider } from '@/context/AdminContext';

export const metadata = {
  title: 'Admin — Protine Web',
};

export default function AdminLayout({ children }) {
  return <AdminProvider>{children}</AdminProvider>;
}
