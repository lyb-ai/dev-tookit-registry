/**
 * Formats a date according to the specified locale and options.
 *
 * @param {Date | string | number} date The date to format.
 * @param {Intl.DateTimeFormatOptions} [options] Options for formatting the date. Defaults to long month, numeric day, and numeric year.
 * @param {string} [locale] The BCP 47 language tag. Defaults to the user's runtime locale if available, otherwise "en-US".
 * @returns {string} The formatted date string.
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  },
  locale?: string
): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat(locale, options).format(d);
}
