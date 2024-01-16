import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import Utilisateur from "../models/utilisateurModel.js";
import Role from "../models/roleModel.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers["authorization"].split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const utilisateur = await Utilisateur.findById(decoded.id);
      if (utilisateur) {
        req.user = utilisateur;
        next();
      } else {
        res.status(401);
        throw new Error("Non autorisé, utilisateur introuvable !");
      }
    } catch (error) {
      res.status(401);
      throw new Error("Non autorisé, le token a échoué");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Non autorisé, pas de token");
  }
});

export const createur = asyncHandler(async (req, res, next) => {
  const role = await Role.findOne({ code: "crt" });
  if (req.user && req.user.roles && req.user.roles.length > 0) {
    const findIndex = req.user.roles.findIndex(
      item => String(item.role) === String(role._id)
    );
    if (findIndex !== -1) {
      next();
    } else {
      res.status(401);
      throw new Error("Non autorisé en tant que créateur");
    }
  } else {
    res.status(401);
    throw new Error("Non autorisé, pas de roles !");
  }
});

export const createurOption = asyncHandler(async (req, res, next) => {
  const role = await Role.findOne({ code: "crt-op" });
  if (req.user && req.user.roles && req.user.roles.length > 0) {
    const findIndex = req.user.roles.findIndex(
      item => String(item.role) === String(role._id)
    );
    if (findIndex !== -1) {
      next();
    } else {
      res.status(401);
      throw new Error("Non autorisé en tant que créateur d'option ");
    }
  } else {
    res.status(401);
    throw new Error("Non autorisé, pas de roles !");
  }
});

export const demandeur = asyncHandler(async (req, res, next) => {
  const role = await Role.findOne({ code: "dmr" });
  if (req.user && req.user.roles && req.user.roles.length > 0) {
    const findIndex = req.user.roles.findIndex(
      item => String(item.role) === String(role._id)
    );
    if (findIndex !== -1) {
      next();
    } else {
      res.status(401);
      throw new Error("Non autorisé en tant que demandeur");
    }
  } else {
    res.status(401);
    throw new Error("Non autorisé, pas de roles !");
  }
});

export const signataire = asyncHandler(async (req, res, next) => {
  const role = await Role.findOne({ code: "sig" });
  if (req.user && req.user.roles && req.user.roles.length > 0) {
    const findIndex = req.user.roles.findIndex(
      item => String(item.role) === String(role._id)
    );
    if (findIndex !== -1) {
      next();
    } else {
      res.status(401);
      throw new Error("Non autorisé en tant que signataire");
    }
  } else {
    res.status(401);
    throw new Error("Non autorisé, pas de roles !");
  }
});
