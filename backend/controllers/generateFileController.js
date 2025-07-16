import puppeteer from "puppeteer";
import asyncHandler from "express-async-handler";
import fs from "fs";
import ExcelJS from "exceljs";
import Demande from "../models/demandeModel.js";
import Utilisateur from "../models/utilisateurModel.js";
import moment from "moment";
import mongoose from "mongoose";

// @desc    Generate image from HTML
// @route   POST /api/generate/image
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

    // Get server URL from environment variables with fallback
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';

    // Set the HTML content with the base URL
    await page.setContent(`
        <html>
            <head>
                <link   
                 rel="stylesheet"
                 href="${serverUrl}/uploads/index.css">
                 <link   
                  rel="stylesheet"
                  href="${serverUrl}/uploads/damiContent.css">
                  <link   
                  rel="stylesheet"
                  href="${serverUrl}/uploads/bootstrap.min.css">
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
    const imageUrl = `${serverUrl}/${imagePath}`;
    res.json({ imageUrl });
});

// @desc    Generate Excel file with filtered demandes
// @route   POST /api/generate/excel  
// @access  private
export const generateExcel = asyncHandler(async (req, res) => {
    const { filters } = req.body;
    const user = req.user;

    try {
        // Build query based on filters
        let query = {};
        let matchStage = {};

        // Add filters to match stage
        if (filters.option) {
            matchStage["option"] = new mongoose.Types.ObjectId(filters.option);
        }
        if (filters.demandeur) {
            matchStage["demandeur"] = new mongoose.Types.ObjectId(filters.demandeur);
        }
        if (filters.status) {
            matchStage["traitement.status"] = filters.status;
        }
        if (filters.dateEnvoi) {
            const dateEnvoi = new Date(filters.dateEnvoi);
            matchStage["traitement.dateEnvoi"] = {
                $gte: new Date(dateEnvoi.getFullYear(), dateEnvoi.getMonth(), dateEnvoi.getDate()),
                $lt: new Date(dateEnvoi.getFullYear(), dateEnvoi.getMonth(), dateEnvoi.getDate() + 1)
            };
        }
        if (filters.dateDemande) {
            const dateDemande = new Date(filters.dateDemande);
            matchStage["dateDemande"] = {
                $gte: new Date(dateDemande.getFullYear(), dateDemande.getMonth(), dateDemande.getDate()),
                $lt: new Date(dateDemande.getFullYear(), dateDemande.getMonth(), dateDemande.getDate() + 1)
            };
        }

        // First, get all traitements with the basic filtering and then filter by service
        const allTraitements = await Demande.aggregate([
            { $unwind: "$traitement" },
            { $match: matchStage },
            {
                $lookup: {
                    from: "utilisateurs",
                    localField: "demandeur",
                    foreignField: "_id",
                    as: "demandeurInfo"
                }
            },
            {
                $lookup: {
                    from: "options",
                    localField: "option",
                    foreignField: "_id",
                    as: "optionInfo"
                }
            },
            {
                $lookup: {
                    from: "utilisateurs",
                    localField: "traitement.utilisateur",
                    foreignField: "_id",
                    as: "signataire"
                }
            },
            {
                $lookup: {
                    from: "services",
                    localField: "signataire.service",
                    foreignField: "_id",
                    as: "serviceSignataire"
                }
            },
            {
                $project: {
                    idDemande: "$_id",
                    idTraitement: "$traitement._id",
                    demandeur: {
                        $concat: [
                            { $arrayElemAt: ["$demandeurInfo.prenom", 0] },
                            " ",
                            { $arrayElemAt: ["$demandeurInfo.nom", 0] }
                        ]
                    },
                    option: { $arrayElemAt: ["$optionInfo.libelle", 0] },
                    dateDemande: 1,
                    dateEnvoi: "$traitement.dateEnvoi",
                    status: "$traitement.status",
                    motifRefus: "$traitement.motifRefus",
                    serviceSignataireLibelle: { $arrayElemAt: ["$serviceSignataire.libelle", 0] }
                }
            },
            { $sort: { dateDemande: -1 } }
        ]);

        // Get user's service information and populate it
        const userWithService = await Utilisateur.findById(user._id).populate('service');
        const userServiceLibelle = userWithService.service ? userWithService.service.libelle : null;
        
        console.log('User service:', userServiceLibelle);
        
        // Filter and group to get only one line per demande for the user's service
        const demandesMap = new Map();
        
        allTraitements.forEach(traitement => {
            const serviceLibelle = traitement.serviceSignataireLibelle;
            
            if (serviceLibelle && userServiceLibelle) {
                const serviceUpper = serviceLibelle.toUpperCase();
                const userServiceUpper = userServiceLibelle.toUpperCase();
                
                // Only include treatments that match the user's service exactly
                if (serviceUpper.includes(userServiceUpper) || userServiceUpper.includes(serviceUpper)) {
                    if (!demandesMap.has(traitement.idDemande.toString())) {
                        demandesMap.set(traitement.idDemande.toString(), traitement);
                    }
                }
            }
        });

        const traitements = Array.from(demandesMap.values());

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Demandes Filtrées');

        // Define columns
        worksheet.columns = [
            { header: 'ID Demande', key: 'idDemande', width: 15 },
            { header: 'ID Traitement', key: 'idTraitement', width: 15 },
            { header: 'Demandeur', key: 'demandeur', width: 30 },
            { header: 'Option', key: 'option', width: 30 },
            { header: 'Date Demande', key: 'dateDemande', width: 20 },
            { header: 'Date Envoi', key: 'dateEnvoi', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Motif de Refus', key: 'motifRefus', width: 40 },
            { header: 'Service', key: 'service', width: 50 }
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Add data rows
        traitements.forEach((traitement) => {
            worksheet.addRow({
                idDemande: traitement.idDemande.toString(),
                idTraitement: traitement.idTraitement.toString(),
                demandeur: traitement.demandeur || 'N/A',
                option: traitement.option ? String(traitement.option).toLowerCase() : 'N/A',
                dateDemande: moment(traitement.dateDemande).format('DD-MM-YYYY, h:mm'),
                dateEnvoi: moment(traitement.dateEnvoi).format('DD-MM-YYYY, h:mm'),
                status: traitement.status,
                motifRefus: traitement.motifRefus || 'N/A',
                service: traitement.serviceSignataireLibelle || 'N/A'
            });
        });

        // Auto-fit columns
        worksheet.columns.forEach(column => {
            column.width = Math.max(column.width, 10);
        });

        // Generate Excel buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Set response headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=demandes_filtered_${moment().format('YYYY-MM-DD')}.xlsx`);
        
        // Send the file
        res.send(buffer);

    } catch (error) {
        console.error('Erreur génération Excel:', error);
        res.status(500);
        throw new Error('Erreur lors de la génération du fichier Excel');
    }
});