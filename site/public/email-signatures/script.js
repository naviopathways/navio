const ROLES = Object.freeze([
  "Chief Executive Officer",
  "Chief Executive Vice President",
  "Chief Operating Officer",
  "Chief Growth Officer",
  "Chief Financial Officer",
  "Chief Marketing Officer",
  "Chief Technology Officer",
]);

const GOOGLE_CLIENT_ID = "83200696643-5s4mukedu7n1kco61m9jpc012lnphp94.apps.googleusercontent.com";
const REQUIRED_DOMAIN = "naviopathways.com";
const SAVED_ACCOUNT_KEY = "navio-google-account";
const accessGate = document.querySelector("#access-gate");
const generatorShell = document.querySelector("#signature-generator");
const accessError = document.querySelector("#access-error");
const googleSignInButton = document.querySelector("#google-signin-button");
const accountMenu = document.querySelector("#account-menu");
const accountTrigger = document.querySelector("#account-trigger");
const accountPopover = document.querySelector("#account-popover");
const accountAvatar = document.querySelector("#account-avatar");
const accountInitials = document.querySelector("#account-initials");
const accountName = document.querySelector("#account-name");
const accountEmail = document.querySelector("#account-email");
const signOutButton = document.querySelector("#sign-out-button");

const form = document.querySelector("#signature-form");
const nameInput = document.querySelector("#full-name");
const roleSelect = document.querySelector("#role");
const nameError = document.querySelector("#name-error");
const roleError = document.querySelector("#role-error");
const formStatus = document.querySelector("#form-status");
const preview = document.querySelector("#signature-preview");

const initialsFor = (name) => String(name || "Navio")
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map((part) => part[0])
  .join("")
  .toUpperCase();

const showAccount = (account) => {
  accountName.textContent = account.name || "Navio account";
  accountEmail.textContent = account.email;
  accountInitials.textContent = initialsFor(account.name);
  if (!nameInput.value.trim() && account.name) nameInput.value = account.name;
  if (account.picture?.startsWith("https://")) {
    accountAvatar.src = account.picture;
    accountAvatar.alt = `${account.name || "Navio account"} profile picture`;
    accountAvatar.hidden = false;
    accountInitials.hidden = true;
  } else {
    accountAvatar.removeAttribute("src");
    accountAvatar.hidden = true;
    accountInitials.hidden = false;
  }
};

const saveAccount = (claims) => {
  const account = {
    name: String(claims.name || "Navio account"),
    email: String(claims.email || "").toLowerCase(),
    picture: String(claims.picture || ""),
    sub: String(claims.sub || ""),
    hd: String(claims.hd || ""),
  };
  try {
    localStorage.setItem(SAVED_ACCOUNT_KEY, JSON.stringify(account));
  } catch {
    // The utility still works when private browsing blocks local storage.
  }
  return account;
};

const readSavedAccount = () => {
  try {
    const account = JSON.parse(localStorage.getItem(SAVED_ACCOUNT_KEY));
    const validAccount = account?.hd === REQUIRED_DOMAIN
      && account?.email?.endsWith(`@${REQUIRED_DOMAIN}`)
      && Boolean(account?.sub);
    return validAccount ? account : null;
  } catch {
    return null;
  }
};

const openGenerator = (account) => {
  showAccount(account);
  accessGate.hidden = true;
  generatorShell.hidden = false;
  generatorShell.focus({ preventScroll: true });
  window.scrollTo(0, 0);
  window.requestAnimationFrame(() => window.scrollTo(0, 0));
};

const readGoogleClaims = (credential) => {
  const payload = credential.split(".")[1];
  if (!payload) throw new Error("Missing Google credential payload");
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return JSON.parse(atob(padded));
};

