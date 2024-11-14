import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import Utilisateur from "../models/utilisateurModel.js";
import Demande from "../models/demandeModel.js";
import Option from "../models/optionModel.js";
import Service from "../models/serviceModel.js";
import Departement from "../models/departementModel.js";
import Direction from "../models/directionModel.js";
import connectDB from "../config/database.js";

connectDB();

const signatairesLib = {
  cds: "Approbation Chef de Service",
  cdd: "Approbation Chef de Departement",
  hiq: "Approbation Directeur Hiearchique",
  atr: "Approbation de ",
  pdd: "Approbation Proprietaire de donnees",
  dir: `Approbation Directeur de la `,
  dg: "Approbation directeur generale",
  pdg: "Approbation President-directeur generale",
};

// Define the uploads as static folder :
const __dirname = path.resolve();

// Function to generate PDF from HTML and CSS file
async function createPDF(htmlContent, cssFilePaths, outputPath) {
  const demande = await Demande.findOne({
    _id: "67239d46d06ea8d7a76e765c",
  })
    .populate({
      path: "option",
      populate: {
        path: "service",
        populate: [
          {
            path: "departement",
          },
          {
            path: "direction",
          },
        ],
      },
    })

    .populate("traitement.utilisateur")
    .populate({
      path: "demandeur",
      populate: [
        { path: "departement" },
        { path: "service" },
        { path: "direction" },
      ],
    });

  console.log(demande);
  // Read the CSS content from the file
  let cssContent = "";

  for (let cssFilepath of cssFilePaths) {
    cssContent += fs.readFileSync(cssFilepath, "utf8");
  }

  let sigHtml = "";
  for (let sig of demande.option.signataires) {
    let name = "";
    if (sig === "dir")
      name = String(demande.option.service.direction.libelle).toLowerCase();
    if (sig === "atr")
      name = String(demande.option.autreResponsableTitre).toLowerCase();

    sigHtml += `<div class='directeur-lib'><span>${signatairesLib[sig]} ${name}</span></div>`;
  }

  let trSig = "";

  for (let tr of demande.traitement) {
    const splittr = tr.code.split(".");
    if (splittr.length > 1) {
      for (let sptr of splittr) {
        trSig += `
        <div class="sig-item">
                       <div class="">
                           <label>Nom:</label><input class="dami-input" value="${String(
                             tr.utilisateur.nom
                           ).toLowerCase()}" />
                       </div>
                       <div class="">
                           <label>Prenom:</label><input class="dami-input" value="${String(
                             tr.utilisateur.prenom
                           ).toLowerCase()}" />
                       </div>
                       <div class="d-flex align-items-center" style="margin-top: 5px">
                           <label>Decision:</label>
                           <div class="ml-1">
                           <label>Oui</label
                           ><input
                               type="checkbox"
                               class="dami-check-box mr-1 undefined checked"
                           />
                           </div>
                           <div>
                           <label>Non</label
                           ><input type="checkbox" class="dami-check-box mr-1 undefined" />
                           </div>
                       </div>
                       <div class="">
                           <label>Date:</label><input class="dami-input" value="${new Date(
                             tr.dateTraitement
                           ).toLocaleDateString()}" />
                       </div>
               </div>
       `;
      }
    } else {
      trSig += `
     <div class="sig-item">
                    <div class="">
                        <label>Nom:</label><input class="dami-input" value="${String(
                          tr.utilisateur.nom
                        ).toLowerCase()}" />
                    </div>
                    <div class="">
                        <label>Prenom:</label><input class="dami-input" value="${String(
                          tr.utilisateur.prenom
                        ).toLowerCase()}" />
                    </div>
                    <div class="d-flex align-items-center" style="margin-top: 5px">
                        <label>Decision:</label>
                        <div class="ml-1">
                        <label>Oui</label
                        ><input
                            type="checkbox"
                            class="dami-check-box mr-1 undefined checked"
                        />
                        </div>
                        <div>
                        <label>Non</label
                        ><input type="checkbox" class="dami-check-box mr-1 undefined" />
                        </div>
                    </div>
                    <div class="">
                        <label>Date:</label><input class="dami-input" value="${new Date(
                          tr.dateTraitement
                        ).toLocaleDateString()}" />
                    </div>
            </div>
    `;
    }
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
        body{font-size:10px !important}
        .dami-body {min-height:960px}
      </style>
    </head>
    <body class="">
    <div class="dami">
        <div class="dami-header">
        <div class="dami-snrt-logo">
            <img alt="dami-logo" src="${path.join(
              __dirname,
              "/frontend/public/images/logo.png"
            )}" class="dami-logo" />
        </div>
        <div class="dami-lb-tp">
            <span class="d-block dami-type-de-processus">${String(
              demande.option.typeProcessus
            ).toUpperCase()}</span>
            <span class="d-block dami-libelle">
                ${String(demande.option.libelle).toUpperCase()}
            </span>
        </div>
        <div class="dami-codification">
            <table class="dami-codification-table">
            <tr>
                <td>document</td>
                <td>
                <span class="dami-header-codi-item dami-header-document">
                    ${demande.option.header.document}
                </span>
                </td>
            </tr>
            <tr>
                <td>classification</td>
                <td>
                <span class="dami-header-codi-item dami-header-classification">
                     ${demande.option.header.classification}
                </span>
                </td>
            </tr>
            <tr>
                <td>creation</td>
                <td>
                <span class="dami-header-codi-item dami-header-creation">
                     ${new Date(
                       demande.option.header.creation
                     ).toLocaleDateString()}
                </span>
                </td>
            </tr>
            <tr>
                <td>maj</td>
                <td>
                <span class="dami-header-codi-item dami-header-maj">
                     ${new Date(demande.option.header.maj).toLocaleDateString()}
                </span>
                </td>
            </tr>
            </table>
        </div>
        </div>
        <div class="demandeur-section">
        <table>
            <tr>
            <td><label>Date demande:</label></td>
            <td><input class="dami-input" value="${new Date(
              demande.dateDemande
            ).toLocaleDateString()}" /></td>
            <td><label>Departement</label></td>
            <td><input class="dami-input w-100" value="${String(
              demande.demandeur.departement.libelle
            ).toLowerCase()}" /></td>
            </tr>
            <tr>
            <td><label>Nom:</label></td>
            <td><input class="dami-input" value="${String(
              demande.demandeur.nom
            ).toLowerCase()}" /></td>
            <td><label>Prenom</label></td>
            <td><input class="dami-input w-100" value="${String(
              demande.demandeur.prenom
            ).toLowerCase()}" /></td>
            </tr>
            <tr>
            <td><label>Matricule:</label></td>
            <td><input class="dami-input" value="${
              demande.demandeur.matricule
            }" /></td>
            <td><label>Service</label></td>
            <td>
                <input
                class="dami-input w-100"
                value="${String(
                  demande.demandeur.service.libelle
                ).toLowerCase()}"
                />
            </td>
            </tr>
            <tr>
            <td><label>Email:</label></td>
            <td><input class="dami-input" value="${String(
              demande.demandeur.email
            ).toLowerCase()}" /></td>
            <td><label>Gsm</label></td>
            <td><input class="dami-input w-100" value="${
              demande.demandeur.gsm
            }" /></td>
            </tr>
            <tr>
            <td><label>Direction</label></td>
            <td>
                <input
                class="dami-input w-100"
                value="${String(
                  demande.demandeur.direction.libelle
                ).toLowerCase()}"
                />
            </td>
            </tr>
        </table>
        </div>
        <div class="dami-body p-2">
            ${demande.contenu}
        </div>
        <div class="dami-footer">
        <div class="signataires">
            ${sigHtml}
        </div>
        <div class="signataires-ch">
           ${trSig}
           
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
const htmlContent = ``;

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
