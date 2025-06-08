import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css'

import { Navbar, Nav, Form, Button } from 'react-bootstrap';
import { LoginButton, LogoutButton, LoginAsAdminButton } from './Auth';
import { useNavigate } from 'react-router-dom';



function CustomNavbar(props) {

  const navigate = useNavigate();  // to be able to call useNavigate, the component must already be in <BrowserRouter> (done in main.jsx)

  return (
    <Navbar variant="dark" className="main-color mb-4 px-2 justify-content-between">

      <Navbar.Brand className="mx-3 d-flex align-items-center">
        <i className="bi bi-gem me-2" style={{ fontSize: '1.8rem', color: 'gold' }} />
        <span style={{ fontSize: '1.4rem' }}>Royal Forum</span>
      </Navbar.Brand>

      {/* Home Button */}
      <div className="flex-grow-1 d-flex justify-content-center">
        <Button variant="link" className="d-flex home-button" onClick={() => props.handleReturnHome()}>
          <i className="bi bi-house-door me-1" />Home
        </Button>
      </div>

      <Nav className="d-flex align-items-center">
        {/* Logged in info */}
        <Navbar.Text className="me-3 d-flex align-items-center">
          {props.user && (
            <>
              <i className="bi bi-person-circle me-2" style={{ fontSize: '1.4rem', color: '#f8f9fa'}} />
              <span style={{ fontSize: '1.3rem', color: '#f8f9fa' }} className="me-2">{props.user.name}</span>
              {props.loggedInAsAdmin ? (
                <span style={{ fontSize: '1.3rem', color: '#f8f9fa' }}>(admin)</span>
              ) : (
                props.user.canDoTotp && <LoginAsAdminButton className="ms-3" />
              )}
            </>
          )}
        </Navbar.Text>

        {/* Login/Logout Button */}
        <div className="mx-2 d-flex align-items-center">
          {props.user ? <LogoutButton logout={props.logout} /> : <LoginButton />}
        </div>
      </Nav>

    </Navbar>
  );
}

export { CustomNavbar };