import {Browser,sleep} from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs'
import {mkdirSync} from 'node:fs'
mkdirSync('.taste-skill/typography',{recursive:true})
const browser=await Browser.launch()
try {
 for(const width of [1440,390,320]) {
  const page=await browser.newPage({width,height:900,mobile:width<600})
  await page.goto('http://127.0.0.1:3000',{settleMs:500})
  await page.eval(()=>document.fonts.ready)
  await sleep(600)
  const result=await page.eval(()=>{
   const hero=document.querySelector('.hero h1'), name=document.querySelector('.hero-shop-name'),header=document.querySelector('.nav-shell')
   const range=document.createRange();range.selectNodeContents(hero)
   return {width:innerWidth,pageWidth:document.documentElement.scrollWidth,font:getComputedStyle(name).fontFamily,fontLoaded:document.fonts.check('400 26px "Bodoni Moda"'),heroSize:getComputedStyle(hero).fontSize,heroRight:range.getBoundingClientRect().right,headerWidth:header.scrollWidth,headerClient:header.clientWidth,headline:hero.textContent}
  })
  console.log(result)
  if(result.pageWidth>width+1||result.heroRight>width||result.headerWidth>result.headerClient+1)throw new Error('Overflow at '+width)
  await page.screenshot({path:`.taste-skill/typography/hero-${width}.jpg`})
  if(width===1440||width===390){await page.eval(()=>document.querySelector('#barbers').scrollIntoView({behavior:'instant',block:'start'}));await sleep(500);await page.screenshot({path:`.taste-skill/typography/barbers-${width}.jpg`})}
  await page.close()
 }
}finally{await browser.close()}
