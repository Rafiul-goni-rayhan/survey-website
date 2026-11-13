import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Student Information Survey",
  description: "A simple online student information survey with an admin dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
