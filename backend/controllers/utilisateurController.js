import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import Utilisateur from "../models/utilisateurModel.js";
import Direction from "../models/directionModel.js";
import Service from "../models/serviceModel.js";
import Role from "../models/roleModel.js";

// @desc    Auth user & get token
// @route   POST /api/utilisateurs/login
// @access  Public
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const utilisateur = await Utilisateur.findOne({
    email: String(email).toLocaleLowerCase(),
  })
    .populate("roles.role")
    .populate("service")
    .populate("direction");
  // .populate("service.direction");

  if (utilisateur && (await bcrypt.compare(password, utilisateur.password))) {

    res.status(200).json({
      id: utilisateur._id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      gsm: utilisateur.gsm,
      fonction: utilisateur.fonction,
      matricule: utilisateur.matricule,
      service: utilisateur.service,
      direction: utilisateur.direction,
      roles: utilisateur.roles,
      token: generateToken(utilisateur._id),
    });
  } else {
    res.status(404);
    throw new Error("email ou mot de passe invalide");
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
    const service = await Service.findOne({ chefService: utilisateur._id });
    const direction = await Direction.findOne({ directeur: utilisateur._id });

    if (service) {
      service.chefService = null;
      await service.save();
    }
    if (direction) {
      direction.directeur = null;
      await direction.save();
    }

    await Utilisateur.deleteOne({ _id: req.params.id });
    res.json({
      message: "utilisateur supprimé !",
    });
  } else {
    res.status(404);
    throw new Error("utilisateur introuvable !");
  }
});