const handleGoogleCredential = (response) => {
  try {
    const claims = readGoogleClaims(response.credential);
    const email = String(claims.email || "").toLowerCase();
    const validAccount = claims.aud === GOOGLE_CLIENT_ID
      && claims.hd === REQUIRED_DOMAIN
      && claims.email_verified === true
      && email.endsWith(`@${REQUIRED_DOMAIN}`)
      && Number(claims.exp) * 1000 > Date.now();

    if (!validAccount) {
      accessError.textContent = "Use a Google Workspace account managed by naviopathways.com.";
      window.google.accounts.id.disableAutoSelect();
      return;
    }

    accessError.textContent = "";
    openGenerator(saveAccount(claims));
    updatePreview();
  } catch {
    accessError.textContent = "Google sign-in could not be verified. Please try again.";
  }
};

const renderGoogleButton = () => {
  if (!window.google?.accounts?.id) return;
  googleSignInButton.replaceChildren();
  window.google.accounts.id.renderButton(googleSignInButton, {
      type: "standard",
      theme: "filled_black",
      size: "large",
      text: "signin_with",
      shape: "pill",
      logo_alignment: "left",
      width: Math.min(360, Math.max(240, googleSignInButton.clientWidth || 320)),
  });
};

const initializeGoogleSignIn = () => {
  if (!window.google?.accounts?.id) {
    if (generatorShell.hidden) accessError.textContent = "Google sign-in could not load. Check your connection and refresh the page.";
    return;
  }

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    hd: REQUIRED_DOMAIN,
    auto_select: false,
  });
  if (generatorShell.hidden) renderGoogleButton();
};

const closeAccountMenu = () => {
  accountPopover.hidden = true;
  accountTrigger.setAttribute("aria-expanded", "false");
};

accountTrigger.addEventListener("click", () => {
  const shouldOpen = accountPopover.hidden;
  accountPopover.hidden = !shouldOpen;
  accountTrigger.setAttribute("aria-expanded", String(shouldOpen));
});

accountAvatar.addEventListener("error", () => {
  accountAvatar.hidden = true;
  accountInitials.hidden = false;
});

document.addEventListener("click", (event) => {
  if (!accountMenu.contains(event.target)) closeAccountMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAccountMenu();
    accountTrigger.focus();
  }
});

signOutButton.addEventListener("click", () => {
  try {
    localStorage.removeItem(SAVED_ACCOUNT_KEY);
  } catch {
    // There may be no available browser storage to clear.
  }
  closeAccountMenu();
  generatorShell.hidden = true;
  accessGate.hidden = false;
  window.google?.accounts?.id?.disableAutoSelect();
  renderGoogleButton();
  window.scrollTo(0, 0);
});

const savedAccount = readSavedAccount();
if (savedAccount) openGenerator(savedAccount);

window.addEventListener("load", initializeGoogleSignIn, { once: true });

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
})[character]);

const populateRoles = () => {
  const options = ROLES.map((role) => {
    const option = document.createElement("option");
    option.value = role;
    option.textContent = role;
    return option;
  });
  roleSelect.append(...options);
};

