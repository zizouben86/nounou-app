import './globals.css';

export const metadata = {
  title: 'NounouHome — La garde d\'enfants réinventée',
  description: 'Trouvez la nounou idéale près de chez vous. Profils vérifiés, réservation simple, paiement sécurisé.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-cream text-gray-800 antialiased no-overflow relative">
        {children}
      </body>
    </html>
  );
}