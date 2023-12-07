import React, { useState, useEffect } from 'react';
import { createShortenUrl, getAllUrls } from '../../services/urlService'; // Import your apiService functions
import CopyButton from '../../components/CopyButton';

const ShortenUrlApp = () => {
  const [url, setUrl] = useState('');
  const [customLink, setCustomLink] = useState('');
  const [password, setPassword] = useState('');
  const [limit, setLimit] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [urls, setUrls] = useState([]);
  const [isActive, setisActive] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        url,
        customLink: customLink || undefined,
        password: password || undefined,
        limit: limit || undefined,
        isActive,
      };
      console.log(data);
      const response = await createShortenUrl(data);
      setShortenedUrl(response.data.shortUrl);

      setSuccessMessage('URL successfully shortened!');
      setErrorMessage('');
    } catch (error) {
      console.error(
        'Error creating shortened URL:',
        error?.response?.data?.message
      );
      setErrorMessage(
        error?.response?.data?.message ||
          'Failed to shorten URL. Please try again.'
      );
      setSuccessMessage('');
    }
  };

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await getAllUrls();
        setUrls(response.data);
      } catch (error) {
        console.error('Error fetching shortened URLs:', error.message);
        setErrorMessage('Failed to fetch shortened URLs. Please try again.');
      }
    };

    fetchUrls();
  }, [shortenedUrl]);

  const handleIsActiveChange = () => {
    setisActive(!isActive);
  };
  console.log(isActive);
  return (
    <div>
      <h1>Shorten URL App</h1>

      {/* Display success message */}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      {/* Display error message */}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {/* Form for creating shortened URLs */}
      <form onSubmit={handleSubmit}>
        <label>
          URL:
          <input
            type='text'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
        <br />
        <label>
          Custom Link:
          <input
            type='text'
            value={customLink}
            onChange={(e) => setCustomLink(e.target.value)}
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <br />
        <label>
          Limit:
          <input
            type='number'
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </label>
        <br />
        <label>
          isActive:
          <input
            type='checkbox'
            checked={isActive}
            onChange={handleIsActiveChange}
          />
        </label>
        <button type='submit'>Shorten URL</button>
      </form>

      {/* Display shortened URL */}
      {shortenedUrl && (
        <div>
          <p>Shortened URL:</p>
          <a href={shortenedUrl} target='_blank' rel='noopener noreferrer'>
            {`${window.location.origin}/url/${shortenedUrl}`}
          </a>
        </div>
      )}

      {/* Display list of shortened URLs */}
      <div>
        <h2>Your Shortened URLs</h2>
        <table>
          <thead>
            <tr>
              <th>url</th>
              <th>clickCount</th>
              <th>isActive</th>
              <th>limit</th>
              <th>url</th>
              <th>Copy</th>
            </tr>
          </thead>
          <tbody>
            {urls.map((url) => (
              <CopyButton key={url._id} {...url} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShortenUrlApp;
