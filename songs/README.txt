곡 추가하는 법

  songs/<아무_폴더명>/
      audio.wav          음원 (wav / ogg / mp3 / flac)
      jacket.png         자켓 이미지 (선택)
      trace.json         채보 파일 = 난이도 1개
      overload.json
      song.json          곡 공통 메타 (선택)

폴더만 만들어 넣고 곡 선택 화면에서 F5 를 누르면 목록에 나타납니다.
채보가 없으면 곡 선택 화면에서 F2 를 눌러 새 채보를 만들 수 있습니다.

난이도 이름: TRACE / SURGE / OVERLOAD / MELTDOWN / SINGULARITY
곡마다 전용 난이도 이름을 추가로 써도 됩니다(예: OVERVOLTAGE 의 SPARK/ARC FLASH,
Hello world! 의 HELLO/WORLD) — game/songlib.py DIFFICULTIES 와 ui/theme.py
DIFF_COLORS 둘 다에 등록해야 인식됩니다.
포맷은 프로젝트 루트의 README.md, 수정 방법은 MODDING.md 를 보세요.
