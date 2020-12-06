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
  const t = getNodeText($, e);
  if (e === null) {
    return [];
  }

  // we want to check any direct siblings prior to traversing up
  if (t.length > 0) {
    return [t, ...travelUp($, e.prev || e.parentNode)];
  }
  return [...travelUp($, e.prev || e.parentNode)];
};

export const parseCoAndPrerequisites = ($: cheerio.Root) => {
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

  const reqs: string[][] = [];

  $('span.course')
    .contents()
    .each((i, e) => {
      const v = travelUp($, e);
      reqs.push(v.map(a => a.trim().replace(/Complete (\d|all) of.+/, '$1')).reverse());
    });

  const root = $('div')
    .first()
    .html();

  const s = $('div')
    .first()
    .text();

  return reqs;
};
