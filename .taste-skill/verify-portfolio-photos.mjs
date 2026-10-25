import { Browser, sleep } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs'
const browser = await Browser.launch()
try {
 const page = await browser.newPage({width:390,height:844,mobile:true})
 await page.goto('http://127.0.0.1:3000', {settleMs:400})
 for (let n=1;n<=3;n++) {
  await page.eval(n=>document.querySelector(`.barber-card-${n} .barber-book-link`).click(),n)
  await sleep(450)
  const result=await page.eval(async()=>{const images=[...document.querySelectorAll('.profile-cut img')];await Promise.all(images.map(i=>i.decode()));return {name:document.querySelector('.modal-head h2').textContent,count:images.length,loaded:images.every(i=>i.naturalWidth>0)}})
  if(result.count!==4||!result.loaded)throw new Error(JSON.stringify(result))
  console.log(result)
  if(n===2)await page.screenshot({path:'.taste-skill/barber-profiles/mark-portfolio-photos.jpg'})
  await page.eval(()=>document.querySelector('.profile-cut').click())
  await sleep(150)
  if(!await page.eval(()=>document.querySelector('.profile-cut-full')?.naturalWidth>0))throw new Error('Full photo failed')
  await page.eval(()=>document.querySelector('.modal-close').click())
  await sleep(100)
 }
 if(page.consoleErrors.length)throw new Error(page.consoleErrors.join('\n'))
 console.log('All 12 portfolio photos and enlarged views load correctly.')
}finally{await browser.close()}
