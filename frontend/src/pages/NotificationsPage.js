import { Card } from "react-bootstrap"
import { Link } from "react-router-dom"


const NotificationsPage = () => {
    return (
        <>
            <Card>
                <Card.Body className="px-3">
                    <div className="d-flex justify-content-between mb-3">
                        <h3>notifcations non vue <span className="badge bg-dark pr-1">3</span></h3>
                        <div>
                            <h6>
                                <Link>voir tous</Link>
                            </h6>
                        </div>
                    </div>
                    <div className="border p-3 mb-1">
                        <p>
                            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Perspiciatis debitis illo obcaecati nulla inventore rem libero, placeat itaque, quo veniam et dolorem maiores amet. Voluptatem commodi dolorem ab iure culpa?
                        </p>
                        <div className="d-flex justify-content-end">
                            <small>
                                2023-12-09:18:09
                            </small>
                        </div>
                    </div>
                    <div className="border p-3 mb-1">
                        <p>
                            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Perspiciatis debitis illo obcaecati nulla inventore rem libero, placeat itaque, quo veniam et dolorem maiores amet. Voluptatem commodi dolorem ab iure culpa?
                            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Perspiciatis debitis illo obcaecati nulla inventore rem libero, placeat itaque, quo veniam et dolorem maiores amet. Voluptatem commodi dolorem ab iure culpa?
                            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Perspiciatis debitis illo obcaecati nulla inventore rem libero, placeat itaque, quo veniam et dolorem maiores amet. Voluptatem commodi dolorem ab iure culpa?
                            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Perspiciatis debitis illo obcaecati nulla inventore rem libero, placeat itaque, quo veniam et dolorem maiores amet. Voluptatem commodi dolorem ab iure culpa?
                        </p>
                        <div className="d-flex justify-content-end">
                            <small>
                                2023-12-09:18:09
                            </small>
                        </div>
                    </div>
                    <div className="border p-3 mb-1">
                        <p>
                            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Perspiciatis debitis illo obcaecati nulla inventore rem libero, placeat itaque, quo veniam et dolorem maiores amet. Voluptatem commodi dolorem ab iure culpa?
                        </p>
                        <div className="d-flex justify-content-end">
                            <small>
                                2023-12-09:18:09
                            </small>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </>
    )
}

export default NotificationsPage