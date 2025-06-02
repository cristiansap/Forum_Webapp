import 'bootstrap-icons/font/bootstrap-icons.css';
import { Navbar, Nav, Form } from 'react-bootstrap';
import '../App.css'

// TODO: import { LoginButton, LogoutButton } from './Auth';


function CustomNavbar(props) {
  return (
    <Navbar expand="md" variant="dark" className="navbar navbar-padding">
            <Navbar.Brand className="mx-2" href="index.html">
                <i className="bi bi-gem" style={{ fontSize: '2rem', color: 'gold' }}></i>
                Royal Forum
            </Navbar.Brand>
            <Form className="my-2 mx-auto inline" action="#" role="search" aria-label="Quick search">
                <Form.Control type="search" placeholder="Search" aria-label="Search query" />
            </Form>
            {/* TODO: uncomment this part
            <Nav>
                <Navbar.Text className="mx-2 fs-5">
                    {props.user && props.user.name && (<>Logged in as: <strong>{props.user.name}</strong></>)}
                </Navbar.Text>
                <Form className="mx-2 mt-1">
                    {props.loggedIn ? <LogoutButton logout={props.logout} /> : <LoginButton />}
                </Form>            
            </Nav>*/}
        </Navbar>
  );
}

export { CustomNavbar };