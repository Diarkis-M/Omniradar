import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Omniradar | GCPL Beauty Intelligence',
  description: '9-source beauty & grooming trend intelligence for Godrej Consumer Products',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500;1,9..144,700&family=Inter+Tight:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper text-ink font-body text-sm antialiased">
        <Sidebar />
        <main className="ml-[240px] min-h-screen">
          <div className="max-w-content mx-auto px-10 py-12">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
