import React, { useState, useEffect } from 'react';
import './App.css';
import InfiniteScrollGame from "./components/InfiniteScrollGame";
import MathDisturbance from "./components/MathDisturbance";
import BaseballDisturbance from "./components/BaseballDisturbance";
import MusicPlayer from "./components/MusicPlayer";

// 1. 공부 화면 컴포넌트
function StudyRoom({ onExit, nickname }) {
  // 타이머 관련 상태
  const [seconds, setSeconds] = useState(25 * 60);
  const [isWorking, setIsWorking] = useState(true);
  const [isActive, setIsActive] = useState(false);
  
  // 통계 관련 상태
  const [completedCount, setCompletedCount] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);

  // 🎮 게임 관련 상태 (추가)
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [activeDisturbance, setActiveDisturbance] = useState(null);

  // 🎮 스크롤 제어 (추가)
  useEffect(() => {
    if (isGameOpen) {
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";
      document.documentElement.style.overflow = "auto";
    } else {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100%";
      document.documentElement.style.overflow = "hidden";
    }
  }, [isGameOpen]);

// 타이머 로직 (랜덤 방해 기능 통합)
useEffect(() => {
  let interval = null;
  
  if (isActive && seconds > 0) {
    interval = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds - 1);

      // 🔥 [방해 로직] 공부 중(isWorking)일 때만 랜덤 확률로 발생
      if (isWorking) {
        // Math.random() * 100 === 0은 약 1% 확률 (초당 한 번씩 체크)
        // 더 자주 나오게 하려면 100을 작은 숫자(예: 30)로 바꾸세요.
        const shouldDisturb = Math.floor(Math.random() * 100) === 0;

        if (shouldDisturb) {
          const types = ['math', 'baseball', 'scroll'];
          const randomType = types[Math.floor(Math.random() * types.length)];

          if (randomType === 'scroll') {
            setIsGameOpen(true);
          } else {
            setActiveDisturbance(randomType);
          }

          // [옵션] 방해 요소가 떴을 때 타이머를 멈추고 싶다면 아래 주석을 해제하세요.
          setIsActive(false); 
        }
      }
    }, 1000);
  } else if (isActive && seconds === 0) {
    // 타이머 종료 로직
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
    const s = 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 🎮 게임 해제 핸들러 (추가)
  const handleResolveDisturbance = () => {
    setActiveDisturbance(null);
  };

  return (
    <div className="study-layout">
      <MusicPlayer isActive={isActive} videoId="QUXKib-jfEM" />
      {/* 🎮 게임 모달 렌더링 영역 (추가) */}
      {isGameOpen && (
        <div className="game-full-screen-container">
          <InfiniteScrollGame onClose={() => setIsGameOpen(false)}>
            <h1>👹 공부 방해 모드</h1>
            <p>천천히 내리면 결승선이 멀어집니다!</p>
            <div style={{ fontSize: "10rem" }}>🌵</div>
            <div style={{ fontSize: "10rem" }}>🔥</div>
            <div style={{ fontSize: "10rem" }}>💀</div>
          </InfiniteScrollGame>
        </div>
      )}

      {activeDisturbance === 'math' && (
        <MathDisturbance onResolved={handleResolveDisturbance} />
      )}
      {activeDisturbance === 'baseball' && (
        <BaseballDisturbance onResolved={handleResolveDisturbance} />
      )}

      <div className="bg-blur-blue"></div>
      <div className="bg-blur-green"></div>

      <aside className="sidebar-rounded">
        <div className="sidebar-top">
          <div className="logo-badge">C뿌리기</div>
          <button className="exit-btn-rounded" onClick={onExit}>나가기</button>
        </div>

        {/* 🎮 게임 실행 버튼들 (사이드바에 추가) */}
        <div className="sidebar-controls" style={{ padding: '0 15px', marginTop: '20px' }}>
          <button 
            className="btn-disturb" 
            style={{ backgroundColor: "#ff4d4d", marginBottom: "10px", width: "100%", padding: "10px", borderRadius: "10px", color: "white", fontWeight: "bold", border: "none", cursor: "pointer" }}
            onClick={() => setActiveDisturbance('math')}
          >
            🧮 수학 방해
          </button>
          
          <button 
            className="btn-disturb" 
            style={{ backgroundColor: "#4a90e2", marginBottom: "10px", width: "100%", padding: "10px", borderRadius: "10px", color: "white", fontWeight: "bold", border: "none", cursor: "pointer" }}
            onClick={() => setActiveDisturbance('baseball')}
          >
            ⚾ 야구 방해
          </button>

          <button 
            className="btn-disturb" 
            style={{ backgroundColor: "orange", width: "100%", padding: "10px", borderRadius: "10px", color: "white", fontWeight: "bold", border: "none", cursor: "pointer" }}
            onClick={() => setIsGameOpen(true)}
          >
            🔥 스크롤 방해
          </button>
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

        <button 
          className="timer-control-btn" 
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? '잠시 멈춤' : (seconds === 25*60 || seconds === 5*60 ? '집중 시작' : '다시 시작')}
        </button>
        
        <p className="timer-status-text">
          {isWorking ? "지금은 열공 모드! 🔥" : "잠시 숨 돌리는 중... ☕"}
        </p>
      </main>
    </div>
  );
}

// 2. 메인 화면
function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [nickname, setNickname] = useState('');

  const handleOpenModal = () => setShowModal(true);

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
          <button className="start-button" onClick={handleOpenModal}>
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