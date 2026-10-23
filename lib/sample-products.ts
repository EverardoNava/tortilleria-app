export const sampleProducts = [
  {
    id: "tortillas-maiz",
    name: "Tortillas de maíz",
    description: "Maíz nixtamalizado, recién salido del comal.",
    price: 24,
    unit: "el kilo",
    image: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=900&q=85",
    tag: "Favorito",
  },
  {
    id: "totopos-caseros",
    name: "Totopos caseros",
    description: "Crujientes, doraditos y hechos con nuestras tortillas.",
    price: 32,
    unit: "la bolsa",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85",
    tag: "Para compartir",
  },
  {
    id: "masa-fresca",
    name: "Masa fresca",
    description: "Molida cada mañana. Lista para tus recetas favoritas.",
    price: 22,
    unit: "el kilo",
    image: "https://tse2.mm.bing.net/th/id/OIP.S6OFeL3vHEmj0mTLL7BMFwHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    tag: "Del día",
  },
];

export type PublicProduct = (typeof sampleProducts)[number];