import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css'

import { Navbar, Nav, Form, Button } from 'react-bootstrap';
import { LoginButton, LogoutButton } from './Auth';


function CustomNavbar(props) {
  return (
    <Navbar variant="dark" className="main-color mb-4 px-2 justify-content-between">

      <Navbar.Brand className="mx-3 d-flex align-items-center">
        <i className="bi bi-gem me-2" style={{ fontSize: '1.8rem', color: 'gold' }} />
        <span style={{ fontSize: '1.4rem' }}>Royal Forum</span>
      </Navbar.Brand>

      {/* Home Button */}
      <Button variant="link" className="d-flex home-button" onClick={() => props.handleReturnHome()}>
        <i className="bi bi-house-door me-1" />Home
      </Button>

      <Nav className="d-flex align-items-center">
        {/* Logged in info */}
        <Navbar.Text className="me-3 d-flex align-items-center">
          {props.user && props.user.name ? (
            <span style={{ fontSize: '1.2rem' , color: '#f8f9fa'}}>
              <i className="bi bi-person-circle me-2" style={{ fontSize: '1.4rem' }} />{props.user.name}
            </span>
          ) : (
            <></>
          )}
        </Navbar.Text>

        {/* Login/Logout Button */}
        <Form className="mx-2 mt-1">
          {props.user ? <LogoutButton logout={props.logout} /> : <LoginButton />}
        </Form>
      </Nav>

    </Navbar>
  );
}

export { CustomNavbar };