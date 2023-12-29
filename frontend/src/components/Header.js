import React, { useEffect, useState } from "react";
import { Button, Container, Nav, NavDropdown, Navbar } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { showSidebar } from "../redux/sidebar/sidebarActions";
import { LinkContainer } from "react-router-bootstrap";
import { logout } from "../redux/user/userActions";
import { getNotificationsNotSeenCount } from "../redux/notification/notificationActions";

const Header = () => {
  const [callOnce, setCallOnce] = useState(false);
  const dispatch = useDispatch();

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const notificationsNotSeenCount = useSelector(state => state.notificationsNotSeenCount);
  const { count } = notificationsNotSeenCount


  const logoutHandler = e => {
    e.preventDefault();
    dispatch(logout());
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(getNotificationsNotSeenCount());
      setCallOnce(true);
    }
  }, [callOnce, count])


  return (
    <Navbar collapseOnSelect expand='lg' variant='light' bg='light'>
      <Container>
        <Button
          variant='light'
          className='d-md-block d-lg-none'
          size='sm'
          onClick={() => dispatch(showSidebar())}>
          <i className='fa-solid fa-angles-right'></i>
        </Button>
        <Navbar.Toggle aria-controls='e-dami-header' />
        <Navbar.Collapse id='e-dami-header'>
          <Nav className='me-auto'></Nav>
          <Nav className='mr-5'>
            <LinkContainer
              to="/notifications"
            >
              <Nav.Link>
                <i className='fa-solid fa-bell'></i> notifications{" "}
                {count !== 0 && (
                  <span className='badge bg-danger mb-1 p-2'>{count}</span>
                )
                }
              </Nav.Link>
            </LinkContainer>

            <NavDropdown
              title={`${userInfo.prenom} ${userInfo.nom}`}
              id='e-dami-nav-dropdown'>
              <LinkContainer to='/profile'>
                <NavDropdown.Item>
                  <i className='fa-solid fa-user'></i> profile
                </NavDropdown.Item>
              </LinkContainer>
              <NavDropdown.Divider />
              <LinkContainer to='/logout'>
                <NavDropdown.Item
                  className='text-danger'
                  onClick={logoutHandler}>
                  <i className='fa-solid fa-right-from-bracket'></i> se
                  déconnecter
                </NavDropdown.Item>
              </LinkContainer>
            </NavDropdown>
            <Nav.Link></Nav.Link>
            {/* <Nav.Link>
              <i className='fa-solid fa-gear'></i>
            </Nav.Link> */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
