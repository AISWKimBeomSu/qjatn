const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const Post = require("../models/Post");
const asyncHandler = require("express-async-handler");
const { dalle } = require("../openai");

const mainLayout = "../views/layouts/main.ejs";
const mainLayout2 = "../views/layouts/main2.ejs"; // 로그인 후 레이아웃 추가

// 🔹 업로드 폴더 경로 설정
//const uploadDir = path.join(__dirname, "../public/uploads");

// 🔹 `public/uploads` 폴더가 없으면 생성
//if (!fs.existsSync(uploadDir)) {
//    fs.mkdirSync(uploadDir, { recursive: true });
//}

router.get(["/", "/home"], asyncHandler(async(req, res) => {
    const locals = { title: "Home" };
    const data = await Post.find({}).sort({ createdAt: -1 });

    // 🔹 로그인 여부 확인 후 사용자 정보 전달
    if (req.session && req.session.user) {
        res.render("index", { locals, data, user: req.session.user, layout: mainLayout2 });
    } else {
        res.render("index", { locals, data, user: null, layout: mainLayout });
    }
}));

router.get("/post/:id", asyncHandler(async(req, res) => {
    const data = await Post.findOne({ _id: req.params.id });

    let imageBase64 = null;
    if (data.image) {
        imageBase64 = `data:${data.contentType};base64,${data.image.toString("base64")}`;
    }

    res.render("post", { data, imageBase64, layout: mainLayout });
}));

// 🔹 AI 이미지 생성 및 저장 (이미지를 파일로 저장하고, DB에는 Buffer 데이터 저장)
// 🔹 AI 이미지 생성 및 저장 (화풍 반영)
router.get("/generate-image/:id", asyncHandler(async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "게시물을 찾을 수 없습니다" });
        }

        // 🔹 선택된 화풍 스타일을 프롬프트에 반영
        const styleMap = {
            anime: "vibrant anime-style",
            realistic: "photo-realistic",
            watercolor: "soft watercolor painting",
            pixelart: "8-bit pixel art",
        };
        const selectedStyle = styleMap[post.style] || "anime";

        const prompt = `Create a high-quality, ${selectedStyle} illustration inspired by the following post. 
        The image should visually represent the theme and emotions conveyed in the post.

        Title: "${post.title}"
        Content: "${post.body}"

        Ensure that the image follows the selected style: ${selectedStyle}.`;

        const dalleResponse = await dalle.text2im({ prompt });
        const imageUrl = dalleResponse;

        // 이미지 처리 및 저장 (이전 코드 유지)
        const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const imageBuffer = imageResponse.data;
        const imageFileName = `post_${post._id}.jpg`;
        //const imagePath = path.join(uploadDir, imageFileName);
        //fs.writeFileSync(imagePath, await sharp(imageBuffer).jpeg({ quality: 90 }).toBuffer());

        post.image = imageBuffer;
        await post.save();

        res.json({ message: "이미지가 저장되었습니다.", imagePath: `/uploads/${imageFileName}` });
    } catch (error) {
        console.error("❌ 이미지 생성 및 저장 중 오류:", error);
        res.status(500).json({ message: "이미지 생성 중 오류 발생" });
    }
}));


// 🔹 DB에서 이미지 파일을 제공하는 엔드포인트 추가
router.get("/image/:id", asyncHandler(async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post || !post.image) {
            return res.status(404).json({ message: "이미지가 없습니다." });
        }

        res.set("Content-Type", "image/jpeg");
        res.send(post.image); // 🔹 Binary 데이터 응답
    } catch (error) {
        console.error("❌ 이미지 제공 중 오류:", error);
        res.status(500).json({ message: "이미지를 불러오는 중 오류 발생" });
    }
}));

// 🔹 정적 파일 제공 (저장된 이미지 서빙)
//router.use("/uploads", express.static(uploadDir));

router.get("/about", (req, res) => {
    res.render("about", { layout: mainLayout });
});

module.exports = router;
    
