/** Bug-hunting sandbox page: the fictional bank app, its specification, defect reports, reset and reveal. */

import { useState } from "react";
import { useStore } from "../state/store";
import type { SandboxReport } from "../types/state";
import {
  DEMO_PASS,
  DEMO_USER,
  addPayee,
  bankSpec,
  history,
  initialBank,
  login,
  sandboxDefects,
  transfer,
  type BankState,
} from "../sandbox/engine";

type Tab = "app" | "spec" | "reports";

export function SandboxPage() {
  const { state } = useStore();
  const [tab, setTab] = useState<Tab>("app");
  const [bank, setBank] = useState<BankState>(initialBank);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="fade-in">
      <div className="page-head">
        <h1>Northlake Sandbox Bank</h1>
        <p className="lede">
          A fictional retail bank with synthetic data and a small documented set of planted defects. Test against the
          <em> specification</em>, not your assumptions - some behaviour that looks wrong is exactly as specified.
          Login: <code>{DEMO_USER}</code> / <code>{DEMO_PASS}</code>
        </p>
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === "app"} className="tab" onClick={() => setTab("app")}>The app</button>
        <button role="tab" aria-selected={tab === "spec"} className="tab" onClick={() => setTab("spec")}>Specification</button>
        <button role="tab" aria-selected={tab === "reports"} className="tab" onClick={() => setTab("reports")}>
          My defect reports ({state.sandboxReports.length})
        </button>
      </div>

      {tab === "app" && <BankApp bank={bank} setBank={setBank} onReport={() => setTab("reports")} />}
      {tab === "spec" && <SpecView revealed={revealed} onReveal={() => setRevealed(true)} reports={state.sandboxReports} />}
      {tab === "reports" && <ReportsView />}
    </div>
  );
}

function BankApp({ bank, setBank, onReport }: { bank: BankState; setBank: (b: BankState) => void; onReport: () => void }) {
  const [screen, setScreen] = useState<"overview" | "payees" | "transfer" | "history">("overview");
  const [lastConfirmation, setLastConfirmation] = useState<ReturnType<typeof transfer>["confirmation"]>(undefined);
  const [loginError, setLoginError] = useState<string | null>(null);

  return (
    <div>
      <div className="bankapp">
        <div className="bankapp-head">
          <div className="bankapp-tabs" role="tablist" aria-label="Bank sections">
            {(["overview", "payees", "transfer", "history"] as const).map((s) => (
              <button
                key={s}
                role="tab"
                aria-selected={screen === s}
                className={screen === s ? "active" : ""}
                onClick={() => setScreen(s)}
                disabled={!bank.loggedIn}
              >
                {s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="row">
            {bank.loggedIn && (
              <span className="chip" title={`Failed logins this session: ${bank.failedLogins}`}>
                signed in: {DEMO_USER}
              </span>
            )}
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                setBank(initialBank());
                setLastConfirmation(undefined);
                setLoginError(null);
              }}
            >
              Reset sandbox
            </button>
          </div>
        </div>
        <div className="bankapp-body">
          {!bank.loggedIn ? (
            <LoginScreen bank={bank} setBank={setBank} error={loginError} setError={setLoginError} />
          ) : (
            <>
              {screen === "overview" && (
                <div>
                  <p className="muted small">Everyday account (synthetic)</p>
                  <p className="balance">{bank.balance.toFixed(2)} EUR</p>
                  <p className="small muted">
                    This sandbox is fictional. Data resets with the button above; nothing leaves your browser.
                  </p>
                </div>
              )}
              {screen === "payees" && <PayeesScreen bank={bank} setBank={setBank} />}
              {screen === "transfer" && (
                <TransferScreen
                  bank={bank}
                  setBank={setBank}
                  confirmation={lastConfirmation}
                  setConfirmation={setLastConfirmation}
                />
              )}
              {screen === "history" && <HistoryScreen bank={bank} />}
            </>
          )}
        </div>
      </div>
      <p className="small muted" style={{ marginTop: 10 }}>
        Found something that contradicts the <button type="button" className="btn btn-sm btn-ghost" onClick={onReport}>specification</button>? File a defect report in the reports tab.
      </p>
    </div>
  );
}

function LoginScreen({
  bank,
  setBank,
  error,
  setError,
}: {
  bank: BankState;
  setBank: (b: BankState) => void;
  error: string | null;
  setError: (e: string | null) => void;
}) {
  const [username, setUsername] = useState(DEMO_USER);
  const [password, setPassword] = useState("");
  return (
    <div style={{ maxWidth: 340 }}>
      <h2>Sign in</h2>
      <div className="field">
        <label htmlFor="sb-user">Username</label>
        <input id="sb-user" className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" />
      </div>
      <div className="field">
        <label htmlFor="sb-pass">Password</label>
        <input id="sb-pass" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" />
      </div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          const r = login(bank, username, password);
          setBank(r.state);
          setError(r.error ?? null);
        }}
      >
        Sign in
      </button>
      {error && <p className="chip chip-bad" style={{ marginTop: 10 }}>{error} (attempts: {bank.failedLogins})</p>}
      <p className="small muted" style={{ marginTop: 10 }}>
        Demo credentials: <code>{DEMO_USER}</code> / <code>{DEMO_PASS}</code>. Try wrong passwords too - testing negative paths is the point.
      </p>
    </div>
  );
}

