import http, { IncomingMessage, Server, ServerResponse } from "http";
import puppeteer from 'puppeteer';
import url from 'url';

const server: Server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === "GET") {
    let inputUrl: any = req.url;
    let parseUrl = inputUrl.slice(6);

    if (!parseUrl) {
      res.statusCode = 400;
      res.end("Please provide a URL to parse");
      return;
    }

    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(parseUrl);

      const pageTitle: string = await page.title();

      const description: string | null = await page.$eval('head meta[name="description"]', (el: HTMLMetaElement) => el.getAttribute('content'));
      const images: string[] = await page.$$eval('img', (imgs: Element[]) => imgs.map((img: Element) => (img as HTMLImageElement).getAttribute('src') as string));

      await browser.close();

      res.end(JSON.stringify({ pageTitle, description, images }));
    } catch (error) {
      res.statusCode = 500;
      res.end("An error occurred while parsing the URL");
    }
  }
});




server.listen(3001, () => console.log("listening for requests on port 3001"));
