import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const pgDomainPricingCache = pgTable("domain_pricing_cache", {
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  maxRegisterYears: integer("max_register_years"),
  minRegisterYears: integer("min_register_years"),
  price: doublePrecision("price"),
  renew: doublePrecision("renew"),
  tld: text("tld").unique().notNull(),
  transfer: doublePrecision("transfer"),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const ipLocationCache = pgTable("ip_location_cache", {
  as: text("as").notNull(),
  asn: text("asn").notNull(),
  cityName: text("city_name").notNull(),
  countryCode: text("country_code").notNull(),
  countryName: text("country_name").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  ip: text("ip").unique().notNull(),
  isProxy: boolean("is_proxy").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  regionName: text("region_name").notNull(),
  timeZone: text("time_zone").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  zipCode: text("zip_code").notNull(),
});

export type DomainPricing = typeof pgDomainPricingCache.$inferSelect;
export type DomainPricingInsert = typeof pgDomainPricingCache.$inferInsert;
