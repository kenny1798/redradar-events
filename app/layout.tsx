import './globals.css'

export const metadata = {
  title: {
    template: '%s | RedRadar Open Day',
    default: 'RedRadar Open Day | Jom Sertai Kami!',
  },
  description: 'Dapatkan semua maklumat terkini mengenai RedRadar Open Day, termasuk jadual acara, penceramah, dan cara pendaftaran. Jangan lepaskan peluang keemasan ini!',
  openGraph: {
    title: 'RedRadar Open Day | Jom Sertai Kami!',
    description: 'Semua maklumat terkini mengenai RedRadar Open Day di hujung jari anda.',
    // Nanti bila dah ada URL & gambar rasmi, boleh letak sini
    // url: 'https://redradar.events', 
    // images: [
    //   {
    //     url: '/og-image.png', // Contoh path gambar
    //     width: 1200,
    //     height: 630,
    //   },
    // ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
