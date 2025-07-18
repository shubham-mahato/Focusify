interface SessionCounterProps {
  sessionsCompleted: number;
  totalSessionsPerCycle: number;
  currentCycle: number;
  totalSessions: number;
  isOnBreak: boolean;
}

export default function SessionCounter({
  sessionsCompleted,
  totalSessionsPerCycle,
  currentCycle,
  totalSessions,
  isOnBreak,
}: SessionCounterProps) {
  // Create array of session indicators
  const sessionIndicators = Array.from(
    { length: totalSessionsPerCycle },
    (_, index) => {
      const sessionNumber = index + 1;
      const isCompleted = sessionNumber <= sessionsCompleted;
      const isCurrent = !isOnBreak && sessionNumber === sessionsCompleted + 1;

      return {
        number: sessionNumber,
        isCompleted,
        isCurrent,
      };
    }
  );

  return (
    <div className="session-counter">
      {/* Current Cycle Info */}
      <div className="text-center mb-4">
        <h3 className="text-white font-semibold text-lg mb-2">
          Cycle {currentCycle}
        </h3>
        <p className="text-white/70 text-sm">
          {sessionsCompleted}/{totalSessionsPerCycle} focus sessions completed
        </p>
      </div>

      {/* Session Progress Indicators */}
      <div className="flex justify-center gap-3 mb-4">
        {sessionIndicators.map((session) => (
          <div
            key={session.number}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
              session.isCompleted
                ? "bg-focus-complete text-white scale-110"
                : session.isCurrent
                ? "bg-focus-active text-white ring-2 ring-white/50 animate-pulse-slow"
                : "bg-white/20 text-white/60 border-2 border-white/30"
            }`}
          >
            {session.isCompleted ? "✓" : session.number}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/20 rounded-full h-2 mb-4">
        <div
          className="bg-focus-complete h-2 rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${(sessionsCompleted / totalSessionsPerCycle) * 100}%`,
          }}
        />
      </div>

      {/* Today's Total */}
      <div className="text-center">
        <p className="text-white/70 text-sm">
          Total sessions today:{" "}
          <span className="font-semibold text-white">{totalSessions}</span>
        </p>
      </div>

      {/* Next Session Preview */}
      {!isOnBreak && (
        <div className="mt-4 text-center">
          <p className="text-white/60 text-xs">
            Next:{" "}
            {sessionsCompleted + 1 >= totalSessionsPerCycle
              ? "Long Break"
              : "Short Break"}
          </p>
        </div>
      )}
    </div>
  );
}
