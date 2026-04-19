import React, { useState, useEffect } from 'react';
import './App.css';

// 1. 공부 화면 컴포넌트
function StudyRoom({ onExit, nickname }) {
  // 타이머 관련 상태
  const [seconds, setSeconds] = useState(25 * 60); // 기본 25분 (초 단위)
  const [isWorking, setIsWorking] = useState(true); // true: 공부, false: 쉬는시간
  const [isActive, setIsActive] = useState(false);  // 타이머 작동 여부
  
  // 통계 관련 상태
  const [completedCount, setCompletedCount] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0); // 총 공부 분(min)

  // 타이머 로직
  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (isActive && seconds === 0) {
      // 타이머 종료 시점
      clearInterval(interval);
      if (isWorking) {
        // 공부 끝 -> 쉬는시간 시작
        setCompletedCount((prev) => prev + 1);
        setTotalStudyTime((prev) => prev + 25);
        setSeconds(5 * 60); // 5분으로 세팅
        setIsWorking(false);
        alert('고생했어! 5분간 휴식 시작! 🌱');
      } else {
        // 쉬는시간 끝 -> 다시 공부 시작
        setSeconds(25 * 60);
        setIsWorking(true);
        alert('휴식 끝! 다시 25분 집중해볼까? 🔥');
      }
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, isWorking]);

  // 시간을 00:00 형식으로 변환
  const formatTime = (timeInSeconds) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 총 시간을 HH:mm:ss 형식으로 변환
  const formatTotalTime = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const s = 0; // 초 단위는 생략하거나 0으로 표시
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="study-layout">
      <div className="bg-blur-blue"></div>
      <div className="bg-blur-green"></div>

      <aside className="sidebar-rounded">
        <div className="sidebar-top">
          <div className="logo-badge">C뿌리기</div>
          <button className="exit-btn-rounded" onClick={onExit}>나가기</button>
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
          {/* 쉬는 시간일 때는 색깔이 변하게 스타일 추가 가능 */}
          <div className={isWorking ? "timer-circle-red" : "timer-circle-green"}>
            <span className="timer-text">{formatTime(seconds)}</span>
          </div>
        </div>

        {/* 시작/일시정지 버튼 추가 */}
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