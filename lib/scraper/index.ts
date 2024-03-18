"use server"

import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from '../utils';

export async function scrapeAmazonProduct(url: string) {
  if(!url) return;

  // BrightData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: 'brd.superproxy.io',
    port,
    rejectUnauthorized: false,
  }

  try {
    // Fetch the product page
    const response = await axios.get(url, options);
    const $ = await cheerio.load(response.data);
    
    // Extract the product title
    const title = $('h1.-fs20.-pts.-pbxs').text().trim();
    const currentPrice = extractPrice(
      $('span.-b.-ubpt.-tal.-fs24.-prxs')
    );

    const originalPrice = extractPrice(
      $('span.-tal.-gy5.-lthr.-fs16.-pvxs.-ubpt')
    );

    const outOfStock = $('span.-fsh0.-prs.-fs12').text().trim().toLowerCase().includes('epuisé');

    const images = $('img.-fw.-fh');
    const imageUrls = images.map(function() {
        return $(this).attr('data-src') || $(this).attr('src');
    }).get();

    const currency = "TND"
    const discountRate = $('span.bdg._dsct._dyn.-mls').attr('data-disc')?.replace('%', '') || '';

    const description = extractDescription($)

    // Construct data object with scraped information
    const data = {
      url,
      currency: currency,
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: 'category',
      reviewsCount:0,
      stars: 0,
      isOutOfStock: outOfStock,
      description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    }

    return data;
  } catch (error: any) {
    console.log(error);
  }
}