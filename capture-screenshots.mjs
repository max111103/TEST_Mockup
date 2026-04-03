/**
 * WMS Mock 仕様書用スクリーンショット取得スクリプト
 * 実行: node capture-screenshots.mjs
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, 'docs', 'screenshots');
const HTML_PATH = `file://${path.join(__dirname, 'PCI_Mock.html').replace(/\\/g, '/')}`;

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function capture(page, name) {
  await delay(600);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${name}.png`), fullPage: false });
  console.log(`  [OK] ${name}.png`);
}

// サイドバーを展開してサブメニューを開いてからクリック
async function navigateTo(page, menuId, submenuText) {
  // サイドバーをホバーして展開
  await page.hover('#sidebar');
  await delay(400);
  // 親メニューをクリックしてサブメニューを開く
  await page.click(`#${menuId}`);
  await delay(300);
  // サブメニュー内のテキストをクリック（完全一致）
  const submenuSelector = `#${menuId.replace('-menu', '-submenu')}`;
  await page.locator(`${submenuSelector} span`).filter({ hasText: new RegExp(`^${submenuText}$`) }).click();
  await delay(600);
  // サイドバーから離れて折りたたむ
  await page.mouse.move(700, 400);
  await delay(400);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  page.on('dialog', async dialog => { await dialog.accept(); });

  await page.goto(HTML_PATH, { waitUntil: 'networkidle' });
  await delay(1000);

  // --- 1. 入荷予定登録 (デフォルト画面) ---
  console.log('[入荷予定登録]');
  await page.mouse.move(700, 400);
  await delay(400);
  await capture(page, '01_nyuka_yotei_touroku');

  // --- 2. 入荷検品 ---
  console.log('[入荷検品]');
  await navigateTo(page, 'nyuka-menu', '入荷検品');
  await capture(page, '02_nyuka_kenpin');

  // --- 3. 在庫一覧 ---
  console.log('[在庫一覧]');
  await navigateTo(page, 'zaiko-menu', '在庫一覧');
  await capture(page, '03_zaiko_ichiran');

  // --- 4. 棚振り ---
  console.log('[棚振り]');
  await navigateTo(page, 'zaiko-menu', '棚振り');
  await capture(page, '04_tanafuri');

  // --- 5. ロケ振り ---
  console.log('[ロケ振り]');
  await navigateTo(page, 'zaiko-menu', 'ロケ振り');
  await capture(page, '05_lokefuri');

  // --- 6. 出荷予定登録 ---
  console.log('[出荷予定登録]');
  await navigateTo(page, 'shukka-menu', '出荷予定登録');
  await capture(page, '06_shukka_yotei_touroku');

  // --- 7. 出荷一覧 ---
  console.log('[出荷一覧]');
  await navigateTo(page, 'shukka-menu', '出荷一覧');
  await capture(page, '07_shukka_ichiran');

  // --- 8. ピッキング ---
  console.log('[ピッキング]');
  await navigateTo(page, 'shukka-menu', 'ピッキング');
  await delay(200);
  // 「ピッキング作業」ではなく最初の「ピッキング」を取得するためindex指定
  await capture(page, '08_picking');

  // --- 9. ピッキング作業 ---
  console.log('[ピッキング作業]');
  await navigateTo(page, 'shukka-menu', 'ピッキング作業');
  await capture(page, '09_picking_sagyo');

  // --- 10. 出荷検品 ---
  console.log('[出荷検品]');
  await navigateTo(page, 'shukka-menu', '出荷検品');
  await capture(page, '10_shukka_kenpin');

  // --- 11. 棚卸データ設定 ---
  console.log('[棚卸データ設定]');
  await navigateTo(page, 'tanaoroshi-menu', '棚卸データ設定');
  await capture(page, '11_tanaoroshi_data');

  // --- 12. 棚卸実施 ---
  console.log('[棚卸実施]');
  await navigateTo(page, 'tanaoroshi-menu', '棚卸実施');
  await capture(page, '12_tanaoroshi_jisshi');

  // --- 13. 棚卸進捗 ---
  console.log('[棚卸進捗]');
  await navigateTo(page, 'tanaoroshi-menu', '棚卸進捗');
  await capture(page, '13_tanaoroshi_shinchoku');

  // --- 14. 棚卸結果 ---
  console.log('[棚卸結果]');
  await navigateTo(page, 'tanaoroshi-menu', '棚卸結果');
  await capture(page, '14_tanaoroshi_kekka');

  // --- 15. 商品マスタ ---
  console.log('[商品マスタ]');
  await navigateTo(page, 'kanri-menu', '商品マスタ');
  await capture(page, '15_shohin_master');

  // --- 16. ロケーションマスタ ---
  console.log('[ロケーションマスタ]');
  await navigateTo(page, 'kanri-menu', 'ロケーションマスタ');
  await capture(page, '16_location_master');

  // --- 17. 入荷検品履歴 ---
  console.log('[入荷検品履歴]');
  await navigateTo(page, 'rireki-menu', '入荷検品履歴');
  await capture(page, '17_nyuka_kenpin_rireki');

  // --- 18. ダッシュボード ---
  console.log('[ダッシュボード]');
  await page.hover('#sidebar');
  await delay(400);
  await page.locator('aside nav > div:first-child').click();
  await delay(800);
  await page.mouse.move(700, 400);
  await delay(400);
  await capture(page, '18_dashboard');

  await browser.close();
  console.log('\n全スクリーンショットの取得が完了しました。');
})();
