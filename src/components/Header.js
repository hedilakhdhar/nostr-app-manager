import { useState, useEffect } from 'react';

import Logo from '../icons/Logo';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link, useNavigate } from 'react-router-dom';

import * as cmn from '../common';
import { useAuth } from '../context/ShowModalContext';

const Header = () => {
  const navigate = useNavigate();

  const [pubkey, setPubkey] = useState('');
  const [profile, setProfile] = useState(null);
  const { showLogin, setShowLogin } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    // on mount, add handler that will be executed
    // when extension is ready (or maybe immediately),
    // and makes sure there are no parallel calls to nostr
    cmn.addOnNostr(async () => {
      if (!cmn.isAuthed()) {
        setPubkey('');
        setProfile(null);
        return;
      }

      const pubkey = await cmn.getLoginPubkey();
      setPubkey(pubkey);

      if (!pubkey) {
        setProfile(null);
        return;
      }

      // async to let other components proceed
      cmn.fetchProfile(pubkey).then((p) => setProfile(p?.profile));
    });
  }, []);

  async function login() {
    setError('');
    if (!window.nostr) {
      setError('Please install extension');
      return;
    }

    const pubkey = await window.nostr.getPublicKey();
    if (pubkey) {
      setPubkey(pubkey);
      setShowLogin(false);
      cmn.setLoginPubkey(pubkey);
      cmn.fetchProfile(pubkey).then((p) => setProfile(p?.profile));
    } else {
      setError('Failed to login');
    }
  }

  // let other components activate the modal
  window.addEventListener('login', () => {
    setShowLogin(true);
  });

  async function logout() {
    cmn.setLoginPubkey('');
    setPubkey('');
    setProfile(null);
  }

  const appsUrl = cmn.formatProfileUrl(cmn.formatNpub(pubkey));
  const createUrl = cmn.formatAppEditUrl('');
  const createUrlForAddRepo = cmn.formatRepositoryEditUrl('');

  const goHome = () => {
    // Link click changes the location.hash but doesn't cause the
    // EventApps to rerender, this way we manually force it,
    // _after_ Link has changed the url
    setTimeout(() => {
      window.dispatchEvent(new Event('goHome'));
    }, 0);
  };

  return (
    <header>
      <Row>
        <Col className="d-flex align-items-center">
          <h4>
            <Link to="/" onClick={goHome}>
              <Logo /> App Manager
            </Link>
          </h4>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          {!pubkey && (
            <Button
              variant="outline-secondary"
              onClick={(e) => setShowLogin(true)}
            >
              Login
            </Button>
          )}
          {pubkey && (
            <div>
              <Dropdown drop="down-left">
                <Dropdown.Toggle variant="outline-secondary">
                  Menu
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.ItemText>
                    {profile
                      ? profile.name ||
                        profile.display_name ||
                        cmn.formatNpubShort(pubkey)
                      : cmn.formatNpubShort(pubkey)}
                  </Dropdown.ItemText>
                  <Dropdown.Divider></Dropdown.Divider>
                  <Dropdown.Item
                    href={appsUrl}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(appsUrl);
                    }}
                  >
                    My apps
                  </Dropdown.Item>
                  <Dropdown.Item
                    href={createUrl}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(createUrl);
                    }}
                  >
                    Create app
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(createUrlForAddRepo);
                    }}
                  >
                    Create repository
                  </Dropdown.Item>
                  <Dropdown.Divider></Dropdown.Divider>
                  <Dropdown.Item onClick={logout}>Log out</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}
        </Col>
      </Row>

      <Modal show={showLogin} onHide={(e) => setShowLogin(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button variant="outline-primary" onClick={login}>
            Login with extension
          </Button>
          <div className="mt-3">
            Please login using Nostr browser extension. You can try{' '}
            <a href="https://getalby.com/" target="_blank" rel="noreferrer">
              Alby
            </a>
            ,{' '}
            <a
              href="https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp"
              target="_blank"
              rel="noreferrer"
            >
              nos2x
            </a>{' '}
            or{' '}
            <a
              href="https://testflight.apple.com/join/ouPWAQAV"
              target="_blank"
              rel="noreferrer"
            >
              Nostore
            </a>{' '}
            (for Safari).
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
        </Modal.Body>
      </Modal>
    </header>
  );
};

export default Header;
