import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import Utilisateur from "../models/utilisateurModel.js";
import Direction from "../models/directionModel.js";
import Service from "../models/serviceModel.js";
import Departement from "../models/departementModel.js";
import Role from "../models/roleModel.js";
import jwt from "jsonwebtoken";
import { sendNotification } from "../services/notificationService.js";
import JwtBlackList from "../models/jwtBlackList.js";




export const authUser = asyncHandler(async (req, res) => {
  const { email, matricule, password } = req.body;
  const isNumeric = (value) => !isNaN(parseFloat(value)) && isFinite(value);

  let query;
  if (matricule) {
    query = { matricule: parseInt(matricule) };
  } else if (email) {
    const lowercaseEmail = String(email).toLocaleLowerCase();
    query = { email: { $regex: new RegExp(`^${lowercaseEmail}$`, "i") } };
  } else {
    res.status(400);
    throw new Error("email ou matricule requis !");
  }

  const utilisateur = await Utilisateur.findOne(query)
    .populate("roles.role")
    .populate("direction")
    .populate("service")
    .populate("departement");

  if (utilisateur) {
    if (await bcrypt.compare(password, utilisateur.password)) {
      
      const cleanRoles = utilisateur.roles.filter(role => 
        role && role.role && role.role.code && role.role.code.trim() !== ""
      );
      
      
      let isAdmin = false;
      if ([2003003, 2003002].includes(utilisateur.matricule)) {
        isAdmin = true;
      } else {
        for (let role of cleanRoles) {
          let findRole = await Role.findById(role.role);
          if (findRole && (findRole.code === "crt" || findRole.code === "admin")) {
            isAdmin = true;
            break;
          }
        }
      }
      if (isAdmin) {
        if (utilisateur.isActive) {
          
          let adminRoles = cleanRoles;
          if ([2003003, 2003002].includes(utilisateur.matricule)) {
            
            const adminRole = await Role.findOne({ code: 'admin' });
            if (adminRole) {
              adminRoles = [{
                role: {
                  _id: adminRole._id,
                  code: adminRole.code,
                  libelle: adminRole.libelle
                }
              }];
            }
          }
          
          res.status(200).json({
            id: utilisateur._id,
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
            email: utilisateur.email,
            gsm: utilisateur.gsm,
            firstTimeLogin: utilisateur.firstTimeLogin,
            fonction: utilisateur.fonction,
            matricule: utilisateur.matricule,
            service: utilisateur.service,
            direction: utilisateur.direction,
            departement: utilisateur.departement,
            roles: adminRoles,
            token: generateToken(utilisateur._id),
            isChefDeService:utilisateur.isChefDeService,
            isChefDeDepartement:utilisateur.isChefDeDepartement,
            isDirecteurAdj:utilisateur.isDirecteurAdj,
            isDirecteur:utilisateur.isDirecteur,

          });
        } else {
          res.status(400);
          throw new Error("votre compte est inactif");
        }
      } else {
        if (!utilisateur.firstTimeLogin) {
          if (utilisateur.isActive) {
            res.status(200).json({
              id: utilisateur._id,
              nom: utilisateur.nom,
              prenom: utilisateur.prenom,
              email: utilisateur.email,
              gsm: utilisateur.gsm,
              firstTimeLogin: utilisateur.firstTimeLogin,
              fonction: utilisateur.fonction,
              matricule: utilisateur.matricule,
              service: utilisateur.service,
              direction: utilisateur.direction,
              departement: utilisateur.departement,
              roles: cleanRoles,
              token: generateToken(utilisateur._id),
              isChefDeService:utilisateur.isChefDeService,
              isChefDeDepartement:utilisateur.isChefDeDepartement,
              isDirecteurAdj:utilisateur.isDirecteurAdj,
              isDirecteur:utilisateur.isDirecteur,
            });
          } else {
            res.status(400);
            throw new Error("votre compte est inactif");
          }
        } else {
          
          if (utilisateur.isActive) {
            res.status(200).json({
              id: utilisateur._id,
              nom: utilisateur.nom,
              prenom: utilisateur.prenom,
              email: utilisateur.email,
              gsm: utilisateur.gsm,
              firstTimeLogin: utilisateur.firstTimeLogin,
              fonction: utilisateur.fonction,
              matricule: utilisateur.matricule,
              service: utilisateur.service,
              direction: utilisateur.direction,
              departement: utilisateur.departement,
              roles: cleanRoles,
              token: generateToken(utilisateur._id),
              isChefDeService:utilisateur.isChefDeService,
              isChefDeDepartement:utilisateur.isChefDeDepartement,
              isDirecteurAdj:utilisateur.isDirecteurAdj,
              isDirecteur:utilisateur.isDirecteur,
            });
          } else {
            res.status(400);
            throw new Error("votre compte est inactif");
          }
        }
      }
    } else {
      res.status(404);
      throw new Error("mot de passe invalide !");
    }
  } else {
    res.status(404);
    throw new Error("email ou matricule invalide !");
  }
});




