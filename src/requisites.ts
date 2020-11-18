function insert(str: string, index: number, value: any): string {
  return str.substr(0, index) + value + str.substr(index);
}

const getNodeText = ($: cheerio.Root, e: cheerio.Element): string =>
  $(e)
    .first()
    .contents()
    .filter((i, elm) => {
      return elm.type === 'text';
    })
    .text();

const travelUp = ($: cheerio.Root, e: cheerio.Element): string[] | null => {
  // gets the text directly a child the node
  const t = getNodeText($, e);
  if (t.length > 0) {
    console.log('node: ' + t);
  }

  if (e === null) {
    return null;
  }
  // we want to check any direct siblings prior to traversing up
  return travelUp($, e.prev || e.parentNode);
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

  $('span.course')
    .contents()
    .each((i, e) => {
      console.log('starting: ' + $(e).text());
      const v = travelUp($, e);
      console.log(v);
    });

  const root = $('div')
    .first()
    .html();
  console.log(root);

  const s = $('div')
    .first()
    .text();
  const i = s.indexOf('Complete all of the following');
  if (i > 0) {
    return insert(s, i, '\n');
  }
  return s;
};
