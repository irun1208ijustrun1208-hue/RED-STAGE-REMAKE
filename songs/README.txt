곡 추가하는 법 (RED REMAKE 1.0.0 — C# 판)

  songs/<아무_폴더명>/
      audio.mp3          음원 (wav / ogg / mp3 / flac)
      jaket.png          자켓 이미지 (선택, jacket/cover 이름도 됨)
      trace.json         채보 파일 = 난이도 1개 (format 3)
      overload.json
      song.json          곡 공통 메타 (선택)

폴더를 넣고 곡 선택 화면에서 F5 를 누르면 목록에 나타납니다.
채보는 게임 안 에디터(곡 선택에서 Ctrl+N)로 만들거나,
자동 채보기 AutoChart.exe 에 음원 + MIDI 를 넣어 만들 수 있습니다.
기본 난이도: TRACE / SURGE / OVERLOAD / MELTDOWN / SINGULARITY (곡마다 전용 이름도 가능)
