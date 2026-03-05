// 可用标签
export const AVAILABLE_TAGS = [
  "通勤",
  "休闲",
  "约会",
  "运动",
  "基础款",
  "复古",
  "极简",
];

// 分类映射
export const CAT_MAP = {
  全部: "all",
  上装: "top",
  下装: "bottom",
  外套: "outerwear",
  鞋靴: "shoes",
  配饰: "accessories",
};

// 衣物数据
export const CLOTHING_DATA = [
  {
    id: 1,
    type: "top",
    src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
    name: "基础白T恤",
    timesWorn: 12,
    season: "春夏",
    tags: ["基础款", "休闲"],
  },
  {
    id: 2,
    type: "bottom",
    src: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80",
    name: "直筒牛仔裤",
    timesWorn: 8,
    season: "四季",
    tags: ["休闲", "通勤"],
  },
  {
    id: 3,
    type: "outerwear",
    src: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
    name: "复古皮夹克",
    timesWorn: 3,
    season: "秋冬",
    tags: ["复古", "约会"],
  },
  {
    id: 4,
    type: "shoes",
    src: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80",
    name: "运动板鞋",
    timesWorn: 24,
    season: "四季",
    tags: ["运动", "休闲"],
  },
  {
    id: 5,
    type: "top",
    src: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&q=80",
    name: "黑色高领毛衣",
    timesWorn: 5,
    season: "秋冬",
    tags: ["极简", "通勤"],
  },
  {
    id: 6,
    type: "accessories",
    src: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400&q=80",
    name: "金属项链",
    timesWorn: 15,
    season: "四季",
    tags: ["复古", "设计感"],
  },
];

// 分类列表
export const CATEGORIES = ["全部", "上装", "下装", "外套", "鞋靴", "配饰"];
