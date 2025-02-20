import puppeteer from "puppeteer";
import { ListingData, PostingResult } from "../types/listing";

export async function postToRentalsCa(listingData: ListingData): Promise<PostingResult> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(process.env.RENTALS_CA_LOGIN_URL!, { waitUntil: "networkidle2" });
    await page.type("#username", process.env.RENTALS_CA_USERNAME!);
    await page.type("#password", process.env.RENTALS_CA_PASSWORD!);
    await page.click("#login-button");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    await page.goto(process.env.RENTALS_CA_NEW_LISTING_URL!, { waitUntil: "networkidle2" });
    await page.type("#listing-title", listingData.title);
    await page.type("#listing-description", listingData.description);
    await page.type("#listing-price", listingData.price.toString());
    await page.type("#listing-location", listingData.location);

    if (listingData.images.length > 0) {
      const fileInputSelector = 'input[type="file"]';
      await page.waitForSelector(fileInputSelector);
      const element = await page.$(fileInputSelector);
      if (element) {
        await element.uploadFile(...listingData.images);
      }
    }

    await page.click("#submit-listing");
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    return { success: true, platform: "Rentals.ca" };
  } catch (error) {
    return {
      success: false,
      platform: "Rentals.ca",
      error: (error as Error).message,
    };
  } finally {
    await browser.close();
  }
}
