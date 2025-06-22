import { Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import API from '../API.js';


function TotpForm(props) {

  const [totpCode, setTotpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const doTotpVerify = () => {
    API.totpVerify(totpCode)
      .then(() => {
        setErrorMessage('');
        props.totpSuccessful();
        props.setDirty(true);   // refresh list of posts after successful 2FA
        navigate('/');
      })
      .catch(() => {
        // NB: Generic error message
        setErrorMessage('Wrong code, please try again.');
      })
  }

  const handleSubmit = (event) => {
    event.preventDefault();   // VERY IMPORTANT: preventDefault() avoid the default form submission and reloading of the page
    
    setErrorMessage('');

    // Perform TOTP code validation
    if (totpCode.trim() === '')
      setErrorMessage('The code seems to be empty.');
    else if (totpCode.length !== 6)
      setErrorMessage('The code must be 6-char long.');
    else
      doTotpVerify(totpCode);   // the code can be verified

  };

  return (
    <div className="d-flex justify-content-center mt-4">
      <Card className="shadow border-1 rounded-4 p-3" style={{ maxWidth: '500px', width: '100%' }}>
        <Card.Body>
          <h3 className="mb-4 text-center">Second Factor Authentication (2FA)</h3>
          <h5>Please enter the code that you read on your device to authenticate as administrator!</h5>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mt-4" controlId="totpCode">
              {errorMessage ? <Alert variant="danger" onClose={() => setErrorMessage('')} dismissible>{errorMessage}</Alert> : null}
              <Form.Label>Code</Form.Label>
              <Form.Control type="text" value={totpCode} onChange={event => setTotpCode(event.target.value)} />
            </Form.Group>

            <div className="d-flex mt-2 justify-content-between">
              <Button variant="secondary" type="button" onClick={() => { setErrorMessage(''); navigate('/'); }}>Skip 2FA</Button>
              <Button variant="success" type="submit">Validate</Button>
            </div>

          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}


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
          if (props.user.canDoTotp) {
            navigate('/login');
          } else {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });   // scroll the window smoothly to the top of the page
          }
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

          <div className="d-flex justify-content-between">
            <Button variant="secondary" onClick={() => props.handleReturnHome()}>Cancel</Button>
            <Button type="submit" variant="primary" className="main-color">
              <i className="bi bi-box-arrow-in-right me-2" />Login
            </Button>
          </div>
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

function LoginAsAdminButton(props) {

  const navigate = useNavigate();

  return (
    <Button variant="outline-light" className={props.className} onClick={() => navigate('/login')}>Login as admin</Button>
  )
}


export { TotpForm, LoginForm, LogoutButton, LoginButton, LoginAsAdminButton };