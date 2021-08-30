const puppeteer = require("puppeteer")

const [, , url] = process.argv

;(async () => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(url)

  await page.waitForSelector("ol.chapters")
  const chapters = await page.$$("ol.chapters > li")

  const titles = await Promise.all(
    chapters.map(async (chapter) => await chapter.$$eval("a", (anchors) => anchors.map(({ innerText }) => innerText)))
  )

  titles.forEach(([chapterTitle, ...sectionTitles], chapterIndex) => {
    console.log(`### ${chapterIndex + 1}. ${chapterTitle}`)
    console.log()

    if (sectionTitles.length <= 0) {
      console.log("- ")
      console.log()
      return
    }

    sectionTitles.forEach((sectionTitle, sectionIndex) => {
      console.log(`#### ${chapterIndex + 1}.${sectionIndex + 1}. ${sectionTitle}`)
      console.log()
      console.log("- ")
      console.log()
    })
  })
  await browser.close()
})()
