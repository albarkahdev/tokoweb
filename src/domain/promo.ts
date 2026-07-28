export type PromoWindow = {
  start_date: string;
  end_date: string;
};

export function isPromoActive(promo: PromoWindow, todayWib: string): boolean {
  return promo.start_date <= todayWib && todayWib <= promo.end_date;
}
