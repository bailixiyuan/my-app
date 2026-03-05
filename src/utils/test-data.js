// 测试数据生成脚本
import db from "./db";

// 衣物类型列表
const CLOTHING_TYPES = ["top", "bottom", "outerwear", "shoes", "accessories"];

// 季节列表
const SEASONS = ["春夏", "秋冬", "四季"];

// 标签列表
const TAGS = [
  "休闲",
  "通勤",
  "运动",
  "复古",
  "极简",
  "设计感",
  "约会",
  "基础款",
];

// 衣物名称前缀
const CLOTHING_NAMES = {
  top: ["T恤", "衬衫", "毛衣", "卫衣", "背心"],
  bottom: ["牛仔裤", "休闲裤", "运动裤", "裙子", "短裤"],
  outerwear: ["夹克", "外套", "大衣", "风衣", "羽绒服"],
  shoes: ["板鞋", "运动鞋", "皮鞋", "靴子", "凉鞋"],
  accessories: ["项链", "手链", "帽子", "围巾", "眼镜"],
};

// 颜色列表
const COLORS = ["白色", "黑色", "灰色", "蓝色", "红色", "绿色", "黄色", "棕色"];

// 生成随机数
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 生成随机标签组合
const generateRandomTags = () => {
  const tagCount = random(1, 3);
  const shuffledTags = [...TAGS].sort(() => 0.5 - Math.random());
  return shuffledTags.slice(0, tagCount);
};

// 生成随机衣物数据
const generateClothingData = (index) => {
  const type = CLOTHING_TYPES[random(0, CLOTHING_TYPES.length - 1)];
  const namePrefix = COLORS[random(0, COLORS.length - 1)];
  const nameSuffix =
    CLOTHING_NAMES[type][random(0, CLOTHING_NAMES[type].length - 1)];

  return {
    type,
    src: `https://picsum.photos/400/400?random=${index}`, // 使用随机图片
    name: `${namePrefix}${nameSuffix}`,
    timesWorn: random(0, 30),
    season: SEASONS[random(0, SEASONS.length - 1)],
    tags: generateRandomTags(),
  };
};

// 批量插入测试数据
const insertTestData = async () => {
  try {
    console.log("开始插入测试数据...");

    // 初始化数据库
    await db.initDB();

    // 生成100条测试数据
    const testData = [];
    for (let i = 1; i <= 100; i++) {
      testData.push(generateClothingData(i));
    }

    // 批量插入数据
    let successCount = 0;
    for (const item of testData) {
      try {
        await db.addClothing(item);
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`已插入 ${successCount} 条数据`);
        }
      } catch (error) {
        console.error(`插入数据失败: ${error}`);
      }
    }

    console.log(`测试数据插入完成，成功插入 ${successCount} 条数据`);

    // 验证数据总数
    const allData = await db.getAllClothing();
    console.log(`数据库中共有 ${allData.length} 条数据`);
  } catch (error) {
    console.error("测试数据插入失败:", error);
  }
};

// 运行测试数据插入
if (typeof window !== "undefined") {
  // 在浏览器环境中运行
  window.insertTestData = insertTestData;
  console.log(
    "测试数据插入函数已添加到window对象，请运行 insertTestData() 开始插入",
  );
} else {
  // 在Node.js环境中运行
  insertTestData();
}

export default insertTestData;