function PayeesScreen({ bank, setBank }: { bank: BankState; setBank: (b: BankState) => void }) {
  const [nickname, setNickname] = useState("");
  const [account, setAccount] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div>
      <h2>Your payees</h2>
      {bank.payees.map((p) => (
        <div className="txrow" key={p.id}>
          <span>{p.nickname === "" ? <em className="muted">(empty nickname)</em> : p.nickname}</span>
          <span className="mono muted">****{p.accountNumber.slice(-4)} ({p.accountNumber})</span>
        </div>
      ))}
      <h3>Add a payee</h3>
      <div className="field">
        <label htmlFor="sb-nick">Nickname</label>
        <input id="sb-nick" className="input" value={nickname} onChange={(e) => setNickname(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="sb-acc">Account number</label>
        <input id="sb-acc" className="input mono" value={account} onChange={(e) => setAccount(e.target.value)} />
      </div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          const r = addPayee(bank, nickname, account);
          setBank(r.state);
          setMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: "Payee saved" });
          if (!r.error) {
            setNickname("");
            setAccount("");
          }
        }}
      >
        Save payee
      </button>
      {msg && <p className={`chip ${msg.ok ? "chip-ok" : "chip-bad"}`} style={{ marginTop: 10 }}>{msg.text}</p>}
    </div>
  );
}

function TransferScreen({
  bank,
  setBank,
  confirmation,
  setConfirmation,
}: {
  bank: BankState;
  setBank: (b: BankState) => void;
  confirmation: ReturnType<typeof transfer>["confirmation"];
  setConfirmation: (c: ReturnType<typeof transfer>["confirmation"]) => void;
}) {
  const [payeeId, setPayeeId] = useState(bank.payees[0]?.id ?? "");
  const [amount, setAmount] = useState("250.75");
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <h2>Transfer funds</h2>
      <div className="field">
        <label htmlFor="sb-payee">To payee</label>
        <select id="sb-payee" className="select" value={payeeId} onChange={(e) => setPayeeId(e.target.value)}>
          {bank.payees.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nickname === "" ? "(no nickname)" : p.nickname} - ****{p.accountNumber.slice(-4)}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="sb-amount">Amount (EUR)</label>
        <input id="sb-amount" className="input mono" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <span className="hint">Available: {bank.balance.toFixed(2)} EUR</span>
      </div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          const r = transfer(bank, payeeId, amount);
          setBank(r.state);
          setError(r.error ?? null);
          setConfirmation(r.confirmation ?? undefined);
        }}
      >
        Submit transfer
      </button>
      {error && <p className="chip chip-bad" style={{ marginTop: 10 }}>{error}</p>}
      {confirmation && (
        <div className="callout tip" style={{ marginTop: 14 }}>
          <h4>Transfer confirmation</h4>
          <p className="mono" style={{ margin: 0 }}>
            {confirmation.displayedAmount} EUR to account {confirmation.maskedAccount}
          </p>
          <p className="small muted" style={{ margin: "6px 0 0" }}>
            Reference: {confirmation.payeeId}. Check this screen carefully against the confirmation spec (S5).
          </p>
        </div>
      )}
    </div>
  );
}

function HistoryScreen({ bank }: { bank: BankState }) {
  const [filter, setFilter] = useState<"all" | "week">("all");
  const rows = history(bank, filter);
  return (
    <div>
      <h2>Transaction history</h2>
      <div className="row" style={{ marginBottom: 10 }}>
        <button type="button" className={`btn btn-sm ${filter === "all" ? "btn-primary" : ""}`} onClick={() => setFilter("all")}>All</button>
        <button type="button" className={`btn btn-sm ${filter === "week" ? "btn-primary" : ""}`} onClick={() => setFilter("week")}>Last 7 days</button>
      </div>
      {rows.map((t) => (
        <div className="txrow" key={t.id}>
          <span>{t.label}</span>
          <span className="mono" style={{ color: t.amount > 0 ? "var(--ok)" : "var(--ink)" }}>
            {t.amount > 0 ? "+" : ""}
            {t.amount.toFixed(2)}
          </span>
          <span className="muted small">{t.daysAgo === 0 ? "today" : `${t.daysAgo}d ago`}</span>
        </div>
      ))}
      {rows.length === 0 && <p className="muted">No transactions in this view.</p>}
    </div>
  );
}