export const validateTokenUser = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const decoded = jwt.verify(String(token).trim(), process.env.JWT_SECRET);

  const utilisateur = await Utilisateur.findById(decoded.id);
  if (utilisateur) {
    const jwt = await JwtBlackList.findOne({ token });
    if (jwt) {
      res.status(401);
      throw new Error("Non autorisé, token black list !");
    }
    res.json({ message: "done !" });
  } else {
    res.status(401);
    throw new Error("Non autorisé, utilisateur introuvable !");
  }
});




export const registerUser = asyncHandler(async (req, res) => {
  const { matricule } = req.body;

  const utilisateur = await Utilisateur.findOne({
    matricule,
  });
  if (utilisateur) {
    if (utilisateur.firstTimeLogin) {
      
      const jwt_secret = process.env.JWT_SECRET;
      let jwttoken = jwt.sign({ id: matricule }, jwt_secret, {
        expiresIn: 300,
      });
      let contenu = `Votre compte est validé. Veuillez accéder à ce <b><a href="${process.env.CLIENT_ADDRESS}/setmdp/${jwttoken}">lien</a> </b> pour saisir votre mot de passe`;
      sendNotification(
        utilisateur._id,
        contenu,
        `Recuperation de votre compte`,
        true
      );
      utilisateur.emailSent = true;
      await utilisateur.save();
      res.json({ email: utilisateur.email.toLocaleLowerCase() });
      
      
      
      
    } else {
      res.status(404);
      throw new Error("vous avez déjà récupéré votre compte");
    }
  } else {
    res.status(404);
    throw new Error("utilisateur introuvable !");
  }
});




export const setPasswordUser = asyncHandler(async (req, res) => {
  const { password, token } = req.body;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const utilisateur = await Utilisateur.findOne({
    matricule: Number(decoded.id),
  });
  if (utilisateur) {
    utilisateur.password = password;
    utilisateur.firstTimeLogin = false;

    await utilisateur.save();
    await new JwtBlackList({
      token,
    }).save();

    res.json({ message: "done !" });
  } else {
    res.status(401);
    throw new Error("Non autorisé, utilisateur introuvable !");
  }
});




export const changePasswordUser = asyncHandler(async (req, res) => {
  const { matricule } = req.body;
  const utilisateur = await Utilisateur.findOne({
    matricule,
  });
  if (utilisateur) {
    if (!utilisateur.firstTimeLogin) {
      const jwt_secret = process.env.JWT_SECRET;
      let jwttoken = jwt.sign({ id: matricule }, jwt_secret, {
        expiresIn: 300,
      });
      let contenu = `Veuillez accéder à ce <b><a href="${process.env.CLIENT_ADDRESS}/setmdp/${jwttoken}">lien</a> </b> pour définir un nouveau mot de passe.`;
      sendNotification(utilisateur._id, contenu, `Mot de passe oublié`, true);
      res.json({ email: utilisateur.email.toLocaleLowerCase() });
    } else {
      res.status(404);
      throw new Error("Il faut d'abord récupérer votre compte !");
    }
  } else {
    res.status(404);
    throw new Error("utilisateur introuvable !");
  }
});




export const setNewPasswordUser = asyncHandler(async (req, res) => {
  const { password, token } = req.body;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const utilisateur = await Utilisateur.findOne({
    matricule: Number(decoded.id),
  });
  if (utilisateur) {
    utilisateur.password = password;

    await utilisateur.save();
    await new JwtBlackList({
      token,
    }).save();

    res.json({ message: "done !" });
  } else {
    res.status(401);
    throw new Error("Non autorisé, utilisateur introuvable !");
  }
});




