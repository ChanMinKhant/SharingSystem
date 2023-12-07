import React, { useState, useEffect } from 'react';
import { uploadFile, getAllFiles } from '../../services/fileService';

const FileUploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [customLink, setCustomLink] = useState('');
  const [password, setPassword] = useState('');
  const [limit, setLimit] = useState('');
  const [customFileName, setCustomFileName] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleCustomLinkChange = (event) => {
    setCustomLink(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handleCustomFileNameChange = (event) => {
    setCustomFileName(event.target.value);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setUploadMessage('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('customLink', customLink);
    formData.append('password', password);
    formData.append('limit', limit);
    formData.append('customFileName', customFileName);

    try {
      console.log('here1');
      const response = await uploadFile(formData);
      console.log('response.data');
      setUploadMessage('File uploaded successfully.');
      setFiles([...files, response?.data]);
      console.log(files);
      console.log('first');
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error?.response?.data?.message || 'Error uploading file.');
    }
  };

  // useEffect(() => {
  //   const fetchFiles = async () => {
  //     try {
  //       const response = await getAllFiles();
  //       setFiles(...response.data);
  //     } catch (error) {
  //       console.error('Error fetching files:', error?.response?.data?.message);
  //       setError(error?.response?.data?.message || 'Error fetching files.');
  //     }
  //   };

  //   fetchFiles();
  // }, []);

  return (
    <div>
      <h1>File Upload</h1>
      <form onSubmit={handleUpload} encType='multipart/form-data'>
        <input type='file' onChange={handleFileChange} />
        <input
          type='text'
          placeholder='Custom Link'
          value={customLink}
          onChange={handleCustomLinkChange}
        />
        <input
          type='text'
          placeholder='Password'
          value={password}
          onChange={handlePasswordChange}
        />
        <input
          type='text'
          placeholder='Limit'
          value={limit}
          onChange={handleLimitChange}
        />
        <input
          type='text'
          placeholder='Custom File Name'
          value={customFileName}
          onChange={handleCustomFileNameChange}
        />
        <button type='submit'>Upload File</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {uploadMessage && <p style={{ color: 'green' }}>{uploadMessage}</p>}
      </form>
      <h2>Uploaded Files</h2>

      {files?.map((file) => (
        <ul>
          <li key={file._id}>{file.originalFilename}</li>
          <li>{file.shortId}</li>
        </ul>
      ))}
    </div>
  );
};

export default FileUploadPage;
