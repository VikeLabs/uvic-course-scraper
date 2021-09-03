import * as cheerio from 'cheerio';

import { mapsAndBuildingsExtractor } from '..';
import { getMapsAndBuildings } from '../../../../dev/path-builders';
import { BuildingInfo } from '../../../../types';

describe('UVic Maps & Buildings', () => {
  it('parses the buildings correctly', async () => {
    const data = await getMapsAndBuildings();

    const $ = cheerio.load(data);
    const buildings = mapsAndBuildingsExtractor($);

    // Campus Bike Centre
    const campusBikeCentre = buildings.find((b) => b.title === 'Campus Bike Centre');
    expect(campusBikeCentre).toMatchObject<BuildingInfo>({
      title: 'Campus Bike Centre',
      short: undefined,
      long: undefined,
      url: 'https://www.uvic.ca/search/maps-buildings/buildings/campus-bike-centre.php',
    });

    // Centre for Athletics, Recreation and Special Abilities (CARSA)
    const carsa = buildings.find((b) => b.title === 'Centre for Athletics, Recreation and Special Abilities (CARSA)');
    expect(carsa).toMatchObject<BuildingInfo>({
      title: 'Centre for Athletics, Recreation and Special Abilities (CARSA)',
      short: 'CARSA',
      long: 'Centre for Athletics, Recreation and Special Abilities',
      url: 'https://www.uvic.ca/search/maps-buildings/buildings/carsa.php',
    });
  });

  //
});