const signatureMarkup = (fullName, role) => `
<table cellpadding="0" cellspacing="0" border="0"
       style="font-family: Arial, Helvetica, sans-serif; color:#111111;">
  <tr>
    <td style="vertical-align:middle; padding-right:14px;">
      <img
        src="https://sqhil-a.github.io/navio/assets/email-signature.png"
        alt="Navio Pathways"
        width="100"
        style="display:block; width:100px; height:auto; border:0;"
      >
    </td>
    <td
      width="1"
      style="width:1px; background-color:#6257ff; font-size:1px; line-height:1px;"
    >
      &nbsp;
    </td>
    <td style="vertical-align:middle; padding-left:14px;">
      <div style="
        font-size:19px;
        line-height:22px;
        font-weight:700;
        color:#111111;
      ">${fullName}</div>
      <div style="
        margin-top:1px;
        font-size:12px;
        line-height:16px;
        font-weight:600;
        color:#6257ff;
      ">${role}</div>
      <div style="
        margin-top:3px;
        font-size:14.5px;
        line-height:17px;
        font-weight:700;
        color:#111111;
      ">Navio Pathways</div>
      <div style="
        margin-top:1px;
        font-size:8.5px;
        line-height:11.5px;
        font-weight:600;
        letter-spacing:0.9px;
        color:#777777;
        text-transform:uppercase;
      ">Guiding Youth. Shaping Futures.</div>
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top:5px;">
        <tr>
          <td style="padding-right:6px;">
            <a href="https://naviopathways.com" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
              <img
                src="https://sqhil-a.github.io/navio/assets/website.png"
                alt="Website"
                width="30"
                height="30"
                style="display:block; width:30px; height:30px; border:0;"
              >
            </a>
          </td>
          <td style="padding-right:6px;">
            <a href="https://www.linkedin.com/company/navio-pathways/" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
              <img
                src="https://sqhil-a.github.io/navio/assets/linkedin.png"
                alt="LinkedIn"
                width="30"
                height="30"
                style="display:block; width:30px; height:30px; border:0;"
              >
            </a>
          </td>
          <td>
            <a href="https://www.instagram.com/naviopathways/" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
              <img
                src="https://sqhil-a.github.io/navio/assets/instagram.png"
                alt="Instagram"
                width="30"
                height="30"
                style="display:block; width:30px; height:30px; border:0;"
              >
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

const standaloneDocument = (fullName, role) => `<!DOCTYPE html>
<html lang="en-CA">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta name="referrer" content="no-referrer">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https:; style-src 'unsafe-inline';">
  <title>${fullName} - Navio Pathways Email Signature</title>
</head>
<body style="margin:0; padding:24px; background:#ffffff;">
${signatureMarkup(fullName, role)}
</body>
</html>`;

const selectedRole = () => ROLES.includes(roleSelect.value) ? roleSelect.value : "";

const updatePreview = () => {
  const fullName = escapeHtml(nameInput.value.trim() || "Jane Smith");
  const role = escapeHtml(selectedRole() || "Navio Pathways Role");
  preview.srcdoc = standaloneDocument(fullName, role);
};

const clearValidation = () => {
  nameInput.removeAttribute("aria-invalid");
  roleSelect.removeAttribute("aria-invalid");
  nameError.textContent = "";
  roleError.textContent = "";
  formStatus.textContent = "";
};

const validate = () => {
  clearValidation();
  const fullName = nameInput.value.trim();
  const role = selectedRole();

  if (!fullName) {
    nameInput.setAttribute("aria-invalid", "true");
    nameError.textContent = "Enter your full name.";
  }

  if (!role) {
    roleSelect.setAttribute("aria-invalid", "true");
    roleError.textContent = "Select your Navio Pathways role.";
  }

  if (!fullName) nameInput.focus();
  else if (!role) roleSelect.focus();

  return fullName && role ? { fullName, role } : null;
};

const openSignature = ({ fullName, role }) => {
  const safeName = escapeHtml(fullName);
  const safeRole = escapeHtml(role);
  const documentHtml = standaloneDocument(safeName, safeRole);
  const signatureTab = window.open("", "_blank");

  if (signatureTab) {
    signatureTab.opener = null;
    signatureTab.document.open();
    signatureTab.document.write(documentHtml);
    signatureTab.document.close();
    formStatus.textContent = "Signature opened in a new tab.";
  } else {
    formStatus.textContent = "Allow popups for this page, then generate the signature again.";
  }
};

populateRoles();
updatePreview();

nameInput.addEventListener("input", () => {
  nameInput.removeAttribute("aria-invalid");
  nameError.textContent = "";
  updatePreview();
});

roleSelect.addEventListener("change", () => {
  roleSelect.removeAttribute("aria-invalid");
  roleError.textContent = "";
  updatePreview();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = validate();
  if (values) openSignature(values);
});
