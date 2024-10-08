import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

// Define the uploads as static folder :
const __dirname = path.resolve();

// Function to generate PDF from HTML and CSS file
async function createPDF(htmlContent, cssFilePaths, outputPath) {
  // Read the CSS content from the file
  let cssContent = "";

  for (let cssFilepath of cssFilePaths) {
    cssContent += fs.readFileSync(cssFilepath, "utf8");
  }

  // Create a temporary HTML file with the provided HTML and CSS
  const tempHtmlPath = "temp.html";
  const fullHtml = `
    <html>
    <head>
     <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
      integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
      <style>
    
      ${cssContent}

        body:{
        font-size:10px !important;
      }

      </style>
    </head>
    <body class="">
        <div class="dami ">
            <div class="dami-header">
                    <div class="dami-snrt-logo">
                        <img alt="dami-logo" src="${path.join(
                          __dirname,
                          "/frontend/public/images/logo.png"
                        )}" class="dami-logo" />
                    </div>
                    <div class="dami-lb-tp">
                        <span class="d-block dami-type-de-processus"
                        >SNRT-DISI-PROCESSUS LIVRAISON DES SERVICES INFORMATIQUES</span
                        ><span class="d-block dami-libelle"
                        >e-dami-demande d'acces sur openmairie</span
                        >
                    </div>
                    <div class="dami-codification">
                        <table class="dami-codification-table">
                        <tr>
                            <td>document</td>
                            <td>
                            <span class="dami-header-codi-item dami-header-document"
                                >ERT.LSI.034.A</span
                            >
                            </td>
                        </tr>
                        <tr>
                            <td>classification</td>
                            <td>
                            <span class="dami-header-codi-item dami-header-classification"
                                >interne</span
                            >
                            </td>
                        </tr>
                        <tr>
                            <td>creation</td>
                            <td>
                            <span class="dami-header-codi-item dami-header-creation"
                                >20/09/2024</span
                            >
                            </td>
                        </tr>
                        <tr>
                            <td>maj</td>
                            <td>
                            <span class="dami-header-codi-item dami-header-maj">20/09/2024</span>
                            </td>
                        </tr>
                        </table>
                    </div>
            </div>

                
                <div class="demandeur-section">
                <table>
                    <tr>
                    <td><label>Date demande:</label></td>
                    <td><input class="dami-input" value="08/10/2024" /></td>
                    <td><label>Departement</label></td>
                    <td><input class="dami-input w-100" value="" /></td>
                    </tr>
                    <tr>
                    <td><label>Nom:</label></td>
                    <td><input class="dami-input" value="Ezzine" /></td>
                    <td><label>Prenom</label></td>
                    <td><input class="dami-input w-100" value="Imane" /></td>
                    </tr>
                    <tr>
                    <td><label>Matricule:</label></td>
                    <td><input class="dami-input" value="2019209" /></td>
                    <td><label>Service</label></td>
                    <td><input class="dami-input w-100" value="" /></td>
                    </tr>
                    <tr>
                    <td><label>Email:</label></td>
                    <td><input class="dami-input" value="i.ezzine@snrt.ma" /></td>
                    <td><label>Gsm</label></td>
                    <td><input class="dami-input w-100" value="+212-0762210566" /></td>
                    </tr>
                    <tr>
                    <td><label>Direction</label></td>
                    <td>
                        <input
                        class="dami-input w-100"
                        value="Direction des infrastructures et des systemes d'information"
                        />
                    </td>
                    </tr>
                </table>
                </div>

                <div class="dami-body p-2"> 
                    ${htmlContent}
                </div>


                        <div class="dami-footer">
                <div class="signataires">
                    <div class="directeur-lib"><span>Approbation Chef de Service</span></div>
                    <div class="directeur-lib">
                    <span>Approbation Chef de Departement</span>
                    </div>
                    <div class="directeur-lib">
                    <span>Approbation Directeur Hiearchique</span>
                    </div>
                    <div class="directeur-lib">
                    <span>Approbation Directeur de la </span
                    ><span>direction des infrastructures et des systemes d'information</span>
                    </div>
                </div>
                <div class="signataires-ch">
                    <div class="sig-item">
                    <div class="">
                        <label>Nom:</label><input class="dami-input" value="" />
                    </div>
                    <div class="">
                        <label>Prenom:</label><input class="dami-input" value="" />
                    </div>
                    <div class="d-flex align-items-center" style="margin-top: 5px">
                        <label>Decision:</label>
                        <div class="ml-1">
                        <label>Oui</label
                        ><input type="checkbox" class="dami-check-box mr-1 undefined" />
                        </div>
                        <div>
                        <label>Non</label
                        ><input type="checkbox" class="dami-check-box mr-1 undefined" />
                        </div>
                    </div>
                    <div class="">
                        <label>Date:</label><input class="dami-input" value="" />
                    </div>
                    </div>
                    <div class="sig-item">
                    <div class="">
                        <label>Nom:</label><input class="dami-input" value="" />
                    </div>
                    <div class="">
                        <label>Prenom:</label><input class="dami-input" value="" />
                    </div>
                    <div class="d-flex align-items-center" style="margin-top: 5px">
                        <label>Decision:</label>
                        <div class="ml-1">
                        <label>Oui</label
                        ><input type="checkbox" class="dami-check-box mr-1 undefined" />
                        </div>
                        <div>
                        <label>Non</label
                        ><input type="checkbox" class="dami-check-box mr-1 undefined" />
                        </div>
                    </div>
                    <div class="">
                        <label>Date:</label><input class="dami-input" value="" />
                    </div>
                    </div>
                    <div class="sig-item">
                    <div class="">
                        <label>Nom:</label><input class="dami-input" value="" />
                    </div>
                    <div class="">
                        <label>Prenom:</label><input class="dami-input" value="" />
                    </div>
                    <div class="d-flex align-items-center" style="margin-top: 5px">
                        <label>Decision:</label>
                        <div class="ml-1">
                        <label>Oui</label
                        ><input type="checkbox" class="dami-check-box mr-1 undefined" />
                        </div>
                        <div>
                        <label>Non</label
                        ><input type="checkbox" class="dami-check-box mr-1 undefined" />
                        </div>
                    </div>
                    <div class="">
                        <label>Date:</label><input class="dami-input" value="" />
                    </div>
                    </div>
                    <div class="sig-item">
                    <div class="">
                        <label>Nom:</label><input class="dami-input" value="" />
                    </div>
                    <div class="">
                        <label>Prenom:</label><input class="dami-input" value="" />
                    </div>
                    <div class="d-flex align-items-center" style="margin-top: 5px">
                        <label>Decision:</label>
                        <div class="ml-1">
                        <label>Oui</label
                        ><input type="checkbox" class="dami-check-box mr-1 undefined" />
                        </div>
                        <div>
                        <label>Non</label
                        ><input type="checkbox" class="dami-check-box mr-1 undefined" />
                        </div>
                    </div>
                    <div class="">
                        <label>Date:</label><input class="dami-input" value="" />
                    </div>
                    </div>
                </div>
                </div>
        </div>
    </body>
    </html>
 `;

  // Save the HTML file
  fs.writeFileSync(tempHtmlPath, fullHtml);

  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`file://${__dirname}/${tempHtmlPath}`, {
    waitUntil: "networkidle0",
  });
  // Ensure the outputPath is a file, not a directory
  await page.pdf({ path: path.join(outputPath, "output.pdf"), format: "A3" });

  await browser.close();

  // Remove temporary HTML file
  //   fs.unlinkSync(tempHtmlPath);

  console.log("PDF successfully created:", outputPath);
}

