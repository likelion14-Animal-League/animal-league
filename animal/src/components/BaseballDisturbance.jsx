import React, { useState, useEffect } from 'react';
import './DisturbanceModal.css';

/**
 * [Logic] 숫자야구 게임 엔진
 */
const BaseballLogic = {
  // 중복 없는 랜덤 3자리 숫자 생성
  generateSolution: () => {
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const result = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      result.push(numbers.splice(randomIndex, 1)[0]);
    }
    return result.join("");
  },

  // 결과 판정 (Strike, Ball)
  checkAnswer: (solution, userAnswer) => {
    let strike = 0;
    let ball = 0;
    const solArr = solution.split("");
    const ansArr = userAnswer.split("");

    ansArr.forEach((char, index) => {
      if (char === solArr[index]) {
        strike++;
      } else if (solArr.includes(char)) {
        ball++;
      }
    });

    if (strike === 3) return "3S 0B";
    if (strike === 0 && ball === 0) return "OUT";
    return `${strike}S ${ball}B`;
  }
};

/**
 * [Component] 숫자야구 방해 UI
 */
const BaseballDisturbance = ({ onResolved }) => {
  const [solution, setSolution] = useState("");
  const [userInput, setUserInput] = useState("");
  const [logs, setLogs] = useState([]); 
  const [message, setMessage] = useState("중복 없는 숫자 3개를 맞추세요!");
  const [isError, setIsError] = useState(false);

  // 컴포넌트가 나타날 때 정답 생성
  useEffect(() => {
    setSolution(BaseballLogic.generateSolution());
  }, []);

  const handleGuess = () => {
    // 유효성 검사: 3자리 숫자인지, 중복은 없는지
    const isUnique = new Set(userInput).size === 3;
    if (!/^\d{3}$/.test(userInput) || !isUnique) {
      setMessage("중복 없는 숫자 3자리를 입력하세요!");
      setIsError(true);
      setTimeout(() => setIsError(false), 500);
      return;
    }

    const result = BaseballLogic.checkAnswer(solution, userInput);
    
    if (result === "3S 0B") {
      alert("홈런! 방해 해제 완료.");
      onResolved(); 
    } else {
      setLogs([{ input: userInput, result }, ...logs].slice(0, 5));
      setMessage(`${userInput} 👉 ${result}`);
      setUserInput(""); 
      setIsError(true);
      setTimeout(() => setIsError(false), 500);
    }
  };

  return (
    <div className="disturbance-overlay">
      <div className={`disturbance-card ${isError ? 'shake' : ''}`}>
        <div className="disturbance-header">⚾ 집중력 테스트: 숫자야구</div>
        
        <div className="problem-text" style={{ fontSize: '1.5rem', letterSpacing: '8px' }}>
          {/* 최근 결과가 있다면 보여주고, 없다면 물음표 표시 */}
          {logs.length > 0 ? logs[0].result : "???"}
        </div>

        <div className="input-group">
          <input 
            className="answer-input"
            type="text" 
            maxLength="3"
            placeholder="숫자 입력" 
            value={userInput}
            onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
            autoFocus
          />
          <button className="submit-btn" onClick={handleGuess}>
            입력 확인
          </button>
        </div>

        <p className="hint-text" style={{ color: isError ? '#ff4d4d' : '#4CAF50', fontWeight: 'bold' }}>
          {message}
        </p>

        {/* 이전 기록 리스트 */}
        <div style={{ marginTop: '15px', borderTop: '1px solid #333', paddingTop: '10px' }}>
          {logs.map((log, idx) => (
            <div key={idx} style={{ fontSize: '0.9rem', opacity: 0.5, marginBottom: '4px', color: 'white' }}>
              시도 {logs.length - idx}: <strong>{log.input}</strong> → {log.result}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BaseballDisturbance;