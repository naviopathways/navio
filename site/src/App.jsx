import React, { useMemo } from "react";
import { pageContent } from "./page-content.js";

const email = "hello@naviopathways.com";
const instagram = "https://www.instagram.com/naviopathways/";
const primaryNav = [
  { label: "About", href: "/about/" },
  { label: "Programs", href: "/programs/" },
  { label: "Resources", href: "/resources/" },
  { label: "Get involved", href: "/get-involved/" },
  { label: "Contact", href: "/contact/" },
];
const exploreLinks = [
  ["About", "/about/"],
  ["Programs", "/programs/"],
  ["Resources", "/resources/"],
  ["Get involved", "/get-involved/"],
  ["Contact", "/contact/"],
];
const policyLinks = [
  ["Privacy", "/privacy/"],
  ["Terms", "/terms/"],
  ["Accessibility", "/accessibility/"],
  ["Youth safety", "/youth-safety/"],
];

const normalizePath = (path) => {
  if (!path) return "/";
  if (path === "/404.html") return path;
  return path === "/" || path.endsWith("/") ? path : `${path}/`;
};

const getPage = (path) => pageContent[normalizePath(path)] || pageContent["/404.html"];

function Brand({ footer = false }) {
  return (
    <a className={`brand${footer ? " brand-footer" : ""}`} href="/" aria-label="Navio Pathways home">
      <span className="brand-wordmark" aria-hidden="true" />
    </a>
  );
}

