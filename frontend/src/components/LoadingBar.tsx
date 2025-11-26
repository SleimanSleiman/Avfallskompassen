import './LoadingBar.css';

type LoadingBarProps = {
  message?: string;
};

export default function LoadingBar({ message = 'Laddar…' }: LoadingBarProps) {
  return (
    <div className="loading-bar">
      <div className="loading-bar-track">
        <div className="loading-bar-fill" />
      </div>
      <p className="loading-bar-message">{message}</p>
    </div>
  );
}
