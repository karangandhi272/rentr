import { NextResponse } from "next/server";
import { chromium } from "playwright";
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

// Log form state helper
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

// Handle location
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
    const locationMenu = page.locator("#LocationMenus");
    await locationMenu.waitFor({ state: "visible", timeout: 10000 });

    console.log("Location menu visible... forcing location directly...");

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
      const cityInput = document.querySelector("#pstad-city") as HTMLInputElement;
      if (cityInput) {
        cityInput.value = "Montreal";
      }

      // Enable Go button if it exists
      const goButton = document.querySelector("#LocUpdate");
      if (goButton) {
        goButton.classList.remove("disabled");
      }
    });

    await page.waitForTimeout(1000); // short wait

    // Click Go button if visible
    const goButton = page.locator("#LocUpdate");
    if (await goButton.isVisible()) {
      console.log("Clicking Go button...");
      await goButton.click();
      await page.waitForLoadState("networkidle");
    }

    // Double-check location
    const locationSet = await page.evaluate(() => {
      const locationInput = document.querySelector(
        "#LocationIdInput"
      ) as HTMLInputElement;
      return locationInput?.value === "1700281";
    });
    console.log("Location set successfully:", locationSet);

    await page.waitForLoadState("networkidle");

    const success = await page.evaluate(() => {
      // Check if we're on the form page
      if (document.querySelector("#postad-title")) {
        return true;
      }
      // or location was set
      const locationInput = document.querySelector(
        "#LocationIdInput"
      ) as HTMLInputElement;
      return locationInput?.value === "1700281";
    });

    if (!success) {
      console.log("Location selection may have failed, navigating directly...");
      await page.goto(
        "https://www.kijiji.ca/p-post-ad.html?categoryId=37&locationId=1700281"
      );
      await page.waitForLoadState("networkidle");
    }
  } catch (error) {
    console.error("Location handling error:", error);
    // Attempt recovery by direct navigation
    await page.goto(
      "https://www.kijiji.ca/p-post-ad.html?categoryId=37&locationId=1700281"
    );
    await page.waitForLoadState("networkidle");
  }
}

// Fill the location field
async function fillLocationField(page: any, locationText: string) {
  console.log("Filling location field with:", locationText);
  // Wait for the location textarea to be visible
  const locationLocator = page.locator("textarea#location");
  await locationLocator.waitFor({ state: "visible", timeout: 10000 });
  
  // Fill the textarea with the address from data.location
  await page.fill("textarea#location", locationText);
  
  // Wait for the autocomplete suggestion container to appear
  // await page.waitForSelector("#LocationSelector-menu", { timeout: 10000 });
  // Short delay to ensure suggestions are populated
  await page.waitForTimeout(500);
  
  // Click the first suggestion (id="LocationSelector-item-0")
  await page.click("#LocationSelector-item-0");
  
  // Optional: wait a bit for the selection to register
  await page.waitForTimeout(500);
  console.log("Location selected via autocomplete.");
}

