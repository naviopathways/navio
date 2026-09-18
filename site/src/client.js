import "./styles.css";

document.documentElement.classList.add("js");

const header = document.querySelector(".site-header");
const toggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("mobile-menu");

let menuTrigger = null;
const setMenuOpen = (open, restoreFocus = false) => {
  if (!toggle || !menu) return;
  if (open) menuTrigger = document.activeElement;
  toggle.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.querySelector(".sr-only").textContent = `${open ? "Close" : "Open"} navigation menu`;
  menu.classList.toggle("is-open", open);
  menu.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("menu-open", open);
  if (open) window.requestAnimationFrame(() => menu.querySelector("a")?.focus());
  else if (restoreFocus && menuTrigger instanceof HTMLElement) menuTrigger.focus();
};

toggle?.addEventListener("click", () => {
  setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
});

menu?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  const menuIsOpen = toggle?.getAttribute("aria-expanded") === "true";
  if (event.key === "Escape" && menuIsOpen) setMenuOpen(false, true);
  if (event.key !== "Tab" || !menuIsOpen) return;
  const focusable = [toggle, ...menu.querySelectorAll("a")];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1080 && toggle?.getAttribute("aria-expanded") === "true") setMenuOpen(false);
}, { passive: true });

let headerFrame = 0;
const updateHeader = () => {
  headerFrame = 0;
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 16);
  const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(100, Math.max(0, (window.scrollY / scrollRange) * 100));
  header.style.setProperty("--scroll-progress", `${progress}%`);
};
const requestHeaderUpdate = () => {
  if (headerFrame) return;
  headerFrame = window.requestAnimationFrame(updateHeader);
};
updateHeader();
window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
window.addEventListener("resize", requestHeaderUpdate, { passive: true });

let letterOffset = 0;
document.querySelectorAll("[data-letter-reveal]").forEach((element) => {
  const label = element.textContent.trim();
  element.setAttribute("aria-label", label);
  element.textContent = "";
  label.split(" ").forEach((word, wordIndex, words) => {
    const wordWrap = document.createElement("span");
    wordWrap.className = "letter-word";
    wordWrap.setAttribute("aria-hidden", "true");
    [...word].forEach((character, index) => {
      const letter = document.createElement("span");
      letter.className = "letter-reveal";
      letter.style.setProperty("--letter-index", letterOffset + index);
      letter.textContent = character;
      wordWrap.appendChild(letter);
    });
    element.appendChild(wordWrap);
    if (wordIndex < words.length - 1) element.append(" ");
    letterOffset += word.length + 1;
  });
  letterOffset += 1;
});

const revealSelector = [
  ".mission-route li",
  ".identity-strip p",
  ".section-heading",
  ".outcome-grid article",
  ".support-grid > *",
  ".operating-model article",
  ".organization-facts div",
  ".organization-grid > *",
  ".story-grid > *",
  ".founder-grid > *",
  ".program-definition > .container > *",
  ".program-status-grid > *",
  ".next-meaning > span",
  ".format-path > li",
  ".business-lenses article",
  ".speaker-card",
  ".conference-details-grid > *",
  ".conference-facts div",
  ".involvement-card",
  ".collaboration-grid > *",
  ".message-recipe p",
  ".boundary-grid > *",
  ".resource-tool",
  ".resource-steps li",
  ".resource-checks li",
  ".pitch-sequence p",
  ".resource-next-grid > *",
  ".contact-primary",
  ".contact-topic-grid > a",
  ".social-layout > *",
  ".social-links a",
  ".policy-copy > *",
  ".contact-cta-grid > *",
  ".footer-grid > div",
  ".footer-bottom",
].join(",");

const revealItems = [...document.querySelectorAll(revealSelector)];
const revealVariants = ["reveal-rise", "reveal-left", "reveal-right", "reveal-bloom"];
const finishReveal = (item) => {
  item.classList.remove("reveal-item", "is-visible", ...revealVariants);
  item.style.removeProperty("--reveal-delay");
};
const showReveal = (item, immediate = false) => {
  item.classList.add("is-visible");
  if (immediate) {
    finishReveal(item);
    return;
  }
  const delay = Number.parseInt(item.style.getPropertyValue("--reveal-delay"), 10) || 0;
  window.setTimeout(() => finishReveal(item), 1450 + delay);
};
const revealAll = () => revealItems.forEach((item) => showReveal(item, true));

