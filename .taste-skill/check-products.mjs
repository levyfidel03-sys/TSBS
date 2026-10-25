import {Browser,sleep} from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs'
import {mkdirSync} from 'node:fs'
mkdirSync('.taste-skill/products',{recursive:true})
const browser=await Browser.launch()
try {
 for(const width of [1440,390,320]){
  const page=await browser.newPage({width,height:900,mobile:width<600})
  await page.goto('http://127.0.0.1:3000',{settleMs:300})
  await page.eval(()=>document.querySelector('#products').scrollIntoView({behavior:'instant',block:'start'}))
  await sleep(500)
  const count=await page.eval(()=>document.querySelectorAll('#products .product-mockup').length)
  if(count!==7)throw new Error('Missing product mockups')
  if(!await page.eval(async()=>{const url=document.querySelector('.product-mockup image').getAttribute('href');const img=new Image();img.src=url;await img.decode();return img.naturalWidth===1920}))throw new Error('Sheet failed to load')
  if(await page.eval(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1))throw new Error('Horizontal overflow '+width)
  await page.screenshot({path:`.taste-skill/products/list-${width}.jpg`})
  await page.eval(()=>document.querySelector('.product-details').click())
  await sleep(400)
  if(!await page.eval(()=>document.querySelector('.product-detail-image')?.getAttribute('aria-label')==='Hair Wax mockup'))throw new Error('Wrong detail image')
  await page.screenshot({path:`.taste-skill/products/detail-${width}.jpg`})
  if(page.consoleErrors.length)throw new Error(page.consoleErrors.join('\n'))
  console.log(`${width}: seven mockups, image loading, detail image, and page overflow checks pass.`)
  await page.close()
 }
}finally{await browser.close()}
