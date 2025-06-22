## Mystory
MyStory는 사용자가 입력한 텍스트 프롬프트를 바탕으로 OpenAI의 DALL·E 모델을 통해 이미지를 생성해주는 Node.js 기반의 웹 애플리케이션입니다.  
Express.js와 MongoDB를 기반으로 서버를 구성하였으며, 세션 관리 및 인증, CORS 설정, 파일 업로드 등 실용적인 웹 백엔드 구성이 포함되어 있습니다.

🚀 주요 기능

- ✅ 사용자가 입력한 텍스트 프롬프트를 OpenAI API에 전달
- ✅ DALL·E를 이용한 1024x1024 이미지 생성
- ✅ 세션 기반 사용자 관리 및 JWT 토큰 처리
- ✅ EJS 템플릿 기반 프론트 페이지 제공
- ✅ 이미지 생성 실패 시 예외 처리 및 기본 이미지 반환
- ✅ Nodemon을 이용한 실시간 서버 개발 환경 지원


⚙️ 사용 기술 스택

| 항목          | 기술                  |
|---------------|-----------------------|
| 백엔드        | Node.js, Express.js   |
| 템플릿 엔진   | EJS, express-ejs-layouts |
| 데이터베이스   | MongoDB + Mongoose    |
| 인증 및 세션  | JWT, express-session, connect-mongo |
| 이미지 생성   | OpenAI DALL·E API     |
| 파일 업로드   | Multer, Sharp         |
| 기타          | dotenv, CORS, bcrypt  |

📁 프로젝트 구조
```plaintext
qjatn/
├── app.js               # 메인 서버 실행 파일
├── openai.js            # OpenAI DALL·E 연동 모듈
├── config/              # MongoDB 설정 폴더
│   └── db.js
├── routes/              # 라우터 모듈 (예: imageRouter 등)
├── models/              # Mongoose 데이터 모델
├── views/               # EJS 템플릿 뷰 폴더
│   └── layouts/         # 공통 레이아웃 템플릿
├── public/              # 정적 파일(css, js, img 등)
├── .env                 # 환경변수 파일 (비공개)
├── .gitignore
├── package.json
└── README.md
```

## 참고 및 주의사항
DALL·E API는 OpenAI 요금제 한도에 따라 동작이 제한될 수 있습니다.

이미지 생성 실패 시 기본 이미지로 대체됩니다.

본 프로젝트는 학습 및 데모 목적으로 제작되었습니다.

👤 개발자

-심태보

-신채운

-권지운

-신승민

-김범수

------------------------------------------------------------------------------------------
-git clone 시 설정 사항
1.npm i express
2.npm install -g nodemon
3. .gitignore 파일 생성
/////////////////////////////////////////////////
# Node.js 관련 파일
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 환경변수 파일 (비밀번호, API 키 등 포함)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 빌드/캐시 파일
dist/
build/
.cache/
.tmp/
out/

# 로그 파일
logs
*.log
logs/
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*
lerna-debug.log*

# OS 및 IDE 관련 파일
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
*.swo

# Git 관련 무시 파일
.git/
.gitignore
///////////////////////////////////////////////

4. .env 파일 생성
카톡방 참고
