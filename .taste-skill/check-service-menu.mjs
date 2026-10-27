import { Browser, sleep } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs'
import { mkdirSync } from 'node:fs'
mkdirSync('.taste-skill/service-menu', { recursive: true })
const browser = await Browser.launch()
const assert = (condition, message) => { if (!condition) throw new Error(message) }
try {
  for (const width of [1440, 768, 390, 320]) {
    const page = await browser.newPage({ width, height: width === 320 ? 640 : 900, mobile: width < 600 })
    await page.goto('http://127.0.0.1:5173', { settleMs: 200 })
    const click = async (selector) => {
      await page.eval(s => { const e = document.querySelector(s); if (!e || e.disabled) throw new Error('Unavailable control: ' + s); e.click() }, selector)
      await sleep(50)
    }
    const service = async (name, inBooking = false) => {
      await page.eval(({ name, inBooking }) => {
        const button = [...document.querySelectorAll(inBooking ? '.service-choice' : '.service-menu-option')].find(e => e.querySelector('strong').textContent === name)
        if (!button) throw new Error('Missing service: ' + name)
        button.click()
      }, { name, inBooking })
      await sleep(50)
    }
    const total = async (value, inBooking = false) => {
      assert(await page.eval(({ value, inBooking }) => document.querySelector(inBooking ? '.booking-total > strong' : '.service-menu-total > strong').textContent === value, { value, inBooking }), `${width}: incorrect total ${value}`)
    }
    const count = async (value, inBooking = false) => {
      assert(await page.eval(({ value, inBooking }) => document.querySelectorAll(inBooking ? '.service-choice[aria-pressed="true"]' : '.service-menu-option[aria-pressed="true"]').length === value, { value, inBooking }), `${width}: incorrect selected count ${value}`)
    }
    const layout = async () => {
      assert(await page.eval(() => {
        const d = document.querySelector('[role="dialog"]')
        const total = document.querySelector('.booking-total')?.getBoundingClientRect()
        return document.documentElement.scrollWidth <= innerWidth + 1 && (!d || d.scrollWidth <= d.clientWidth + 1) && (!total || (total.top >= 0 && total.bottom <= innerHeight))
      }), `${width}: overflow or hidden booking total`)
    }
    const snapshot = async (name) => {
      await sleep(400)
      await layout()
      await page.screenshot({ path: `.taste-skill/service-menu/${name}-${width}.jpg` })
    }
    await page.eval(() => document.querySelector('#services').scrollIntoView({ behavior: 'instant', block: 'start' }))
    assert(await page.eval(() => {
      const cards = [...document.querySelectorAll('.service-menu-option')]
      const first = cards[0].getBoundingClientRect(), second = cards[1].getBoundingClientRect()
      return cards.every(card => card.scrollWidth <= card.clientWidth + 1) && Math.abs(first.top - second.top) < 1 && second.left > first.right
    }), `${width}: services grid layout failed`)
    await snapshot('two-column-menu')
    await total('₱0')
    assert(await page.eval(() => document.querySelector('.service-menu-book').disabled), 'Empty menu must not proceed')
    assert(await page.eval(() => document.querySelectorAll('.service-menu-option').length === 11), 'Missing services')
    await click('.service-menu-filters button:nth-child(2)')
    await service('Haircut Only')
    await total('₱250')
    await click('.service-menu-filters button:nth-child(3)')
    await service('Facial Shave')
    await total('₱450')
    await click('.service-menu-filters button:nth-child(5)')
    await service('High Fashion Color')
    await total('Starts at ₱2,450')
    await click('.service-menu-filters button:first-child')
    await count(3)
    await service('High Fashion Color')
    await total('₱450')
    await service('High Fashion Color')
    await total('Starts at ₱2,450')
    await page.eval(() => document.querySelector('.service-menu-selection').scrollIntoView({ behavior: 'instant', block: 'start' }))
    await snapshot('multiple-menu')
    await click('.service-menu-book')
    assert(await page.eval(() => document.querySelectorAll('.barber-choice').length === 3 && !document.querySelector('.service-choice')), `${width}: preselected services must open the barber step`)
    await total('Starts at ₱2,450', true)
    await click('.booking-footer .button-gold')
    assert(await page.eval(() => document.querySelector('.form-error').textContent === 'Choose a barber to continue.'), 'Barber selection remains required')
    await click('.booking-footer .button-quiet')
    await count(3, true)
    assert(await page.eval(() => {
      const cards = [...document.querySelectorAll('.service-choice')]
      return cards.every(card => card.scrollWidth <= card.clientWidth + 1) && Math.abs(cards[0].getBoundingClientRect().top - cards[1].getBoundingClientRect().top) < 1
    }), `${width}: booking services must fit in two columns`)
    await total('Starts at ₱2,450', true)
    await service('Haircut & Shampoo', true)
    await total('Starts at ₱2,800', true)
    await service('High Fashion Color', true)
    await total('₱800', true)
    await service('High Fashion Color', true)
    await total('Starts at ₱2,800', true)
    await snapshot('multiple-booking')
    await click('.booking-footer .button-gold')
    await click('.barber-choice')
    await click('.booking-footer .button-quiet')
    await count(4, true)
    await total('Starts at ₱2,800', true)
    await click('.booking-footer .button-gold')
    await click('.booking-footer .button-gold')
    if (!await page.eval(() => !!document.querySelector('.calendar-day:not(:disabled)'))) await click('.calendar-head button:last-child')
    await click('.calendar-day:not(:disabled)')
    await click('.booking-footer .button-gold')
    await click('.time-choice:not(:disabled)')
    await click('.booking-footer .button-gold')
    await page.eval(() => {
      for (const [key, value] of [['name', 'Sample Visitor'], ['tel', '09171234567']]) {
        const input = document.querySelector(`input[autocomplete="${key}"]`)
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value)
        input.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })
    await sleep(50)
    await click('.booking-footer .button-gold')
    assert(await page.eval(() => document.querySelectorAll('.review-services li').length === 4 && document.querySelector('.review-total strong').textContent === 'Starts at ₱2,800'), `${width}: review lost services or total`)
    assert(await page.eval(() => document.querySelector('.review-services').nextElementSibling.matches('.review-total')), 'Review total must directly follow the services breakdown')
    await snapshot('multiple-review')
    await click('.booking-footer .button-gold')
    assert(await page.eval(() => document.querySelectorAll('.confirmation-services li').length === 4 && document.querySelector('.confirmation-summary').textContent.includes('Starts at ₱2,800')), `${width}: confirmation lost services or total`)
    assert(await page.eval(() => {
      const services = document.querySelector('.confirmation-services'), total = document.querySelector('.confirmation-total')
      const serviceRect = services.getBoundingClientRect(), totalRect = total.getBoundingClientRect()
      return services.nextElementSibling === total && totalRect.top >= serviceRect.bottom && Math.abs(totalRect.left - serviceRect.left) < 1 && Math.abs(totalRect.width - serviceRect.width) < 1
    }), 'Receipt total must be directly below the services breakdown')
    await page.eval(() => document.querySelector('.confirmation-summary').scrollIntoView({ behavior: 'instant', block: 'center' }))
    await snapshot('multiple-confirmation')
    await click('.confirmation-actions .button-gold')
    await count(0, true)
    await total('₱0', true)
    await click('.booking-footer .button-gold')
    assert(await page.eval(() => document.querySelector('.form-error').textContent === 'Choose at least one service to continue.'), 'Empty booking must not proceed')
    await click('.modal-close')
    // Direct booking has no services selected, independently of the menu selection.
    await click('.hero-book-button')
    assert(await page.eval(() => document.querySelectorAll('.service-choice').length === 11), 'Direct booking must start at services')
    await count(0, true)
    await total('₱0', true)
    assert(page.consoleErrors.length === 0, page.consoleErrors.join('\n'))
    console.log(`${width}: multiple selections, category persistence, add/remove totals, starting prices, booking handoff, back navigation, review, confirmation, reset, validation and responsive layout pass.`)
    await page.close()
  }
} finally { await browser.close() }
