효과음 (wav / ogg). 같은 이름으로 덮어쓰면 그 소리가 쓰입니다.
게임 안에서 F7 을 누르면 다시 읽습니다.

  hit.wav            노트 판정음
  miss.wav           미스
  ui_move.wav        메뉴 이동
  ui_select.wav      메뉴 선택
  metronome.wav      에디터 메트로놈 (박)
  metronome_hi.wav   에디터 메트로놈 (마디 첫 박)

새 이름의 파일을 넣으면 코드에서 audio.play_sfx("파일명") 으로 부를 수 있고,
채보 이벤트 {"beat": 32, "type": "sfx", "name": "파일명"} 으로도 재생됩니다.
