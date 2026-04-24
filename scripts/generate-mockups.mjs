import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const root = process.cwd();
const appUrl = process.env.NEXT_PUBLIC_APP_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_APP_URL
  : "http://127.0.0.1:3000";
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const outDir = path.join(root, "public", "mockups");

function dataUrl(buffer, mime = "image/png") {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function capture(browser, route, viewport, setup) {
  const page = await browser.newPage({
    viewport,
    deviceScaleFactor: 1,
    isMobile: viewport.width < 640
  });
  await page.goto(`${appUrl}${route}`, { waitUntil: "networkidle" });
  if (setup) {
    await setup(page);
  }
  await page.waitForTimeout(300);
  const buffer = await page.screenshot({ type: "png", fullPage: false });
  await page.close();
  return dataUrl(buffer);
}

function css() {
  return `
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #f7f7f2;
      color: #18181b;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .stage {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background:
        radial-gradient(circle at 18% 18%, rgba(22, 163, 74, 0.14), transparent 26%),
        radial-gradient(circle at 82% 12%, rgba(234, 179, 8, 0.14), transparent 24%),
        linear-gradient(135deg, #fbfbf7 0%, #f4f4ef 48%, #ffffff 100%);
    }
    .grain {
      position: absolute;
      inset: 0;
      opacity: 0.18;
      background-image: linear-gradient(90deg, rgba(24, 24, 27, 0.04) 1px, transparent 1px),
        linear-gradient(rgba(24, 24, 27, 0.04) 1px, transparent 1px);
      background-size: 48px 48px;
    }
    .brand {
      position: absolute;
      left: 80px;
      top: 64px;
      display: flex;
      align-items: center;
      gap: 16px;
      font-weight: 650;
      letter-spacing: 0;
    }
    .mark {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: #ffffff;
      box-shadow: 0 16px 48px rgba(87, 83, 69, 0.16);
      display: grid;
      place-items: center;
      border: 1px solid rgba(39, 39, 42, 0.08);
    }
    .mark span {
      font-size: 28px;
      line-height: 1;
      color: #16a34a;
      font-weight: 800;
    }
    .mark img {
      width: 44px;
      height: 44px;
      display: block;
      border-radius: 12px;
    }
    .brand strong {
      display: block;
      font-size: 38px;
      line-height: 1;
      font-family: Georgia, "Times New Roman", serif;
      font-weight: 400;
    }
    .brand small {
      display: block;
      margin-top: 8px;
      color: #71717a;
      font-size: 16px;
    }
    .browser {
      position: absolute;
      overflow: hidden;
      border-radius: 28px;
      background: #ffffff;
      border: 1px solid rgba(39, 39, 42, 0.10);
      box-shadow: 0 40px 120px rgba(87, 83, 69, 0.22);
    }
    .browser::before {
      content: "";
      display: block;
      height: 48px;
      background: linear-gradient(180deg, #ffffff 0%, #f4f4f0 100%);
      border-bottom: 1px solid rgba(39, 39, 42, 0.08);
    }
    .dots {
      position: absolute;
      top: 18px;
      left: 24px;
      display: flex;
      gap: 8px;
      z-index: 2;
    }
    .dots span {
      width: 12px;
      height: 12px;
      border-radius: 999px;
      background: #d4d4d8;
    }
    .screen {
      width: 100%;
      display: block;
      object-fit: cover;
      object-position: top left;
    }
    .phone {
      position: absolute;
      width: 344px;
      height: 720px;
      padding: 16px;
      border-radius: 52px;
      background: #171717;
      box-shadow: 0 40px 110px rgba(24, 24, 27, 0.30);
    }
    .phone::before {
      content: "";
      position: absolute;
      top: 18px;
      left: 50%;
      width: 92px;
      height: 28px;
      transform: translateX(-50%);
      border-radius: 999px;
      background: #171717;
      z-index: 3;
    }
    .phone img {
      width: 100%;
      height: 100%;
      border-radius: 40px;
      object-fit: cover;
      object-position: top left;
      background: #ffffff;
    }
    .caption {
      position: absolute;
      color: #52525b;
      font-size: 20px;
      line-height: 1.4;
      max-width: 420px;
    }
    .caption b {
      color: #18181b;
      font-weight: 650;
    }
  `;
}

async function render(browser, filename, width, height, body) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><style>${css()}</style></head><body>${body}</body></html>`, {
    waitUntil: "networkidle"
  });
  await page.screenshot({
    path: path.join(outDir, filename),
    type: "jpeg",
    quality: 92,
    fullPage: false
  });
  await page.close();
}

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true
});

const logo = dataUrl(await fs.readFile(path.join(root, "public", "finley-logo.svg")), "image/svg+xml");
const dashboard = await capture(browser, "/", { width: 1440, height: 1000 });
const history = await capture(browser, "/history", { width: 1440, height: 1000 });
const insights = await capture(browser, "/insights", { width: 1440, height: 1000 });
const mobileDashboard = await capture(browser, "/", { width: 390, height: 844 });
const quickAdd = await capture(browser, "/", { width: 390, height: 844 }, async (page) => {
  await page.locator('button[aria-label="Добавить транзакцию"]').click();
  await page.locator("#quick-phrase").fill("потратил 1200 на обед с Никой");
  await page.getByRole("button", { name: "Распознать" }).click();
  await page.waitForTimeout(1200);
});

await render(
  browser,
  "finley-overview.jpg",
  1800,
  1200,
  `
  <main class="stage">
    <div class="grain"></div>
    <div class="brand"><div class="mark"><img src="${logo}" alt=""></div><div><strong>Finley</strong><small>AI-трекер финансов</small></div></div>
    <p class="caption" style="left: 80px; top: 220px;"><b>Бюджет видно сразу</b>: главный статус месяца и быстрый AI-ввод на мобильном.</p>
    <section class="browser" style="left: 520px; top: 96px; width: 1120px; height: 820px;">
      <div class="dots"><span></span><span></span><span></span></div>
      <img class="screen" src="${dashboard}" style="height: 772px;">
    </section>
    <section class="phone" style="left: 220px; top: 390px; transform: rotate(-4deg);">
      <img src="${quickAdd}">
    </section>
  </main>`
);

await render(
  browser,
  "finley-dashboard.jpg",
  1600,
  1000,
  `
  <main class="stage">
    <div class="grain"></div>
    <div class="brand" style="left: 96px; top: 72px;"><div class="mark"><img src="${logo}" alt=""></div><div><strong>Finley</strong><small>Центр контроля бюджета</small></div></div>
    <section class="browser" style="left: 96px; top: 196px; width: 1408px; height: 720px;">
      <div class="dots"><span></span><span></span><span></span></div>
      <img class="screen" src="${dashboard}" style="height: 672px;">
    </section>
  </main>`
);

await render(
  browser,
  "finley-history-insights.jpg",
  1600,
  1000,
  `
  <main class="stage">
    <div class="grain"></div>
    <div class="brand" style="left: 88px; top: 64px;"><div class="mark"><img src="${logo}" alt=""></div><div><strong>Finley</strong><small>История, паттерны и поведенческие сигналы</small></div></div>
    <section class="browser" style="left: 96px; top: 224px; width: 960px; height: 640px;">
      <div class="dots"><span></span><span></span><span></span></div>
      <img class="screen" src="${history}" style="height: 592px;">
    </section>
    <section class="browser" style="left: 720px; top: 136px; width: 760px; height: 520px;">
      <div class="dots"><span></span><span></span><span></span></div>
      <img class="screen" src="${insights}" style="height: 472px;">
    </section>
  </main>`
);

await render(
  browser,
  "finley-mobile.jpg",
  1400,
  1000,
  `
  <main class="stage">
    <div class="grain"></div>
    <div class="brand" style="left: 96px; top: 72px;"><div class="mark"><img src="${logo}" alt=""></div><div><strong>Finley</strong><small>Финансы в зоне большого пальца</small></div></div>
    <p class="caption" style="left: 96px; top: 224px;"><b>Ввод за пять секунд</b> с preview-карточкой перед сохранением.</p>
    <section class="phone" style="left: 560px; top: 120px; transform: rotate(-3deg);">
      <img src="${mobileDashboard}">
    </section>
    <section class="phone" style="left: 880px; top: 180px; transform: rotate(5deg);">
      <img src="${quickAdd}">
    </section>
  </main>`
);

await browser.close();

console.log("Mockups written to public/mockups");
