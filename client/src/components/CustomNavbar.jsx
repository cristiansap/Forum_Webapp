import 'bootstrap-icons/font/bootstrap-icons.css';
import { Navbar, Nav, Form } from 'react-bootstrap';
import '../App.css'

// TODO: import { LoginButton, LogoutButton } from './Auth';


function CustomNavbar(props) {
  return (
    <Navbar variant="dark" className="main-color mb-4 ">
        <Navbar.Brand className="mx-4 d-flex align-items-center">
          <i className="bi bi-gem mx-2" style={{ fontSize: '1.8rem', color: 'gold' }} />
          <span style={{ fontSize: '1.4rem' }}>Royal Forum</span>
        </Navbar.Brand>
    </Navbar>
  );
}

export { CustomNavbar };