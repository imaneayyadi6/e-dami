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

// @desc    Auth user & get token
// @route   POST /api/utilisateurs/login
// @access  Public
export const authUser = asyncHandler(async (req, res) => {
  console.log("#### LOGIN  ####");

  const { email, password } = req.body;
  const isNumeric = (value) => !isNaN(parseFloat(value)) && isFinite(value);

  const lowercaseEmail = String(email).toLocaleLowerCase();

  let query;
  if (isNumeric(email)) {
    query = { matricule: parseInt(email) };
  } else {
    query = { email: { $regex: new RegExp(`^${lowercaseEmail}$`, "i") } };
  }

  const utilisateur = await Utilisateur.findOne(query)
    .populate("roles.role")
    .populate("direction")
    .populate("service")
    .populate("departement");

  if (utilisateur) {
    if (await bcrypt.compare(password, utilisateur.password)) {
      let isAdmin = false;
      for (let role of utilisateur.roles) {
        let findRole = await Role.findById(role.role);
        if (findRole.code === "crt") {
          isAdmin = true;
          break;
        }
      }

      if (isAdmin) {
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
            roles: utilisateur.roles,
            token: generateToken(utilisateur._id),
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
              roles: utilisateur.roles,
              token: generateToken(utilisateur._id),
            });
          } else {
            res.status(400);
            throw new Error("votre compte est inactif");
          }
        } else {
          res.status(400);
          throw new Error("veuillez recuperer votre compte !");
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

// @desc    validate token
// @route   POST /api/utilisateurs/validatetoken
// @access  Public
export const validateTokenUser = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const decoded = jwt.verify(String(token).trim(), process.env.JWT_SECRET);

  const utilisateur = await Utilisateur.findOne({
    matricule: Number(decoded.id),
  });
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

// @desc    Register
// @route   POST /api/utilisateurs/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { matricule } = req.body;

  const utilisateur = await Utilisateur.findOne({
    matricule,
  });
  if (utilisateur) {
    if (utilisateur.firstTimeLogin) {
      // if (!utilisateur.emailSent) {
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
      // } else {
      //   res.status(404);
      //   throw new Error("email déjà envoyer");
      // }
    } else {
      res.status(404);
      throw new Error("vous avez déjà récupéré votre compte");
    }
  } else {
    res.status(404);
    throw new Error("utilisateur introuvable !");
  }
});

// @desc    set mot de passe
// @route   POST /api/utilisateurs/setpassword
// @access  Public
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

// @desc    mot de passe oublie
// @route   POST /api/utilisateurs/changepassword
// @access  Public
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

// @desc    set new mot de passe
// @route   POST /api/utilisateurs/new/setpassword
// @access  Public
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

// @desc    Create users
// @route   POST /api/utilisateurs
// @access  Public
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

// @desc    Recuperer tous les utilisateurs
// @route   GET /api/utilisateurs
// @access  private
export const getUsers = asyncHandler(async (req, res) => {
  const users = await Utilisateur.find()
    .sort({ createdAt: -1 })
    .populate("roles.role")
    .populate("direction")
    .populate("service")
    .select("-password");
  res.json(users);
});

// @desc    Recuperer un utilisateur par ID
// @route   GET /api/utilisateurs/:id
// @access  private
export const getUserByID = asyncHandler(async (req, res) => {
  const user = await Utilisateur.findById(req.params.id)
    .populate("roles.role")
    .populate("direction")
    .populate("service")
    .select("-password");
  if (user) res.json(user);
  else {
    res.status(404);
    throw new Error("utilisateur introuvable !");
  }
});

// @desc    Afficher tous les utilisateurs directeurs
// @route   GET /api/utilisateurs/directeurs
// @access  private
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

// @desc    Afficher tous les utilisateurs chef services
// @route   GET /api/utilisateurs/chefdeservices
// @access  private
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

// @desc    Modifier les infos d'un utilisateur
// @route   PUT /api/utilisateurs/infos:/:id
// @access  private
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
    service: serviceID,
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

    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error("utilisateur introuvable !");
  }
});

// @desc    Modifier le mot de passe d'un utilisateur
// @route   PUT /api/utilisateurs/passsword/:id
// @access  private
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

// @desc    Supprimer un utilisateur
// @route   DELETE /api/utilisateurs/:id
// @access  private
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

// @desc    Recuperer des utilisateurs par division
// @route   GET /api/utilisateurs/:type/division/:id
// @access  private
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
