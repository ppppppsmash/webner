import type { PublicDictionary } from "./types";

export const zhCN: PublicDictionary = {
  meta: {
    siteTitle: "webner 苇柏纳",
    tagline: "来自德国的精油与天然护肤",
    description: "webner 苇柏纳－德国制造的纯天然精油、纯露与天然护肤品。探索完整系列。",
  },
  nav: {
    home: "首页",
    products: "商品",
    categories: "分类",
    about: "关于 webner",
    shop: "前往商店",
    menu: "菜单",
    close: "关闭",
    language: "语言",
  },
  hero: {
    eyebrow: "芳香疗法 · 芳香护理 · 天然护肤",
    title: "植物的力量，于德国蒸馏而成。",
    lead: "webner 代表纯净的精油、珍贵的原精与滋养的护理油－为面部、身体与感官细心调配。",
    ctaProducts: "探索商品",
    ctaStory: "品牌故事",
  },
  story: {
    eyebrow: "关于 webner",
    title: "源自对自然香气的热爱",
    body: [
      "数十年来，webner 将芳香疗法的专业与德国工艺的严谨相结合。每一款精油均取自严选原料，并经过纯度检测。",
      "玫瑰、茉莉或乳香－我们的配方旨在滋养、安抚，让日常生活多一点香气。",
    ],
  },
  values: {
    title: "我们的坚持",
    items: [
      { title: "纯净天然", body: "100% 天然成分，不含合成香精。" },
      { title: "德国制造", body: "依循严格的品质标准研发与灌装。" },
      { title: "芳疗专业", body: "配方建立于数十年精油研究的经验之上。" },
    ],
  },
  home: {
    categoriesTitle: "商品分类",
    categoriesLead: "找到属于你的精油－面部、身体、居家与仪式。",
    featuredTitle: "推荐商品",
    featuredLead: "系列中最受喜爱的选品。",
    latestTitle: "最新上架",
    viewAll: "查看全部商品",
    shopBannerTitle: "台湾官方合作伙伴销售中",
    shopBannerBody: "所有 webner 商品均可在合作伙伴的官方在线商店订购。",
    shopBannerCta: "前往商店",
  },
  products: {
    title: "商品",
    lead: "一览完整的 webner 系列。",
    all: "全部",
    count: (n) => `${n} 件商品`,
    empty: "此分类目前尚无商品。",
    filterBy: "按分类浏览",
    details: "详细信息",
    volume: "容量",
    category: "分类",
    buyAt: "前往商店查看",
    buyAtHint: "将在新标签页打开合作伙伴的在线商店。",
    related: "你可能也会喜欢",
    backToList: "返回商品列表",
    videos: "视频",
    description: "商品说明",
    noImage: "暂无图片",
  },
  about: {
    title: "关于 webner",
    lead: "纯净精油与天然护肤－在德国细心制造。",
    sections: [
      {
        title: "品牌起源",
        body: "webner 源自一个信念：植物的力量在未经修饰时最为强大。纯净、透明与工艺，从一开始就是我们的核心。",
      },
      {
        title: "原料来源",
        body: "我们只向熟识且信任的伙伴采购原料。每一批原料在成为 webner 商品前都经过检测。",
      },
      {
        title: "品牌理念",
        body: "对我们而言，芳香疗法是生活中的正念练习：一滴精油，一次深呼吸，一个属于自己的片刻。",
      },
    ],
  },
  footer: {
    about: "webner 苇柏纳－来自德国的精油与天然护肤。",
    categories: "商品分类",
    links: "更多",
    distributor: "台湾官方合作伙伴",
    distributorBody: "久保雅司國際股份有限公司 · 台北",
    rights: "版权所有。",
    management: "管理后台",
  },
  notFound: {
    title: "找不到页面",
    body: "您要找的页面不存在或已移动。",
    cta: "回到首页",
  },
};
