export type District = {
  id: string;
  name: string;
};

export type Region = {
  id: string;
  name: string;
  districts: District[];
};

export const regions: Region[] = [
  {
    id: "tashkent-city",
    name: "Toshkent shahri",
    districts: [
      { id: "chilonzor", name: "Chilonzor" },
      { id: "mirzo-ulugbek", name: "Mirzo Ulug'bek" },
      { id: "mirobod", name: "Mirobod" },
      { id: "sergeli", name: "Sergeli" },
      { id: "yunusobod", name: "Yunusobod" },
      { id: "yakkasaroy", name: "Yakkasaroy" },
    ],
  },
  {
    id: "tashkent-region",
    name: "Toshkent viloyati",
    districts: [
      { id: "angren", name: "Angren" },
      { id: "bekobod", name: "Bekobod" },
      { id: "chirchiq", name: "Chirchiq" },
      { id: "olmaliq", name: "Olmaliq" },
      { id: "yangiyol", name: "Yangiyo'l" },
    ],
  },
  {
    id: "andijan",
    name: "Andijon viloyati",
    districts: [
      { id: "andijan-city", name: "Andijon shahri" },
      { id: "asaka", name: "Asaka" },
      { id: "xonobod", name: "Xonobod" },
      { id: "shahrixon", name: "Shahrixon" },
      { id: "marhamat", name: "Marhamat" },
    ],
  },
  {
    id: "fergana",
    name: "Farg'ona viloyati",
    districts: [
      { id: "fergana-city", name: "Farg'ona shahri" },
      { id: "qoqon", name: "Qo'qon" },
      { id: "margilon", name: "Marg'ilon" },
      { id: "quva", name: "Quva" },
      { id: "rishton", name: "Rishton" },
    ],
  },
  {
    id: "namangan",
    name: "Namangan viloyati",
    districts: [
      { id: "namangan-city", name: "Namangan shahri" },
      { id: "chust", name: "Chust" },
      { id: "kosonsoy", name: "Kosonsoy" },
      { id: "pop", name: "Pop" },
      { id: "uychi", name: "Uychi" },
    ],
  },
  {
    id: "sirdaryo",
    name: "Sirdaryo viloyati",
    districts: [
      { id: "guliston", name: "Guliston" },
      { id: "yangiyer", name: "Yangiyer" },
      { id: "shirin", name: "Shirin" },
      { id: "boyovut", name: "Boyovut" },
    ],
  },
  {
    id: "jizzax",
    name: "Jizzax viloyati",
    districts: [
      { id: "jizzax-city", name: "Jizzax shahri" },
      { id: "zomin", name: "Zomin" },
      { id: "dostlik", name: "Do'stlik" },
      { id: "paxtakor", name: "Paxtakor" },
      { id: "gallaorol", name: "G'allaorol" },
    ],
  },
  {
    id: "samarkand",
    name: "Samarqand viloyati",
    districts: [
      { id: "samarkand-city", name: "Samarqand shahri" },
      { id: "kattaqorgon", name: "Kattaqo'rg'on" },
      { id: "urgut", name: "Urgut" },
      { id: "bulungur", name: "Bulung'ur" },
      { id: "jomboy", name: "Jomboy" },
    ],
  },
  {
    id: "bukhara",
    name: "Buxoro viloyati",
    districts: [
      { id: "bukhara-city", name: "Buxoro shahri" },
      { id: "kogon", name: "Kogon" },
      { id: "gijduvon", name: "G'ijduvon" },
      { id: "vobkent", name: "Vobkent" },
      { id: "romitan", name: "Romitan" },
    ],
  },
  {
    id: "navoiy",
    name: "Navoiy viloyati",
    districts: [
      { id: "navoiy-city", name: "Navoiy shahri" },
      { id: "zarafshon", name: "Zarafshon" },
      { id: "uchquduq", name: "Uchquduq" },
      { id: "konimex", name: "Konimex" },
      { id: "karmana", name: "Karmana" },
    ],
  },
  {
    id: "kashkadarya",
    name: "Qashqadaryo viloyati",
    districts: [
      { id: "qarshi", name: "Qarshi" },
      { id: "shahrisabz", name: "Shahrisabz" },
      { id: "kitob", name: "Kitob" },
      { id: "guzor", name: "G'uzor" },
      { id: "koson", name: "Koson" },
    ],
  },
  {
    id: "surkhandarya",
    name: "Surxondaryo viloyati",
    districts: [
      { id: "termiz", name: "Termiz" },
      { id: "denov", name: "Denov" },
      { id: "sherobod", name: "Sherobod" },
      { id: "boysun", name: "Boysun" },
      { id: "shorchi", name: "Sho'rchi" },
    ],
  },
  {
    id: "khorezm",
    name: "Xorazm viloyati",
    districts: [
      { id: "urganch", name: "Urganch" },
      { id: "xiva", name: "Xiva" },
      { id: "xonqa", name: "Xonqa" },
      { id: "shovot", name: "Shovot" },
      { id: "gurlan", name: "Gurlan" },
    ],
  },
  {
    id: "karakalpakstan",
    name: "Qoraqalpog'iston Respublikasi",
    districts: [
      { id: "nukus", name: "Nukus" },
      { id: "xojayli", name: "Xo'jayli" },
      { id: "beruniy", name: "Beruniy" },
      { id: "taxtakopir", name: "Taxtako'pir" },
      { id: "chimboy", name: "Chimboy" },
    ],
  },
];
