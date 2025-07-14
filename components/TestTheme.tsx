export default function ThemeTest() {
  return (
    <div className="study-layout">
      {/* App Title */}
      <div className="app-title">
        focusify
        <div className="text-sm opacity-75 mt-2">by your team</div>
      </div>

      {/* Mode Selection Buttons */}
      <div className="mode-buttons">
        <button className="glass-button active">pomodoro</button>
        <button className="glass-button">short break</button>
        <button className="glass-button">long break</button>
      </div>

      {/* Timer Display */}
      <div className="timer-display">25:00</div>

      {/* Control Buttons */}
      <div className="control-buttons">
        <button className="glass-button">start</button>
        <button className="glass-button">⟲</button>
        <button className="glass-button">⚙</button>
      </div>

      {/* Test Cards for Development */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
        <div className="glass-morphism p-6 space-y-4">
          <h3 className="font-semibold text-white">Glass Card</h3>
          <p className="text-white/70">
            This is how cards will look with the glass morphism effect.
          </p>
        </div>

        <div className="glass-morphism p-6 space-y-4">
          <h3 className="font-semibold text-white">Timer States</h3>
          <div className="space-y-2">
            <div className="text-focus-active">Active Session</div>
            <div className="text-focus-break">Break Time</div>
            <div className="text-focus-pause">Paused</div>
            <div className="text-focus-complete">Completed</div>
          </div>
        </div>

        <div className="glass-morphism p-6 space-y-4">
          <h3 className="font-semibold text-white">Animations</h3>
          <div className="space-y-2">
            <div className="animate-pulse-slow">Pulse Animation</div>
            <div className="animate-timer-tick">Timer Tick</div>
            <div className="animate-bounce-gentle">Bounce Gentle</div>
          </div>
        </div>
      </div>
    </div>
  );
}
