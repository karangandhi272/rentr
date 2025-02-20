import { chromium } from "playwright";
import { ListingData, PostingResult } from "../types/listing";
import { formatDateToKijiji, bedroomMap, bathroomMap } from "../utils/form-helpers";

export async function logFormState(page: any) {
  const formState = await page.evaluate(() => {
    const getElementInfo = (selector: string) => {
      const el = document.querySelector(selector);
      return {
        exists: !!el,
        visible: el ? window.getComputedStyle(el).display !== "none" : false,
        value: (el as any)?.value || null,
        disabled: (el as any)?.disabled || false,
        type: (el as any)?.type || null,
      };
    };

    return {
      adType: getElementInfo('input[value="OFFER"]'),
      ownerType: getElementInfo('input[value="ownr"]'),
      propertyType: getElementInfo('input[value="apartment"]'),
      bedrooms: getElementInfo('select[name="postAdForm.attributeMap[numberbedrooms_s]"]'),
      bathrooms: getElementInfo('select[name="postAdForm.attributeMap[numberbathrooms_s]"]'),
      parking: getElementInfo('select[name="postAdForm.attributeMap[numberparkingspots_s]"]'),
      agreement: getElementInfo('input[value="month-to-month"]'),
      moveInDate: getElementInfo("#dateavailable"),
      petFriendly: getElementInfo('input[value="1"]'),
      squareFeet: getElementInfo("#areainfeet_i"),
      utilities: {
        hydro: getElementInfo("#hydro_s"),
        water: getElementInfo("#water_s"),
        heat: getElementInfo("#heat_s"),
        internet: getElementInfo("#internet_s"),
      },
      title: getElementInfo("#postad-title"),
      description: getElementInfo("#pstad-descrptn"),
      price: getElementInfo("#PriceAmount"),
    };
  });

  console.log("Form State:", JSON.stringify(formState, null, 2));
  return formState;
}

export async function handleLocationSelection(page: any) {
  console.log("Starting location selection...");
  // ...existing handleLocationSelection code...
}

async function verifyAndClick(page: any, selector: string, name: string) {
  // ...existing verifyAndClick code...
}

async function fillFormFields(page: any, listingData: ListingData) {
  console.log("Starting form fill with verification...");
  try {
    await page.waitForLoadState("networkidle");

    await page.evaluate((data) => {
      function clickRadio(name: string, value: string) {
        // ...existing clickRadio code...
      }

      function setSelect(name: string, value: string) {
        // ...existing setSelect code...
      }

      // Use helpers for bedrooms and date formatting
      const bedroomValue = bedroomMap[data.bedrooms.toLowerCase()] || "1";
      setSelect("postAdForm.attributeMap[numberbedrooms_s]", bedroomValue);

      const formattedDate = formatDateToKijiji(data.moveInDate);
      const dateInput = document.querySelector(
        'input[name="postAdForm.attributeMap[dateavailable_tdt]"]'
      ) as HTMLInputElement;
      if (dateInput) {
        dateInput.value = formattedDate;
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // ...rest of the form filling code...
    }, listingData);

    // ...rest of fillFormFields code...
  } catch (error) {
    // ...error handling code...
  }
}

export async function postToKijiji(listingData: ListingData): Promise<PostingResult> {
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
  });

  const page = await context.newPage();
  
  try {
    // ...existing postToKijiji code...
  } catch (error) {
    // ...error handling code...
  } finally {
    await browser.close();
  }
}
