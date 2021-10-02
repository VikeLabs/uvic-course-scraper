import { CheerioAPI } from 'cheerio';

import { BuildingInfo } from '../../../types';

export const mapsAndBuildingsExtractor = ($: CheerioAPI): BuildingInfo[] => {
  const buildingElements = $('.filtered__item');
  const buildings: BuildingInfo[] = [];

  buildingElements.each((i, el) => {
    const title = $(el).text().trim();
    const match = /(?<long>.+)?\s\((?<short>.+)\)/.exec(title);

    buildings.push({
      title,
      long: match?.groups?.long,
      short: match?.groups?.short,
      url: $(el).find('a').first().attr('href'),
    });
  });
  return buildings;
};
