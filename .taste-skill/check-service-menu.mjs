import {Browser,sleep} from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs'
import {mkdirSync} from 'node:fs'
mkdirSync('.taste-skill/service-menu',{recursive:true})
const browser=await Browser.launch()
try {
 for(const width of [1440,768,390,320]){
  const page=await browser.newPage({width,height:900,mobile:width<600})
  await page.goto('http://127.0.0.1:3000',{settleMs:300})
  const click=async(selector)=>{await page.eval(s=>document.querySelector(s).click(),selector);await sleep(100)}
  await page.eval(()=>document.querySelector('#services').scrollIntoView({block:'start',behavior:'instant'}))
  await sleep(500)
  if(await page.eval(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1))throw new Error('Overflow '+width)
  if(!await page.eval(()=>document.querySelectorAll('.service-menu-option').length===7))throw new Error('All services missing')
  await page.screenshot({path:`.taste-skill/service-menu/menu-${width}.jpg`})
  for(const [index,count] of [[2,3],[3,2],[4,2]]){
   await click(`.service-menu-filters button:nth-child(${index})`)
   if(!await page.eval(c=>document.querySelectorAll('.service-menu-option').length===c,count))throw new Error('Category filter failed')
   await click('.service-menu-option:last-child')
   const selected=await page.eval(()=>document.querySelector('.service-menu-option[aria-pressed="true"] .service-menu-name strong').textContent)
   if(!await page.eval(n=>document.querySelector('.service-menu-summary h4').textContent===n,selected))throw new Error('Summary mismatch')
   await click('.service-menu-book')
   if(!await page.eval(n=>document.querySelector('.service-choice[aria-pressed="true"]').textContent.includes(n),selected))throw new Error('Booking selection mismatch')
   await click('.modal-close')
  }
  if(page.consoleErrors.length)throw new Error(page.consoleErrors.join('\n'))
  console.log(`${width}: category counts, selection summary, booking preselection, and overflow checks pass.`)
  await page.close()
 }
}finally{await browser.close()}
