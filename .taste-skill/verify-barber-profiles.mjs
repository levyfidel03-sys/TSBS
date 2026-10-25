import { Browser, sleep } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs'
import { mkdirSync } from 'node:fs'
const browser = await Browser.launch()
mkdirSync('.taste-skill/barber-profiles', { recursive: true })
const results = []
const check = (value, message) => { if (!value) throw new Error(message); results.push(message) }
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ width, height: 844, mobile: width < 600 })
    await page.goto('http://127.0.0.1:3000', { settleMs: 400 })
    const click = async (selector) => { await page.eval((s) => { const el = document.querySelector(s); if (!el) throw new Error(s); el.focus(); el.click() }, selector); await sleep(400) }
    for (let index = 0; index < 3; index++) {
      const selector = `.barber-card-${index + 1} .barber-book-link`
      await click(selector)
      check(await page.eval(() => document.querySelector('.profile-empty') && document.querySelector('[role="dialog"]').contains(document.activeElement)), `${width}: profile ${index + 1} opens with honest empty state and focus`)
      if (index === 0) await page.screenshot({ path: `.taste-skill/barber-profiles/profile-${width}.jpg` })
      check(await page.eval(() => { const p = document.querySelector('.modal-panel'); return p.scrollWidth <= p.clientWidth + 1 }), `${width}: profile fits viewport`)
      const name = await page.eval(() => document.querySelector('.modal-head h2').textContent)
      await click('.profile-footer .button')
      check(await page.eval(() => !document.querySelector('.barber-profile-content') && !!document.querySelector('.booking-body')), `${width}: profile transitions to booking`)
      await click('.service-choice')
      await click('.booking-footer .button-gold')
      check(await page.eval((n) => document.querySelector('.barber-choice[aria-pressed="true"]').textContent.includes(n), name), `${width}: ${name} preselected`)
      await click('.modal-close')
    }
    // Browser-only fixtures exercise the populated gallery; no fixture data is saved.
    await page.eval(async () => {
      const moduleUrl = performance.getEntriesByType('resource').find((entry) => /\/data\.ts(?:\?|$)/.test(entry.name))?.name || '/data.ts'
      const { barbers } = await import(moduleUrl)
      barbers[0].portfolio.push(
        { id: 'test-fade', title: 'Test fade', category: 'Fades', image: '/hero.webp', description: 'Browser test reference only.' },
        { id: 'test-texture', title: 'Test texture', category: 'Texture', image: '/hero.webp', description: 'Browser test reference only.' }
      )
    })
    await click('.barber-card-1 .barber-book-link')
    check(await page.eval(() => document.querySelectorAll('.profile-cut').length === 2), `${width}: populated portfolio renders`)
    await click('.profile-filters button:last-child')
    check(await page.eval(() => document.querySelectorAll('.profile-cut').length === 1 && document.querySelector('.profile-cut').textContent.includes('Test texture')), `${width}: category filters cuts`)
    await click('.profile-cut')
    check(await page.eval(() => !!document.querySelector('.profile-cut-full') && document.activeElement.matches('.profile-cut-heading')), `${width}: enlarged cut view receives focus`)
    await click('.profile-back')
    check(await page.eval(() => document.activeElement.matches('.profile-cut')), `${width}: gallery back restores thumbnail focus`)
    await click('.profile-cut')
    await click('.profile-footer .button')
    for (const s of ['.service-choice', '.booking-footer .button-gold', '.booking-footer .button-gold', '.calendar-day:not(:disabled)', '.booking-footer .button-gold', '.time-choice:not(:disabled)', '.booking-footer .button-gold']) await click(s)
    check(await page.eval(() => document.querySelector('.booking-form-grid textarea').value.includes('Preferred cut: Test texture')), `${width}: chosen haircut carried into editable booking notes`)
    check(page.consoleErrors.length === 0, `${width}: no browser runtime errors`)
    await page.close()
  }
  console.log(results.join('\n'))
} finally { await browser.close() }
