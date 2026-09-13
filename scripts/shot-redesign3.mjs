import { chromium } from "playwright";
const SC = "C:/Users/sumit/AppData/Local/Temp/claude/d--The-robo-battle-ground/6eadab27-45d3-46fc-b358-f497ecf044db/scratchpad";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

// scroll through the whole page slowly to trigger all whileInView reveals
const height = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < height; y += 400) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(150);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);

await page.screenshot({ path: `${SC}/v3-home-full.png`, fullPage: true });
console.log("done");
await browser.close();
