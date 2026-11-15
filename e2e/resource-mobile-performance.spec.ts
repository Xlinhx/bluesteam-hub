import { test, expect, type Page, type Locator } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });

async function observe(page: Page) {
  await page.addInitScript(() => {
    const state = { events: [] as number[], tasks: [] as number[], shifts: [] as number[], details: [] as unknown[], windows: [] as Array<{ start:number; end:number }>, animations: [] as Animation[], eventTiming: PerformanceObserver.supportedEntryTypes.includes('event') };
    (window as any).__motionPerf = state;
    for (const type of ['event', 'longtask', 'layout-shift']) {
      if (!PerformanceObserver.supportedEntryTypes.includes(type)) continue;
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries() as any[]) {
          // Playwright's role/visibility queries also execute on the main thread.
          // Only charge work during gestures and their subsequent presentation.
          if (!state.windows.some(window => entry.startTime >= window.start && entry.startTime <= window.end)) continue;
          if (type === 'event' && entry.interactionId) state.events.push(entry.duration);
          if (type === 'longtask') state.tasks.push(entry.duration);
          if (type === 'layout-shift' && !entry.hadRecentInput) state.shifts.push(entry.value);
          if ((type === 'event' && entry.interactionId && entry.duration > 100) || type === 'layout-shift' && !entry.hadRecentInput || type === 'longtask') state.details.push({ type, name: entry.name, start: entry.startTime, duration: entry.duration, inputDelay:entry.processingStart-entry.startTime, processing: entry.processingEnd - entry.processingStart, presentation:entry.startTime+entry.duration-entry.processingEnd, target: entry.target?.outerHTML?.slice(0, 180), value: entry.value, sources: entry.sources?.map((source: any) => ({ node: source.node?.outerHTML?.slice(0, 180), previous: source.previousRect, current: source.currentRect })) });
        }
      });
      observer.observe(type === 'event' ? { type, durationThreshold: 16 } as any : { type });
    }
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) { const result = animate.call(this, frames, options); state.animations.push(result); return result; };
  });
}

