const NAVIO_CLIENT_ID = "83200696643-5s4mukedu7n1kco61m9jpc012lnphp94.apps.googleusercontent.com";
const NAVIO_DOMAIN = "naviopathways.com";
const CEO_EMAIL = "sahil.ambegaonkar@naviopathways.com";
const CEO_CC_EMAIL = "parnish.kaur@naviopathways.com";
const LEADERSHIP_CHANNEL_EMAIL_PROPERTY = "LEADERSHIP_CHANNEL_EMAIL";
const SHEET_PROPERTY = "VOLUNTEER_HOURS_SHEET_ID";
const SHEET_NAME = "Volunteer hour requests";
const TASK_SPREADSHEET_ID = "12S4KAEl7x1OhQZZKZuv7UcrWLDO11NSIOSql1t1NUDU";
const TASK_SHEET_NAME = "Tasks";
const HEADERS = [
  "Request ID", "Submitted", "Applicant name", "Applicant email", "Date completed",
  "Start time", "End time", "Hours", "Task description", "Additional notes",
    "Status", "Approval token", "Decision date", "Signature requested from", "School form", "Task ID", "Task title",
];

function doPost(event) {
  try {
    if (!event || event.parameter.action !== "submit") throw new Error("Unsupported request.");
    const identity = verifyWorkspaceIdentity_(event.parameter.idToken);
    const request = validateRequest_(event.parameter, identity);
    const sheet = getRequestSheet_();
    sheet.appendRow([
      request.id, new Date(), request.name, request.email, request.date,
      request.startTime, request.endTime, request.hours, request.description, request.notes,
      "Pending", request.approvalToken, "", request.signatureRequestedFrom, request.schoolFormUrl, request.taskId, request.taskTitle,
    ]);
    sendApplicantConfirmation_(request);
    sendCeoReview_(request);
    sendLeadershipNotification_(request);
    return json_({ ok: true, requestId: request.id });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: String(error.message || error) });
  }
}

function doGet(event) {
  try {
    const action = String(event?.parameter?.action || "").toLowerCase();
    if (action === "task") {
      const identity = verifyWorkspaceIdentity_(event.parameter.idToken);
      const task = lookupTask_(event.parameter.taskId, identity.email);
      const callback = /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(String(event.parameter.callback || "")) ? String(event.parameter.callback) : "";
      const result = { ok: true, taskId: task.taskId, title: task.title, description: task.description };
      return callback ? ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ");").setMimeType(ContentService.MimeType.JAVASCRIPT) : json_(result);
    }
    const token = String(event?.parameter?.token || "");
    if (!["approve", "reject"].includes(action) || !token) throw new Error("This decision link is invalid.");

    const sheet = getRequestSheet_();
    const rows = sheet.getDataRange().getValues();
    const rowIndex = rows.findIndex((row, index) => index > 0 && String(row[11]) === token);
    if (rowIndex < 1) throw new Error("This request could not be found.");

    const row = rows[rowIndex];
    if (row[10] !== "Pending") return decisionPage_("Already reviewed", `Request ${escapeHtml_(row[0])} is already marked ${escapeHtml_(row[10])}.`);

    const status = action === "approve" ? "Approved" : "Not approved";
    sheet.getRange(rowIndex + 1, 11).setValue(status);
    sheet.getRange(rowIndex + 1, 13).setValue(new Date());
    sendApplicantDecision_({
      id: String(row[0]),
      name: String(row[2]),
      email: String(row[3]),
      date: formatDate_(row[4]),
      hours: Number(row[7]).toFixed(2),
      taskId: String(row[15] || ""),
      taskTitle: String(row[16] || ""),
      description: String(row[8]),
      status,
    });
    return decisionPage_(`${status}: ${row[0]}`, action === "approve"
      ? "The hours were approved and the applicant has been emailed with next steps."
      : "The request was marked not approved and the applicant has been notified.");
  } catch (error) {
    console.error(error);
    if (String(event?.parameter?.action || "").toLowerCase() === "task") {
      const callback = /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(String(event?.parameter?.callback || "")) ? String(event.parameter.callback) : "";
      const result = { ok: false, error: String(error.message || error) };
      return callback ? ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ");").setMimeType(ContentService.MimeType.JAVASCRIPT) : json_(result);
    }
    return decisionPage_("Unable to record decision", String(error.message || error), true);
  }
}

