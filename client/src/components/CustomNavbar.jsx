import 'bootstrap-icons/font/bootstrap-icons.css';
import { Navbar, Nav, Form } from 'react-bootstrap';
import '../App.css'

// TODO: import { LoginButton, LogoutButton } from './Auth';


function CustomNavbar(props) {
  return (
    <Navbar variant="dark" className="main-color mb-4 ">
        <Navbar.Brand className="mx-2">
            <i className="bi bi-gem mx-2" style={{ fontSize: '1.5rem', color: 'gold' }} />
            Royal Forum
        </Navbar.Brand>
        {/* TODO: REMOVE OR KEEP THE SEARCH BAR INSIDE THE NAVBAR ?? */}
        <Form className="my-2 mx-auto inline" role="search" aria-label="Quick search">
            <Form.Control type="search" placeholder="Search" aria-label="Search query" />
        </Form>
    </Navbar>
  );
}

export { CustomNavbar };