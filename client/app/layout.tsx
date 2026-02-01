import "./globals.css";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <body >

        {/* <a href="/" className="z-[20px] relative">
          <button>ch</button>
        </a> */}

        {children}
      </body>
    </html>
  );
}