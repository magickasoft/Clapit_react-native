/**
 * Created by romanmandryk on 14/07/2016.
 */
import cheerio from 'cheerio-without-node-native'

export function scrapeWebsite(url) {
  let promise = new Promise((resolve, reject) => {
    fetch(url).then(response => {
      response.text().then(html => {
        let $ = cheerio.load(html)
        let images = getImages($, url)
        let title = getTitle($)
        resolve({title, images})
      }).catch(err => {
        reject( err)
      })
    }).catch(err => {
      reject(err)
    })
  })
  return promise
}

function getTitle($) {
  var title = $('meta[property="og:title"]').attr('content');
  if (!title) {
    title = $('meta[itemprop="name"]').attr('content');
  }
  if (!title) {
    title = $('title').text();
  }
  return title;
}


function getImages($, url) {
  var image;
  image = $('meta[property="og:image"]').attr('content');
  if (image) {return [image]}
  image = $('meta[property="og:image:url"]').attr('content');
  if (image) {return [image]}
  image = $('link[rel="image_src"]').attr('href');
  if (image) {return [image]}

  var images = []

  let siteImages = $('img')
  siteImages.each((index, img) => {
    let src = $(img).attr('src')
    images.push(src)
  })
  // limit to first 20
  return images.slice(0, 20)
}