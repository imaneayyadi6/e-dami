import puppeteer from "puppeteer";
import asyncHandler from "express-async-handler";

// @desc    Afficher tous les directions
// @route   GET /api/generate/image
// @access  private
export const generateImage = asyncHandler(async (req, res) => {
    const { html } = req.body;

    if (!html) {
        return res.status(400).json({ error: 'HTML content is required.' });
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set a larger viewport size for better screenshot quality
    await page.setViewport({ width: 1200, height: 800 });

    // Set the HTML content
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    // Wait for network idle to ensure all external resources are loaded
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Take a screenshot and convert it to base64
    const screenshotBuffer = await page.screenshot();
    const screenshotBase64 = screenshotBuffer.toString('base64');

    // Close the browser
    await browser.close();

    // Send the HTML image tag as a response
    const imageTag = `<img src="data:image/png;base64,${screenshotBase64}" alt="Screenshot" />`;
    res.send(imageTag);



});