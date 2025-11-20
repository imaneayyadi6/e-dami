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
  fr: {
    cds: "Approbation Chef de Service",
    cdd: "Approbation Chef de Departement",
    hiq: "Approbation Directeur Hiearchique",
    atr: "Approbation de ",
    pdd: "Approbation Proprietaire de donnees",
    dir: "Approbation Directeur de la ",
    dg: "Approbation directeur generale",
    pdg: "Approbation President-directeur generale",
  },
  ar: {
    cds: "موافقة رئيس الخدمة",
    cdd: "موافقة رئيس القسم",
    hiq: "موافقة المدير الهرمي",
    atr: "موافقة ",
    pdd: "موافقة مالك البيانات",
    dir: "موافقة مدير ",
    dg: "موافقة المدير العام",
    pdg: "موافقة الرئيس المدير العام",
  }
};

const translations = {
  fr: {
    document: "document",
    classification: "classification",
    creation: "creation",
    maj: "maj",
    requestDate: "Date demande:",
    department: "Departement",
    name: "Nom:",
    firstName: "Prenom",
    matricule: "Matricule:",
    service: "Service",
    email: "Email:",
    gsm: "Gsm",
    direction: "Direction",
    decision: "Decision:",
    yes: "Oui",
    no: "Non",
    date: "Date:",
    interim: "interim"
  },
  ar: {
    document: "وثيقة",
    classification: "تصنيف",
    creation: "إنشاء",
    maj: "تحديث",
    requestDate: "تاريخ الطلب:",
    department: "قسم",
    name: "الاسم:",
    firstName: "الاسم الأول",
    matricule: "رقم التسجيل:",
    service: "خدمة",
    email: "البريد الإلكتروني:",
    gsm: "الهاتف المحمول",
    direction: "إدارة",
    decision: "قرار:",
    yes: "نعم",
    no: "لا",
    date: "تاريخ:",
    interim: "مؤقت"
  }
};


const __dirname = path.resolve();


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

  
  fs.writeFileSync(tempHtmlPath, fullHtml);

  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`file://${__dirname}/${tempHtmlPath}`, {
    waitUntil: "networkidle0",
  });
  
  await page.pdf({ path: path.join(outputPath, "output.pdf"), format: "A3" });

  await browser.close();

  
  

  console.log("PDF successfully created:", outputPath);
}


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


