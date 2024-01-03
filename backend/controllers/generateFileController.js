import puppeteer from "puppeteer";
import asyncHandler from "express-async-handler";
import fs from "fs";
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
    await page.setViewport({ width: 1200, height: 1200 });


    // Set the HTML content with the base URL
    await page.setContent(`
        <html>
            <head>
                <link   
                 rel="stylesheet"
                 href="http://localhost:5000/uploads/index.css">
                 <link   
                  rel="stylesheet"
                  href="http://localhost:5000/uploads/damiContent.css">
                  <link   
                  rel="stylesheet"
                  href="http://localhost:5000/uploads/bootstrap.min.css">
            </head>
            <body>
                ${html}
            </body>
        </html>
    `, { waitUntil: 'domcontentloaded' });

    // Wait for a short period to ensure styles are applied (adjust if necessary)
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
        const exampleElement = document.getElementById('dami');
        console.log(exampleElement);
    });

    // Take a screenshot of the visible area
    const screenshotBuffer = await page.screenshot();

    // Close the browser
    await browser.close();

    // Save the screenshot as an image file
    const timestamp = Date.now();
    const imagePath = `uploads/screenshot_${timestamp}.png`;

    fs.writeFileSync(imagePath, screenshotBuffer);

    // Send the URL of the saved image as a response
    const imageUrl = `http://localhost:5000/${imagePath}`; // Update with your server's URL
    res.json({ imageUrl });



});