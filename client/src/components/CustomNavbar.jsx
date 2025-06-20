import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css'

import { Navbar, Nav, Button } from 'react-bootstrap';
import { LoginButton, LogoutButton, LoginAsAdminButton } from './Auth';


function CustomNavbar(props) {
  return (
    <Navbar variant="dark" className="main-color sticky-navbar mb-4 px-2">

      <div style={{ minWidth: '250px' }}>
        <Navbar.Brand className="mx-3 d-flex align-items-center">
          <i className="bi bi-gem me-2" style={{ fontSize: '1.8rem', color: 'gold' }} />
          <span style={{ fontSize: '1.4rem' }}>Royal Forum</span>
        </Navbar.Brand>
      </div>

      {/* Home Button */}
      <div className="flex-grow-1 d-flex justify-content-center">
        <Button variant="link" className="d-flex home-button" onClick={() => props.handleReturnHome()}>
          <i className="bi bi-house-door me-1" />Home
        </Button>
      </div>

      <div style={{ minWidth: '250px' }} className="d-flex justify-content-end">
        <Nav className="d-flex align-items-center">
          {/* Logged in info */}
          <Navbar.Text className="me-3 d-flex align-items-center">
            {props.user && (
              <>
                <i className="bi bi-person-circle me-2" style={{ fontSize: '1.4rem', color: '#f8f9fa' }} />
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
      </div>

    </Navbar>
  );
}

export { CustomNavbar };