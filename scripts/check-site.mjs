import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const roots = ["dist", "."];
const routes = [
  "index.html", "about/index.html", "programs/index.html", "get-involved/index.html",
  "resources/index.html", "contact/index.html", "links/index.html", "privacy/index.html", "terms/index.html",
  "accessibility/index.html", "youth-safety/index.html", "404.html",
];
const errors = [];
const routePaths = new Set(routes.map((route) => route === "index.html" ? "/" : route === "404.html" ? "/404.html" : `/${route.replace(/index\.html$/, "")}`));

for (const root of roots) {
  const titles = new Map();
  const descriptions = new Map();
  for (const route of routes) {
    const file = join(root, route);
    if (!existsSync(file)) { errors.push(`${file} is missing`); continue; }
    const html = readFileSync(file, "utf8");
    if (html.includes("/email-signatures/")) errors.push(`${file} exposes the private email signature utility`);
    for (const expected of ["<title>", "name=\"description\"", "rel=\"canonical\"", "id=\"root\"", "<h1"]) {
      if (!html.includes(expected)) errors.push(`${file} is missing ${expected}`);
    }
    if (/__PAGE_|__CANONICAL_|__STRUCTURED_/.test(html)) errors.push(`${file} contains an unreplaced build token`);
    if (html.includes('/src/main.jsx')) errors.push(`${file} still references development source`);
    if (!/<html[^>]*lang="en-CA"/.test(html)) errors.push(`${file} is missing the Canadian English language declaration`);
    if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) errors.push(`${file} must contain exactly one h1`);
    if ((html.match(/<main(?:\s|>)/g) || []).length !== 1) errors.push(`${file} must contain exactly one main landmark`);
    if (/target="_blank"(?![^>]*rel="[^"]*noopener)/.test(html)) errors.push(`${file} has an unsafe new-tab link`);
    if (/<form(?:\s|>)/.test(html)) errors.push(`${file} contains a form even though the site uses direct contact links`);
    if (!/3140 Polo Place/i.test(html)) errors.push(`${file} must display the organization physical street address`);
    if (/Navio Journal|journal\.naviopathways\.com|\/opportunities\//i.test(html)) errors.push(`${file} contains superseded navigation or Journal content`);
    if (/PATHWAY MAP|Founder signal|class="founder-portrait"/i.test(html)) errors.push(`${file} contains a superseded decorative graphic`);
    if (/NPCC|Navio Pathways Case Competition|case competition|2026-11-15|November 15, 2026|Most popular program/i.test(html)) errors.push(`${file} contains superseded case-competition content`);
    if (/[\u2012-\u2015\u2212]/u.test(html)) errors.push(`${file} contains a non-ASCII dash; use a standard hyphen instead`);

    const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([\s\S]*?)"/i)?.[1];
    if (title) {
      if (titles.has(title)) errors.push(`${file} duplicates the title in ${titles.get(title)}`);
      titles.set(title, file);
    }
    if (description) {
      if (descriptions.has(description)) errors.push(`${file} duplicates the description in ${descriptions.get(description)}`);
      descriptions.set(description, file);
    }

    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      const localPath = href.split(/[?#]/, 1)[0];
      if (!localPath || localPath.startsWith("/assets/") || localPath === "/navio-favicon.svg" || routePaths.has(localPath)) continue;
      errors.push(`${file} links to missing local route ${localPath}`);
    }
  }
  for (const asset of ["assets/icon/navio-icon.png", "assets/images/navio-logo.png", "assets/images/navio-star-bg.png", "navio-favicon.svg", "google679ac1915f24aeb4.html", "sitemap.xml", "robots.txt", "CNAME", ".nojekyll"]) {
    if (!existsSync(join(root, asset))) errors.push(`${join(root, asset)} is missing`);
  }

  const home = readFileSync(join(root, "index.html"), "utf8");
  for (const expected of ["Navio Pathways", "Ontario incorporated not-for-profit", "1001662092", "Futures aren’t", "PATHWAY SEQUENCE", "Direction builds one useful step at a time", "Our mission", "What Navio does", "/programs/", "/about/", "/resources/", "/get-involved/", "/contact/"]) {
    if (!home.includes(expected)) errors.push(`${join(root, "index.html")} is missing organization identity content: ${expected}`);
  }
  if (/workbook|Career Clarity/i.test(home)) errors.push(`${join(root, "index.html")} contains superseded program content`);
  if (/Navio NEXT|Networking, Exploration, eXposure/i.test(home)) errors.push(`${join(root, "index.html")} promotes the annual conference instead of keeping the homepage mission-led`);

  const about = readFileSync(join(root, "about/index.html"), "utf8");
  if (!about.includes("Direction should come from experience, not guesswork.")) errors.push(`${join(root, "about/index.html")} is missing the founder perspective`);

  const programs = readFileSync(join(root, "programs/index.html"), "utf8");
  for (const expected of ["Navio NEXT", "Networking", "Exploration", "eXposure", "Transformation", "November 21, 2026", "10:00 AM", "4:00 PM", "Mississauga, Ontario", "To be announced", "Attendance", "Free", "Ontario secondary students", "Panels", "Q&amp;A", "Workshops", "university information", "Finance", "Entrepreneurship", "Hospitality", "Marketing", "Management", "Professionals", "Professors", "University students", "Request conference updates"]) {
    if (!programs.includes(expected)) errors.push(`${join(root, "programs/index.html")} is missing substantive Navio NEXT content: ${expected}`);
  }
  const programWords = programs.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  if (programWords < 350) errors.push(`${join(root, "programs/index.html")} is too thin at ${programWords} rendered words`);

  const signatureRoot = join(root, "email-signatures");
  for (const filename of ["index.html", "style.css", "script.js"]) {
    if (!existsSync(join(signatureRoot, filename))) errors.push(`${join(signatureRoot, filename)} is missing`);
  }
  if (existsSync(join(signatureRoot, "index.html"))) {
    const signaturePage = readFileSync(join(signatureRoot, "index.html"), "utf8");
    for (const expected of ["Navio Email Signature Generator", "noindex, nofollow", "id=\"full-name\"", "id=\"role\"", "Generate Signature", "./script.js"]) {
      if (!signaturePage.includes(expected)) errors.push(`${join(signatureRoot, "index.html")} is missing ${expected}`);
    }
  }
  if (existsSync(join(signatureRoot, "script.js"))) {
    const signatureScript = readFileSync(join(signatureRoot, "script.js"), "utf8");
    for (const expected of ["const ROLES", "escapeHtml", "window.open", "document.write", "https://naviopathways.com", "https://www.linkedin.com/company/navio-pathways/", "https://www.instagram.com/naviopathways/"]) {
      if (!signatureScript.includes(expected)) errors.push(`${join(signatureRoot, "script.js")} is missing ${expected}`);
    }
  }
  const execPage = join(root, "exec/index.html");
  if (!existsSync(execPage)) errors.push(`${execPage} is missing`);
  else {
    const html = readFileSync(execPage, "utf8");
    for (const expected of ["Executive tools, in one place.", "Navio executive workspace", "/email-signatures/", "noindex, follow"]) {
      if (!html.includes(expected)) errors.push(`${execPage} is missing ${expected}`);
    }
  }
  const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
  if (sitemap.includes("email-signatures") || sitemap.includes("/exec/")) errors.push(`${join(root, "sitemap.xml")} exposes a private utility`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Static checks passed for ${routes.length} routes in dist and the GitHub Pages root.`);