// Fill the dynamic form fields first (except title/desc/price)
async function fillDynamicFields(page: any, listingData: ListingData) {
  await page.evaluate((data) => {
    function clickRadio(name: string, value: string) {
      const radio = document.querySelector(
        `input[name="${name}"][value="${value}"]`
      ) as HTMLInputElement;
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event("change", { bubbles: true }));
        console.log(`Set ${name} = ${value}`);
      }
    }

    function setSelect(name: string, value: string) {
      const select = document.querySelector(
        `select[name="${name}"]`
      ) as HTMLSelectElement;
      if (select) {
        select.value = value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        console.log(`Set ${name} = ${value}`);
      }
    }

    // Basic info
    clickRadio("postAdForm.adType", "OFFER");
    clickRadio("postAdForm.forrentby", "ownr");

    // If there's a top-level property type radio (unittype)
    clickRadio("postAdForm.unittype", data.propertyType || "apartment");

    // Now handle property details
    setSelect("postAdForm.attributeMap[numberbedrooms_s]", data.bedrooms);
    setSelect("postAdForm.attributeMap[numberbathrooms_s]", data.bathrooms);

    // Parking mapping
    function setParkingSpots(value: string) {
      const parkingMap: Record<string, string> = {
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
      return parkingMap[value] || "0";
    }
    setSelect(
      "postAdForm.attributeMap[numberparkingspots_s]",
      setParkingSpots(data.parkingSpots)
    );

    // Agreement
    clickRadio("postAdForm.agreement", "month-to-month");

    // Move-in date
    const dateInput = document.querySelector(
      'input[name="postAdForm.attributeMap[dateavailable_tdt]"]'
    ) as HTMLInputElement;
    if (dateInput) {
      const date = data.moveInDate ? new Date(data.moveInDate) : new Date();
      const formattedDate = `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}/${date.getFullYear()}`;
      dateInput.value = formattedDate;
      dateInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Pet policy
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

    // Smoking
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
    const sizeInput = document.querySelector("#areainfeet_i") as HTMLInputElement;
    if (sizeInput) {
      sizeInput.value = "700";
      sizeInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Furnished
    clickRadio("postAdForm.furnished", data.furnished ? "1" : "0");

    // Utilities (checkboxes)
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

    // Kijiji "attributeMap" property type radio
    const propertyTypeMap: Record<string, string> = {
      apartment: "apartment",
      condo: "condo",
      basement: "basement-apartment",
      house: "house",
      townhouse: "townhouse",
      duplex: "duplex-triplex",
      triplex: "duplex-triplex",
    };
    const mappedPropertyType = propertyTypeMap[data.propertyType] || "apartment";
    clickRadio("postAdForm.attributeMap[unittype_s]", mappedPropertyType);

    // Agreement type
    clickRadio(
      "postAdForm.attributeMap[agreementtype_s]",
      data.agreementType || "month-to-month"
    );

    // Bedrooms mapping
    function setBedrooms(value: string) {
      const bedroomMap: Record<string, string> = {
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
      return bedroomMap[value.toLowerCase()] || "1";
    }
    const mappedBedrooms = setBedrooms(data.bedrooms);
    setSelect("postAdForm.attributeMap[numberbedrooms_s]", mappedBedrooms);

    // Bathrooms mapping
    function setBathrooms(value: string) {
      const bathroomMap: Record<string, string> = {
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
      return bathroomMap[value] || "10";
    }
    const mappedBathrooms = setBathrooms(data.bathrooms);
    setSelect("postAdForm.attributeMap[numberbathrooms_s]", mappedBathrooms);

    // Air Conditioning
    clickRadio(
      "postAdForm.attributeMap[airconditioning_s]",
      data.airConditioning ? "1" : "0"
    );

    // Furnished
    clickRadio("postAdForm.attributeMap[furnished_s]", data.furnished ? "1" : "0");
  }, listingData);

  // Wait a bit for any dynamic re-renders
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
}

// Fill title, description, and price with "page.fill" so they won't be reset on focus
async function fillTextFields(page: any, listingData: ListingData) {
  // Fill using Playwright's built-in method, which fires all expected events
  await page.fill("#postad-title", listingData.title);
  await page.fill("#pstad-descrptn", listingData.description);
  await page.fill("#PriceAmount", listingData.price.toString());

  // Optional short wait to ensure the form “registers” the input
  await page.waitForTimeout(500);
}

async function postToKijiji(listingData: ListingData) {
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
  });

  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();

  try {
    // 1. Log in
    await page.goto(process.env.KIJIJI_LOGIN_URL!);
    await page.waitForLoadState("networkidle");

    await page.fill("#username", process.env.KIJIJI_USERNAME!);
    await page.fill("#password", process.env.KIJIJI_PASSWORD!);
    await page.click("#login-submit");

    // Wait for login completion
    await page.waitForURL(/kijiji\.ca\/(?!.*login).*/, { timeout: 30000 });

    // 2. Navigate directly to the form with location
    await page.goto(
      "https://www.kijiji.ca/p-post-ad.html?categoryId=37&locationId=1700281"
    );
    await page.waitForLoadState("networkidle");

    // 3. Handle location if needed
    const isFormPage = await page.evaluate(() => {
      return !!document.querySelector("#postad-title, #PriceAmount");
    });
    if (!isFormPage) {
      await handleLocationSelection(page);
    }

    // 4. Log state before filling
    console.log("Form state before filling:");
    await logFormState(page);

    await fillLocationField(page, listingData.location);

    // 5. Fill all dynamic fields (radio, selects, etc.)
    await fillDynamicFields(page, listingData);

    // 6. Now fill text fields last
    await fillTextFields(page, listingData);

    // 7. Log form state again to confirm
    console.log("Form state after filling:");
    await logFormState(page);

    // 8. Select a package, submit, etc.
    console.log("Selecting package...");
    await page.click('button[data-testid="package-0-bottom-select"]');
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    console.log("Submitting form...");
    await page.click('button[data-testid="checkout-post-btn"]');
    await page.waitForLoadState("networkidle");

    // await context.close();
    // await browser.close();

    return { success: true, platform: "Kijiji" };
  } catch (error) {
    console.error("Error details:", {
      message: (error as Error).message,
      url: await page.url(),
      stack: (error as Error).stack,
    });

    // Take error screenshot
    await page.screenshot({
      path: `error-${Date.now()}.png`,
      fullPage: true,
    });

    await context.close();
    await browser.close();

    return {
      success: false,
      platform: "Kijiji",
      error: (error as Error).message,
    };
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

    // Populate defaults
    if (!listingData.bedrooms) listingData.bedrooms = "1";
    if (!listingData.bathrooms) listingData.bathrooms = "1";
    if (!listingData.propertyType) listingData.propertyType = "apartment";
    if (!listingData.utilities) {
      listingData.utilities = {
        hydro: false,
        water: false,
        internet: false,
        heat: false,
      };
    }

    // Post to Kijiji
    const kijijiResult = await postToKijiji(listingData);

    return NextResponse.json({
      success: true,
      results: [kijijiResult],
    });
  } catch (error) {
    console.error("Error processing listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