export const createUser = asyncHandler(async (req, res) => {
  const {
    nom,
    prenom,
    fonction,
    email,
    password,
    matricule,
    gsm,
    roles,
    service: serviceID,
    direction: directionID,
    departement: departementID,
    interim: interimID,
    isChefDeService,
    isDirecteur,
  } = req.body;

  const utilisateur = await Utilisateur.findOne({
    $or: [
      { email: String(email).toLocaleLowerCase() },
      { matricule: matricule },
    ],
  });
  if (!utilisateur) {
    let direction = await Direction.findById(directionID);

    if (direction) {
      if (isDirecteur && direction.directeur) {
        res.status(400);
        throw new Error("directeur existe deja !");
      } else {
        let obj = {
          nom,
          prenom,
          fonction,
          email,
          password,
          matricule,
          gsm,
          isChefDeService,
          isDirecteur,
          direction: direction._id,
        };

        let service = null;
        let departement = null;
        let interim = null;
        
        if (departementID) {
          departement = await Departement.findById(departementID);
          if (departement) {
            obj.departement = departement._id;
          } else {
            res.status(404);
            throw new Error("departement introuvable !");
          }
        }
        
        if (interimID) {
          interim = await Utilisateur.findById(interimID);
          if (interim) {
            obj.interim = interim._id;
          } else {
            res.status(404);
            throw new Error("utilisateur interim introuvable !");
          }
        }
        
        if (serviceID) {
          service = await Service.findById(serviceID);
          if (service) {
            if (isChefDeService && service.chefService) {
              res.status(400);
              throw new Error("chef de service existe deja !");
            } else {
              obj.service = service._id;
            }
          } else {
            res.status(404);
            throw new Error("service introuvable !");
          }
        }

        let nroles = [];
        if (roles && roles.length > 0) {
          for (const role of roles) {
            const recovredRole = await Role.findOne({ code: String(role) });
            if (!recovredRole) {
              res.status(404);
              throw new Error("role introuvable !");
            } else {
              nroles.push({ role: recovredRole._id });
            }
          }
          obj.roles = nroles;
        } else {
          res.status(400);
          throw new Error("Attribuez des rôles à cet utilisateur !");
        }

        const user = new Utilisateur(obj);
        const createdUser = await user.save();

        if (service && isChefDeService && !service.chefService) {
          service.chefService = createdUser._id;
          await service.save();
        }

        if (direction && isDirecteur && !direction.directeur) {
          direction.directeur = createdUser._id;
          await direction.save();
        }
        res.status(201).json(createdUser);
      }
    } else {
      res.status(404);
      throw new Error("direction introuvable");
    }
  } else {
    res.status(400);
    throw new Error("utilisateur existe deja !");
  }
});




export const getUsers = asyncHandler(async (req, res) => {
  const users = await Utilisateur.find()
    .sort({ createdAt: -1 })
    .populate("roles.role")
    .populate("direction")
    .populate("service")
    .populate("departement")
    .populate("interim")
    .select("-password");
  res.json(users);
});




export const getUserByID = asyncHandler(async (req, res) => {
  const user = await Utilisateur.findById(req.params.id)
    .populate("roles.role")
    .populate("direction")
    .populate("service")
    .populate("departement")
    .populate("interim")
    .select("-password");
  if (user) res.json(user);
  else {
    res.status(404);
    throw new Error("utilisateur introuvable !");
  }
});




export const getDirecteurs = asyncHandler(async (req, res) => {
  const utilisateurs = await Utilisateur.find()
    .populate("roles.role")
    .sort({ createdAt: -1 })
    .select("-password");

  let filteredUtilisateurs = utilisateurs.filter((utilisateur) => {
    return (
      utilisateur.roles.some((role) => role.role.code === "sig") &&
      utilisateur.isDirecteur
    );
  });

  res.json(filteredUtilisateurs);
});




export const getChefServices = asyncHandler(async (req, res) => {
  const utilisateurs = await Utilisateur.find()
    .populate("roles.role")
    .sort({ createdAt: -1 })
    .select("-password");

  let filteredUtilisateurs = utilisateurs.filter((utilisateur) => {
    return (
      utilisateur.roles.some((role) => role.role.code === "sig") &&
      utilisateur.isChefDeService
    );
  });
  res.json(filteredUtilisateurs);
});




