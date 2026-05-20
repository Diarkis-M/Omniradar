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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500;1,9..144,700&family=Inter+Tight:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper text-ink font-body text-sm antialiased">
        <Sidebar />
        {/* Desktop: offset by sidebar width. Mobile: full-width with top bar offset */}
        <main className="main-content">
          <div className="main-inner">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
