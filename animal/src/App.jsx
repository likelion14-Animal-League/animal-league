import React, { useState, useEffect } from 'react';
import './App.css';
import InfiniteScrollGame from "./components/InfiniteScrollGame";
import MathDisturbance from "./components/MathDisturbance";
import BaseballDisturbance from "./components/BaseballDisturbance";
import Moving from "./components/moving.jsx";

// 1. 공부 화면 컴포넌트
function StudyRoom({ onExit, nickname }) {
  // --- 타이머 관련 상태 ---
  const [seconds, setSeconds] = useState(25 * 60);
  const [isWorking, setIsWorking] = useState(true);
  const [isActive, setIsActive] = useState(false);
  
  // --- 통계 관련 상태 ---
  const [completedCount, setCompletedCount] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);

  // --- 방해 요소 관련 상태 ---
  const [isScrollGameOpen, setIsScrollGameOpen] = useState(false);
  const [activeDisturbance, setActiveDisturbance] = useState(null); 
  const [showMovingGame, setShowMovingGame] = useState(false); 

  // 버튼 스타일 정의
  const testBtnStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '12px',
    marginBottom: '20px'
  };

  const disturbBtnStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "10px",
    color: "white",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    fontSize: "12px"
  };

  // 🎮 스크롤 방해 시 스크롤 허용 제어
  useEffect(() => {
    if (isScrollGameOpen) {
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";
      document.documentElement.style.overflow = "auto";
    } else {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100%";
      document.documentElement.style.overflow = "hidden";
    }
  }, [isScrollGameOpen]);

  // 🔥 타이머 및 랜덤 방해 로직 (약 1% 확률)
  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);

        if (isWorking) {
          const shouldDisturb = Math.floor(Math.random() * 100) === 0;
          if (shouldDisturb) {
            const types = ['math', 'baseball', 'scroll', 'moving'];
            const randomType = types[Math.floor(Math.random() * types.length)];

            if (randomType === 'scroll') setIsScrollGameOpen(true);
            else if (randomType === 'moving') setShowMovingGame(true);
            else setActiveDisturbance(randomType);

            setIsActive(false); // 방해 시작 시 타이머 정지
          }
        }
      }, 1000);
    } else if (isActive && seconds === 0) {
      clearInterval(interval);
      if (isWorking) {
        setCompletedCount((prev) => prev + 1);
        setTotalStudyTime((prev) => prev + 25);
        setSeconds(5 * 60);
        setIsWorking(false);
      } else {
        setSeconds(25 * 60);
        setIsWorking(true);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, isWorking]);

  const formatTime = (timeInSeconds) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatTotalTime = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
  };

  return (
    <div className="study-layout">
      {/* --- 방해 모달 레이어 --- */}
      {showMovingGame && <Moving onClose={() => setShowMovingGame(false)} />}
      
      {isScrollGameOpen && (
        <div className="game-full-screen-container">
          <InfiniteScrollGame onClose={() => setIsScrollGameOpen(false)}>
            <h1>👹 공부 방해 모드</h1>
            <p>천천히 내리면 결승선이 멀어집니다!</p>
            <div style={{ fontSize: "10rem" }}>🌵</div>
            <div style={{ fontSize: "10rem" }}>🔥</div>
            <div style={{ fontSize: "10rem" }}>💀</div>
          </InfiniteScrollGame>
        </div>
      )}

      {activeDisturbance === 'math' && (
        <MathDisturbance onResolved={() => setActiveDisturbance(null)} />
      )}
      {activeDisturbance === 'baseball' && (
        <BaseballDisturbance onResolved={() => setActiveDisturbance(null)} />
      )}

      <div className="bg-blur-blue"></div>
      <div className="bg-blur-green"></div>

      <aside className="sidebar-rounded">
        <div className="sidebar-top">
          <div className="logo-badge">C뿌리기</div>
          <button className="exit-btn-rounded" onClick={onExit}>나가기</button>
        </div>

        {/* 🕹️ 사이드바 테스트 컨트롤 영역 */}
        <div style={{ padding: '20px' }}>
          <button onClick={() => setShowMovingGame(true)} style={testBtnStyle}>
            🕹️ 게임 테스트 (Moving)
          </button>

          <button className="btn-disturb" style={{...disturbBtnStyle, backgroundColor: "#ff4d4d"}} onClick={() => setActiveDisturbance('math')}>🧮 수학 방해</button>
          <button className="btn-disturb" style={{...disturbBtnStyle, backgroundColor: "#4a90e2"}} onClick={() => setActiveDisturbance('baseball')}>⚾ 야구 방해</button>
          <button className="btn-disturb" style={{...disturbBtnStyle, backgroundColor: "orange"}} onClick={() => setIsScrollGameOpen(true)}>🔥 스크롤 방해</button>
        </div>

        <div className="sidebar-footer-rounded">
          <div className="user-profile">
            <span className="user-label">내 정보</span>
            <span className="user-name">{nickname || '멋쟁이호랑이'}</span>
          </div>
          <div className="icon-group">
            <button className="icon-btn">⚙️</button>
            <button className="icon-btn">🎵</button>
          </div>
        </div>
      </aside>

      <main className="timer-section">
        <div className="stats-bubble">
          완료 <strong>{completedCount}</strong>회 | 총 공부 시간 <strong>{formatTotalTime(totalStudyTime)}</strong>
        </div>
        
        <div className="timer-card-chubby">
          <div className={isWorking ? "timer-circle-red" : "timer-circle-green"}>
            <span className="timer-text">{formatTime(seconds)}</span>
          </div>
        </div>

        <button className="timer-control-btn" onClick={() => setIsActive(!isActive)}>
          {isActive ? '잠시 멈춤' : (seconds === 25*60 || seconds === 5*60 ? '집중 시작' : '다시 시작')}
        </button>
        
        <p className="timer-status-text">
          {isWorking ? "지금은 열공 모드! 🔥" : "잠시 숨 돌리는 중... ☕"}
        </p>
      </main>
    </div>
  );
}

// 2. 메인 앱 컴포넌트
function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [nickname, setNickname] = useState('');

  const handleStartStudy = () => {
    if (nickname.trim() === '') {
      alert('닉네임을 입력해주세요!');
      return;
    }
    setShowModal(false);
    setIsStarted(true);
  };

  if (isStarted) {
    return <StudyRoom onExit={() => setIsStarted(false)} nickname={nickname} />;
  }

  return (
    <div className='all'>
      <div className="background"></div>
      <div className="main-container">
        <div className="content-box">
          <div className="sprout-icon">🌱</div>
          <h2 className="title">C뿌리기</h2>
          <button className="start-button" onClick={() => setShowModal(true)}>
            공부 시작하기
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>닉네임 설정</h3>
            <p>공부방에서 사용할 이름을 정해주세요!</p>
            <input 
              type="text" 
              placeholder="닉네임 입력..." 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="modal-input"
            />
            <div className="modal-buttons">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>취소</button>
              <button className="modal-submit" onClick={handleStartStudy}>입장하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;