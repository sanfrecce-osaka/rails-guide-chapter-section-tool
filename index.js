const inquirer = require("inquirer")
const puppeteer = require("puppeteer")
const fs = require("fs")

;(async () => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto("https://railsguides.jp/")
  const links = await page.$$eval("dt > a", (elements) =>
    Object.fromEntries(elements.map((element) => [element.innerText, element.getAttribute("href")]))
  )

  const { title, fileName } = await inquirer.prompt([
    { type: "list", name: "title", message: "choices title", choices: Object.keys(links) },
    { type: "input", name: "fileName", message: "output to" },
  ])

  await page.goto(`https://railsguides.jp/${links[title]}`)
  await page.waitForSelector("ol.chapters")
  const chapters = await page.$$("ol.chapters > li")

  const titles = await Promise.all(
    chapters.map(async (chapter) => await chapter.$$eval("a", (anchors) => anchors.map(({ innerText }) => innerText)))
  )

  const text = titles
    .flatMap(([chapterTitle, ...sectionTitles], chapterIndex) => [
      `### ${chapterIndex + 1}. ${chapterTitle}`,
      "",
      ...(sectionTitles.length <= 0
        ? ["- ", ""]
        : sectionTitles.flatMap((sectionTitle, sectionIndex) => [
            `#### ${chapterIndex + 1}.${sectionIndex + 1}. ${sectionTitle}`,
            "",
            "- ",
            "",
          ])),
    ])
    .join("\n")

  fs.writeFile(fileName, text, (error) => console.log(error ? error : "write end"))

  await browser.close()
})()
