import './profile-lagoon.css';

const art = '/assets/generated/profile/dive-log/';

export function ProfileLagoon() {
  return (
    <div className="profile-lagoon" aria-hidden="true">
      <div className="profile-lagoon-bank" />
      <div className="profile-lagoon-window">
        <img className="profile-lagoon-bay" src={art + 'profile-glass-lagoon.webp'} alt="" decoding="async" fetchPriority="high" />
        <img className="profile-lagoon-sprig" src={art + 'profile-lagoon-foreground.webp'} alt="" decoding="async" />
        <span className="profile-lagoon-bubbles"><i /><i /><i /></span>
      </div>
      <img className="profile-lagoon-shell" src={art + 'lagoon-shell.svg'} alt="" />
    </div>
  );
}
