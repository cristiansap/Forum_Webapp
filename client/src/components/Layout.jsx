import { Row, Col, Button, Alert } from 'react-bootstrap';
import { Outlet, Link, useParams, Navigate } from 'react-router-dom';

import { CustomNavbar } from './CustomNavbar';
// TODO: import { LoginForm } from './Auth';
import { useState, useEffect } from 'react';


function NotFoundLayout() {
    return (
      <>
        <h2>This route is not valid!</h2>
        <Link to="/">
          <Button variant="primary">Go back to the main page!</Button>
        </Link>
      </>
    );
}

// TODO: re-watch it
function LoginLayout(props) {
    return (
        <Row>
            <Col>
                <LoginForm login={props.login} />
            </Col>
        </Row>
    );
}