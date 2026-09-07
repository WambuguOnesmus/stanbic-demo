/**
 * =============================================================================
 * ⚠️  DELIBERATELY VULNERABLE — GHAS DEMONSTRATION FILE  ⚠️
 * =============================================================================
 * This module intentionally contains insecure patterns (DOM-based XSS and
 * command injection) so that CodeQL's `security-and-quality` suite raises
 * alerts on the pull request, and GitHub Copilot Autofix can demonstrate
 * one-click remediation in the GitHub UI.
 *
 * DO NOT copy these patterns into production code. The secure implementations
 * are shown in comments beside each finding.
 * =============================================================================
 */

import { exec } from "node:child_process";

export interface AuditEvent {
  action: string;
  detail: string;
  timestamp?: string;
}

/**
 * Renders an audit trail entry into the on-screen activity feed.
 *
 * ❌ VULNERABILITY 1 — DOM-based Cross-Site Scripting (CWE-79):
 * `event.detail` may contain user-controlled text (e.g. a payment reference)
 * and is interpolated directly into innerHTML without encoding.
 * CodeQL rule: js/xss-through-dom
 *
 * ✅ Copilot Autofix expected remediation: use textContent / createElement,
 * or encode with a vetted sanitizer before insertion.
 */
export function renderAuditEntry(container: HTMLElement, event: AuditEvent): void {
  const stamp = event.timestamp ?? new Date().toISOString();
  // eslint-disable-next-line no-unsanitized/property
  container.innerHTML +=
    `<div class="audit-row"><strong>${event.action}</strong>: ${event.detail} <em>${stamp}</em></div>`;
}

/**
 * Archives the audit log for a given business date by shelling out to the
 * platform archival tool.
 *
 * ❌ VULNERABILITY 2 — Command Injection (CWE-78):
 * `businessDate` flows from request input into a shell command string.
 * A value like `2026-09-07; rm -rf /var/audit` executes arbitrary commands.
 * CodeQL rule: js/command-line-injection
 *
 * ✅ Copilot Autofix expected remediation: use execFile with an argument
 * array (no shell), and validate the date against /^\d{4}-\d{2}-\d{2}$/.
 */
export function archiveAuditLog(businessDate: string, callback: (err: Error | null) => void): void {
  exec(`audit-archiver --date ${businessDate} --out /var/audit/archive`, (err) => {
    callback(err);
  });
}

/**
 * ✅ SECURE reference implementation kept for the demo talk track:
 * structured, PII-free audit logging.
 */
export function logAuditEvent(event: AuditEvent): void {
  const safeEvent = {
    action: event.action,
    // Never log account numbers, balances, or beneficiary details.
    detail: event.detail.slice(0, 256),
    timestamp: event.timestamp ?? new Date().toISOString(),
  };
  console.info(JSON.stringify({ type: "audit", ...safeEvent }));
}