function SpecView({
  revealed,
  onReveal,
  reports,
}: {
  revealed: boolean;
  onReveal: () => void;
  reports: SandboxReport[];
}) {
  return (
    <div>
      <div className="card" style={{ marginBottom: 14 }}>
        <h2>Northlake Sandbox Bank - functional specification v1.0</h2>
        <p className="muted small">
          This specification is the source of truth for expected behaviour. Something is a defect only if it
          contradicts one of these lines. Everything else is an assumption you should question.
        </p>
        <table className="data">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Area</th>
              <th>Expected behaviour</th>
            </tr>
          </thead>
          <tbody>
            {bankSpec.map((s) => (
              <tr key={s.id}>
                <td className="mono">{s.id}</td>
                <td>{s.area}</td>
                <td>{s.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div className="row between">
          <h2 style={{ margin: 0 }}>Planted defects</h2>
          {revealed ? (
            <span className="chip chip-warn">revealed</span>
          ) : (
            <button type="button" className="btn btn-danger" onClick={onReveal}>
              Reveal solutions (spoilers)
            </button>
          )}
        </div>
        {revealed ? (
          <>
            <p className="muted small">
              Your filed reports are matched by the spec line they reference. Reports referencing a line without a
              defect are marked as confirmed-correct behaviour - that is good testing too.
            </p>
            <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
              {sandboxDefects.map((d) => {
                const filed = reports.some((r) => r.specRef === d.specId);
                return (
                  <li key={d.id} style={{ marginBottom: 12 }}>
                    <strong>{d.id} - {d.title}</strong> <span className="chip">{d.specId}</span>{" "}
                    {filed ? <span className="chip chip-ok">your report covered this</span> : <span className="chip chip-warn">not in your reports</span>}
                    <br />
                    <span className="muted">How to find: {d.howToFind}</span>
                    <br />
                    <span>{d.explanation}</span>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="muted" style={{ margin: 0 }}>
            Six defects are planted. Explore, file reports, and only then reveal - finding four on your own teaches
            more than reading six.
          </p>
        )}
      </div>
    </div>
  );
}

const SEVERITIES = ["critical", "major", "moderate", "minor"] as const;
const PRIORITIES = ["urgent", "high", "medium", "low"] as const;

function ReportsView() {
  const { state, dispatch } = useStore();
  const [form, setForm] = useState({
    title: "",
    environment: "Northlake Sandbox Bank v1.0, this browser",
    preconditions: "",
    steps: "",
    expected: "",
    actual: "",
    severity: "major",
    priority: "high",
    rationale: "",
    specRef: "",
  });
  const [errors, setErrors] = useState<string[]>([]);

  const submit = () => {
    const errs: string[] = [];
    if (form.title.trim().length < 10) errs.push("Title needs at least 10 characters - name the screen, action, and symptom.");
    if (form.steps.trim().length < 20) errs.push("Reproduction steps need detail (20+ chars): numbered steps with the exact data you used.");
    if (form.expected.trim().length < 10) errs.push("Expected result is required - quote the spec line it contradicts.");
    if (form.actual.trim().length < 10) errs.push("Actual result is required: what you observed, facts only.");
    if (form.rationale.trim().length < 15) errs.push("Severity/priority rationale is required: justify both choices.");
    if (!form.specRef) errs.push("Reference the spec line (S1-S7) this report concerns.");
    setErrors(errs);
    if (errs.length > 0) return;
    dispatch({
      type: "addSandboxReport",
      report: {
        title: form.title.trim(),
        environment: form.environment,
        preconditions: form.preconditions,
        steps: form.steps,
        expected: form.expected,
        actual: form.actual,
        severity: form.severity,
        priority: form.priority,
        rationale: form.rationale,
        specRef: form.specRef,
        matchedDefectId: null,
      },
    });
    setForm((f) => ({ ...f, title: "", preconditions: "", steps: "", expected: "", actual: "", rationale: "", specRef: "" }));
    setErrors([]);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 14 }}>
        <h2>File a defect report</h2>
        <div className="grid2">
          <div className="field">
            <label htmlFor="r-title">Title</label>
            <input id="r-title" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="[Transfers] Exactly 10,000.00 rejected with 'above maximum'" />
          </div>
          <div className="field">
            <label htmlFor="r-env">Environment</label>
            <input id="r-env" className="input" value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value })} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="r-spec">Spec reference (ground truth for expected behaviour)</label>
          <select id="r-spec" className="select" value={form.specRef} onChange={(e) => setForm({ ...form, specRef: e.target.value })}>
            <option value="">- which line does this contradict? -</option>
            {bankSpec.map((s) => (
              <option key={s.id} value={s.id}>{s.id} - {s.text.slice(0, 70)}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="r-pre">Preconditions</label>
          <textarea id="r-pre" className="textarea" style={{ minHeight: 60 }} value={form.preconditions} onChange={(e) => setForm({ ...form, preconditions: e.target.value })} placeholder="Signed in as demo; payee exists; balance above amount" />
        </div>
        <div className="field">
          <label htmlFor="r-steps">Reproduction steps</label>
          <textarea id="r-steps" className="textarea" value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} placeholder={"1) Open Transfer\n2) Select payee Landlord\n3) Enter 10000.00\n4) Submit"} />
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="r-exp">Expected result</label>
            <textarea id="r-exp" className="textarea" style={{ minHeight: 70 }} value={form.expected} onChange={(e) => setForm({ ...form, expected: e.target.value })} placeholder="Per S4: 10,000.00 is within the inclusive range; transfer is accepted." />
          </div>
          <div className="field">
            <label htmlFor="r-act">Actual result</label>
            <textarea id="r-act" className="textarea" style={{ minHeight: 70 }} value={form.actual} onChange={(e) => setForm({ ...form, actual: e.target.value })} placeholder="Error 'Amount above maximum (10,000.00)'; no debit, no transaction." />
          </div>
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="r-sev">Severity</label>
            <select id="r-sev" className="select" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="r-pri">Priority</label>
            <select id="r-pri" className="select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="r-rat">Severity/priority rationale</label>
          <textarea id="r-rat" className="textarea" style={{ minHeight: 60 }} value={form.rationale} onChange={(e) => setForm({ ...form, rationale: e.target.value })} placeholder="Major: valid transactions impossible at the spec limit; high: affects every customer at the boundary, feature-blocking for large transfers." />
        </div>
        {errors.length > 0 && (
          <div className="callout mistake">
            <h4>The report is not ready</h4>
            <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}
        <button type="button" className="btn btn-primary" onClick={submit}>
          Submit report
        </button>
      </div>

      <div className="card">
        <h2>Filed reports ({state.sandboxReports.length})</h2>
        {state.sandboxReports.length === 0 ? (
          <p className="muted">No reports yet. Explore the app against the specification first.</p>
        ) : (
          [...state.sandboxReports].reverse().map((r) => {
            const defect = sandboxDefects.find((d) => d.specId === r.specRef);
            return (
              <div className="card pad-sm tight" key={r.id} style={{ marginBottom: 10 }}>
                <div className="row between">
                  <strong>{r.title}</strong>
                  <div className="row">
                    <span className="chip">{r.specRef}</span>
                    <span className={`chip ${r.severity === "critical" || r.severity === "major" ? "chip-bad" : "chip-warn"}`}>{r.severity}</span>
                    <span className="chip chip-info">{r.priority}</span>
                  </div>
                </div>
                <details style={{ marginTop: 6 }}>
                  <summary className="small">Full report</summary>
                  <p className="small"><strong>Environment:</strong> {r.environment}</p>
                  <p className="small"><strong>Preconditions:</strong> {r.preconditions || "-"}</p>
                  <p className="small" style={{ whiteSpace: "pre-wrap" }}><strong>Steps:</strong> {r.steps}</p>
                  <p className="small"><strong>Expected:</strong> {r.expected}</p>
                  <p className="small"><strong>Actual:</strong> {r.actual}</p>
                  <p className="small"><strong>Rationale:</strong> {r.rationale}</p>
                </details>
                {r.matchedDefectId ? (
                  <p className="small" style={{ margin: "6px 0 0" }}>
                    <span className="chip chip-ok">matched {r.matchedDefectId}</span>
                  </p>
                ) : defect ? (
                  <p className="small muted" style={{ margin: "6px 0 0" }}>
                    A planted defect exists for {r.specRef} - reveal solutions on the Specification tab to compare.
                  </p>
                ) : (
                  <p className="small muted" style={{ margin: "6px 0 0" }}>
                    No planted defect targets {r.specRef}: the app behaves as specified there. Confirming correct behaviour is a valid test result.
                  </p>
                )}
                <div className="row" style={{ marginTop: 8 }}>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => dispatch({ type: "deleteSandboxReport", id: r.id })}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
