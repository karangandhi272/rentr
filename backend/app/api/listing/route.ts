import { NextResponse } from "next/server";
import { chromium } from "playwright";
import puppeteer from "puppeteer";
// Type definitions
interface ListingData {
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  bedrooms: string;
  bathrooms: string;
  furnished: boolean;
  petFriendly: boolean;
  parkingSpots: string;
  moveInDate: string;
  propertyType: string;
  utilities: {
    hydro: boolean;
    water: boolean;
    internet: boolean;
    heat: boolean;
  };
  airConditioning?: boolean;
  agreementType: "month-to-month" | "one-year";
  smokingPermitted?: "yes" | "no" | "outdoors";
  petPolicy?: "yes" | "no" | "limited";
}

async function logFormState(page: any) {
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
      bedrooms: getElementInfo(
        'select[name="postAdForm.attributeMap[numberbedrooms_s]"]'
      ),
      bathrooms: getElementInfo(
        'select[name="postAdForm.attributeMap[numberbathrooms_s]"]'
      ),
      parking: getElementInfo(
        'select[name="postAdForm.attributeMap[numberparkingspots_s]"]'
      ),
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

async function handleLocationSelection(page: any) {
  console.log("Starting location selection...");

  try {
    // Check if we're already on the form page by looking for a unique form element
    const isFormPage = await page.evaluate(() => {
      return !!document.querySelector("#postad-title, #PriceAmount");
    });

    if (isFormPage) {
      console.log("Already on form page, skipping location selection");
      return;
    }

    // Wait for either the location menu or the form page
    try {
      await Promise.race([
        page.waitForSelector("#LocationMenus", { timeout: 5000 }),
        page.waitForSelector("#postad-title", { timeout: 5000 }),
      ]);
    } catch (e) {
      console.log(
        "Neither location menu nor form found, attempting direct navigation"
      );
      await page.goto(
        "https://www.kijiji.ca/p-post-ad.html?categoryId=37&locationId=1700281"
      );
      await page.waitForLoadState("networkidle");
      return;
    }

    // Re-check if we're on the form page
    const formVisible = await page.evaluate(() => {
      return !!document.querySelector("#postad-title, #PriceAmount");
    });

    if (formVisible) {
      console.log("Form page detected, skipping location selection");
      return;
    }

    // If we get here, we need to handle location selection
    // Wait for location menu and ensure it's loaded
    const locationMenu = page.locator("#LocationMenus");
    await locationMenu.waitFor({ state: "visible", timeout: 10000 });

    // Debug current state
    console.log("Location menu visible, checking structure...");
    const menuStructure = await page.evaluate(() => {
      const menu = document.querySelector("#LocationMenus");
      return {
        exists: !!menu,
        children: menu ? Array.from(menu.children).map((c) => c.className) : [],
        html: menu?.innerHTML,
      };
    });
    console.log("Menu structure:", menuStructure);

    // Force location directly
    console.log("Setting location directly...");
    await page.evaluate(() => {
      // Set location ID
      const locationInput = document.querySelector(
        "#LocationIdInput"
      ) as HTMLInputElement;
      if (locationInput) {
        locationInput.value = "1700281";
        locationInput.dispatchEvent(new Event("input", { bubbles: true }));
        locationInput.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // Set province
      const provinceInput = document.querySelector(
        "#pstad-province"
      ) as HTMLInputElement;
      if (provinceInput) {
        provinceInput.value = "QC";
      }

      // Set city
      const cityInput = document.querySelector(
        "#pstad-city"
      ) as HTMLInputElement;
      if (cityInput) {
        cityInput.value = "Montreal";
      }

      // Enable Go button if it exists
      const goButton = document.querySelector("#LocUpdate");
      if (goButton) {
        goButton.classList.remove("disabled");
      }
    });

    // Wait a bit for the form to update
    await page.waitForTimeout(1000);

    // Click Go button if needed
    const goButton = page.locator("#LocUpdate");
    if (await goButton.isVisible()) {
      console.log("Clicking Go button...");
      await goButton.click();
      await page.waitForLoadState("networkidle");
    }

    // Verify location was set
    const locationSet = await page.evaluate(() => {
      const locationInput = document.querySelector(
        "#LocationIdInput"
      ) as HTMLInputElement;
      return locationInput?.value === "1700281";
    });

    console.log("Location set successfully:", locationSet);

    // Wait for any post-location-selection updates
    await page.waitForLoadState("networkidle");

    // Add additional verification
    const success = await page.evaluate(() => {
      // Check if we're on the form page
      if (document.querySelector("#postad-title")) {
        return true;
      }
      // Check if location was set
      const locationInput = document.querySelector(
        "#LocationIdInput"
      ) as HTMLInputElement;
      return locationInput?.value === "1700281";
    });

    if (!success) {
      console.log(
        "Location selection may have failed, attempting direct navigation"
      );
      await page.goto(
        "https://www.kijiji.ca/p-post-ad.html?categoryId=37&locationId=1700281"
      );
      await page.waitForLoadState("networkidle");
    }
  } catch (error) {
    console.error("Location handling error:", error);
    // Attempt recovery by direct navigation
    console.log("Attempting recovery through direct navigation");
    await page.goto(
      "https://www.kijiji.ca/p-post-ad.html?categoryId=37&locationId=1700281"
    );
    await page.waitForLoadState("networkidle");
  }
}

async function verifyAndClick(page: any, selector: string, name: string) {
  try {
    console.log(`Attempting to click ${name}...`);
    await page.waitForSelector(selector, { state: "attached", timeout: 5000 });
    const element = page.locator(selector);

    // Log element state
    const state = await element.evaluate((el: any) => ({
      isConnected: el.isConnected,
      isVisible: el.offsetParent !== null,
      disabled: el.disabled,
      checked: el.checked,
      html: el.outerHTML,
    }));
    console.log(`${name} state:`, state);

    await element.click({ force: true });
    console.log(`${name} clicked successfully`);
    await page.waitForTimeout(500);
  } catch (error) {
    console.error(`Error clicking ${name}:`, error);
    // Fallback to JavaScript click
    await page.evaluate((sel: string) => {
      const el = document.querySelector(sel) as HTMLElement;
      if (el) {
        el.click();
        console.log("Fallback click succeeded");
      }
    }, selector);
  }
}

async function fillFormFields(page: any, listingData: ListingData) {
  console.log("Starting form fill with verification...");

  try {
    await page.waitForLoadState("networkidle");

    // First validate that listingData has all required fields
    if (!listingData.utilities) {
      listingData.utilities = {
        hydro: false,
        water: false,
        internet: false,
        heat: false,
      };
    }

    // Fill form using JavaScript evaluation for better reliability
    await page.evaluate((data) => {
      function clickRadio(name: string, value: string) {
        const radio = document.querySelector(
          `input[name="${name}"][value="${value}"]`
        ) as HTMLInputElement;
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event("change", { bubbles: true }));
          console.log(`Set ${name} to ${value}`);
        } else {
          console.log(`Radio not found: ${name} ${value}`);
        }
      }

      function setSelect(name: string, value: string) {
        const select = document.querySelector(
          `select[name="${name}"]`
        ) as HTMLSelectElement;
        if (select) {
          select.value = value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          console.log(`Set ${name} to ${value}`);
        } else {
          console.log(`Select not found: ${name}`);
        }
      }

      // Basic Info - simplified unit type
      clickRadio("postAdForm.adType", "OFFER");
      clickRadio("postAdForm.forrentby", "ownr");
      clickRadio("postAdForm.unittype", data.propertyType || "apartment");

      // Property Details
      setSelect("postAdForm.attributeMap[numberbedrooms_s]", data.bedrooms);
      setSelect("postAdForm.attributeMap[numberbathrooms_s]", data.bathrooms);

      // Updated parking spots mapping
      function setParkingSpots(value: string) {
        const parkingMap: { [key: string]: string } = {
          "0": "0",
          "1": "1",
          "2": "2",
          "3": "3",
          "4": "4",
          "5": "5",
          "6+": "6",
          underground: "7",
          garage: "8",
        };
        setSelect(
          "postAdForm.attributeMap[numberparkingspots_s]",
          parkingMap[value] || "0"
        );
      }

      // Set parking spots
      setParkingSpots(data.parkingSpots);

      // Agreement Type
      clickRadio("postAdForm.agreement", "month-to-month");

      // Move-in Date
      const dateInput = document.querySelector(
        'input[name="postAdForm.attributeMap[dateavailable_tdt]"]'
      ) as HTMLInputElement;
      if (dateInput) {
        const date = data.moveInDate ? new Date(data.moveInDate) : new Date();
        const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}`;
        dateInput.value = formattedDate;
        dateInput.dispatchEvent(new Event("input", { bubbles: true }));
      }

      // Pet policy with all options
      const petValue = (() => {
        switch (data.petPolicy) {
          case "yes":
            return "1";
          case "no":
            return "0";
          case "limited":
            return "limited";
          default:
            return data.petFriendly ? "1" : "0";
        }
      })();
      clickRadio("postAdForm.attributeMap[petsallowed_s]", petValue);

      // Smoking policy
      const smokingValue = (() => {
        switch (data.smokingPermitted) {
          case "yes":
            return "1";
          case "no":
            return "0";
          case "outdoors":
            return "2";
          default:
            return "0";
        }
      })();
      clickRadio("postAdForm.attributeMap[smokingpermitted_s]", smokingValue);

      // Size
      const sizeInput = document.querySelector(
        "#areainfeet_i"
      ) as HTMLInputElement;
      if (sizeInput) {
        sizeInput.value = "700";
        sizeInput.dispatchEvent(new Event("input", { bubbles: true }));
      }

      // Furnished
      clickRadio("postAdForm.furnished", data.furnished ? "1" : "0");

      // Utilities
      function setCheckbox(id: string, value: boolean) {
        const checkbox = document.querySelector(`#${id}`) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = value;
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }

      setCheckbox("hydro_s", data.utilities.hydro);
      setCheckbox("water_s", data.utilities.water);
      setCheckbox("heat_s", data.utilities.heat);
      setCheckbox("internet_s", data.utilities.internet);

      // Main Content
      const titleInput = document.querySelector(
        ".input-50421121"
      ) as HTMLInputElement;
      const descInput = document.querySelector(
        ".textArea-185211136"
      ) as HTMLTextAreaElement;
      const priceInput = document.querySelector(
        "#PriceAmount"
      ) as HTMLInputElement;

      if (titleInput) {
        titleInput.value = data.title;
        titleInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (descInput) {
        descInput.value = data.description;
        descInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (priceInput) {
        priceInput.value = data.price.toString();
        priceInput.dispatchEvent(new Event("input", { bubbles: true }));
      }

      // Property Type - using the correct radio values
      const propertyTypeMap: { [key: string]: string } = {
        apartment: "apartment",
        condo: "condo",
        basement: "basement-apartment",
        house: "house",
        townhouse: "townhouse",
        duplex: "duplex-triplex",
        triplex: "duplex-triplex",
      };
      const mappedPropertyType =
        propertyTypeMap[data.propertyType] || "apartment";
      clickRadio("postAdForm.attributeMap[unittype_s]", mappedPropertyType);

      // Agreement Type
      clickRadio(
        "postAdForm.attributeMap[agreementtype_s]",
        data.agreementType || "month-to-month"
      );
      // Add bedroom mapping
      function setBedrooms(value: string) {
        const bedroomMap: { [key: string]: string } = {
          bachelor: "0",
          studio: "0",
          "0": "0",
          "1": "1",
          "1+den": "1.5",
          "1.5": "1.5",
          "2": "2",
          "2+den": "2.5",
          "2.5": "2.5",
          "3": "3",
          "3+den": "3.5",
          "3.5": "3.5",
          "4": "4",
          "4+den": "4.5",
          "4.5": "4.5",
          "5": "5",
          "5+": "5",
        };

        const mappedValue = bedroomMap[value.toString().toLowerCase()] || "1";
        console.log("Setting bedrooms:", value, "->", mappedValue);
        setSelect("postAdForm.attributeMap[numberbedrooms_s]", mappedValue);
      }

      // Set bedrooms using the new mapping function
      setBedrooms(data.bedrooms);

      // Bathrooms - using select with numeric values
      function setBathrooms(value: string) {
        const bathroomMap: { [key: string]: string } = {
          "1": "10",
          "1.5": "15",
          "2": "20",
          "2.5": "25",
          "3": "30",
          "3.5": "35",
          "4": "40",
          "4.5": "45",
          "5": "50",
          "5.5": "55",
          "6": "60",
        };
        setSelect(
          "postAdForm.attributeMap[numberbathrooms_s]",
          bathroomMap[value] || "10"
        );
      }
      setBathrooms(data.bathrooms);

      // Air Conditioning
      clickRadio(
        "postAdForm.attributeMap[airconditioning_s]",
        data.airConditioning ? "1" : "0"
      );

      // Furnished status
      clickRadio(
        "postAdForm.attributeMap[furnished_s]",
        data.furnished ? "1" : "0"
      );
    }, listingData);

    // Remove the extra property type mapping section that was added
    // Delete or comment out the following block:
    /*
    const propertyTypeMap: { [key: string]: string } = {
      apartment: "apartment",
      // ...
    };
    const mappedPropertyType = propertyTypeMap[listingData.propertyType] || "apartment";
    // ... related property type code ...
    */

    // Verify the selection
    await page.waitForTimeout(500);
    const isSelected = await page.evaluate((type) => {
      const radio = document.querySelector(
        `input[value="${type}"]`
      ) as HTMLInputElement;
      return radio?.checked || false;
    }, mappedPropertyType);

    if (!isSelected) {
      console.log("Fallback: Trying direct click on property type radio");
      await page.click(`input[value="${mappedPropertyType}"]`, { force: true });
    }

    // Handle images separately

    // Wait for form to settle
    await page.waitForTimeout(1000);
    console.log("Form filling completed");

    // Select the package before submitting
    try {
      console.log("Selecting package...");
      await page.click('button[data-testid="package-0-bottom-select"]');
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
    } catch (error) {
      console.error("Error selecting package:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Form filling error:", error);
    await page.screenshot({
      path: `form-error-${Date.now()}.png`,
      fullPage: true,
    });
    throw error;
  }
}

async function postToKijiji(listingData: ListingData) {
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
  });

  const page = await context.newPage();

  try {
    // Handle login
    await page.goto(process.env.KIJIJI_LOGIN_URL!);
    await page.waitForLoadState("networkidle");

    await page.fill("#username", process.env.KIJIJI_USERNAME!);
    await page.fill("#password", process.env.KIJIJI_PASSWORD!);
    await page.click("#login-submit");

    // Wait for login completion
    await page.waitForURL(/kijiji\.ca\/(?!.*login).*/, { timeout: 30000 });

    // Navigate directly to the form with location
    await page.goto(
      "https://www.kijiji.ca/p-post-ad.html?categoryId=37&locationId=1700281"
    );
    await page.waitForLoadState("networkidle");

    // Only call handleLocationSelection if we're not already on the form
    const isFormPage = await page.evaluate(() => {
      return !!document.querySelector("#postad-title, #PriceAmount");
    });

    if (!isFormPage) {
      await handleLocationSelection(page);
    }

    // Log form state before filling
    console.log("Form state before filling:");
    await logFormState(page);

    // Use new comprehensive form filling function
    await fillFormFields(page, listingData);

    // Submit form
    console.log("Submitting form...");
    await page.click('button[data-testid="checkout-post-btn"]');
    await page.waitForLoadState("networkidle");

    return { success: true, platform: "Kijiji" };
  } catch (error) {
    console.error("Error details:", {
      message: (error as Error).message,
      url: await page.url(),
      stack: (error as Error).stack,
      lastFormState: await logFormState(page),
    });

    // Take error screenshot
    await page.screenshot({
      path: `error-${Date.now()}.png`,
      fullPage: true,
    });

    return {
      success: false,
      platform: "Kijiji",
      error: (error as Error).message,
      formState: await logFormState(page),
    };
  } finally {
  }
}

export async function POST(request: Request) {
  try {
    const listingData: ListingData = await request.json();

    // Validate the request body
    if (
      !listingData.title ||
      !listingData.description ||
      !listingData.price ||
      !listingData.location
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Post to all platforms concurrently
    const results = await Promise.all([postToKijiji(listingData)]);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error processing listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