for (const slowdown of [1, 4]) for (const scenario of ['learner', 'teacher', 'profile']) test(`${scenario} mobile settled-scene touch response and motion lifecycle at ${slowdown}x CPU slowdown`, async ({ page }, testInfo) => {
  const teacher=scenario==='teacher', profile=scenario==='profile';
  const scene=teacher?'.teacher-resource-library':profile?'.learner-profile':'.resource-library';
  const ready=teacher?'.teacher-resource-table-wrap[aria-busy=false]':profile?'.profile-journey-artworks':'.resource-group-section';
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  expect((await page.request.post('/api/v1/auth/login', { data: teacher ? { role: 'teacher', email: 'colinh@bluesteam.edu.vn', password: 'daiduong2026' } : { role: 'student', email: 'hocsinh', password: 'hocsinh' } })).ok()).toBe(true);
  await observe(page);
  const cdp = await page.context().newCDPSession(page);
  const tap = async (button: Locator) => {
    await button.scrollIntoViewIfNeeded(); const box = (await button.boundingBox())!;
    await page.evaluate(() => { const state=(window as any).__motionPerf; state.windows.push({ start:performance.now(), end:Infinity }); state.previous=performance.now(); state.sampling=true; });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }] });
    await page.waitForTimeout(64);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    // Do not traverse ARIA or force layout before this interaction has painted.
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => {
      const state=(window as any).__motionPerf; state.windows[state.windows.length-1].end=performance.now(); state.sampling=false; resolve();
    }, 500)))));
  };
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: slowdown });
  await page.goto(teacher ? '/teacher/resources' : profile ? '/profile' : '/resources');
  await expect(page.locator(ready).first()).toBeVisible();
  // Measure interaction separately from first-load image/font decode and entry
  // choreography. Cold-entry gestures have their own functional motion tests.
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].filter(image => image.getBoundingClientRect().top < innerHeight && image.getBoundingClientRect().bottom > 0).map(image => image.decode().catch(() => {})));
    await Promise.all(document.getAnimations().filter(animation => Number.isFinite(animation.effect?.getTiming().iterations) && Number(animation.effect?.getTiming().duration) <= 2000).map(animation => animation.finished.catch(() => {})));
  });
  await page.evaluate(() => {
    const state = (window as any).__motionPerf; state.events = []; state.tasks = []; state.shifts = []; state.details = [];
    state.gaps = []; state.sampling = false; state.recording=true;
    const frame = (now: number) => { if (!state.recording) return; if(state.sampling)state.gaps.push(now-state.previous); state.previous=now; requestAnimationFrame(frame); };
    requestAnimationFrame(frame);
  });
  const trace: any[] = [];
  if (process.env.MOTION_TRACE) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.start'); cdp.on('Tracing.dataCollected', event => trace.push(...event.value)); await cdp.send('Tracing.start', { categories: 'devtools.timeline,v8.execute', transferMode: 'ReportEvents' }); }
  if (teacher) {
    await tap(page.getByRole('button', { name: 'Thêm học liệu', exact: true }));
    const editor = page.getByRole('dialog', { name: 'Thêm học liệu', exact: true });
    await expect(editor).toBeVisible();
    const title=editor.getByRole('textbox',{name:'Tên học liệu',exact:true});
    await tap(title); await expect(title).toBeFocused();
    await tap(editor.getByRole('tab', { name: 'Nhóm & liên kết', exact: true }));
    await tap(editor.getByRole('tab', { name: 'Nội dung', exact: true }));
    await tap(editor.getByRole('button', { name: 'Hủy', exact: true })); await expect(editor).toHaveCount(0);
  } else if (profile) {
    await tap(page.getByRole('button', { name:'Đổi tên và hình',exact:true }));
    const identity=page.getByRole('dialog',{name:'Tên và hình của bé',exact:true});
    await expect(identity).toBeVisible();
    const name=identity.getByRole('textbox',{name:'Tên của bé',exact:true});
    await tap(name); await expect(name).toBeFocused();
    const avatarName=await identity.locator('.animal-option[aria-pressed=false]').first().getAttribute('aria-label');
    const avatar=identity.getByRole('button',{name:avatarName!,exact:true});
    await tap(avatar); await expect(avatar).toHaveAttribute('aria-pressed','true');
    await tap(identity.getByRole('button',{name:'Hủy',exact:true})); await expect(identity).toHaveCount(0);
  } else {
    await tap(page.getByRole('button', { name: 'Chọn nhóm học liệu', exact: true }));
    await expect(page.locator('.resource-group-choices button').first()).toBeVisible();
    const search=page.getByRole('searchbox',{name:'Tìm nhóm học liệu',exact:true});
    await tap(search); await expect(search).toBeFocused();
    await tap(page.getByRole('button', { name: 'Đóng chọn nhóm' })); await expect(page.locator('dialog[open]')).toHaveCount(0);
    await cdp.send('Input.synthesizeScrollGesture', { x: 190, y: 600, yDistance: -400, speed: 500, gestureSourceType: 'touch' });
    const save = page.getByRole('button', { name: /^Lưu / }).first(); await tap(save);
    await expect(page.getByRole('button', { name: /^Bỏ lưu / }).first()).toHaveAttribute('aria-pressed', 'true');
  }
  await page.evaluate(() => new Promise<void>(resolve => setTimeout(resolve, 1200)));
  if (process.env.MOTION_TRACE) {
    const { profile } = await cdp.send('Profiler.stop');
    console.log('CPU self samples', JSON.stringify(profile.nodes.filter(node => node.hitCount).sort((a,b) => (b.hitCount || 0) - (a.hitCount || 0)).slice(0,16).map(node => ({ hits:node.hitCount,...node.callFrame }))));
    const complete = new Promise<void>(resolve => cdp.once('Tracing.tracingComplete', () => resolve())); await cdp.send('Tracing.end'); await complete;
    console.log('trace tasks', JSON.stringify(trace.filter(event => event.ph === 'X' && event.dur > 8000 && ['EventDispatch', 'FunctionCall', 'Layout', 'UpdateLayoutTree', 'Paint', 'Animation', 'FireAnimationFrame'].includes(event.name)).sort((a, b) => b.dur - a.dur).slice(0, 24).map(event => ({ name: event.name, ms: event.dur / 1000, data: event.args?.data }))));
  }
  const metrics = await page.evaluate(() => {
    const state = (window as any).__motionPerf; state.sampling = false; state.recording=false;
    const gaps = state.gaps.slice(1).sort((a: number, b: number) => a - b);
    return { eventTiming: state.eventTiming, interactions: state.events.length, maxInteractionMs: Math.max(0, ...state.events), mainThreadP95Ms: gaps[Math.floor(gaps.length * .95)] || 0, blockingMs: state.tasks.reduce((sum: number, duration: number) => sum + Math.max(0, duration - 50), 0), layoutShift: state.shifts.reduce((sum: number, value: number) => sum + value, 0), samples: gaps.length, details: state.details };
  });
  const { details: _details, ...summary } = metrics;
  console.log(`${scenario} mobile ${slowdown}x`, JSON.stringify(summary));
  if (metrics.maxInteractionMs > 200) console.log('slow interactions', JSON.stringify(metrics.details.filter((detail:any) => detail.type === 'event')));
  await testInfo.attach(`mobile-${slowdown}x-metrics`, { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' });
  expect(metrics.eventTiming).toBe(true); expect(metrics.samples).toBeGreaterThan(20);
  expect.soft(metrics.maxInteractionMs).toBeLessThanOrEqual(200);
  expect.soft(metrics.mainThreadP95Ms).toBeLessThanOrEqual(50);
  expect.soft(metrics.blockingMs).toBeLessThanOrEqual(200);
  expect.soft(metrics.layoutShift).toBeLessThanOrEqual(.1);
  for (let index = 0; index < 3; index++) {
    await page.getByRole('button', { name: teacher ? 'Trang chủ' : profile ? 'Học liệu' : 'Hồ sơ', exact: true }).first().tap();
    await expect(page.locator(scene)).toHaveCount(0);
    await page.getByRole('button', { name: profile ? 'Hồ sơ' : 'Học liệu', exact: true }).first().tap();
    await expect(page.locator(ready).first()).toBeVisible();
  }
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.oceanTransition || '')).toBe('');
  expect(await page.evaluate(() => (window as any).__motionPerf.animations.filter((animation: Animation) => animation.playState === 'running' && animation.effect instanceof KeyframeEffect && animation.effect.target instanceof Element && !animation.effect.target.isConnected).map((animation:Animation)=>({target:(animation.effect as KeyframeEffect).target?.outerHTML.slice(0,160),timing:animation.effect?.getTiming()})))).toEqual([]);
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.evaluate(() => new Promise(requestAnimationFrame));
  await expect.poll(() => page.locator(scene).evaluate(node => node.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length), { timeout:1000 }).toBe(0);
  expect(errors).toEqual([]);
});
