import sweatshirtImg from "../../assets/09743e963667fce523552d94caf5de8bf4cf5241.png";
import capImg from "../../assets/86aeade7262b02c7fbb79d4cb1ce30e8984bff4e.png";
import beltImg from "../../assets/belt.png";
import sweatshirt2Img from "../../assets/sweatshirt.png";


export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  description: string;
  sizes: string[];
  tag?: string;
  inStock: boolean;
  collection: string;
  drop: string;
}

export const PRODUCT_IMAGES = {
  sweatshirt: sweatshirtImg,
  belt: beltImg,
  cap: capImg,
  sweatshirt2: sweatshirt2Img,
};

export const products: Product[] = [
  {
    id: 1,
    name: "Toxic Flame Polo Sweatshirt",
    price: 189,
    originalPrice: 230,
    image: PRODUCT_IMAGES.sweatshirt,
    images: [PRODUCT_IMAGES.sweatshirt],
    category: "Tops",
    collection: "SS25",
    drop: "Drop 03",
    description:
      "The signature Toxic Society polo sweatshirt. Deep crimson with rhinestone flame detailing on the sleeves, white contrast collar and cuffs, and the iconic Toxic Society emblem embroidered on the chest. Limited edition drop.",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    tag: "NEW DROP",
    inStock: true,
  },
  {
    id: 2,
    name: "TS Logo Leather Belt",
    price: 129,
    image: PRODUCT_IMAGES.belt,
    images: [PRODUCT_IMAGES.belt],
    category: "Accessories",
    collection: "Core",
    drop: "Drop 01",
    description:
      "Premium red leather belt with the iconic Toxic Society barbed wire logo in silver metal hardware. A statement accessory for those who live on the edge. One size fits most.",
    sizes: ["ONE SIZE"],
    tag: "BESTSELLER",
    inStock: true,
  },
  {
    id: 3,
    name: "Toxic Society Barbed Tee",
    price: 89,
    image: PRODUCT_IMAGES.sweatshirt2,
    images: [PRODUCT_IMAGES.sweatshirt2],
    category: "Tops",
    collection: "Core",
    drop: "Drop 01",
    description:
      "Clean white heavyweight tee with the Toxic Society barbed wire logo screened across the chest in blood red. Simple. Dangerous. Unforgettable.",
    sizes: ["XS", "S", "M", "L", "XL"],
    inStock: true,
  },
  {
    id: 4,
    name: "TS Flame Cargo Pants",
    price: 159,
    image: PRODUCT_IMAGES.sweatshirt2,
    images: [PRODUCT_IMAGES.sweatshirt2],
    category: "Bottoms",
    collection: "SS25",
    drop: "Drop 02",
    description:
      "Crimson cargo pants with subtle flame embroidery along the side seams. Four functional cargo pockets with branded metal zippers. A perfect companion to the Flame Polo Sweatshirt.",
    sizes: ["28", "30", "32", "34", "36"],
    inStock: true,
  },
  {
    id: 5,
    name: "Toxic Society Cap",
    price: 59,
    originalPrice: 79,
    image: PRODUCT_IMAGES.cap,
    images: [PRODUCT_IMAGES.cap],
    category: "Accessories",
    collection: "FW24",
    drop: "Drop 02",
    description:
      "Six-panel structured cap in deep red with embroidered TS logo on the front panel. Adjustable strap with metal clasp. Part of the SS25 collection.",
    sizes: ["ONE SIZE"],
    tag: "SALE",
    inStock: true,
  },
  {
    id: 6,
    name: "Toxic Zip-Up Hoodie",
    price: 219,
    image: PRODUCT_IMAGES.sweatshirt2,
    images: [PRODUCT_IMAGES.sweatshirt2],
    category: "Tops",
    collection: "FW24",
    drop: "Drop 02",
    description:
      "Heavyweight zip-up hoodie in off-white with red Toxic Society screenprint and barbed wire graphic sleeve prints. Oversized fit with dropped shoulders.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
];

export const categories = ["All", "Tops", "Bottoms", "Accessories"];
export const collections = ["All", "SS25", "FW24", "Core"];
export const drops = ["All", "Drop 01", "Drop 02", "Drop 03"];
export const allSizes = ["XS", "S", "M", "L", "XL", "XXL", "ONE SIZE", "28", "30", "32", "34", "36"];
