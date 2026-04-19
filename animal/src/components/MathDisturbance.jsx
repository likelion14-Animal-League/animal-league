import React, { useState, useEffect } from 'react';
import './DisturbanceModal.css';

const MathLogic = {
  generateMathProblem: () => {
    const num1 = Math.floor(Math.random() * 90) + 10;
    const num2 = Math.floor(Math.random() * 90) + 10;
    return { problem: `${num1} + ${num2} = ?`, solution: String(num1 + num2) };
  },
  generateMixedArithmetic: () => {
    const a = Math.floor(Math.random() * 10) + 2;
    const b = Math.floor(Math.random() * 10) + 2;
    const c = Math.floor(Math.random() * 20) + 5;
    const type = Math.floor(Math.random() * 3);
    let problem, solution;
    if (type === 0) {
      problem = `(${a} * ${b}) + ${c} = ?`;
      solution = (a * b) + c;
    } else if (type === 1) {
      problem = `(${a} + ${b}) * ${c} = ?`;
      solution = (a + b) * c;
    } else {
      const total = c + (a * b);
      problem = `${total} - (${a} * ${b}) = ?`;
      solution = c;
    }
    return { problem, solution: String(solution) };
  },
  generateBasicArithmetic: () => {
    const ops = ["+", "-", "*", "/"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let n1, n2, res;
    if (op === "*") {
      n1 = Math.floor(Math.random() * 9) + 2;
      n2 = Math.floor(Math.random() * 9) + 2;
      res = n1 * n2;
    } else if (op === "/") {
      n2 = Math.floor(Math.random() * 8) + 2;
      res = Math.floor(Math.random() * 9) + 2;
      n1 = n2 * res;
    } else if (op === "-") {
      n1 = Math.floor(Math.random() * 50) + 20;
      n2 = Math.floor(Math.random() * 19) + 1;
      res = n1 - n2;
    } else {
      n1 = Math.floor(Math.random() * 50) + 1;
      n2 = Math.floor(Math.random() * 50) + 1;
      res = n1 + n2;
    }
    return { problem: `${n1} ${op} ${n2} = ?`, solution: String(res) };
  },
  getRandomProblem: () => {
    const methods = [MathLogic.generateMathProblem, MathLogic.generateMixedArithmetic, MathLogic.generateBasicArithmetic];
    return methods[Math.floor(Math.random() * methods.length)]();
  }
};

const MathDisturbance = ({ onResolved }) => {
  const [currentProblem, setCurrentProblem] = useState({ problem: "", solution: "" });
  const [userInput, setUserInput] = useState("");
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("문제를 풀어야 해제됩니다!");

  useEffect(() => {
    setCurrentProblem(MathLogic.getRandomProblem());
  }, []);

  const handleSubmit = () => {
    if (userInput.trim() === currentProblem.solution) {
      onResolved();
    } else {
      setIsError(true);
      setMessage("틀렸습니다! 문제가 갱신됩니다.");
      setUserInput("");
      setTimeout(() => {
        setCurrentProblem(MathLogic.getRandomProblem());
        setIsError(false);
      }, 500);
    }
  };

  return (
    <div className="disturbance-overlay">
      <div className={`disturbance-card ${isError ? 'shake' : ''}`}>
        <div className="disturbance-header">🧮 집중력 테스트: 암산</div>
        <div className="problem-text">{currentProblem.problem || "Loading..."}</div>
        <div className="input-group">
          <input 
            className="answer-input"
            type="number" 
            placeholder="정답 입력" 
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <button className="submit-btn" onClick={handleSubmit}>제출하기</button>
        </div>
        <p className="hint-text" style={{ color: isError ? '#ff4d4d' : '#aaa' }}>{message}</p>
      </div>
    </div>
  );
};

export default MathDisturbance;