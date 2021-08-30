const puppeteer = require("puppeteer")

const [, , url] = process.argv

;(async () => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(url)

  await page.waitForSelector("ol.chapters")
  const chapters = await page.$$eval("ol.chapters > li > a", (targets) => targets.map((target) => target.innerText))

  const lists = await page.$$("ol.chapters > li")

  const sections = await Promise.all(lists.map(async (list) => await list.$("ul")))
  const results = await Promise.all(
    chapters.map(async (chapter, i) => {
      if (!sections[i]) return { chapter, sections: [] }
      const sectionTitles = await sections[i].$$eval("li > a", (sectionList) =>
        sectionList.map((body) => body.innerText)
      )
      return { chapter, sections: sectionTitles }
    })
  )
  results.forEach((result, chapterIndex) => {
    console.log(`### ${chapterIndex + 1} ${result.chapter}`)
    console.log()

    if (result.sections.length <= 0) {
      console.log("- ")
      console.log()
      return
    }

    result.sections.forEach((section, sectionIndex) => {
      console.log(`#### ${chapterIndex + 1}.${sectionIndex + 1} ${section}`)
      console.log()
      console.log("- ")
      console.log()
    })
  })
  await browser.close()
})()
