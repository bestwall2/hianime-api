import * as cheerio from 'cheerio';

export const extractHomepage = (html) => {
  const $ = cheerio.load(html);

  const response = {
    spotlight: [],
    trending: [],
    topAiring: [],
    mostPopular: [],
    mostFavorite: [],
    latestCompleted: [],
    latestEpisode: [],
    newAdded: [],
    topUpcoming: [],
    top10: {
      today: null,
      week: null,
      month: null,
    },
    genres: [],
  };

  const $spotlight = $('.deslide-wrap .swiper-slide');
  const $trending = $('#trending-home .swiper-slide');
  const $featured = $('#anime-featured .anif-block');
  const $home = $('.block_area.block_area_home');
  const $top10 = $('.block_area .cbox');
  const $genres = $('.sb-genre-list');

  $($spotlight).each((i, el) => {
    const obj = {
      title: null,
      alternativeTitle: null,
      id: null,
      poster: null,
      rank: null,
      type: null,
      quality: null,
      duration: null,
      aired: null,
      synopsis: null,
      episodes: {
        sub: null,
        dub: null,
        eps: null,
      },
    };
    obj.rank = i + 1; // Rank is based on loop index, so it's always present.

    const idLinkEl = $(el).find('.desi-buttons a').first();
    const idHref = idLinkEl.length ? idLinkEl.attr('href') : null;
    obj.id = idHref ? idHref.split('/').at(-1) : null;

    const posterEl = $(el).find('.film-poster-img');
    obj.poster = posterEl.length ? posterEl.attr('data-src') : null;

    const titlesEl = $(el).find('.desi-head-title');
    obj.title = titlesEl.length ? titlesEl.text() : null;
    obj.alternativeTitle = titlesEl.length ? titlesEl.attr('data-jname') : null;

    const synopsisEl = $(el).find('.desi-description');
    obj.synopsis = synopsisEl.length ? synopsisEl.text().trim() : null;

    const detailsEl = $(el).find('.sc-detail');
    if (detailsEl.length) {
      const typeItemEl = detailsEl.find('.scd-item').eq(0);
      obj.type = typeItemEl.length ? typeItemEl.text().trim() : null;

      const durationItemEl = detailsEl.find('.scd-item').eq(1);
      obj.duration = durationItemEl.length ? durationItemEl.text().trim() : null;

      const airedItemEl = detailsEl.find('.scd-item.m-hide');
      obj.aired = airedItemEl.length ? airedItemEl.text().trim() : null;

      const qualityItemEl = detailsEl.find('.scd-item .quality');
      obj.quality = qualityItemEl.length ? qualityItemEl.text().trim() : null;

      const subText = detailsEl.find('.tick-sub').text().trim();
      obj.episodes.sub = subText && !isNaN(Number(subText)) ? Number(subText) : 0;

      const dubText = detailsEl.find('.tick-dub').text().trim();
      obj.episodes.dub = dubText && !isNaN(Number(dubText)) ? Number(dubText) : 0;

      const epsEl = detailsEl.find('.tick-eps');
      const subEl = detailsEl.find('.tick-sub');
      const epsTextVal = epsEl.length ? epsEl.text().trim() : (subEl.length ? subEl.text().trim() : '');
      obj.episodes.eps = epsTextVal && !isNaN(Number(epsTextVal)) ? Number(epsTextVal) : 0;
    } else {
      obj.type = null;
      obj.duration = null;
      obj.aired = null;
      obj.quality = null;
      obj.episodes.sub = 0;
      obj.episodes.dub = 0;
      obj.episodes.eps = 0;
    }

    response.spotlight.push(obj);
  });
  $($trending).each((i, el) => {
    const obj = {
      title: null,
      alternativeTitle: null,
      rank: null,
      poster: null,
      id: null,
    };
    obj.rank = i + 1; // Rank is based on loop index.

    const titleEl = $(el).find('.film-title');
    obj.title = titleEl.length ? titleEl.text() : null;
    obj.alternativeTitle = titleEl.length ? titleEl.attr('data-jname') : null;

    const imageEl = $(el).find('.film-poster');
    const imgEl = imageEl.length ? imageEl.find('img') : null;
    obj.poster = imgEl && imgEl.length ? imgEl.attr('data-src') : null;

    const imageHref = imageEl.length ? imageEl.attr('href') : null;
    obj.id = imageHref ? imageHref.split('/').at(-1) : null;

    response.trending.push(obj);
  });

  $($featured).each((i, el) => {
    const data = $(el)
      .find('.anif-block-ul li')
      .map((index, item) => {
        const obj = {
          title: null,
          alternativeTitle: null,
          id: null,
          poster: null,
          type: null,
          episodes: {
            sub: null,
            dub: null,
            eps: null,
          },
        };
        const titleLinkEl = $(item).find('.film-name a');
        obj.title = titleLinkEl.length ? titleLinkEl.attr('title') : null;
        obj.alternativeTitle = titleLinkEl.length ? titleLinkEl.attr('data-jname') : null;
        const titleHref = titleLinkEl.length ? titleLinkEl.attr('href') : null;
        obj.id = titleHref ? titleHref.split('/').at(-1) : null;

        const posterEl = $(item).find('.film-poster-img');
        obj.poster = posterEl.length ? posterEl.attr('data-src') : null;

        const typeEl = $(item).find('.fd-infor .fdi-item');
        obj.type = typeEl.length ? typeEl.text() : null;

        const subText = $(item).find('.fd-infor .tick-sub').text();
        obj.episodes.sub = subText && !isNaN(Number(subText)) ? Number(subText) : 0;

        const dubText = $(item).find('.fd-infor .tick-dub').text();
        obj.episodes.dub = dubText && !isNaN(Number(dubText)) ? Number(dubText) : 0;

        const epsEl = $(item).find('.fd-infor .tick-eps');
        const subEl = $(item).find('.fd-infor .tick-sub');
        const epsTextVal = epsEl.length ? epsEl.text() : (subEl.length ? subEl.text() : '');
        obj.episodes.eps = epsTextVal && !isNaN(Number(epsTextVal)) ? Number(epsTextVal) : 0;

        return obj;
      })
      .get();

    const headerEl = $(el).find('.anif-block-header');
    const dataType = headerEl.length ? headerEl.text().replace(/\s+/g, '') : '';
    if (dataType) {
      const normalizedDataType = dataType.charAt(0).toLowerCase() + dataType.slice(1);
      response[normalizedDataType] = data;
    }
  });

  $($home).each((i, el) => {
    const data = $(el)
      .find('.flw-item')
      .map((index, item) => {
        const obj = {
          title: null,
          alternativeTitle: null,
          id: null,
          poster: null,
          episodes: {
            sub: null,
            dub: null,
            eps: null,
          },
        };
        const titleLinkEl = $(item).find('.film-name .dynamic-name');
        obj.title = titleLinkEl.length ? titleLinkEl.attr('title') : null;
        obj.alternativeTitle = titleLinkEl.length ? titleLinkEl.attr('data-jname') : null;
        const titleHref = titleLinkEl.length ? titleLinkEl.attr('href') : null;
        obj.id = titleHref ? titleHref.split('/').at(-1) : null;

        const posterImgEl = $(item).find('.film-poster img');
        obj.poster = posterImgEl.length ? posterImgEl.attr('data-src') : null;

        const episodesEl = $(item).find('.film-poster .tick');
        if (episodesEl.length) {
          const subText = $(episodesEl).find('.tick-sub').text();
          obj.episodes.sub = subText && !isNaN(Number(subText)) ? Number(subText) : 0;

          const dubText = $(episodesEl).find('.tick-dub').text();
          obj.episodes.dub = dubText && !isNaN(Number(dubText)) ? Number(dubText) : 0;

          const epsTickEl = $(episodesEl).find('.tick-eps');
          const subTickEl = $(episodesEl).find('.tick-sub');
          const epsTextVal = epsTickEl.length ? epsTickEl.text() : (subTickEl.length ? subTickEl.text() : '');
          obj.episodes.eps = epsTextVal && !isNaN(Number(epsTextVal)) ? Number(epsTextVal) : 0;
        } else {
          obj.episodes.sub = 0;
          obj.episodes.dub = 0;
          obj.episodes.eps = 0;
        }
        return obj;
      })
      .get();

    const catHeadingEl = $(el).find('.cat-heading');
    const dataType = catHeadingEl.length ? catHeadingEl.text().replace(/\s+/g, '') : '';
    if (dataType) {
      const normalizedDataType = dataType.charAt(0).toLowerCase() + dataType.slice(1);
      normalizedDataType === 'newOnHiAnime'
        ? (response.newAdded = data)
        : (response[normalizedDataType] = data);
    }
  });

  const extractTopTen = (id) => {
    const listItems = $top10.find(`${id} ul li`);
    if (!listItems.length) return []; // Return empty array if no items

    const res = listItems
      .map((i, el) => {
        const itemEl = $(el); // Current li element
        const titleLinkEl = itemEl.find('.film-name a');

        const title = titleLinkEl.length ? titleLinkEl.text() : null;
        const alternativeTitle = titleLinkEl.length ? titleLinkEl.attr('data-jname') : null;
        const href = titleLinkEl.length ? titleLinkEl.attr('href') : null;
        const idVal = href ? href.split('/').pop() : null;

        const posterImgEl = itemEl.find('.film-poster img');
        const poster = posterImgEl.length ? posterImgEl.attr('data-src') : null;

        const subText = itemEl.find('.tick-item.tick-sub').text();
        const sub = subText && !isNaN(Number(subText)) ? Number(subText) : 0;

        const dubText = itemEl.find('.tick-item.tick-dub').text();
        const dub = dubText && !isNaN(Number(dubText)) ? Number(dubText) : 0;

        const epsEl = itemEl.find('.tick-item.tick-eps');
        const subEl = itemEl.find('.tick-item.tick-sub');
        const epsTextVal = epsEl.length ? epsEl.text() : (subEl.length ? subEl.text() : '');
        const eps = epsTextVal && !isNaN(Number(epsTextVal)) ? Number(epsTextVal) : 0;

        return {
          title: title,
          rank: i + 1,
          alternativeTitle: alternativeTitle,
          id: idVal,
          poster: poster,
          episodes: {
            sub: sub,
            dub: dub,
            eps: eps,
          },
        };
      })
      .get();
    return res;
  };

  response.top10.today = extractTopTen('#top-viewed-day');
  response.top10.week = extractTopTen('#top-viewed-week');
  response.top10.month = extractTopTen('#top-viewed-month');

  const genreLinks = $genres.find('li a');
  genreLinks.each((i, el) => {
    const genreTitle = $(el).attr('title');
    if (genreTitle) {
      response.genres.push(genreTitle.toLocaleLowerCase());
    }
  });

  return response;
};
