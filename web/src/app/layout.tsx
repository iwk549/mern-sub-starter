import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Navbar from "@/components/navbar";
import UserContextWrapper from "@/context/userContext/userContextWrapper";
import AppContextWrapper from "@/context/appContext/appContextWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mern App",
  description: "Template App For Subscriptions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppContextWrapper>
          <UserContextWrapper>
            <Navbar />
            {children}
            <footer className="py-4">
              <div className="container mx-auto text-center">
                <p className="text-sm">
                  &copy; {new Date().getFullYear()} StructureMate. All rights
                  reserved.
                </p>
              </div>
            </footer>
          </UserContextWrapper>
        </AppContextWrapper>
        <ToastContainer limit={1} />
      </body>
    </html>
  );
}