export async function createPDFFromDemande(demande, language = 'fr') {
  try {
    const __dirname = path.resolve();
    
    
    const currentTranslations = translations[language] || translations.fr;
    const currentSignatairesLib = signatairesLib[language] || signatairesLib.fr;
    const isRTL = language === 'ar';
    
    
    const damiContentCss = path.join(__dirname, "/frontend/src/styles/damiContent.css");
    const bootstrapCss = path.join(__dirname, "/frontend/src/styles/bootstrap.min.css");
    
    let cssContent = "";
    try {
      cssContent += fs.readFileSync(bootstrapCss, "utf8");
      cssContent += fs.readFileSync(damiContentCss, "utf8");
    } catch (cssError) {
      console.log("CSS files not found, using basic styles");
      cssContent = `
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin-bottom: 15px; }
        .label { font-weight: bold; }
        .value { margin-left: 10px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
      `;
    }

    
    let sigHtml = "";
    if (demande.option && demande.option.signataires) {
      for (let sig of demande.option.signataires) {
        let name = "";
        if (sig === "dir" && demande.option.service && demande.option.service.direction) {
          name = String(demande.option.service.direction.libelle).toLowerCase();
        }
        if (sig === "atr" && demande.option.autreResponsableTitre) {
          name = String(demande.option.autreResponsableTitre).toLowerCase();
        }
        sigHtml += `<div class='directeur-lib'><span>${currentSignatairesLib[sig] || sig} ${name}</span></div>`;
      }
    }

    
    let trSig = "";
    if (demande.traitement && demande.traitement.length > 0) {
      for (let tr of demande.traitement) {
        if (tr.utilisateur) {
          const splittr = tr.code ? tr.code.split(".") : [];
          if (splittr.length > 1) {
            for (let sptr of splittr) {
              trSig += `
              <div class="sig-item">
                <div class="">
                  <label>${currentTranslations.name}</label><input class="dami-input" value="${String(tr.utilisateur.nom || '').toLowerCase()}" style="text-align: ${isRTL ? 'right' : 'left'}" />
                </div>
                <div class="">
                  <label>${currentTranslations.firstName}</label><input class="dami-input" value="${String(tr.utilisateur.prenom || '').toLowerCase()}" style="text-align: ${isRTL ? 'right' : 'left'}" />
                </div>
                <div class="d-flex align-items-center" style="margin-top: 5px">
                  <label>${currentTranslations.decision}</label>
                  <div class="ml-1">
                    <label>${currentTranslations.yes}</label><input type="checkbox" class="dami-check-box mr-1 ${tr.status === 'approuve' ? 'checked' : ''}" />
                  </div>
                  <div>
                    <label>${currentTranslations.no}</label><input type="checkbox" class="dami-check-box mr-1 ${tr.status === 'refuse' ? 'checked' : ''}" />
                  </div>
                </div>
                <div class="">
                  <label>${currentTranslations.date}</label><input class="dami-input" value="${tr.dateTraitement ? new Date(tr.dateTraitement).toLocaleDateString() : 'N/A'}" style="text-align: ${isRTL ? 'right' : 'left'}" />
                </div>
              </div>
              `;
            }
          } else {
            trSig += `
            <div class="sig-item">
              <div class="">
                <label>${currentTranslations.name}</label><input class="dami-input" value="${String(tr.utilisateur.nom || '').toLowerCase()}" style="text-align: ${isRTL ? 'right' : 'left'}" />
              </div>
              <div class="">
                <label>${currentTranslations.firstName}</label><input class="dami-input" value="${String(tr.utilisateur.prenom || '').toLowerCase()}" style="text-align: ${isRTL ? 'right' : 'left'}" />
              </div>
              <div class="d-flex align-items-center" style="margin-top: 5px">
                <label>${currentTranslations.decision}</label>
                <div class="ml-1">
                  <label>${currentTranslations.yes}</label><input type="checkbox" class="dami-check-box mr-1 ${tr.status === 'approuve' ? 'checked' : ''}" />
                </div>
                <div>
                  <label>${currentTranslations.no}</label><input type="checkbox" class="dami-check-box mr-1 ${tr.status === 'refuse' ? 'checked' : ''}" />
                </div>
              </div>
              <div class="">
                <label>${currentTranslations.date}</label><input class="dami-input" value="${tr.dateTraitement ? new Date(tr.dateTraitement).toLocaleDateString() : 'N/A'}" style="text-align: ${isRTL ? 'right' : 'left'}" />
              </div>
            </div>
            `;
          }
        }
      }
    }

    
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="utf-8">
        <title>Demande - ${demande.option?.libelle || 'DAMI'}</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
        <style>
          ${cssContent}
          body { 
            font-size: 10px !important; 
            font-family: ${isRTL ? 'Arial, Tahoma, sans-serif' : 'Arial, sans-serif'};
            direction: ${isRTL ? 'rtl' : 'ltr'};
          }
          .dami-body { min-height: 960px; }
          .dami-input { 
            border: 1px solid #ccc; 
            padding: 2px 5px; 
            margin: 2px; 
            text-align: ${isRTL ? 'right' : 'left'};
          }
          .dami-check-box { margin: 2px; }
          .sig-item { margin: 10px 0; padding: 5px; border: 1px solid #ddd; }
          .directeur-lib { margin: 5px 0; font-weight: bold; }
          .dami-codification-table td:first-child { text-align: ${isRTL ? 'right' : 'left'}; }
          .demandeur-section td:first-child { text-align: ${isRTL ? 'right' : 'left'}; }
        </style>
      </head>
      <body>
        <div class="dami">
          <div class="dami-header">
            <div class="dami-snrt-logo">
              <img alt="dami-logo" src="${path.join(__dirname, "/frontend/public/images/logo.png")}" class="dami-logo" />
            </div>
            <div class="dami-lb-tp">
              <span class="d-block dami-type-de-processus">${String(demande.option?.typeProcessus || '').toUpperCase()}</span>
              <span class="d-block dami-libelle">${String(demande.option?.libelle || '').toUpperCase()}</span>
            </div>
            <div class="dami-codification">
              <table class="dami-codification-table">
                <tr>
                  <td>${currentTranslations.document}</td>
                  <td><span class="dami-header-codi-item dami-header-document">${demande.option?.header?.document || 'N/A'}</span></td>
                </tr>
                <tr>
                  <td>${currentTranslations.classification}</td>
                  <td><span class="dami-header-codi-item dami-header-classification">${demande.option?.header?.classification || 'N/A'}</span></td>
                </tr>
                <tr>
                  <td>${currentTranslations.creation}</td>
                  <td><span class="dami-header-codi-item dami-header-creation">${demande.option?.header?.creation ? new Date(demande.option.header.creation).toLocaleDateString() : 'N/A'}</span></td>
                </tr>
                <tr>
                  <td>${currentTranslations.maj}</td>
                  <td><span class="dami-header-codi-item dami-header-maj">${demande.option?.header?.maj ? new Date(demande.option.header.maj).toLocaleDateString() : 'N/A'}</span></td>
                </tr>
              </table>
            </div>
          </div>
          
          <div class="demandeur-section">
            <table>
              <tr>
                <td><label>${currentTranslations.requestDate}</label></td>
                <td><input class="dami-input" value="${new Date(demande.dateDemande).toLocaleDateString()}" /></td>
                <td><label>${currentTranslations.department}</label></td>
                <td><input class="dami-input w-100" value="${String(demande.demandeur?.departement?.libelle || '').toLowerCase()}" /></td>
              </tr>
              <tr>
                <td><label>${currentTranslations.name}</label></td>
                <td><input class="dami-input" value="${String(demande.demandeur?.nom || '').toLowerCase()}" /></td>
                <td><label>${currentTranslations.firstName}</label></td>
                <td><input class="dami-input w-100" value="${String(demande.demandeur?.prenom || '').toLowerCase()}" /></td>
              </tr>
              <tr>
                <td><label>${currentTranslations.matricule}</label></td>
                <td><input class="dami-input" value="${demande.demandeur?.matricule || 'N/A'}" /></td>
                <td><label>${currentTranslations.service}</label></td>
                <td><input class="dami-input w-100" value="${String(demande.demandeur?.service?.libelle || '').toLowerCase()}" /></td>
              </tr>
              <tr>
                <td><label>${currentTranslations.email}</label></td>
                <td><input class="dami-input" value="${String(demande.demandeur?.email || '').toLowerCase()}" /></td>
                <td><label>${currentTranslations.gsm}</label></td>
                <td><input class="dami-input w-100" value="${demande.demandeur?.gsm || 'N/A'}" /></td>
              </tr>
              <tr>
                <td><label>${currentTranslations.direction}</label></td>
                <td><input class="dami-input w-100" value="${String(demande.demandeur?.direction?.libelle || '').toLowerCase()}" /></td>
              </tr>
            </table>
          </div>
          
          <div class="dami-body p-2">
            ${demande.contenu || 'Aucun contenu disponible'}
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

    
    const tempHtmlPath = path.join(__dirname, 'temp_demande.html');
    fs.writeFileSync(tempHtmlPath, htmlContent);

    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`file://${tempHtmlPath}`, {
      waitUntil: "networkidle0",
    });
    
    
    const pdfBuffer = await page.pdf({ 
      format: "A3",
      printBackground: true,
      margin: {
        top: '10px',
        right: '10px',
        bottom: '10px',
        left: '10px'
      }
    });

    await browser.close();

    
    try {
      fs.unlinkSync(tempHtmlPath);
    } catch (unlinkError) {
      console.log("Could not remove temp file:", unlinkError.message);
    }

    return pdfBuffer;
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}


createPDF(htmlContent, cssFilePaths, outputPath)
  .then(() => console.log("Done"))
  .catch((err) => console.error("Error generating PDF:", err));
