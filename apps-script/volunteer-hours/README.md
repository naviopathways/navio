# Volunteer-hours approval service

This Google Apps Script service receives authenticated requests from `naviopathways.com/exec/volunteer-hours/`, records them in a private Google Sheet, emails the applicant, sends approval links to the CEO, and emails the final decision to the applicant.

## Deploy once from the Navio Workspace

1. Sign in to `script.google.com` as the Navio account that should own the private hours ledger and send the emails.
2. Create a new Apps Script project named `Navio Volunteer Hours`.
3. Replace `Code.gs` with this folder's `Code.gs`. In Project Settings, enable the manifest file and replace it with `appsscript.json`.
4. Choose **Deploy > New deployment > Web app**.
5. Set **Execute as** to **Me** and **Who has access** to **Anyone**. Requests are still restricted because the script cryptographically verifies the submitted Google ID token, audience, Workspace domain, email verification, and expiry.
6. Authorize the requested Sheets, email, and external-request permissions.
7. Copy the `/exec` web-app URL into `site/public/exec-config.js` as `volunteerHoursEndpoint`.
8. Run the site build and publish the generated root files.

The first valid request automatically creates a private spreadsheet named `Navio Pathways Volunteer Hours` in the script owner's Drive.
