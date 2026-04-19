import React, { useState, useEffect, useRef } from "react";

const Moving = ({ onClose }) => {
  const [stage, setStage] = useState(1);
  const [oPos, setOPos] = useState({ left: 60, top: 20, scale: 1 });
  const [xPos, setXPos] = useState({ left: 170, top: 20 });
  const [x2Pos, setX2Pos] = useState({ left: 60, top: 20 }); 
  const [isDragging, setIsDragging] = useState(null); 
  const [isBlocking, setIsBlocking] = useState(false);
  const [isCovered, setIsCovered] = useState(false);

  // --- 6단계 전용 상태 ---
  const [isPouring, setIsPouring] = useState(false); 
  const [physicsXList, setPhysicsXList] = useState([]); 
  const [physicsO, setPhysicsO] = useState({ left: 140, top: -60, vx: 0, vy: 0, rotate: 0, show: false });
  const [modalRotate, setModalRotate] = useState(0);
  const [isWindowGrabbing, setIsWindowGrabbing] = useState(false);

  const gameAreaRef = useRef(null);
  const requestRef = useRef();

  const messages = [
    "공부를 시작하시겠습니까?", 
    "정말요? 다시 생각해보세요.", 
    "서로 닿을 수 없는 운명입니다.", 
    "O버튼이 사라졌다!", 
    "왜 O버튼이 안 눌리죠?", 
    "왜 아무것도 없어!"
  ];

  const getNonOverlappingPos = (newOPos) => {
    let nx, ny, dist;
    do {
      nx = Math.random() * 220;
      ny = Math.random() * 80;
      const dx = nx - newOPos.left;
      const dy = ny - newOPos.top;
      dist = Math.sqrt(dx * dx + dy * dy);
    } while (dist < 120);
    return { left: nx, top: ny };
  };

  const handleMouseEnterO = () => {
    if (stage === 1 || stage === 4 || stage === 6 || isCovered) return;
    if (stage === 2) {
      setXPos({ left: oPos.left, top: oPos.top });
      setIsBlocking(true);
    } else if (stage === 3) {
      const newOPos = { left: Math.random() * 200, top: Math.random() * 80, scale: 1 };
      const newXPos = getNonOverlappingPos(newOPos);
      setOPos(newOPos);
      setXPos(newXPos);
    }
  };

  const handleMouseLeaveO = () => {
    if (stage === 2) {
      setXPos({ left: 170, top: 20 });
      setIsBlocking(false);
    }
  };

  // --- 6단계 뭉침 방지 물리 엔진 ---
  const updatePhysics = () => {
    const gravity = 0.3;
    const friction = 0.94;
    const bounce = 0.3;
    const repulsion = 0.8; // 서로 밀어내는 힘
    const angleRad = (modalRotate * Math.PI) / 180;

    const computeObject = (obj, others) => {
      let ax = gravity * Math.sin(angleRad);
      let ay = gravity * Math.cos(angleRad);

      // 뭉침 방지 로직: 주변 버튼들과의 거리 체크
      others.forEach(other => {
        if (obj.id !== other.id) {
          const dx = obj.left - other.left;
          const dy = obj.top - other.top;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 65) { // 버튼 크기에 따른 충돌 반경
            ax += (dx / dist) * repulsion;
            ay += (dy / dist) * repulsion;
          }
        }
      });

      let nvx = (obj.vx + ax) * friction;
      let nvy = (obj.vy + ay) * friction;
      let nleft = obj.left + nvx;
      let ntop = obj.top + nvy;
      let nrotate = obj.rotate + nvx * 1.5;

      // 경계면 처리
      if (ntop > 155) { ntop = 155; nvy *= -bounce; nvx *= 0.7; }
      else if (ntop < 0) { ntop = 0; nvy *= -bounce; }
      if (nleft < 0) { nleft = 0; nvx *= -bounce; }
      else if (nleft > 280) { nleft = 280; nvx *= -bounce; }

      return { ...obj, left: nleft, top: ntop, vx: nvx, vy: nvy, rotate: nrotate };
    };

    setPhysicsXList((prev) => prev.map(x => computeObject(x, prev)));
    setPhysicsO((prev) => prev.show ? computeObject(prev, physicsXList) : prev);

    requestRef.current = requestAnimationFrame(updatePhysics);
  };

  useEffect(() => {
    if (stage === 6 && isPouring) {
      requestRef.current = requestAnimationFrame(updatePhysics);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [stage, isPouring, modalRotate, physicsXList]);

  useEffect(() => {
    const handleGlobalMove = (e) => {
      // 6단계 360도 무한 회전
      if (isWindowGrabbing && stage === 6) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI) + 90;
        setModalRotate(angle);

        if (!isPouring) {
          setIsPouring(true);
          let count = 0;
          const interval = setInterval(() => {
            setPhysicsXList((prev) => [
              ...prev,
              { id: count, left: 140, top: -50, vx: (Math.random()-0.5)*5, vy: 5, rotate: Math.random()*360 }
            ]);
            count++;
            if (count >= 12) {
              clearInterval(interval);
              setTimeout(() => setPhysicsO(p => ({ ...p, show: true })), 800);
            }
          }, 200);
        }
      }

      // 1~5단계 드래그 로직
      if (isDragging && gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const newX = Math.max(0, Math.min(e.clientX - rect.left - 40, rect.width - 80));
        const newY = Math.max(0, Math.min(e.clientY - rect.top - 22, rect.height - 45));

        if (isDragging === 'x2') setX2Pos({ left: newX, top: newY });
        else if (isDragging === 'x1') {
          setXPos({ left: newX, top: newY });
          setIsCovered(Math.abs(newX - oPos.left) < 40 && Math.abs(newY - oPos.top) < 30);
        }
      }
    };

    const handleGlobalUp = () => {
      setIsWindowGrabbing(false);
      setIsDragging(null);
    };

    window.addEventListener("mousemove", handleGlobalMove);
    window.addEventListener("mouseup", handleGlobalUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMove);
      window.removeEventListener("mouseup", handleGlobalUp);
    };
  }, [isWindowGrabbing, isDragging, oPos, stage, isPouring]);

  const handleOClick = () => {
    if (stage === 5 && !isCovered) return;
    if (stage < 6) {
      alert(`통과!`);
      setStage(prev => prev + 1);
      setOPos({ left: 60, top: 20, scale: 1 });
      setXPos({ left: 170, top: 20 });
      setX2Pos({ left: 60, top: 20 });
      setIsCovered(false); setIsBlocking(false); setIsPouring(false); setModalRotate(0);
      setPhysicsO({ left: 140, top: -60, vx: 0, vy: 0, rotate: 0, show: false });
      setPhysicsXList([]);
    } else {
      alert("이제 공부 시작!");
      onClose();
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={{
          ...styles.modal,
          transform: `rotate(${modalRotate}deg)`,
          transition: (isWindowGrabbing || isPouring) ? "none" : "transform 0.5s ease-out"
        }}>
        <div 
          style={{...styles.windowHeader, cursor: stage === 6 ? "grab" : "default"}}
          onMouseDown={() => stage === 6 && setIsWindowGrabbing(true)}
        >
          <span style={styles.windowTitle}>방해 공격!</span>
        </div>

        <div style={styles.content}>
          <p style={styles.mainText}>{messages[stage - 1]}</p>
          <div ref={gameAreaRef} style={styles.gameArea}>
            {stage === 6 ? (
              physicsO.show && (
                <button
                  style={{...styles.btnO, left: `${physicsO.left}px`, top: `${physicsO.top}px`, transform: `scale(0.7) rotate(${physicsO.rotate}deg)`, zIndex: 100, transition: "none"}}
                  onClick={handleOClick}
                >O</button>
              )
            ) : (
              <button
                style={{
                  ...styles.btnO,
                  left: `${oPos.left}px`, top: `${oPos.top}px`,
                  backgroundColor: isCovered ? "#d4edda" : "#f0f0f0",
                  zIndex: stage === 4 ? 3 : 5,
                  transition: isDragging ? "none" : "all 0.4s"
                }}
                onMouseEnter={handleMouseEnterO}
                onMouseLeave={handleMouseLeaveO}
                onClick={handleOClick}
              >O</button>
            )}

            {stage < 6 ? (
              <>
                <button
                  style={{
                    ...styles.btnX, left: `${xPos.left}px`, top: `${xPos.top}px`,
                    zIndex: (isBlocking || isDragging === 'x1') ? 10 : 4,
                    cursor: stage === 5 ? "grab" : "pointer",
                    transition: isDragging === 'x1' ? "none" : (stage === 1 ? "none" : "all 0.4s")
                  }}
                  onMouseDown={() => stage === 5 && setIsDragging('x1')}
                >X</button>
                {stage === 4 && (
                  <button
                    style={{...styles.btnX, left: `${x2Pos.left}px`, top: `${x2Pos.top}px`, zIndex: 6, cursor: "grab", transition: isDragging === 'x2' ? "none" : "all 0.3s"}}
                    onMouseDown={() => setIsDragging('x2')}
                  >X</button>
                )}
              </>
            ) : (
              physicsXList.map((x) => (
                <div key={x.id} style={{...styles.btnX, left: `${x.left}px`, top: `${x.top}px`, transform: `rotate(${x.rotate}deg)`, transition: "none", pointerEvents: "none"}}>X</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 },
  modal: { width: "360px", backgroundColor: "#f0f0f0", border: "2px solid #333", borderRadius: "4px", overflow: "hidden", userSelect: "none" },
  windowHeader: { background: "linear-gradient(90deg, #000080, #1084d0)", padding: "8px 10px" },
  windowTitle: { color: "#fff", fontSize: "12px", fontWeight: "bold" },
  content: { padding: "30px 20px", textAlign: "center", backgroundColor: "#fff" },
  mainText: { fontSize: "15px", fontWeight: "bold", marginBottom: "25px", minHeight: "45px", color: "#333" },
  gameArea: { position: "relative", width: "100%", height: "200px", backgroundColor: "#eee", border: "1px inset #ccc", overflow: "hidden" },
  btnO: { position: "absolute", width: "80px", height: "45px", border: "1px solid #999", cursor: "pointer", fontSize: "18px", fontWeight: "bold", outline: "none" },
  btnX: { position: "absolute", width: "80px", height: "45px", backgroundColor: "#f0f0f0", border: "1px solid #999", fontSize: "18px", fontWeight: "bold", color: "#cc0000", display: "flex", justifyContent: "center", alignItems: "center" }
};

export default Moving;