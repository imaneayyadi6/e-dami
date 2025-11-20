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
  const roleCreateur = await Role.findOne({ code: "crt" });
  const roleAdmin = await Role.findOne({ code: "admin" });
  if (req.user && req.user.roles && req.user.roles.length > 0) {
    const allowedIds = [roleCreateur?._id, roleAdmin?._id].filter(Boolean).map(id => String(id));
    const findIndex = req.user.roles.findIndex(item => item && item.role && allowedIds.includes(String(item.role)));
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
  
  const roleCrtOp = await Role.findOne({ code: "crt-op" });
  const roleCrt = await Role.findOne({ code: "crt" });
  const roleCreateur = await Role.findOne({ code: "createur" });
  if (req.user && req.user.roles && req.user.roles.length > 0) {
    const allowedIds = [roleCrtOp?._id, roleCrt?._id, roleCreateur?._id]
      .filter(Boolean)
      .map(id => String(id));
    const findIndex = req.user.roles.findIndex(item =>
      item && item.role && allowedIds.includes(String(item.role))
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
  const roleDemandeur = await Role.findOne({ code: "dmr" });
  const roleAdmin = await Role.findOne({ code: "admin" });
  if (req.user && req.user.roles && req.user.roles.length > 0) {
    const allowedIds = [roleDemandeur?._id, roleAdmin?._id].filter(Boolean).map(id => String(id));
    const findIndex = req.user.roles.findIndex(item => item && item.role && allowedIds.includes(String(item.role)));
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
  const roleSig = await Role.findOne({ code: "sig" });
  const roleAdmin = await Role.findOne({ code: "admin" });
  if (req.user && req.user.roles && req.user.roles.length > 0) {
    const allowedIds = [roleSig?._id, roleAdmin?._id].filter(Boolean).map(id => String(id));
    const findIndex = req.user.roles.findIndex(item => item && item.role && allowedIds.includes(String(item.role)));
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
