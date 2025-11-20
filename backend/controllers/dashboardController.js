import asyncHandler from "express-async-handler";
import Utilisateur from "../models/utilisateurModel.js";
import Demande from "../models/demandeModel.js";
import Option from "../models/optionModel.js";
import Direction from "../models/directionModel.js";
import Service from "../models/serviceModel.js";




export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const userRoles = req.user.roles.map(role => role.role?.code || role.role?.libelle).filter(Boolean);
    const isAdmin = userRoles.includes('admin') || [2003003, 2003002].includes(Number(req.user.matricule));
    const isSignataire = userRoles.includes('sig') || userRoles.includes('signataire');
    const isDemandeur = userRoles.includes('dmr') || userRoles.includes('demandeur');
    const isCreateur = userRoles.includes('crt') || userRoles.includes('createur');

    let stats = {};

    if (isAdmin) {
      
      stats = {
        activeUsers: await Utilisateur.countDocuments({ isActive: true }),
        pendingRequests: await Demande.countDocuments({ 
          statut: { $in: ['en cours', 'pending'] } 
        }),
        directions: await Direction.countDocuments(),
        approvalRate: await calculateApprovalRate()
      };
    } else if (isSignataire) {
      
      stats = {
        pendingRequests: await Demande.countDocuments({ 
          statut: { $in: ['en cours', 'pending'] } 
        }),
        approvedRequests: await Demande.countDocuments({ statut: 'approuvée' }),
        rejectedRequests: await Demande.countDocuments({ statut: 'refusée' }),
        myOptions: await Option.countDocuments({ createur: userId })
      };
    } else if (isDemandeur) {
      
      stats = {
        myRequests: await Demande.countDocuments({ demandeur: userId }),
        pendingRequests: await Demande.countDocuments({ 
          demandeur: userId,
          statut: { $in: ['en cours', 'pending'] } 
        }),
        approvedRequests: await Demande.countDocuments({ 
          demandeur: userId,
          statut: 'approuvée' 
        }),
        rejectedRequests: await Demande.countDocuments({ 
          demandeur: userId,
          statut: 'refusée' 
        })
      };
    } else if (isCreateur) {
      
      stats = {
        myOptions: await Option.countDocuments({ createur: userId }),
        activeOptions: await Option.countDocuments({ 
          createur: userId,
          isActive: true 
        }),
        pendingOptions: await Option.countDocuments({ 
          createur: userId,
          isActive: false 
        }),
        totalRequests: await Demande.countDocuments({
          option: { $in: await Option.find({ createur: userId }).distinct('_id') }
        })
      };
    } else {
      
      stats = {
        pendingRequests: await Demande.countDocuments({ 
          statut: { $in: ['en cours', 'pending'] } 
        }),
        approvedRequests: await Demande.countDocuments({ statut: 'approuvée' }),
        rejectedRequests: await Demande.countDocuments({ statut: 'refusée' }),
        totalRequests: await Demande.countDocuments()
      };
    }

    res.json(stats);
  } catch (error) {
    res.status(500);
    throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
  }
});


const calculateApprovalRate = async () => {
  const totalProcessed = await Demande.countDocuments({ 
    statut: { $in: ['approuvée', 'refusée'] } 
  });
  const approved = await Demande.countDocuments({ statut: 'approuvée' });
  return totalProcessed > 0 ? Math.round((approved / totalProcessed) * 100) : 0;
};




export const getRecentRequests = asyncHandler(async (req, res) => {
  try {
    const recentRequests = await Demande.find()
      .populate('demandeur', 'nom prenom')
      .populate('option', 'libelle')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('statut createdAt demandeur option');

    const formattedRequests = recentRequests.map(request => ({
      user: request.demandeur ? `${request.demandeur.prenom} ${request.demandeur.nom}` : 'Utilisateur inconnu',
      type: request.option ? request.option.libelle : 'Type inconnu',
      date: new Date(request.createdAt).toLocaleDateString('fr-FR'),
      status: request.statut
    }));

    res.json(formattedRequests);
  } catch (error) {
    res.status(500);
    throw new Error(`Erreur lors de la récupération des demandes récentes: ${error.message}`);
  }
});




