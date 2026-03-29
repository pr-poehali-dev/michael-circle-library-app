export type MediaType = 'cassette' | 'cd';
export type AlbumCategory = 'album' | 'compilation';

export interface Track {
  id: number;
  title: string;
  duration: string;
}

export interface Album {
  id: string;
  title: string;
  year: number;
  type: MediaType;
  category: AlbumCategory;
  spineColor: string;
  spineTextColor: string;
  coverColor: string;
  backColor: string;
  label: string;
  description: string;
  tracks: Track[];
}

export const albums: Album[] = [
  {
    id: 'zhigan-limon',
    title: 'Жиган-Лимон',
    year: 1994,
    type: 'cassette',
    category: 'album',
    spineColor: '#1A0E04',
    spineTextColor: '#D4A843',
    coverColor: '#2A1A08',
    backColor: '#1A1208',
    label: 'Союз',
    description: 'Дебютный студийный альбом. Записан в Твери. Первый коммерческий успех.',
    tracks: [
      { id: 1, title: 'Жиган-лимон', duration: '3:42' },
      { id: 2, title: 'Кольщик', duration: '4:15' },
      { id: 3, title: 'Катя-Катерина', duration: '3:58' },
      { id: 4, title: 'Зеленоглазое такси', duration: '3:25' },
      { id: 5, title: 'Владимирский централ', duration: '4:50' },
      { id: 6, title: 'Попурри', duration: '5:10' },
      { id: 7, title: 'Ксюша', duration: '3:30' },
      { id: 8, title: 'Мадам', duration: '4:02' },
    ]
  },
  {
    id: 'vladimirsky-central',
    title: 'Владимирский централ',
    year: 1996,
    type: 'cassette',
    category: 'album',
    spineColor: '#0D1A2A',
    spineTextColor: '#F2C96A',
    coverColor: '#0A1520',
    backColor: '#081018',
    label: 'Звукоград',
    description: 'Альбом назван по одноимённой песне. Одна из самых известных записей.',
    tracks: [
      { id: 1, title: 'Владимирский централ', duration: '4:50' },
      { id: 2, title: 'Шансон', duration: '3:44' },
      { id: 3, title: 'Тверские девочки', duration: '3:20' },
      { id: 4, title: 'Роза', duration: '4:08' },
      { id: 5, title: 'Этапом из Твери', duration: '4:30' },
      { id: 6, title: 'Попробуй докажи', duration: '3:55' },
      { id: 7, title: 'Ночная фея', duration: '3:18' },
      { id: 8, title: 'Зона', duration: '5:05' },
    ]
  },
  {
    id: 'by-the-windows',
    title: 'У окна',
    year: 1998,
    type: 'cassette',
    category: 'album',
    spineColor: '#1A0A1A',
    spineTextColor: '#E8D0A0',
    coverColor: '#150815',
    backColor: '#100510',
    label: 'Союз',
    description: 'Лирический альбом о любви и тоске по родному городу.',
    tracks: [
      { id: 1, title: 'У окна', duration: '4:12' },
      { id: 2, title: 'Любушка', duration: '3:40' },
      { id: 3, title: 'Тихий дворик', duration: '3:55' },
      { id: 4, title: 'Маша', duration: '4:05' },
      { id: 5, title: 'Воровская лирика', duration: '4:28' },
      { id: 6, title: 'Звёздочка', duration: '3:33' },
      { id: 7, title: 'Сирень', duration: '3:20' },
      { id: 8, title: 'Позолоченная осень', duration: '4:15' },
    ]
  },
  {
    id: 'stsenka',
    title: 'Стенка',
    year: 2000,
    type: 'cd',
    category: 'album',
    spineColor: '#0A1508',
    spineTextColor: '#B8D890',
    coverColor: '#081005',
    backColor: '#060C04',
    label: 'Real Records',
    description: 'Первый альбом, изданный на CD. Новое звучание с оркестровыми аранжировками.',
    tracks: [
      { id: 1, title: 'Стенка', duration: '3:48' },
      { id: 2, title: 'Натали', duration: '4:20' },
      { id: 3, title: 'Воровка', duration: '3:35' },
      { id: 4, title: 'Лучшая', duration: '4:10' },
      { id: 5, title: 'Бродяга', duration: '4:55' },
      { id: 6, title: 'Рюмка водки на столе', duration: '3:42' },
      { id: 7, title: 'Свидание', duration: '3:28' },
      { id: 8, title: 'Ромашки', duration: '4:02' },
      { id: 9, title: 'Снегурочка', duration: '3:50' },
    ]
  },
  {
    id: 'shanson',
    title: 'Шансон',
    year: 2001,
    type: 'cd',
    category: 'compilation',
    spineColor: '#1A0808',
    spineTextColor: '#F2C96A',
    coverColor: '#150505',
    backColor: '#100404',
    label: 'Монолит',
    description: 'Сборник лучших песен в жанре шансон. Переиздание классических треков.',
    tracks: [
      { id: 1, title: 'Владимирский централ', duration: '4:50' },
      { id: 2, title: 'Кольщик', duration: '4:15' },
      { id: 3, title: 'Жиган-лимон', duration: '3:42' },
      { id: 4, title: 'Зеленоглазое такси', duration: '3:25' },
      { id: 5, title: 'Тверские девочки', duration: '3:20' },
      { id: 6, title: 'Рюмка водки на столе', duration: '3:42' },
      { id: 7, title: 'Катя-Катерина', duration: '3:58' },
      { id: 8, title: 'Ксюша', duration: '3:30' },
      { id: 9, title: 'Этапом из Твери', duration: '4:30' },
      { id: 10, title: 'Натали', duration: '4:20' },
    ]
  },
  {
    id: 'romantika',
    title: 'Романтика',
    year: 2003,
    type: 'cd',
    category: 'album',
    spineColor: '#08101A',
    spineTextColor: '#A8C8F0',
    coverColor: '#050C15',
    backColor: '#040810',
    label: 'Real Records',
    description: 'Последний студийный альбом. Глубокая лирика и проникновенные баллады.',
    tracks: [
      { id: 1, title: 'Романтика', duration: '4:30' },
      { id: 2, title: 'Люба', duration: '3:55' },
      { id: 3, title: 'Я не забуду', duration: '4:18' },
      { id: 4, title: 'Дорогой длинной', duration: '4:45' },
      { id: 5, title: 'Морозная ночь', duration: '3:40' },
      { id: 6, title: 'Память', duration: '5:02' },
      { id: 7, title: 'Последний раз', duration: '4:12' },
      { id: 8, title: 'Прощай', duration: '4:38' },
    ]
  },
];

export const biography = [
  { year: 1962, event: 'Михаил Владимирович Воробьёв (Михаил Круг) родился 7 апреля в Калинине (Тверь).' },
  { year: 1980, event: 'Начало музыкальной карьеры. Первые выступления в городских кафе Твери.' },
  { year: 1990, event: 'Запись первых демозаписей. Формирование авторского стиля в жанре русского шансона.' },
  { year: 1994, event: 'Выход дебютного альбома «Жиган-Лимон». Песня «Владимирский централ» становится народным гимном.' },
  { year: 1996, event: 'Альбом «Владимирский централ» выходит тиражом в несколько сотен тысяч экземпляров.' },
  { year: 1998, event: 'Продолжение успеха с альбомом «У окна». Всесоюзный гастрольный тур.' },
  { year: 2000, event: 'Переход на CD-формат. Альбом «Стенка» — новый этап в звучании.' },
  { year: 2001, event: 'Выход сборника лучших хитов «Шансон». Признание на всём постсоветском пространстве.' },
  { year: 2002, event: 'Трагическая гибель 1 июля. Михаилу Кругу было 40 лет.' },
  { year: 2003, event: 'Посмертный выход альбома «Романтика». Музыкальное наследие продолжает жить.' },
];
