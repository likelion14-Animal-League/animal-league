import React, { useState, useEffect, useRef } from "react";

const InfiniteScrollGame = ({ onClose, children }) => {
  const [targetHeight, setTargetHeight] = useState(3000); 
  const [currentY, setCurrentY] = useState(0);
  const [isWarning, setIsWarning] = useState(false);

  // 1. [추가] 탈출 가능 여부 확인
  const isEscapable = currentY >= targetHeight;

  const scrollData = useRef({
    lastY: 0,
    lastTime: Date.now(),
    lastVelocity: 0,
  });

  const handleScroll = (e) => {
    const now = Date.now();
    const y = e.currentTarget.scrollTop;
    
    setCurrentY(y);

    const distDiff = y - scrollData.current.lastY;
    const timeDiff = now - scrollData.current.lastTime;
    const velocity = timeDiff > 0 ? distDiff / timeDiff : 0;

    // 결승선(targetHeight)에 도달하기 전까지만 페널티 부여
    if (!isEscapable && distDiff > 0 && velocity < 0.9) {
      setIsWarning(true);
      setTargetHeight((prev) => prev * 1.05);
      setTimeout(() => setIsWarning(false), 300);
    }

    scrollData.current = {
      lastY: y,
      lastTime: now,
      lastVelocity: velocity,
    };
  };

  return (
    <div
      onScroll={handleScroll}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 10000,
        backgroundColor: isWarning ? "#4a0000" : "#121212",
        overflowY: "scroll",
        transition: "background-color 0.2s",
        color: "white",
      }}
    >
      {/* 경고 레이어 */}
      {isWarning && (
        <div style={{ position: "fixed", inset: 0, boxShadow: "inset 0 0 150px red", pointerEvents: "none", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10001 }}>
          <h1 style={{ color: "red", fontSize: "5rem", textAlign: "center" }}>더 빨리!!!!</h1>
        </div>
      )}

      {/* 대시보드 */}
      <div style={{ position: "sticky", top: "20px", left: "20px", zIndex: 10002, padding: "0 20px" }}>
        
        {/* 2. [수정] 탈출 조건 달성 시에만 버튼 렌더링 */}
        {isEscapable ? (
          <button
            onClick={onClose}
            style={{
              padding: "15px 30px",
              background: "#22c55e", // 성공 시 초록색으로 변경
              border: "none",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1.2rem",
              boxShadow: "0 0 20px rgba(34, 197, 94, 0.5)",
              animation: "pulse 1.5s infinite" // 강조 효과
            }}
          >
            🎉 탈출하기 (성공!)
          </button>
        ) : (
          <div style={{
            padding: "10px 20px",
            background: "#555",
            color: "#ccc",
            borderRadius: "5px",
            display: "inline-block",
            fontSize: "0.9rem"
          }}>
            🔒 목표치 달성 전까지 탈출 불가
          </div>
        )}

        <div style={{ marginTop: "15px", background: "rgba(0,0,0,0.7)", padding: "15px", borderRadius: "12px", width: "fit-content", border: "1px solid #333" }}>
          <p style={{ margin: 0, fontSize: "1rem", color: "#aaa" }}>목표: {Math.floor(targetHeight)}px</p>
          <p style={{ margin: "8px 0 0 0", fontSize: "1.2rem", color: isEscapable ? "#22c55e" : "#ff4d4d" }}>
            현재: {Math.floor(currentY)}px {isEscapable && " (도착!)"}
          </p>
        </div>
      </div>

      <div style={{ height: `${targetHeight + 2000}px`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "100px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "800px" }}>
          {children}
          
          {/* 3. [추가] 마지막 지점에 시각적 결승선 표시 */}
          <div style={{ 
            marginTop: `${targetHeight - 1000}px`, 
            padding: "40px", 
            border: "5px dashed #22c55e", 
            borderRadius: "20px",
            textAlign: "center" 
          }}>
            <h2 style={{ fontSize: "3rem", color: "#22c55e" }}>🏁 FINISH LINE</h2>
            <p>위로 올라가서 탈출 버튼을 누르세요!</p>
          </div>
        </div>
      </div>

      {/* 버튼 애니메이션용 스타일 */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default InfiniteScrollGame;