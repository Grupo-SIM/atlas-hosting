import {
  boolean,
  date,
  doublePrecision,
  integer,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

export const pgDomainPricingCache = pgTable("domain_pricing_cache", {
  id: uuid("id").primaryKey().defaultRandom(),
  tld: text("tld").unique().notNull(),
  price: doublePrecision("price"),
  renew: doublePrecision("renew"),
  transfer: doublePrecision("transfer"),
  minRegisterYears: integer("min_register_years"),
  maxRegisterYears: integer("max_register_years"),
  createdAt: date("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: date("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const ipLocationCache = pgTable("ip_location_cache", {
  id: uuid("id").primaryKey().defaultRandom(),
  ip: text("ip").unique().notNull(),
  countryCode: text("country_code").notNull(),
  countryName: text("country_name").notNull(),
  regionName: text("region_name").notNull(),
  cityName: text("city_name").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  zipCode: text("zip_code").notNull(),
  timeZone: text("time_zone").notNull(),
  asn: text("asn").notNull(),
  as: text("as").notNull(),
  isProxy: boolean("is_proxy").notNull(),
  createdAt: date("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: date("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export type DomainPricing = typeof pgDomainPricingCache.$inferSelect;
export type DomainPricingInsert = typeof pgDomainPricingCache.$inferInsert;
