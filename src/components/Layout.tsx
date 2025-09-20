"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "New Entry",
      href: "/",
      icon: "✏️",
      description: "Log symptoms & events"
    },
    {
      name: "Timeline",
      href: "/timeline",
      icon: "📈",
      description: "View your history"
    },
    {
      name: "Manage Fields",
      href: "/field-types",
      icon: "⚙️",
      description: "Organize your data"
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      {/* Header */}
      <header className="bg-base-100/90 backdrop-blur-sm border-b border-base-300 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="navbar py-3">
            <div className="navbar-start">
              <Link href="/" className="flex items-center gap-3 text-xl font-bold">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white text-lg">
                  📊
                </div>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  SymptomTracker
                </span>
              </Link>
            </div>

            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal gap-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? "bg-primary text-primary-content shadow-lg"
                          : "hover:bg-base-200"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-xs opacity-70">{item.description}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="navbar-end">
              <div className="dropdown dropdown-end lg:hidden">
                <div tabIndex={0} role="button" className="btn btn-ghost">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <ul className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={isActive(item.href) ? "active" : ""}
                      >
                        <span>{item.icon}</span>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-base-200 border-t border-base-300 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-base-content/60">
              <p>Track your health patterns with ease</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-base-content/60">
              <span>Made with ❤️ using Next.js & DaisyUI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}