export const updateUserInfo = asyncHandler(async (req, res) => {
  const {
    nom,
    prenom,
    fonction,
    email,
    matricule,
    gsm,
    roles,
    direction: directionID,
    departement: departementID,
    service: serviceID,
    interim: interimID,
    isChefDeService,
    isDirecteur,
  } = req.body;

  let utilisateur = await Utilisateur.findById(req.params.id);

  if (utilisateur) {
    utilisateur.nom = nom || utilisateur.nom;
    utilisateur.prenom = prenom || utilisateur.prenom;
    utilisateur.fonction = fonction || utilisateur.fonction;
    utilisateur.gsm = gsm || utilisateur.gsm;

    if (isChefDeService) {
      utilisateur.isChefDeService = isChefDeService;
      utilisateur.isDirecteur = false;
    }

    if (isDirecteur) {
      utilisateur.isDirecteur = isDirecteur;
      utilisateur.isChefDeService = false;
    }

    if (!isDirecteur && !isChefDeService) {
      utilisateur.isDirecteur = false;
      utilisateur.isChefDeService = false;
    }

    if (directionID && String(directionID) !== String(utilisateur.direction)) {
      let direction = await Direction.findById(directionID);
      if (direction) {
        if (isDirecteur && direction.directeur) {
          res.status(400);
          throw new Error("directeur existe deja !");
        } else {
          utilisateur.direction = direction._id;
        }
      } else {
        res.status(404);
        throw new Error("direction introuvable !");
      }
    }

    if (departementID && String(departementID) !== String(utilisateur.departement)) {
      let departement = await Departement.findById(departementID);
      if (departement) {
        utilisateur.departement = departement._id;
      } else {
        res.status(404);
        throw new Error("departement introuvable !");
      }
    }

    if (interimID && String(interimID) !== String(utilisateur.interim)) {
      let interim = await Utilisateur.findById(interimID);
      if (interim) {
        utilisateur.interim = interim._id;
      } else {
        res.status(404);
        throw new Error("utilisateur interim introuvable !");
      }
    }

    if (serviceID && String(serviceID) !== String(utilisateur.service)) {
      let service = await Service.findById(serviceID);
      if (service) {
        if (isChefDeService && service.chefService) {
          res.status(400);
          throw new Error("chef de service existe deja !");
        } else {
          utilisateur.service = service._id;
        }
      } else {
        res.status(404);
        throw new Error("service introuvable !");
      }
    }

    if (email && String(email) !== String(utilisateur.email)) {
      const findUserByEmail = await Utilisateur.findOne({ email });
      if (!findUserByEmail) {
        utilisateur.email = email;
      } else {
        res.status(404);
        throw new Error("email existe deja !");
      }
    }

    if (
      req.body.matricule &&
      Number(req.body.matricule) !== Number(utilisateur.matricule)
    ) {
      const findUserBymatricule = await Utilisateur.findOne({ matricule });
      if (!findUserBymatricule) {
        utilisateur.matricule = req.body.matricule;
      } else {
        res.status(404);
        throw new Error("matricule existe deja !");
      }
    }

    if (roles && roles.length > 0) {
      let nroles = [];
      for (const role of roles) {
        const recovredRole = await Role.findOne({ code: String(role) });
        if (!recovredRole) {
          res.status(404);
          throw new Error("role introuvable !");
        } else {
          nroles.push({ role: recovredRole._id });
        }
      }
      utilisateur.roles = nroles || utilisateur.roles;
    }

    const updatedUser = await utilisateur.save();
    await updatedUser.populate("roles.role");
    await updatedUser.populate("service");
    await updatedUser.populate("direction");
    await updatedUser.populate("departement");
    await updatedUser.populate("interim");

    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error("utilisateur introuvable !");
  }
});




export const updateUserPassword = asyncHandler(async (req, res) => {
  const utilisateur = await Utilisateur.findById(req.params.id);
  if (utilisateur) {
    if (req.body.password) {
      utilisateur.password = req.body.password;
      const updatedUser = await utilisateur.save();
      res.json(updatedUser);
    } else {
      res.status(400);
      throw new Error("veuillez saisire le nouveau mot de passe !");
    }
  } else {
    res.status(404);
    throw new Error("utilisateur introuvable !");
  }
});




