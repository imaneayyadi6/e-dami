import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDemandesPreviewTeamAll } from "../../redux/demande/demandeActions";
import { Message, Table, TableLoading, WarningMessage } from "../../components";
import { Card, Form, Row, Col, Button, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import RTable from "../../components/RTable";

const DemandesListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    demandeur: "",
    option: "",
    status: "",
    fonction: "",
    dateDemande: "",
    dateEnvoiTraitement: "",
  });

  const dispatch = useDispatch();
  const demandePreviewTeamAdmin = useSelector(
    (state) => state.demandePreviewTeamAdmin
  );

  const {
    loading: demandePreviewTeamAdminLoading,
    error: demandePreviewTeamAdminError,
    success: demandePreviewTeamAdminSuccess,
    demandes,
    pagination,
  } = demandePreviewTeamAdmin;
  const navigate = useNavigate();

  // Handle row click to navigate to details
  const handleRowClick = (demandeId) => {
    navigate(`/demandes/apercu/details/${demandeId}`);
  };

  // Function to load demandes with current page and filters
  const loadDemandes = () => {
    const query = {
      page: currentPage,
      limit: itemsPerPage,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      ),
    };
    dispatch(getDemandesPreviewTeamAll(query));
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
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when filtering
    loadDemandes();
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

  // Clear filters
  const clearFilters = () => {
    setFilters({
      demandeur: "",
      option: "",
      status: "",
      fonction: "",
      dateDemande: "",
      dateEnvoiTraitement: "",
    });
    setCurrentPage(1);
    dispatch(getDemandesPreviewTeamAll({ page: 1, limit: itemsPerPage }));
  };

  return (
    <>
      {demandePreviewTeamAdminError && (
        <Message itWillBeHidden type="danger">
          {demandePreviewTeamAdminError}
        </Message>
      )}

      <Card>
        <Card.Header>
          <h5>Filtres</h5>
          <Form onSubmit={handleFilterSubmit}>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Demandeur</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nom ou prénom"
                    value={filters.demandeur}
                    onChange={(e) => handleFilterChange("demandeur", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Fonction</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Fonction"
                    value={filters.fonction}
                    onChange={(e) => handleFilterChange("fonction", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                  >
                    <option value="">Tous les status</option>
                    <option value="en cours">En cours</option>
                    <option value="approuve">Approuvé</option>
                    <option value="refuse">Refusé</option>
                    <option value="termine">Terminé</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Date Demande</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.dateDemande}
                    onChange={(e) => handleFilterChange("dateDemande", e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Date Envoi Traitement</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.dateEnvoiTraitement}
                    onChange={(e) => handleFilterChange("dateEnvoiTraitement", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={9}>
                <Form.Group className="mb-3">
                  <Form.Label>Actions</Form.Label>
                  <div className="d-flex gap-2">
                    <Button type="submit" variant="primary" size="sm">
                      Filtrer
                    </Button>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="sm"
                      onClick={clearFilters}
                    >
                      Effacer
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Header>

        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              {pagination && (
                <span className="text-muted">
                  Affichage {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, pagination.totalItems)} 
                  sur {pagination.totalItems} résultats
                </span>
              )}
            </div>
            <div>
              <Form.Select
                size="sm"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                style={{ width: "auto" }}
              >
                <option value={5}>5 par page</option>
                <option value={10}>10 par page</option>
                <option value={20}>20 par page</option>
                <option value={50}>50 par page</option>
              </Form.Select>
            </div>
          </div>

          {demandePreviewTeamAdminLoading && <TableLoading />}
          
          {demandes && demandes.length > 0 && (
            <Table
              columns={[
                {
                  Header: "ID",
                  accessor: "_id",
                  show: false,
                },
                {
                  Header: "Demandeur",
                  accessor: (row) =>
                    `${row.demandeur.nom} ${row.demandeur.prenom}`,
                },
                {
                  Header: "Fonction",
                  accessor: (row) => `${row.demandeur.fonction}`,
                },
                {
                  Header: "Option",
                  accessor: "option.libelle",
                },
                {
                  Header: "Date Demande",
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
                  Header: "Date Envoi Traitement",
                  accessor: (row) => {
                    // Get the latest traitement date
                    if (row.traitement && row.traitement.length > 0) {
                      const latestTraitement = row.traitement.sort((a, b) => 
                        new Date(b.dateEnvoi) - new Date(a.dateEnvoi)
                      )[0];
                      return latestTraitement.dateEnvoi;
                    }
                    return null;
                  },
                  Cell: ({ value }) => {
                    if (!value) {
                      return <span className="text-muted">-</span>;
                    }
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
              showDetailsLink={`/demandes/apercu/details`}
              rowClick={handleRowClick} // Enable row click navigation
              disableFilters={true} // Disable client-side filtering since we're doing server-side
              disablePagination={true} // Disable client-side pagination since we're doing server-side
            />
          )}

          {demandePreviewTeamAdminSuccess &&
            !demandePreviewTeamAdminLoading &&
            demandes && demandes.length === 0 && (
              <WarningMessage message={"Aucune demande trouvée"} />
            )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination>
                <Pagination.First
                  disabled={!pagination.hasPrevPage}
                  onClick={() => handlePageChange(1)}
                />
                <Pagination.Prev
                  disabled={!pagination.hasPrevPage}
                  onClick={() => handlePageChange(currentPage - 1)}
                />
                
                {/* Show page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const startPage = Math.max(1, currentPage - 2);
                  const pageNumber = startPage + i;
                  
                  if (pageNumber <= pagination.totalPages) {
                    return (
                      <Pagination.Item
                        key={pageNumber}
                        active={pageNumber === currentPage}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </Pagination.Item>
                    );
                  }
                  return null;
                })}

                <Pagination.Next
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                />
                <Pagination.Last
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePageChange(pagination.totalPages)}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default DemandesListPage;
