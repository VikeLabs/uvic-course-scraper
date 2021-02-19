import cheerio from 'cheerio';

export const assertPageTitle = (expectedPageTitle: string, $: cheerio.Root): void => {
  const actualPageTitle: string = $('title').first().text();

  if (expectedPageTitle != actualPageTitle) {
    throw new Error(`wrong page type for parser\n\nExpected: ${expectedPageTitle}\nReceived: ${actualPageTitle}`);
  }
};
