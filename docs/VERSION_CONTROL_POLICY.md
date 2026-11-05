# Backup and version control policy — Phase 8 onward

Approved by the project representative on 2026-11-05. This policy applies starting with Phase 8. It supersedes automatic phase-ZIP requirements for future work; completed phases retain their historical delivery and backup arrangements.

1. Develop directly in the existing `Aunt-s-Portfolio` project folder.
2. Use Git commits to track and preserve development changes. Review the staged files and exclude credentials, environment secrets, private client files, private uploads and sensitive database backups before committing.
3. After a development phase is successfully verified, create a Git phase tag identifying its verified commit. Document the verification and any accepted limitations before tagging; do not tag incomplete work as complete.
4. Push completed work and phase tags to the configured private GitHub repository. Verify the intended remote, private visibility and available access before pushing; do not assume that a configured URL alone establishes privacy. Do not change repository visibility to enable a push. If access or private visibility cannot be verified, preserve the local commits/tags and report what remains pending.
5. Continue maintaining `AGENTS.md`, `PROJECT_STATUS.md`, `DECISIONS.md`, handoff information and the relevant phase verification reports.
6. Preserve the existing dedicated MariaDB recovery environment, scoped configuration, recovery evidence and preservation copies. Maintain separate, verified database backups outside source control. Git commits and tags do not back up database records or private media.
7. Do not commit credentials, environment secrets, private files or database backups containing sensitive information. Keep the existing ignore/exclusion protections; review new files as well as tracked changes.
8. Do not automatically generate a ZIP after a development phase. Generate a complete project ZIP only when explicitly requested or during final project handover, retaining the existing secret/private-file exclusions and verification requirements.
9. Do not delete previously created phase ZIP archives without permission.
10. Do not modify previously completed phases solely to change their backup arrangements. This policy does not authorize starting Phase 8, retroactive phase commits/tags, database recovery changes or deletion/replacement of existing archives.

The repository currently has an `origin` remote configured. Its private visibility and push access were not verified as part of this documentation-only policy update. Existing uncommitted Phase 7 implementation changes remain preserved; no commit, tag, push or archive operation is implied by recording this future policy.
