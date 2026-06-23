"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  FileSearch,
  HandHeart,
  Heart,
  MessageCircle,
  Sprout,
} from "lucide-react";
import { tools } from "@/lib/tools";

const icons = [MessageCircle, ClipboardList, FileSearch, HandHeart];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="portal-shell">
      <header className="topbar no-print">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <Sprout size={22} />
          </span>
          <span>PDA Family Tools</span>
          <span className="tagline">Practical tools. Real relief.</span>
        </Link>
        <nav className="topnav" aria-label="Main navigation">
          <Link href="/#tools">Tools</Link>
          <Link href="/about">About</Link>
          <Link href="/migration-inventory">Migration</Link>
          <Link className="donate-link" href="/donate">
            <Heart size={16} /> Donate
          </Link>
        </nav>
      </header>
      <div className="layout">
        <aside className="sidebar no-print">
          <p className="sidebar-label">Tools</p>
          <nav className="side-nav" aria-label="Tool navigation">
            {tools.map((tool, index) => {
              const Icon = icons[index] ?? ClipboardList;
              const active = pathname === tool.href || pathname.startsWith(`${tool.href}/`);
              return (
                <Link
                  className={`side-link ${active ? "active" : ""}`}
                  href={tool.href}
                  key={tool.href}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{tool.title}</span>
                </Link>
              );
            })}
          </nav>
          <div className="sidebar-note">
            <strong>Your privacy matters.</strong>
            <br />
            Support Sheet Builder runs in your browser for this MVP. No account
            or server-side child profile storage.
          </div>
        </aside>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer no-print">
      <span>PDA Family Tools is donation-supported and free to use.</span>
      <nav className="footer-links" aria-label="Resource links">
        <a href="https://www.pdasociety.org.uk/" rel="noreferrer" target="_blank">
          PDA Society
        </a>
        <a
          href="https://www.pdasociety.org.uk/what-helps-guides/"
          rel="noreferrer"
          target="_blank"
        >
          What helps guides
        </a>
        <a
          href="https://www.autism.org.uk/advice-and-guidance/behaviour/demand-avoidance"
          rel="noreferrer"
          target="_blank"
        >
          Demand avoidance guidance
        </a>
        <a href="https://pdanorthamerica.org/" rel="noreferrer" target="_blank">
          PDA North America
        </a>
      </nav>
    </footer>
  );
}
