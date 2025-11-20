import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeUser,
  fetchUsers,
  resetRemoveUser,
} from "../../redux/user/userActions";
import { Card, Button } from "react-bootstrap";
import { Message, Table, TableLoading, WarningMessage } from "../../components";
import { Link, useNavigate } from "react-router-dom";
import { Toast, Dialog } from "../../services";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { FaSearch, FaSyncAlt, FaPlus, FaIdBadge, FaUser, FaEnvelope, FaBriefcase, FaBuilding, FaSitemap, FaUserCheck } from "react-icons/fa";

const UtilisateurListPage = () => {
  const [callOnce, setCallOnce] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const { isRTL } = useLanguageSync();
  const currentLanguage = i18n.language;
  const userList = useSelector((state) => state.userList);
  const {
    loading: loadingUserList,
    error: errorUserList,
    success: successUserList,
    users,
  } = userList;

  const userRemove = useSelector((state) => state.userRemove);
  const {
    loading: loadingUserRemove,
    error: errorUserRemove,
    success: successUserRemove,
  } = userRemove;

  const memoizedColumns = useMemo(() => ([
    {
      Header: "ID",
      accessor: "_id",
      show: false,
    },
    {
      Header: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexDirection: isRTL ? "row-reverse" : "row", color: "#0d6efd" }}>
          <FaIdBadge />
          <span style={{ color: "var(--text-primary)" }}>{currentLanguage === "ar" ? "الرقم الإداري" : "Matricule"}</span>
        </span>
      ),
      accessor: "matricule",
      filter: "matricule",
      enableArabicKeyboard: true,
    },
    {
      Header: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexDirection: isRTL ? "row-reverse" : "row", color: "#0d6efd" }}>
          <FaUser />
          <span style={{ color: "var(--text-primary)" }}>{currentLanguage === "ar" ? "الاسم واللقب" : "Nom & prénom"}</span>
        </span>
      ),
      id: "nomComplet",
      accessor: (row) => `${row.nom} ${row.prenom}`,
      filter: "nom",
      enableArabicKeyboard: true,
    },
    {
      Header: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexDirection: isRTL ? "row-reverse" : "row", color: "#0d6efd" }}>
          <FaEnvelope />
          <span style={{ color: "var(--text-primary)" }}>{currentLanguage === "ar" ? "البريد الإلكتروني" : "Email"}</span>
        </span>
      ),
      accessor: "email",
      filter: "email",
      enableArabicKeyboard: true,
    },
    {
      Header: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexDirection: isRTL ? "row-reverse" : "row", color: "#0d6efd" }}>
          <FaBriefcase />
          <span style={{ color: "var(--text-primary)" }}>{currentLanguage === "ar" ? "الوظيفة" : "Fonction"}</span>
        </span>
      ),
      accessor: "fonction",
      filter: "fonction",
      enableArabicKeyboard: true,
    },
    {
      Header: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexDirection: isRTL ? "row-reverse" : "row", color: "#0d6efd" }}>
          <FaBuilding />
          <span style={{ color: "var(--text-primary)" }}>{currentLanguage === "ar" ? "المديرية" : "Direction"}</span>
        </span>
      ),
      accessor: "direction.libelle",
      filter: "direction.libelle",
      filterOptions: Array.from(new Set(users.map(u => u && u.direction && u.direction.libelle).filter(Boolean))).sort(),
      enableArabicKeyboard: true,
    },
    {
      Header: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexDirection: isRTL ? "row-reverse" : "row", color: "#0d6efd" }}>
          <FaSitemap />
          <span style={{ color: "var(--text-primary)" }}>{currentLanguage === "ar" ? "المصلحة" : "Service"}</span>
        </span>
      ),
      accessor: "service.libelle",
      filter: "service.libelle",
      filterOptions: Array.from(new Set(users.map(u => u && u.service && u.service.libelle).filter(Boolean))).sort(),
      enableArabicKeyboard: true,
    },
  ]), [currentLanguage, isRTL, users]);

  const memoizedData = useMemo(() => Array.isArray(users) ? users : [], [users]);

  const showDetailsUserHandler = useCallback((id) => {
    navigate(`/admin/details-utilisateur/${id}`);
  }, [navigate]);

  
  
  
  
  
  
  
  
  

  const updateUserHandler = useCallback((id) => {
    navigate(`/admin/modifier-utilisateur/${id}`);
  }, [navigate]);

  
  const EmptyStateComponent = () => (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div 
        className="mx-auto mb-3 d-flex align-items-center justify-content-center" 
        style={{ 
          width: 72, 
          height: 72, 
          borderRadius: 16, 
          background: 'linear-gradient(135deg, #e0e7ff, #f3f4f6)' 
        }}
      >
        <FaUserCheck style={{ color: '#0d6efd', fontSize: 28 }} />
      </div>
      <div className="fw-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        {currentLanguage === "ar" ? "لم يتم العثور على أي مستخدم" : "Aucun utilisateur trouvé"}
      </div>
      <div className="text-muted" style={{ fontSize: 13 }}>
        {hasActiveFilters 
          ? (currentLanguage === "ar" ? "حاول تعديل فلاتر البحث لتوسيع النتائج." : "Essayez d'ajuster les filtres pour élargir la recherche.")
          : (currentLanguage === "ar" ? "لا يوجد مستخدمون في النظام حالياً." : "Aucun utilisateur n'est enregistré dans le système pour le moment.")
        }
      </div>
    </div>
  );

  useEffect(() => {
    if (successUserRemove) {
      dispatch(resetRemoveUser());
      Toast.open({
        type: "success",
        title: "Suppression avec succès",
        message: `l'utilisateur a été supprimée avec succès`,
      });
    }
    if (!callOnce) {
      dispatch(fetchUsers());
      setCallOnce(true);
    }
  }, [callOnce, dispatch, successUserRemove]);

  return (
    <>
      {errorUserList && (
        <Message itWillBeHidden={true} type="danger">
          {errorUserList}
        </Message>
      )}

      {errorUserRemove && (
        <Message itWillBeHidden={true} type="danger">
          {errorUserRemove}
        </Message>
      )}
      <Card className="h-100 border-0 shadow-sm">
        <Card.Body>
          <div
            className="d-flex align-items-center mb-3"
            style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}
          >
            <div style={{ textAlign: isRTL ? "right" : "left" }}>
              <h2 className="mb-0" style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "1.25rem" }}>
                {currentLanguage === "ar" ? "إدارة المستخدمين" : "Gestion des utilisateurs"}
              </h2>
            </div>

            <div className="d-flex align-items-center" style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 8 }}>
              <Button
                type="button"
                size="sm"
                className="rounded-pill d-flex align-items-center justify-content-center"
                onClick={() => {
                  dispatch(fetchUsers());
                }}
                style={{
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "9999px",
                  fontSize: "0.875rem",
                  padding: "6px 14px",
                  gap: 8,
                  height: 32,
                }}
              >
                <FaSyncAlt />
                <span className={isRTL ? "me-1" : "ms-1"}>
                  {currentLanguage === "ar" ? "إعادة تعيين" : "Réinitialiser"}
                </span>
              </Button>
              <Link
                className="btn btn-sm rounded-pill"
                to="/admin/creer-utilisateur"
                style={{
                  background: "#4287f5",
                  border: "none",
                  color: "#fff",
                  padding: "6px 14px",
                  height: 32,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexDirection: isRTL ? "row-reverse" : "row" }}>
                  <FaPlus />
                  <span>
                    {currentLanguage === "ar" ? "إضافة مستخدم" : "Ajouter un utilisateur"}
                  </span>
                </span>
            </Link>
            </div>
          </div>
          {loadingUserList && <TableLoading />}

          {(Array.isArray(users) ? users.length : 0) > 0 ? (
            <Table
              columns={memoizedColumns}
              data={memoizedData}
              loadingRemove={loadingUserRemove}
              showDetailsRow={showDetailsUserHandler}
              updateRow={updateUserHandler}
              dropdownFilters={["service.libelle", "direction.libelle"]}
              onFilterChange={setHasActiveFilters}
              emptyStateComponent={<EmptyStateComponent />}
            />
          ) : (
            successUserList && <EmptyStateComponent />
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default UtilisateurListPage;
