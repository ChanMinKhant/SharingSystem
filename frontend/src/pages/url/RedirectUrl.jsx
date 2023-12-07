import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUrl } from './../../services/urlService'; // Import your apiService function

const RedirectPage = () => {
  const { shortUrl } = useParams();
  const [password, setPassword] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getUrl(shortUrl);
        setRedirectUrl(response.redirectUrl);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message);
        if (error?.response?.data?.message === 'Password required') {
          setIsPasswordRequired(true);
        }
      }
    };
    fetchData();
    if (redirectUrl) window.location.href = redirectUrl;
  }, [redirectUrl]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await getUrl(shortUrl, password);
      setRedirectUrl(response.redirectUrl);
    } catch (error) {
      console.error('Error with password:', error.message);
      setErrorMessage('Incorrect password. Please try again.');
    }
  };

  // useEffect(() => {
  //   // Redirect when redirectUrl is available
  //   //i dont know should redirect to the url or should i show with iframe?
  //   //if i show with i frame. i can't make the shortern url(image) show in the html or css but i can add some ads and something
  //   //i dont know what should i do and i need some information i will choose it when i writing this further.
  //   //i need to read the docs of react-router-dom when the more i know how can i do it, the more i get the useful ideas.

  // }, [redirectUrl]);

  return (
    <div>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {!redirectUrl ? (
        <form onSubmit={handlePasswordSubmit}>
          <label>
            Password:
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <br />
          <button type='submit'>Submit Password</button>
        </form>
      ) : (
        ''
      )}
    </div>
  );
};

export default RedirectPage;
