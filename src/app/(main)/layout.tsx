import Navbar from '@/components/layout/Navbar'
import AuthGuard from '@/components/auth/AuthGuard'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