revealItems.forEach((item, index) => {
  item.classList.add("reveal-item", revealVariants[index % revealVariants.length]);
  item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 85}ms`);
});

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
  revealAll();
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      showReveal(entry.target);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -7%" });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const caseVisual = document.querySelector(".case-visual");
if (caseVisual && !reducedMotion.matches) {
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let animationFrame = 0;

  const renderCaseMotion = () => {
    currentX += (targetX - currentX) * 0.075;
    currentY += (targetY - currentY) * 0.075;
    caseVisual.style.setProperty("--tilt-x", `${currentX * 3.2}deg`);
    caseVisual.style.setProperty("--tilt-y", `${currentY * -2.6}deg`);
    caseVisual.style.setProperty("--glow-x", `${68 + currentX * 19}%`);
    caseVisual.style.setProperty("--glow-y", `${28 + currentY * 17}%`);

    if (Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) {
      animationFrame = window.requestAnimationFrame(renderCaseMotion);
    } else {
      animationFrame = 0;
    }
  };

  const requestCaseMotion = () => {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(renderCaseMotion);
  };

  caseVisual.addEventListener("pointermove", (event) => {
    const bounds = caseVisual.getBoundingClientRect();
    targetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
    targetY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
    requestCaseMotion();
  });

  caseVisual.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
    requestCaseMotion();
  });
}

const measurementId = window.NAVIO_CONFIG?.analyticsMeasurementId?.trim();
if (/^G-[A-Z0-9]+$/.test(measurementId || "")) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args) => window.dataLayer.push(args);
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { anonymize_ip: true });
  const analyticsScript = document.createElement("script");
  analyticsScript.async = true;
  analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(analyticsScript);
}

const execGate = document.querySelector("#exec-access-gate");
if (execGate) {
  const execDashboard = document.querySelector("#exec-dashboard");
  const execError = document.querySelector("#exec-access-error");
  const execGoogleButton = document.querySelector("#exec-google-signin");
  const execAccountMenu = document.querySelector("#exec-account-menu");
  const execAccountTrigger = document.querySelector("#exec-account-trigger");
  const execAccountPopover = document.querySelector("#exec-account-popover");
  const execAccountAvatar = document.querySelector("#exec-account-avatar");
  const execAccountInitials = document.querySelector("#exec-account-initials");
  const execAccountName = document.querySelector("#exec-account-name");
  const execAccountEmail = document.querySelector("#exec-account-email");
  const execSignOut = document.querySelector("#exec-sign-out");
  const hoursForm = document.querySelector("#volunteer-hours-form");
  const hoursApplicantName = document.querySelector("#hours-applicant-name");
  const hoursApplicantEmail = document.querySelector("#hours-applicant-email");
  const hoursDate = document.querySelector("#hours-date");
  const hoursStart = document.querySelector("#hours-start");
  const hoursEnd = document.querySelector("#hours-end");
  const hoursTotal = document.querySelector("#hours-total");
  const hoursSubmit = document.querySelector("#hours-submit");
  const hoursStatus = document.querySelector("#hours-status");
  const hoursToolStatus = document.querySelector("#hours-tool-status");
  const execClientId = "83200696643-5s4mukedu7n1kco61m9jpc012lnphp94.apps.googleusercontent.com";
  const execDomain = "naviopathways.com";
  const execStorageKey = "navio-exec-account";
  const execTokenStorageKey = "navio-exec-id-token";
  const volunteerHoursEndpoint = String(window.NAVIO_EXEC_CONFIG?.volunteerHoursEndpoint || "").trim();
  const schoolFormInput = document.querySelector("#hours-school-form");
  if (hoursToolStatus && volunteerHoursEndpoint) hoursToolStatus.textContent = "Active tool";

  const readExecClaims = (credential) => {
    const payload = credential.split(".")[1];
    if (!payload) throw new Error("Missing Google credential payload");
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  };

  const validExecAccount = (account) => account?.hd === execDomain
    && String(account?.email || "").toLowerCase().endsWith(`@${execDomain}`)
    && Boolean(account?.sub);

  const readValidExecToken = () => {
    try {
      const token = sessionStorage.getItem(execTokenStorageKey) || "";
      const claims = readExecClaims(token);
      const valid = claims.aud === execClientId
        && claims.hd === execDomain
        && claims.email_verified === true
        && Number(claims.exp) * 1000 > Date.now();
      return valid ? token : "";
    } catch {
      return "";
    }
  };

  const execInitials = (name) => String(name || "Navio")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const closeExecAccountMenu = () => {
    execAccountPopover.hidden = true;
    execAccountTrigger.setAttribute("aria-expanded", "false");
  };

  const openExecDashboard = (account) => {
    const name = account.name || account.email?.split("@")[0] || "Navio account";
    execAccountName.textContent = name;
    execAccountEmail.textContent = account.email;
    execAccountInitials.textContent = execInitials(name);
    if (hoursApplicantName) hoursApplicantName.textContent = name;
    if (hoursApplicantEmail) hoursApplicantEmail.textContent = account.email;
    if (hoursDate) {
      const now = new Date();
      hoursDate.max = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    }
    if (account.picture?.startsWith("https://")) {
      execAccountAvatar.src = account.picture;
      execAccountAvatar.alt = `${name} profile picture`;
      execAccountAvatar.hidden = false;
      execAccountInitials.hidden = true;
    } else {
      execAccountAvatar.removeAttribute("src");
      execAccountAvatar.hidden = true;
      execAccountInitials.hidden = false;
    }
    execGate.hidden = true;
    execDashboard.hidden = false;
    execDashboard.focus?.({ preventScroll: true });
  };

  const saveExecAccount = (claims) => {
    const account = { name: String(claims.name || ""), email: String(claims.email || "").toLowerCase(), picture: String(claims.picture || ""), hd: String(claims.hd || ""), sub: String(claims.sub || "") };
    try { localStorage.setItem(execStorageKey, JSON.stringify(account)); } catch { /* Private browsing may block storage. */ }
    return account;
  };

  const renderExecButton = () => {
    if (!window.google?.accounts?.id) return;
    execGoogleButton.replaceChildren();
    window.google.accounts.id.renderButton(execGoogleButton, {
      type: "standard", theme: "filled_black", size: "large", text: "signin_with", shape: "pill", logo_alignment: "left",
      width: Math.min(360, Math.max(240, execGoogleButton.clientWidth || 320)),
    });
  };

  const initializeExecSignIn = () => {
    if (!window.google?.accounts?.id) {
      execError.textContent = "Google sign-in could not load. Check your connection and refresh the page.";
      return;
    }
    window.google.accounts.id.initialize({
      client_id: execClientId,
      hd: execDomain,
      auto_select: false,
      callback: (response) => {
        try {
          const claims = readExecClaims(response.credential);
          const account = { name: String(claims.name || ""), email: String(claims.email || "").toLowerCase(), picture: String(claims.picture || ""), hd: String(claims.hd || ""), sub: String(claims.sub || "") };
          const verified = claims.aud === execClientId && claims.email_verified === true && Number(claims.exp) * 1000 > Date.now() && validExecAccount(account);
          if (!verified) throw new Error("Unapproved account");
          execError.textContent = "";
          try { sessionStorage.setItem(execTokenStorageKey, response.credential); } catch { /* Session storage may be unavailable. */ }
          openExecDashboard(saveExecAccount(claims));
        } catch {
          execError.textContent = "Use a Google Workspace account managed by naviopathways.com.";
          window.google?.accounts?.id?.disableAutoSelect();
        }
      },
    });
    renderExecButton();
  };

  try {
    const savedAccount = JSON.parse(localStorage.getItem(execStorageKey));
    if (validExecAccount(savedAccount) && (!hoursForm || readValidExecToken())) openExecDashboard(savedAccount);
  } catch { /* The sign-in button remains available. */ }

  execAccountTrigger.addEventListener("click", () => {
    const shouldOpen = execAccountPopover.hidden;
    execAccountPopover.hidden = !shouldOpen;
    execAccountTrigger.setAttribute("aria-expanded", String(shouldOpen));
  });

  execAccountAvatar.addEventListener("error", () => {
    execAccountAvatar.hidden = true;
    execAccountInitials.hidden = false;
  });

  document.addEventListener("click", (event) => {
    if (!execAccountMenu.contains(event.target)) closeExecAccountMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !execAccountPopover.hidden) {
      closeExecAccountMenu();
      execAccountTrigger.focus();
    }
  });

  execSignOut.addEventListener("click", () => {
    try { localStorage.removeItem(execStorageKey); } catch { /* No storage to clear. */ }
    try { sessionStorage.removeItem(execTokenStorageKey); } catch { /* No session storage to clear. */ }
    execDashboard.hidden = true;
    execGate.hidden = false;
    closeExecAccountMenu();
    window.google?.accounts?.id?.disableAutoSelect();
    renderExecButton();
  });

  if (hoursForm) {
    const durationMinutes = () => {
      if (!hoursStart.value || !hoursEnd.value) return 0;
      const [startHour, startMinute] = hoursStart.value.split(":").map(Number);
      const [endHour, endMinute] = hoursEnd.value.split(":").map(Number);
      return (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    };

    const updateHoursTotal = () => {
      const minutes = durationMinutes();
      hoursTotal.textContent = minutes > 0 ? `${(minutes / 60).toFixed(2)} hours` : "0.00 hours";
    };

    hoursStart.addEventListener("input", updateHoursTotal);
    hoursEnd.addEventListener("input", updateHoursTotal);

    hoursForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      hoursStatus.className = "hours-status";
      hoursStatus.textContent = "";

      if (!hoursForm.reportValidity()) return;
      const minutes = durationMinutes();
      if (minutes <= 0 || minutes > 960) {
        hoursStatus.classList.add("is-error");
        hoursStatus.textContent = "Enter a time range between 1 minute and 16 hours.";
        hoursEnd.focus();
        return;
      }
      if (!volunteerHoursEndpoint) {
        hoursStatus.classList.add("is-error");
        hoursStatus.textContent = "The approval service still needs its deployment URL before requests can be sent.";
        return;
      }

      const idToken = readValidExecToken();
      if (!idToken) {
        hoursStatus.classList.add("is-error");
        hoursStatus.textContent = "Your secure session expired. Return to Executive Tools and sign in again.";
        return;
      }

      const formData = new FormData(hoursForm);
      const schoolForm = schoolFormInput?.files?.[0] || null;
      if (schoolForm && schoolForm.size > 5 * 1024 * 1024) {
        hoursStatus.classList.add("is-error");
        hoursStatus.textContent = "The school form must be 5 MB or smaller.";
        schoolFormInput.focus();
        return;
      }
      let schoolFormData = { fileName: "", fileType: "", fileData: "" };
      try {
        if (schoolForm) {
          schoolFormData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({
              fileName: schoolForm.name,
              fileType: schoolForm.type || "application/octet-stream",
              fileData: String(reader.result || "").split(",")[1] || "",
            });
            reader.onerror = () => reject(new Error("The school form could not be read."));
            reader.readAsDataURL(schoolForm);
          });
        }
      } catch (error) {
        hoursStatus.classList.add("is-error");
        hoursStatus.textContent = error.message || "The school form could not be read.";
        return;
      }
      const payload = new URLSearchParams({
        action: "submit",
        idToken,
        date: String(formData.get("date") || ""),
        startTime: String(formData.get("startTime") || ""),
        endTime: String(formData.get("endTime") || ""),
        description: String(formData.get("description") || "").trim(),
        notes: String(formData.get("notes") || "").trim(),
        fileName: schoolFormData.fileName,
        fileType: schoolFormData.fileType,
        fileData: schoolFormData.fileData,
        confirmed: "true",
      });

      hoursSubmit.disabled = true;
      hoursSubmit.querySelector("span:first-child").textContent = "Submitting request";
      hoursStatus.textContent = "Sending your request securely...";
      try {
        await fetch(volunteerHoursEndpoint, { method: "POST", mode: "no-cors", body: payload });
        hoursForm.reset();
        updateHoursTotal();
        hoursStatus.classList.add("is-success");
        hoursStatus.textContent = "Request sent. Check your Navio inbox for the confirmation email.";
      } catch {
        hoursStatus.classList.add("is-error");
        hoursStatus.textContent = "The request could not be sent. Check your connection and try again.";
      } finally {
        hoursSubmit.disabled = false;
        hoursSubmit.querySelector("span:first-child").textContent = "Submit for approval";
      }
    });
  }

  const googleScript = document.createElement("script");
  googleScript.src = "https://accounts.google.com/gsi/client";
  googleScript.async = true;
  googleScript.defer = true;
  googleScript.addEventListener("load", initializeExecSignIn, { once: true });
  googleScript.addEventListener("error", () => { execError.textContent = "Google sign-in could not load. Check your connection and refresh the page."; }, { once: true });
  document.head.append(googleScript);
}