function verifyWorkspaceIdentity_(idToken) {
  if (!idToken) throw new Error("A valid Google Workspace session is required.");
  const response = UrlFetchApp.fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) throw new Error("The Google session could not be verified.");
  const claims = JSON.parse(response.getContentText());
  const email = String(claims.email || "").toLowerCase();
  const verified = claims.aud === NAVIO_CLIENT_ID
    && claims.hd === NAVIO_DOMAIN
    && String(claims.email_verified) === "true"
    && email.endsWith(`@${NAVIO_DOMAIN}`)
    && Number(claims.exp) * 1000 > Date.now();
  if (!verified) throw new Error("Only verified Navio Pathways Workspace accounts can submit requests.");
  return { name: String(claims.name || email.split("@")[0]), email };
}

function validateRequest_(parameters, identity) {
  const date = String(parameters.date || "");
  const startTime = String(parameters.startTime || "");
  const endTime = String(parameters.endTime || "");
  const taskId = String(parameters.taskId || "").trim();
  const notes = String(parameters.notes || "").trim();
  const signatureRequestedFrom = String(parameters.signatureRequestedFrom || "CEO").trim();
  if (String(parameters.confirmed || "") !== "true") throw new Error("Confirm that the request is complete and accurate.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Enter a valid completion date.");
  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) throw new Error("Enter valid start and end times.");
  if (!/^\d+$/.test(taskId)) throw new Error("Enter a numeric Task ID.");
  if (!["CEO", "CEVP", "CEO and CEVP"].includes(signatureRequestedFrom)) throw new Error("Choose a valid signature recipient.");

  const fileName = String(parameters.fileName || "").trim();
  const fileType = String(parameters.fileType || "").trim();
  const fileData = String(parameters.fileData || "").trim();
  if (fileData && (!fileName || fileData.length > 7 * 1024 * 1024)) throw new Error("The school form is missing or too large.");

  const completed = new Date(`${date}T12:00:00`);
  const today = Utilities.formatDate(new Date(), "America/Toronto", "yyyy-MM-dd");
  if (Number.isNaN(completed.getTime()) || date > today) throw new Error("Hours cannot be requested for a future date.");
  const startMinutes = timeToMinutes_(startTime);
  const endMinutes = timeToMinutes_(endTime);
  const duration = endMinutes - startMinutes;
  if (duration <= 0 || duration > 960) throw new Error("The time range must be between 1 minute and 16 hours.");

  const task = lookupTask_(taskId, identity.email);

  const schoolForm = fileData ? saveSchoolForm_(fileName, fileType, fileData) : null;
  return {
    id: `NVH-${Utilities.formatDate(new Date(), "America/Toronto", "yyyyMMdd")}-${Utilities.getUuid().slice(0, 8).toUpperCase()}`,
    approvalToken: Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, ""),
    name: identity.name,
    email: identity.email,
    date,
    startTime,
    endTime,
    hours: duration / 60,
    taskId: task.taskId,
    taskTitle: task.title,
    description: task.description,
    notes,
    signatureRequestedFrom,
    schoolFormUrl: schoolForm ? schoolForm.url : "",
    schoolFormBlob: schoolForm ? schoolForm.blob : null,
  };
}

function lookupTask_(taskId, email) {
  const normalizedTaskId = String(taskId || "").trim();
  const taskSheet = SpreadsheetApp.openById(TASK_SPREADSHEET_ID).getSheetByName(TASK_SHEET_NAME);
  if (!taskSheet) throw new Error("The task list is unavailable right now.");
  const values = taskSheet.getDataRange().getDisplayValues();
  if (values.length < 2) throw new Error("Task ID not found. Check the number and try again.");
  const headers = values[0].map((header) => String(header).trim().toLowerCase());
  const idIndex = headers.indexOf("task id");
  const titleIndex = headers.indexOf("task title");
  const descriptionIndex = headers.indexOf("description");
  const responsibleIndex = headers.indexOf("responsible email(s)");
  const statusIndex = headers.indexOf("status");
  if ([idIndex, titleIndex, descriptionIndex, responsibleIndex, statusIndex].some((index) => index < 0)) throw new Error("The task list columns are not configured correctly.");
  const row = values.slice(1).find((candidate) => String(candidate[idIndex]).trim() === normalizedTaskId);
  if (!row) throw new Error("Task ID not found. Check the number and try again.");
  const responsibleEmails = String(row[responsibleIndex]).toLowerCase().split(/[,;\n]+/).map((value) => value.trim()).filter(Boolean);
  if (!responsibleEmails.includes(String(email).toLowerCase())) throw new Error("This task is not assigned to your signed-in Navio email.");
  if (String(row[statusIndex]).trim().toLowerCase() !== "complete") throw new Error("This task is not marked Complete yet. Only completed tasks can be submitted.");
  return { taskId: normalizedTaskId, title: String(row[titleIndex]).trim(), description: String(row[descriptionIndex]).trim() };
}

