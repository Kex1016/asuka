import type { exampleLocale } from "../util/localize.ts";

export type I18nLanguages = "en-US" | "hu" | "de";

// en-US is the default locale, so we can use it as a base.
export type I18nKeys = (typeof exampleLocale)["en-US"];

export type I18n = {
  [key in I18nLanguages]?: I18nKeys;
};

export class AsukaI18n {
  private _i18n: I18n;

  private async readLocale(): Promise<string> {
    // Read the locale from a local file
    const file = Bun.file("./locale.json");
    return new TextDecoder().decode(await file.arrayBuffer());
  }

  private parseLocale(str: string): I18n {
    // Parse the locale from a string
    const locale: I18n = JSON.parse(str);

    if (locale === undefined) {
      throw new Error("Invalid locale");
    }

    for (const key in locale) {
      const keyValid = key as I18nLanguages;
      if (locale[keyValid] === undefined) {
        throw new Error(`Invalid locale at key ${key}`);
      }

      for (const key2 in locale[keyValid]) {
        const key2Valid = key2 as keyof I18nKeys;
        if (locale[keyValid][key2Valid] === undefined) {
          throw new Error(`Invalid locale at key ${key2}`);
        }
      }
    }

    return locale;
  }

  public async loadLocale(): Promise<void> {
    try {
      const locale = await this.readLocale();
      this._i18n = this.parseLocale(locale);
    } catch (e) {
      console.error(e);
    }
  }

  public t(
    key: string,
    locale: I18nLanguages,
    replacements?: { [key: string]: string },
  ): string {
    if (this._i18n[locale] === undefined) {
      throw new Error("Unsupported locale");
    }

    const keys = key.split(".");
    const genericI18n = this._i18n[locale] as any;
    let string;

    function getNestedValue(obj: any, keys: string[]): any {
      if (keys.length === 0) {
        if (Array.isArray(obj)) {
          return obj[Math.floor(Math.random() * obj.length)];
        }
        return obj;
      }

      return getNestedValue(obj[keys[0]], keys.slice(1));
    }

    try {
      string = getNestedValue(genericI18n, keys);
    } catch (_e) {
      return key;
    }

    if (
      string === undefined ||
      typeof string !== "string" ||
      string === "" ||
      !string
    ) {
      return key;
    }

    if (replacements) {
      for (const key in replacements) {
        string = string.replace(`{${key}}`, replacements[key]);
      }
    }

    return string;
  }

  public getSupportedLocales(): string[] {
    return Object.keys(this._i18n);
  }
}

export default new AsukaI18n();