export const getChartData = asyncHandler(async (req, res) => {
  try {
    const { type } = req.params;
    let data = {};

    switch (type) {
      case 'users':
        
        const userStats = await getUsersEvolutionData();
        data = {
          labels: userStats.labels,
          datasets: [{
            label: 'Utilisateurs',
            data: userStats.data,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        };
        break;
      
      case 'demandes':
        
        const demandeStats = await getDemandesEvolutionData();
        data = {
          labels: demandeStats.labels,
          datasets: [{
            label: 'Demandes',
            data: demandeStats.data,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }]
        };
        break;

      case 'options':
        
        const optionStats = await getOptionsBySubcategoryData();
        data = {
          labels: optionStats.labels,
          datasets: [{
            label: 'Options',
            data: optionStats.data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 205, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)'
            ]
          }]
        };
        break;

      case 'services':
        
        const serviceStats = await getOptionsByServiceData();
        data = {
          labels: serviceStats.labels,
          datasets: [{
            label: 'Options par Service',
            data: serviceStats.data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 205, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)'
            ]
          }]
        };
        break;

      case 'directions':
        
        const directionStats = await getRequestsByDirectionData();
        data = {
          labels: directionStats.labels,
          datasets: [{
            label: 'Demandes par Direction',
            data: directionStats.data,
            backgroundColor: 'rgba(54, 162, 235, 0.8)'
          }]
        };
        break;

      case 'demandes-line':
        
        const onlineStats = await getOnlineRequestsData();
        data = {
          labels: onlineStats.labels,
          datasets: [{
            label: 'Demandes en Ligne',
            data: onlineStats.data,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        };
        break;
      
      default:
        data = { message: 'Type de graphique non supporté' };
    }

    res.json({ type, data });
  } catch (error) {
    res.status(500);
    throw new Error(`Erreur lors de la récupération des données du graphique: ${error.message}`);
  }
});


const getUsersEvolutionData = async () => {
  const months = [];
  const data = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
    months.push(monthName);
    
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const count = await Utilisateur.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    data.push(count);
  }
  
  return { labels: months, data };
};

const getDemandesEvolutionData = async () => {
  const months = [];
  const data = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
    months.push(monthName);
    
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const count = await Demande.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    data.push(count);
  }
  
  return { labels: months, data };
};

const getOptionsBySubcategoryData = async () => {
  const pipeline = [
    {
      $lookup: {
        from: 'souscategories',
        localField: 'sousCategorie',
        foreignField: '_id',
        as: 'sousCategorieInfo'
      }
    },
    {
      $unwind: '$sousCategorieInfo'
    },
    {
      $group: {
        _id: '$sousCategorieInfo.libelle',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 6
    }
  ];
  
  const result = await Option.aggregate(pipeline);
  return {
    labels: result.map(item => item._id),
    data: result.map(item => item.count)
  };
};

const getOptionsByServiceData = async () => {
  const pipeline = [
    {
      $lookup: {
        from: 'services',
        localField: 'service',
        foreignField: '_id',
        as: 'serviceInfo'
      }
    },
    {
      $unwind: '$serviceInfo'
    },
    {
      $group: {
        _id: '$serviceInfo.libelle',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 6
    }
  ];
  
  const result = await Option.aggregate(pipeline);
  return {
    labels: result.map(item => item._id),
    data: result.map(item => item.count)
  };
};

const getRequestsByDirectionData = async () => {
  const pipeline = [
    {
      $lookup: {
        from: 'options',
        localField: 'option',
        foreignField: '_id',
        as: 'optionInfo'
      }
    },
    {
      $unwind: '$optionInfo'
    },
    {
      $lookup: {
        from: 'services',
        localField: 'optionInfo.service',
        foreignField: '_id',
        as: 'serviceInfo'
      }
    },
    {
      $unwind: '$serviceInfo'
    },
    {
      $lookup: {
        from: 'directions',
        localField: 'serviceInfo.direction',
        foreignField: '_id',
        as: 'directionInfo'
      }
    },
    {
      $unwind: '$directionInfo'
    },
    {
      $group: {
        _id: '$directionInfo.libelle',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 6
    }
  ];
  
  const result = await Demande.aggregate(pipeline);
  return {
    labels: result.map(item => item._id),
    data: result.map(item => item.count)
  };
};

const getOnlineRequestsData = async () => {
  const months = [];
  const data = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
    months.push(monthName);
    
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const count = await Demande.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      statut: { $in: ['en cours', 'pending'] }
    });
    data.push(count);
  }
  
  return { labels: months, data };
};
