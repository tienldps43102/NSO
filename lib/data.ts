export interface Category {
  id: string;
  name: string;
  active?: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  cover: string;
  badge?: "HOT" | "MỚI" | string;
  discount?: number;
}

export interface LightNovel extends Book {
  tag?: "Mới phát hành" | "Tái bản" | "Hot";
}

export interface BestSeller extends Book {
  rank: number;
}

export const categories: Category[] = [
  { id: "all", name: "Tất cả", active: true },
  { id: "isekai", name: "Isekai" },
  { id: "romance", name: "Romance" },
  { id: "shonen", name: "Shonen" },
  { id: "slice-of-life", name: "Slice of Life" },
  { id: "school-life", name: "School Life" },
  { id: "horror", name: "Horror" },
  { id: "comedy", name: "Comedy" },
  { id: "detective", name: "Detective" },
];

export const navLinks = [
  { name: "Manga", href: "#manga" },
  { name: "Light Novel", href: "#lightnovel" },
  { name: "Comic Việt", href: "#comicviet" },
  { name: "Sách Mới", href: "#sachmoi" },
];

export const featuredManga: Book[] = [
  {
    id: "1",
    title: "Spy x Family - Tập 10",
    author: "Tatsuya Endo",
    price: 25000,
    cover: "/covers/spy-family.jpg",
    badge: "HOT",
  },
  {
    id: "2",
    title: "One Piece - Tập 100: Haoshoku",
    author: "Eiichiro Oda",
    price: 22000,
    cover: "/covers/one-piece.jpg",
    badge: "MỚI",
  },
  {
    id: "3",
    title: "Chainsaw Man - Tập 12",
    author: "Tatsuki Fujimoto",
    price: 30000,
    cover: "/covers/chainsaw-man.jpg",
  },
  {
    id: "4",
    title: "Jujutsu Kaisen - Chú Thuật Hồi Chiến Vol...",
    author: "Gege Akutami",
    price: 22500,
    originalPrice: 25000,
    cover: "/covers/jujutsu-kaisen.jpg",
    discount: 10,
  },
  {
    id: "5",
    title: "Blue Lock - Tập 5",
    author: "Muneyuki Kaneshiro",
    price: 25000,
    cover: "/covers/blue-lock.jpg",
  },
];

export const lightNovels: LightNovel[] = [
  {
    id: "ln1",
    title: "Thiên Sứ Nhà Bên",
    author: "Saeki-san",
    price: 98000,
    cover: "/covers/tenshi.jpg",
    tag: "Mới phát hành",
  },
  {
    id: "ln2",
    title: "Sword Art Online: Progressive 5",
    author: "Reki Kawahara",
    price: 110000,
    cover: "/covers/sao.jpg",
    tag: "Tái bản",
  },
  {
    id: "ln3",
    title: "Chuyện Tình Thanh Xuân Bi Hài",
    author: "Wataru Watari",
    price: 105000,
    cover: "/covers/oregairu.jpg",
    tag: "Hot",
  },
  {
    id: "ln4",
    title: "Overlord - Tập 14",
    author: "Kugane Maruyama",
    price: 125000,
    cover: "/covers/overlord.jpg",
    tag: "Mới phát hành",
  },
  {
    id: "ln5",
    title: "Re:Zero - Tập 18",
    author: "Tappei Nagatsuki",
    price: 115000,
    cover: "/covers/rezero.jpg",
    tag: "Hot",
  },
];

export const bestSellers: BestSeller[] = [
  {
    id: "bs1",
    title: "Spy x Family - Vol. 10",
    author: "Tatsuya Endo",
    price: 25000,
    originalPrice: 31250,
    cover: "/covers/spy-family.jpg",
    rank: 1,
    discount: 20,
  },
  {
    id: "bs2",
    title: "One Piece - Vol. 100",
    author: "Eiichiro Oda",
    price: 22000,
    cover: "/covers/one-piece.jpg",
    rank: 2,
  },
  {
    id: "bs3",
    title: "Blue Lock - Vol. 5",
    author: "Muneyuki Kaneshiro",
    price: 25000,
    cover: "/covers/blue-lock.jpg",
    rank: 3,
  },
];

export const footerLinks = {
  categories: [
    { name: "Manga", href: "#" },
    { name: "Light Novel", href: "#" },
    { name: "Comic Việt Nam", href: "#" },
    { name: "Sách Kỹ Năng", href: "#" },
    { name: "Phụ kiện", href: "#" },
  ],
  support: [
    { name: "Hướng dẫn mua hàng", href: "#" },
    { name: "Chính sách đổi trả", href: "#" },
    { name: "Phí vận chuyển", href: "#" },
    { name: "Phương thức thanh toán", href: "#" },
    { name: "Liên hệ", href: "#" },
  ],
};
