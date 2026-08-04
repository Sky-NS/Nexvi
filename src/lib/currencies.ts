export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

// A practical list of common world currencies. Extend freely — nothing
// elsewhere in the app assumes a fixed length or order.
export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'Доллар США', symbol: '$' },
  { code: 'EUR', name: 'Евро', symbol: '€' },
  { code: 'RUB', name: 'Российский рубль', symbol: '₽' },
  { code: 'GBP', name: 'Фунт стерлингов', symbol: '£' },
  { code: 'JPY', name: 'Японская йена', symbol: '¥' },
  { code: 'CNY', name: 'Китайский юань', symbol: '¥' },
  { code: 'KRW', name: 'Южнокорейская вона', symbol: '₩' },
  { code: 'THB', name: 'Тайский бат', symbol: '฿' },
  { code: 'VND', name: 'Вьетнамский донг', symbol: '₫' },
  { code: 'IDR', name: 'Индонезийская рупия', symbol: 'Rp' },
  { code: 'INR', name: 'Индийская рупия', symbol: '₹' },
  { code: 'AED', name: 'Дирхам ОАЭ', symbol: 'د.إ' },
  { code: 'TRY', name: 'Турецкая лира', symbol: '₺' },
  { code: 'GEL', name: 'Грузинский лари', symbol: '₾' },
  { code: 'AMD', name: 'Армянский драм', symbol: '֏' },
  { code: 'KZT', name: 'Казахстанский тенге', symbol: '₸' },
  { code: 'CHF', name: 'Швейцарский франк', symbol: 'CHF' },
  { code: 'SEK', name: 'Шведская крона', symbol: 'kr' },
  { code: 'NOK', name: 'Норвежская крона', symbol: 'kr' },
  { code: 'DKK', name: 'Датская крона', symbol: 'kr' },
  { code: 'PLN', name: 'Польский злотый', symbol: 'zł' },
  { code: 'CZK', name: 'Чешская крона', symbol: 'Kč' },
  { code: 'HUF', name: 'Венгерский форинт', symbol: 'Ft' },
  { code: 'RSD', name: 'Сербский динар', symbol: 'дин.' },
  { code: 'EGP', name: 'Египетский фунт', symbol: 'ج.م' },
  { code: 'MAD', name: 'Марокканский дирхам', symbol: 'د.م.' },
  { code: 'ILS', name: 'Израильский шекель', symbol: '₪' },
  { code: 'MXN', name: 'Мексиканское песо', symbol: '$' },
  { code: 'BRL', name: 'Бразильский реал', symbol: 'R$' },
  { code: 'ARS', name: 'Аргентинское песо', symbol: '$' },
  { code: 'CAD', name: 'Канадский доллар', symbol: '$' },
  { code: 'AUD', name: 'Австралийский доллар', symbol: '$' },
  { code: 'NZD', name: 'Новозеландский доллар', symbol: '$' },
  { code: 'SGD', name: 'Сингапурский доллар', symbol: '$' },
  { code: 'HKD', name: 'Гонконгский доллар', symbol: '$' },
  { code: 'MYR', name: 'Малайзийский ринггит', symbol: 'RM' },
  { code: 'PHP', name: 'Филиппинское песо', symbol: '₱' },
  { code: 'ZAR', name: 'Южноафриканский рэнд', symbol: 'R' },
  { code: 'QAR', name: 'Катарский риал', symbol: 'ر.ق' },
  { code: 'SAR', name: 'Саудовский риял', symbol: 'ر.س' },
];

export function getCurrency(code: string): Currency | undefined {
  return CURRENCIES.find((c) => c.code === code);
}

export function getCurrencySymbol(code: string): string {
  return getCurrency(code)?.symbol || code || '$';
}