function saveSchoolForm_(fileName, fileType, fileData) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "school-signature-form";
  const bytes = Utilities.base64Decode(fileData);
  if (bytes.length > 5 * 1024 * 1024) throw new Error("The school form must be 5 MB or smaller.");
  const blob = Utilities.newBlob(bytes, fileType || "application/octet-stream", safeName);
  const file = DriveApp.createFile(blob);
  return { blob, url: file.getUrl() };
}

function getRequestSheet_() {
  const properties = PropertiesService.getScriptProperties();
  let spreadsheetId = properties.getProperty(SHEET_PROPERTY);
  let spreadsheet;
  if (!spreadsheetId) {
    spreadsheet = SpreadsheetApp.create("Navio Pathways Volunteer Hours");
    spreadsheetId = spreadsheet.getId();
    properties.setProperty(SHEET_PROPERTY, spreadsheetId);
  } else {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  }
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#523d57").setFontColor("#ffffff");
  } else if (sheet.getLastColumn() < HEADERS.length) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#523d57").setFontColor("#ffffff");
  }
  return sheet;
}

function sendApplicantConfirmation_(request) {
  const subject = `Volunteer hours request received - ${request.id}`;
  const body = `Hi ${request.name},\n\nYour volunteer-hours request has been received and sent to Sahil Ambegaonkar for review.\n\nRequest: ${request.id}\nDate completed: ${request.date}\nTime: ${request.startTime} - ${request.endTime}\nHours requested: ${request.hours.toFixed(2)}\nTask ID: ${request.taskId}\nTask title: ${request.taskTitle}\nTask description: ${request.description}\n\nYou will receive another email when a decision is recorded. No further action is needed right now.\n\nNavio Pathways`;
  MailApp.sendEmail({ to: request.email, subject, body, name: "Navio Pathways", attachments: request.schoolFormBlob ? [request.schoolFormBlob] : [] });
}

function sendCeoReview_(request) {
  const serviceUrl = ScriptApp.getService().getUrl();
  if (!serviceUrl) throw new Error("Deploy this Apps Script as a web app before accepting requests.");
  const approveUrl = `${serviceUrl}?action=approve&token=${encodeURIComponent(request.approvalToken)}`;
  const rejectUrl = `${serviceUrl}?action=reject&token=${encodeURIComponent(request.approvalToken)}`;
  const subject = `Approval needed: ${request.name} - ${request.hours.toFixed(2)} volunteer hours`;
  const formLine = request.schoolFormUrl ? `School form: ${request.schoolFormUrl}` : "School form: None attached";
  const body = `A volunteer-hours request needs review.\n\nApplicant: ${request.name} <${request.email}>\nRequest: ${request.id}\nDate completed: ${request.date}\nTime: ${request.startTime} - ${request.endTime}\nHours: ${request.hours.toFixed(2)}\nTask ID: ${request.taskId}\nTask title: ${request.taskTitle}\nTask description: ${request.description}\nNotes: ${request.notes || "None"}\nSignature requested from: ${request.signatureRequestedFrom}\n${formLine}\n\nApprove: ${approveUrl}\nNot approve: ${rejectUrl}`;
  const htmlBody = `<p>A volunteer-hours request needs review.</p><table cellpadding="6" cellspacing="0" style="border-collapse:collapse"><tr><td><strong>Applicant</strong></td><td>${escapeHtml_(request.name)} &lt;${escapeHtml_(request.email)}&gt;</td></tr><tr><td><strong>Request</strong></td><td>${escapeHtml_(request.id)}</td></tr><tr><td><strong>Date</strong></td><td>${escapeHtml_(request.date)}</td></tr><tr><td><strong>Time</strong></td><td>${escapeHtml_(request.startTime)} - ${escapeHtml_(request.endTime)} (${request.hours.toFixed(2)} hours)</td></tr><tr><td><strong>Task ID</strong></td><td>${escapeHtml_(request.taskId)}</td></tr><tr><td><strong>Task title</strong></td><td>${escapeHtml_(request.taskTitle)}</td></tr><tr><td><strong>Task description</strong></td><td>${escapeHtml_(request.description)}</td></tr><tr><td><strong>Notes</strong></td><td>${escapeHtml_(request.notes || "None")}</td></tr><tr><td><strong>Signature requested from</strong></td><td>${escapeHtml_(request.signatureRequestedFrom)}</td></tr></table><p>${request.schoolFormBlob ? "The requested school form is attached." : "No school form was attached."}</p><p><a href="${approveUrl}" style="display:inline-block;padding:12px 18px;background:#8c3880;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Approve hours</a>&nbsp;&nbsp;<a href="${rejectUrl}" style="display:inline-block;padding:12px 18px;border:1px solid #777;color:#333;text-decoration:none;border-radius:8px;font-weight:bold">Do not approve</a></p>`;
  MailApp.sendEmail({ to: CEO_EMAIL, cc: CEO_CC_EMAIL, subject, body, htmlBody, name: "Navio Pathways Hours", attachments: request.schoolFormBlob ? [request.schoolFormBlob] : [] });
}

