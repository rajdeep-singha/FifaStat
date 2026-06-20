import { useAuth } from "../../web3/useAuth";
import "../../styles/login.css";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export const LoginScreen: React.FC<{ onPreview?: () => void }> = ({
  onPreview,
}) => {
  const { isLoggedIn, login, busy, error, id } = useAuth();

  if (isLoggedIn) return null;

  return (
    <div className="login-root">
      {/* decorative background ball */}
      <span className="login-bg-ball" aria-hidden>
        ⚽
      </span>

      {/* ── LOGO ── */}
      <div className="login-logo-wrap">
        <div className="login-badge">
          <span className="login-badge-dot" />
          WC 2026 · Live Data
        </div>
        <h1 className="login-wordmark">CARDCLASH</h1>
        <p className="login-sub">Real players · Real stakes</p>
      </div>

      {/* ── CONNECT CARD ── */}
      <div className="login-card">
        <p className="login-card-title">Connect Wallet</p>
        <p className="login-card-desc">
          Your wallet is your identity — <strong>no signup</strong>, no
          password, <strong>zero gas</strong>. Connect, sign, ball out.
        </p>

        <button
          className="login-btn login-btn-metamask"
          onClick={() => login("metaMask")}
          disabled={busy}
        >
          <span className="login-btn-icon">🦊</span>
          MetaMask
        </button>

        <button
          className="login-btn login-btn-phantom"
          onClick={() => login("phantom")}
          disabled={busy}
        >
          <span className="login-btn-icon">👻</span>
          Phantom
        </button>

        {/* status messages */}
        {busy && (
          <div className="login-status login-status-busy">
            ⏳ check your wallet…
          </div>
        )}
        {id && !isLoggedIn && !busy && (
          <div className="login-status login-status-waiting">
            ✦ spotted {short(id)} — sign to lock in
          </div>
        )}
        {error && (
          <div className="login-status login-status-error">✕ {error}</div>
        )}

        {onPreview && (
          <>
            <div className="login-divider">
              <span className="login-divider-line" />
              <span className="login-divider-text">or</span>
              <span className="login-divider-line" />
            </div>
            <button className="login-preview-btn" onClick={onPreview}>
              ⚡ Rip a pack first — no wallet needed
            </button>
          </>
        )}
      </div>

      <p className="login-footer">Powered by Anakin · WC2026</p>
    </div>
  );
};
