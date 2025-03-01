const express = require("express");
const router = express.Router();
const adminLayout = "../views/layouts/admin";
const adminLayout2 = "../views/layouts/admin-nologout";
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const jwtSecret = process.env.JWT_SECRET;

// ✅ 로그인 상태 확인 미들웨어
const checkLogin = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect("/admin");
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.id;
        res.locals.isAuthenticated = true;
        next();
    } catch (error) {
        res.clearCookie("token");
        return res.redirect("/admin");
    }
};

// ✅ 로그인 페이지 렌더링
router.get("/admin", (req, res) => {
    const locals = { title: "관리자 페이지" };

    if (res.locals.isAuthenticated) {
        return res.redirect("/allPosts");
    }
    res.render("admin/index", { locals, layout: adminLayout2 });
});

// ✅ 로그인 처리
router.post(
    "/admin",
    asyncHandler(async (req, res) => {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
        }

        const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "1d" });

        req.session.user = { id: user._id, username: user.username };
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.redirect("/");
    })
);

// ✅ 회원가입 페이지 렌더링
router.get("/register", (req, res) => {
    res.render("admin/register", { title: "회원가입", layout: adminLayout2 });
});

// ✅ 회원가입 처리
router.post(
    "/register",
    asyncHandler(async (req, res) => {
        const { username, password } = req.body;

        if (await User.findOne({ username })) {
            return res.status(400).json({ message: "이미 존재하는 사용자입니다." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await new User({ username, password: hashedPassword }).save();

        res.redirect("/admin");
    })
);

// ✅ 게시물 목록 페이지 (UTC → KST 변환)
router.get(
    "/allPosts",
    checkLogin,
    asyncHandler(async (req, res) => {
        const locals = { title: "Posts" };
        const posts = await Post.find().sort({ updatedAt: "desc", createdAt: "desc" });

        const formattedPosts = posts.map(post => ({
            ...post._doc,
            createdAt: moment(post.createdAt).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        }));

        res.render("admin/allPosts", { locals, data: formattedPosts, layout: adminLayout });
    })
);

// ✅ 로그아웃
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("세션 삭제 오류:", err);
            return res.status(500).json({ message: "로그아웃 중 오류 발생" });
        }
        res.clearCookie("token");
        res.redirect("/");
    });
});

// ✅ 게시물 작성 페이지 렌더링
router.get(
    "/add",
    checkLogin,
    asyncHandler(async (req, res) => {
        res.render("admin/add", { title: "게시물 작성", layout: adminLayout });
    })
);

// ✅ 게시물 추가 (KST로 변환하여 저장)
router.post(
    "/add",
    checkLogin,
    asyncHandler(async (req, res) => {
        const { title, body, style } = req.body;

        const newPost = new Post({
            title,
            body,
            style,
            createdAt: moment().tz("Asia/Seoul").toDate()
        });

        await newPost.save();
        res.redirect(`/post/${newPost._id}`);
    })
);

// ✅ 게시물 수정 페이지 렌더링
router.get(
    "/edit/:id",
    checkLogin,
    asyncHandler(async (req, res) => {
        const locals = { title: "게시물 편집" };
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).send("게시물을 찾을 수 없습니다.");
        }

        res.render("admin/edit", { locals, data: post, layout: adminLayout });
    })
);

// ✅ 게시물 수정 (KST 시간 변환 후 저장)
router.put(
    "/edit/:id",
    checkLogin,
    asyncHandler(async (req, res) => {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            createdAt: moment().tz("Asia/Seoul").toDate()
        });

        res.redirect("/allPosts");
    })
);

// ✅ 게시물 삭제
router.delete(
    "/delete/:id",
    checkLogin,
    asyncHandler(async (req, res) => {
        await Post.findByIdAndDelete(req.params.id);
        res.redirect("/allPosts");
    })
);

module.exports = router;
