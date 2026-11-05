# Seraphine's Portfolio Studio guide

## Sign in

Start the local website and open http://localhost:5173/login. Use your privately provided account. Replace a temporary password when asked, then sign in again. Never send your password to an assistant or put it into a project file.

No real accounts were created during development. The authorized maintainer can run `npm run auth:bootstrap -w backend` in their own interactive terminal, with hidden password entry, then create the owner account in Administrator access. Follow [the exact secure setup procedure](AUTHENTICATION.md#first-use-on-this-machine); the existing signing key already exists and must be preserved.

## Edit your portfolio

Choose My profile, Work experience, Education, Skills, Projects, Achievements or Certifications & training. Open Edit or Add. Fill in confirmed details using plain text. Leave unknown years empty. The required name and professional title stay fixed. A project's address is chosen when it is created and stays the same when its title changes.

Choose Save draft. A draft is private. **Saving changes to a published record removes its current public version until you publish it again.** If saving fails, your form remains available. If another editor changed the record, cancel/reload the latest record before applying your changes again. The website warns before a refresh or internal navigation with unsaved draft edits.

Use Preview to review the saved text and attachments privately. Confirm details are accurate with the form's verification checkbox. Unknown qualifications, provisional employment periods and missing project outcomes should remain drafts until confirmed.

Save or cancel before using the browser's Back/Forward buttons: those history actions currently bypass the unsaved-change prompt. Refresh and application navigation have prompts. Ordering arrows preserve the complete collection for up to 100 records; use the Display order field for larger collections or moves across page boundaries.

## Add images and documents

Open Media library. Choose one JPEG, PNG, WebP or PDF under 8 MB. Add a useful image description, then Upload file. Review it with View file. Choose Approve public use only when you have permission to publish it, including portrait likeness approval or certificate personal details.

Choose the portrait in My profile or a certificate document in Certifications & training. Attach project images using Edit / attach in the media library. Save media changes, review and approve the file again when necessary. Upload a new file to replace an old one; then detach and remove the old file. Shared/attached files cannot be removed until all content has been detached.

## Publish and update the website

1. Save your draft and preview it.
2. Confirm the details are accurate and any files are approved.
3. Choose Publish and read the confirmation.
4. For your profile, separately authorize email/phone only if you want the saved contacts displayed publicly. Editing the profile removes that permission and requires approval again.
5. Choose Update public website. Wait, then Check status until it says Synchronized. A failed update is shown honestly and can be retried. This updates the local website; third-party deployment has not been configured.

During development, refreshing the portfolio shows the published API data. Search-visible production pages need the website update. An out-of-date production page is blocked until updated. Use Unpublish to withdraw a record immediately, then update the website again. Content already downloaded by a visitor cannot be recalled.

Use the ↑/↓ buttons to arrange records on a page, or edit Display order for a chosen position. Lower numbers come first. Only genuine published sections appear on the portfolio; empty drafts do not create placeholders.

## Messages and settings

Messages contains real submissions saved privately by the contact form. Choose View message, Mark as read/unread or Archive. Remove asks for confirmation and permanently removes the stored message. No email is sent by the website. Messages remain until removed; an automatic retention policy still needs approval.

Portfolio settings lets you edit the public page title and description. Update the public website afterwards to refresh search/social metadata. Search indexing and the domain are controlled by the later launch process.

Use Account settings for your password and active sessions. Choose Sign out when finished.
