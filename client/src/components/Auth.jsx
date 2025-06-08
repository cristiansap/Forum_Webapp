import { Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router';

import { useState } from 'react';


function LoginForm(props) {

  const [username, setUsername] = useState('u1@p.it');   // set default 'username' and 'password' to help the professor speed up the testing process
  const [password, setPassword] = useState('pwd');

  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();


  const handleSubmit = (event) => {
    event.preventDefault();     // VERY IMPORTANT: preventDefault() avoid the default form submission and reloading of the page
    
    const credentials = { username, password };

    if (!(username.trim())) {
      setErrorMessage('Username cannot be empty');
    } else if (!password) {
      setErrorMessage('Password cannot be empty');
    } else {
      props.login(credentials)
        .then(() => {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });   // scroll the window smoothly to the top of the page
        })
        .catch((err) => { 
          setErrorMessage(err.error); 
        });
    }
  };

  return (
      <Card className="shadow rounded-4 p-4 mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <Card.Body>
              <Card.Title className="text-center fs-3 mb-4">Login</Card.Title>

              <Form onSubmit={handleSubmit}>
                  {errorMessage ? <Alert dismissible onClose={() => setErrorMessage('')} variant="danger">{errorMessage}</Alert> : null}

                  <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" value={username} placeholder="Enter your email"
                          onChange={(event) => setUsername(event.target.value)} />
                  </Form.Group>

                  <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control type="password" value={password} placeholder="Enter your password"
                          onChange={(event) => setPassword(event.target.value)} />
                  </Form.Group>

                  <Button type="submit" variant="primary" className="main-color rounded-pill w-100">
                      <i className="bi bi-box-arrow-in-right me-2" />Login
                  </Button>

              </Form>
              
          </Card.Body>
      </Card>
  )
};

function LoginButton() {

  const navigate = useNavigate();
  
  return (
    <Button variant="outline-light" onClick={() => navigate('/login')}>
        <i className="bi bi-person-circle me-2" />Login
    </Button>
  )
}

function LogoutButton(props) {

  return (
    <Button variant="outline-light" onClick={props.logout}>Logout</Button>
  )
}

export { LoginForm, LogoutButton, LoginButton };