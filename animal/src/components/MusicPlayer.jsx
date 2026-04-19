import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';

// QUXKib-jfEM
// dQw4w9WgXcQ

const MusicPlayer = ({ isActive, videoId = "QUXKib-jfEM" }) => {
  const [player, setPlayer] = useState(null);
  const isReady = useRef(false); // 플레이어가 진짜 준비됐는지 체크

  useEffect(() => {
    // 1. 플레이어가 없거나, 아직 API가 준비 완료(Ready) 신호를 안 보냈다면 중단
    if (!player || !isReady.current) return;

    try {
      if (isActive) {
        player.playVideo();
        player.setVolume(50);
      } else {
        // 2. pauseVideo를 부르기 전에도 상태 확인 (에러 방지)
        const state = player.getPlayerState();
        if (state !== -1) { // 플레이어가 초기화된 상태일 때만
          player.pauseVideo();
        }
      }
    } catch (error) {
      console.warn("유튜브 플레이어 제어 중 일시적인 오류 발생:", error);
    }
  }, [isActive, player]);

  const onPlayerReady = (event) => {
    isReady.current = true; // 이제 진짜 명령을 내려도 된다는 표시
    setPlayer(event.target);
  };

  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
    },
  };

  return (
    <div style={{ display: 'none' }}>
      <YouTube 
        videoId={videoId} 
        opts={opts} 
        onReady={onPlayerReady} 
        onEnd={(e) => e.target.playVideo()}
        // 에러가 발생해도 앱이 죽지 않도록 방어
        onError={(e) => console.error("YouTube Player Error:", e.data)}
      />
    </div>
  );
};

export default MusicPlayer;