import React, { useEffect, useState } from 'react';
import { createHost, getHosts } from '../../services/hostService';
import { Link } from 'react-router-dom';

const FileUploadPage = () => {
  const [formData, setFormData] = useState({
    customDomain: '',
    password: '',
    description: '',
    comment: '',
    files: [],
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    const getHostsData = async () => {
      try {
        const response = await getHosts();
        console.log('Hosts:', response);
        setHosts(response.data);
      } catch (error) {
        console.log(error?.response?.data?.message);
      }
    };

    getHostsData();
  }, [hosts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    setFormData({ ...formData, files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { customDomain, password, description, comment, files } = formData;

      const formDataApi = new FormData();
      formDataApi.append('customDomain', customDomain);
      formDataApi.append('password', password);
      formDataApi.append('description', description);
      formDataApi.append('comment', comment);

      for (let i = 0; i < files.length; i++) {
        formDataApi.append('files', files[i]);
      }

      const response = await createHost(formDataApi);

      setSuccessMessage('File(s) uploaded successfully!');
      setErrorMessage('');
      console.log('File uploaded successfully:', response.data);
      // Additional actions after successful upload
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          'Error uploading file(s). Please try again.'
      );
      setSuccessMessage('');
      console.error('Error uploading file:', error?.response);
      // Handle error, e.g., show an error message to the user
    }
  };

  return (
    <div>
      <h1>File Upload Page</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Choose File(s):
          <input type='file' multiple onChange={handleFileChange} />
        </label>
        <br />
        <button type='submit'>Upload File(s)</button>
        {successMessage && (
          <div style={{ color: 'green' }}>{successMessage}</div>
        )}
        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      </form>
      <div>
        <h2>Hosts</h2>
        {hosts?.map((host) => (
          <div key={host._id}>
            <a
              href={`http://${host.domain}.${window.location.host}`}
            >{`${host.domain}.${window.location.host}`}</a>
            <br />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploadPage;
