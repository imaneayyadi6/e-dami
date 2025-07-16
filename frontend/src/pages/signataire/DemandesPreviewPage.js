import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDemandesPreviewTeam } from "../../redux/demande/demandeActions";
import { fetchOptions } from "../../redux/option/optionActions";
import { Message, Table, TableLoading, WarningMessage } from "../../components";
import { Card, Form, Row, Col, Button, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const DemandesPreviewPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    demandeur: "",
    option: "",
    status: "",
    fonction: "",
    dateDemande: "",
  });
  const [tableFilters, setTableFilters] = useState({
    demandeur: "",
    option: "",
    status: "",
    fonction: "",
    dateDemande: "",
  });
  const [activeFilters, setActiveFilters] = useState({}); // Stocker les filtres actifs

  const dispatch = useDispatch();
  const demandePreviewTeam = useSelector((state) => state.demandePreviewTeam);
  const optionList = useSelector((state) => state.optionList);

  const {
    loading: demandePreviewTeamLoading,
    error: demandePreviewTeamError,
    success: demandePreviewTeamSuccess,
    demandes,
    pagination,
    teamOptions,
  } = demandePreviewTeam;

  const {
    loading: loadingOptionList,
    error: errorOptionList,
    success: successOptionList,
    options,
  } = optionList;

  const navigate = useNavigate();

  // Function to load demandes with current page and filters
  const loadDemandes = (customFilters = null) => {
    const filtersToUse = customFilters || activeFilters || filters;
    const query = {
      page: currentPage,
      limit: itemsPerPage,
      ...Object.fromEntries(
        Object.entries(filtersToUse).filter(([_, value]) => value !== "")
      ),
    };
    dispatch(getDemandesPreviewTeam(query));
  };

  useEffect(() => {
    loadDemandes();
  }, [currentPage, itemsPerPage]);

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle filter submit
  const handleFilterSubmit = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1); // Reset to first page when filtering
    
    // Utiliser les valeurs stockées dans tableFilters
    const combinedFilters = { ...filters, ...tableFilters };
    setActiveFilters(combinedFilters); // Stocker les filtres actifs
    loadDemandes(combinedFilters);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handle table filter change
  const handleTableFilterChange = (field, value) => {
    setTableFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters = {
      demandeur: "",
      option: "",
      status: "",
      fonction: "",
      dateDemande: "",
    };
    setFilters(clearedFilters);
    setTableFilters(clearedFilters);
    setActiveFilters({}); // Effacer les filtres actifs
    setCurrentPage(1);
    loadDemandes(clearedFilters);
  };

  return (
    <>
      {demandePreviewTeamError && (
        <Message itWillBeHidden type="danger">
          {demandePreviewTeamError}
        </Message>
      )}
              <Card className="h-100">
        <Card.Body>
          {/* Boutons de filtrage côté serveur */}
          <div className="mb-3">
            <div className="d-flex justify-content-end">
              <Button type="button" size="sm" variant="primary" className="me-2" onClick={handleFilterSubmit}>
                <i className="fas fa-search"></i> Filtrer côté serveur
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="outline-secondary" 
                onClick={clearFilters}
              >
                <i className="fas fa-times"></i> Reset
              </Button>
            </div>
          </div>

            {/* Informations de pagination */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <Form.Label size="sm" className="me-2">Éléments par page:</Form.Label>
              <Form.Select
                size="sm"
                style={{ width: "auto", display: "inline-block" }}
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </Form.Select>
            </div>
            {pagination && (
              <div>
                <small className="text-muted">
                  Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, pagination.totalItems)} sur {pagination.totalItems} demandes de l'équipe
                </small>
              </div>
            )}
          </div>

          {demandePreviewTeamLoading && <TableLoading />}
          
          {/* Champs de filtres manuels - toujours visibles */}
          <div className="mb-3">
            <Row>
              <Col md={2}>
                <Form.Group className="mb-2">
                  <Form.Label size="sm">Membre de l'équipe</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={tableFilters.demandeur}
                    onChange={(e) => handleTableFilterChange("demandeur", e.target.value)}
                    placeholder="Nom ou prénom..."
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-2">
                  <Form.Label size="sm">Fonction</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={tableFilters.fonction}
                    onChange={(e) => handleTableFilterChange("fonction", e.target.value)}
                    placeholder="Fonction..."
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-2">
                  <Form.Label size="sm">Type de demande</Form.Label>
                  <Form.Select
                    size="sm"
                    value={tableFilters.option}
                    onChange={(e) => handleTableFilterChange("option", e.target.value)}
                  >
                    <option value="">Tous les types</option>
                    {teamOptions && teamOptions.length > 0 &&
                      teamOptions.map((option) => (
                        <option key={option._id} value={option._id}>
                          {option.libelle}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-2">
                  <Form.Label size="sm">Date de demande</Form.Label>
                  <Form.Control
                    size="sm"
                    type="date"
                    value={tableFilters.dateDemande}
                    onChange={(e) => handleTableFilterChange("dateDemande", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-2">
                  <Form.Label size="sm">Status</Form.Label>
                  <Form.Select
                    size="sm"
                    value={tableFilters.status}
                    onChange={(e) => handleTableFilterChange("status", e.target.value)}
                  >
                    <option value="">Tous les status</option>
                    <option value="en_attente">En attente</option>
                    <option value="en_cours">En cours</option>
                    <option value="approuve">Approuvé</option>
                    <option value="refuse">Refusé</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {demandes && demandes.length > 0 ? (
            <>
              <Table
                columns={[
                  {
                    Header: "ID",
                    accessor: "_id",
                    show: false,
                  },
                  {
                    Header: "Membre de l'équipe",
                    accessor: (row) =>
                      `${row.demandeur.nom} ${row.demandeur.prenom}`,
                  },
                  {
                    Header: "Fonction",
                    accessor: (row) => `${row.demandeur.fonction} `,
                  },
                  {
                    Header: "Type de demande",
                    accessor: "option.libelle",
                  },
                  {
                    Header: "Date de demande",
                    accessor: "dateDemande",
                    Cell: ({ value }) => {
                      const date = new Date(value);
                      return (
                        <div className="text-muted">
                          <div style={{ fontSize: "0.85em", lineHeight: "1.2" }}>
                            {date.toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                          <div style={{ fontSize: "0.75em", opacity: "0.8" }}>
                            {date.toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      );
                    },
                  },
                  {
                    Header: "Signataires",
                    accessor: "signataires",
                    Cell: ({ value }) => {
                      if (!value || value.length === 0) {
                        return <span className="text-muted">Aucun signataire</span>;
                      }
                      
                      return (
                        <div className="d-flex flex-wrap gap-1">
                          {value.map((sig, index) => {
                            let badgeClass = "badge fs-6 me-1 mb-1";
                            
                            switch (sig.status?.toLowerCase()) {
                              case "approuve":
                              case "approuvé":
                                badgeClass += " text-bg-success";
                                break;
                              case "refuse":
                              case "refusé":
                                badgeClass += " text-bg-danger";
                                break;
                              case "en cours":
                                badgeClass += " text-bg-warning";
                                break;
                              default:
                                badgeClass += " text-bg-secondary";
                            }
                            
                            return (
                              <span 
                                key={index} 
                                className={badgeClass}
                                title={`${sig.nom} ${sig.prenom}\nEn tant que: ${sig.titre}\nStatut: ${sig.status}`}
                                style={{ cursor: "help" }}
                              >
                                <div className="text-center">
                                  <div style={{ fontSize: "0.85em", lineHeight: "1.1" }}>
                                    {sig.nom} {sig.prenom}
                                  </div>
                                  <div style={{ fontSize: "0.7em", opacity: "0.9", lineHeight: "1" }}>
                                    {sig.titre}
                                  </div>
                                </div>
                              </span>
                            );
                          })}
                        </div>
                      );
                    },
                  },
                  {
                    Header: "Status",
                    accessor: "status",
                  },
                ]}
                data={demandes}
                disableFilters={true} // Désactiver les filtres automatiques du tableau
                disablePagination={true} // Désactiver la pagination côté client car on utilise la pagination côté serveur
                showDetailsLink="/demandes/apercu/details"
                rowClick={(id) => {
                  navigate(`/demandes/apercu/details/${id}`);
                }}
              />
              
              {/* Pagination côté serveur */}
              {pagination && pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.First
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                    
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(
                        pagination.totalPages - 4,
                        currentPage - 2
                      )) + i;
                      if (pageNum <= pagination.totalPages) {
                        return (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Pagination.Item>
                        );
                      }
                      return null;
                    })}
                    
                    <Pagination.Next
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                    />
                    <Pagination.Last
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={currentPage === pagination.totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            demandePreviewTeamSuccess && (
              <WarningMessage message={"Aucune demande trouvée dans votre équipe"} />
            )
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default DemandesPreviewPage;