function sendLeadershipNotification_(request) {
  const leadershipChannelEmail = PropertiesService.getScriptProperties().getProperty(LEADERSHIP_CHANNEL_EMAIL_PROPERTY);
  if (!leadershipChannelEmail) throw new Error("The leadership Slack channel email is not configured.");
  const subject = `Volunteer hours request: ${request.name} - ${request.hours.toFixed(2)} hours`;
  const body = `New volunteer-hours request for leadership review.\n\nApplicant: ${request.name} <${request.email}>\nRequest: ${request.id}\nDate: ${request.date}\nTime: ${request.startTime} - ${request.endTime}\nHours: ${request.hours.toFixed(2)}\nTask ID: ${request.taskId}\nTask title: ${request.taskTitle}\nTask description: ${request.description}\nNotes: ${request.notes || "None"}\nSignature requested from: ${request.signatureRequestedFrom}\n\nThe full approval email has been sent to Sahil with Parnish CC'd.`;
  MailApp.sendEmail({ to: leadershipChannelEmail, subject, body, name: "Navio Pathways Hours", attachments: request.schoolFormBlob ? [request.schoolFormBlob] : [] });
}

function sendApplicantDecision_(request) {
  const approved = request.status === "Approved";
  const subject = `${request.status}: volunteer hours request ${request.id}`;
  const nextSteps = approved
    ? "Your approved hours are now recorded in the Navio Pathways volunteer-hours ledger. Keep this email for your records. If you need an official verification letter or notice an error, reply to this email or contact hello@naviopathways.com."
    : "These hours were not approved. Reply to the reviewer or contact hello@naviopathways.com if details should be corrected before you submit a new request.";
  const body = `Hi ${request.name},\n\nYour volunteer-hours request has been ${approved ? "approved" : "reviewed and not approved"}.\n\nRequest: ${request.id}\nDate completed: ${request.date}\nHours: ${request.hours}\nTask ID: ${request.taskId}\nTask title: ${request.taskTitle}\nTask description: ${request.description}\n\nNext steps:\n${nextSteps}\n\nNavio Pathways`;
  MailApp.sendEmail({ to: request.email, subject, body, name: "Navio Pathways" });
}

function timeToMinutes_(value) {
  const parts = value.split(":").map(Number);
  return parts[0] * 60 + parts[1];
}

function formatDate_(value) {
  return value instanceof Date ? Utilities.formatDate(value, "America/Toronto", "yyyy-MM-dd") : String(value);
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function decisionPage_(title, message, error) {
  const accent = error ? "#f28da6" : "#bf66ad";
  return HtmlService.createHtmlOutput(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml_(title)}</title></head><body style="margin:0;background:#383842;color:#fff;font-family:Arial,sans-serif"><main style="max-width:620px;margin:12vh auto;padding:42px;border:1px solid rgba(255,255,255,.2);border-radius:24px;background:#3d3b47"><p style="color:${accent};font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">Navio Pathways</p><h1 style="font-size:42px;line-height:1.05">${escapeHtml_(title)}</h1><p style="color:rgba(255,255,255,.75);font-size:17px;line-height:1.6">${escapeHtml_(message)}</p></main></body></html>`);
}

function escapeHtml_(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
  });
}