// Example usage
const htmlContent = `<div><div data-rbd-droppable-id="droppable" data-rbd-droppable-context-id="4"><div data-rbd-draggable-context-id="4" data-rbd-draggable-id="70bfe84a-442d-4992-b2cc-98380ddfec03" tabindex="0" role="button" aria-describedby="rbd-hidden-text-4-hidden-text-20" data-rbd-drag-handle-draggable-id="70bfe84a-442d-4992-b2cc-98380ddfec03" data-rbd-drag-handle-context-id="4" draggable="false"><div class="position-relative comp-ui type-label" id="comp-ui-70bfe84a-442d-4992-b2cc-98380ddfec03"><label class="dami-label dami-label dami-label undefined block block block" id="dami-label-059bb9d8-35ac-4907-8004-296c97ddceee">Conformément à la charte de sécurité des SI de la SNRT.les mot de passes sont envoyés via un sms</label></div></div><div data-rbd-draggable-context-id="4" data-rbd-draggable-id="a44d3540-db4a-4fb0-b203-e7f6890aa505" tabindex="0" role="button" aria-describedby="rbd-hidden-text-4-hidden-text-20" data-rbd-drag-handle-draggable-id="a44d3540-db4a-4fb0-b203-e7f6890aa505" data-rbd-drag-handle-context-id="4" draggable="false"><div class="position-relative comp-ui type-label" id="comp-ui-a44d3540-db4a-4fb0-b203-e7f6890aa505"><label class="dami-label dami-label dami-label undefined block bold block block" style="font-size: 14px;" id="dami-label-aa01e818-b6aa-487e-9318-9373ccf17d07">2.Profile d'accès (Entourez ce qui correspond à votre activité // Barrez le reste)</label></div></div><div data-rbd-draggable-context-id="4" data-rbd-draggable-id="bb10c322-0d09-45f6-a96d-154559cd97da" tabindex="0" role="button" aria-describedby="rbd-hidden-text-4-hidden-text-20" data-rbd-drag-handle-draggable-id="bb10c322-0d09-45f6-a96d-154559cd97da" data-rbd-drag-handle-context-id="4" draggable="false"><div class="position-relative comp-ui type-divider" id="comp-ui-bb10c322-0d09-45f6-a96d-154559cd97da"><div class="divider"><div class="divider-child" style="border-right: medium;"></div><div class="divider-child" style="border-right: medium;"><div id="child2-025b74a4-0d92-4157-8303-d1915c31febc" class="child-type-checkboxes" style="border-right: medium;"><div class="d-flex justify-content-end btn-remove-child" style="border-right: medium;"></div><div class="child-type-checkboxes" style="border-right: medium;"><div class="d-flex align-items-center dami-check-box-container" style="border-right: medium;"><label class="dami-label mr-1 dami-label mr-1 dami-label mr-1 undefined false false false" id="dami-label-eadbabe0-3f72-42d9-a837-2ee9798a7dab"></label><div class="d-flex justify-content-center align-items-center" style="border-right: medium;"><input class="dami-check-box ml-1" type="checkbox" data-conditionid="" value="true" checked="true"><label class="dami-label ml-1 dami-label ml-1 dami-label ml-1 undefined false false false" id="dami-label-0f68be77-b4fb-46a8-89bf-63234687a8fc">ADMINISTRATEUR (réservé à DISI)</label></div></div></div></div><div id="child2-02d2fc6d-3853-4eb6-8d55-360ed9e4b327" class="child-type-checkboxes" style="border-right: medium;"><div class="d-flex justify-content-end btn-remove-child" style="border-right: medium;"></div><div class="child-type-checkboxes" style="border-right: medium;"><div class="d-flex align-items-center dami-check-box-container" style="border-right: medium;"><label class="dami-label mr-1 dami-label mr-1 dami-label mr-1 undefined false false false" id="dami-label-466b1b85-ef01-4d13-b36c-2a4cb3492294"></label><div class="d-flex justify-content-center align-items-center" style="border-right: medium;"><input class="dami-check-box ml-1" type="checkbox" data-conditionid=""><label class="dami-label ml-1 dami-label ml-1 dami-label ml-1 undefined false false false" id="dami-label-e30fb020-5ba7-4afe-a327-106be3a280ea">CONSULTATION</label></div></div></div></div><div id="child2-28e3ced4-fa76-4c67-838e-59deb33c77ec" class="child-type-checkboxes" style="border-right: medium;"><div class="d-flex justify-content-end btn-remove-child" style="border-right: medium;"></div><div class="child-type-checkboxes" style="border-right: medium;"><div class="d-flex align-items-center dami-check-box-container" style="border-right: medium;"><label class="dami-label mr-1 dami-label mr-1 dami-label mr-1 undefined false false false" id="dami-label-d71b9d28-171b-4d4c-8912-29eda1626797"></label><div class="d-flex justify-content-center align-items-center" style="border-right: medium;"><input class="dami-check-box ml-1" type="checkbox" data-conditionid=""><label class="dami-label ml-1 dami-label ml-1 dami-label ml-1 undefined false false false" id="dami-label-bea9fa86-d3d3-46c5-9fbc-ead3eb5faff3">SUPER UTILISATEUR</label></div></div></div></div><div id="child2-82d15789-e94a-467e-92f4-db9e81358335" class="child-type-checkboxes" style="border-right: medium;"><div class="d-flex justify-content-end btn-remove-child" style="border-right: medium;"></div><div class="child-type-checkboxes" style="border-right: medium;"><div class="d-flex align-items-center dami-check-box-container" style="border-right: medium;"><label class="dami-label mr-1 dami-label mr-1 dami-label mr-1 undefined false false false" id="dami-label-d5decad9-0644-40c1-a69f-a054f853b395"></label><div class="d-flex justify-content-center align-items-center" style="border-right: medium;"><input class="dami-check-box ml-1" type="checkbox" data-conditionid=""><label class="dami-label ml-1 dami-label ml-1 dami-label ml-1 undefined false false false" id="dami-label-1547aabd-8fb1-408b-87f8-1ca5ed4bea32">UTILISATEUR</label></div></div></div></div><div id="child2-efe2753a-f212-4d39-b870-00ff33519192" class="child-type-checkboxes" style="border-right: medium;"><div class="d-flex justify-content-end btn-remove-child" style="border-right: medium;"></div><div class="child-type-checkboxes" style="border-right: medium;"><div class="d-flex align-items-center dami-check-box-container" style="border-right: medium;"><label class="dami-label mr-1 dami-label mr-1 dami-label mr-1 undefined false false false" id="dami-label-4362d48d-e179-41fc-a52c-a6d7808a3117"></label><div class="d-flex justify-content-center align-items-center" style="border-right: medium;"><input class="dami-check-box ml-1" type="checkbox" data-conditionid=""><label class="dami-label ml-1 dami-label ml-1 dami-label ml-1 undefined false false false" id="dami-label-847c873f-f6ea-4402-a03b-48c2cff0d2ff">UTILISATEUR LIMITE</label></div></div></div></div></div></div></div></div></div></div>`;

const damiContentCss = path.join(
  __dirname,
  "/frontend/src/styles/damiContent.css"
);
const bootstrapCss = path.join(
  __dirname,
  "/frontend/src/styles/bootstrap.min.css"
);

const indexCss = path.join(__dirname, "/frontend/src/styles/index.css");

const outputPath = `${__dirname}/uploads`;

const cssFilePaths = [bootstrapCss, damiContentCss];

createPDF(htmlContent, cssFilePaths, outputPath)
  .then(() => console.log("Done"))
  .catch((err) => console.error("Error generating PDF:", err));
