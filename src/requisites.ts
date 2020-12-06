const getNodeText = ($: cheerio.Root, e: cheerio.Element): string =>
  $(e)
    .first()
    .contents()
    .filter((i, elm) => {
      return elm.type === 'text';
    })
    .text();

const travelUp = ($: cheerio.Root, e: cheerio.Element): string[] => {
  // gets the text directly a child the node
  const text = getNodeText($, e);
  if (e === null) {
    return [];
  }

  // we want to check any direct siblings prior to traversing up
  if (text.length > 0) {
    return [text, ...travelUp($, e.prev || e.parentNode)];
  }
  return [...travelUp($, e.prev || e.parentNode)];
};

const unsupportedAttribute = ($: cheerio.Root, value: string) => {
  if (
    $.root()
      .text()
      .indexOf(value) !== -1
  ) {
    console.warn(`Unsupported pre/corequisite: "${value}"!`);
  }
};

const clean = ($: cheerio.Root) => {
  // remove comments
  $.root()
    .find('*')
    .contents()
    .filter((index, node) => {
      return node.type === 'comment';
    })
    .remove();

  // remove styling
  $.root()
    .find('*')
    .contents()
    .removeAttr('style')
    .removeAttr('target')
    .removeAttr('href');

  $.root()
    .find('a')
    .contents()
    .each((i, e) => {
      const courseCode = $(e)
        .first()
        .text();

      const parent = $(e.parent.parent);
      $(e.parent).remove();
      $(parent).replaceWith('<span class="course">' + courseCode + '</span>');
    });

  // removes any empty span tags
  $('span:empty').remove();
  return $;
};

export const parseCoAndPrerequisites = ($: cheerio.Root) => {
  clean($);

  // unsupportedAttribute($, 'or permission of the department');
  // unsupportedAttribute($, 'Earn a minimum grade of');
  // unsupportedAttribute($, 'Pre-Calculus 12');
  // unsupportedAttribute($, 'Principles of Mathematics 12');
  // unsupportedAttribute($, 'with a minimum grade of');

  const reqs: string[][] = [];

  $('span.course')
    .contents()
    .each((i, e) => {
      const requisitePaths = travelUp($, e);
      reqs.push(
        requisitePaths.map(requisitePath => requisitePath.trim().replace(/Complete (\d|all) of.+/, '$1')).reverse()
      );
    });

  const root = $('div')
    .first()
    .html();

  return { reqs, html: root };
};