export const deleteUser = asyncHandler(async (req, res) => {
  const utilisateur = await Utilisateur.findById(req.params.id);
  if (utilisateur) {
    if (utilisateur.isActive) {
      utilisateur.isActive = false;
    } else {
      utilisateur.isActive = true;
    }
    await utilisateur.save();
    res.json({
      message: "utilisateur supprimé !",
    });
  } else {
    res.status(404);
    throw new Error("utilisateur introuvable !");
  }
});




export const getUsersByDivison = asyncHandler(async (req, res) => {
  let utilisateurs = [];
  if (req.params.type === "srv") {
    utilisateurs = await Utilisateur.find({ service: req.params.id });
  } else if (req.params.type === "dep") {
    utilisateurs = await Utilisateur.find({ departement: req.params.id });
  } else {
    utilisateurs = await Utilisateur.find({ direction: req.params.id });
  }
  res.json(utilisateurs);
});




export const getInterimUser = asyncHandler(async (req, res) => {
  
  const interimUser = await Utilisateur.findOne({
    interim: req.user.id
  });
  
  if (interimUser) {
    res.json({
      ...JSON.parse(JSON.stringify(interimUser)),
      haveInterim: true,
    });
  } else {
    res.json({ haveInterim: false });
  }
});




export const putInterimUser = asyncHandler(async (req, res) => {
  const loggedUtilisateur = await Utilisateur.findById(req.user.id);
  if (!loggedUtilisateur) {
    res.status(404);
    throw new Error("utilisateur introuvable !");
  }

  const interimUtilisateur = await Utilisateur.findOne({
    matricule: Number(req.params.matricule),
  });
  
  if (!interimUtilisateur) {
    res.status(404);
    throw new Error("utilisateur interim introuvable !");
  }

  
  const checkInterim = await Utilisateur.findOne({
    interim: interimUtilisateur._id,
  });

  if (checkInterim && String(checkInterim._id) !== String(loggedUtilisateur._id)) {
    res.status(400);
    throw new Error("Utilisateur déjà défini comme interim pour quelqu'un d'autre !");
  }

  
  if (String(interimUtilisateur._id) === String(loggedUtilisateur._id)) {
    res.status(400);
    throw new Error("Un utilisateur ne peut pas être son propre intérim !");
  }

  
  if (interimUtilisateur.interim && String(interimUtilisateur.interim) !== String(loggedUtilisateur._id)) {
    const oldInterim = await Utilisateur.findById(interimUtilisateur.interim);
    if (oldInterim) {
      const signataireRole = await Role.findOne({ code: "sig" });
      
      if (
        !oldInterim.isChefDeService &&
        !oldInterim.isChefDeDepartement &&
        !oldInterim.isDirecteur &&
        !oldInterim.isDirecteurAdj
      ) {
        oldInterim.roles = oldInterim.roles.filter(
          (role) => String(role.role) !== String(signataireRole._id)
        );
        await oldInterim.save();
      }
    }
  }

  
  const signataireRole = await Role.findOne({ code: "sig" });
  const findIndexSigRole = interimUtilisateur.roles.findIndex(
    (r) => String(r.role) === String(signataireRole._id)
  );
  if (findIndexSigRole === -1) {
    interimUtilisateur.roles.push({ role: signataireRole._id });
    await interimUtilisateur.save();
  }

  
  interimUtilisateur.interim = loggedUtilisateur._id;
  await interimUtilisateur.save();

  res.json({ message: "Interim défini avec succès" });
});




export const removeInterimUser = asyncHandler(async (req, res) => {
  
  const interimUtilisateur = await Utilisateur.findOne({
    interim: req.user.id
  });
  
  if (interimUtilisateur) {
    const signataireRole = await Role.findOne({ code: "sig" });
    
    
    if (
      !interimUtilisateur.isChefDeService &&
      !interimUtilisateur.isChefDeDepartement &&
      !interimUtilisateur.isDirecteur &&
      !interimUtilisateur.isDirecteurAdj
    ) {
      interimUtilisateur.roles = interimUtilisateur.roles.filter(
        (role) => String(role.role) !== String(signataireRole._id)
      );
    }
    
    
    interimUtilisateur.interim = null;
    await interimUtilisateur.save();

    res.json({ message: "intrim supprime avec success !" });
  } else {
    res.status(404);
    throw new Error("Vous n'avez pas défini un interim !");
  }
});




