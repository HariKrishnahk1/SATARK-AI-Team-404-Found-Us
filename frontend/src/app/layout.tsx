import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { StartupVideoModal } from '../components/StartupVideoModal';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SATARK AI - System for Automated Tracking, AI-assisted Routing & Knowledge-driven Action',
  description: 'Smart India Hackathon 2026 PS26043 - A Pan-India digital platform to crowdsource societal challenges and facilitate collaborative problem solving through universities and industry partnerships.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        {/* Instant pre-hydration script: prevents 1-second flash of main page before startup video */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  localStorage.removeItem('satark_startup_video_played');
                  var played = sessionStorage.getItem('satark_v2_played');
                  if (!played) {
                    document.documentElement.classList.add('satark-startup-active');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <SocketProvider>
            {/* Global Singleton Startup Video Modal */}
            <StartupVideoModal portalName="SATARK AI Unified Platform" />
            <div id="app-content-root" className="min-h-screen flex flex-col flex-grow">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