function Header({ path }) {
  const activeHref = primaryNav.find(({ href }) => path.startsWith(href))?.href;
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Primary navigation">
            {primaryNav.map(({ label, href }) => <a key={href} href={href} aria-current={activeHref === href ? "page" : undefined}>{label}</a>)}
          </nav>
          <div className="header-actions">
            <button className="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu">
              <span className="sr-only">Open navigation menu</span>
              <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="mobile-menu" id="mobile-menu" aria-hidden="true">
          <div className="mobile-menu-inner">
            <p className="mobile-menu-kicker">Choose a direction</p>
            <nav aria-label="Mobile navigation">
            {primaryNav.map(({ label, href }, index) => (
              <a key={`${label}-${href}`} href={href} aria-current={activeHref === href ? "page" : undefined}>
                <span className="mobile-menu-index" aria-hidden="true">0{index + 1}</span>
                <span className="mobile-menu-copy"><strong>{label}</strong></span>
                <span className="mobile-menu-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
            </nav>
            <div className="mobile-menu-meta">
              <p>Ontario incorporated not-for-profit</p>
              <a href={`mailto:${email}`}>{email}</a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

function LinkList({ links }) {
  return <ul>{links.map(([label, href]) => <li key={href}><a href={href}>{label}</a></li>)}</ul>;
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-intro">
          <Brand footer />
          <p>Helping high school students explore careers, opportunities, experiences, and informed next steps.</p>
          <p className="legal-name"><strong>Navio Pathways</strong><br />Ontario incorporated not-for-profit organization<br />Corporation Number 1001662092<br />3140 Polo Place<br />Mississauga, Ontario, Canada</p>
        </div>
        <div><h2>Navigate</h2><LinkList links={exploreLinks} /></div>
        <div><h2>Contact</h2><ul className="footer-contact-links"><li><a href={`mailto:${email}`}>{email}</a></li><li><a href={instagram} target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a></li></ul></div>
        <div><h2>Policies</h2><LinkList links={policyLinks} /></div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Navio Pathways. All rights reserved.</p>
        <p>Navio Pathways is not presented as a registered charity and does not advertise tax-deductible donations or charitable receipts.</p>
      </div>
    </footer>
  );
}

function PageContent({ page }) {
  const html = useMemo(() => ({ __html: page.html }), [page.html]);
  return <main id="main-content" tabIndex="-1" dangerouslySetInnerHTML={html} />;
}

function LinkPage() {
  return (
    <main className="links-page" id="main-content">
      <div className="links-shell">
        <a className="links-brand" href="/" aria-label="Navio Pathways home">
          <span className="brand-wordmark" aria-hidden="true" />
        </a>
        <h1>Official Navio Pathways links</h1>
        <p className="links-intro">Learn about the organization, explore its programs, and connect directly.</p>
        <a className="button button-primary links-button" href="/programs/">
          <span>Explore programs</span>
          <span aria-hidden="true">→</span>
        </a>
        <a className="button button-secondary links-button" href="https://naviopathways.com/">
          <span>Main site</span>
          <span aria-hidden="true">↗</span>
        </a>
        <a className="button button-secondary links-button" href="mailto:hello@naviopathways.com">
          <span>Contact Navio Pathways</span>
          <span aria-hidden="true">→</span>
        </a>
        <a className="button button-secondary links-button" href="https://www.instagram.com/naviopathways/" target="_blank" rel="noopener noreferrer">
          <span>Instagram</span>
          <span aria-hidden="true">↗</span>
        </a>
        <p className="links-note">Official organization contact: hello@naviopathways.com<br />3140 Polo Place, Mississauga, Ontario, Canada</p>
      </div>
    </main>
  );
}

function ExecPortal() {
  return (
    <main className="exec-portal" id="main-content">
      <section className="exec-gate" id="exec-access-gate" aria-labelledby="exec-access-title">
        <div className="exec-gate-panel">
          <a className="exec-brand" href="/" aria-label="Navio Pathways home"><span className="brand-wordmark" aria-hidden="true" /></a>
          <p className="eyebrow">Restricted workspace</p>
          <h1 id="exec-access-title">Executive tools, in one place.</h1>
          <p>Sign in with your Navio Pathways Google Workspace account to access executive tools and internal utilities.</p>
          <div className="exec-google-auth">
            <div id="exec-google-signin" aria-label="Sign in with Google" />
            <p className="exec-access-error" id="exec-access-error" role="alert" aria-live="polite" />
          </div>
          <p className="exec-gate-note">Only naviopathways.com accounts can continue.</p>
        </div>
      </section>

      <section className="exec-shell" id="exec-dashboard" aria-labelledby="exec-title" hidden>
        <header className="exec-header">
          <a className="exec-brand" href="/" aria-label="Navio Pathways home"><span className="brand-wordmark" aria-hidden="true" /></a>
          <div className="exec-account">
            <span className="exec-account-dot" aria-hidden="true" />
            <span id="exec-account-email">Navio account</span>
            <button className="exec-sign-out" id="exec-sign-out" type="button">Sign out <span aria-hidden="true">↗</span></button>
          </div>
        </header>

        <div className="exec-intro">
          <div>
            <p className="eyebrow">Navio executive workspace</p>
            <h1 id="exec-title">The tools behind the work.</h1>
          </div>
          <p>Use these internal utilities to keep executive communications clear, consistent, and ready to send.</p>
        </div>

        <section className="exec-tools" aria-label="Executive tools">
          <a className="exec-tool-card" href="/email-signatures/">
            <div className="exec-tool-top"><span>01</span><small>Active tool</small></div>
            <div>
              <p className="eyebrow">Communications</p>
              <h2>Email signature generator</h2>
              <p>Create a standardized executive email signature with your name and approved Navio role.</p>
            </div>
            <strong>Open tool <span aria-hidden="true">↗</span></strong>
          </a>
          <div className="exec-ready-card">
            <span aria-hidden="true">✦</span>
            <p><strong>Built to grow.</strong> New executive tools can be added here as Navio needs them.</p>
          </div>
        </section>
      </section>
    </main>
  );
}

export function App({ path = "/" }) {
  const normalizedPath = normalizePath(path);
  const page = getPage(normalizedPath);
  if (normalizedPath === "/links/") return <LinkPage />;
  if (normalizedPath === "/exec/") return <ExecPortal />;
  return <><Header path={normalizedPath} /><PageContent page={page} /><Footer /></>;
}