export const putInterimUserForAdmin = asyncHandler(async (req, res) => {
  console.log("putInterimUserForAdmin called with:", { userId: req.params.id, matricule: req.params.matricule });
  
  const targetUtilisateur = await Utilisateur.findById(req.params.id);
  if (!targetUtilisateur) {
    res.status(404);
    throw new Error("utilisateur introuvable !");
  }

  const interimUtilisateur = await Utilisateur.findOne({
    matricule: Number(req.params.matricule),
  });
  
  if (!interimUtilisateur) {
    res.status(404);
    throw new Error("utilisateur interim introuvable !");
  }

  console.log("Target user:", { id: targetUtilisateur._id, nom: targetUtilisateur.nom, interim: targetUtilisateur.interim });
  console.log("Interim user:", { id: interimUtilisateur._id, nom: interimUtilisateur.nom, matricule: interimUtilisateur.matricule });

  
  const checkInterim = await Utilisateur.findOne({
    interim: interimUtilisateur._id,
  });

  console.log("Check interim result:", checkInterim ? { id: checkInterim._id, nom: checkInterim.nom } : "null");

  if (checkInterim && String(checkInterim._id) !== String(targetUtilisateur._id)) {
    console.log("Error: User already defined as interim for someone else");
    console.log("CheckInterim ID:", checkInterim._id);
    console.log("TargetUtilisateur ID:", targetUtilisateur._id);
    res.status(400);
    throw new Error("Utilisateur déjà défini comme interim pour quelqu'un d'autre !");
  }

  
  if (String(interimUtilisateur._id) === String(targetUtilisateur._id)) {
    console.log("Error: Cannot set user as their own interim");
    res.status(400);
    throw new Error("Un utilisateur ne peut pas être son propre intérim !");
  }

  
  if (interimUtilisateur.interim && String(interimUtilisateur.interim) !== String(targetUtilisateur._id)) {
    console.log("Interim user has different interim, removing it first");
    const oldInterim = await Utilisateur.findById(interimUtilisateur.interim);
    if (oldInterim) {
      const signataireRole = await Role.findOne({ code: "sig" });
      
      if (
        !oldInterim.isChefDeService &&
        !oldInterim.isChefDeDepartement &&
        !oldInterim.isDirecteur &&
        !oldInterim.isDirecteurAdj
      ) {
        oldInterim.roles = oldInterim.roles.filter(
          (role) => String(role.role) !== String(signataireRole._id)
        );
        await oldInterim.save();
      }
    }
  }

  
  const signataireRole = await Role.findOne({ code: "sig" });
  const findIndexSigRole = interimUtilisateur.roles.findIndex(
    (r) => String(r.role) === String(signataireRole._id)
  );
  if (findIndexSigRole === -1) {
    interimUtilisateur.roles.push({ role: signataireRole._id });
    await interimUtilisateur.save();
  }

  
  interimUtilisateur.interim = targetUtilisateur._id;
  await interimUtilisateur.save();

  res.json({ message: "Interim défini avec succès" });
});




export const removeInterimUserForAdmin = asyncHandler(async (req, res) => {
  const targetUtilisateur = await Utilisateur.findById(req.params.id);
  if (!targetUtilisateur) {
    res.status(404);
    throw new Error("utilisateur introuvable !");
  }

  
  const interimUtilisateur = await Utilisateur.findOne({
    interim: targetUtilisateur._id,
  });

  if (!interimUtilisateur) {
    res.status(404);
    throw new Error("Aucun intérim trouvé pour cet utilisateur !");
  }

  const signataireRole = await Role.findOne({ code: "sig" });
  interimUtilisateur.interim = null;

  
  if (
    !interimUtilisateur.isChefDeService &&
    !interimUtilisateur.isChefDeDepartement &&
    !interimUtilisateur.isDirecteur &&
    !interimUtilisateur.isDirecteurAdj
  ) {
    interimUtilisateur.roles = interimUtilisateur.roles.filter(
      (role) => String(role.role) !== String(signataireRole._id)
    );
  }
  
  await interimUtilisateur.save();
  res.json({ message: "Intérim supprimé avec succès !" });
});
