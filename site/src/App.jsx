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

function ExecGate({ description = "Sign in with your Navio Pathways Google Workspace account to access executive tools and internal utilities." }) {
  return (
    <section className="exec-gate" id="exec-access-gate" aria-labelledby="exec-access-title">
      <div className="exec-gate-panel">
        <a className="exec-brand" href="/" aria-label="Navio Pathways home"><span className="brand-wordmark" aria-hidden="true" /></a>
        <p className="eyebrow">Restricted workspace</p>
        <h1 id="exec-access-title">Executive tools, in one place.</h1>
        <p>{description}</p>
        <div className="exec-google-auth">
          <div id="exec-google-signin" aria-label="Sign in with Google" />
          <p className="exec-access-error" id="exec-access-error" role="alert" aria-live="polite" />
        </div>
        <p className="exec-gate-note">Only naviopathways.com accounts can continue.</p>
      </div>
    </section>
  );
}

function ExecHeader() {
  return (
    <header className="exec-header">
      <a className="exec-brand" href="/exec/" aria-label="Executive tools home"><span className="brand-wordmark" aria-hidden="true" /></a>
      <div className="exec-account-menu" id="exec-account-menu">
        <button className="exec-account-trigger" id="exec-account-trigger" type="button" aria-label="Open account menu" aria-expanded="false" aria-controls="exec-account-popover">
          <img id="exec-account-avatar" alt="" referrerPolicy="no-referrer" hidden />
          <span id="exec-account-initials" aria-hidden="true">N</span>
        </button>
        <div className="exec-account-popover" id="exec-account-popover" hidden>
          <p>Signed in as</p>
          <strong id="exec-account-name">Navio account</strong>
          <span id="exec-account-email">account@naviopathways.com</span>
          <button className="exec-sign-out" id="exec-sign-out" type="button">Sign out <span aria-hidden="true">↗</span></button>
        </div>
      </div>
    </header>
  );
}

function ExecPortal() {
  return (
    <main className="exec-portal exec-auth-page" id="main-content">
      <ExecGate />

      <section className="exec-shell" id="exec-dashboard" aria-labelledby="exec-title" hidden>
        <ExecHeader />

        <div className="exec-intro">
          <h1 id="exec-title">Executive Tools</h1>
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
          <a className="exec-tool-card exec-tool-hours" href="/exec/volunteer-hours/">
            <div className="exec-tool-top"><span>02</span><small id="hours-tool-status">Setup required</small></div>
            <div>
              <p className="eyebrow">Operations</p>
              <h2>Volunteer hour tracking</h2>
              <p>Submit completed volunteer work for review and receive an email when the request is approved.</p>
            </div>
            <strong>Request hours <span aria-hidden="true">↗</span></strong>
          </a>
        </section>
      </section>
    </main>
  );
}

function VolunteerHoursPage() {
  return (
    <main className="exec-portal exec-auth-page exec-hours-page" id="main-content">
      <ExecGate description="Sign in with your Navio Pathways Google Workspace account to submit volunteer hours for approval." />
      <section className="exec-shell exec-hours-shell" id="exec-dashboard" aria-labelledby="hours-title" hidden>
        <ExecHeader />
        <div className="hours-intro">
          <a className="hours-back" href="/exec/"><span aria-hidden="true">←</span> Executive Tools</a>
          <p className="eyebrow">Volunteer hour tracking</p>
          <h1 id="hours-title">Request hours for approval.</h1>
          <p>Record completed work accurately. You’ll receive email confirmations as the request moves through review.</p>
        </div>

        <div className="hours-layout">
          <form className="hours-form" id="volunteer-hours-form" noValidate>
            <div className="hours-form-heading"><span>01</span><div><h2>Work details</h2><p>All fields marked required must describe work you have already completed.</p></div></div>
            <div className="hours-applicant">
              <div><small>Applicant</small><strong id="hours-applicant-name">Navio executive</strong></div>
              <div><small>Workspace email</small><strong id="hours-applicant-email">account@naviopathways.com</strong></div>
            </div>
            <div className="hours-fields-two">
              <div className="hours-field"><label htmlFor="hours-date">Date completed</label><input id="hours-date" name="date" type="date" required /></div>
              <div className="hours-field"><label htmlFor="hours-total">Calculated hours</label><output className="hours-total-output" id="hours-total" htmlFor="hours-start hours-end">0.00 hours</output></div>
            </div>
            <div className="hours-fields-two">
              <div className="hours-field"><label htmlFor="hours-start">Start time</label><input id="hours-start" name="startTime" type="time" required /></div>
              <div className="hours-field"><label htmlFor="hours-end">End time</label><input id="hours-end" name="endTime" type="time" required /></div>
            </div>
            <div className="hours-fields-two">
              <div className="hours-field"><label htmlFor="hours-task-id">Task ID</label><input id="hours-task-id" name="taskId" type="number" min="1" step="1" inputMode="numeric" placeholder="Enter the assigned Task ID" required /><p className="hours-task-status" id="hours-task-status" role="status" aria-live="polite" /></div>
              <div className="hours-field"><label htmlFor="hours-task-title">Task title</label><output className="hours-task-title-output" id="hours-task-title" htmlFor="hours-task-id">Enter a Task ID to load the assigned task.</output></div>
            </div>
            <div className="hours-field"><label htmlFor="hours-task-description">Task description</label><output id="hours-task-description" htmlFor="hours-task-id">—</output></div>
            <div className="hours-field"><label htmlFor="hours-notes">Additional notes <span>Optional</span></label><textarea id="hours-notes" name="notes" rows="3" maxLength="1000" placeholder="Add a project name, event, supervisor, or other useful context." /></div>
            <div className="hours-field"><label htmlFor="hours-school-form">School form <span>Optional</span></label><input id="hours-school-form" name="schoolForm" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" /><small>Upload the form that needs an executive signature. PDF, Word, or image; 5 MB maximum.</small></div>
            <label className="hours-confirm"><input id="hours-confirm" name="confirmed" type="checkbox" required /><span>I confirm this request is complete and accurate.</span></label>
            <button className="hours-submit" id="hours-submit" type="submit"><span>Submit for approval</span><span aria-hidden="true">↗</span></button>
            <p className="hours-status" id="hours-status" role="status" aria-live="polite" />
          </form>

          <aside className="hours-process" aria-labelledby="process-title">
            <p className="eyebrow">What happens next</p>
            <h2 id="process-title">A clear review trail.</h2>
            <ol>
              <li><span>01</span><div><strong>Request received</strong><p>A confirmation is sent to your Navio email.</p></div></li>
              <li><span>02</span><div><strong>Leadership review</strong><p>The leadership team receives the request and any attached school form.</p></div></li>
              <li><span>03</span><div><strong>Decision recorded</strong><p>You receive the approval decision and next steps by email.</p></div></li>
            </ol>
          </aside>
        </div>
      </section>
    </main>
  );
}

export function App({ path = "/" }) {
  const normalizedPath = normalizePath(path);
  const page = getPage(normalizedPath);
  if (normalizedPath === "/links/") return <LinkPage />;
  if (normalizedPath === "/exec/") return <ExecPortal />;
  if (normalizedPath === "/exec/volunteer-hours/") return <VolunteerHoursPage />;
  return <><Header path={normalizedPath} /><PageContent page={page} /><Footer /></>;
}
