import Link from "next/link";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (<div className="flex h-screen bg-gray-100">
    <aside className="w-64 bg-white border-r p-4 space-y-4">
      <h1 className="text-xl font-bold">🛡️ Admin</h1>
      <nav className="space-y-2">
        <Link href="/dashboard/orders" className="block p-2 rounded hover:bg-gray-100">📋 Ordini Live</Link>
        <Link href="/dashboard/menu" className="block p-2 rounded hover:bg-gray-100">🍽️ Menu</Link>
        <Link href="/dashboard/tables" className="block p-2 rounded hover:bg-gray-100">🪑 Tavoli</Link>
      </nav>
    </aside>
    <main className="flex-1 p-6 overflow-auto">{children}</main>
  </div>);
}
