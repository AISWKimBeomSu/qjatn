require("dotenv").config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const connectDb = require("./config/db");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");  // ✅ MongoDB 기반 세션 저장소 추가
const methodOverride = require("method-override");
const jwt = require("jsonwebtoken");
const cors = require("cors");  // ✅ CORS 추가

const app = express();
const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET;
const sessionSecret = process.env.SESSION_SECRET || "default-secret-key";  // ✅ 보안 강화

// ✅ MongoDB 연결
connectDb().catch(err => {
    console.error("❌ MongoDB 연결 실패:", err);
    process.exit(1);
});

// 🔹 CORS 설정 (필요한 경우 프론트엔드 주소를 추가)
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));

// 🔹 레이아웃 및 뷰 엔진 설정
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", "./views");

// 🔹 정적 파일 제공
app.use(express.static("public"));

// ✅ MongoDB 기반 세션 저장 (MemoryStore 경고 해결)
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,  // ✅ .env에서 DB URL 가져오기
        ttl: 14 * 24 * 60 * 60  // 14일 동안 세션 유지
    }),
    cookie: {
        secure: process.env.NODE_ENV === "production",  // 🚀 HTTPS 환경에서만 쿠키 전송
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 14  // 14일 유지
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser());

// ✅ 로그인 여부 확인 미들웨어
const checkLoginStatus = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, jwtSecret);
            res.locals.isAuthenticated = true;
            res.locals.userId = decoded.id;
        } catch (err) {
            res.locals.isAuthenticated = false;
        }
    } else {
        res.locals.isAuthenticated = false;
    }
    next();
};

// ✅ 로그인 상태 미들웨어 적용
app.use(checkLoginStatus);

// ✅ 라우터 등록
app.use("/", require("./routes/main"));
app.use("/", require("./routes/admin"));

// ✅ 서버 실행
app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 APP listening on port ${port}`);
});
