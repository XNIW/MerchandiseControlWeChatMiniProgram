# Active task

## WMP-001 — Repository foundation, governance and GitHub bootstrap

- Status: `EXECUTION`
- Parent: `WECHAT-001`
- Owner: `CODEX`
- Opened: `2026-08-12`

### Context and objective

Create the local/public GitHub repository, autonomous governance, workflow, Master Plan, task ledgers, security foundation, and safe repository configuration. End at most in `REVIEW`, never `DONE`.

### Dependencies and required reading

- WECHAT-001 and mandatory WMP-001 addendum.
- Governance conventions in Admin Web, Android, and iOS repositories.
- `AGENTS.md`, `CLAUDE.md`, `README.md`, and `docs/MASTER_PLAN.md` in this repository.

### In scope

- Exactly one bootstrap commit on `main` and one initial push to `XNIW/MerchandiseControlWeChatMiniProgram`.
- Governance/documentation/security configuration only; no application feature implementation.
- A local `codex/wechat-001-mini-program` branch after bootstrap.

### Out of scope

Application code, live WeChat configuration/tests, PR, merge, deploy, publication, production, license invention, or further feature commits/pushes.

### Acceptance criteria and checks

- [ ] Required governance, workflow, ledgers, history, worklog, security, and `.gitignore` exist and have valid links.
- [ ] Remote is public, default branch is `main`, and initial commit contains only bootstrap files.
- [ ] Secret scan, `git diff --check`, `git status --short`, log/branch/remote/ls-remote checks pass.
- [ ] Feature branch exists locally and is separate.
- [ ] Existing repositories receive no commit/push and out-of-scope repositories are unchanged.

### Evidence, risks, and next step

Evidence belongs in `docs/AI_WORKLOG.md` and the final WECHAT-001 report. Primary risk is accidental inclusion of feature code or sensitive configuration; mitigate with explicit staging and staged-diff inspection. Next step after REVIEW handoff: WMP-002 only after the WECHAT-001 decision gate.
